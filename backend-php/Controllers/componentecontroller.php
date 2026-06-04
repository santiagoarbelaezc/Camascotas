<?php

declare(strict_types=1);

namespace App\controllers;

use App\config\database;
use App\utils\response;
use App\utils\logger;
use App\middleware\uploadmiddleware;
use PDO;

class componentecontroller {

    public static function index(): void {
        try {
            $db = database::getConnection();
            $stmt = $db->query("SELECT * FROM componentes_dinamicos ORDER BY orden ASC");
            $componentes = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($componentes as &$comp) {
                $comp['activo'] = (bool)$comp['activo'];
                $comp['contenido'] = $comp['contenido'] ? json_decode($comp['contenido'], true) : null;
                $comp['orden'] = (int)$comp['orden'];
            }

            response::success($componentes);
        } catch (\Exception $e) {
            response::error("Error al obtener componentes", 500, $e->getMessage());
        }
    }

    public static function crear(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            $data = \App\utils\request::all();
        }
        $tipo = trim($data['tipo'] ?? '');
        $activo = isset($data['activo']) ? (int)$data['activo'] : 1;
        $contenido = $data['contenido'] ?? null;

        if (empty($tipo)) {
            response::error("El tipo de componente es requerido", 400);
        }

        try {
            $db = database::getConnection();
            $stmt = $db->query("SELECT IFNULL(MAX(orden), 0) + 1 FROM componentes_dinamicos");
            $siguienteOrden = (int)$stmt->fetchColumn();

            $stmtInsert = $db->prepare("INSERT INTO componentes_dinamicos (tipo, orden, activo, contenido) VALUES (?, ?, ?, ?)");
            $stmtInsert->execute([
                $tipo,
                $siguienteOrden,
                $activo,
                $contenido ? json_encode($contenido, JSON_UNESCAPED_UNICODE) : null
            ]);

            $id = (int)$db->lastInsertId();
            logger::info("Componente dinámico creado: ID $id, tipo $tipo");
            response::success(["mensaje" => "Componente creado exitosamente", "id" => $id], 201);
        } catch (\Exception $e) {
            response::error("Error al crear componente", 500, $e->getMessage());
        }
    }

    public static function actualizar(int $id): void {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            $data = \App\utils\request::all();
        }

        try {
            $db = database::getConnection();
            $stmtCheck = $db->prepare("SELECT id FROM componentes_dinamicos WHERE id = ?");
            $stmtCheck->execute([$id]);
            if (!$stmtCheck->fetch()) {
                response::error("Componente no encontrado", 404);
            }

            // Campos a actualizar
            $updateFields = [];
            $params = [];

            if (isset($data['tipo'])) {
                $updateFields[] = "tipo = ?";
                $params[] = trim($data['tipo']);
            }
            if (isset($data['activo'])) {
                $updateFields[] = "activo = ?";
                $params[] = (int)$data['activo'];
            }
            if (isset($data['contenido'])) {
                $updateFields[] = "contenido = ?";
                $params[] = json_encode($data['contenido'], JSON_UNESCAPED_UNICODE);
            }

            if (empty($updateFields)) {
                response::error("No hay campos para actualizar", 400);
            }

            $params[] = $id;
            $sql = "UPDATE componentes_dinamicos SET " . implode(", ", $updateFields) . " WHERE id = ?";
            $stmtUpdate = $db->prepare($sql);
            $stmtUpdate->execute($params);

            logger::info("Componente dinámico actualizado: ID $id");
            response::success(["mensaje" => "Componente actualizado exitosamente"]);
        } catch (\Exception $e) {
            response::error("Error al actualizar componente", 500, $e->getMessage());
        }
    }

    public static function eliminar(int $id): void {
        try {
            $db = database::getConnection();
            $stmtCheck = $db->prepare("SELECT id FROM componentes_dinamicos WHERE id = ?");
            $stmtCheck->execute([$id]);
            if (!$stmtCheck->fetch()) {
                response::error("Componente no encontrado", 404);
            }

            $stmtDelete = $db->prepare("DELETE FROM componentes_dinamicos WHERE id = ?");
            $stmtDelete->execute([$id]);

            logger::info("Componente dinámico eliminado: ID $id");
            response::success(["mensaje" => "Componente eliminado exitosamente"]);
        } catch (\Exception $e) {
            response::error("Error al eliminar componente", 500, $e->getMessage());
        }
    }

    public static function reordenar(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            $data = \App\utils\request::all();
        }
        $ids = $data['ids'] ?? [];

        if (!is_array($ids) || empty($ids)) {
            response::error("Se requiere un array de IDs ordenados", 400);
        }

        try {
            $db = database::getConnection();
            $db->beginTransaction();

            $stmtUpdate = $db->prepare("UPDATE componentes_dinamicos SET orden = ? WHERE id = ?");
            foreach ($ids as $index => $id) {
                $orden = $index + 1;
                $stmtUpdate->execute([$orden, (int)$id]);
            }

            $db->commit();
            logger::info("Componentes dinámicos reordenados: " . json_encode($ids));
            response::success(["mensaje" => "Componentes reordenados exitosamente"]);
        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            response::error("Error al reordenar componentes", 500, $e->getMessage());
        }
    }

    public static function upload(): void {
        $result = uploadmiddleware::handleSingleUpload('imagen', 'camascotas_personalizacion');
        if ($result && isset($result['secure_url'])) {
            response::success(["url" => $result['secure_url'], "public_id" => $result['public_id']]);
        } else {
            response::error("No se pudo subir la imagen", 400);
        }
    }
}
