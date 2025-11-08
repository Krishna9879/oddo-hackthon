import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET all leave types
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

    const [leaveTypes] = await pool.execute(
      'SELECT * FROM leave_types ORDER BY name ASC'
    );

    return NextResponse.json(leaveTypes);
  } catch (error) {
    console.error('Get leave types error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
