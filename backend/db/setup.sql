-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
-- Create the tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    assigned_to INTEGER,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE
    SET NULL
);
-- Add indexes for faster lookups
CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_tasks_title ON tasks(title);