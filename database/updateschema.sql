-- WorkZen HRMS - Schema Updates
-- Run this AFTER the main schema.sql
-- This file contains ALTER TABLE statements for new features
-- Note: If columns already exist, these statements will fail gracefully

-- ========================================
-- PAYROLL SYSTEM UPDATES
-- ========================================

-- Add payroll lock and payrun tracking
-- Note: Run these one by one. If a column exists, skip that line manually.
ALTER TABLE payroll ADD COLUMN payrun_id INT AFTER id;
ALTER TABLE payroll ADD COLUMN is_locked BOOLEAN DEFAULT FALSE AFTER status;
ALTER TABLE payroll ADD COLUMN locked_at TIMESTAMP NULL AFTER is_locked;
ALTER TABLE payroll ADD COLUMN locked_by INT AFTER locked_at;
ALTER TABLE payroll ADD COLUMN bonus DECIMAL(10, 2) DEFAULT 0.00 AFTER allowances;
ALTER TABLE payroll ADD COLUMN penalty DECIMAL(10, 2) DEFAULT 0.00 AFTER deductions;
ALTER TABLE payroll ADD COLUMN notes TEXT AFTER penalty;

-- Add foreign key constraint (only if it doesn't exist)
-- ALTER TABLE payroll ADD CONSTRAINT fk_payroll_locked_by FOREIGN KEY (locked_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create Payrun table for batch payroll processing
CREATE TABLE IF NOT EXISTS payruns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    month INT NOT NULL,
    year INT NOT NULL,
    status ENUM('Draft', 'Pending Approval', 'Approved', 'Locked', 'Rejected') DEFAULT 'Draft',
    total_employees INT DEFAULT 0,
    total_gross_salary DECIMAL(12, 2) DEFAULT 0.00,
    total_deductions DECIMAL(12, 2) DEFAULT 0.00,
    total_net_salary DECIMAL(12, 2) DEFAULT 0.00,
    generated_by INT,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    UNIQUE KEY unique_payrun_month_year (month, year)
);

-- Add payslip generation tracking
ALTER TABLE payroll ADD COLUMN payslip_generated BOOLEAN DEFAULT FALSE AFTER is_locked;
ALTER TABLE payroll ADD COLUMN payslip_path VARCHAR(500) AFTER payslip_generated;
ALTER TABLE payroll ADD COLUMN payslip_sent_at TIMESTAMP NULL AFTER payslip_path;

-- ========================================
-- EMAIL NOTIFICATIONS
-- ========================================

-- Add email sent tracking to notifications
ALTER TABLE notifications ADD COLUMN email_sent BOOLEAN DEFAULT FALSE AFTER is_read;
ALTER TABLE notifications ADD COLUMN email_sent_at TIMESTAMP NULL AFTER email_sent;

-- Add email preferences for users (email column already exists in schema)
ALTER TABLE users ADD COLUMN email_notifications_enabled BOOLEAN DEFAULT TRUE AFTER is_active;

-- ========================================
-- LEAVE APPROVAL FLOW UPDATES
-- ========================================

-- Add approval workflow for HR and Payroll Officer leaves
-- HR and Payroll Officer leave requests need admin approval
-- This is handled in application logic, but we add a note field
ALTER TABLE leave_requests ADD COLUMN requires_admin_approval BOOLEAN DEFAULT FALSE AFTER status;
ALTER TABLE leave_requests ADD COLUMN admin_notes TEXT AFTER rejection_reason;

-- ========================================
-- ATTENDANCE FOR HR AND PAYROLL OFFICER
-- ========================================

-- No schema changes needed - HR and Payroll Officer can use the same attendance table
-- Application logic will handle role-based access

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Create indexes (will fail if they already exist, that's okay)
CREATE INDEX idx_payroll_payrun_id ON payroll(payrun_id);
CREATE INDEX idx_payroll_month_year_status ON payroll(month, year, status);
CREATE INDEX idx_payrun_month_year ON payruns(month, year);
CREATE INDEX idx_payrun_status ON payruns(status);
CREATE INDEX idx_notifications_email_sent ON notifications(email_sent);
CREATE INDEX idx_leave_requires_admin ON leave_requests(requires_admin_approval);

-- ========================================
-- END OF SCHEMA UPDATES
-- ========================================
