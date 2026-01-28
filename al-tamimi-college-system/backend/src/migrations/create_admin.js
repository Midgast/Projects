const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Удаляем существующего админа если есть
    await query('DELETE FROM users WHERE email = $1', ['admin@altamimi.edu']);
    
    // Создаем нового админа
    const result = await query(
      'INSERT INTO users (email, password_hash, username, full_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role',
      ['admin@altamimi.edu', hashedPassword, 'admin', 'Administrator', 'admin']
    );
    
    console.log('✅ Admin user created:', result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
