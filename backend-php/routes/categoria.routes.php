<?php

declare(strict_types=1);

use App\Controllers\CategoriaController;
use App\Middleware\AuthMiddleware;

return function($router) {
    $router->add('GET', '/categoria',                      [CategoriaController::class, 'obtenerCategorias']);
    $router->add('GET', '/categoria/con-subcategorias',    [CategoriaController::class, 'obtenerCategoriasConSubcategorias']);
    $router->add('POST',   '/categoria',       [CategoriaController::class, 'crearCategoria'],      [AuthMiddleware::class, 'verifyToken']);
    $router->add('PUT',    '/categoria/{id}',  [CategoriaController::class, 'actualizarCategoria'], [AuthMiddleware::class, 'verifyToken']);
    $router->add('DELETE', '/categoria/{id}',  [CategoriaController::class, 'eliminarCategoria'],   [AuthMiddleware::class, 'verifyToken']);
};
