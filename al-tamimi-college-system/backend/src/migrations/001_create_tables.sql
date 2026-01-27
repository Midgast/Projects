-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    group_id INTEGER REFERENCES groups(id),
    performance_index DECIMAL(5,2) DEFAULT 0.00,
    attendance_rate DECIMAL(5,2) DEFAULT 0.00,
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    course_level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedule table
CREATE TABLE IF NOT EXISTS schedule (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id),
    subject_id INTEGER REFERENCES subjects(id),
    teacher_id INTEGER REFERENCES users(id),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id),
    schedule_id INTEGER REFERENCES schedule(id),
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, schedule_id, date)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id),
    teacher_id INTEGER REFERENCES users(id),
    subject_id INTEGER REFERENCES subjects(id),
    comment TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'general' CHECK (type IN ('general', 'warning', 'praise')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News table
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    target_role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    condition_type VARCHAR(50) NOT NULL,
    condition_value INTEGER,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User badges table
CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    badge_id INTEGER REFERENCES badges(id),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);

-- Insert demo data
INSERT INTO groups (name, description, course_level) VALUES
('CS-101', 'Computer Science 1st Year', 1),
('CS-201', 'Computer Science 2nd Year', 2),
('IT-101', 'Information Technology 1st Year', 1);

INSERT INTO subjects (name, description) VALUES
('Mathematics', 'Advanced Mathematics'),
('Programming', 'Web Development'),
('Database', 'Database Design'),
('English', 'English Language');

INSERT INTO users (email, password_hash, full_name, role, group_id) VALUES
('admin@altamimi.edu', '$2a$10$rQZ8kHWKQGYQkYvYvGQwI.8vQfQfQfQfQfQfQfQfQfQfQfQfQfQfQf', 'Admin User', 'admin', NULL),
('teacher1@altamimi.edu', '$2a$10$rQZ8kHWKQGYQkYvYvGQwI.8vQfQfQfQfQfQfQfQfQfQfQfQfQfQfQf', 'Teacher One', 'teacher', NULL),
('student1@altamimi.edu', '$2a$10$rQZ8kHWKQGYQkYvYvGQwI.8vQfQfQfQfQfQfQfQfQfQfQfQfQfQfQf', 'Student One', 'student', 1),
('student2@altamimi.edu', '$2a$10$rQZ8kHWKQGYQkYvYvGQwI.8vQfQfQfQfQfQfQfQfQfQfQfQfQfQfQf', 'Student Two', 'student', 1);

INSERT INTO badges (name, description, icon, condition_type, condition_value, points) VALUES
('Perfect Attendance', 'No absences for a month', '🏆', 'attendance_perfect', 30, 50),
('High Performer', 'Performance index above 85%', '⭐', 'performance_high', 85, 30),
('Dedicated Student', 'Attendance above 90%', '📚', 'attendance_high', 90, 20);
