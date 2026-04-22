<?php
require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

// Load environment variables
if (file_exists(__DIR__ . '/.env')) {
    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Simple Router
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uriSegments = explode('/', trim($uri, '/'));

// Expected format: /api/{resource}
if (isset($uriSegments[0]) && $uriSegments[0] === 'api' && isset($uriSegments[1])) {
    $resource = $uriSegments[1];
    $routeFile = __DIR__ . "/routes/{$resource}.php";

    if (file_exists($routeFile)) {
        require_once $routeFile;
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Resource not found"]);
    }
} else {
    http_response_code(404);
    echo json_encode(["message" => "Welcome to Camascotas API. Use /api/{resource} to access endpoints."]);
}
