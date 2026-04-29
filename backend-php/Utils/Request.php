<?php

declare(strict_types=1);

namespace App\Utils;

class Request {
    public static function all(): array {
        $data = [];
        $data = array_merge($data, $_POST);

        $raw         = file_get_contents('php://input');
        $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
        $method      = $_SERVER['REQUEST_METHOD'];

        if (!empty($raw) && stripos($contentType, 'application/json') !== false) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                $data = array_merge($data, $decoded);
            }
        } elseif ($method === 'PUT' && !empty($raw)) {
            if (stripos($contentType, 'application/x-www-form-urlencoded') !== false) {
                parse_str($raw, $putData);
                $data = array_merge($data, $putData);
            } elseif (stripos($contentType, 'multipart/form-data') !== false) {
                self::parseMultipart($raw, $contentType, $data);
            }
        }

        return $data;
    }

    private static ?array $cachedFiles = null;

    public static function files(): array {
        if (self::$cachedFiles !== null) return self::$cachedFiles;

        $files = $_FILES;

        if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
            $raw         = file_get_contents('php://input');
            $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
            if (stripos($contentType, 'multipart/form-data') !== false) {
                $manualFiles = [];
                $unused      = [];
                self::parseMultipart($raw, $contentType, $unused, $manualFiles);
                $files = array_merge($files, $manualFiles);
            }
        }

        self::$cachedFiles = $files;
        return $files;
    }

    private static function parseMultipart(string $raw, string $ct, ?array &$data = [], array &$files = []): void {
        if (!preg_match('/boundary=(.*)$/i', $ct, $m)) return;
        $boundary = trim($m[1], '" ');
        $blocks   = explode("--" . $boundary, $raw);

        foreach ($blocks as $block) {
            if (empty(trim($block)) || $block === "--\r\n" || $block === "--") continue;
            $parts = explode("\r\n\r\n", $block, 2);
            if (count($parts) < 2) continue;

            $headers = $parts[0];
            $body    = substr($parts[1], 0, -2);

            if (preg_match('/name=\"([^\"]*)\"/', $headers, $nm)) {
                $fieldName = $nm[1];
                if (preg_match('/filename=\"([^\"]*)\"/', $headers, $fm)) {
                    preg_match('/Content-Type:\s+([^\r\n]*)/i', $headers, $tm);
                    $fileType = $tm[1] ?? 'application/octet-stream';
                    $tmpPath  = tempnam(sys_get_temp_dir(), 'php_put_');
                    file_put_contents($tmpPath, $body);

                    if (strpos($fieldName, '[]') !== false) {
                        $base = str_replace('[]', '', $fieldName);
                        if (!isset($files[$base])) {
                            $files[$base] = ['name' => [], 'type' => [], 'tmp_name' => [], 'error' => [], 'size' => []];
                        }
                        $files[$base]['name'][]     = $fm[1];
                        $files[$base]['type'][]     = $fileType;
                        $files[$base]['tmp_name'][] = $tmpPath;
                        $files[$base]['error'][]    = 0;
                        $files[$base]['size'][]     = strlen($body);
                    } else {
                        $files[$fieldName] = ['name' => $fm[1], 'type' => $fileType, 'tmp_name' => $tmpPath, 'error' => 0, 'size' => strlen($body)];
                    }
                } else {
                    if (is_array($data)) $data[$fieldName] = $body;
                }
            }
        }
    }

    public static function get(string $key, $default = null) {
        return self::all()[$key] ?? $default;
    }
}
