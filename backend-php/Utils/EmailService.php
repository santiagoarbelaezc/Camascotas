<?php

declare(strict_types=1);

namespace App\utils;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use App\utils\logger;

class EmailService {
    public static function enviarCodigoVerificacion(string $correoDestino, string $nombreDestino, string $codigo): bool {
        $host     = $_ENV['SMTP_HOST']       ?? 'smtp.gmail.com';
        $port     = (int)($_ENV['SMTP_PORT'] ?? 587);
        $user     = $_ENV['SMTP_USER']       ?? '';
        $pass     = $_ENV['SMTP_PASS']       ?? '';
        $fromName = $_ENV['EMAIL_FROM_NAME'] ?? 'Camascotas';

        if (empty($user) || empty($pass)) {
            logger::error("No se pueden enviar correos: SMTP_USER o SMTP_PASS no configurados en .env");
            return false;
        }

        $mail = new PHPMailer(true);

        try {
            // Configuración del servidor SMTP
            $mail->isSMTP();
            $mail->Host       = $host;
            $mail->SMTPAuth   = true;
            $mail->Username   = $user;
            $mail->Password   = $pass;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = $port;
            $mail->CharSet    = 'UTF-8';

            // Remitente y Destinatario
            $mail->setFrom($user, $fromName);
            $mail->addAddress($correoDestino, $nombreDestino);

            // Contenido del correo
            $mail->isHTML(true);
            $mail->Subject = 'Verifica tu cuenta en Camascotas - Código: ' . $codigo;

            // Plantilla HTML WOW Camascotas
            $mail->Body = <<<HTML
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verifica tu cuenta en Camascotas</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAFAF8; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 65, 83, 0.08); border: 1px solid #E2E8F0; }
                    .header { background: linear-gradient(135deg, #004153 0%, #00556b 100%); padding: 36px 30px; text-align: center; color: #ffffff; }
                    .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
                    .header p { margin: 8px 0 0; font-size: 15px; opacity: 0.9; }
                    .content { padding: 40px 36px; text-align: center; color: #334155; }
                    .content h2 { font-size: 22px; color: #004153; margin-top: 0; margin-bottom: 16px; }
                    .content p { font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 28px; }
                    .code-box { background-color: #F1F5F9; border: 2px dashed #00B3BC; border-radius: 16px; padding: 24px; margin: 28px 0; }
                    .code-text { font-size: 38px; font-weight: 900; color: #004153; letter-spacing: 8px; margin: 0; }
                    .timer-text { font-size: 14px; color: #64748B; margin-top: 12px; }
                    .footer { background-color: #F8FAFC; padding: 24px 30px; text-align: center; font-size: 13px; color: #94A3B8; border-top: 1px solid #E2E8F0; }
                    .footer strong { color: #64748B; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🐶 Camascotas 🐱</h1>
                        <p>Mobiliario Premium para tus Mascotas</p>
                    </div>
                    <div class="content">
                        <h2>¡Hola, {$nombreDestino}!</h2>
                        <p>Gracias por registrarte en <strong>Camascotas</strong>. Para activar tu cuenta de cliente y garantizar la seguridad de tus datos, por favor ingresa el siguiente código de verificación:</p>
                        
                        <div class="code-box">
                            <p class="code-text">{$codigo}</p>
                            <p class="timer-text">⏱️ Este código expirará en <strong>15 minutos</strong>.</p>
                        </div>
                        
                        <p style="font-size: 14px; color: #64748B;">Si no creaste una cuenta en Camascotas, puedes ignorar de forma segura este correo.</p>
                    </div>
                    <div class="footer">
                        <p><strong>Camascotas SAS</strong> — Todos los derechos reservados.<br>
                        ¿Necesitas ayuda? Escríbenos a <em>{$_ENV['SUPPORT_EMAIL']}</em></p>
                    </div>
                </div>
            </body>
            </html>
            HTML;

            $mail->AltBody = "Hola {$nombreDestino},\n\nTu código de verificación para Camascotas es: {$codigo}\n\nEste código expira en 15 minutos.\n\nSaludos,\nEquipo Camascotas";

            $mail->send();
            logger::info("Correo de verificación enviado exitosamente a $correoDestino (Código: $codigo)");
            return true;
        } catch (Exception $e) {
            logger::error("Error al enviar correo de verificación a $correoDestino: " . $mail->ErrorInfo . " / " . $e->getMessage());
            return false;
        }
    }

    public static function enviarCodigoRecuperacion(string $correoDestino, string $nombreDestino, string $codigo): bool {
        $host     = $_ENV['SMTP_HOST']       ?? 'smtp.gmail.com';
        $port     = (int)($_ENV['SMTP_PORT'] ?? 587);
        $user     = $_ENV['SMTP_USER']       ?? '';
        $pass     = $_ENV['SMTP_PASS']       ?? '';
        $fromName = $_ENV['EMAIL_FROM_NAME'] ?? 'Camascotas';

        if (empty($user) || empty($pass)) {
            logger::error("No se pueden enviar correos: SMTP_USER o SMTP_PASS no configurados en .env");
            return false;
        }

        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host       = $host;
            $mail->SMTPAuth   = true;
            $mail->Username   = $user;
            $mail->Password   = $pass;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = $port;
            $mail->CharSet    = 'UTF-8';

            $mail->setFrom($user, $fromName);
            $mail->addAddress($correoDestino, $nombreDestino);

            $mail->isHTML(true);
            $mail->Subject = 'Recuperación de Contraseña Camascotas - Código: ' . $codigo;

            $mail->Body = <<<HTML
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Recuperación de Contraseña</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAFAF8; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 65, 83, 0.08); border: 1px solid #E2E8F0; }
                    .header { background: linear-gradient(135deg, #002835 0%, #004153 100%); padding: 36px 30px; text-align: center; color: #ffffff; }
                    .header h1 { margin: 0; font-size: 28px; font-weight: 800; }
                    .header p { margin: 8px 0 0; font-size: 15px; opacity: 0.9; }
                    .content { padding: 40px 36px; text-align: center; color: #334155; }
                    .content h2 { font-size: 22px; color: #002835; margin-top: 0; margin-bottom: 16px; }
                    .content p { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
                    .code-box { background-color: #F1F5F9; border: 2px dashed #00B3BC; border-radius: 16px; padding: 24px; margin: 24px 0; }
                    .code-text { font-size: 38px; font-weight: 900; color: #002835; letter-spacing: 8px; margin: 0; }
                    .timer-text { font-size: 13px; color: #64748B; margin-top: 12px; }
                    .footer { background-color: #F8FAFC; padding: 24px 30px; text-align: center; font-size: 13px; color: #94A3B8; border-top: 1px solid #E2E8F0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Recuperación de Contraseña</h1>
                        <p>Camascotas SAS</p>
                    </div>
                    <div class="content">
                        <h2>¡Hola, {$nombreDestino}!</h2>
                        <p>Recibimos una solicitud para restablecer tu contraseña. Puedes utilizar el siguiente <strong>código de 6 dígitos como tu contraseña provisional</strong> para ingresar a tu cuenta:</p>
                        
                        <div class="code-box">
                            <p class="code-text">{$codigo}</p>
                            <p class="timer-text">⏱️ Código válido por <strong>15 minutos</strong>.</p>
                        </div>
                        
                        <p style="font-size: 14px; color: #64748B;">Una vez que ingreses, te recomendamos cambiar tu contraseña desde tu perfil para mantener tu cuenta segura.</p>
                    </div>
                    <div class="footer">
                        <p><strong>Camascotas SAS</strong> — Si no solicitaste este cambio, puedes ignorar de forma segura este correo.</p>
                    </div>
                </div>
            </body>
            </html>
            HTML;

            $mail->AltBody = "Hola {$nombreDestino},\n\nTu código provisional de contraseña para Camascotas es: {$codigo}\n\nIngresa con este código y actualiza tu contraseña en tu perfil.\n\nSaludos,\nEquipo Camascotas";

            $mail->send();
            logger::info("Correo de recuperación de contraseña enviado exitosamente a $correoDestino (Código: $codigo)");
            return true;
        } catch (Exception $e) {
            logger::error("Error al enviar correo de recuperación a $correoDestino: " . $mail->ErrorInfo . " / " . $e->getMessage());
            return false;
        }
    }
}
