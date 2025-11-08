import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET all employees
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const [employees] = await pool.execute(
      `SELECT e.*, u.email as user_email, u.role, u.is_active 
       FROM employees e 
       LEFT JOIN users u ON e.user_id = u.id 
       ORDER BY e.created_at DESC`
    );

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new employee
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !['admin', 'hr'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      department,
      designation,
      joinDate,
      basicSalary,
      allowances,
      role = 'employee',
      password,
    } = data;

    // Generate employee code
    const [lastEmployee]: any = await pool.execute(
      'SELECT employee_code FROM employees ORDER BY id DESC LIMIT 1'
    );
    const lastCode = lastEmployee[0]?.employee_code || 'EMP000';
    const newCodeNumber = parseInt(lastCode.slice(3)) + 1;
    const employeeCode = `EMP${newCodeNumber.toString().padStart(3, '0')}`;

    // Create user account
    const hashedPassword = await bcrypt.hash(password || 'employee123', 10);
    const [userResult]: any = await pool.execute(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );

    const userId = userResult.insertId;

    // Create employee record
    const [employeeResult]: any = await pool.execute(
      `INSERT INTO employees (
        user_id, employee_code, first_name, last_name, email, phone,
        date_of_birth, gender, address, department, designation,
        join_date, basic_salary, allowances
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        employeeCode,
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        gender,
        address,
        department,
        designation,
        joinDate,
        basicSalary,
        allowances,
      ]
    );

    return NextResponse.json({
      id: employeeResult.insertId,
      employeeCode,
      message: 'Employee created successfully',
    });
  } catch (error: any) {
    console.error('Create employee error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
