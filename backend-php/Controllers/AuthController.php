<?php

declare(strict_types=1);

namespace App\controllers;

use App\config\database;
use App\utils\response;
use App\utils\logger;
use App\utils\EmailService;
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

        if ((int)$usuario['verificado'] === 0 && $usuario['rol'] === 'cliente') {
            logger::warning("Login bloqueado (cuenta no verificada): $correo");
            response::error('Tu cuenta aún no está verificada. Por favor ingresa el código de 6 dígitos enviado a tu correo para activarla.', 403, [
                'requiere_verificacion' => true,
                'correo'                => $correo
            ]);
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
        $data      = \App\utils\request::all();
        $nombre    = trim($data['nombre']    ?? '');
        $apellidos = trim($data['apellidos'] ?? '');
        $edad      = !empty($data['edad']) ? (int)$data['edad'] : null;
        $direccion = trim($data['direccion'] ?? '');
        $ciudad    = trim($data['ciudad']    ?? '');
        $correo    = strtolower(trim($data['correo'] ?? ''));
        $password  = $data['password'] ?? '';
        
        // POR SEGURIDAD: Siempre se fuerza el rol a 'cliente'. Nunca admin o superadmin por registro.
        $rol       = 'cliente';

        if (empty($nombre) || empty($apellidos) || empty($edad) || empty($direccion) || empty($ciudad) || empty($correo) || empty($password)) {
            response::error('Todos los campos son obligatorios para el registro', 400);
        }

        $db   = database::getConnection();
        $stmt = $db->prepare('SELECT id FROM usuarios WHERE correo = ?');
        $stmt->execute([$correo]);
        if ($stmt->fetch()) {
            response::error('El correo ya está registrado', 400);
        }

        try {
            $hash   = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
            $codigo = sprintf("%06d", random_int(0, 999999));
            $expira = date('Y-m-d H:i:s', strtotime('+15 minutes'));
            $verificado = 0;

            $stmt = $db->prepare('INSERT INTO usuarios (nombre, apellidos, edad, direccion, ciudad, correo, password, rol, verificado, codigo_verificacion, codigo_verificacion_expira) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([$nombre, $apellidos, $edad, $direccion, $ciudad, $correo, $hash, $rol, $verificado, $codigo, $expira]);
            
            $userId = $db->lastInsertId();
            logger::info("Usuario registrado (pendiente verificación): $correo ($rol)");

            // Enviar correo de verificación por Gmail SMTP
            EmailService::enviarCodigoVerificacion($correo, $nombre, $codigo);

            response::success([
                'mensaje'               => 'Registro exitoso. Hemos enviado un código de verificación de 6 dígitos a tu correo electrónico.',
                'requiere_verificacion' => true,
                'correo'                => $correo
            ], 201);
        } catch (\PDOException $e) {
            logger::error("Error al registrar usuario: " . $e->getMessage());
            response::error('Error al crear el usuario', 500);
        }
    }

    public static function googleLogin(): void {
        $data = \App\utils\request::all();
        $credential = $data['credential'] ?? '';

        if (empty($credential)) {
            response::error('Google credential token es requerido', 400);
        }

        // Validar token contra Google API
        $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($credential);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        $res = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($http_code !== 200 || !$res) {
            response::error('Token de Google inválido', 401);
        }

        $google_data = json_decode($res, true);
        if (!$google_data || empty($google_data['email'])) {
            response::error('No se pudo verificar la cuenta de Google', 401);
        }

        $google_id = $google_data['sub'] ?? '';
        $correo = strtolower(trim($google_data['email']));
        $nombre = trim($google_data['name'] ?? $google_data['given_name'] ?? 'Cliente Google');
        $apellidos = trim($google_data['family_name'] ?? '');

        $db = database::getConnection();

        // 1. Buscar si el usuario ya existe por google_id
        $stmt = $db->prepare('SELECT * FROM usuarios WHERE google_id = ?');
        $stmt->execute([$google_id]);
        $usuario = $stmt->fetch();

        // 2. Si no existe por google_id, buscar por correo
        if (!$usuario) {
            $stmt = $db->prepare('SELECT * FROM usuarios WHERE correo = ?');
            $stmt->execute([$correo]);
            $usuario = $stmt->fetch();

            if ($usuario) {
                // Vincular
                $stmt = $db->prepare('UPDATE usuarios SET google_id = ? WHERE id = ?');
                $stmt->execute([$google_id, $usuario['id']]);
                $usuario['google_id'] = $google_id;
            } else {
                // Registrar nuevo cliente
                try {
                    $stmt = $db->prepare('INSERT INTO usuarios (nombre, apellidos, correo, google_id, rol, verificado) VALUES (?, ?, ?, ?, ?, 1)');
                    $stmt->execute([$nombre, $apellidos, $correo, $google_id, 'cliente']);
                    
                    $userId = $db->lastInsertId();
                    $stmt = $db->prepare('SELECT * FROM usuarios WHERE id = ?');
                    $stmt->execute([$userId]);
                    $usuario = $stmt->fetch();
                } catch (\PDOException $e) {
                    logger::error("Error al registrar cliente Google: " . $e->getMessage());
                    response::error('Error al registrar usuario', 500);
                }
            }
        }

        // Generar JWT
        $payload = [
            'id'     => $usuario['id'],
            'correo' => $usuario['correo'],
            'rol'    => $usuario['rol'],
            'iat'    => time(),
            'exp'    => time() + (60 * 60 * 8) // 8 horas
        ];

        $jwt = JWT::encode($payload, $_ENV['JWT_SECRET'] ?? 'camascotas-secret', 'HS256');

        logger::info("Login con Google exitoso: $correo (ID: {$usuario['id']})");

        response::success([
            'mensaje' => 'Login con Google exitoso',
            'token'   => $jwt,
            'usuario' => [
                'id'        => $usuario['id'],
                'correo'    => $usuario['correo'],
                'nombre'    => $usuario['nombre'],
                'apellidos' => $usuario['apellidos'] ?? '',
                'rol'       => $usuario['rol']
            ]
        ]);
    }

    public static function verificarCodigo(): void {
        $data   = \App\utils\request::all();
        $correo = strtolower(trim($data['correo'] ?? ''));
        $codigo = trim($data['codigo'] ?? '');

        if (empty($correo) || empty($codigo)) {
            response::error('Correo y código de verificación son requeridos', 400);
        }

        $db   = database::getConnection();
        $stmt = $db->prepare('SELECT * FROM usuarios WHERE correo = ?');
        $stmt->execute([$correo]);
        $usuario = $stmt->fetch();

        if (!$usuario) {
            response::error('Usuario no encontrado', 404);
        }

        if ((int)$usuario['verificado'] === 1) {
            $payload = [
                'id'     => $usuario['id'],
                'correo' => $usuario['correo'],
                'rol'    => $usuario['rol'],
                'iat'    => time(),
                'exp'    => time() + (60 * 60 * 8)
            ];
            $jwt = JWT::encode($payload, $_ENV['JWT_SECRET'] ?? 'camascotas-secret', 'HS256');
            response::success([
                'mensaje' => 'Tu cuenta ya estaba verificada. Inicio de sesión exitoso.',
                'token'   => $jwt,
                'usuario' => [
                    'id'        => $usuario['id'],
                    'correo'    => $usuario['correo'],
                    'nombre'    => $usuario['nombre'],
                    'apellidos' => $usuario['apellidos'] ?? '',
                    'rol'       => $usuario['rol']
                ]
            ]);
        }

        if ((string)$usuario['codigo_verificacion'] !== (string)$codigo) {
            response::error('El código de verificación ingresado es incorrecto', 400);
        }

        if (!empty($usuario['codigo_verificacion_expira']) && strtotime($usuario['codigo_verificacion_expira']) < time()) {
            response::error('El código de verificación ha expirado. Por favor solicita uno nuevo.', 400, ['codigo_expirado' => true]);
        }

        // Activar cuenta
        $stmtUpdate = $db->prepare('UPDATE usuarios SET verificado = 1, codigo_verificacion = NULL, codigo_verificacion_expira = NULL WHERE id = ?');
        $stmtUpdate->execute([$usuario['id']]);

        logger::info("Cuenta verificada exitosamente: $correo (ID: {$usuario['id']})");

        $payload = [
            'id'     => $usuario['id'],
            'correo' => $usuario['correo'],
            'rol'    => $usuario['rol'],
            'iat'    => time(),
            'exp'    => time() + (60 * 60 * 8)
        ];
        $jwt = JWT::encode($payload, $_ENV['JWT_SECRET'] ?? 'camascotas-secret', 'HS256');

        response::success([
            'mensaje' => '¡Tu cuenta ha sido verificada con éxito! Bienvenido a Camascotas.',
            'token'   => $jwt,
            'usuario' => [
                'id'        => $usuario['id'],
                'correo'    => $usuario['correo'],
                'nombre'    => $usuario['nombre'],
                'apellidos' => $usuario['apellidos'] ?? '',
                'rol'       => $usuario['rol']
            ]
        ]);
    }

    public static function reenviarCodigo(): void {
        $data   = \App\utils\request::all();
        $correo = strtolower(trim($data['correo'] ?? ''));

        if (empty($correo)) {
            response::error('El correo electrónico es requerido para reenviar el código', 400);
        }

        $db   = database::getConnection();
        $stmt = $db->prepare('SELECT * FROM usuarios WHERE correo = ?');
        $stmt->execute([$correo]);
        $usuario = $stmt->fetch();

        if (!$usuario) {
            response::error('No se encontró ninguna cuenta registrada con este correo', 404);
        }

        if ((int)$usuario['verificado'] === 1) {
            response::error('Esta cuenta ya se encuentra verificada', 400);
        }

        $codigo = sprintf("%06d", random_int(0, 999999));
        $expira = date('Y-m-d H:i:s', strtotime('+15 minutes'));

        $stmtUpdate = $db->prepare('UPDATE usuarios SET codigo_verificacion = ?, codigo_verificacion_expira = ? WHERE id = ?');
        $stmtUpdate->execute([$codigo, $expira, $usuario['id']]);

        $enviado = EmailService::enviarCodigoVerificacion($correo, $usuario['nombre'], $codigo);

        if (!$enviado) {
            response::error('Hubo un problema al enviar el correo con el código. Por favor verifica los datos o intenta más tarde.', 500);
        }

        logger::info("Código de verificación reenviado a: $correo");
        response::success(['mensaje' => 'Hemos enviado un nuevo código de 6 dígitos a tu correo electrónico.']);
    }
}
