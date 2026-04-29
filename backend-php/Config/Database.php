<?php

declare(strict_types=1);

namespace App\Config;

use PDO;
use PDOException;
use App\Utils\Logger;

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $host    = $_ENV['DB_HOST']     ?? 'localhost';
            $port    = $_ENV['DB_PORT']     ?? '3306';
            $db      = $_ENV['DB_NAME']     ?? '';
            $user    = $_ENV['DB_USER']     ?? '';
            $pass    = $_ENV['DB_PASS']     ?? '';
            $charset = 'utf8mb4';

            $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                Logger::info("Conectando a DB: $host:$port/$db");
                self::$instance = new PDO($dsn, $user, $pass, $options);
            } catch (PDOException $e) {
                Logger::error("Error de conexión: " . $e->getMessage());
                header('Content-Type: application/json');
                http_response_code(500);
                echo json_encode(['error' => 'Error de conexión a la base de datos', 'details' => $e->getMessage()]);
                exit;
            }
        }
        return self::$instance;
    }
}
