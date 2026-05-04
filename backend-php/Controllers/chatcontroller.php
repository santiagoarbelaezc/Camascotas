<?php

declare(strict_types=1);

namespace App\controllers;

use App\config\database;
use App\utils\response;
use App\utils\logger;
use PDO;

class chatcontroller {

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

            // 3. Preparar el Prompt para Husky
            $systemPrompt = "Eres Husky, el asistente virtual de Camascotas 🐾. Alegre, servicial y juguetón.
            Ayuda a los clientes a elegir muebles para sus mascotas del catálogo.
            
            CATÁLOGO DISPONIBLE:
            $prodContext
            
            REGLAS DE RECOMENDACIÓN:
            1. Para recomendar productos específicos usa el formato [PRODUCT:ID] al final. Máximo 3.
            2. Ejemplo: \"¡Este te encantará! 🐾 [PRODUCT:5]\".
            3. Si buscan categorías generales usa [REDIRECT:/productos?nombre=termino].
            4. No inventes productos. Sé breve.";

            // 4. Llamar a Groq
            $apiKey = $_ENV['GROQ_API_KEY'] ?? '';
            $postData = [
                "model" => "llama-3.3-70b-versatile",
                "messages" => [
                    ["role" => "system", "content" => $systemPrompt],
                    ["role" => "user", "content" => $message]
                ],
                "temperature" => 0.7
            ];

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

            if ($httpCode !== 200) {
                throw new \Exception("Error Groq API: $httpCode");
            }

            $jsonResponse = json_decode($result, true);
            $botReply = $jsonResponse['choices'][0]['message']['content'] ?? '🐾 ¡Guau! No pude procesar eso.';

            // 5. Extraer Redirecciones y Productos
            $redirect = null;
            if (preg_match('/\[REDIRECT:(.*?)\]/', $botReply, $matches)) {
                $redirect = $matches[1];
                $botReply = str_replace($matches[0], '', $botReply);
            }

            $recommendedProducts = [];
            if (preg_match_all('/\[PRODUCT:(\d+)\]/', $botReply, $pMatches)) {
                $pIds = $pMatches[1];
                foreach ($pIds as $pId) {
                    $botReply = str_replace("[PRODUCT:$pId]", '', $botReply);
                    
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
}
