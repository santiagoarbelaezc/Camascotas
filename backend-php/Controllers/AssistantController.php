<?php
namespace Controllers;

use Config\Database;
use Utils\ResponseHandler;
use PDO;
use Exception;

class AssistantController {
    /*
    SQL to create the chat_messages table:
    CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_bot TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    */

    public static function chat() {
        $data = json_decode(file_get_contents("php://input"), true);
        $userMessage = $data['message'] ?? '';
        $sessionId = $data['session_id'] ?? bin2hex(random_bytes(16));

        if (empty($userMessage)) {
            ResponseHandler::sendError(400, "Message is required");
        }

        $db = (new Database())->getConnection();

        try {
            // 1. Fetch Products for Context
            $products = self::getProductContext($db);

            // 2. Fetch Chat History (last 10 messages)
            $history = self::getChatHistory($db, $sessionId);

            // 3. Build Prompt
            $prompt = self::buildPrompt($userMessage, $history, $products);

            // 4. Call Gemini API
            $botResponse = self::callGemini($prompt);

            // 5. Save Messages to Database
            self::saveMessage($db, $sessionId, $userMessage, 0);
            self::saveMessage($db, $sessionId, $botResponse, 1);

            ResponseHandler::sendResponse(200, "Response generated", [
                "response" => $botResponse,
                "session_id" => $sessionId
            ]);

        } catch (Exception $e) {
            ResponseHandler::sendError(500, "Assistant Error: " . $e->getMessage());
        }
    }

    private static function getProductContext($db) {
        $query = "SELECT p.name, p.description, MIN(v.price) as min_price 
                  FROM products p 
                  LEFT JOIN product_variants v ON p.id = v.product_id 
                  WHERE p.deleted_at IS NULL 
                  GROUP BY p.id";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $context = "";
        foreach ($products as $p) {
            $price = $p['min_price'] ? " (Desde $" . number_format($p['min_price'], 0) . ")" : "";
            $context .= "- {$p['name']}: {$p['description']}{$price}\n";
        }
        return $context;
    }

    private static function getChatHistory($db, $sessionId) {
        $query = "SELECT message, is_bot FROM chat_messages 
                  WHERE session_id = ? 
                  ORDER BY created_at DESC LIMIT 10";
        $stmt = $db->prepare($query);
        $stmt->execute([$sessionId]);
        $historyRows = array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC));

        $historyText = "";
        foreach ($historyRows as $row) {
            $sender = $row['is_bot'] ? "Elisa" : "Usuario";
            $historyText .= "{$sender}: {$row['message']}\n";
        }
        return $historyText;
    }

    private static function buildPrompt($userMessage, $history, $products) {
        return "Eres 'Elisa', la asistente virtual humana y cercana de 'Camascotas'. 
Nuestra sede principal y fábrica se encuentra en Armenia, Quindío, Colombia (Ubicación: Espumas y Plásticos SAS, Cra. 19 # 35-25 o vía Google Maps).

Personalidad:
- Eres cálida, amable y muy natural. No pareces un robot.
- Usa un tono entusiasta pero profesional.
- Respuestas CORTAS y directas (máximo 3 frases).
- Si el usuario te saluda, salúdalo con calidez.
- Tu misión es ayudar y recomendar los mejores muebles para perros y gatos.

Contexto de Productos:
{$products}

Instrucciones:
- Si preguntan por ubicación, menciona Armenia, Quindío, en Espumas y Plásticos SAS.
- Sugiere productos de la lista si encajan.
- Mantén la charla fluida y concisa.

Historial Reciente:
{$history}
Usuario: {$userMessage}
Elisa:";
    }

    private static function callGemini($prompt) {
        $apiKey = $_ENV['GEMINI_API_KEY'];
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" . $apiKey;

        $data = [
            "contents" => [
                [
                    "parts" => [
                        ["text" => $prompt]
                    ]
                ]
            ]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        
        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err) {
            throw new Exception("CURL Error: " . $err);
        }

        $result = json_decode($response, true);
        if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
            return $result['candidates'][0]['content']['parts'][0]['text'];
        }

        throw new Exception("Invalid response from Gemini API");
    }

    private static function saveMessage($db, $sessionId, $message, $isBot) {
        $query = "INSERT INTO chat_messages (session_id, message, is_bot) VALUES (?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([$sessionId, $message, $isBot]);
    }
}
