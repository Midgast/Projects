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

// Получение посещаемости
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { group_id, subject_id, date_from, date_to } = req.query;
    
    let sql = `
      SELECT a.*, u.username as student_name, g.name as group_name,
             sub.name as subject_name, s.start_time, s.day_of_week
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      JOIN groups g ON a.group_id = g.id
      JOIN subjects sub ON a.subject_id = sub.id
      JOIN schedule s ON a.schedule_id = s.id
    `;
    
    const params = [];
    const conditions = [];
    
    if (group_id) {
      conditions.push(`a.group_id = $${params.length + 1}`);
      params.push(group_id);
    }
    
    if (subject_id) {
      conditions.push(`a.subject_id = $${params.length + 1}`);
      params.push(subject_id);
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
    
    sql += ' ORDER BY a.date DESC, s.start_time';
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Отметка посещаемости (только для преподавателя/админа)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Teacher or admin access required' });
    }

    const { schedule_id, student_id, date, status, comment } = req.body;
    
    const result = await query(
      `INSERT INTO attendance (schedule_id, student_id, date, status, comment)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (schedule_id, student_id, date) 
       DO UPDATE SET status = $4, comment = $5, updated_at = NOW()
       RETURNING *`,
      [schedule_id, student_id, date, status, comment]
    );
    
    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance: result.rows[0]
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// Массовая отметка посещаемости для группы
router.post('/batch', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Teacher or admin access required' });
    }

    const { schedule_id, date, attendance_records } = req.body;
    
    const client = await require('../config/database').pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const record of attendance_records) {
        await client.query(
          `INSERT INTO attendance (schedule_id, student_id, date, status, comment)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (schedule_id, student_id, date) 
           DO UPDATE SET status = $4, comment = $5, updated_at = NOW()`,
          [schedule_id, record.student_id, date, record.status, record.comment]
        );
      }
      
      await client.query('COMMIT');
      
      res.json({
        message: 'Batch attendance marked successfully',
        records_count: attendance_records.length
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Batch attendance error:', error);
    res.status(500).json({ error: 'Failed to mark batch attendance' });
  }
});

module.exports = router;
