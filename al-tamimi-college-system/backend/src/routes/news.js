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

// Получение всех новостей
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const sql = `
      SELECT n.*, u.username as author_name, u.role as author_role
      FROM news n
      JOIN users u ON n.author_id = u.id
      ORDER BY n.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await query(sql, [parseInt(limit), parseInt(offset)]);
    
    // Получение общего количества новостей
    const countResult = await query('SELECT COUNT(*) as total FROM news');
    
    res.json({
      news: result.rows,
      total: parseInt(countResult.rows[0].total),
      has_more: (parseInt(offset) + parseInt(limit)) < parseInt(countResult.rows[0].total)
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Получение одной новости
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const newsId = req.params.id;
    
    const result = await query(
      `SELECT n.*, u.username as author_name, u.role as author_role
       FROM news n
       JOIN users u ON n.author_id = u.id
       WHERE n.id = $1`,
      [newsId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get news by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Создание новости (только для админа/преподавателя)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Teacher or admin access required' });
    }

    const { title, content, type = 'general', priority = 'normal' } = req.body;
    
    const result = await query(
      `INSERT INTO news (title, content, author_id, type, priority)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, content, req.user.userId, type, priority]
    );
    
    res.status(201).json({
      message: 'News created successfully',
      news: result.rows[0]
    });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ error: 'Failed to create news' });
  }
});

// Обновление новости
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const newsId = req.params.id;
    const { title, content, type, priority } = req.body;
    
    // Проверка прав доступа
    const newsResult = await query('SELECT author_id FROM news WHERE id = $1', [newsId]);
    
    if (newsResult.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }
    
    const news = newsResult.rows[0];
    
    if (req.user.role !== 'admin' && news.author_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await query(
      `UPDATE news 
       SET title = $1, content = $2, type = $3, priority = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [title, content, type, priority, newsId]
    );
    
    res.json({
      message: 'News updated successfully',
      news: result.rows[0]
    });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ error: 'Failed to update news' });
  }
});

// Удаление новости
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const newsId = req.params.id;
    
    // Проверка прав доступа
    const newsResult = await query('SELECT author_id FROM news WHERE id = $1', [newsId]);
    
    if (newsResult.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }
    
    const news = newsResult.rows[0];
    
    if (req.user.role !== 'admin' && news.author_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await query('DELETE FROM news WHERE id = $1', [newsId]);
    
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ error: 'Failed to delete news' });
  }
});

module.exports = router;
