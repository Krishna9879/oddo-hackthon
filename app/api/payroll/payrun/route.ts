import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET all payruns
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
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const status = searchParams.get('status');

    let query = `
      SELECT p.*, 
             u1.email as generated_by_email,
             u2.email as approved_by_email
      FROM payruns p
      LEFT JOIN users u1 ON p.generated_by = u1.id
      LEFT JOIN users u2 ON p.approved_by = u2.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (month) {
      query += ' AND p.month = ?';
      params.push(month);
    }

    if (year) {
      query += ' AND p.year = ?';
      params.push(year);
    }

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    query += ' ORDER BY p.year DESC, p.month DESC';

    const [payruns] = await pool.execute(query, params);

    return NextResponse.json(payruns);
  } catch (error) {
    console.error('Get payruns error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST approve payrun
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !['admin', 'payroll_officer'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { payrunId, action, notes } = await request.json();

    if (!payrunId || !action) {
      return NextResponse.json({ error: 'Payrun ID and action are required' }, { status: 400 });
    }

    let status = 'Pending Approval';
    if (action === 'approve') {
      status = 'Approved';
    } else if (action === 'reject') {
      status = 'Rejected';
    } else if (action === 'lock') {
      status = 'Locked';
    }

    // Update payrun
    await pool.execute(
      `UPDATE payruns 
       SET status = ?, approved_by = ?, approved_at = NOW(), notes = ?
       WHERE id = ?`,
      [status, payload.userId, notes || null, payrunId]
    );

    // If approved, update all payroll records and generate payslips
    if (status === 'Approved') {
      await pool.execute(
        `UPDATE payroll SET status = 'Processed' WHERE payrun_id = ?`,
        [payrunId]
      );

      // Trigger payslip generation (this will be handled by a separate endpoint call)
      // The payroll officer can manually trigger payslip generation after approval
    }

    return NextResponse.json({ message: `Payrun ${action}d successfully` });
  } catch (error) {
    console.error('Approve payrun error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
