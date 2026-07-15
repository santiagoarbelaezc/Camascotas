<?php

use App\controllers\usuarioscontroller;
use App\middleware\authmiddleware;

return function($router) {
    $controller = new usuarioscontroller();

    // Listar clientes registrados (protegido — solo admin)
    $router->add('GET', '/usuarios', [$controller, 'listar'], [authmiddleware::class, 'handleAdmin']);

    // Perfil del usuario autenticado
    $router->add('GET', '/usuarios/perfil', [$controller, 'obtenerPerfil'], [authmiddleware::class, 'handle']);
    $router->add('PUT', '/usuarios/perfil', [$controller, 'actualizarPerfil'], [authmiddleware::class, 'handle']);
};
