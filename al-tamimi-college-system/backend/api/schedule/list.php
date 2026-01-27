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
    
    if ($current_user['role'] === 'student') {
        // Get student's schedule
        $stmt = $pdo->prepare("
            SELECT s.*, sub.name as subject_name, sub.description as subject_description,
                   t.full_name as teacher_name, g.name as group_name
            FROM schedule s
            JOIN subjects sub ON s.subject_id = sub.id
            JOIN users t ON s.teacher_id = t.id
            JOIN groups g ON s.group_id = g.id
            WHERE s.group_id = (SELECT group_id FROM users WHERE id = ?)
            ORDER BY s.day_of_week, s.start_time
        ");
        $stmt->execute([$current_user['user_id']]);
        
    } elseif ($current_user['role'] === 'teacher') {
        // Get teacher's schedule
        $stmt = $pdo->prepare("
            SELECT s.*, sub.name as subject_name, sub.description as subject_description,
                   g.name as group_name
            FROM schedule s
            JOIN subjects sub ON s.subject_id = sub.id
            JOIN groups g ON s.group_id = g.id
            WHERE s.teacher_id = ?
            ORDER BY s.day_of_week, s.start_time
        ");
        $stmt->execute([$current_user['user_id']]);
        
    } else {
        // Admin - get all schedules
        $stmt = $pdo->prepare("
            SELECT s.*, sub.name as subject_name, sub.description as subject_description,
                   t.full_name as teacher_name, g.name as group_name
            FROM schedule s
            JOIN subjects sub ON s.subject_id = sub.id
            JOIN users t ON s.teacher_id = t.id
            JOIN groups g ON s.group_id = g.id
            ORDER BY s.day_of_week, s.start_time
        ");
        $stmt->execute();
    }
    
    $schedule = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    response_json([
        'schedule' => $schedule,
        'user_role' => $current_user['role']
    ]);
    
} catch (PDOException $e) {
    response_json(['error' => 'Database error'], 500);
}
?>
