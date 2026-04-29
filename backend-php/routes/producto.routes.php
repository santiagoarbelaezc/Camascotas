<?php

declare(strict_types=1);

use App\Controllers\ProductoController;
use App\Middleware\AuthMiddleware;

return function($router) {
    // Rutas públicas
    $router->add('GET', '/producto',                    [ProductoController::class, 'obtenerProductos']);
    $router->add('GET', '/producto/aleatorios',          [ProductoController::class, 'obtenerAleatorios']);
    $router->add('GET', '/producto/buscar',              [ProductoController::class, 'buscarPorNombre']);
    $router->add('GET', '/producto/{id}',               [ProductoController::class, 'obtenerProductoPorId']);

    // Rutas protegidas (requieren JWT)
    $router->add('POST',   '/producto',       [ProductoController::class, 'crearProducto'],      [AuthMiddleware::class, 'verifyToken']);
    $router->add('PUT',    '/producto/{id}',  [ProductoController::class, 'actualizarProducto'], [AuthMiddleware::class, 'verifyToken']);
    $router->add('DELETE', '/producto/{id}',  [ProductoController::class, 'eliminarProducto'],   [AuthMiddleware::class, 'verifyToken']);
};
