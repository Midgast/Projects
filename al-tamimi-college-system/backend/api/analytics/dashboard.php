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
    
    // Get total statistics
    $total_stats = [];
    
    if ($current_user['role'] === 'admin') {
        // Admin statistics
        $stmt = $pdo->query("SELECT COUNT(*) as total_users FROM users");
        $total_stats['total_users'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_users'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as total_students FROM users WHERE role = 'student'");
        $total_stats['total_students'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_students'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as total_teachers FROM users WHERE role = 'teacher'");
        $total_stats['total_teachers'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_teachers'];
        
        // Performance distribution
        $stmt = $pdo->query("
            SELECT 
                CASE 
                    WHEN performance_index >= 85 THEN 'excellent'
                    WHEN performance_index >= 70 THEN 'good'
                    WHEN performance_index >= 60 THEN 'average'
                    ELSE 'poor'
                END as performance_level,
                COUNT(*) as count
            FROM users 
            WHERE role = 'student' AND performance_index > 0
            GROUP BY performance_level
        ");
        $performance_distribution = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Risk level distribution
        $stmt = $pdo->query("
            SELECT risk_level, COUNT(*) as count
            FROM users 
            WHERE role = 'student'
            GROUP BY risk_level
        ");
        $risk_distribution = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Top performers
        $stmt = $pdo->query("
            SELECT full_name, performance_index, attendance_rate
            FROM users 
            WHERE role = 'student' AND performance_index > 0
            ORDER BY performance_index DESC 
            LIMIT 10
        ");
        $top_performers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        response_json([
            'total_stats' => $total_stats,
            'performance_distribution' => $performance_distribution,
            'risk_distribution' => $risk_distribution,
            'top_performers' => $top_performers
        ]);
        
    } elseif ($current_user['role'] === 'teacher') {
        // Teacher statistics
        $stmt = $pdo->prepare("
            SELECT COUNT(DISTINCT s.group_id) as total_groups
            FROM schedule s
            WHERE s.teacher_id = ?
        ");
        $stmt->execute([$current_user['user_id']]);
        $total_stats['total_groups'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_groups'];
        
        $stmt = $pdo->prepare("
            SELECT COUNT(DISTINCT s.subject_id) as total_subjects
            FROM schedule s
            WHERE s.teacher_id = ?
        ");
        $stmt->execute([$current_user['user_id']]);
        $total_stats['total_subjects'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_subjects'];
        
        // Get students in teacher's groups
        $stmt = $pdo->prepare("
            SELECT u.full_name, u.performance_index, u.attendance_rate, u.risk_level, g.name as group_name
            FROM users u
            JOIN groups g ON u.group_id = g.id
            WHERE u.role = 'student' AND u.group_id IN (
                SELECT DISTINCT s.group_id FROM schedule s WHERE s.teacher_id = ?
            )
            ORDER BY u.performance_index DESC
        ");
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        response_json([
            'total_stats' => $total_stats,
            'students' => $students
        ]);
        
    } else {
        // Student statistics
        $stmt = $pdo->prepare("
            SELECT performance_index, attendance_rate, risk_level
            FROM users 
            WHERE id = ?
        ");
        $stmt->execute([$current_user['user_id']]);
        $student_stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Get student's attendance history
        $stmt = $pdo->prepare("
            SELECT a.status, a.date, sub.name as subject_name, t.full_name as teacher_name
            FROM attendance a
            JOIN schedule s ON a.schedule_id = s.id
            JOIN subjects sub ON s.subject_id = sub.id
            JOIN users t ON s.teacher_id = t.id
            WHERE a.student_id = ?
            ORDER BY a.date DESC
            LIMIT 30
        ");
        $attendance_history = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get student's badges
        $stmt = $pdo->prepare("
            SELECT b.*, ub.earned_at 
            FROM user_badges ub 
            JOIN badges b ON ub.badge_id = b.id 
            WHERE ub.user_id = ?
        ");
        $stmt->execute([$current_user['user_id']]);
        $badges = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        response_json([
            'student_stats' => $student_stats,
            'attendance_history' => $attendance_history,
            'badges' => $badges
        ]);
    }
    
} catch (PDOException $e) {
    response_json(['error' => 'Database error'], 500);
}
?>
