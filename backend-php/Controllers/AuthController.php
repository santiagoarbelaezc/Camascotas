<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Utils\Response;
use App\Utils\Logger;
use Firebase\JWT\JWT;
use PDO;

class AuthController {
    public static function login(): void {
        $data     = \App\Utils\Request::all();
        $correo   = strtolower(trim($data['correo'] ?? ''));
        $password = $data['password'] ?? '';

        if (empty($correo) || empty($password)) {
            Response::error('Correo y contraseña son requeridos', 400);
        }

        $db   = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM usuarios WHERE correo = ?');
        $stmt->execute([$correo]);
        $usuario = $stmt->fetch();

        if (!$usuario) {
            Logger::warning("Login fallido: Usuario no encontrado ($correo)");
            Response::error('Credenciales incorrectas', 401);
        }

        if (!password_verify($password, $usuario['password'])) {
            Logger::warning("Login fallido: Contraseña incorrecta ($correo)");
            Response::error('Credenciales incorrectas', 401);
        }

        $payload = [
            'id'     => $usuario['id'],
            'correo' => $usuario['correo'],
            'rol'    => $usuario['rol'],
            'iat'    => time(),
            'exp'    => time() + (60 * 60 * 8) // 8 horas
        ];

        $jwt = JWT::encode($payload, $_ENV['JWT_SECRET'] ?? 'camascotas-secret', 'HS256');

        Logger::info("Login exitoso: $correo (ID: {$usuario['id']})");

        Response::success([
            'mensaje' => 'Login exitoso',
            'token'   => $jwt,
            'usuario' => [
                'id'     => $usuario['id'],
                'correo' => $usuario['correo'],
                'nombre' => $usuario['nombre'],
                'rol'    => $usuario['rol']
            ]
        ]);
    }

    public static function logout(): void {
        Response::success(['mensaje' => 'Logout exitoso']);
    }

    public static function register(): void {
        $data     = \App\Utils\Request::all();
        $nombre   = trim($data['nombre']   ?? '');
        $correo   = strtolower(trim($data['correo'] ?? ''));
        $password = $data['password'] ?? '';
        $rol      = $data['rol'] ?? 'admin';

        if (empty($nombre) || empty($correo) || empty($password)) {
            Response::error('Nombre, correo y contraseña son requeridos', 400);
        }

        $db   = Database::getConnection();
        $stmt = $db->prepare('SELECT id FROM usuarios WHERE correo = ?');
        $stmt->execute([$correo]);
        if ($stmt->fetch()) {
            Response::error('El correo ya está registrado', 400);
        }

        try {
            $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
            $stmt = $db->prepare('INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)');
            $stmt->execute([$nombre, $correo, $hash, $rol]);
            Logger::info("Usuario registrado: $correo ($rol)");
            Response::success(['mensaje' => 'Usuario creado exitosamente', 'id' => $db->lastInsertId()], 201);
        } catch (\PDOException $e) {
            Logger::error("Error al registrar usuario: " . $e->getMessage());
            Response::error('Error al crear el usuario', 500);
        }
    }
}
