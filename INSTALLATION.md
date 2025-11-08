# 🚀 WorkZen HRMS - Quick Start Guide

## Step-by-Step Installation

### Step 1: Install Node.js Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required packages (Next.js, React, MySQL driver, JWT, Tailwind CSS, etc.)

**Wait for the installation to complete before proceeding!**

---

### Step 2: Setup MySQL Database

1. **Start XAMPP**
   - Open XAMPP Control Panel
   - Click "Start" for Apache
   - Click "Start" for MySQL
   - Wait until both show "Running" status

2. **Create Database**
   - Open your browser
   - Go to: `http://localhost/phpmyadmin`
   - Click "New" in the left sidebar
   - Database name: `workzen`
   - Collation: `utf8mb4_general_ci`
   - Click "Create"

3. **Import Schema**
   - Click on `workzen` database in the left sidebar
   - Click "SQL" tab at the top
   - Open the file: `database/schema.sql`
   - Copy ALL the content
   - Paste it into the SQL query box
   - Click "Go" button at the bottom
   - You should see "Query OK" messages

---

### Step 3: Verify Environment Variables

The `.env.local` file is already configured. Just verify:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=workzen
```

**If your MySQL has a password:**
- Open `.env.local`
- Update `DB_PASSWORD=your_mysql_password`

---

### Step 4: Run the Application

```bash
npm run dev
```

**Wait for:**
```
✓ Ready in Xms
○ Compiling / ...
✓ Compiled / in Xms
```

---

### Step 5: Open in Browser

Go to: **http://localhost:3000**

---

## 🎯 First Login

### Admin Credentials
- Email: `admin@workzen.com`
- Password: `admin123`

**Note:** The admin account is automatically created by the schema.sql

---

## ✅ Verification Checklist

- [ ] Node modules installed (`node_modules` folder exists)
- [ ] MySQL running in XAMPP
- [ ] Database `workzen` created
- [ ] Schema imported (10+ tables visible in phpMyAdmin)
- [ ] `.env.local` file has correct credentials
- [ ] `npm run dev` running without errors
- [ ] Can access http://localhost:3000
- [ ] Can login with admin credentials

---

## 🐛 Troubleshooting

### Error: "Cannot connect to MySQL"
- Check if MySQL is running in XAMPP
- Verify database name is `workzen`
- Check DB credentials in `.env.local`

### Error: "Port 3000 already in use"
- Close other Next.js apps
- Or run: `npm run dev -- -p 3001` (uses port 3001)

### Error: "Module not found"
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

### Database tables not created
- Re-run the schema.sql in phpMyAdmin
- Check SQL tab for error messages

---

## 📊 Database Quick Check

In phpMyAdmin, you should see these tables:
- users
- employees
- attendance
- leave_types
- leave_requests
- payroll
- departments

---

## 🎨 What's Next?

1. Login as admin
2. Go to Dashboard
3. Add new employees
4. Mark attendance
5. Apply for leaves
6. Generate payroll

---

## 📞 Need Help?

1. Check MySQL is running (green in XAMPP)
2. Verify database exists in phpMyAdmin
3. Check terminal for error messages
4. Ensure all dependencies installed

---

**Happy Coding! 🚀**
