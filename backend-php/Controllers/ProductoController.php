<?php
namespace Controllers;

use Config\Database;
use Utils\ResponseHandler;
use PDO;
use Exception;

class ProductoController {
    public static function getAll() {
        $db = (new Database())->getConnection();
        $query = "SELECT * FROM products WHERE deleted_at IS NULL ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        ResponseHandler::sendResponse(200, "Products retrieved successfully", $products);
    }

    public static function getById($id) {
        $db = (new Database())->getConnection();
        
        // Product basic info
        $query = "SELECT * FROM products WHERE id = ? AND deleted_at IS NULL";
        $stmt = $db->prepare($query);
        $stmt->execute([$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            ResponseHandler::sendError(404, "Product not found");
        }

        // Colors
        $query = "SELECT color FROM product_colors WHERE product_id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$id]);
        $product['colors'] = $stmt->fetchAll(PDO::FETCH_COLUMN);

        // Images
        $query = "SELECT url, description FROM product_images WHERE product_id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$id]);
        $product['images'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Variants
        $query = "SELECT name, available, price FROM product_variants WHERE product_id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$id]);
        $product['variants'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        ResponseHandler::sendResponse(200, "Product details retrieved", $product);
    }

    public static function create() {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['name'])) {
            ResponseHandler::sendError(400, "Incomplete data");
        }

        $db = (new Database())->getConnection();

        try {
            $db->beginTransaction();

            // Insert into products
            $query = "INSERT INTO products (name, description, material, category, options, isNew, isFeatured, marca, gramaje, brandIconUrl) 
                      VALUES (:name, :description, :material, :category, :options, :isNew, :isFeatured, :marca, :gramaje, :brandIconUrl)";
            
            $stmt = $db->prepare($query);
            $stmt->execute([
                ':name' => $data['name'],
                ':description' => $data['description'] ?? null,
                ':material' => $data['material'] ?? null,
                ':category' => $data['category'] ?? 'Plaxtilineas',
                ':options' => isset($data['options']) ? json_encode($data['options']) : null,
                ':isNew' => $data['isNew'] ?? 1,
                ':isFeatured' => $data['isFeatured'] ?? 0,
                ':marca' => $data['marca'] ?? null,
                ':gramaje' => $data['gramaje'] ?? null,
                ':brandIconUrl' => $data['brandIconUrl'] ?? null
            ]);

            $productId = $db->lastInsertId();

            // Insert Colors
            if (isset($data['colors']) && is_array($data['colors'])) {
                $query = "INSERT INTO product_colors (product_id, color) VALUES (?, ?)";
                $stmt = $db->prepare($query);
                foreach ($data['colors'] as $color) {
                    $stmt->execute([$productId, $color]);
                }
            }

            // Insert Images
            if (isset($data['images']) && is_array($data['images'])) {
                $query = "INSERT INTO product_images (product_id, url, description) VALUES (?, ?, ?)";
                $stmt = $db->prepare($query);
                foreach ($data['images'] as $img) {
                    $url = is_array($img) ? $img['url'] : $img;
                    $desc = is_array($img) ? ($img['description'] ?? null) : null;
                    $stmt->execute([$productId, $url, $desc]);
                }
            }

            // Insert Variants
            if (isset($data['variants']) && is_array($data['variants'])) {
                $query = "INSERT INTO product_variants (product_id, name, available, price) VALUES (?, ?, ?, ?)";
                $stmt = $db->prepare($query);
                foreach ($data['variants'] as $variant) {
                    $stmt->execute([
                        $productId,
                        $variant['name'],
                        $variant['available'] ?? 1,
                        $variant['price'] ?? null
                    ]);
                }
            }

            $db->commit();
            ResponseHandler::sendResponse(201, "Product created successfully", ["id" => $productId]);

        } catch (Exception $e) {
            $db->rollBack();
            ResponseHandler::sendError(500, "Error creating product: " . $e->getMessage());
        }
    }
}
