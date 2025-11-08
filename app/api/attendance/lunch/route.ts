import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

function minutesDiff(start: Date, end: Date) {
  const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  return Math.max(0, diff);
}

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

    const { action } = await request.json();
    if (!['start', 'end'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const [employees]: any = await pool.execute('SELECT id FROM employees WHERE user_id = ? LIMIT 1', [payload.userId]);
    if (employees.length === 0) {
      return NextResponse.json({ error: 'Employee record not found' }, { status: 404 });
    }
    const employeeId = employees[0].id;

    // Find open attendance (checked in, not checked out)
    const [rows]: any = await pool.execute(
      `SELECT id, date, check_in, check_out, lunch_start, lunch_end, lunch_minutes
       FROM attendance
       WHERE employee_id = ? AND check_in IS NOT NULL AND check_out IS NULL
       ORDER BY date DESC
       LIMIT 1`,
      [employeeId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No open attendance. Check in first.' }, { status: 400 });
    }

    const rec = rows[0];

    if (action === 'start') {
      if (rec.lunch_start && !rec.lunch_end) {
        return NextResponse.json({ error: 'Lunch already started' }, { status: 400 });
      }
      await pool.execute(
        `UPDATE attendance SET lunch_start = NOW(), lunch_end = NULL WHERE id = ?`,
        [rec.id]
      );
      return NextResponse.json({ message: 'Lunch started' });
    }

    // end
    if (!rec.lunch_start || (rec.lunch_start && rec.lunch_end)) {
      return NextResponse.json({ error: 'No active lunch to end' }, { status: 400 });
    }

    const startDt = new Date(rec.lunch_start);
    const now = new Date();
    const addMin = minutesDiff(startDt, now);
    const newTotal = (rec.lunch_minutes || 0) + addMin;

    await pool.execute(
      `UPDATE attendance SET lunch_end = NOW(), lunch_minutes = ? WHERE id = ?`,
      [newTotal, rec.id]
    );

    return NextResponse.json({ message: 'Lunch ended', lunchMinutes: newTotal });
  } catch (error) {
    console.error('Lunch POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
