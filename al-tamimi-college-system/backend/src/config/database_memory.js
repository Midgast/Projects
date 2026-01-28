// Memory database for demo purposes
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@altamimi.edu',
    password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
    role: 'admin',
    full_name: 'Administrator'
  },
  {
    id: 2,
    username: 'teacher1',
    email: 'teacher1@altamimi.edu',
    password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
    role: 'teacher',
    full_name: 'Teacher One'
  },
  {
    id: 3,
    username: 'student1',
    email: 'student1@altamimi.edu',
    password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
    role: 'student',
    full_name: 'Student One'
  }
];

const query = async (text, params) => {
  // Simple query simulation
  if (text.includes('SELECT') && text.includes('email = $1')) {
    const email = params[0];
    const user = users.find(u => u.email === email);
    
    if (text.includes('id, username, email, password_hash, role')) {
      return {
        rows: user ? [{
          id: user.id,
          username: user.username,
          email: user.email,
          password_hash: user.password_hash,
          role: user.role
        }] : []
      };
    }
  }
  
  if (text.includes('SELECT') && text.includes('id')) {
    return { rows: [] };
  }
  
  return { rows: [] };
};

module.exports = { query };
