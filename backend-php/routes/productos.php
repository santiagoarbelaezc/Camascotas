<?php
use Controllers\productocontroller;
use Middleware\authmiddleware;

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($uriSegments[2])) {
            productocontroller::getById($uriSegments[2]);
        } else {
            productocontroller::getAll();
        }
        break;

    case 'POST':
        // authmiddleware::verifyToken(); // Uncomment to protect this route
        productocontroller::create();
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
