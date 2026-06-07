<?php

declare(strict_types=1);

namespace App\controllers;

use App\config\database;
use App\utils\response;
use PDO;
use Exception;
use App\utils\logger;

class CamasPersonalizadasController {
    private PDO $db;

    public function __construct() {
        $this->db = database::getConnection();
    }

    public function guardar() {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
            
            if (!$authHeader) {
                return response::error('No autorizado', 401);
            }
            
            // Extract the user ID from token middleware - this will be handled by middleware, 
            // but we need to ensure the user ID is passed. Here we assume the frontend sends user ID 
            // OR we decode the token again to get the user ID securely.
            // Since `authmiddleware::verifyToken()` returns the decoded token, we can call it.
            $tokenData = \App\middleware\authmiddleware::verifyToken();
            $usuario_id = $tokenData['id'] ?? null;

            if (!$usuario_id) {
                return response::error('Usuario no válido', 401);
            }

            $stmt = $this->db->prepare("
                INSERT INTO camas_personalizadas (
                    usuario_id, bed_type, base_color_name, base_color_value, 
                    cushion_color_name, cushion_color_value,
                    pillow_color_name, pillow_color_value, show_pillow,
                    font_name, embroidery_color_name, pet_name
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $usuario_id,
                $data['bed_type'] ?? 'Cama Dona',
                $data['base_color_name'] ?? null,
                $data['base_color_value'] ?? null,
                $data['cushion_color_name'] ?? null,
                $data['cushion_color_value'] ?? null,
                $data['pillow_color_name'] ?? null,
                $data['pillow_color_value'] ?? null,
                isset($data['show_pillow']) ? (int)$data['show_pillow'] : 1,
                $data['font_name'] ?? null,
                $data['embroidery_color_name'] ?? null,
                $data['pet_name'] ?? null
            ]);

            return response::success(['message' => 'Diseño guardado exitosamente', 'id' => $this->db->lastInsertId()]);

        } catch (Exception $e) {
            logger::error("Error guardando cama personalizada: " . $e->getMessage());
            return response::error('Error al guardar diseño', 500, $e->getMessage());
        }
    }

    public function listarPorUsuario() {
        try {
            $tokenData = \App\middleware\authmiddleware::verifyToken();
            $usuario_id = $tokenData['id'] ?? null;

            if (!$usuario_id) {
                return response::error('Usuario no válido', 401);
            }

            $stmt = $this->db->prepare("SELECT * FROM camas_personalizadas WHERE usuario_id = ? ORDER BY created_at DESC");
            $stmt->execute([$usuario_id]);
            $camas = $stmt->fetchAll();

            return response::success($camas);
        } catch (Exception $e) {
            logger::error("Error listando camas del usuario: " . $e->getMessage());
            return response::error('Error al obtener camas', 500, $e->getMessage());
        }
    }

    public function listarTodas() {
        try {
            // Este endpoint debe estar protegido por rol admin, lo aseguraremos en las rutas si es posible o aquí.
            $tokenData = \App\middleware\authmiddleware::verifyToken();
            if (!isset($tokenData['rol']) || !in_array($tokenData['rol'], ['admin', 'superadmin'])) {
                return response::error('Acceso denegado', 403);
            }

            $stmt = $this->db->query("
                SELECT c.*, u.nombre AS usuario_nombre, u.correo AS usuario_correo 
                FROM camas_personalizadas c
                JOIN usuarios u ON c.usuario_id = u.id
                ORDER BY c.created_at DESC
            ");
            $camas = $stmt->fetchAll();

            return response::success($camas);
        } catch (Exception $e) {
            logger::error("Error listando todas las camas: " . $e->getMessage());
            return response::error('Error al obtener camas', 500, $e->getMessage());
        }
    }

    public function actualizar($id) {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            $tokenData = \App\middleware\authmiddleware::verifyToken();
            $usuario_id = $tokenData['id'] ?? null;

            if (!$usuario_id) {
                return response::error('Usuario no válido', 401);
            }

            // Verify ownership
            $checkStmt = $this->db->prepare("SELECT usuario_id FROM camas_personalizadas WHERE id = ?");
            $checkStmt->execute([$id]);
            $existing = $checkStmt->fetch();

            if (!$existing) {
                return response::error('Diseño no encontrado', 404);
            }

            if ($existing['usuario_id'] !== $usuario_id) {
                return response::error('No autorizado para modificar este diseño', 403);
            }

            $stmt = $this->db->prepare("
                UPDATE camas_personalizadas SET 
                    bed_type = ?, base_color_name = ?, base_color_value = ?, 
                    cushion_color_name = ?, cushion_color_value = ?,
                    pillow_color_name = ?, pillow_color_value = ?, show_pillow = ?,
                    font_name = ?, embroidery_color_name = ?, pet_name = ?
                WHERE id = ?
            ");

            $stmt->execute([
                $data['bed_type'] ?? 'Cama Dona',
                $data['base_color_name'] ?? null,
                $data['base_color_value'] ?? null,
                $data['cushion_color_name'] ?? null,
                $data['cushion_color_value'] ?? null,
                $data['pillow_color_name'] ?? null,
                $data['pillow_color_value'] ?? null,
                isset($data['show_pillow']) ? (int)$data['show_pillow'] : 1,
                $data['font_name'] ?? null,
                $data['embroidery_color_name'] ?? null,
                $data['pet_name'] ?? null,
                $id
            ]);

            return response::success(['message' => 'Diseño actualizado exitosamente']);

        } catch (Exception $e) {
            logger::error("Error actualizando cama personalizada: " . $e->getMessage());
            return response::error('Error al actualizar diseño', 500, $e->getMessage());
        }
    }
}
