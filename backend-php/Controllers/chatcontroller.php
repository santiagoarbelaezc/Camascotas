<?php

declare(strict_types=1);

namespace App\controllers;

use App\config\database;
use App\utils\response;
use App\utils\logger;
use PDO;

class ChatController {

    private static string $apiUrl = "https://api.groq.com/openai/v1/chat/completions";

    public static function chat(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        $message = trim($data['message'] ?? '');
        $sessionId = $data['session_id'] ?? 'default';

        if (empty($message)) {
            response::error('El mensaje es requerido', 400);
        }

        try {
            $db = database::getConnection();
            
            // 1. Obtener contexto de productos y categorías para la IA
            $stmt = $db->query("SELECT id, nombre, precio, desde, descripcion FROM productos LIMIT 50");
            $productosCtx = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $prodContext = "";
            foreach($productosCtx as $p) {
                $pago = $p['desde'] ? "Desde $" : "$";
                $prodContext .= "- {$p['nombre']} (ID: {$p['id']}, Precio: {$pago}{$p['precio']})\n";
            }

            // 2. Guardar mensaje del usuario
            $stmt = $db->prepare("INSERT INTO chat_historial (session_id, message, is_bot) VALUES (?, ?, 0)");
            $stmt->execute([$sessionId, $message]);

            // --- NUEVO: CAPA DE PALABRAS CLAVE (INSTANTÁNEO) ---
            $msgLower = strtolower($message);
            $instantResponse = null;
            $instantRedirect = null;

            // 1. Verificar Categorías Generales (Intentos claros)
            if (preg_match('/\bperro[s]?\b/', $msgLower)) {
                $instantResponse = "¡Claro! 🐾 Aquí tienes nuestra línea exclusiva para perros. ¿Buscas algo en especial?";
                $instantRedirect = "/productos?categoria=Perros";
            } elseif (preg_match('/\bgato[s]?\b/', $msgLower)) {
                $instantResponse = "¡Miau! 🐾 Mira nuestros rascadores y camas para gatos. ¿Te ayudo con algún modelo?";
                $instantRedirect = "/productos?categoria=Gatos";
            } elseif (preg_match('/\b(whatsapp|contacto|asesor|hablar)\b/', $msgLower)) {
                $instantResponse = "¡Con gusto! ✨ Haz clic aquí para hablar directamente con un asesor por WhatsApp.";
                $instantRedirect = "https://api.whatsapp.com/send?phone=573207793380";
            } elseif (preg_match('/\b(instagram|facebook|redes|sociales)\b/', $msgLower)) {
                $instantResponse = "¡Síguenos en nuestras redes sociales! 📸 Allí compartimos novedades y fotos de nuestros clientes.";
                $instantRedirect = "https://www.instagram.com/camascotas/";
            }

            // 2. Verificar Subcategorías Dinámicas (Coincidencia exacta de palabra)
            if (!$instantResponse) {
                $subStmt = $db->query("SELECT nombre FROM subcategorias");
                $subcategorias = $subStmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($subcategorias as $sub) {
                    $subNombre = strtolower($sub['nombre']);
                    // Usar límites de palabra para evitar coincidencias parciales accidentales
                    if (preg_match('/\b' . preg_quote($subNombre, '/') . '\b/', $msgLower)) {
                        $instantResponse = "¡Excelente elección! 🐾 Aquí puedes ver todos nuestros modelos de {$sub['nombre']}.";
                        $instantRedirect = "/productos?busqueda=" . urlencode($sub['nombre']);
                        break;
                    }
                }
            }

            if ($instantResponse) {
                $stmt = $db->prepare("INSERT INTO chat_historial (session_id, message, is_bot) VALUES (?, ?, 1)");
                $stmt->execute([$sessionId, $instantResponse]);
                response::success([
                    'response' => $instantResponse,
                    'redirect' => $instantRedirect,
                    'products' => [],
                    'session_id' => $sessionId
                ]);
                return;
            }

            // 3. Preparar el Prompt para Husky
            $systemPrompt = "Eres Husky, el asistente virtual de Camascotas 🐾. Alegre, servicial y juguetón.
            Ayuda a los clientes a elegir muebles y dales consejos de cuidado experto.
            
            CATÁLOGO DISPONIBLE:
            $prodContext
            
            CONOCIMIENTO EXPERTO EN LIMPIEZA:
            - Frecuencia: Sacudir cada 2-3 días, lavar cada 1-2 semanas, desinfección profunda mensual.
            - Hacks: Usar Vinagre Blanco y Bicarbonato de Sodio. Lavar a 60°C. Secar al SOL (luz UV).
            - Productos: Detergentes hipoalergénicos (Ariel Sensitive). NO suavizantes fuertes ni lejía.
            
            ENLACES:
            - Instagram: https://www.instagram.com/camascotas/
            - Facebook: https://www.facebook.com/camascotasaxm
            - WhatsApp: https://api.whatsapp.com/send?phone=573207793380
            
            REGLAS CRÍTICAS DE FORMATO:
            1. NO USES ASTERISCOS (*) NI NEGRILLAS (**). NUNCA.
            2. Usa emojis (🐾, ✅, ✨) para hacer listas o resaltar puntos.
            3. Usa los tags [PRODUCT:ID], [REDIRECT:/ruta] o [EXTERNAL:URL] SOLO cuando el usuario pida explícitamente ver productos, ir a una sección o contactar por redes/whatsapp.
            4. Si usas un tag, colócalo al final del mensaje.
            5. Si es un saludo o una charla casual, NO incluyas tags de redirección.";

            // 4. Llamar a Groq con Fallback
            $primaryKey = $_ENV['GROQ_API_KEY'] ?? '';
            $backupKey  = $_ENV['GROQ_API_KEY_BACKUP'] ?? ''; // Ahora se lee desde .env por seguridad
            
            $postData = [
                "model" => "llama-3.3-70b-versatile",
                "messages" => [
                    ["role" => "system", "content" => $systemPrompt],
                    ["role" => "user", "content" => $message]
                ],
                "temperature" => 0.7
            ];

            $botReply = null;
            
            // Intento 1: Primary Key
            $res = self::callGroq($primaryKey, $postData);
            if ($res['success']) {
                $botReply = $res['content'];
            } else {
                // Intento 2: Backup Key si falló la primera
                $resBackup = self::callGroq($backupKey, $postData);
                if ($resBackup['success']) {
                    $botReply = $resBackup['content'];
                } else {
                    throw new \Exception("Ambas APIs de Groq fallaron.");
                }
            }

            // 5. Extraer Redirecciones y Productos
            $redirect = null;
            
            // Buscar el primer redirect o external para la acción
            if (preg_match('/\[(?:REDIRECT|EXTERNAL):(.*?)\]/', $botReply, $matches)) {
                $redirect = $matches[1];
            }

            // Limpiar TODOS los tags del texto visible para el usuario
            $botReply = preg_replace('/\[REDIRECT:(.*?)\]/', '', $botReply);
            $botReply = preg_replace('/\[EXTERNAL:(.*?)\]/', '', $botReply);
            
            $recommendedProducts = [];
            if (preg_match_all('/\[PRODUCT:(\d+)\]/', $botReply, $pMatches)) {
                $pIds = $pMatches[1];
                // Limpiar los tags de productos del texto
                $botReply = preg_replace('/\[PRODUCT:(\d+)\]/', '', $botReply);
                
                foreach ($pIds as $pId) {
                    // Fetch product details for the card
                    $pStmt = $db->prepare("
                        SELECT p.id, p.nombre, p.precio, p.desde, c.nombre as categoria
                        FROM productos p
                        JOIN subcategorias s ON p.subcategoria_id = s.id
                        JOIN categorias c ON s.categoria_id = c.id
                        WHERE p.id = ?
                    ");
                    $pStmt->execute([$pId]);
                    $pData = $pStmt->fetch(PDO::FETCH_ASSOC);
                    
                    if ($pData) {
                        // Fetch first image
                        $iStmt = $db->prepare("SELECT imagen_url FROM producto_imagenes WHERE producto_id = ? LIMIT 1");
                        $iStmt->execute([$pId]);
                        $img = $iStmt->fetch(PDO::FETCH_ASSOC);
                        $pData['imagen'] = $img['imagen_url'] ?? 'assets/images/placeholder.jpg';
                        $pData['slug'] = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $pData['nombre']), '-'));
                        $recommendedProducts[] = $pData;
                    }
                }
            }

            // 6. Guardar y Responder
            $stmt = $db->prepare("INSERT INTO chat_historial (session_id, message, is_bot, metadata) VALUES (?, ?, 1, ?)");
            $stmt->execute([$sessionId, trim($botReply), json_encode($recommendedProducts)]);

            response::success([
                'response' => trim($botReply),
                'redirect' => $redirect,
                'products' => $recommendedProducts,
                'session_id' => $sessionId
            ]);

        } catch (\Exception $e) {
            logger::error("Error en Chat: " . $e->getMessage());
            response::error('Error al procesar el chat', 500, $e->getMessage());
        }
    }

    public static function obtenerHistorial(): void {
        $sessionId = $_GET['session_id'] ?? 'default';
        try {
            $db = database::getConnection();
            $stmt = $db->prepare("SELECT message as text, is_bot, metadata FROM chat_historial WHERE session_id = ? ORDER BY created_at ASC");
            $stmt->execute([$sessionId]);
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($history as &$msg) {
                $msg['isBot'] = (bool)$msg['is_bot'];
                $msg['products'] = $msg['metadata'] ? json_decode($msg['metadata'], true) : [];
                unset($msg['is_bot']);
                unset($msg['metadata']);
            }

            response::success(['history' => $history]);
        } catch (\Exception $e) {
            response::error('Error al obtener historial', 500, $e->getMessage());
        }
    }

    public static function borrarSesion(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        $sessionId = $data['session_id'] ?? 'default';
        try {
            $db = database::getConnection();
            $stmt = $db->prepare("DELETE FROM chat_historial WHERE session_id = ?");
            $stmt->execute([$sessionId]);
            response::success(['mensaje' => 'Sesión borrada']);
        } catch (\Exception $e) {
            response::error('Error al borrar sesión', 500, $e->getMessage());
        }
    }

    private static function callGroq(string $apiKey, array $postData): array {
        $ch = curl_init(self::$apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer $apiKey",
            "Content-Type: application/json"
        ]);

        if ($_SERVER['HTTP_HOST'] === 'localhost:8000' || $_SERVER['HTTP_HOST'] === '127.0.0.1:8000') {
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        }

        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200) {
            $jsonResponse = json_decode($result, true);
            return [
                'success' => true,
                'content' => $jsonResponse['choices'][0]['message']['content'] ?? ''
            ];
        }

        return ['success' => false, 'code' => $httpCode];
    }
}
