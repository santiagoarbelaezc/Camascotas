<?php
namespace Utils;

class responsehandler {
    public static function sendResponse($status, $message, $data = null) {
        http_response_code($status);
        $response = [
            "status" => $status < 400 ? "success" : "error",
            "message" => $message
        ];
        if ($data !== null) {
            $response["data"] = $data;
        }
        echo json_encode($response);
        exit();
    }

    public static function sendError($status, $message) {
        self::sendResponse($status, $message);
    }
}
