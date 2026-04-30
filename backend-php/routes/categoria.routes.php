<?php

declare(strict_types=1);

use App\controllers\categoriacontroller;
use App\middleware\authmiddleware;

return function($router) {
    $router->add('GET', '/categoria',                      [categoriacontroller::class, 'obtenerCategorias']);
    $router->add('GET', '/categoria/con-subcategorias',    [categoriacontroller::class, 'obtenerCategoriasConSubcategorias']);
    $router->add('POST',   '/categoria',       [categoriacontroller::class, 'crearCategoria'],      [authmiddleware::class, 'verifyToken']);
    $router->add('PUT',    '/categoria/{id}',  [categoriacontroller::class, 'actualizarCategoria'], [authmiddleware::class, 'verifyToken']);
    $router->add('DELETE', '/categoria/{id}',  [categoriacontroller::class, 'eliminarCategoria'],   [authmiddleware::class, 'verifyToken']);
};
