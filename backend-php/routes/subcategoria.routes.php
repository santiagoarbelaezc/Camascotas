<?php

declare(strict_types=1);

use App\Controllers\SubcategoriaController;
use App\Middleware\AuthMiddleware;

return function($router) {
    $router->add('GET', '/subcategoria', [SubcategoriaController::class, 'obtenerSubcategorias']);
    $router->add('POST',   '/subcategoria',      [SubcategoriaController::class, 'crearSubcategoria'],      [AuthMiddleware::class, 'verifyToken']);
    $router->add('PUT',    '/subcategoria/{id}', [SubcategoriaController::class, 'actualizarSubcategoria'], [AuthMiddleware::class, 'verifyToken']);
    $router->add('DELETE', '/subcategoria/{id}', [SubcategoriaController::class, 'eliminarSubcategoria'],   [AuthMiddleware::class, 'verifyToken']);
};
