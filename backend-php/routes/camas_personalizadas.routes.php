<?php

use App\controllers\CamasPersonalizadasController;
use App\middleware\authmiddleware;

return function($router) {
    $controller = new CamasPersonalizadasController();

    // Guardar diseño de cama (Protegido)
    $router->add('POST', '/camas-personalizadas', [$controller, 'guardar'], [authmiddleware::class, 'handle']);
    
    // Listar diseños del usuario autenticado
    $router->add('GET', '/camas-personalizadas/mis-camas', [$controller, 'listarPorUsuario'], [authmiddleware::class, 'handle']);
    
    // Listar todos los diseños para el administrador
    $router->add('GET', '/camas-personalizadas/admin', [$controller, 'listarTodas'], [authmiddleware::class, 'handleAdmin']);
    
    // Actualizar un diseño existente
    $router->add('PUT', '/camas-personalizadas/{id}', [$controller, 'actualizar'], [authmiddleware::class, 'handle']);
};
