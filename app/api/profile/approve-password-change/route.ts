import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    
    // Only HR/Admin can approve
    if (decoded.role !== 'admin' && decoded.role !== 'hr') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { requestId, status, newPassword } = await request.json();

    if (!requestId || !status) {
      return NextResponse.json(
        { error: 'Request ID and status are required' },
        { status: 400 }
      );
    }

    if (status === 'approved' && !newPassword) {
      return NextResponse.json(
        { error: 'New password is required for approval' },
        { status: 400 }
      );
    }

    // Get request details
    const requests: any = await query(
      'SELECT * FROM password_change_requests WHERE id = ?',
      [requestId]
    );

    if (!Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    const req = requests[0];

    if (status === 'approved') {
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update employee password
      await query(
        'UPDATE users SET password = ? WHERE id = (SELECT user_id FROM employees WHERE id = ?)',
        [hashedPassword, req.employee_id]
      );
    }

    // Update request status
    await query(
      `UPDATE password_change_requests 
       SET status = ?, approved_by = ?, approved_at = NOW()
       WHERE id = ?`,
      [status, decoded.userId, requestId]
    );

    return NextResponse.json({
      message: `Request ${status} successfully`,
    });
  } catch (error) {
    console.error('Approve password change error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
