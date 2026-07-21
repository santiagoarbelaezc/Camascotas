<?php

namespace App\controllers;

use App\config\database;
use App\utils\response;
use App\middleware\authmiddleware;
use PDO;

class usuarioscontroller {

    /**
     * GET /usuarios
     * Lista todos los clientes registrados (sin contraseña ni google_id).
     * Requiere autenticación JWT (middleware aplicado en routes).
     */
    public function listar(): void {
        try {
            $db = database::getConnection();

            $sql = "SELECT 
                        id,
                        nombre,
                        apellidos,
                        correo,
                        ciudad,
                        edad,
                        rol,
                        activo,
                        CASE WHEN google_id IS NOT NULL THEN 'google' ELSE 'formulario' END AS auth_method,
                        created_at
                    FROM usuarios
                    WHERE rol = 'cliente'
                    ORDER BY created_at DESC";

            $clientes = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);

            // Normalizar tipos
            foreach ($clientes as &$c) {
                $c['id']   = (int)$c['id'];
                $c['edad'] = $c['edad'] !== null ? (int)$c['edad'] : null;
                $c['activo'] = (bool)$c['activo'];
            }

            response::success($clientes);

        } catch (\Exception $e) {
            response::error("Error al obtener usuarios", 500, $e->getMessage());
        }
    }

    /**
     * GET /usuarios/perfil
     * Obtiene los datos personales del usuario autenticado.
     */
    public function obtenerPerfil(): void {
        try {
            $tokenData = authmiddleware::verifyToken();
            $userId    = (int)($tokenData['id'] ?? 0);

            if ($userId <= 0) {
                response::error("Token inválido o usuario no identificado", 401);
            }

            $db = database::getConnection();
            $stmt = $db->prepare("SELECT id, nombre, apellidos, correo, ciudad, direccion, edad, rol, CASE WHEN google_id IS NOT NULL THEN 'google' ELSE 'formulario' END AS auth_method, created_at FROM usuarios WHERE id = ?");
            $stmt->execute([$userId]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$usuario) {
                response::error("Usuario no encontrado", 404);
            }

            $usuario['id']   = (int)$usuario['id'];
            $usuario['edad'] = $usuario['edad'] !== null ? (int)$usuario['edad'] : null;

            response::success($usuario);

        } catch (\Exception $e) {
            response::error("Error al obtener perfil", 500, $e->getMessage());
        }
    }

    /**
     * PUT /usuarios/perfil
     * Actualiza los datos personales del usuario autenticado.
     */
    public function actualizarPerfil(): void {
        try {
            $tokenData = authmiddleware::verifyToken();
            $userId    = (int)($tokenData['id'] ?? 0);

            if ($userId <= 0) {
                response::error("Token inválido o usuario no identificado", 401);
            }

            $data = \App\utils\request::all();
            $nombre    = trim($data['nombre'] ?? '');
            $apellidos = trim($data['apellidos'] ?? '');
            $ciudad    = trim($data['ciudad'] ?? '');
            $direccion = trim($data['direccion'] ?? '');
            $edad      = !empty($data['edad']) ? (int)$data['edad'] : null;

            if (empty($nombre)) {
                response::error("El nombre es obligatorio", 400);
            }

            $db = database::getConnection();

            // Si envió nueva contraseña (opcional)
            if (!empty($data['password'])) {
                $pwd = $data['password'];
                if (strlen($pwd) < 7 || !preg_match('/[A-Z]/', $pwd) || !preg_match('/[0-9]/', $pwd)) {
                    response::error("La nueva contraseña debe tener al menos 7 caracteres, una letra mayúscula y un número.", 400);
                }
                $hash = password_hash($pwd, PASSWORD_BCRYPT, ['cost' => 12]);
                $stmt = $db->prepare("UPDATE usuarios SET nombre = ?, apellidos = ?, ciudad = ?, direccion = ?, edad = ?, password = ? WHERE id = ?");
                $stmt->execute([$nombre, $apellidos, $ciudad, $direccion, $edad, $hash, $userId]);
            } else {
                $stmt = $db->prepare("UPDATE usuarios SET nombre = ?, apellidos = ?, ciudad = ?, direccion = ?, edad = ? WHERE id = ?");
                $stmt->execute([$nombre, $apellidos, $ciudad, $direccion, $edad, $userId]);
            }

            // Devolver usuario actualizado
            $stmt = $db->prepare("SELECT id, nombre, apellidos, correo, ciudad, direccion, edad, rol, CASE WHEN google_id IS NOT NULL THEN 'google' ELSE 'formulario' END AS auth_method, created_at FROM usuarios WHERE id = ?");
            $stmt->execute([$userId]);
            $usuarioActualizado = $stmt->fetch(PDO::FETCH_ASSOC);
            $usuarioActualizado['id'] = (int)$usuarioActualizado['id'];
            $usuarioActualizado['edad'] = $usuarioActualizado['edad'] !== null ? (int)$usuarioActualizado['edad'] : null;

            response::success([
                'mensaje' => 'Perfil actualizado correctamente',
                'usuario' => $usuarioActualizado
            ]);

        } catch (\Exception $e) {
            response::error("Error al actualizar perfil", 500, $e->getMessage());
        }
    }

    /**
     * DELETE /usuarios/:id
     * Elimina físicamente a un usuario.
     */
    public function eliminar($id): void {
        try {
            $db = database::getConnection();
            $stmt = $db->prepare("DELETE FROM usuarios WHERE id = ?");
            $stmt->execute([$id]);

            if ($stmt->rowCount() === 0) {
                response::error("Usuario no encontrado", 404);
            }

            response::success(['mensaje' => 'Usuario eliminado correctamente.']);
        } catch (\Exception $e) {
            response::error("Error al eliminar usuario", 500, $e->getMessage());
        }
    }

    /**
     * PATCH /usuarios/:id/estado
     * Alterna el estado activo/inactivo del usuario.
     */
    public function cambiarEstado($id): void {
        try {
            $data = \App\utils\request::all();
            if (!isset($data['activo'])) {
                response::error("Se requiere el nuevo estado 'activo'", 400);
            }

            $activo = $data['activo'] ? 1 : 0;

            $db = database::getConnection();
            $stmt = $db->prepare("UPDATE usuarios SET activo = ? WHERE id = ?");
            $stmt->execute([$activo, $id]);

            if ($stmt->rowCount() === 0) {
                // Verificar si el usuario existe y su estado ya era ese, o si no existe
                $stmtCheck = $db->prepare("SELECT id FROM usuarios WHERE id = ?");
                $stmtCheck->execute([$id]);
                if ($stmtCheck->rowCount() === 0) {
                    response::error("Usuario no encontrado", 404);
                }
            }

            response::success(['mensaje' => 'Estado actualizado correctamente.']);
        } catch (\Exception $e) {
            response::error("Error al cambiar estado de usuario", 500, $e->getMessage());
        }
    }
}
