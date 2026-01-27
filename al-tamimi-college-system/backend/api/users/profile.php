<?php
require_once '../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    response_json(['error' => 'Method not allowed'], 405);
}

$current_user = get_current_user();
if (!$current_user) {
    response_json(['error' => 'Unauthorized'], 401);
}

try {
    $pdo = get_db_connection();
    
    $stmt = $pdo->prepare("
        SELECT u.*, g.name as group_name 
        FROM users u 
        LEFT JOIN groups g ON u.group_id = g.id 
        WHERE u.id = ?
    ");
    $stmt->execute([$current_user['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        response_json(['error' => 'User not found'], 404);
    }
    
    // Get user badges
    $stmt = $pdo->prepare("
        SELECT b.*, ub.earned_at 
        FROM user_badges ub 
        JOIN badges b ON ub.badge_id = b.id 
        WHERE ub.user_id = ?
    ");
    $stmt->execute([$current_user['user_id']]);
    $badges = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Remove sensitive data
    unset($user['password_hash']);
    
    response_json([
        'user' => $user,
        'badges' => $badges
    ]);
    
} catch (PDOException $e) {
    response_json(['error' => 'Database error'], 500);
}
?>
