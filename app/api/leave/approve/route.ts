import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// POST approve/reject leave request
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

    const { leaveId, status, rejectionReason } = await request.json();

    // Get leave request details
    const [leaveRequest]: any = await pool.execute(
      `SELECT lr.*, e.first_name, e.last_name, e.user_id, lt.name as leave_type_name
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       JOIN leave_types lt ON lr.leave_type_id = lt.id
       WHERE lr.id = ?`,
      [leaveId]
    );

    if (leaveRequest.length === 0) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    const requestData = leaveRequest[0];

    // Update leave request
    await pool.execute(
      `UPDATE leave_requests 
       SET status = ?, approved_by = ?, approved_at = NOW(), rejection_reason = ?
       WHERE id = ?`,
      [status, payload.userId, rejectionReason || null, leaveId]
    );

    // Create notification for employee
    const employeeName = `${requestData.first_name} ${requestData.last_name}`;
    const notificationMessage = status === 'Approved'
      ? `Your ${requestData.leave_type_name} request from ${requestData.start_date} to ${requestData.end_date} has been approved.`
      : `Your ${requestData.leave_type_name} request from ${requestData.start_date} to ${requestData.end_date} has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`;

    await pool.execute(
      `INSERT INTO notifications (user_id, title, message, type, action_url, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        requestData.user_id,
        `Leave Request ${status}`,
        notificationMessage,
        status === 'Approved' ? 'success' : 'error',
        '/leave'
      ]
    );

    return NextResponse.json({ message: 'Leave request updated successfully' });
  } catch (error) {
    console.error('Approve leave request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
