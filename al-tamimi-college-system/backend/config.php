<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'al_tamimi_college');
define('DB_USER', 'root');
define('DB_PASS', '');

// JWT Secret
define('JWT_SECRET', 'your-super-secret-jwt-key-here');

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session
session_start();

// Helper functions
function response_json($data, $status_code = 200) {
    http_response_code($status_code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function get_db_connection() {
    try {
        $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        response_json(['error' => 'Database connection failed'], 500);
    }
}

function generate_jwt($user_id, $role) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode(['user_id' => $user_id, 'role' => $role, 'exp' => time() + (7 * 24 * 60 * 60)]);
    
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verify_jwt($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
    
    if ($payload['exp'] < time()) return false;
    
    return $payload;
}

function get_current_user() {
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) return null;
    
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    return verify_jwt($token);
}
?>
