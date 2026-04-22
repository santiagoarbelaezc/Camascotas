<?php
use Controllers\ProductoController;
use Middleware\AuthMiddleware;

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($uriSegments[2])) {
            ProductoController::getById($uriSegments[2]);
        } else {
            ProductoController::getAll();
        }
        break;

    case 'POST':
        // AuthMiddleware::verifyToken(); // Uncomment to protect this route
        ProductoController::create();
        break;

    case 'PUT':
        // Handle update
        break;

    case 'DELETE':
        // Handle delete
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
