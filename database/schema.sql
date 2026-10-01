-- ==========================================
-- ALUMNI MANAGEMENT SYSTEM DATABASE
-- Module 1 - Authentication
-- ==========================================

-- Drop existing tables (for development only)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS password_resets CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ==========================================
-- ROLES TABLE
-- ==========================================

CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- USERS TABLE
-- ==========================================

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    profile_picture TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_role
        FOREIGN KEY(role_id)
        REFERENCES roles(role_id)
        ON DELETE RESTRICT
);

-- ==========================================
-- PASSWORD RESETS
-- ==========================================

CREATE TABLE password_resets (
    reset_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    reset_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_reset
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ==========================================
-- AUDIT LOGS
-- ==========================================

CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(100),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_log
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL
);