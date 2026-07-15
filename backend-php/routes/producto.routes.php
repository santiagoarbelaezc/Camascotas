<?php

declare(strict_types=1);

use App\controllers\productocontroller;
use App\middleware\authmiddleware;

return function($router) {
    // Rutas públicas
    $router->add('GET', '/producto',                    [productocontroller::class, 'obtenerProductos']);
    $router->add('GET', '/producto/aleatorios',          [productocontroller::class, 'obtenerAleatorios']);
    $router->add('GET', '/producto/buscar',              [productocontroller::class, 'buscarPorNombre']);
    $router->add('GET', '/producto/{id}',               [productocontroller::class, 'obtenerProductoPorId']);
    $router->add('PATCH', '/producto/{id}/vista',       [productocontroller::class, 'incrementarVista']);

    // Rutas protegidas (solo admin / superadmin)
    $router->add('POST',   '/producto',       [productocontroller::class, 'crearProducto'],      [authmiddleware::class, 'verifyAdmin']);
    $router->add('PUT',    '/producto/{id}',  [productocontroller::class, 'actualizarProducto'], [authmiddleware::class, 'verifyAdmin']);
    $router->add('DELETE', '/producto/{id}',  [productocontroller::class, 'eliminarProducto'],   [authmiddleware::class, 'verifyAdmin']);
};
