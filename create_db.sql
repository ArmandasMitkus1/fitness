-- Create the main database used by your Node app
CREATE DATABASE IF NOT EXISTS health;

-- Use it
USE health;

-- Create the User table expected by auth.js
DROP TABLE IF EXISTS User;

CREATE TABLE User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
