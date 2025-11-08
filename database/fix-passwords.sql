-- Quick Password Fix Script
-- Run this in phpMyAdmin SQL tab if you don't want to re-import the entire database
-- This will update the passwords for all 4 main users

-- Update Admin password
UPDATE users SET password = '$2a$10$9ETJJgnjSiostHgMQjAPheBi9ast.RTqkUe21tAx7folkvcs7RD1i' WHERE email = 'adminworkzen@gmail.com';

-- Update HR password
UPDATE users SET password = '$2a$10$tnNOyvjsjtdDATDURRHwcODrAd/SsSb3y0iHPq9VpdD0xKYqr99Hu' WHERE email = 'hrworkzen@gmail.com';

-- Update Payroll password
UPDATE users SET password = '$2a$10$Lsucj50VqTPwk0eeKuL7TObLGC5Lp3Uwr8sFvFFudDve3/U5hl9Ly' WHERE email = 'payrollworkzen@gmail.com';

-- Update Employee password
UPDATE users SET password = '$2a$10$DeJjOkhC8rQM.7Ptm7VAIuGS36xl.P6n97yZ2bjcBJj5AKgDenON2' WHERE email = 'employeeworkzen@gmail.com';

-- Update additional employee passwords
UPDATE users SET password = '$2a$10$DeJjOkhC8rQM.7Ptm7VAIuGS36xl.P6n97yZ2bjcBJj5AKgDenON2' WHERE email LIKE '%@workzen.com' AND role = 'employee';

-- Verify the update
SELECT id, email, role, SUBSTRING(password, 1, 20) as password_hash_preview FROM users WHERE email LIKE '%workzen%';
