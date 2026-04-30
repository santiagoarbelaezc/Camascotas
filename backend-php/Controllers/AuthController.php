<?php

declare(strict_types=1);

namespace App\controllers;

use App\config\database;
use App\utils\response;
use App\utils\logger;
use Firebase\JWT\JWT;
use PDO;

class authcontroller {
    public static function login(): void {
        $data     = \App\utils\request::all();
        $correo   = strtolower(trim($data['correo'] ?? ''));
        $password = $data['password'] ?? '';

        if (empty($correo) || empty($password)) {
            response::error('Correo y contraseña son requeridos', 400);
        }

        $db   = database::getConnection();
        $stmt = $db->prepare('SELECT * FROM usuarios WHERE correo = ?');
        $stmt->execute([$correo]);
        $usuario = $stmt->fetch();

        if (!$usuario) {
            logger::warning("Login fallido: Usuario no encontrado ($correo)");
            response::error('Credenciales incorrectas', 401);
        }

        if (!password_verify($password, $usuario['password'])) {
            logger::warning("Login fallido: Contraseña incorrecta ($correo)");
            response::error('Credenciales incorrectas', 401);
        }

        $payload = [
            'id'     => $usuario['id'],
            'correo' => $usuario['correo'],
            'rol'    => $usuario['rol'],
            'iat'    => time(),
            'exp'    => time() + (60 * 60 * 8) // 8 horas
        ];

        $jwt = JWT::encode($payload, $_ENV['JWT_SECRET'] ?? 'camascotas-secret', 'HS256');

        logger::info("Login exitoso: $correo (ID: {$usuario['id']})");

        response::success([
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
        response::success(['mensaje' => 'Logout exitoso']);
    }

    public static function register(): void {
        $data     = \App\utils\request::all();
        $nombre   = trim($data['nombre']   ?? '');
        $correo   = strtolower(trim($data['correo'] ?? ''));
        $password = $data['password'] ?? '';
        $rol      = $data['rol'] ?? 'admin';

        if (empty($nombre) || empty($correo) || empty($password)) {
            response::error('Nombre, correo y contraseña son requeridos', 400);
        }

        $db   = database::getConnection();
        $stmt = $db->prepare('SELECT id FROM usuarios WHERE correo = ?');
        $stmt->execute([$correo]);
        if ($stmt->fetch()) {
            response::error('El correo ya está registrado', 400);
        }

        try {
            $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
            $stmt = $db->prepare('INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)');
            $stmt->execute([$nombre, $correo, $hash, $rol]);
            logger::info("Usuario registrado: $correo ($rol)");
            response::success(['mensaje' => 'Usuario creado exitosamente', 'id' => $db->lastInsertId()], 201);
        } catch (\PDOException $e) {
            logger::error("Error al registrar usuario: " . $e->getMessage());
            response::error('Error al crear el usuario', 500);
        }
    }
}
