<?php

namespace App\controllers;

use App\config\database;
use App\utils\response;
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
            }

            response::success($clientes);

        } catch (\Exception $e) {
            response::error("Error al obtener usuarios", 500, $e->getMessage());
        }
    }
}
