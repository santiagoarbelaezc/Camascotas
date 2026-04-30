<?php

declare(strict_types=1);

use App\controllers\authcontroller;

return function($router) {
    $router->add('POST', '/auth/login',    [authcontroller::class, 'login']);
    $router->add('POST', '/auth/register', [authcontroller::class, 'register']);
    $router->add('POST', '/auth/logout',   [authcontroller::class, 'logout']);
};
