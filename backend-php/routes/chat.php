<?php
use Controllers\assistantcontroller;

$method = $_SERVER['REQUEST_METHOD'];
// URL: /api/chat        → POST (enviar mensaje)
// URL: /api/chat/history → GET (obtener historial)
// URL: /api/chat/clear  → DELETE (limpiar sesión)

$action = $uriSegments[2] ?? '';

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

switch ($action) {
    case 'history':
        if ($method === 'GET') {
            assistantcontroller::history();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;

    case 'clear':
        if ($method === 'DELETE') {
            assistantcontroller::clear();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;

    default:
        // /api/chat  (POST)
        if ($method === 'POST') {
            assistantcontroller::chat();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
}
