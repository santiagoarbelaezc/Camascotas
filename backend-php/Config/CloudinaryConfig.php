<?php

declare(strict_types=1);

namespace App\config;

use Cloudinary\Cloudinary;
use Cloudinary\Configuration\Configuration;
use App\utils\logger;

class cloudinaryconfig {
    private static ?Cloudinary $instance = null;

    public static function getInstance(): Cloudinary {
        if (self::$instance === null) {
            $config = Configuration::instance();
            $config->cloud->cloudName = $_ENV['CLOUDINARY_CLOUD_NAME'] ?? '';
            $config->cloud->apiKey    = $_ENV['CLOUDINARY_API_KEY']    ?? '';
            $config->cloud->apiSecret = $_ENV['CLOUDINARY_API_SECRET'] ?? '';
            $config->url->secure      = true;
            
            // Para entornos locales sin certificados actualizados
            $config->api->apiProxy = null;
            // Intentar configurar guzzle si es posible, o simplemente asegurar que no bloquee

            logger::info("Inicializando Cloudinary...");
            self::$instance = new Cloudinary($config);
        }
        return self::$instance;
    }

    public static function upload(string $filePath, string $folder = 'camascotas_general'): array {
        logger::info("Subiendo imagen a Cloudinary. Folder: $folder, File: $filePath");
        try {
            $cloudinary = self::getInstance();
            $result = $cloudinary->uploadApi()->upload($filePath, [
                'folder'        => $folder,
                'resource_type' => 'auto',
                'verify'        => false, // Desactivar verificación SSL para entornos locales
                'transformation' => [
                    ['width' => 800, 'height' => 600, 'crop' => 'limit', 'quality' => 'auto']
                ]
            ]);

            if (isset($result['secure_url'])) {
                logger::info("Subida completada: " . $result['public_id']);
                return [
                    'secure_url' => $result['secure_url'],
                    'public_id'  => $result['public_id']
                ];
            } else {
                logger::error("Cloudinary respondió sin secure_url: " . json_encode($result));
                throw new \Exception("Error en la respuesta de Cloudinary");
            }
        } catch (\Exception $e) {
            logger::error("ERROR EN CLOUDINARY UPLOAD: " . $e->getMessage());
            throw $e;
        }
    }

    public static function delete(string $publicId): bool {
        try {
            logger::info("Eliminando de Cloudinary: $publicId");
            $cloudinary = self::getInstance();
            $result  = $cloudinary->uploadApi()->destroy($publicId);
            $success = ($result['result'] ?? '') === 'ok';
            if ($success) logger::info("Eliminación exitosa");
            else logger::warning("Eliminación fallida para $publicId");
            return $success;
        } catch (\Exception $e) {
            logger::error("Error eliminando de Cloudinary: " . $e->getMessage());
            return false;
        }
    }
}
