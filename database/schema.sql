-- ============================================
-- KBA MEN'S HOSTEL MANAGEMENT SYSTEM
-- Complete Database Schema
-- PostgreSQL
-- ============================================

-- Drop existing tables if you want a fresh start (UNCOMMENT IF NEEDED)
-- DROP TABLE IF EXISTS maintenance_complaints CASCADE;
-- DROP TABLE IF EXISTS gatepasses CASCADE;
-- DROP TABLE IF EXISTS housekeeping_requests CASCADE;
-- DROP TABLE IF EXISTS electrical_work_requests CASCADE;
-- DROP TABLE IF EXISTS carpentry_requests CASCADE;
-- DROP TABLE IF EXISTS medical_requests CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS rt CASCADE;
-- DROP TABLE IF EXISTS admin CASCADE;
-- DROP TABLE IF EXISTS maintenanceuser CASCADE;
-- DROP TABLE IF EXISTS watchman CASCADE;
-- DROP TABLE IF EXISTS logins CASCADE;
-- DROP TABLE IF EXISTS admin_logins CASCADE;
-- DROP TABLE IF EXISTS rtlogins CASCADE;
-- DROP TABLE IF EXISTS maintenanceuserlogins CASCADE;

-- ============================================
-- 1. ADMIN TABLE (Management Admin)
-- ============================================
CREATE TABLE IF NOT EXISTS admin (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. RT (Resident Tutor) TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rt (
    id SERIAL PRIMARY KEY,
    rtid VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rt_mob_num VARCHAR(15),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. USERS TABLE (Students)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rrn VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    parent_email VARCHAR(255),
    parent_mob_num VARCHAR(15),
    student_mob_num VARCHAR(15),
    rtid VARCHAR(50) REFERENCES rt(rtid),
    block VARCHAR(50),
    room_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 4. MAINTENANCE USER TABLE (Maintenance Admin)
-- ============================================
CREATE TABLE IF NOT EXISTS maintenanceuser (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 5. WATCHMAN TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS watchman (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 6. GATE PASSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS gatepasses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rrn VARCHAR(50) NOT NULL,
    degree VARCHAR(255),
    block_room VARCHAR(100),
    time_out TIMESTAMP,
    time_in TIMESTAMP,
    reason TEXT,
    student_contact VARCHAR(15),
    parent_contact VARCHAR(15),
    rt_name VARCHAR(255),
    rtid VARCHAR(50) REFERENCES rt(rtid),
    status VARCHAR(20) DEFAULT 'pending',
    pdf_url TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 7. HOUSEKEEPING REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS housekeeping_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rrn VARCHAR(50) NOT NULL,
    block VARCHAR(50),
    room_number VARCHAR(50),
    complaint TEXT,
    maintenance_done VARCHAR(10) DEFAULT 'No',
    status VARCHAR(20) DEFAULT 'pending',
    assigned_to VARCHAR(255),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 8. ELECTRICAL WORK REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS electrical_work_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rrn VARCHAR(50) NOT NULL,
    block VARCHAR(50),
    room_number VARCHAR(50),
    complaint TEXT,
    maintenance_done VARCHAR(10) DEFAULT 'No',
    status VARCHAR(20) DEFAULT 'pending',
    assigned_to VARCHAR(255),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 9. CARPENTRY REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS carpentry_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rrn VARCHAR(50) NOT NULL,
    block VARCHAR(50),
    room_number VARCHAR(50),
    complaint TEXT,
    maintenance_done VARCHAR(10) DEFAULT 'No',
    status VARCHAR(20) DEFAULT 'pending',
    assigned_to VARCHAR(255),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 10. MEDICAL REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS medical_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rrn VARCHAR(50) NOT NULL,
    block VARCHAR(50),
    room_number VARCHAR(50),
    phone_number VARCHAR(15),
    issue TEXT,
    service_done VARCHAR(10) DEFAULT 'No',
    status VARCHAR(20) DEFAULT 'pending',
    doctor_notes TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 11. MAINTENANCE COMPLAINTS TABLE (AI-Powered)
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_complaints (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rrn VARCHAR(50) NOT NULL,
    block VARCHAR(50),
    room_number VARCHAR(50),
    description TEXT,
    category VARCHAR(50),
    ai_predicted_category VARCHAR(50),
    ai_confidence DECIMAL(5,2),
    priority VARCHAR(20) DEFAULT 'normal',
    sentiment VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    assigned_to VARCHAR(255),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- ============================================
-- 12. LOGIN TRACKING TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS logins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    login_time TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_logins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    login_time TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rtlogins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    login_time TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenanceuserlogins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    login_time TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR BETTER PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_rrn ON users(rrn);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_gatepasses_rrn ON gatepasses(rrn);
CREATE INDEX IF NOT EXISTS idx_gatepasses_status ON gatepasses(status);
CREATE INDEX IF NOT EXISTS idx_gatepasses_rtid ON gatepasses(rtid);
CREATE INDEX IF NOT EXISTS idx_housekeeping_status ON housekeeping_requests(status);
CREATE INDEX IF NOT EXISTS idx_electrical_status ON electrical_work_requests(status);
CREATE INDEX IF NOT EXISTS idx_carpentry_status ON carpentry_requests(status);
CREATE INDEX IF NOT EXISTS idx_medical_status ON medical_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_complaints_status ON maintenance_complaints(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_complaints_category ON maintenance_complaints(category);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert a default admin (password: admin123 - you should hash this in production)
-- INSERT INTO admin (username, id, email, password) 
-- VALUES ('admin', 1, 'admin@kbahostel.com', '$2b$10$hashedpasswordhere');

-- Insert a sample RT
-- INSERT INTO rt (rtid, name, email, password, rt_mob_num) 
-- VALUES ('RT001', 'John RT', 'rt1@kbahostel.com', '$2b$10$hashedpasswordhere', '9876543210');

-- Insert a sample student
-- INSERT INTO users (name, rrn, email, password, parent_email, parent_mob_num, student_mob_num, rtid) 
-- VALUES ('Ahmed Student', 'RRN001', 'student@example.com', '$2b$10$hashedpasswordhere', 'parent@example.com', '9876543211', '9876543212', 'RT001');

-- Insert a sample maintenance user
-- INSERT INTO maintenanceuser (id, name, email, password) 
-- VALUES ('MNT001', 'Maintenance Admin', 'maintenance@kbahostel.com', '$2b$10$hashedpasswordhere');

-- ============================================
-- GRANT PERMISSIONS (if needed)
-- ============================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user;

-- ============================================
-- NOTES:
-- 1. All passwords should be hashed using bcrypt before storing
-- 2. Update the .env file with your database credentials
-- 3. Run this script using: psql -U username -d database_name -f schema.sql
-- ============================================
