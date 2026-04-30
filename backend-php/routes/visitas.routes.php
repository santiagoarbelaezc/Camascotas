<?php

use App\Controllers\VisitasController;
use App\Middleware\AuthMiddleware;

return function($router) {
    $controller = new VisitasController();

    // Registro público
    $router->add('POST', '/visitas/registrar', [$controller, 'registrar']);

    // Estadísticas protegidas
    $router->add('GET', '/visitas/resumen', [$controller, 'getResumen'], [AuthMiddleware::class, 'handle']);
    $router->add('GET', '/visitas/grafica', [$controller, 'getGraficaSemanal'], [AuthMiddleware::class, 'handle']);
    $router->add('GET', '/visitas/logs', [$controller, 'getUltimasVisitas'], [AuthMiddleware::class, 'handle']);
    $router->add('GET', '/visitas/productos', [$controller, 'getTopProductos'], [AuthMiddleware::class, 'handle']);
};
