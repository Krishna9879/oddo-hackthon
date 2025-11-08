import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// POST check-in with GPS location
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

    const { latitude, longitude, location } = await request.json();
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    // Get employee ID from user
    const [employees]: any = await pool.execute(
      'SELECT id FROM employees WHERE user_id = ?',
      [payload.userId]
    );

    if (employees.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const employeeId = employees[0].id;

    // Check if attendance already exists for today
    const [existing]: any = await pool.execute(
      'SELECT id, check_in FROM attendance WHERE employee_id = ? AND date = ?',
      [employeeId, today]
    );

    // Determine status (Late if after 9:15 AM)
    const checkInTime = new Date();
    checkInTime.setHours(9, 15, 0, 0);
    const isLate = new Date() > checkInTime;
    const status = isLate ? 'Late' : 'Present';

    if (existing.length > 0) {
      // Update existing attendance if check-in not already done
      if (existing[0].check_in) {
        return NextResponse.json({ error: 'Already checked in today' }, { status: 400 });
      }

      await pool.execute(
        `UPDATE attendance 
         SET check_in = ?, 
             check_in_latitude = ?, 
             check_in_longitude = ?, 
             check_in_location = ?,
             status = ?
         WHERE employee_id = ? AND date = ?`,
        [now, latitude || null, longitude || null, location || null, status, employeeId, today]
      );
    } else {
      // Create new attendance record
      await pool.execute(
        `INSERT INTO attendance (employee_id, date, check_in, check_in_latitude, check_in_longitude, check_in_location, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [employeeId, today, now, latitude || null, longitude || null, location || null, status]
      );
    }

    return NextResponse.json({ 
      message: 'Checked in successfully',
      checkInTime: now,
      status: status
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
