<?php

use App\controllers\visitascontroller;
use App\middleware\authmiddleware;

return function($router) {
    $controller = new visitascontroller();

    // Registro público
    $router->add('POST', '/visitas/registrar', [$controller, 'registrar']);

    // Estadísticas protegidas
    $router->add('GET', '/visitas/resumen', [$controller, 'getResumen'], [authmiddleware::class, 'handle']);
    $router->add('GET', '/visitas/grafica', [$controller, 'getGraficaSemanal'], [authmiddleware::class, 'handle']);
    $router->add('GET', '/visitas/logs', [$controller, 'getUltimasVisitas'], [authmiddleware::class, 'handle']);
    $router->add('GET', '/visitas/productos', [$controller, 'getTopProductos'], [authmiddleware::class, 'handle']);
};
