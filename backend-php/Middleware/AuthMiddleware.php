<?php
namespace Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;
use Utils\ResponseHandler;

class AuthMiddleware {
    public static function verifyToken() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $jwt = $matches[1];
            try {
                $key = $_ENV['JWT_SECRET'];
                $decoded = JWT::decode($jwt, new Key($key, 'HS256'));
                return $decoded;
            } catch (Exception $e) {
                ResponseHandler::sendError(401, "Invalid token: " . $e->getMessage());
            }
        }

        ResponseHandler::sendError(401, "Authorization header not found or invalid.");
    }
}
