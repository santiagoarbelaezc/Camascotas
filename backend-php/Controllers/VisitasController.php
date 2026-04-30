<?php

namespace App\Controllers;

use App\Config\Database;
use App\Utils\Response;
use App\Utils\Request;
use PDO;

class VisitasController {
    
    public function registrar(): void {
        $data = Request::json();
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        $pagina = $data['pagina'] ?? 'home';
        $referencia = $data['referencia'] ?? '';

        // Detectar bots básicos
        $es_bot = preg_match('/bot|crawl|slurp|spider|mediapartners/i', $ua) ? 1 : 0;

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("INSERT INTO visitas (ip_address, user_agent, pagina_visitada, referencia, es_bot) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$ip, $ua, $pagina, $referencia, $es_bot]);
            Response::success(['mensaje' => 'Visita registrada']);
        } catch (\Exception $e) {
            Response::error("Error al registrar visita", 500, $e->getMessage());
        }
    }

    public function getResumen(): void {
        try {
            $db = Database::getConnection();
            
            // Total hoy
            $hoy = $db->query("SELECT COUNT(*) FROM visitas WHERE DATE(fecha_visita) = CURDATE() AND es_bot = 0")->fetchColumn();
            
            // Usuarios únicos hoy (por IP)
            $unicos = $db->query("SELECT COUNT(DISTINCT ip_address) FROM visitas WHERE DATE(fecha_visita) = CURDATE() AND es_bot = 0")->fetchColumn();
            
            // Total histórico
            $total = $db->query("SELECT COUNT(*) FROM visitas WHERE es_bot = 0")->fetchColumn();

            Response::success([
                'hoy' => (int)$hoy,
                'unicos' => (int)$unicos,
                'total' => (int)$total
            ]);
        } catch (\Exception $e) {
            Response::error("Error al obtener resumen", 500, $e->getMessage());
        }
    }

    public function getGraficaSemanal(): void {
        try {
            $db = Database::getConnection();
            $sql = "SELECT DATE(fecha_visita) as fecha, COUNT(*) as cantidad 
                    FROM visitas 
                    WHERE fecha_visita >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
                    AND es_bot = 0
                    GROUP BY DATE(fecha_visita) 
                    ORDER BY fecha ASC";
            $data = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            Response::success($data);
        } catch (\Exception $e) {
            Response::error("Error al obtener gráfica", 500, $e->getMessage());
        }
    }

    public function getUltimasVisitas(): void {
        try {
            $db = Database::getConnection();
            $sql = "SELECT ip_address, user_agent, pagina_visitada, fecha_visita 
                    FROM visitas 
                    WHERE es_bot = 0 
                    ORDER BY fecha_visita DESC 
                    LIMIT 20";
            $data = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            Response::success($data);
        } catch (\Exception $e) {
            Response::error("Error al obtener logs", 500, $e->getMessage());
        }
    }

    public function getTopProductos(): void {
        try {
            $db = Database::getConnection();
            $sql = "SELECT id, nombre, vistas 
                    FROM productos 
                    WHERE vistas > 0
                    ORDER BY vistas DESC 
                    LIMIT 10";
            $data = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            Response::success($data);
        } catch (\Exception $e) {
            Response::error("Error al obtener top productos", 500, $e->getMessage());
        }
    }
}
