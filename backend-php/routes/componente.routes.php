<?php

declare(strict_types=1);

use App\controllers\componentecontroller;
use App\middleware\authmiddleware;

return function($router) {
    // Rutas públicas
    $router->add('GET', '/componentes', [componentecontroller::class, 'index']);

    // Rutas protegidas (requieren token de administrador)
    $router->add('POST',   '/componentes',          [componentecontroller::class, 'crear'],    [authmiddleware::class, 'verifyAdmin']);
    $router->add('PUT',    '/componentes/reordenar', [componentecontroller::class, 'reordenar'], [authmiddleware::class, 'verifyAdmin']);
    $router->add('PUT',    '/componentes/{id}',     [componentecontroller::class, 'actualizar'], [authmiddleware::class, 'verifyAdmin']);
    $router->add('DELETE', '/componentes/{id}',     [componentecontroller::class, 'eliminar'],   [authmiddleware::class, 'verifyAdmin']);
    $router->add('POST',   '/componentes/upload',   [componentecontroller::class, 'upload'],     [authmiddleware::class, 'verifyAdmin']);
};
