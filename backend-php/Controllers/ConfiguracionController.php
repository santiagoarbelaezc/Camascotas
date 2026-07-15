<?php

declare(strict_types=1);

namespace App\controllers;

use App\config\database;
use App\utils\response;
use App\utils\logger;

class ConfiguracionController {

    /**
     * GET /configuracion/{clave}
     * Ruta pública: devuelve el valor de una clave de configuración.
     */
    public static function obtener(string $clave): void {
        try {
            $clave = trim($clave);
            if (empty($clave)) {
                response::error('Clave de configuración requerida', 400);
                return;
            }

            $db   = database::getConnection();
            $stmt = $db->prepare('SELECT clave, valor FROM configuracion_sitio WHERE clave = ?');
            $stmt->execute([$clave]);
            $row  = $stmt->fetch();

            if (!$row) {
                response::error('Configuración no encontrada', 404);
                return;
            }

            response::success($row);
        } catch (\Exception $e) {
            logger::error('Error al obtener configuración: ' . $e->getMessage());
            response::error('Error al obtener configuración', 500, $e->getMessage());
        }
    }

    /**
     * PUT /configuracion/{clave}
     * Ruta protegida (JWT): actualiza el valor de una clave de configuración.
     * Body JSON: { "valor": "0" | "1" }
     */
    public static function actualizar(string $clave): void {
        try {
            $clave = trim($clave);
            if (empty($clave)) {
                response::error('Clave de configuración requerida', 400);
                return;
            }

            $body = json_decode(file_get_contents('php://input'), true) ?? [];
            if (!array_key_exists('valor', $body)) {
                response::error('El campo "valor" es requerido en el body', 400);
                return;
            }

            $valor = (string) $body['valor'];

            $db = database::getConnection();

            // Verificar que la clave existe
            $check = $db->prepare('SELECT clave FROM configuracion_sitio WHERE clave = ?');
            $check->execute([$clave]);
            if (!$check->fetch()) {
                response::error('Clave de configuración no encontrada', 404);
                return;
            }

            $stmt = $db->prepare('UPDATE configuracion_sitio SET valor = ? WHERE clave = ?');
            $stmt->execute([$valor, $clave]);

            logger::info("Configuración '$clave' actualizada a '$valor'");
            response::success(['mensaje' => 'Configuración actualizada', 'clave' => $clave, 'valor' => $valor]);
        } catch (\Exception $e) {
            logger::error('Error al actualizar configuración: ' . $e->getMessage());
            response::error('Error al actualizar configuración', 500, $e->getMessage());
        }
    }
}
