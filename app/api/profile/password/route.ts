import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 });
    }
    if (String(newPassword).length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    // Fetch user
    const [users]: any = await pool.execute('SELECT id, password, email FROM users WHERE id = ? LIMIT 1', [payload.userId]);
    if (users.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const user = users[0];
    const valid = await bcrypt.compare(String(currentPassword), user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(String(newPassword), 10);
    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, payload.userId]);

    // Notification to self
    await pool.execute(
      `INSERT INTO notifications (user_id, title, message, type, action_url, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [payload.userId, 'Password Changed', 'Your password was changed successfully.', 'success', '/profile']
    );

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
