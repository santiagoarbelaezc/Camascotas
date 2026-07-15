<?php

declare(strict_types=1);

use App\controllers\ConfiguracionController;
use App\middleware\authmiddleware;

return function($router) {
    // Ruta pública: consultar valor de una clave
    $router->add('GET', '/configuracion/{clave}', [ConfiguracionController::class, 'obtener']);

    // Ruta protegida (admin): actualizar valor de una clave
    $router->add('PUT', '/configuracion/{clave}', [ConfiguracionController::class, 'actualizar'], [authmiddleware::class, 'verifyAdmin']);
};
