import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// POST check-out with GPS location
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

    // Check if attendance exists and has check-in
    const [existing]: any = await pool.execute(
      'SELECT id, check_in, check_out FROM attendance WHERE employee_id = ? AND date = ?',
      [employeeId, today]
    );

    if (existing.length === 0 || !existing[0].check_in) {
      return NextResponse.json({ error: 'Please check in first' }, { status: 400 });
    }

    if (existing[0].check_out) {
      return NextResponse.json({ error: 'Already checked out today' }, { status: 400 });
    }

    // Calculate working hours
    const checkInTime = existing[0].check_in;
    const workingHours = calculateWorkingHours(checkInTime, now);

    // Update attendance with check-out
    await pool.execute(
      `UPDATE attendance 
       SET check_out = ?, 
           check_out_latitude = ?, 
           check_out_longitude = ?, 
           check_out_location = ?,
           working_hours = ?
       WHERE employee_id = ? AND date = ?`,
      [now, latitude || null, longitude || null, location || null, workingHours, employeeId, today]
    );

    return NextResponse.json({ 
      message: 'Checked out successfully',
      checkOutTime: now,
      workingHours: workingHours
    });
  } catch (error) {
    console.error('Check-out error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateWorkingHours(checkIn: string, checkOut: string): number {
  const start = new Date(`2000-01-01 ${checkIn}`);
  const end = new Date(`2000-01-01 ${checkOut}`);
  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return Math.max(0, parseFloat(diff.toFixed(2)));
}
