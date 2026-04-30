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
            // Bypass SSL verification for local environments with certificate issues
            $config->api->callbackUrl = null; 
            // Note: Cloudinary SDK uses Guzzle, we might need to set it globally if this doesn't work.
            // For now, let's try a different approach if the SDK allows it.

            logger::info("Inicializando Cloudinary...");
            self::$instance = new Cloudinary($config);
        }
        return self::$instance;
    }

    public static function upload(string $filePath, string $folder = 'camascotas_general'): array {
        logger::info("Subiendo imagen a Cloudinary: $folder");
        $cloudinary = self::getInstance();
        $result = $cloudinary->uploadApi()->upload($filePath, [
            'folder'        => $folder,
            'resource_type' => 'auto',
            'transformation' => [
                ['width' => 1200, 'height' => 900, 'crop' => 'limit', 'quality' => 'auto']
            ]
        ]);

        logger::info("Subida completada: " . ($result['public_id'] ?? 'N/A'));
        return [
            'secure_url' => $result['secure_url'],
            'public_id'  => $result['public_id']
        ];
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
