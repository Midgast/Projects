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

// Получение расписания
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { group_id, day_of_week } = req.query;
    
    let sql = `
      SELECT s.*, sub.name as subject_name, sub.color as subject_color,
             u.username as teacher_name, g.name as group_name
      FROM schedule s
      JOIN subjects sub ON s.subject_id = sub.id
      JOIN users u ON s.teacher_id = u.id
      JOIN groups g ON s.group_id = g.id
    `;
    
    const params = [];
    const conditions = [];
    
    if (group_id) {
      conditions.push(`s.group_id = $${params.length + 1}`);
      params.push(group_id);
    }
    
    if (day_of_week) {
      conditions.push(`s.day_of_week = $${params.length + 1}`);
      params.push(day_of_week);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY s.start_time';
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Создание записи в расписании (только для админа/преподавателя)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Teacher or admin access required' });
    }

    const { group_id, subject_id, teacher_id, day_of_week, start_time, end_time, room } = req.body;
    
    const result = await query(
      `INSERT INTO schedule (group_id, subject_id, teacher_id, day_of_week, start_time, end_time, room)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [group_id, subject_id, teacher_id, day_of_week, start_time, end_time, room]
    );
    
    res.status(201).json({
      message: 'Schedule created successfully',
      schedule: result.rows[0]
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// Обновление записи в расписании
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Teacher or admin access required' });
    }

    const { group_id, subject_id, teacher_id, day_of_week, start_time, end_time, room } = req.body;
    const scheduleId = req.params.id;
    
    const result = await query(
      `UPDATE schedule 
       SET group_id = $1, subject_id = $2, teacher_id = $3, day_of_week = $4, 
           start_time = $5, end_time = $6, room = $7
       WHERE id = $8
       RETURNING *`,
      [group_id, subject_id, teacher_id, day_of_week, start_time, end_time, room, scheduleId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json({
      message: 'Schedule updated successfully',
      schedule: result.rows[0]
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

module.exports = router;
