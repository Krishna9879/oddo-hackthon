# 🏗️ WorkZen HRMS - Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                        │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Login   │  │Dashboard │  │Employees │  │ Payroll  │  │
│  │   Page   │  │   Page   │  │   Page   │  │   Page   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│       ↓              ↓              ↓              ↓       │
└───────┼──────────────┼──────────────┼──────────────┼───────┘
        │              │              │              │
        ↓              ↓              ↓              ↓
┌─────────────────────────────────────────────────────────────┐
│                  API LAYER (Next.js API Routes)             │
│                                                             │
│  /api/auth      /api/dashboard    /api/employees           │
│  /api/attendance  /api/leave      /api/payroll             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              JWT Authentication                      │  │
│  │           Role-Based Authorization                   │  │
│  └──────────────────────────────────────────────────────┘  │
└───────┼──────────────┼──────────────┼──────────────┼───────┘
        │              │              │              │
        ↓              ↓              ↓              ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (MySQL)                          │
│                                                             │
│  ┌────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐   │
│  │ users  │  │employees │  │attendance │  │ payroll  │   │
│  └────────┘  └──────────┘  └───────────┘  └──────────┘   │
│                                                             │
│  ┌───────────────┐  ┌────────────┐  ┌──────────────┐      │
│  │leave_requests │  │leave_types │  │ departments  │      │
│  └───────────────┘  └────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### 1. Employee Onboarding Flow
```
Admin/HR Creates Employee
        ↓
Auto-generate Employee Code (EMP001, EMP002...)
        ↓
Create User Account (email + password)
        ↓
Save to Database (users + employees tables)
        ↓
Employee Can Now Login
```

### 2. Attendance Flow
```
Employee Logs In
        ↓
Clicks "Check In" Button
        ↓
System Records: Date + Time + Employee ID
        ↓
Saves to attendance table
        ↓
Later: Clicks "Check Out"
        ↓
Calculates Working Hours
        ↓
Updates attendance record
        ↓
Dashboard Shows Updated Stats
```

### 3. Leave Management Flow
```
Employee Applies for Leave
        ↓
Selects: Leave Type + Date Range + Reason
        ↓
System Calculates Total Days
        ↓
Creates leave_request (status: Pending)
        ↓
HR Receives Notification (in pending list)
        ↓
HR Reviews Request
        ↓
HR Approves/Rejects
        ↓
Status Updated in Database
        ↓
Employee Sees Updated Status
```

### 4. Payroll Calculation Flow (THE MAGIC!)
```
Payroll Officer Selects Employee + Month
        ↓
System Fetches Employee Salary Details
        ↓
Queries Attendance for the Month
  ├─ Count Present Days
  ├─ Count Absent Days
  └─ Count Working Days
        ↓
Queries Approved Leaves for Month
        ↓
CALCULATION:
  ├─ Basic Salary: From employee record
  ├─ Allowances: From employee record
  ├─ Gross = Basic + Allowances
  ├─ Per Day Salary = Gross / Working Days
  ├─ Deductions = Per Day Salary × Absent Days
  │   (Leaves are PAID, absences are NOT)
  └─ Net Salary = Gross - Deductions
        ↓
Save to payroll table
        ↓
Generate Payslip
        ↓
Dashboard Updates Monthly Total
```

---

## Module Integration Map

```
     ┌────────────────┐
     │   EMPLOYEES    │ (Master Data)
     └───────┬────────┘
             │
    ┌────────┴────────┐
    │                 │
    ↓                 ↓
┌──────────┐    ┌────────────┐
│ATTENDANCE│    │   LEAVE    │
└─────┬────┘    └──────┬─────┘
      │                │
      │    Present     │  Approved
      │     Days       │   Leaves
      │                │
      └────────┬───────┘
               ↓
         ┌──────────┐
         │ PAYROLL  │ (Uses Both!)
         └─────┬────┘
               │
               ↓
         ┌──────────┐
         │DASHBOARD │ (Shows All)
         └──────────┘
```

---

## Role-Based Access Matrix

| Feature | Admin | HR | Employee | Payroll |
|---------|-------|----|---------:|---------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Add Employee | ✅ | ✅ | ❌ | ❌ |
| Edit Employee | ✅ | ✅ | ❌ | ❌ |
| View All Employees | ✅ | ✅ | ❌ | ✅ |
| Mark Own Attendance | ✅ | ✅ | ✅ | ✅ |
| View All Attendance | ✅ | ✅ | ❌ | ✅ |
| Apply Leave | ✅ | ✅ | ✅ | ✅ |
| Approve/Reject Leave | ✅ | ✅ | ❌ | ❌ |
| Generate Payroll | ✅ | ❌ | ❌ | ✅ |
| View All Payroll | ✅ | ❌ | ❌ | ✅ |
| View Own Payslip | ✅ | ✅ | ✅ | ✅ |

---

## Database Schema (Simplified)

### users
```
id (PK) | email | password | role | is_active
```

### employees
```
id (PK) | user_id (FK) | employee_code | first_name | last_name
department | designation | basic_salary | allowances | status
```

### attendance
```
id (PK) | employee_id (FK) | date | check_in | check_out
status | working_hours
```

### leave_requests
```
id (PK) | employee_id (FK) | leave_type_id (FK)
start_date | end_date | total_days | reason
status | approved_by (FK)
```

### payroll
```
id (PK) | employee_id (FK) | month | year
basic_salary | allowances | deductions
gross_salary | net_salary
working_days | present_days | absent_days | leave_days
status | generated_by (FK)
```

---

## Security Flow

```
1. User Enters Credentials
        ↓
2. API Verifies with Database
        ↓
3. Password Checked (bcrypt)
        ↓
4. If Valid: Generate JWT Token
        ↓
5. Send Token to Client
        ↓
6. Client Stores Token (localStorage)
        ↓
7. All API Requests Include Token
        ↓
8. API Validates Token + Role
        ↓
9. If Valid: Process Request
        ↓
10. If Invalid: Return 401 Unauthorized
```

---

## Tech Stack Layers

```
┌─────────────────────────────────────┐
│       PRESENTATION LAYER            │
│  Next.js 14 + TypeScript + Tailwind │
│  Lucide Icons + Framer Motion       │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│         BUSINESS LOGIC              │
│   Next.js API Routes (Serverless)   │
│   JWT Auth + Role Validation        │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│         DATA ACCESS LAYER           │
│   mysql2 (Connection Pool)          │
│   Parameterized Queries             │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│         DATA STORAGE                │
│   MySQL Database (workzen)          │
│   7 Tables + Relationships          │
└─────────────────────────────────────┘
```

---

## Payroll Calculation Example

### Scenario:
- Employee: John Doe
- Month: November 2024
- Basic Salary: ₹60,000
- Allowances: ₹15,000
- Working Days in Month: 30

### Data:
- Present Days: 26
- Absent Days: 4
- Approved Leaves: 2 (counted in present)

### Calculation:
```
Gross Salary = 60,000 + 15,000 = ₹75,000

Per Day Salary = 75,000 / 30 = ₹2,500

Deductions (for absences):
  Absent Days = 4 (leaves don't count as absent)
  Deduction = 2,500 × 4 = ₹10,000

Net Salary = 75,000 - 10,000 = ₹65,000
```

**This is the integration magic that judges love!**

---

## API Endpoints Structure

```
POST   /api/auth/login          → Login & get JWT
GET    /api/dashboard/stats     → Get dashboard numbers
GET    /api/employees           → List all employees
POST   /api/employees           → Create new employee
GET    /api/attendance          → Get attendance records
POST   /api/attendance          → Mark attendance
GET    /api/leave               → Get leave requests
POST   /api/leave               → Apply for leave
PUT    /api/leave               → Approve/reject leave
GET    /api/payroll             → Get payroll records
POST   /api/payroll             → Generate payroll
```

---

## File Structure Tree

```
workzen-hrms/
├── 📱 Frontend
│   ├── app/
│   │   ├── page.tsx              (Landing page)
│   │   ├── login/page.tsx        (Login UI)
│   │   ├── dashboard/page.tsx    (Main dashboard)
│   │   └── layout.tsx            (Root layout)
│   └── globals.css               (Tailwind styles)
│
├── 🔌 Backend API
│   └── app/api/
│       ├── auth/login/route.ts
│       ├── dashboard/stats/route.ts
│       ├── employees/route.ts
│       ├── attendance/route.ts
│       ├── leave/route.ts
│       └── payroll/route.ts
│
├── 🗄️ Database
│   ├── lib/db.ts                 (MySQL connection)
│   └── database/
│       ├── schema.sql            (Table structure)
│       └── sample-data.sql       (Demo data)
│
├── 🔐 Authentication
│   └── lib/auth.ts               (JWT utilities)
│
└── 📝 Configuration
    ├── .env.local                (Environment vars)
    ├── package.json              (Dependencies)
    ├── tailwind.config.js        (UI config)
    └── tsconfig.json             (TypeScript config)
```

---

## Deployment Architecture

```
Development:
  localhost:3000 (Next.js dev server)
  localhost:3306 (MySQL via XAMPP)

Production Options:
  Frontend + API: Vercel / Netlify
  Database: AWS RDS / DigitalOcean / PlanetScale
  Alternative: VPS (Heroku, Railway, Render)
```

---

## This Is What Makes It Special! 🌟

1. **Real Integration** - Not just separate modules
2. **Actual Calculations** - Attendance affects salary
3. **Complete Workflow** - End-to-end business process
4. **Professional Code** - TypeScript, clean architecture
5. **Production Ready** - Can deploy immediately

---

**Use this document to explain your architecture during the presentation!**
