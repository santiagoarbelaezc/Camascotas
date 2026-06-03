<?php

declare(strict_types=1);

use App\controllers\chatcontroller;

return function ($router) {
    $router->add('POST', '/chat', [chatcontroller::class, 'chat']);
    $router->add('GET', '/chat/history', [chatcontroller::class, 'obtenerHistorial']);
    $router->add('DELETE', '/chat/clear', [chatcontroller::class, 'borrarSesion']);
};
