-- WorkZen HRMS - Comprehensive Sample Data
-- Run this AFTER the main schema.sql
-- Password for all users: admin@1234, hr@1234, payroll@1234, employee@1234
-- Bcrypt hashes generated with bcrypt.hash(password, 10)

-- ========================================
-- DEFAULT USERS FOR ALL 4 ROLES
-- ========================================

-- Admin User (Password: admin@1234)
INSERT IGNORE INTO users (email, password, role, is_active) VALUES
('adminworkzen@gmail.com', '$2a$10$9ETJJgnjSiostHgMQjAPheBi9ast.RTqkUe21tAx7folkvcs7RD1i', 'admin', TRUE);

-- HR User (Password: hr@1234)
INSERT IGNORE INTO users (email, password, role, is_active) VALUES
('hrworkzen@gmail.com', '$2a$10$tnNOyvjsjtdDATDURRHwcODrAd/SsSb3y0iHPq9VpdD0xKYqr99Hu', 'hr', TRUE);

-- Payroll Officer User (Password: payroll@1234)
INSERT IGNORE INTO users (email, password, role, is_active) VALUES
('payrollworkzen@gmail.com', '$2a$10$Lsucj50VqTPwk0eeKuL7TObLGC5Lp3Uwr8sFvFFudDve3/U5hl9Ly', 'payroll_officer', TRUE);

-- Employee User (Password: employee@1234)
INSERT IGNORE INTO users (email, password, role, is_active) VALUES
('employeeworkzen@gmail.com', '$2a$10$DeJjOkhC8rQM.7Ptm7VAIuGS36xl.P6n97yZ2bjcBJj5AKgDenON2', 'employee', TRUE);

-- ========================================
-- ADDITIONAL EMPLOYEE USERS
-- ========================================
-- Password for all: employee@1234

INSERT IGNORE INTO users (email, password, role, is_active) VALUES
('john.doe@workzen.com', '$2a$10$DeJjOkhC8rQM.7Ptm7VAIuGS36xl.P6n97yZ2bjcBJj5AKgDenON2', 'employee', TRUE),
('jane.smith@workzen.com', '$2a$10$DeJjOkhC8rQM.7Ptm7VAIuGS36xl.P6n97yZ2bjcBJj5AKgDenON2', 'employee', TRUE),
('mike.johnson@workzen.com', '$2a$10$DeJjOkhC8rQM.7Ptm7VAIuGS36xl.P6n97yZ2bjcBJj5AKgDenON2', 'employee', TRUE),
('sarah.williams@workzen.com', '$2a$10$DeJjOkhC8rQM.7Ptm7VAIuGS36xl.P6n97yZ2bjcBJj5AKgDenON2', 'employee', TRUE),
('robert.brown@workzen.com', '$2a$10$DeJjOkhC8rQM.7Ptm7VAIuGS36xl.P6n97yZ2bjcBJj5AKgDenON2', 'employee', TRUE);

-- ========================================
-- EMPLOYEE RECORDS
-- ========================================

INSERT IGNORE INTO employees (user_id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, department, designation, join_date, basic_salary, allowances, status) VALUES
-- Main 4 users
(1, 'EMP001', 'Admin', 'WorkZen', 'adminworkzen@gmail.com', '+91 9999999999', '1985-01-15', 'Male', 'IT', 'System Administrator', '2020-01-01', 100000.00, 25000.00, 'active'),
(2, 'EMP002', 'HR', 'Manager', 'hrworkzen@gmail.com', '+91 9999999998', '1988-03-20', 'Female', 'HR', 'HR Manager', '2020-06-15', 75000.00, 18000.00, 'active'),
(3, 'EMP003', 'Payroll', 'Officer', 'payrollworkzen@gmail.com', '+91 9999999997', '1990-07-10', 'Male', 'Finance', 'Payroll Officer', '2021-01-10', 70000.00, 15000.00, 'active'),
(4, 'EMP004', 'John', 'Employee', 'employeeworkzen@gmail.com', '+91 9999999996', '1995-11-25', 'Male', 'IT', 'Junior Developer', '2023-01-15', 50000.00, 10000.00, 'active'),

-- Additional IT Department
(5, 'EMP005', 'John', 'Doe', 'john.doe@workzen.com', '+91 9876543210', '1990-05-15', 'Male', 'IT', 'Senior Developer', '2021-03-10', 80000.00, 20000.00, 'active'),
(6, 'EMP006', 'Jane', 'Smith', 'jane.smith@workzen.com', '+91 9876543211', '1992-08-20', 'Female', 'IT', 'Full Stack Developer', '2021-06-15', 75000.00, 18000.00, 'active'),
(7, 'EMP007', 'Mike', 'Johnson', 'mike.johnson@workzen.com', '+91 9876543212', '1988-12-05', 'Male', 'IT', 'DevOps Engineer', '2020-09-01', 85000.00, 21000.00, 'active'),

-- Finance Department
(8, 'EMP008', 'Sarah', 'Williams', 'sarah.williams@workzen.com', '+91 9876543213', '1991-04-18', 'Female', 'Finance', 'Accountant', '2021-02-20', 60000.00, 12000.00, 'active'),
(9, 'EMP009', 'Robert', 'Brown', 'robert.brown@workzen.com', '+91 9876543214', '1987-09-30', 'Male', 'Finance', 'Financial Analyst', '2020-11-05', 70000.00, 15000.00, 'active'),

-- Sales Department
(10, 'EMP010', 'Emily', 'Davis', 'emily.davis@workzen.com', '+91 9876543215', '1993-06-12', 'Female', 'Sales', 'Sales Manager', '2021-04-01', 65000.00, 15000.00, 'active'),
(11, 'EMP011', 'David', 'Wilson', 'david.wilson@workzen.com', '+91 9876543216', '1989-02-28', 'Male', 'Sales', 'Sales Executive', '2022-01-15', 55000.00, 11000.00, 'active'),
(12, 'EMP012', 'Lisa', 'Anderson', 'lisa.anderson@workzen.com', '+91 9876543217', '1994-10-05', 'Female', 'Sales', 'Sales Executive', '2022-03-20', 55000.00, 11000.00, 'active'),

-- Operations Department
(13, 'EMP013', 'James', 'Taylor', 'james.taylor@workzen.com', '+91 9876543218', '1986-07-22', 'Male', 'Operations', 'Operations Manager', '2020-08-10', 75000.00, 18000.00, 'active'),
(14, 'EMP014', 'Maria', 'Garcia', 'maria.garcia@workzen.com', '+91 9876543219', '1992-03-15', 'Female', 'Operations', 'Operations Executive', '2021-09-05', 58000.00, 12000.00, 'active'),

-- HR Department
(15, 'EMP015', 'Daniel', 'Martinez', 'daniel.martinez@workzen.com', '+91 9876543220', '1990-12-08', 'Male', 'HR', 'HR Executive', '2022-02-01', 52000.00, 10000.00, 'active');

-- ========================================
-- ATTENDANCE RECORDS (Current Month)
-- ========================================
-- Note: GPS coordinates are sample data (Mumbai, India area)
-- Format: check_in_latitude, check_in_longitude, check_in_location, check_out_latitude, check_out_longitude, check_out_location

INSERT IGNORE INTO attendance (employee_id, date, check_in, check_out, check_in_latitude, check_in_longitude, check_in_location, check_out_latitude, check_out_longitude, check_out_location, status, working_hours) VALUES
-- Today's attendance
(1, CURDATE(), '09:00:00', '18:00:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 3', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 3', 'Present', 9.00),
(2, CURDATE(), '09:15:00', '18:15:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 'Present', 9.00),
(3, CURDATE(), '09:05:00', '18:05:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 1', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 1', 'Present', 9.00),
(4, CURDATE(), '09:30:00', '18:30:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 3', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 3', 'Late', 9.00),
(5, CURDATE(), '09:00:00', '18:00:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 4', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 4', 'Present', 9.00),
(6, CURDATE(), '09:10:00', '18:10:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 4', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 4', 'Present', 9.00),
(7, CURDATE(), '08:55:00', '17:55:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 4', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 4', 'Present', 9.00),
(8, CURDATE(), '09:00:00', '18:00:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 'Present', 9.00),
(9, CURDATE(), '09:20:00', '18:20:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 'Late', 9.00),
(10, CURDATE(), '09:00:00', '18:00:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 3', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 3', 'Present', 9.00),
(11, CURDATE(), '09:05:00', '18:05:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 3', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 3', 'Present', 9.00),
(12, CURDATE(), '09:00:00', '18:00:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 3', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 3', 'Present', 9.00),
(13, CURDATE(), '09:00:00', '18:00:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 'Present', 9.00),
(14, CURDATE(), '09:15:00', '18:15:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 'Present', 9.00),
(15, CURDATE(), '09:00:00', '18:00:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 'Present', 9.00),

-- Yesterday's attendance
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '18:00:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 3', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 3', 'Present', 9.00),
(2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:10:00', '18:10:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 'Present', 9.00),
(3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '18:00:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 1', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 1', 'Present', 9.00),
(4, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '18:00:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 3', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 3', 'Present', 9.00),
(5, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:05:00', '18:05:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 4', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 4', 'Present', 9.00),
(6, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '18:00:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 4', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 4', 'Present', 9.00),
(7, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '18:00:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 4', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 4', 'Present', 9.00),
(8, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:30:00', '18:30:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 'Late', 9.00),
(9, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '18:00:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 'Present', 9.00),
(10, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '18:00:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 3', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 3', 'Present', 9.00),
(11, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '18:00:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 3', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 3', 'Present', 9.00),
(12, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '18:00:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 3', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 3', 'Present', 9.00),
(13, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '18:00:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 'Present', 9.00),
(14, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '18:00:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 'Present', 9.00),
(15, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '18:00:00', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 19.076090, 72.877426, 'Mumbai Office - Building A, Floor 2', 'Present', 9.00);

-- ========================================
-- LEAVE REQUESTS
-- ========================================
-- Note: Some leave requests include sample attachment files for demonstration
-- Format: employee_id, leave_type_id, start_date, end_date, total_days, reason, attachment_path, attachment_name, status, approved_by

INSERT IGNORE INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, attachment_path, attachment_name, status, approved_by) VALUES
-- Pending leave requests (some with attachments)
(4, 1, DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 3, 'Medical checkup appointment', '/uploads/leave-attachments/doctor_note_emp4.pdf', 'Doctor_Note_Medical_Checkup.pdf', 'Pending', NULL),
(6, 2, DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 11 DAY), 2, 'Family function', NULL, NULL, 'Pending', NULL),
(11, 1, DATE_ADD(CURDATE(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 4 DAY), 2, 'Feeling unwell', '/uploads/leave-attachments/medical_certificate_emp11.pdf', 'Medical_Certificate.pdf', 'Pending', NULL),

-- Approved leave requests (some with attachments)
(5, 3, DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL 5 DAY), 6, 'Annual vacation', NULL, NULL, 'Approved', 2),
(8, 2, DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_SUB(CURDATE(), INTERVAL 14 DAY), 2, 'Personal work', NULL, NULL, 'Approved', 2),
(12, 1, DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 18 DAY), 3, 'Medical treatment', '/uploads/leave-attachments/hospital_discharge_emp12.pdf', 'Hospital_Discharge_Summary.pdf', 'Approved', 2),

-- Rejected leave requests
(7, 2, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(CURDATE(), INTERVAL 3 DAY), 3, 'Personal reasons', NULL, NULL, 'Rejected', 2);

-- ========================================
-- PAYROLL RECORDS (Current Month)
-- ========================================

INSERT IGNORE INTO payroll (employee_id, month, year, basic_salary, allowances, deductions, gross_salary, net_salary, working_days, present_days, absent_days, leave_days, status, generated_by) VALUES
-- Current month payroll (processed)
(1, MONTH(CURDATE()), YEAR(CURDATE()), 100000.00, 25000.00, 12500.00, 125000.00, 112500.00, 22, 22, 0, 0, 'Processed', 3),
(2, MONTH(CURDATE()), YEAR(CURDATE()), 75000.00, 18000.00, 9300.00, 93000.00, 83700.00, 22, 22, 0, 0, 'Processed', 3),
(3, MONTH(CURDATE()), YEAR(CURDATE()), 70000.00, 15000.00, 8500.00, 85000.00, 76500.00, 22, 22, 0, 0, 'Processed', 3),
(4, MONTH(CURDATE()), YEAR(CURDATE()), 50000.00, 10000.00, 6000.00, 60000.00, 54000.00, 22, 21, 1, 0, 'Processed', 3),
(5, MONTH(CURDATE()), YEAR(CURDATE()), 80000.00, 20000.00, 10000.00, 100000.00, 90000.00, 22, 22, 0, 0, 'Processed', 3),
(6, MONTH(CURDATE()), YEAR(CURDATE()), 75000.00, 18000.00, 9300.00, 93000.00, 83700.00, 22, 22, 0, 0, 'Processed', 3),
(7, MONTH(CURDATE()), YEAR(CURDATE()), 85000.00, 21000.00, 10600.00, 106000.00, 95400.00, 22, 22, 0, 0, 'Processed', 3),
(8, MONTH(CURDATE()), YEAR(CURDATE()), 60000.00, 12000.00, 7200.00, 72000.00, 64800.00, 22, 22, 0, 0, 'Processed', 3),
(9, MONTH(CURDATE()), YEAR(CURDATE()), 70000.00, 15000.00, 8500.00, 85000.00, 76500.00, 22, 22, 0, 0, 'Processed', 3),
(10, MONTH(CURDATE()), YEAR(CURDATE()), 65000.00, 15000.00, 8000.00, 80000.00, 72000.00, 22, 22, 0, 0, 'Processed', 3),
(11, MONTH(CURDATE()), YEAR(CURDATE()), 55000.00, 11000.00, 6600.00, 66000.00, 59400.00, 22, 22, 0, 0, 'Processed', 3),
(12, MONTH(CURDATE()), YEAR(CURDATE()), 55000.00, 11000.00, 6600.00, 66000.00, 59400.00, 22, 22, 0, 0, 'Processed', 3),
(13, MONTH(CURDATE()), YEAR(CURDATE()), 75000.00, 18000.00, 9300.00, 93000.00, 83700.00, 22, 22, 0, 0, 'Processed', 3),
(14, MONTH(CURDATE()), YEAR(CURDATE()), 58000.00, 12000.00, 7000.00, 70000.00, 63000.00, 22, 22, 0, 0, 'Processed', 3),
(15, MONTH(CURDATE()), YEAR(CURDATE()), 52000.00, 10000.00, 6200.00, 62000.00, 55800.00, 22, 22, 0, 0, 'Processed', 3);

-- ========================================
-- NOTIFICATIONS
-- ========================================

INSERT IGNORE INTO notifications (user_id, title, message, type, is_read) VALUES
(1, 'System Update', 'New features have been added to the HRMS system', 'info', FALSE),
(2, 'Leave Approval Pending', 'You have 3 leave requests waiting for approval', 'warning', FALSE),
(3, 'Payroll Processing', 'Monthly payroll has been processed successfully', 'success', TRUE),
(4, 'Welcome to WorkZen', 'Your account has been created successfully', 'success', TRUE),
(2, 'New Employee Joined', 'Daniel Martinez has joined the HR department', 'info', FALSE);

-- ========================================
-- PERFORMANCE REVIEWS
-- ========================================

INSERT IGNORE INTO performance_reviews (employee_id, reviewer_id, review_period_start, review_period_end, rating, strengths, weaknesses, goals, status) VALUES
(5, 1, DATE_SUB(CURDATE(), INTERVAL 6 MONTH), DATE_SUB(CURDATE(), INTERVAL 1 DAY), 4.5, 'Excellent technical skills, great team player', 'Needs improvement in time management', 'Lead a major project in Q2', 'submitted'),
(6, 1, DATE_SUB(CURDATE(), INTERVAL 6 MONTH), DATE_SUB(CURDATE(), INTERVAL 1 DAY), 4.2, 'Very creative and innovative', 'Communication with clients needs work', 'Improve client presentation skills', 'submitted'),
(8, 3, DATE_SUB(CURDATE(), INTERVAL 6 MONTH), DATE_SUB(CURDATE(), INTERVAL 1 DAY), 4.0, 'Detail-oriented and thorough', 'Can be slow in decision making', 'Speed up monthly closing process', 'submitted');

-- ========================================
-- AUDIT LOGS
-- ========================================

INSERT IGNORE INTO audit_logs (user_id, action, entity, entity_id, details, ip_address) VALUES
(1, 'LOGIN', 'user', 1, '{"timestamp": "2024-01-08 09:00:00"}', '192.168.1.100'),
(2, 'APPROVE_LEAVE', 'leave_request', 4, '{"employee_id": 5, "days": 6}', '192.168.1.101'),
(3, 'PROCESS_PAYROLL', 'payroll', 1, '{"month": "January", "employees": 15}', '192.168.1.102'),
(1, 'CREATE_EMPLOYEE', 'employee', 15, '{"name": "Daniel Martinez"}', '192.168.1.100'),
(2, 'UPDATE_EMPLOYEE', 'employee', 5, '{"field": "designation", "value": "Senior Developer"}', '192.168.1.101');

-- ========================================
-- EMPLOYEE DOCUMENTS
-- ========================================

INSERT IGNORE INTO employee_documents (employee_id, document_type, document_name, file_path, file_size, uploaded_by, is_verified, verified_by) VALUES
(5, 'resume', 'John_Doe_Resume.pdf', '/documents/employees/5/resume.pdf', 245678, 2, TRUE, 2),
(5, 'id_proof', 'Aadhar_Card.pdf', '/documents/employees/5/aadhar.pdf', 156789, 2, TRUE, 2),
(6, 'resume', 'Jane_Smith_Resume.pdf', '/documents/employees/6/resume.pdf', 234567, 2, TRUE, 2),
(8, 'certificate', 'CA_Certificate.pdf', '/documents/employees/8/ca_cert.pdf', 345678, 2, TRUE, 2);

-- ========================================
-- PASSWORD CHANGE REQUESTS
-- ========================================

INSERT IGNORE INTO password_change_requests (employee_id, reason, status, approved_by) VALUES
(4, 'Forgot password, need to reset', 'pending', NULL),
(11, 'Security concern - want to update password', 'approved', 2);

-- ========================================
-- END OF SAMPLE DATA
-- ========================================
