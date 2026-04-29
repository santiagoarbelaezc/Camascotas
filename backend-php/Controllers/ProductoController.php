<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Config\CloudinaryConfig;
use App\Utils\Response;
use App\Utils\Logger;
use App\Middleware\UploadMiddleware;
use PDO;

class ProductoController {

    public static function obtenerProductos(): void {
        try {
            $db   = Database::getConnection();
            $sql  = "
                SELECT p.id, p.nombre, p.descripcion, p.precio, p.desde,
                       p.subcategoria_id,
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
                Response::success([]);
            }

            // Cargar imágenes en batch
            $ids          = array_column($productos, 'id');
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $stmtImg      = $db->prepare("SELECT producto_id, imagen_url, es_principal FROM producto_imagenes WHERE producto_id IN ($placeholders)");
            $stmtImg->execute($ids);
            $imagenes = $stmtImg->fetchAll();

            foreach ($productos as &$prod) {
                $imgs              = array_filter($imagenes, fn($i) => $i['producto_id'] == $prod['id']);
                $prod['imagenes']  = array_values(array_column(array_values($imgs), 'imagen_url'));
                $prod['imagen']    = $prod['imagenes'][0] ?? null;

                // Colores
                $stmtColores = $db->prepare("SELECT color FROM producto_colores WHERE producto_id = ?");
                $stmtColores->execute([$prod['id']]);
                $prod['colores'] = $stmtColores->fetchAll(PDO::FETCH_COLUMN);
            }

            Response::success($productos);
        } catch (\Exception $e) {
            Response::error('No se pudieron obtener los productos', 500, $e->getMessage());
        }
    }

    public static function obtenerProductoPorId(int $id): void {
        try {
            $db   = Database::getConnection();
            $stmt = $db->prepare("
                SELECT p.id, p.nombre, p.descripcion, p.precio, p.desde,
                       p.subcategoria_id,
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
                Response::error('Producto no encontrado', 404);
            }

            // Imágenes
            $stmtImg              = $db->prepare('SELECT imagen_url, public_id, es_principal FROM producto_imagenes WHERE producto_id = ?');
            $stmtImg->execute([$id]);
            $producto['imagenes'] = $stmtImg->fetchAll();

            // Colores
            $stmtColores          = $db->prepare('SELECT color FROM producto_colores WHERE producto_id = ?');
            $stmtColores->execute([$id]);
            $producto['colores']  = $stmtColores->fetchAll(PDO::FETCH_COLUMN);

            Response::success($producto);
        } catch (\Exception $e) {
            Response::error('No se pudo obtener el producto', 500, $e->getMessage());
        }
    }

    public static function buscarPorNombre(): void {
        $nombre = trim($_GET['nombre'] ?? '');
        if (empty($nombre)) {
            Response::error('Proporciona un nombre para buscar', 400);
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

        Logger::info("Creando producto: $nombre");

        if (empty($nombre) || $precio <= 0 || !$subcategoria_id) {
            Response::error('Nombre, precio y subcategoría son requeridos', 400);
        }

        $imagesInfo = UploadMiddleware::handleMultipleUpload('imagenes', 'camascotas_productos');
        if (empty($imagesInfo)) {
            Response::error('Debes subir al menos una imagen', 400);
        }

        $db = Database::getConnection();
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
            Logger::info("Producto creado: ID $productoId");
            Response::success(['mensaje' => 'Producto creado exitosamente', 'id' => $productoId], 201);
        } catch (\Exception $e) {
            if ($db->inTransaction()) $db->rollBack();
            Logger::error("Error creando producto: " . $e->getMessage());
            Response::error('Error al crear el producto', 500, $e->getMessage());
        }
    }

    public static function actualizarProducto(int $id): void {
        $params         = \App\Utils\Request::all();
        $nombre         = trim($params['nombre']         ?? '');
        $descripcion    = trim($params['descripcion']    ?? '');
        $precio         = (float)($params['precio']      ?? 0);
        $desde          = (int)($params['desde']         ?? 0);
        $subcategoria_id = (int)($params['subcategoria_id'] ?? 0);
        $colores        = $params['colores'] ?? [];

        if (empty($nombre) || $precio <= 0 || !$subcategoria_id) {
            Response::error('Datos inválidos', 400);
        }

        $db = Database::getConnection();
        try {
            $check = $db->prepare('SELECT id FROM productos WHERE id = ?');
            $check->execute([$id]);
            if (!$check->fetch()) {
                Response::error('Producto no encontrado', 404);
            }

            $db->beginTransaction();

            $stmt = $db->prepare('UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, desde = ?, subcategoria_id = ? WHERE id = ?');
            $stmt->execute([$nombre, $descripcion, $precio, $desde, $subcategoria_id, $id]);

            // Actualizar imágenes si se envían nuevas
            $imagesInfo = UploadMiddleware::handleMultipleUpload('imagenes', 'camascotas_productos');
            if (!empty($imagesInfo)) {
                // Eliminar viejas en Cloudinary
                $oldImgs = $db->prepare('SELECT public_id FROM producto_imagenes WHERE producto_id = ?');
                $oldImgs->execute([$id]);
                foreach ($oldImgs->fetchAll() as $img) {
                    if ($img['public_id']) CloudinaryConfig::delete($img['public_id']);
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
            Logger::info("Producto $id actualizado");
            Response::success(['mensaje' => 'Producto actualizado exitosamente']);
        } catch (\Exception $e) {
            if ($db->inTransaction()) $db->rollBack();
            Logger::error("Error actualizando producto $id: " . $e->getMessage());
            Response::error('Error al actualizar el producto', 500, $e->getMessage());
        }
    }

    public static function eliminarProducto(int $id): void {
        $db = Database::getConnection();
        try {
            $check = $db->prepare('SELECT id FROM productos WHERE id = ?');
            $check->execute([$id]);
            if (!$check->fetch()) {
                Response::error('Producto no encontrado', 404);
            }

            $db->beginTransaction();

            // Eliminar imágenes de Cloudinary
            $imgs = $db->prepare('SELECT public_id FROM producto_imagenes WHERE producto_id = ?');
            $imgs->execute([$id]);
            foreach ($imgs->fetchAll() as $img) {
                if ($img['public_id']) CloudinaryConfig::delete($img['public_id']);
            }

            $db->prepare('DELETE FROM producto_imagenes WHERE producto_id = ?')->execute([$id]);
            $db->prepare('DELETE FROM producto_colores WHERE producto_id = ?')->execute([$id]);
            $db->prepare('DELETE FROM productos WHERE id = ?')->execute([$id]);

            $db->commit();
            Logger::info("Producto $id eliminado");
            Response::success(['mensaje' => 'Producto eliminado correctamente']);
        } catch (\Exception $e) {
            if ($db->inTransaction()) $db->rollBack();
            Response::error('Error al eliminar el producto', 500, $e->getMessage());
        }
    }

    public static function obtenerAleatorios(): void {
        try {
            $cantidad = (int)($_GET['cantidad'] ?? 8);
            $db       = Database::getConnection();
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

            if (empty($productos)) Response::success([]);

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

            Response::success($productos);
        } catch (\Exception $e) {
            Response::error('Error al obtener productos aleatorios', 500, $e->getMessage());
        }
    }
}
