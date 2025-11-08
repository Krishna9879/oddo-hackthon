import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET leave requests
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
    const status = searchParams.get('status');

    // Get employee ID if user is employee
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
      SELECT lr.*, e.first_name, e.last_name, e.employee_code, lt.name as leave_type_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (employeeId) {
      query += ' AND lr.employee_id = ?';
      params.push(employeeId);
    }

    if (status) {
      query += ' AND lr.status = ?';
      params.push(status);
    }

    query += ' ORDER BY lr.created_at DESC';

    const [requests] = await pool.execute(query, params);

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Get leave requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create leave request
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

    const { leaveTypeId, startDate, endDate, reason, attachmentPath, attachmentName } = await request.json();

    // Get employee ID from user
    const [employees]: any = await pool.execute(
      'SELECT id FROM employees WHERE user_id = ?',
      [payload.userId]
    );

    if (employees.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const employeeId = employees[0].id;

    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Insert leave request
    const [result]: any = await pool.execute(
      `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, attachment_path, attachment_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [employeeId, leaveTypeId, startDate, endDate, totalDays, reason, attachmentPath || null, attachmentName || null]
    );

    const leaveRequestId = result.insertId;

    // Get employee name for notification
    const [employeeInfo]: any = await pool.execute(
      'SELECT first_name, last_name FROM employees WHERE id = ?',
      [employeeId]
    );
    const employeeName = employeeInfo[0] ? `${employeeInfo[0].first_name} ${employeeInfo[0].last_name}` : 'Employee';

    // Get leave type name
    const [leaveTypeInfo]: any = await pool.execute(
      'SELECT name FROM leave_types WHERE id = ?',
      [leaveTypeId]
    );
    const leaveTypeName = leaveTypeInfo[0]?.name || 'Leave';

    // Create notifications for HR and Admin users
    const [hrUsers]: any = await pool.execute(
      'SELECT id FROM users WHERE role IN ("hr", "admin") AND is_active = TRUE'
    );

    for (const hrUser of hrUsers) {
      await pool.execute(
        `INSERT INTO notifications (user_id, title, message, type, action_url, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          hrUser.id,
          'New Leave Request',
          `${employeeName} has applied for ${leaveTypeName} from ${startDate} to ${endDate} (${totalDays} days)`,
          'info',
          `/leave`
        ]
      );
    }

    return NextResponse.json({ 
      message: 'Leave request submitted successfully',
      id: leaveRequestId
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update leave request status
export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !['admin', 'hr'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, status, rejectionReason } = await request.json();

    // Get leave request details
    const [leaveRequest]: any = await pool.execute(
      `SELECT lr.*, e.first_name, e.last_name, e.user_id, lt.name as leave_type_name
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       JOIN leave_types lt ON lr.leave_type_id = lt.id
       WHERE lr.id = ?`,
      [id]
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
      [status, payload.userId, rejectionReason || null, id]
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
    console.error('Update leave request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
