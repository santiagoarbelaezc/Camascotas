<?php

use App\controllers\usuarioscontroller;
use App\middleware\authmiddleware;

return function($router) {
    $controller = new usuarioscontroller();

    // Listar clientes registrados (protegido — solo admin)
    $router->add('GET', '/usuarios', [$controller, 'listar'], [authmiddleware::class, 'handle']);
};
