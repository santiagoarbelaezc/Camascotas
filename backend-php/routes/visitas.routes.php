<?php

use App\controllers\visitascontroller;
use App\middleware\authmiddleware;

return function($router) {
    $controller = new visitascontroller();

    // Registro público
    $router->add('POST', '/visitas/registrar', [$controller, 'registrar']);

    // Estadísticas protegidas (solo admin / superadmin)
    $router->add('GET', '/visitas/resumen',   [$controller, 'getResumen'],        [authmiddleware::class, 'handleAdmin']);
    $router->add('GET', '/visitas/grafica',   [$controller, 'getGraficaSemanal'], [authmiddleware::class, 'handleAdmin']);
    $router->add('GET', '/visitas/logs',      [$controller, 'getUltimasVisitas'], [authmiddleware::class, 'handleAdmin']);
    $router->add('GET', '/visitas/productos', [$controller, 'getTopProductos'],   [authmiddleware::class, 'handleAdmin']);

    // Nuevas analíticas (solo admin / superadmin)
    $router->add('GET', '/visitas/paginas',     [$controller, 'getPaginasRanking'], [authmiddleware::class, 'handleAdmin']);
    $router->add('GET', '/visitas/dispositivos',[$controller, 'getDispositivos'],   [authmiddleware::class, 'handleAdmin']);
    $router->add('GET', '/visitas/chat',        [$controller, 'getChatActividad'],  [authmiddleware::class, 'handleAdmin']);
};
