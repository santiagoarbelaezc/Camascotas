<?php

declare(strict_types=1);

ini_set('display_errors', '1');
error_reporting(E_ALL);

if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => 'Falta vendor/. Ejecuta composer install.']);
    exit;
}

require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;
use App\utils\response;
use App\utils\logger;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

// Error handlers
set_exception_handler(function($e) {
    logger::error("EXCEPCIÓN: " . $e->getMessage());
    response::error("Error interno del servidor", 500, $e->getMessage());
});

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    if (!(error_reporting() & $errno)) return false;
    $msg = "ERROR PHP ($errno): $errstr en $errfile:$errline";
    logger::warning($msg);
    if (in_array($errno, [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR])) {
        response::error("Error fatal en el servidor", 500, $msg);
    }
    return true;
});

// CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

logger::request($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);

/**
 * Router minimalista
 */
class Router {
    private array $routes = [];

    public function add(string $method, string $path, $handler, $middleware = null): void {
        $regexPath = preg_replace('/\{[a-zA-Z0-9_]+\}/', '([a-zA-Z0-9_]+)', $path);
        $this->routes[] = [
            'method'     => strtoupper($method),
            'path'       => "#^" . $regexPath . "$#",
            'handler'    => $handler,
            'middleware' => $middleware
        ];
    }

    public function dispatch(): void {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
        if ($scriptDir !== '/' && $scriptDir !== '') {
            $uri = preg_replace('#^' . preg_quote($scriptDir, '#') . '#', '', $uri);
        }
        if (empty($uri) || $uri === null) $uri = '/';
        if ($uri[0] !== '/') $uri = '/' . $uri;

        $method = $_SERVER['REQUEST_METHOD'];

        foreach ($this->routes as $route) {
            if ($route['method'] === $method && preg_match($route['path'], $uri, $matches)) {
                array_shift($matches);
                logger::info("Route matched: {$route['method']} $uri");
                if ($route['middleware']) {
                    call_user_func($route['middleware']);
                }
                $params = array_map(fn($m) => is_numeric($m) ? (int)$m : $m, $matches);
                call_user_func_array($route['handler'], $params);
                return;
            }
        }

        response::error("Ruta no encontrada: $method $uri", 404);
    }
}

$router = new Router();

(require __DIR__ . '/routes/auth.routes.php')($router);
(require __DIR__ . '/routes/categoria.routes.php')($router);
(require __DIR__ . '/routes/subcategoria.routes.php')($router);
(require __DIR__ . '/routes/producto.routes.php')($router);
(require __DIR__ . '/routes/visitas.routes.php')($router);
(require __DIR__ . '/routes/chat.routes.php')($router);

$router->add('GET', '/health', function() {
    App\utils\response::success(['status' => 'ok', 'app' => 'Camascotas API', 'version' => '2.0']);
});

$router->dispatch();
