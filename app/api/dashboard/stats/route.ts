import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

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

    const today = new Date().toISOString().split('T')[0];

    // Get total employees
    const [employeeCount]: any = await pool.execute(
      'SELECT COUNT(*) as count FROM employees WHERE status = "active"'
    );

    // Get present today
    const [presentCount]: any = await pool.execute(
      'SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status IN ("Present", "Late")',
      [today]
    );

    // Get pending leaves
    const [pendingLeaves]: any = await pool.execute(
      'SELECT COUNT(*) as count FROM leave_requests WHERE status = "Pending"'
    );

    // Get monthly payroll
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const [payrollSum]: any = await pool.execute(
      'SELECT COALESCE(SUM(net_salary), 0) as total FROM payroll WHERE month = ? AND year = ?',
      [currentMonth, currentYear]
    );

    return NextResponse.json({
      totalEmployees: employeeCount[0].count,
      presentToday: presentCount[0].count,
      pendingLeaves: pendingLeaves[0].count,
      monthlyPayroll: parseFloat(payrollSum[0].total).toFixed(2),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
