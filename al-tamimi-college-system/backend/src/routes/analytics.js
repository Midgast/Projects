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

// Получение общей статистики
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const { group_id, date_from, date_to } = req.query;
    
    // Общее количество студентов
    const studentsCount = await query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['student']);
    
    // Общее количество групп
    const groupsCount = await query('SELECT COUNT(*) as count FROM groups');
    
    // Общее количество предметов
    const subjectsCount = await query('SELECT COUNT(*) as count FROM subjects');
    
    // Статистика посещаемости
    let attendanceSql = `
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late
      FROM attendance a
    `;
    
    const attendanceParams = [];
    const attendanceConditions = [];
    
    if (group_id) {
      attendanceConditions.push(`a.group_id = $${attendanceParams.length + 1}`);
      attendanceParams.push(group_id);
    }
    
    if (date_from) {
      attendanceConditions.push(`a.date >= $${attendanceParams.length + 1}`);
      attendanceParams.push(date_from);
    }
    
    if (date_to) {
      attendanceConditions.push(`a.date <= $${attendanceParams.length + 1}`);
      attendanceParams.push(date_to);
    }
    
    if (attendanceConditions.length > 0) {
      attendanceSql += ' WHERE ' + attendanceConditions.join(' AND ');
    }
    
    const attendanceStats = await query(attendanceSql, attendanceParams);
    
    // Риск-студенты (посещаемость < 60%)
    const riskStudentsSql = `
      SELECT 
        u.id, u.username, u.email,
        COUNT(*) as total_classes,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as attended_classes,
        ROUND(
          (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2
        ) as attendance_percentage
      FROM users u
      JOIN attendance a ON u.id = a.student_id
      WHERE u.role = 'student'
    `;
    
    const riskParams = [];
    const riskConditions = [];
    
    if (group_id) {
      riskConditions.push(`a.group_id = $${riskParams.length + 1}`);
      riskParams.push(group_id);
    }
    
    if (date_from) {
      riskConditions.push(`a.date >= $${riskParams.length + 1}`);
      riskParams.push(date_from);
    }
    
    if (date_to) {
      riskConditions.push(`a.date <= $${riskParams.length + 1}`);
      riskParams.push(date_to);
    }
    
    if (riskConditions.length > 0) {
      riskStudentsSql += ' AND ' + riskConditions.join(' AND ');
    }
    
    riskStudentsSql += `
      GROUP BY u.id, u.username, u.email
      HAVING 
        (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)) < 60
      ORDER BY attendance_percentage ASC
      LIMIT 10
    `;
    
    const riskStudents = await query(riskStudentsSql, riskParams);
    
    // Топ студентов (посещаемость > 85%)
    const topStudentsSql = riskStudentsSql.replace('< 60', '> 85').replace('ASC', 'DESC');
    const topStudents = await query(topStudentsSql, riskParams);
    
    res.json({
      overview: {
        total_students: parseInt(studentsCount.rows[0].count),
        total_groups: parseInt(groupsCount.rows[0].count),
        total_subjects: parseInt(subjectsCount.rows[0].count),
        attendance: attendanceStats.rows[0]
      },
      risk_students: riskStudents.rows,
      top_students: topStudents.rows
    });
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

// График посещаемости по дням
router.get('/attendance-chart', authenticateToken, async (req, res) => {
  try {
    const { group_id, date_from, date_to } = req.query;
    
    let sql = `
      SELECT 
        a.date,
        COUNT(*) as total_records,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late,
        ROUND(
          (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2
        ) as attendance_percentage
      FROM attendance a
    `;
    
    const params = [];
    const conditions = [];
    
    if (group_id) {
      conditions.push(`a.group_id = $${params.length + 1}`);
      params.push(group_id);
    }
    
    if (date_from) {
      conditions.push(`a.date >= $${params.length + 1}`);
      params.push(date_from);
    }
    
    if (date_to) {
      conditions.push(`a.date <= $${params.length + 1}`);
      params.push(date_to);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' GROUP BY a.date ORDER BY a.date ASC';
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get attendance chart error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance chart' });
  }
});

// Статистика по группам
router.get('/groups-stats', authenticateToken, async (req, res) => {
  try {
    const sql = `
      SELECT 
        g.id, g.name,
        COUNT(u.id) as student_count,
        COUNT(a.id) as total_attendance_records,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_records,
        ROUND(
          (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0)), 2
        ) as attendance_percentage
      FROM groups g
      LEFT JOIN users u ON g.id = u.group_id AND u.role = 'student'
      LEFT JOIN attendance a ON u.id = a.student_id
      GROUP BY g.id, g.name
      ORDER BY attendance_percentage DESC
    `;
    
    const result = await query(sql);
    res.json(result.rows);
  } catch (error) {
    console.error('Get groups stats error:', error);
    res.status(500).json({ error: 'Failed to fetch groups stats' });
  }
});

module.exports = router;
