<?php

declare(strict_types=1);

namespace App\middleware;

use App\utils\response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class authmiddleware {
    public static function verifyToken(): array {
        $headers    = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

        if (!$authHeader) {
            response::error('Token no proporcionado', 401);
        }

        $parts = explode(' ', $authHeader);
        if (count($parts) !== 2 || $parts[0] !== 'Bearer') {
            response::error('Formato de token inválido. Use: Bearer <token>', 400);
        }

        $token = $parts[1];
        $key   = $_ENV['JWT_SECRET'] ?? '';

        try {
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            return (array) $decoded;
        } catch (\Exception $e) {
            response::error('Token inválido o expirado', 403, $e->getMessage());
        }

        return [];
    }

    public static function handle(): void {
        self::verifyToken();
    }
}
