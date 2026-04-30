<?php

declare(strict_types=1);

namespace App\middleware;

use App\config\cloudinaryconfig;
use App\utils\response;
use App\utils\logger;

class uploadmiddleware {
    public static function handleSingleUpload(string $fieldName, string $folder = 'camascotas_general'): ?array {
        $files = \App\utils\request::files();
        if (!isset($files[$fieldName]) || $files[$fieldName]['error'] !== UPLOAD_ERR_OK) {
            return null;
        }

        $file       = $files[$fieldName];
        $validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

        if (!in_array($file['type'], $validTypes)) {
            response::error('Formato no permitido. Solo JPEG, PNG, JPG, WEBP', 400);
        }
        if ($file['size'] > 5 * 1024 * 1024) {
            response::error('Archivo demasiado grande (máx 5MB)', 400);
        }

        try {
            return cloudinaryconfig::upload($file['tmp_name'], $folder);
        } catch (\Exception $e) {
            response::error('Error subiendo imagen a Cloudinary', 500, $e->getMessage());
        }
        return null;
    }

    public static function handleMultipleUpload(string $fieldName, string $folder = 'camascotas_productos', int $limit = 5): array {
        $filesSource = \App\utils\request::files();
        logger::info("Buscando campo '$fieldName' en FILES: " . json_encode(array_keys($filesSource)));

        if (!isset($filesSource[$fieldName])) {
            logger::warning("Campo '$fieldName' no encontrado en FILES");
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
                logger::warning("Error en archivo $fileName: código $errorCode");
                continue;
            }
            if (!in_array($type, $validTypes)) {
                logger::warning("Tipo inválido $type para $fileName");
                continue;
            }
            if ($size > 5 * 1024 * 1024) {
                logger::warning("Archivo muy grande: $size bytes ($fileName)");
                continue;
            }

            try {
                $result    = cloudinaryconfig::upload($tmpPath, $folder);
                $results[] = $result;
                logger::info("Subido: $fileName");
                if (strpos($tmpPath, 'php_put_') !== false) @unlink($tmpPath);
            } catch (\Exception $e) {
                logger::error("Error subiendo '$fileName': " . $e->getMessage());
            }
        }

        logger::info("Total imágenes subidas: " . count($results));
        return $results;
    }
}
