<?php

namespace App\controllers;

use App\config\database;
use App\utils\response;
use App\utils\request;
use PDO;

class visitascontroller {
    
    public function registrar(): void {
        $data = request::json();
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        $pagina = $data['pagina'] ?? 'home';
        $referencia = $data['referencia'] ?? '';

        // Detectar bots básicos
        $es_bot = preg_match('/bot|crawl|slurp|spider|mediapartners/i', $ua) ? 1 : 0;

        try {
            $db = database::getConnection();
            $stmt = $db->prepare("INSERT INTO visitas (ip_address, user_agent, pagina_visitada, referencia, es_bot) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$ip, $ua, $pagina, $referencia, $es_bot]);
            response::success(['mensaje' => 'Visita registrada']);
        } catch (\Exception $e) {
            response::error("Error al registrar visita", 500, $e->getMessage());
        }
    }

    public function getResumen(): void {
        try {
            $db = database::getConnection();
            
            // Total hoy
            $hoy = $db->query("SELECT COUNT(*) FROM visitas WHERE DATE(fecha_visita) = CURDATE() AND es_bot = 0")->fetchColumn();
            
            // Usuarios únicos hoy (por IP)
            $unicos = $db->query("SELECT COUNT(DISTINCT ip_address) FROM visitas WHERE DATE(fecha_visita) = CURDATE() AND es_bot = 0")->fetchColumn();
            
            // Total histórico
            $total = $db->query("SELECT COUNT(*) FROM visitas WHERE es_bot = 0")->fetchColumn();

            // Visitas esta semana
            $semana = $db->query("SELECT COUNT(*) FROM visitas WHERE fecha_visita >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND es_bot = 0")->fetchColumn();

            // Página más visitada
            $paginaTop = $db->query("SELECT pagina_visitada, COUNT(*) as total FROM visitas WHERE es_bot = 0 GROUP BY pagina_visitada ORDER BY total DESC LIMIT 1")->fetch(PDO::FETCH_ASSOC);

            // Tasa de bots
            $totalConBots = $db->query("SELECT COUNT(*) FROM visitas")->fetchColumn();
            $totalBots = $db->query("SELECT COUNT(*) FROM visitas WHERE es_bot = 1")->fetchColumn();
            $tasaBots = $totalConBots > 0 ? round(($totalBots / $totalConBots) * 100, 1) : 0;

            // Total mensajes en chat
            $totalChat = $db->query("SELECT COUNT(*) FROM chat_historial WHERE is_bot = 0")->fetchColumn();

            response::success([
                'hoy'        => (int)$hoy,
                'unicos'     => (int)$unicos,
                'total'      => (int)$total,
                'semana'     => (int)$semana,
                'paginaTop'  => $paginaTop['pagina_visitada'] ?? 'N/A',
                'tasaBots'   => (float)$tasaBots,
                'totalChat'  => (int)$totalChat,
            ]);
        } catch (\Exception $e) {
            response::error("Error al obtener resumen", 500, $e->getMessage());
        }
    }

    public function getGraficaSemanal(): void {
        try {
            $db = database::getConnection();
            $sql = "SELECT DATE(fecha_visita) as fecha, COUNT(*) as cantidad 
                    FROM visitas 
                    WHERE fecha_visita >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
                    AND es_bot = 0
                    GROUP BY DATE(fecha_visita) 
                    ORDER BY fecha ASC";
            $data = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            response::success($data);
        } catch (\Exception $e) {
            response::error("Error al obtener gráfica", 500, $e->getMessage());
        }
    }

    public function getUltimasVisitas(): void {
        try {
            $db = database::getConnection();
            $sql = "SELECT ip_address, user_agent, pagina_visitada, fecha_visita 
                    FROM visitas 
                    WHERE es_bot = 0 
                    ORDER BY fecha_visita DESC 
                    LIMIT 20";
            $data = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            response::success($data);
        } catch (\Exception $e) {
            response::error("Error al obtener logs", 500, $e->getMessage());
        }
    }

    public function getTopProductos(): void {
        try {
            $db = database::getConnection();
            $sql = "SELECT id, nombre, vistas 
                    FROM productos 
                    WHERE vistas > 0
                    ORDER BY vistas DESC 
                    LIMIT 10";
            $data = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            response::success($data);
        } catch (\Exception $e) {
            response::error("Error al obtener top productos", 500, $e->getMessage());
        }
    }

    /** Ranking de páginas más visitadas con porcentaje */
    public function getPaginasRanking(): void {
        try {
            $db = database::getConnection();
            $sql = "SELECT pagina_visitada, COUNT(*) as total 
                    FROM visitas 
                    WHERE es_bot = 0 
                    GROUP BY pagina_visitada 
                    ORDER BY total DESC 
                    LIMIT 10";
            $rows = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);

            $max = count($rows) > 0 ? (int)$rows[0]['total'] : 1;
            foreach ($rows as &$row) {
                $row['total'] = (int)$row['total'];
                $row['porcentaje'] = round(($row['total'] / $max) * 100, 1);
            }

            response::success($rows);
        } catch (\Exception $e) {
            response::error("Error al obtener ranking de páginas", 500, $e->getMessage());
        }
    }

    /** Desglose de dispositivos y navegadores desde el user_agent */
    public function getDispositivos(): void {
        try {
            $db = database::getConnection();
            $rows = $db->query("SELECT user_agent FROM visitas WHERE es_bot = 0")->fetchAll(PDO::FETCH_COLUMN);

            $dispositivos = ['Movil' => 0, 'Desktop' => 0];
            $navegadores  = ['Chrome' => 0, 'Safari' => 0, 'Firefox' => 0, 'Edge' => 0, 'Otro' => 0];

            foreach ($rows as $ua) {
                // Dispositivo
                if (preg_match('/Mobile|Android|iPhone|iPad/i', $ua)) {
                    $dispositivos['Movil']++;
                } else {
                    $dispositivos['Desktop']++;
                }
                // Navegador (order matters: Edge before Chrome, Safari before Chrome on iOS)
                if (preg_match('/Edg\//i', $ua)) {
                    $navegadores['Edge']++;
                } elseif (preg_match('/Firefox\//i', $ua)) {
                    $navegadores['Firefox']++;
                } elseif (preg_match('/Chrome\//i', $ua)) {
                    $navegadores['Chrome']++;
                } elseif (preg_match('/Safari\//i', $ua)) {
                    $navegadores['Safari']++;
                } else {
                    $navegadores['Otro']++;
                }
            }

            response::success([
                'dispositivos' => $dispositivos,
                'navegadores'  => $navegadores,
            ]);
        } catch (\Exception $e) {
            response::error("Error al obtener dispositivos", 500, $e->getMessage());
        }
    }

    /** Actividad del chat Husky por día (últimos 7 días) */
    public function getChatActividad(): void {
        try {
            $db = database::getConnection();

            // Totales generales
            $totalMensajes  = $db->query("SELECT COUNT(*) FROM chat_historial")->fetchColumn();
            $totalUsuario   = $db->query("SELECT COUNT(*) FROM chat_historial WHERE is_bot = 0")->fetchColumn();
            $sesionesUnicas = $db->query("SELECT COUNT(DISTINCT session_id) FROM chat_historial")->fetchColumn();

            // Gráfica por día
            $sql = "SELECT DATE(created_at) as fecha, COUNT(*) as mensajes
                    FROM chat_historial
                    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                    GROUP BY DATE(created_at)
                    ORDER BY fecha ASC";
            $grafica = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);

            response::success([
                'totalMensajes'  => (int)$totalMensajes,
                'totalUsuario'   => (int)$totalUsuario,
                'sesionesUnicas' => (int)$sesionesUnicas,
                'grafica'        => $grafica,
            ]);
        } catch (\Exception $e) {
            response::error("Error al obtener actividad del chat", 500, $e->getMessage());
        }
    }
}
