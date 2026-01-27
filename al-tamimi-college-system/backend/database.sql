-- Create database
CREATE DATABASE IF NOT EXISTS al_tamimi_college;
USE al_tamimi_college;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL,
    group_id INT,
    performance_index DECIMAL(5,2) DEFAULT 0.00,
    attendance_rate DECIMAL(5,2) DEFAULT 0.00,
    risk_level ENUM('low', 'medium', 'high') DEFAULT 'low',
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    course_level INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Schedule table
CREATE TABLE IF NOT EXISTS schedule (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    schedule_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late') NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_attendance (student_id, schedule_id, date),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (schedule_id) REFERENCES schedule(id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    teacher_id INT NOT NULL,
    subject_id INT,
    comment TEXT NOT NULL,
    type ENUM('general', 'warning', 'praise') DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- News table
CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INT NOT NULL,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    target_role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    condition_type VARCHAR(50) NOT NULL,
    condition_value INT,
    points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User badges table
CREATE TABLE IF NOT EXISTS user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    badge_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_badge (user_id, badge_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (badge_id) REFERENCES badges(id)
);

-- Insert demo data
INSERT INTO groups (name, description, course_level) VALUES
('CS-101', 'Computer Science 1st Year', 1),
('CS-201', 'Computer Science 2nd Year', 2),
('IT-101', 'Information Technology 1st Year', 1);

INSERT INTO subjects (name, description, teacher_id) VALUES
('Mathematics', 'Advanced Mathematics', 2),
('Programming', 'Web Development', 2),
('Database', 'Database Design', 2),
('English', 'English Language', 2);

INSERT INTO users (email, password_hash, full_name, role, group_id) VALUES
('admin@altamimi.edu', '$2a$10$rQZ8kHWKQGYQkYvYvGQwI.8vQfQfQfQfQfQfQfQfQfQfQfQfQfQfQf', 'Admin User', 'admin', NULL),
('teacher1@altamimi.edu', '$2a$10$rQZ8kHWKQGYQkYvYvGQwI.8vQfQfQfQfQfQfQfQfQfQfQfQfQfQfQf', 'Teacher One', 'teacher', NULL),
('student1@altamimi.edu', '$2a$10$rQZ8kHWKQGYQkYvYvGQwI.8vQfQfQfQfQfQfQfQfQfQfQfQfQfQfQf', 'Student One', 'student', 1),
('student2@altamimi.edu', '$2a$10$rQZ8kHWKQGYQkYvYvGQwI.8vQfQfQfQfQfQfQfQfQfQfQfQfQfQfQf', 'Student Two', 'student', 1);

INSERT INTO badges (name, description, icon, condition_type, condition_value, points) VALUES
('Perfect Attendance', 'No absences for a month', '🏆', 'attendance_perfect', 30, 50),
('High Performer', 'Performance index above 85%', '⭐', 'performance_high', 85, 30),
('Dedicated Student', 'Attendance above 90%', '📚', 'attendance_high', 90, 20);

INSERT INTO schedule (group_id, subject_id, teacher_id, day_of_week, start_time, end_time, room) VALUES
(1, 1, 2, 1, '09:00:00', '10:30:00', 'A101'),
(1, 2, 2, 1, '11:00:00', '12:30:00', 'B201'),
(1, 3, 2, 2, '09:00:00', '10:30:00', 'A101'),
(1, 4, 2, 2, '11:00:00', '12:30:00', 'C301');
