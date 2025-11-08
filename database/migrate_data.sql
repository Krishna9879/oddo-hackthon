-- WorkZen HRMS - Data Migration Script
-- Run this AFTER updateschema.sql
-- This file contains UPDATE statements to set values for existing records

-- ========================================
-- LEAVE REQUESTS DATA MIGRATION
-- ========================================

-- Set requires_admin_approval = TRUE for existing leave requests from HR and Payroll Officer roles
-- Only for pending/approved requests that might need admin review
UPDATE leave_requests lr
INNER JOIN employees e ON lr.employee_id = e.id
INNER JOIN users u ON e.user_id = u.id
SET lr.requires_admin_approval = TRUE
WHERE u.role IN ('hr', 'payroll_officer')
  AND lr.status IN ('Pending', 'Approved')
  AND lr.requires_admin_approval = FALSE;

-- ========================================
-- PAYROLL DATA MIGRATION (Optional)
-- ========================================

-- If you have existing payroll records that should be locked, uncomment and modify:
-- UPDATE payroll 
-- SET is_locked = TRUE, 
--     locked_at = NOW(),
--     locked_by = 1  -- Replace with actual admin user ID
-- WHERE status = 'Paid'
--   AND is_locked = FALSE;

-- ========================================
-- NOTIFICATIONS DATA MIGRATION (Optional)
-- ========================================

-- If you want to mark old notifications as email_sent = TRUE (if they were already sent),
-- uncomment and modify based on your business logic:
-- UPDATE notifications
-- SET email_sent = TRUE,
--     email_sent_at = created_at
-- WHERE created_at < '2024-01-01'  -- Example: mark old notifications as sent
--   AND email_sent = FALSE;

-- ========================================
-- END OF DATA MIGRATION
-- ========================================

