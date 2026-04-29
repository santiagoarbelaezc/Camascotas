<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Config\CloudinaryConfig;
use App\Utils\Response;
use App\Utils\Logger;

class UploadMiddleware {
    public static function handleSingleUpload(string $fieldName, string $folder = 'camascotas_general'): ?array {
        $files = \App\Utils\Request::files();
        if (!isset($files[$fieldName]) || $files[$fieldName]['error'] !== UPLOAD_ERR_OK) {
            return null;
        }

        $file       = $files[$fieldName];
        $validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

        if (!in_array($file['type'], $validTypes)) {
            Response::error('Formato no permitido. Solo JPEG, PNG, JPG, WEBP', 400);
        }
        if ($file['size'] > 5 * 1024 * 1024) {
            Response::error('Archivo demasiado grande (máx 5MB)', 400);
        }

        try {
            return CloudinaryConfig::upload($file['tmp_name'], $folder);
        } catch (\Exception $e) {
            Response::error('Error subiendo imagen a Cloudinary', 500, $e->getMessage());
        }
        return null;
    }

    public static function handleMultipleUpload(string $fieldName, string $folder = 'camascotas_productos', int $limit = 5): array {
        $filesSource = \App\Utils\Request::files();
        Logger::info("Buscando campo '$fieldName' en FILES: " . json_encode(array_keys($filesSource)));

        if (!isset($filesSource[$fieldName])) {
            Logger::warning("Campo '$fieldName' no encontrado en FILES");
            return [];
        }

        $files = $filesSource[$fieldName];

        // Normalizar a array de archivos
        if (!is_array($files['name'])) {
            $files = [
                'name'     => [$files['name']],
                'type'     => [$files['type']],
                'tmp_name' => [$files['tmp_name']],
                'error'    => [$files['error']],
                'size'     => [$files['size']]
            ];
        }

        $results    = [];
        $validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        $count      = min(count($files['name']), $limit);

        for ($i = 0; $i < $count; $i++) {
            $errorCode = $files['error'][$i];
            $tmpPath   = $files['tmp_name'][$i];
            $fileName  = $files['name'][$i];
            $type      = $files['type'][$i];
            $size      = $files['size'][$i];

            if ($errorCode !== UPLOAD_ERR_OK) {
                Logger::warning("Error en archivo $fileName: código $errorCode");
                continue;
            }
            if (!in_array($type, $validTypes)) {
                Logger::warning("Tipo inválido $type para $fileName");
                continue;
            }
            if ($size > 5 * 1024 * 1024) {
                Logger::warning("Archivo muy grande: $size bytes ($fileName)");
                continue;
            }

            try {
                $result    = CloudinaryConfig::upload($tmpPath, $folder);
                $results[] = $result;
                Logger::info("Subido: $fileName");
                if (strpos($tmpPath, 'php_put_') !== false) @unlink($tmpPath);
            } catch (\Exception $e) {
                Logger::error("Error subiendo '$fileName': " . $e->getMessage());
            }
        }

        Logger::info("Total imágenes subidas: " . count($results));
        return $results;
    }
}
