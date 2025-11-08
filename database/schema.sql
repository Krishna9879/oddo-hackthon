-- WorkZen HRMS Database Schema
-- Database: workzen

-- Create Users table (for authentication and role management)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'hr', 'employee', 'payroll_officer') DEFAULT 'employee',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Employees table
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    address TEXT,
    department VARCHAR(100),
    designation VARCHAR(100),
    join_date DATE NOT NULL,
    basic_salary DECIMAL(10, 2) DEFAULT 0.00,
    allowances DECIMAL(10, 2) DEFAULT 0.00,
    profile_picture VARCHAR(255),
    status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    check_in_latitude DECIMAL(10, 8),
    check_in_longitude DECIMAL(11, 8),
    check_in_location VARCHAR(500),
    check_out_latitude DECIMAL(10, 8),
    check_out_longitude DECIMAL(11, 8),
    check_out_location VARCHAR(500),
    status ENUM('Present', 'Absent', 'Half Day', 'Late') DEFAULT 'Present',
    working_hours DECIMAL(4, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_employee_date (employee_id, date)
);

-- Create Leave Types table
CREATE TABLE IF NOT EXISTS leave_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    days_allowed INT DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Leave Requests table
CREATE TABLE IF NOT EXISTS leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    reason TEXT,
    attachment_path VARCHAR(500),
    attachment_name VARCHAR(255),
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    approved_by INT,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Create Payroll table
CREATE TABLE IF NOT EXISTS payroll (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    basic_salary DECIMAL(10, 2) NOT NULL,
    allowances DECIMAL(10, 2) DEFAULT 0.00,
    deductions DECIMAL(10, 2) DEFAULT 0.00,
    gross_salary DECIMAL(10, 2) NOT NULL,
    net_salary DECIMAL(10, 2) NOT NULL,
    working_days INT DEFAULT 0,
    present_days INT DEFAULT 0,
    absent_days INT DEFAULT 0,
    leave_days INT DEFAULT 0,
    status ENUM('Draft', 'Processed', 'Paid') DEFAULT 'Draft',
    payment_date DATE,
    generated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(id),
    UNIQUE KEY unique_employee_month_year (employee_id, month, year)
);

-- Create Departments table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    manager_id INT,
    budget DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Password Reset Tokens table
CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user (user_id)
);

-- Password Change Requests (Employee to HR)
CREATE TABLE IF NOT EXISTS password_change_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Profile Update Requests (Sensitive fields)
CREATE TABLE IF NOT EXISTS profile_update_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    field_updates JSON NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Audit Logs table (Admin access)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Employee Documents table
CREATE TABLE IF NOT EXISTS employee_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    document_type ENUM('resume', 'id_proof', 'address_proof', 'certificate', 'other') NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size INT,
    uploaded_by INT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by INT,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Performance Reviews table
CREATE TABLE IF NOT EXISTS performance_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    rating DECIMAL(3, 2),
    strengths TEXT,
    weaknesses TEXT,
    goals TEXT,
    comments TEXT,
    status ENUM('draft', 'submitted', 'acknowledged') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

-- Holidays table
CREATE TABLE IF NOT EXISTS holidays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Add additional fields to employees table (MySQL compatible)
ALTER TABLE employees ADD COLUMN department_id INT AFTER department;
ALTER TABLE employees ADD COLUMN emergency_contact VARCHAR(255);
ALTER TABLE employees ADD COLUMN emergency_phone VARCHAR(20);
ALTER TABLE employees ADD COLUMN bank_name VARCHAR(100);
ALTER TABLE employees ADD COLUMN account_number VARCHAR(50);
ALTER TABLE employees ADD COLUMN ifsc_code VARCHAR(20);
ALTER TABLE employees ADD COLUMN pan_number VARCHAR(20);
ALTER TABLE employees ADD CONSTRAINT fk_employee_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- Insert default leave types
INSERT IGNORE INTO leave_types (name, days_allowed, description) VALUES
('Sick Leave', 12, 'Medical leave for illness'),
('Casual Leave', 15, 'Personal or casual leave'),
('Annual Leave', 20, 'Annual paid vacation'),
('Maternity Leave', 90, 'Maternity leave for female employees'),
('Paternity Leave', 7, 'Paternity leave for male employees');

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (email, password, role) VALUES
('admin@workzen.com', '$2a$10$rOZxJZ5lE3xKZj3xKZjOu.K4xKZj3xKZj3xKZj3xKZj3xKZj3xKZi', 'admin');

-- Insert sample departments
INSERT IGNORE INTO departments (name, description) VALUES
('IT', 'Information Technology Department'),
('HR', 'Human Resources Department'),
('Finance', 'Finance and Accounting Department'),
('Sales', 'Sales and Marketing Department'),
('Operations', 'Operations Management Department');

-- Insert system settings
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
('company_name', 'WorkZen HRMS', 'Company name displayed in system'),
('working_hours_per_day', '8', 'Standard working hours per day'),
('working_days_per_month', '22', 'Standard working days per month'),
('late_arrival_threshold', '15', 'Minutes after which arrival is considered late'),
('max_leave_days_per_request', '30', 'Maximum consecutive leave days allowed'),
('probation_period_months', '3', 'Probation period in months for new employees'),
('notice_period_days', '30', 'Notice period in days for resignation'),
('overtime_multiplier', '1.5', 'Overtime pay multiplier'),
('tax_rate', '10', 'Default tax rate percentage'),
('allow_self_attendance', 'true', 'Allow employees to mark their own attendance');

-- Insert sample holidays
INSERT IGNORE INTO holidays (name, date, description) VALUES
('New Year', '2024-01-01', 'New Year Day'),
('Republic Day', '2024-01-26', 'Republic Day of India'),
('Independence Day', '2024-08-15', 'Independence Day of India'),
('Gandhi Jayanti', '2024-10-02', 'Birthday of Mahatma Gandhi'),
('Diwali', '2024-11-01', 'Festival of Lights'),
('Christmas', '2024-12-25', 'Christmas Day');

-- Create indexes for better performance
CREATE INDEX idx_employee_status ON employees(status);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_leave_status ON leave_requests(status);
CREATE INDEX idx_payroll_month_year ON payroll(month, year);

-- Migration: Add GPS location fields to attendance table (if not exists)
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS check_in_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS check_in_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS check_in_location VARCHAR(500),
ADD COLUMN IF NOT EXISTS check_out_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS check_out_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS check_out_location VARCHAR(500);

-- Migration: Add attachment fields to leave_requests table (if not exists)
ALTER TABLE leave_requests
ADD COLUMN IF NOT EXISTS attachment_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255);
