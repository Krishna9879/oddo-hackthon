import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const { reason } = await request.json();

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a detailed reason (min 10 characters)' },
        { status: 400 }
      );
    }

    // Create password change request
    await query(
      `INSERT INTO password_change_requests (employee_id, reason, status, created_at)
       VALUES (?, ?, 'pending', NOW())`,
      [decoded.userId, reason]
    );

    return NextResponse.json({
      message: 'Password change request submitted to HR',
    });
  } catch (error) {
    console.error('Password change request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    // Get all requests (HR/Admin can see all, employees see their own)
    let requests;
    if (decoded.role === 'admin' || decoded.role === 'hr') {
      requests = await query(
        `SELECT pcr.*, e.first_name, e.last_name, e.email, e.employee_code
         FROM password_change_requests pcr
         JOIN employees e ON pcr.employee_id = e.id
         ORDER BY pcr.created_at DESC`
      );
    } else {
      requests = await query(
        `SELECT * FROM password_change_requests 
         WHERE employee_id = ?
         ORDER BY created_at DESC`,
        [decoded.userId]
      );
    }

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Get password requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
