<?php

declare(strict_types=1);

namespace App\controllers;

use App\config\database;
use App\config\cloudinaryconfig;
use App\utils\response;
use App\utils\logger;
use App\middleware\uploadmiddleware;
use PDO;

class categoriacontroller {

    public static function obtenerCategorias(): void {
        try {
            $db   = database::getConnection();
            $stmt = $db->query('SELECT * FROM categorias ORDER BY nombre ASC');
            response::success($stmt->fetchAll());
        } catch (\Exception $e) {
            response::error('Error al obtener categorías', 500, $e->getMessage());
        }
    }

    public static function obtenerCategoriasConSubcategorias(): void {
        try {
            $db  = database::getConnection();
            $sql = "
                SELECT 
                    c.id   AS categoria_id,
                    c.nombre AS categoria_nombre,
                    c.icono_url,
                    s.id   AS subcategoria_id,
                    s.nombre AS subcategoria_nombre,
                    COUNT(p.id) AS cantidad_productos
                FROM categorias c
                LEFT JOIN subcategorias s ON s.categoria_id = c.id
                LEFT JOIN productos p ON p.subcategoria_id = s.id
                GROUP BY c.id, s.id
                ORDER BY c.nombre, s.nombre
            ";

            $stmt    = $db->query($sql);
            $results = $stmt->fetchAll();

            $categorias = [];
            foreach ($results as $row) {
                $catId = $row['categoria_id'];
                if (!isset($categorias[$catId])) {
                    $categorias[$catId] = [
                        'id'           => $catId,
                        'nombre'       => $row['categoria_nombre'],
                        'icono_url'    => $row['icono_url'],
                        'imagen'       => $row['icono_url'],
                        'subcategorias' => []
                    ];
                }
                if ($row['subcategoria_id']) {
                    $categorias[$catId]['subcategorias'][] = [
                        'id'       => $row['subcategoria_id'],
                        'nombre'   => $row['subcategoria_nombre'],
                        'cantidad' => (int)$row['cantidad_productos']
                    ];
                }
            }

            response::success(array_values($categorias));
        } catch (\Exception $e) {
            response::error('Error al obtener categorías con subcategorías', 500, $e->getMessage());
        }
    }

    public static function crearCategoria(): void {
        $nombre = trim($_POST['nombre'] ?? '');
        if (empty($nombre)) {
            response::error('El nombre es obligatorio', 400);
        }

        $imageInfo = uploadmiddleware::handleSingleUpload('icono', 'camascotas_categorias');
        $icono_url = $imageInfo['secure_url'] ?? null;
        $public_id = $imageInfo['public_id']  ?? null;

        try {
            $db   = database::getConnection();
            $stmt = $db->prepare('INSERT INTO categorias (nombre, icono_url, icono_public_id) VALUES (?, ?, ?)');
            $stmt->execute([$nombre, $icono_url, $public_id]);
            logger::info("Categoría creada: $nombre");
            response::success(['mensaje' => 'Categoría creada exitosamente', 'id' => $db->lastInsertId(), 'icono_url' => $icono_url], 201);
        } catch (\Exception $e) {
            response::error('Error al crear la categoría', 500, $e->getMessage());
        }
    }

    public static function actualizarCategoria(int $id): void {
        $params = \App\utils\request::all();
        $nombre = trim($params['nombre'] ?? '');
        if (empty($nombre)) {
            response::error('El nombre es obligatorio', 400);
        }

        try {
            $db   = database::getConnection();
            
            logger::info("Actualizando categoría $id. Datos recibidos: " . json_encode($params));
            $files = \App\utils\request::files();
            logger::info("Archivos recibidos: " . json_encode(array_keys($files)));

            $curr = $db->prepare('SELECT icono_public_id FROM categorias WHERE id = ?');
            $curr->execute([$id]);
            $row  = $curr->fetch();
            if (!$row) response::error('Categoría no encontrada', 404);

            $imageInfo  = uploadmiddleware::handleSingleUpload('icono', 'camascotas_categorias');
            if ($imageInfo) {
                logger::info("Nueva imagen subida: " . $imageInfo['secure_url']);
            } else {
                logger::info("No se subió nueva imagen o fallo en el proceso.");
            }

            $nuevoIcono = $imageInfo['secure_url'] ?? null;
            $nuevoPubl  = $imageInfo['public_id']  ?? null;

            if ($nuevoIcono && $row['icono_public_id']) {
                cloudinaryconfig::delete($row['icono_public_id']);
            }

            $sql    = 'UPDATE categorias SET nombre = ?';
            $sqlP   = [$nombre];
            if ($nuevoIcono) {
                $sql  .= ', icono_url = ?, icono_public_id = ?';
                array_push($sqlP, $nuevoIcono, $nuevoPubl);
            }
            $sql .= ' WHERE id = ?';
            $sqlP[] = $id;

            $db->prepare($sql)->execute($sqlP);
            logger::info("Categoría $id actualizada");
            response::success(['mensaje' => 'Categoría actualizada correctamente']);
        } catch (\Exception $e) {
            response::error('Error al actualizar la categoría', 500, $e->getMessage());
        }
    }

    public static function eliminarCategoria(int $id): void {
        try {
            $db   = database::getConnection();
            $stmt = $db->prepare('SELECT icono_public_id FROM categorias WHERE id = ?');
            $stmt->execute([$id]);
            $row  = $stmt->fetch();

            if ($row && $row['icono_public_id']) {
                cloudinaryconfig::delete($row['icono_public_id']);
            }

            $db->prepare('DELETE FROM categorias WHERE id = ?')->execute([$id]);
            logger::info("Categoría $id eliminada");
            response::success(['mensaje' => 'Categoría eliminada correctamente']);
        } catch (\Exception $e) {
            response::error('Error al eliminar la categoría', 500, $e->getMessage());
        }
    }
}
