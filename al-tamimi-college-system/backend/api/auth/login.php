<?php
require_once '../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    response_json(['error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email']) || !isset($data['password'])) {
    response_json(['error' => 'Email and password are required'], 400);
}

$email = $data['email'];
$password = $data['password'];

try {
    $pdo = get_db_connection();
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || !password_verify($password, $user['password_hash'])) {
        response_json(['error' => 'Invalid credentials'], 401);
    }
    
    // Generate JWT token
    $token = generate_jwt($user['id'], $user['role']);
    
    // Remove password from response
    unset($user['password_hash']);
    
    response_json([
        'success' => true,
        'token' => $token,
        'user' => $user
    ]);
    
} catch (PDOException $e) {
    response_json(['error' => 'Database error'], 500);
}
?>
