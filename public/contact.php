<?php
/**
 * Remote Tech C.A. — Endpoint del formulario de contacto
 * -------------------------------------------------------
 * Recibe el formulario de la landing y lo envía por correo a info@remotetech.cc
 * usando mail() de PHP (disponible en el hosting de Spaceship / cPanel).
 *
 * Seguridad:
 *  - Solo POST, solo desde el propio dominio (verificación de Origin/Referer)
 *  - Honeypot anti-bots
 *  - Límite de envíos por IP (rate limit en archivo temporal)
 *  - Validación y saneamiento estricto (sin inyección de cabeceras de correo)
 *  - Respuestas JSON sin exponer detalles internos
 */

declare(strict_types=1);

/* ── Configuración ─────────────────────────────────────────────────────── */
const TO_EMAIL          = 'info@remotetech.cc';
const FROM_EMAIL        = 'info@remotetech.cc';   // Debe ser un buzón del dominio (SPF/DKIM)
const FROM_NAME         = 'Formulario Web Remote Tech';
const SITE_HOST         = 'remotetech.cc';
const RATE_LIMIT_MAX    = 5;      // envíos permitidos…
const RATE_LIMIT_WINDOW = 3600;   // …por IP cada hora
const MAX_NAME          = 100;
const MAX_EMAIL         = 150;
const MAX_MESSAGE       = 5000;

/* ── Cabeceras de respuesta ────────────────────────────────────────────── */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store, max-age=0');
header_remove('X-Powered-By');

$wantsJson = isset($_SERVER['HTTP_ACCEPT']) && stripos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

function respond(int $status, array $payload): void
{
    global $wantsJson;
    // Envío sin JavaScript (form HTML clásico): redirigir de vuelta a la sección de contacto
    if (!$wantsJson && $_SERVER['REQUEST_METHOD'] === 'POST') {
        header('Content-Type: text/html; charset=utf-8');
        header('Location: /?contacto=' . (!empty($payload['ok']) ? 'enviado' : 'error') . '#contact', true, 303);
        exit;
    }
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function str_len(string $s): int
{
    return function_exists('mb_strlen') ? mb_strlen($s, 'UTF-8') : strlen($s);
}

function clean_line(string $s): string
{
    // Una sola línea: elimina saltos y caracteres de control (evita inyección de cabeceras)
    $s = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $s) ?? '';
    return trim($s);
}

function clean_text(string $s): string
{
    // Texto multilínea: conserva \n y \t, elimina el resto de caracteres de control
    $s = str_replace(["\r\n", "\r"], "\n", $s);
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '';
    return trim($s);
}

/* ── 1. Método ─────────────────────────────────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    $wantsJson = true;
    respond(405, ['ok' => false, 'error' => 'Método no permitido.']);
}

/* ── 2. Origen (solo desde el propio sitio o entornos locales permitidos) ── */
$origin  = $_SERVER['HTTP_ORIGIN']  ?? '';
$referer = $_SERVER['HTTP_REFERER'] ?? '';
$source  = $origin !== '' ? $origin : $referer;
$host    = $source !== '' ? strtolower((string) parse_url($source, PHP_URL_HOST)) : '';
$allowedHosts = [SITE_HOST, 'www.' . SITE_HOST, 'localhost', '127.0.0.1'];

// Permitir preflight CORS (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if ($host !== '' && in_array($host, $allowedHosts, true) && $origin !== '') {
        header("Access-Control-Allow-Origin: {$origin}");
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Accept');
    }
    http_response_code(204);
    exit;
}

if ($host !== '' && in_array($host, $allowedHosts, true) && $origin !== '') {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept');
}

// Si se especificó origen/referer y no coincide con los hosts permitidos, rechazar
if ($host !== '' && !in_array($host, $allowedHosts, true)) {
    respond(403, ['ok' => false, 'error' => 'Origen no permitido.']);
}

/* ── 3. Datos ──────────────────────────────────────────────────────────── */
$name     = clean_line((string) ($_POST['name']    ?? ''));
$email    = clean_line((string) ($_POST['email']   ?? ''));
$message  = clean_text((string) ($_POST['message'] ?? ''));
$honeypot = trim((string) ($_POST['website'] ?? ''));

// Honeypot relleno → bot. Respondemos "ok" para no darle pistas.
if ($honeypot !== '') {
    respond(200, ['ok' => true]);
}

if ($name === '' || $email === '' || $message === '') {
    respond(422, ['ok' => false, 'error' => 'Por favor completa todos los campos.']);
}
if (str_len($name) > MAX_NAME || str_len($email) > MAX_EMAIL || str_len($message) > MAX_MESSAGE) {
    respond(422, ['ok' => false, 'error' => 'Uno de los campos es demasiado largo.']);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, ['ok' => false, 'error' => 'Por favor ingresa un email válido.']);
}

$ip       = $_SERVER['HTTP_CF_CONNECTING_IP']
    ?? (isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? trim(explode(',', (string)$_SERVER['HTTP_X_FORWARDED_FOR'])[0]) : null)
    ?? $_SERVER['REMOTE_ADDR']
    ?? 'unknown';
$rateDir  = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'rt_contact_rl';
if (!is_dir($rateDir)) {
    @mkdir($rateDir, 0700, true);
}
$rateFile = $rateDir . DIRECTORY_SEPARATOR . hash('sha256', $ip) . '.json';
$now      = time();

$fp = @fopen($rateFile, 'c+');
if ($fp !== false) {
    flock($fp, LOCK_EX);
    $raw  = stream_get_contents($fp);
    $hits = json_decode($raw !== false && $raw !== '' ? $raw : '[]', true);
    $hits = is_array($hits) ? array_values(array_filter($hits, static fn($t) => is_int($t) && $t > $now - RATE_LIMIT_WINDOW)) : [];

    if (count($hits) >= RATE_LIMIT_MAX) {
        flock($fp, LOCK_UN);
        fclose($fp);
        header('Retry-After: ' . RATE_LIMIT_WINDOW);
        respond(429, ['ok' => false, 'error' => 'Has enviado demasiados mensajes. Intenta más tarde.']);
    }

    $hits[] = $now;
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($hits));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
}

/* ── 5. Composición del correo ─────────────────────────────────────────── */
$encode = static fn(string $s): string => '=?UTF-8?B?' . base64_encode($s) . '?=';

$subject = $encode('Nuevo mensaje de contacto — ' . $name);

$date = (new DateTimeImmutable('now', new DateTimeZone('America/Caracas')))->format('d/m/Y H:i');
$ua   = clean_line((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''));

$body  = "Nuevo mensaje desde el formulario de remotetech.cc\n";
$body .= str_repeat('-', 52) . "\n\n";
$body .= "Nombre:  {$name}\n";
$body .= "Email:   {$email}\n";
$body .= "Fecha:   {$date} (Caracas)\n\n";
$body .= "Mensaje:\n{$message}\n\n";
$body .= str_repeat('-', 52) . "\n";
$body .= "IP: {$ip}\n";
$body .= 'Navegador: ' . substr($ua, 0, 300) . "\n";

$headers = [
    'From: ' . $encode(FROM_NAME) . ' <' . FROM_EMAIL . '>',
    'Reply-To: ' . $encode($name) . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: RemoteTech-Web',
];
$headerStr = implode("\r\n", $headers);

/* ── 6. Envío ──────────────────────────────────────────────────────────── */
// Intento con remitente de sobre (-f) para mejorar la entregabilidad (SPF);
// si el hosting no lo permite, reintenta sin él.
$sent = @mail(TO_EMAIL, $subject, $body, $headerStr, '-f' . FROM_EMAIL);
if (!$sent) {
    $sent = @mail(TO_EMAIL, $subject, $body, $headerStr);
}

if (!$sent) {
    error_log('[contact.php] mail() falló al enviar a ' . TO_EMAIL);
    respond(500, ['ok' => false, 'error' => 'No se pudo enviar el mensaje en este momento.']);
}

respond(200, ['ok' => true]);
