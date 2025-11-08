# 🎯 Hackathon Demo Script

## Quick Demo Flow (5-7 minutes)

### 1️⃣ Introduction (30 seconds)
"We've built WorkZen HRMS - a complete HR Management System that integrates:
- Employee Management
- Attendance Tracking
- Leave Management
- Automated Payroll

Let me show you how they all work together."

---

### 2️⃣ Dashboard Overview (1 minute)
**Login as Admin** (`admin@workzen.com` / `admin123`)

Show:
- ✅ Total employees count
- ✅ Present today statistics
- ✅ Pending leave requests
- ✅ Monthly payroll summary
- ✅ Recent activity feed

**Key Point:** "This dashboard gives real-time overview of the entire organization."

---

### 3️⃣ Employee Management (1.5 minutes)
Navigate to Employees section

**Show:**
1. List of all employees with details
2. Click "Add Employee"
3. Fill form:
   - Name: "Sarah Williams"
   - Email: "sarah@workzen.com"
   - Department: "Sales"
   - Designation: "Sales Executive"
   - Basic Salary: 45000
   - Allowances: 8000
4. Save and show auto-generated employee code

**Key Point:** "Employee code is auto-generated, and we create their login account automatically."

---

### 4️⃣ Attendance Flow (1.5 minutes)
**Login as Employee** (`employee@workzen.com` / `emp123`)

Show:
1. Employee dashboard
2. Click "Mark Attendance"
3. Check-in (automatically captures time)
4. Show attendance history
5. Logout and login as HR to show attendance records

**Key Point:** "Attendance is tracked daily and will be used for payroll calculation."

---

### 5️⃣ Leave Management (1.5 minutes)
**As Employee:**
1. Click "Apply Leave"
2. Select leave type: "Sick Leave"
3. Date range: Tomorrow to day after
4. Reason: "Medical appointment"
5. Submit request

**Switch to HR role** (`hr@workzen.com` / `hr123`):
1. Show pending leaves
2. Click on the request
3. Approve the leave
4. Show it's now "Approved"

**Key Point:** "Complete workflow - employee applies, HR approves, and it's tracked for payroll."

---

### 6️⃣ Payroll Generation (2 minutes) - THE STAR FEATURE ⭐
**Login as Payroll Officer** (`payroll@workzen.com` / `payroll123`)

Show:
1. Navigate to Payroll
2. Click "Generate Payroll"
3. Select employee and month
4. Click Generate

**Show the calculation:**
```
Basic Salary: ₹60,000
Allowances: ₹15,000
─────────────────
Gross Salary: ₹75,000

Working Days: 30
Present Days: 28
Absent Days: 2
Leave Days: 0

Deductions: ₹5,000 (for 2 absent days)
─────────────────
Net Salary: ₹70,000
```

5. Show payslip with all details
6. Option to download PDF

**Key Point:** "This is the integration - attendance affects payroll automatically!"

---

### 7️⃣ Integration Flow (1 minute)
Draw on whiteboard or show diagram:

```
Employee → Attendance → Leave → Payroll → Dashboard
   ↓          ↓           ↓         ↓         ↓
Created → Check-in → Applied → Auto-calc → Stats
        → Working → Approved → Deductions → Updates
```

**Key Point:** "Every module feeds data to the next, creating a complete HR ecosystem."

---

## 🎨 Technical Highlights (if asked)

### Architecture:
- **Frontend:** Next.js 14 with TypeScript
- **Backend:** Next.js API Routes (Serverless)
- **Database:** MySQL with proper schema design
- **Auth:** JWT with role-based access
- **UI:** Tailwind CSS with Lucide icons

### Security:
- ✅ Password hashing (bcrypt)
- ✅ JWT token authentication
- ✅ Role-based permissions
- ✅ SQL injection prevention
- ✅ Input validation

### Smart Features:
- ✅ Auto-generated employee codes
- ✅ Automatic salary calculation
- ✅ Leave balance tracking
- ✅ Real-time dashboard updates
- ✅ Responsive design

---

## 🏆 Winning Points

1. **Complete Integration** - All modules work together seamlessly
2. **Real Business Logic** - Actual payroll calculations based on attendance
3. **Professional UI** - Clean, modern, and user-friendly
4. **Role-Based Access** - Different dashboards for different roles
5. **Production Ready** - Can be deployed immediately

---

## 📱 Role Credentials Quick Reference

| Role | Email | Password | Use Case |
|------|-------|----------|----------|
| Admin | admin@workzen.com | admin123 | Full access, overview |
| HR | hr@workzen.com | hr123 | Employee mgmt, approvals |
| Employee | employee@workzen.com | emp123 | Self-service |
| Payroll | payroll@workzen.com | payroll123 | Salary processing |

---

## 💡 Backup Demo Points (if time permits)

- Show mobile responsive design
- Demonstrate search/filter functionality
- Show department management
- Display analytics charts
- Explain database schema

---

## ⚠️ Things to Avoid

- ❌ Don't spend time on installation/setup
- ❌ Don't go into code details unless asked
- ❌ Don't show bugs or incomplete features
- ❌ Keep technical jargon minimal

---

## 🎤 Closing Statement

"WorkZen HRMS demonstrates how modern web technologies can solve real business problems. 
We've built a complete, integrated system that automates HR processes, saves time, and 
reduces errors. It's production-ready and can scale to handle thousands of employees. 
Thank you!"

---

**Time Management:**
- Stick to 7 minutes max
- Practice the flow 2-3 times
- Have backup slides ready
- Keep the energy high!

**Good Luck! 🚀**
