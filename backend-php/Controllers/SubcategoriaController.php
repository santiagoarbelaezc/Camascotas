<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Utils\Response;
use App\Utils\Logger;
use PDO;

class SubcategoriaController {

    public static function obtenerSubcategorias(): void {
        try {
            $db   = Database::getConnection();
            $stmt = $db->query("
                SELECT s.id, s.nombre, s.categoria_id, c.nombre AS categoria_nombre
                FROM subcategorias s
                JOIN categorias c ON s.categoria_id = c.id
                ORDER BY c.nombre, s.nombre
            ");
            Response::success($stmt->fetchAll());
        } catch (\Exception $e) {
            Response::error('Error al obtener subcategorías', 500, $e->getMessage());
        }
    }

    public static function crearSubcategoria(): void {
        $data         = \App\Utils\Request::all();
        $nombre       = trim($data['nombre']       ?? '');
        $categoria_id = (int)($data['categoria_id'] ?? 0);

        if (empty($nombre) || !$categoria_id) {
            Response::error('Nombre y categoría son requeridos', 400);
        }

        try {
            $db   = Database::getConnection();
            $stmt = $db->prepare('INSERT INTO subcategorias (nombre, categoria_id) VALUES (?, ?)');
            $stmt->execute([$nombre, $categoria_id]);
            Logger::info("Subcategoría creada: $nombre en cat $categoria_id");
            Response::success(['mensaje' => 'Subcategoría creada', 'id' => $db->lastInsertId()], 201);
        } catch (\Exception $e) {
            Response::error('Error al crear la subcategoría', 500, $e->getMessage());
        }
    }

    public static function actualizarSubcategoria(int $id): void {
        $data         = \App\Utils\Request::all();
        $nombre       = trim($data['nombre']       ?? '');
        $categoria_id = (int)($data['categoria_id'] ?? 0);

        if (empty($nombre) || !$categoria_id) {
            Response::error('Nombre y categoría son requeridos', 400);
        }

        try {
            $db   = Database::getConnection();
            $stmt = $db->prepare('UPDATE subcategorias SET nombre = ?, categoria_id = ? WHERE id = ?');
            $stmt->execute([$nombre, $categoria_id, $id]);
            Logger::info("Subcategoría $id actualizada");
            Response::success(['mensaje' => 'Subcategoría actualizada']);
        } catch (\Exception $e) {
            Response::error('Error al actualizar', 500, $e->getMessage());
        }
    }

    public static function eliminarSubcategoria(int $id): void {
        try {
            $db = Database::getConnection();
            $db->prepare('DELETE FROM subcategorias WHERE id = ?')->execute([$id]);
            Logger::info("Subcategoría $id eliminada");
            Response::success(['mensaje' => 'Subcategoría eliminada']);
        } catch (\Exception $e) {
            Response::error('Error al eliminar', 500, $e->getMessage());
        }
    }
}
