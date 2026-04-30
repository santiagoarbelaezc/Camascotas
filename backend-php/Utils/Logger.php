<?php

declare(strict_types=1);

namespace App\utils;

class logger {
    private static string $logFile = __DIR__ . '/../logs/app.log';

    public static function init(): void {
        $logDir = __DIR__ . '/../logs';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0777, true);
        }
    }

    public static function log(string $message, string $level = 'INFO'): void {
        self::init();
        $timestamp = date('Y-m-d H:i:s');
        $formatted = "[$timestamp] [$level] $message" . PHP_EOL;
        file_put_contents(self::$logFile, $formatted, FILE_APPEND);
        if (in_array($level, ['ERROR', 'WARNING', 'FATAL'])) {
            error_log($formatted);
        }
    }

    public static function info(string $msg): void    { self::log($msg, 'INFO'); }
    public static function debug(string $msg): void   { self::log($msg, 'DEBUG'); }
    public static function error(string $msg): void   { self::log($msg, 'ERROR'); }
    public static function warning(string $msg): void { self::log($msg, 'WARNING'); }
    public static function request(string $method, string $uri): void {
        self::log("REQUEST: $method $uri", 'HTTP');
    }
}
