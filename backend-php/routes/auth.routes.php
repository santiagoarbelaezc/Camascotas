<?php

declare(strict_types=1);

use App\Controllers\AuthController;

return function($router) {
    $router->add('POST', '/auth/login',    [AuthController::class, 'login']);
    $router->add('POST', '/auth/register', [AuthController::class, 'register']);
    $router->add('POST', '/auth/logout',   [AuthController::class, 'logout']);
};
