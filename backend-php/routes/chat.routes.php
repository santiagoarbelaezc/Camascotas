<?php

declare(strict_types=1);

use App\controllers\ChatController;

return function ($router) {
    $router->add('POST', '/chat', [ChatController::class, 'chat']);
    $router->add('GET', '/chat/history', [ChatController::class, 'obtenerHistorial']);
    $router->add('DELETE', '/chat/clear', [ChatController::class, 'borrarSesion']);
};
