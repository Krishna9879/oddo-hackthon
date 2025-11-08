import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

// Get notifications for user
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';

    // Get user role to filter notifications appropriately
    const [userInfo]: any = await query(
      'SELECT role FROM users WHERE id = ?',
      [decoded.userId]
    );

    const userRole = userInfo[0]?.role || 'employee';

    // Build query based on role
    // Employees see only their notifications
    // HR/Admin/Payroll see their role-specific notifications
    let sql = `
      SELECT n.* FROM notifications n
      WHERE n.user_id = ?
    `;

    // For employees, show only their notifications
    // For HR/Admin/Payroll, they can see notifications related to their role
    if (unreadOnly) {
      sql += ' AND n.is_read = FALSE';
    }

    sql += ' ORDER BY n.created_at DESC LIMIT 50';

    const notifications = await query(sql, [decoded.userId]);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// Mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const { notificationId, markAllRead } = await request.json();

    if (markAllRead) {
      await query(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
        [decoded.userId]
      );
    } else if (notificationId) {
      await query(
        'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
        [notificationId, decoded.userId]
      );
    }

    return NextResponse.json({
      message: 'Notification(s) marked as read',
    });
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// Create notification (internal use)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    
    // Only admin/HR can create notifications
    if (decoded.role !== 'admin' && decoded.role !== 'hr') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, title, message, type, actionUrl } = await request.json();

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: 'User ID, title, and message are required' },
        { status: 400 }
      );
    }

    await query(
      `INSERT INTO notifications (user_id, title, message, type, action_url, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [userId, title, message, type || 'info', actionUrl || null]
    );

    return NextResponse.json({
      message: 'Notification sent successfully',
    });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
