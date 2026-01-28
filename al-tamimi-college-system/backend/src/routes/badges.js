const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Middleware для проверки JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Получение всех бейджей
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM badges ORDER BY required_value ASC'
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// Получение бейджей пользователя
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const result = await query(
      `SELECT ub.*, b.name, b.description, b.icon, b.color, b.type
       FROM user_badges ub
       JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = $1
       ORDER BY ub.earned_at DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get user badges error:', error);
    res.status(500).json({ error: 'Failed to fetch user badges' });
  }
});

// Создание бейджа (только для админа)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, description, icon, color, type, required_value } = req.body;
    
    const result = await query(
      `INSERT INTO badges (name, description, icon, color, type, required_value)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, icon, color, type, required_value]
    );
    
    res.status(201).json({
      message: 'Badge created successfully',
      badge: result.rows[0]
    });
  } catch (error) {
    console.error('Create badge error:', error);
    res.status(500).json({ error: 'Failed to create badge' });
  }
});

// Присвоение бейджа пользователю
router.post('/award', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { user_id, badge_id, reason } = req.body;
    
    // Проверка, нет ли уже такого бейджа у пользователя
    const existing = await query(
      'SELECT id FROM user_badges WHERE user_id = $1 AND badge_id = $2',
      [user_id, badge_id]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already has this badge' });
    }
    
    const result = await query(
      `INSERT INTO user_badges (user_id, badge_id, reason, awarded_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, badge_id, reason, req.user.userId]
    );
    
    res.status(201).json({
      message: 'Badge awarded successfully',
      user_badge: result.rows[0]
    });
  } catch (error) {
    console.error('Award badge error:', error);
    res.status(500).json({ error: 'Failed to award badge' });
  }
});

// Автоматическая проверка и присвоение бейджей на основе посещаемости
router.post('/check-attendance', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.body;
    
    // Получение статистики посещаемости студента
    const attendanceStats = await query(
      `SELECT 
        COUNT(*) as total_classes,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as attended_classes,
        ROUND(
          (COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2
        ) as attendance_percentage
       FROM attendance
       WHERE student_id = $1`,
      [user_id]
    );
    
    if (attendanceStats.rows.length === 0) {
      return res.json({ message: 'No attendance records found' });
    }
    
    const stats = attendanceStats.rows[0];
    const attendancePercentage = parseFloat(stats.attendance_percentage);
    
    // Получение всех бейджей типа attendance
    const badges = await query(
      'SELECT * FROM badges WHERE type = $1 ORDER BY required_value DESC',
      ['attendance']
    );
    
    const awardedBadges = [];
    
    for (const badge of badges.rows) {
      if (attendancePercentage >= badge.required_value) {
        // Проверка, нет ли уже этого бейджа
        const existing = await query(
          'SELECT id FROM user_badges WHERE user_id = $1 AND badge_id = $2',
          [user_id, badge.id]
        );
        
        if (existing.rows.length === 0) {
          // Присвоение бейджа
          const result = await query(
            `INSERT INTO user_badges (user_id, badge_id, reason, awarded_by)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [user_id, badge.id, `Автоматически за посещаемость ${attendancePercentage}%`, null]
          );
          
          awardedBadges.push({
            ...result.rows[0],
            badge_info: badge
          });
        }
      }
    }
    
    res.json({
      message: 'Badge check completed',
      awarded_badges: awardedBadges,
      attendance_stats: stats
    });
  } catch (error) {
    console.error('Check attendance badges error:', error);
    res.status(500).json({ error: 'Failed to check attendance badges' });
  }
});

// Получение топа по бейджам
router.get('/leaderboard', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        u.id, u.username, u.role,
        COUNT(ub.id) as badges_count,
        COUNT(CASE WHEN b.type = 'attendance' THEN 1 END) as attendance_badges,
        COUNT(CASE WHEN b.type = 'academic' THEN 1 END) as academic_badges,
        COUNT(CASE WHEN b.type = 'social' THEN 1 END) as social_badges
       FROM users u
       LEFT JOIN user_badges ub ON u.id = ub.user_id
       LEFT JOIN badges b ON ub.badge_id = b.id
       WHERE u.role = 'student'
       GROUP BY u.id, u.username, u.role
       ORDER BY badges_count DESC, u.username ASC
       LIMIT 20`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get badges leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch badges leaderboard' });
  }
});

module.exports = router;
