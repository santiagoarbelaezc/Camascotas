<?php

declare(strict_types=1);

namespace App\controllers;

use App\config\database;
use App\utils\response;
use App\utils\logger;
use PDO;

class subcategoriacontroller {

    public static function obtenerSubcategorias(): void {
        try {
            $db   = database::getConnection();
            $stmt = $db->query("
                SELECT s.id, s.nombre, s.categoria_id, c.nombre AS categoria_nombre
                FROM subcategorias s
                JOIN categorias c ON s.categoria_id = c.id
                ORDER BY c.nombre, s.nombre
            ");
            response::success($stmt->fetchAll());
        } catch (\Exception $e) {
            response::error('Error al obtener subcategorías', 500, $e->getMessage());
        }
    }

    public static function crearSubcategoria(): void {
        $data         = \App\utils\request::all();
        $nombre       = trim($data['nombre']       ?? '');
        $categoria_id = (int)($data['categoria_id'] ?? 0);

        if (empty($nombre) || !$categoria_id) {
            response::error('Nombre y categoría son requeridos', 400);
        }

        try {
            $db   = database::getConnection();
            $stmt = $db->prepare('INSERT INTO subcategorias (nombre, categoria_id) VALUES (?, ?)');
            $stmt->execute([$nombre, $categoria_id]);
            logger::info("Subcategoría creada: $nombre en cat $categoria_id");
            response::success(['mensaje' => 'Subcategoría creada', 'id' => $db->lastInsertId()], 201);
        } catch (\Exception $e) {
            response::error('Error al crear la subcategoría', 500, $e->getMessage());
        }
    }

    public static function actualizarSubcategoria(int $id): void {
        $data         = \App\utils\request::all();
        $nombre       = trim($data['nombre']       ?? '');
        $categoria_id = (int)($data['categoria_id'] ?? 0);

        if (empty($nombre) || !$categoria_id) {
            response::error('Nombre y categoría son requeridos', 400);
        }

        try {
            $db   = database::getConnection();
            $stmt = $db->prepare('UPDATE subcategorias SET nombre = ?, categoria_id = ? WHERE id = ?');
            $stmt->execute([$nombre, $categoria_id, $id]);
            logger::info("Subcategoría $id actualizada");
            response::success(['mensaje' => 'Subcategoría actualizada']);
        } catch (\Exception $e) {
            response::error('Error al actualizar', 500, $e->getMessage());
        }
    }

    public static function eliminarSubcategoria(int $id): void {
        try {
            $db = database::getConnection();
            $db->prepare('DELETE FROM subcategorias WHERE id = ?')->execute([$id]);
            logger::info("Subcategoría $id eliminada");
            response::success(['mensaje' => 'Subcategoría eliminada']);
        } catch (\Exception $e) {
            response::error('Error al eliminar', 500, $e->getMessage());
        }
    }
}
