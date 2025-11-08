# WorkZen HRMS - Database Files Guide

## 📁 File Overview

This directory contains the database schema and data files for the WorkZen HRMS system.

### Files in Order of Execution:

1. **`schema.sql`** - Main database schema (run first)
2. **`sample-data.sql`** - Sample/test data (run second)
3. **`updateschema.sql`** - Schema updates for new features (run third)
4. **`migrate_data.sql`** - Optional data migrations (run fourth, if needed)

---

## 📋 File Details

### 1. `schema.sql` - Main Schema
**Purpose**: Creates the complete database structure from scratch

**Contains**:
- ✅ All table definitions (users, employees, attendance, leave_requests, payroll, etc.)
- ✅ Foreign key constraints
- ✅ Initial indexes
- ✅ Default data (leave types, admin user, departments, system settings, holidays)
- ✅ Some ALTER TABLE statements for additional fields

**When to use**: 
- Fresh database setup
- Complete database reset

**Execution**: 
```sql
mysql -u root -p workzen < database/schema.sql
```

---

### 2. `sample-data.sql` - Sample Data
**Purpose**: Populates the database with test/sample data for development and testing

**Contains**:
- ✅ 4 default users (admin, hr, payroll_officer, employee) + 5 additional employees
- ✅ 15 employee records
- ✅ Attendance records (today and yesterday)
- ✅ Leave requests (pending, approved, rejected)
- ✅ Payroll records for current month
- ✅ Notifications
- ✅ Performance reviews
- ✅ Audit logs
- ✅ Employee documents
- ✅ Password change requests

**Passwords** (for testing):
- Admin: `admin@1234`
- HR: `hr@1234`
- Payroll: `payroll@1234`
- Employee: `employee@1234`

**When to use**: 
- Development environment
- Testing new features
- Demo purposes

**Execution**: 
```sql
mysql -u root -p workzen < database/sample-data.sql
```

**Note**: This file is compatible with `updateschema.sql` - new columns will get default values automatically.

---

### 3. `updateschema.sql` - Schema Updates
**Purpose**: Adds new columns and tables for enhanced features (payruns, email tracking, etc.)

**Contains**:
- ✅ **Payroll enhancements**:
  - `payrun_id` - Links payroll to payrun batches
  - `is_locked`, `locked_at`, `locked_by` - Payroll locking mechanism
  - `bonus`, `penalty` - Additional payroll fields
  - `payslip_generated`, `payslip_path`, `payslip_sent_at` - Payslip tracking
- ✅ **New `payruns` table** - Batch payroll processing
- ✅ **Email tracking**:
  - `email_sent`, `email_sent_at` in notifications table
  - `email_notifications_enabled` in users table
- ✅ **Leave approval**:
  - `requires_admin_approval` in leave_requests
  - `admin_notes` in leave_requests
- ✅ Performance indexes

**Important Notes**:
- ⚠️ **Schema-only updates** - Does NOT modify existing data values
- ✅ New columns have DEFAULT values, so existing rows get defaults automatically
- ⚠️ Run this AFTER `schema.sql` and `sample-data.sql`
- ⚠️ If columns already exist, statements will fail (run manually one by one)

**When to use**: 
- Updating existing database with new features
- Adding payroll batch processing
- Adding email notification tracking

**Execution**: 
```sql
mysql -u root -p workzen < database/updateschema.sql
```

**Default Values Applied**:
- `is_locked = FALSE` for existing payroll records
- `email_notifications_enabled = TRUE` for existing users
- `payslip_generated = FALSE` for existing payroll records
- `email_sent = FALSE` for existing notifications
- `requires_admin_approval = FALSE` for existing leave requests

---

### 4. `migrate_data.sql` - Data Migrations (Optional)
**Purpose**: Updates existing data values based on business logic

**Contains**:
- ✅ Sets `requires_admin_approval = TRUE` for existing HR/Payroll leave requests
- ✅ Optional migrations for payroll locking
- ✅ Optional migrations for notification email status

**When to use**: 
- After running `updateschema.sql`
- When you need to set specific values for existing records
- Business logic requires data updates

**Execution**: 
```sql
mysql -u root -p workzen < database/migrate_data.sql
```

---

## 🔄 Complete Setup Process

### For Fresh Database:
```bash
# 1. Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS workzen;"

# 2. Run main schema
mysql -u root -p workzen < database/schema.sql

# 3. Add sample data (optional, for testing)
mysql -u root -p workzen < database/sample-data.sql

# 4. Apply schema updates
mysql -u root -p workzen < database/updateschema.sql

# 5. Run data migrations (optional)
mysql -u root -p workzen < database/migrate_data.sql
```

### For Existing Database (with data):
```bash
# 1. Backup your database first!
mysqldump -u root -p workzen > backup.sql

# 2. Apply schema updates
mysql -u root -p workzen < database/updateschema.sql

# 3. Run data migrations (if needed)
mysql -u root -p workzen < database/migrate_data.sql
```

---

## ⚠️ Important Notes

### Compatibility
- ✅ `sample-data.sql` is **fully compatible** with `updateschema.sql`
- ✅ New columns added by `updateschema.sql` will get default values for existing data
- ✅ No need to modify `sample-data.sql` after running `updateschema.sql`

### Data vs Schema
- **`schema.sql`** + **`sample-data.sql`** = Structure + Initial Data
- **`updateschema.sql`** = Structure changes only (new columns/tables)
- **`migrate_data.sql`** = Data value updates (optional)

### Default Values
When `updateschema.sql` adds columns with DEFAULT values:
- ✅ Existing rows automatically get the default value
- ✅ New rows will also get the default value
- ⚠️ This is MySQL behavior, not a data update operation

---

## 📊 Schema Changes Summary

### Tables Modified by `updateschema.sql`:
1. **`payroll`** - Added 9 new columns
2. **`notifications`** - Added 2 new columns
3. **`users`** - Added 1 new column
4. **`leave_requests`** - Added 2 new columns

### New Tables Created:
1. **`payruns`** - Batch payroll processing

### Indexes Added:
- 6 new performance indexes

---

## 🧪 Testing After Updates

After running `updateschema.sql`, verify:

```sql
-- Check new columns exist
DESCRIBE payroll;
DESCRIBE notifications;
DESCRIBE users;
DESCRIBE leave_requests;

-- Check new table exists
SHOW TABLES LIKE 'payruns';

-- Check default values were applied
SELECT is_locked, payslip_generated FROM payroll LIMIT 5;
SELECT email_notifications_enabled FROM users LIMIT 5;
SELECT email_sent FROM notifications LIMIT 5;
SELECT requires_admin_approval FROM leave_requests LIMIT 5;
```

---

## 🔗 Related Files

- **Backend API**: Uses these tables in `app/api/` routes
- **Frontend**: Displays data from these tables
- **Email Service**: Uses `email_sent` tracking in `lib/email.ts`

---

## 📝 Version History

- **v1.0** - Initial schema (`schema.sql`)
- **v1.1** - Sample data added (`sample-data.sql`)
- **v2.0** - Schema updates for payroll batch processing, email tracking (`updateschema.sql`)

---

## ❓ Troubleshooting

### Error: "Duplicate column name"
- **Cause**: Column already exists in table
- **Solution**: Comment out that ALTER TABLE line in `updateschema.sql` and continue

### Error: "Table doesn't exist"
- **Cause**: `schema.sql` wasn't run first
- **Solution**: Run `schema.sql` before `updateschema.sql`

### Default values not showing
- **Cause**: MySQL version might not support automatic defaults
- **Solution**: Run `migrate_data.sql` to explicitly set values

---

**Last Updated**: 2024
**Maintained By**: WorkZen HRMS Development Team

