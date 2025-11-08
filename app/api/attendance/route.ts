import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET attendance records
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

    const { searchParams } = new URL(request.url);
    let employeeId = searchParams.get('employeeId');
    const date = searchParams.get('date');

    // If user is employee, automatically filter by their employee ID
    if (!employeeId && payload.role === 'employee') {
      const [employees]: any = await pool.execute(
        'SELECT id FROM employees WHERE user_id = ?',
        [payload.userId]
      );
      if (employees.length > 0) {
        employeeId = employees[0].id.toString();
      }
    }

    let query = `
      SELECT a.*, e.first_name, e.last_name, e.employee_code, e.department,
             a.check_in_location, a.check_out_location
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (employeeId) {
      query += ' AND a.employee_id = ?';
      params.push(employeeId);
    }

    if (date) {
      query += ' AND a.date = ?';
      params.push(date);
    }

    query += ' ORDER BY a.date DESC, a.check_in DESC LIMIT 100';

    const [attendance] = await pool.execute(query, params);

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST mark attendance
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { employeeId, checkIn, checkOut, status = 'Present' } = await request.json();
    const today = new Date().toISOString().split('T')[0];

    // Check if attendance already exists
    const [existing]: any = await pool.execute(
      'SELECT id FROM attendance WHERE employee_id = ? AND date = ?',
      [employeeId, today]
    );

    if (existing.length > 0) {
      // Update existing attendance
      const workingHours = checkIn && checkOut 
        ? calculateWorkingHours(checkIn, checkOut) 
        : 0;

      await pool.execute(
        `UPDATE attendance 
         SET check_out = ?, working_hours = ?, status = ? 
         WHERE employee_id = ? AND date = ?`,
        [checkOut, workingHours, status, employeeId, today]
      );

      return NextResponse.json({ message: 'Attendance updated successfully' });
    } else {
      // Create new attendance
      await pool.execute(
        'INSERT INTO attendance (employee_id, date, check_in, status) VALUES (?, ?, ?, ?)',
        [employeeId, today, checkIn, status]
      );

      return NextResponse.json({ message: 'Attendance marked successfully' });
    }
  } catch (error) {
    console.error('Mark attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateWorkingHours(checkIn: string, checkOut: string): number {
  const start = new Date(`2000-01-01 ${checkIn}`);
  const end = new Date(`2000-01-01 ${checkOut}`);
  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return Math.max(0, parseFloat(diff.toFixed(2)));
}
