<?php

declare(strict_types=1);

namespace App\controllers;

use App\config\database;
use App\config\cloudinaryconfig;
use App\utils\response;
use App\utils\logger;
use App\middleware\uploadmiddleware;
use PDO;

class productocontroller {

    public static function obtenerProductos(): void {
        try {
            $db   = database::getConnection();
            $sql  = "
                SELECT p.id, p.nombre, p.descripcion, p.precio, p.desde,
                       p.subcategoria_id, p.created_at,
                       s.nombre AS subcategoria,
                       c.id    AS categoria_id,
                       c.nombre AS categoria
                FROM productos p
                JOIN subcategorias s ON p.subcategoria_id = s.id
                JOIN categorias c ON s.categoria_id = c.id
                WHERE 1=1
            ";
            $params = [];

            if (!empty($_GET['subcategoria_id'])) {
                $sql .= ' AND p.subcategoria_id = ?';
                $params[] = $_GET['subcategoria_id'];
            }
            if (!empty($_GET['categoria_id'])) {
                $sql .= ' AND c.id = ?';
                $params[] = $_GET['categoria_id'];
            }
            if (!empty($_GET['nombre'])) {
                $sql .= ' AND p.nombre LIKE ?';
                $params[] = "%" . $_GET['nombre'] . "%";
            }

            $sql .= " ORDER BY p.id DESC";

            $stmt     = $db->prepare($sql);
            $stmt->execute($params);
            $productos = $stmt->fetchAll();

            if (empty($productos)) {
                response::success([]);
            }

            // Cargar imágenes en batch
            $ids          = array_column($productos, 'id');
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            
            $stmtImg      = $db->prepare("SELECT producto_id, imagen_url, es_principal FROM producto_imagenes WHERE producto_id IN ($placeholders)");
            $stmtImg->execute($ids);
            $imagenes = $stmtImg->fetchAll();

            // Cargar colores en batch
            $stmtColores = $db->prepare("SELECT producto_id, color FROM producto_colores WHERE producto_id IN ($placeholders)");
            $stmtColores->execute($ids);
            $coloresTotal = $stmtColores->fetchAll();

            foreach ($productos as &$prod) {
                // Imágenes
                $imgs              = array_filter($imagenes, fn($i) => $i['producto_id'] == $prod['id']);
                $prod['imagenes']  = array_values(array_column(array_values($imgs), 'imagen_url'));
                $prod['imagen']    = $prod['imagenes'][0] ?? null;

                // Colores
                $misColores      = array_filter($coloresTotal, fn($c) => $c['producto_id'] == $prod['id']);
                $prod['colores'] = array_values(array_column(array_values($misColores), 'color'));
            }

            response::success($productos);
        } catch (\Exception $e) {
            response::error('No se pudieron obtener los productos', 500, $e->getMessage());
        }
    }

    public static function obtenerProductoPorId(int $id): void {
        try {
            $db   = database::getConnection();
            $stmt = $db->prepare("
                SELECT p.id, p.nombre, p.descripcion, p.precio, p.desde,
                       p.subcategoria_id, p.created_at,
                       s.nombre AS subcategoria,
                       c.id    AS categoria_id,
                       c.nombre AS categoria
                FROM productos p
                JOIN subcategorias s ON p.subcategoria_id = s.id
                JOIN categorias c ON s.categoria_id = c.id
                WHERE p.id = ?
            ");
            $stmt->execute([$id]);
            $producto = $stmt->fetch();

            if (!$producto) {
                response::error('Producto no encontrado', 404);
            }

            // Imágenes
            $stmtImg              = $db->prepare('SELECT imagen_url, public_id, es_principal FROM producto_imagenes WHERE producto_id = ?');
            $stmtImg->execute([$id]);
            $producto['imagenes'] = $stmtImg->fetchAll();

            // Colores
            $stmtColores          = $db->prepare('SELECT color FROM producto_colores WHERE producto_id = ?');
            $stmtColores->execute([$id]);
            $producto['colores']  = $stmtColores->fetchAll(PDO::FETCH_COLUMN);

            response::success($producto);
        } catch (\Exception $e) {
            response::error('No se pudo obtener el producto', 500, $e->getMessage());
        }
    }

    public static function buscarPorNombre(): void {
        $nombre = trim($_GET['nombre'] ?? '');
        if (empty($nombre)) {
            response::error('Proporciona un nombre para buscar', 400);
        }
        $_GET['nombre'] = $nombre;
        self::obtenerProductos();
    }

    public static function crearProducto(): void {
        $nombre         = trim($_POST['nombre']         ?? '');
        $descripcion    = trim($_POST['descripcion']    ?? '');
        $precio         = (float)($_POST['precio']      ?? 0);
        $desde          = (int)($_POST['desde']         ?? 0);
        $subcategoria_id = (int)($_POST['subcategoria_id'] ?? 0);
        $colores        = $_POST['colores'] ?? [];

        logger::info("Creando producto: $nombre");

        if (empty($nombre) || $precio <= 0 || !$subcategoria_id) {
            response::error('Nombre, precio y subcategoría son requeridos', 400);
        }

        $imagesInfo = uploadmiddleware::handleMultipleUpload('imagenes', 'camascotas_productos');
        if (empty($imagesInfo)) {
            response::error('Debes subir al menos una imagen', 400);
        }

        $db = database::getConnection();
        try {
            $db->beginTransaction();

            $stmt = $db->prepare('INSERT INTO productos (nombre, descripcion, precio, desde, subcategoria_id) VALUES (?, ?, ?, ?, ?)');
            $stmt->execute([$nombre, $descripcion, $precio, $desde, $subcategoria_id]);
            $productoId = $db->lastInsertId();

            // Imágenes
            foreach ($imagesInfo as $i => $img) {
                $esPrincipal = $i === 0 ? 1 : 0;
                $stmt        = $db->prepare('INSERT INTO producto_imagenes (producto_id, imagen_url, public_id, es_principal) VALUES (?, ?, ?, ?)');
                $stmt->execute([$productoId, $img['secure_url'], $img['public_id'], $esPrincipal]);
            }

            // Colores
            if (!empty($colores)) {
                $coloresArray = is_string($colores) ? explode(',', $colores) : $colores;
                foreach ($coloresArray as $color) {
                    $color = trim($color);
                    if ($color) {
                        $stmt = $db->prepare('INSERT INTO producto_colores (producto_id, color) VALUES (?, ?)');
                        $stmt->execute([$productoId, $color]);
                    }
                }
            }

            $db->commit();
            logger::info("Producto creado: ID $productoId");
            response::success(['mensaje' => 'Producto creado exitosamente', 'id' => $productoId], 201);
        } catch (\Exception $e) {
            if ($db->inTransaction()) $db->rollBack();
            logger::error("Error creando producto: " . $e->getMessage());
            response::error('Error al crear el producto', 500, $e->getMessage());
        }
    }

    public static function actualizarProducto(int $id): void {
        $params         = \App\utils\request::all();
        $nombre         = trim($params['nombre']         ?? '');
        $descripcion    = trim($params['descripcion']    ?? '');
        $precio         = (float)($params['precio']      ?? 0);
        $desde          = (int)($params['desde']         ?? 0);
        $subcategoria_id = (int)($params['subcategoria_id'] ?? 0);
        $colores        = $params['colores'] ?? [];

        if (empty($nombre) || $precio <= 0 || !$subcategoria_id) {
            response::error('Datos inválidos', 400);
        }

        $db = database::getConnection();
        try {
            $check = $db->prepare('SELECT id FROM productos WHERE id = ?');
            $check->execute([$id]);
            if (!$check->fetch()) {
                response::error('Producto no encontrado', 404);
            }

            $db->beginTransaction();

            $stmt = $db->prepare('UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, desde = ?, subcategoria_id = ? WHERE id = ?');
            $stmt->execute([$nombre, $descripcion, $precio, $desde, $subcategoria_id, $id]);

            // Actualizar imágenes si se envían nuevas
            $imagesInfo = uploadmiddleware::handleMultipleUpload('imagenes', 'camascotas_productos');
            if (!empty($imagesInfo)) {
                // Eliminar viejas en Cloudinary
                $oldImgs = $db->prepare('SELECT public_id FROM producto_imagenes WHERE producto_id = ?');
                $oldImgs->execute([$id]);
                foreach ($oldImgs->fetchAll() as $img) {
                    if ($img['public_id']) cloudinaryconfig::delete($img['public_id']);
                }

                $db->prepare('DELETE FROM producto_imagenes WHERE producto_id = ?')->execute([$id]);

                foreach ($imagesInfo as $i => $img) {
                    $esPrincipal = $i === 0 ? 1 : 0;
                    $stmt        = $db->prepare('INSERT INTO producto_imagenes (producto_id, imagen_url, public_id, es_principal) VALUES (?, ?, ?, ?)');
                    $stmt->execute([$id, $img['secure_url'], $img['public_id'], $esPrincipal]);
                }
            }

            // Actualizar colores
            if (!empty($colores)) {
                $db->prepare('DELETE FROM producto_colores WHERE producto_id = ?')->execute([$id]);
                $coloresArray = is_string($colores) ? explode(',', $colores) : $colores;
                foreach ($coloresArray as $color) {
                    $color = trim($color);
                    if ($color) {
                        $stmt = $db->prepare('INSERT INTO producto_colores (producto_id, color) VALUES (?, ?)');
                        $stmt->execute([$id, $color]);
                    }
                }
            }

            $db->commit();
            logger::info("Producto $id actualizado");
            response::success(['mensaje' => 'Producto actualizado exitosamente']);
        } catch (\Exception $e) {
            if ($db->inTransaction()) $db->rollBack();
            logger::error("Error actualizando producto $id: " . $e->getMessage());
            response::error('Error al actualizar el producto', 500, $e->getMessage());
        }
    }

    public static function eliminarProducto(int $id): void {
        $db = database::getConnection();
        try {
            $check = $db->prepare('SELECT id FROM productos WHERE id = ?');
            $check->execute([$id]);
            if (!$check->fetch()) {
                response::error('Producto no encontrado', 404);
            }

            $db->beginTransaction();

            // Eliminar imágenes de Cloudinary
            $imgs = $db->prepare('SELECT public_id FROM producto_imagenes WHERE producto_id = ?');
            $imgs->execute([$id]);
            foreach ($imgs->fetchAll() as $img) {
                if ($img['public_id']) cloudinaryconfig::delete($img['public_id']);
            }

            $db->prepare('DELETE FROM producto_imagenes WHERE producto_id = ?')->execute([$id]);
            $db->prepare('DELETE FROM producto_colores WHERE producto_id = ?')->execute([$id]);
            $db->prepare('DELETE FROM productos WHERE id = ?')->execute([$id]);

            $db->commit();
            logger::info("Producto $id eliminado");
            response::success(['mensaje' => 'Producto eliminado correctamente']);
        } catch (\Exception $e) {
            if ($db->inTransaction()) $db->rollBack();
            response::error('Error al eliminar el producto', 500, $e->getMessage());
        }
    }

    public static function obtenerAleatorios(): void {
        try {
            $cantidad = (int)($_GET['cantidad'] ?? 8);
            $db       = database::getConnection();
            $stmt     = $db->prepare("
                SELECT p.id, p.nombre, p.descripcion, p.precio, p.desde,
                       s.nombre AS subcategoria,
                       c.nombre AS categoria
                FROM productos p
                JOIN subcategorias s ON p.subcategoria_id = s.id
                JOIN categorias c ON s.categoria_id = c.id
                ORDER BY RAND()
                LIMIT ?
            ");
            $stmt->bindValue(1, $cantidad, PDO::PARAM_INT);
            $stmt->execute();
            $productos = $stmt->fetchAll();

            if (empty($productos)) response::success([]);

            $ids          = array_column($productos, 'id');
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $stmtImg      = $db->prepare("SELECT producto_id, imagen_url FROM producto_imagenes WHERE producto_id IN ($placeholders)");
            $stmtImg->execute($ids);
            $imagenes = $stmtImg->fetchAll();

            foreach ($productos as &$prod) {
                $imgs             = array_filter($imagenes, fn($i) => $i['producto_id'] == $prod['id']);
                $prod['imagenes'] = array_values(array_column(array_values($imgs), 'imagen_url'));
                $prod['imagen']   = $prod['imagenes'][0] ?? null;
            }

            response::success($productos);
        } catch (\Exception $e) {
            response::error('Error al obtener productos aleatorios', 500, $e->getMessage());
        }
    }

    public static function incrementarVista(int $id): void {
        try {
            $db = database::getConnection();
            $stmt = $db->prepare("UPDATE productos SET vistas = vistas + 1 WHERE id = ?");
            $stmt->execute([$id]);
            response::success(['mensaje' => 'Vista incrementada']);
        } catch (\Exception $e) {
            response::error('Error al incrementar vista', 500, $e->getMessage());
        }
    }
}
