<?php
namespace Controllers;

use Config\Database;
use Utils\ResponseHandler;
use PDO;
use Exception;

class AssistantController {

    // ─── POST /api/chat ───────────────────────────────────────────────────────
    public static function chat(): void {
        $data      = json_decode(file_get_contents('php://input'), true);
        $userMessage = trim($data['message'] ?? '');
        $sessionId   = trim($data['session_id'] ?? '');

        if (!$userMessage) {
            ResponseHandler::sendError(400, 'El mensaje no puede estar vacío');
            return;
        }

        // Generar session_id si no viene
        if (!$sessionId) {
            $sessionId = bin2hex(random_bytes(16));
        }

        $db = (new Database())->getConnection();

        try {
            // 1. Obtener catálogo de productos reales
            $productContext = self::getProductContext($db);

            // 2. Obtener historial de la sesión (últimas 10 conversaciones = 20 mensajes)
            $history = self::getChatHistory($db, $sessionId);

            // 3. Construir prompt con contexto y historial
            $prompt = self::buildPrompt($userMessage, $history, $productContext);

            // 4. Llamar a Gemini
            $botResponse = self::callGemini($prompt);

            // 5. Guardar ambos mensajes
            self::saveMessage($db, $sessionId, $userMessage, 0);
            self::saveMessage($db, $sessionId, $botResponse, 1);

            // 6. Detectar si la IA indica una redirección
            $redirect  = self::detectRedirect($botResponse);
            $cleanReply = preg_replace('/\[REDIRECT:[^\]]+\]/', '', $botResponse);
            $cleanReply = trim($cleanReply);

            ResponseHandler::sendResponse(200, 'Respuesta generada', [
                'response'   => $cleanReply,
                'redirect'   => $redirect,
                'session_id' => $sessionId
            ]);

        } catch (Exception $e) {
            ResponseHandler::sendError(500, 'Error del asistente: ' . $e->getMessage());
        }
    }

    // ─── GET /api/chat/history ────────────────────────────────────────────────
    public static function history(): void {
        $sessionId = $_GET['session_id'] ?? '';

        if (!$sessionId) {
            ResponseHandler::sendError(400, 'session_id es requerido');
            return;
        }

        $db = (new Database())->getConnection();

        $stmt = $db->prepare(
            'SELECT message, is_bot, created_at
             FROM chat_messages
             WHERE session_id = ?
             ORDER BY created_at ASC
             LIMIT 40'
        );
        $stmt->execute([$sessionId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Formatear al estilo que usa el frontend: {text, isBot}
        $history = array_map(fn($r) => [
            'text'       => $r['message'],
            'isBot'      => (bool)$r['is_bot'],
            'created_at' => $r['created_at']
        ], $rows);

        ResponseHandler::sendResponse(200, 'Historial recuperado', ['history' => $history]);
    }

    // ─── DELETE /api/chat/clear ───────────────────────────────────────────────
    public static function clear(): void {
        $data      = json_decode(file_get_contents('php://input'), true);
        $sessionId = trim($data['session_id'] ?? '');

        if (!$sessionId) {
            ResponseHandler::sendError(400, 'session_id es requerido');
            return;
        }

        $db   = (new Database())->getConnection();
        $stmt = $db->prepare('DELETE FROM chat_messages WHERE session_id = ?');
        $stmt->execute([$sessionId]);

        ResponseHandler::sendResponse(200, 'Historial eliminado', ['success' => true]);
    }

    // ─── PRIVATE: Catálogo de productos desde la BD ───────────────────────────
    private static function getProductContext(PDO $db): string {
        $query = "SELECT p.name, p.description, p.category, MIN(v.price) as min_price
                  FROM products p
                  LEFT JOIN product_variants v ON p.id = v.product_id
                  WHERE p.deleted_at IS NULL
                  GROUP BY p.id
                  LIMIT 30";

        $stmt = $db->prepare($query);
        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($products)) {
            return "- Sofá Elegance: diseño tipo sofá para perros y gatos medianos/grandes\n"
                 . "- Premium Steel: cubo ergonómico con estructura de acero, minimalista\n"
                 . "- Feline Moon: cuna lunar para gatos, diseño geométrico moderno\n"
                 . "- Cama Cuadrada XL: almohadón de gran tamaño para razas grandes\n"
                 . "- Puffs: superficies blandas y adaptables\n"
                 . "- Rascadores Multinivel: para gatos activos, ejercicio y descanso\n"
                 . "- Comederos Ergonómicos: altura ideal para mejor digestión\n";
        }

        $context = '';
        foreach ($products as $p) {
            $price    = $p['min_price'] ? ' (Desde $' . number_format($p['min_price'], 0, ',', '.') . ')' : '';
            $category = $p['category'] ? " [{$p['category']}]" : '';
            $desc     = $p['description'] ? substr($p['description'], 0, 120) . '...' : '';
            $context .= "- {$p['name']}{$category}: {$desc}{$price}\n";
        }
        return $context;
    }

    // ─── PRIVATE: Historial de la sesión ─────────────────────────────────────
    private static function getChatHistory(PDO $db, string $sessionId): string {
        $stmt = $db->prepare(
            'SELECT message, is_bot FROM chat_messages
             WHERE session_id = ?
             ORDER BY created_at DESC
             LIMIT 20'
        );
        $stmt->execute([$sessionId]);
        $rows = array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC));

        $text = '';
        foreach ($rows as $r) {
            $sender = $r['is_bot'] ? 'Elisa' : 'Cliente';
            $text  .= "{$sender}: {$r['message']}\n";
        }
        return $text;
    }

    // ─── PRIVATE: Construir prompt para Gemini ────────────────────────────────
    private static function buildPrompt(string $userMessage, string $history, string $products): string {
        return <<<PROMPT
Eres "Elisa", la asistente virtual de Camascotas, una marca colombiana de Mobiliario Pet Premium para perros y gatos con sede en Armenia, Quindío (Fábrica: Espumas y Plásticos SAS, Cra. 19 # 35-25).

## Personalidad
- Cálida, experta y apasionada por el bienestar animal.
- Tono entusiasta pero conciso. Máximo 3-4 oraciones por respuesta.
- Trata a las mascotas con cariño: "tu peludito", "tu compañero", "tu peludo".
- Nunca inventes precios exactos; di que varían según configuración y materiales.

## Catálogo disponible
{$products}

## Redirecciones (úsalas cuando corresponda — incluye el tag al FINAL de tu respuesta)
- Si el usuario quiere VER productos o el catálogo: agrega [REDIRECT:/productos]
- Si pregunta por contacto o cómo llegar: agrega [REDIRECT:/contacto]
- Si quiere saber más de la marca: agrega [REDIRECT:/nosotros]

## Historial reciente de esta conversación
{$history}

Cliente: {$userMessage}
Elisa:
PROMPT;
    }

    // ─── PRIVATE: Llamar a Gemini API ─────────────────────────────────────────
    private static function callGemini(string $prompt): string {
        $apiKey = $_ENV['GEMINI_API_KEY'] ?? getenv('GEMINI_API_KEY');
        $url    = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={$apiKey}";

        $payload = json_encode([
            'contents' => [['parts' => [['text' => $prompt]]]],
            'generationConfig' => [
                'maxOutputTokens' => 512,
                'temperature'     => 0.7,
            ]
        ]);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT        => 30,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err      = curl_error($ch);
        curl_close($ch);

        if ($err) throw new Exception("CURL Error: {$err}");
        if ($httpCode !== 200) throw new Exception("Gemini respondió con código {$httpCode}: {$response}");

        $result = json_decode($response, true);

        if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
            return $result['candidates'][0]['content']['parts'][0]['text'];
        }

        throw new Exception('Respuesta inesperada de Gemini: ' . json_encode($result));
    }

    // ─── PRIVATE: Detectar redirección en texto ───────────────────────────────
    private static function detectRedirect(string $text): ?string {
        preg_match('/\[REDIRECT:(\/[^\]]+)\]/', $text, $matches);
        return $matches[1] ?? null;
    }

    // ─── PRIVATE: Guardar mensaje ─────────────────────────────────────────────
    private static function saveMessage(PDO $db, string $sessionId, string $message, int $isBot): void {
        $stmt = $db->prepare(
            'INSERT INTO chat_messages (session_id, message, is_bot) VALUES (?, ?, ?)'
        );
        $stmt->execute([$sessionId, $message, $isBot]);
    }
}
