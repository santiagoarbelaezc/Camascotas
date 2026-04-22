<?php
use Controllers\AssistantController;

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        AssistantController::chat();
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
