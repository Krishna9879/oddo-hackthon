import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const users = await query(
      'SELECT id, email, first_name FROM users WHERE email = ?',
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      // Don't reveal if email exists for security
      return NextResponse.json({
        message: 'If the email exists, a password reset link has been sent',
      });
    }

    // Generate reset token (6-digit code)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token
    await query(
      `INSERT INTO password_resets (user_id, token, expires_at) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE token = ?, expires_at = ?`,
      [users[0].id, resetToken, expiresAt, resetToken, expiresAt]
    );

    // In production, send email here
    // For demo, return token
    return NextResponse.json({
      message: 'Password reset code sent to your email',
      resetToken, // Remove in production
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
