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
            $stmt = $db->query("SELECT id, nombre FROM categorias LIMIT 10");
            $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $catList = implode(", ", array_column($categorias, 'nombre'));

            // 2. Guardar mensaje del usuario
            $stmt = $db->prepare("INSERT INTO chat_historial (session_id, message, is_bot) VALUES (?, ?, 0)");
            $stmt->execute([$sessionId, $message]);

            // 3. Preparar el Prompt para Husky
            $systemPrompt = "Eres Husky, el asistente virtual de Camascotas. Tu personalidad es alegre, servicial y un poco juguetona (puedes usar emojis de patitas 🐾). 
            Tu objetivo es ayudar a los clientes a elegir el mejor mueble para sus mascotas. 
            Tenemos categorías como: $catList.
            
            REGLAS CRÍTICAS:
            1. Si el usuario busca algo específico (ej: camas, gimnasios, rascadores), proporciónale un enlace de redirección usando EXACTAMENTE este formato al final de tu mensaje: [REDIRECT:/productos?nombre=TERMINO] o [REDIRECT:/productos?categoria_id=ID].
            2. Si preguntan por camas para perro grande, usa [REDIRECT:/productos?nombre=grande].
            3. No inventes productos que no existan.
            4. Responde de forma concisa.";

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

            // Desactivar verificación SSL solo si estamos en localhost
            if ($_SERVER['HTTP_HOST'] === 'localhost:8000' || $_SERVER['HTTP_HOST'] === '127.0.0.1:8000') {
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            }

            $result = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                throw new \Exception("CURL Error: " . $curlError);
            }

            if ($httpCode !== 200) {
                logger::error("Groq API Error: Status $httpCode, Response: $result");
                throw new \Exception("Error Groq API: Status $httpCode");
            }

            $jsonResponse = json_decode($result, true);
            $botReply = $jsonResponse['choices'][0]['message']['content'] ?? '¡Guau! Algo salió mal, ¿puedes repetirlo? 🐾';

            // 5. Procesar redirección si existe en la respuesta de la IA
            $redirect = null;
            if (preg_match('/\[REDIRECT:(.*?)\]/', $botReply, $matches)) {
                $redirect = $matches[1];
                $botReply = str_replace($matches[0], '', $botReply); // Limpiar el tag del texto visible
            }

            // 6. Guardar respuesta del bot
            $stmt = $db->prepare("INSERT INTO chat_historial (session_id, message, is_bot) VALUES (?, ?, 1)");
            $stmt->execute([$sessionId, $botReply]);

            response::success([
                'response' => trim($botReply),
                'redirect' => $redirect,
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
            $stmt = $db->prepare("SELECT message as text, is_bot FROM chat_historial WHERE session_id = ? ORDER BY created_at ASC");
            $stmt->execute([$sessionId]);
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($history as &$msg) {
                $msg['isBot'] = (bool)$msg['is_bot'];
                unset($msg['is_bot']);
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
