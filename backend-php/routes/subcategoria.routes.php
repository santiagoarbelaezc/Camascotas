<?php

declare(strict_types=1);

use App\controllers\subcategoriacontroller;
use App\middleware\authmiddleware;

return function($router) {
    $router->add('GET', '/subcategoria', [subcategoriacontroller::class, 'obtenerSubcategorias']);
    $router->add('POST',   '/subcategoria',      [subcategoriacontroller::class, 'crearSubcategoria'],      [authmiddleware::class, 'verifyToken']);
    $router->add('PUT',    '/subcategoria/{id}', [subcategoriacontroller::class, 'actualizarSubcategoria'], [authmiddleware::class, 'verifyToken']);
    $router->add('DELETE', '/subcategoria/{id}', [subcategoriacontroller::class, 'eliminarSubcategoria'],   [authmiddleware::class, 'verifyToken']);
};
