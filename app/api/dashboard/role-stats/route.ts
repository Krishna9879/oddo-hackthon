import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const role = decoded.role;

    let dashboardData: any = {};

    // Common stats for all roles
    const totalEmployees: any = await query(
      'SELECT COUNT(*) as count FROM employees WHERE status = "active"'
    );

    const todayAttendance: any = await query(
      'SELECT COUNT(*) as count FROM attendance WHERE date = CURDATE() AND status = "Present"'
    );

    const pendingLeaves: any = await query(
      'SELECT COUNT(*) as count FROM leave_requests WHERE status = "Pending"'
    );

    // Role-specific data
    switch (role) {
      case 'admin':
        // Admin gets complete system overview
        const departments: any = await query('SELECT COUNT(*) as count FROM departments');
        const monthlyPayroll: any = await query(
          `SELECT SUM(net_salary) as total FROM payroll 
           WHERE month = MONTH(CURDATE()) AND year = YEAR(CURDATE())`
        );
        const recentActivity: any = await query(
          `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10`
        );

        dashboardData = {
          totalEmployees: totalEmployees[0].count,
          activeEmployees: totalEmployees[0].count,
          totalDepartments: departments[0].count,
          monthlyPayroll: monthlyPayroll[0].total || 0,
          presentToday: todayAttendance[0].count,
          pendingLeaves: pendingLeaves[0].count,
          recentActivity,
        };
        break;

      case 'hr':
        // HR gets employee and leave management data
        const newHires: any = await query(
          `SELECT COUNT(*) as count FROM employees 
           WHERE MONTH(join_date) = MONTH(CURDATE()) AND YEAR(join_date) = YEAR(CURDATE())`
        );
        const passwordRequests: any = await query(
          `SELECT COUNT(*) as count FROM password_change_requests WHERE status = 'pending'`
        );
        const pendingLeaveList: any = await query(
          `SELECT lr.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name
           FROM leave_requests lr
           JOIN employees e ON lr.employee_id = e.id
           WHERE lr.status = 'Pending'
           ORDER BY lr.created_at DESC
           LIMIT 10`
        );

        dashboardData = {
          totalEmployees: totalEmployees[0].count,
          activeEmployees: totalEmployees[0].count,
          newHires: newHires[0].count,
          pendingLeaves: pendingLeaves[0].count,
          passwordRequests: passwordRequests[0].count,
          pendingLeaveList,
        };
        break;

      case 'payroll_officer':
        // Payroll officer gets salary and processing data
        const totalPayroll: any = await query(
          `SELECT SUM(net_salary) as total, AVG(net_salary) as avg, COUNT(*) as processed
           FROM payroll 
           WHERE month = MONTH(CURDATE()) AND year = YEAR(CURDATE())`
        );
        const pendingPayroll: any = await query(
          `SELECT COUNT(*) as count FROM employees e
           WHERE e.status = 'active' 
           AND NOT EXISTS (
             SELECT 1 FROM payroll p 
             WHERE p.employee_id = e.id 
             AND p.month = MONTH(CURDATE()) 
             AND p.year = YEAR(CURDATE())
           )`
        );

        dashboardData = {
          totalEmployees: totalEmployees[0].count,
          totalPayroll: totalPayroll[0].total || 0,
          avgSalary: totalPayroll[0].avg || 0,
          processed: totalPayroll[0].processed || 0,
          pendingPayroll: pendingPayroll[0].count || 0,
        };
        break;

      case 'employee':
      default:
        // Employee gets personal data
        const employeeData: any = await query(
          `SELECT e.*, u.email FROM employees e
           JOIN users u ON e.user_id = u.id
           WHERE e.id = ?`,
          [decoded.userId]
        );

        const employeeAttendance: any = await query(
          `SELECT * FROM attendance 
           WHERE employee_id = ? 
           ORDER BY date DESC LIMIT 10`,
          [decoded.userId]
        );

        const employeeLeaves: any = await query(
          `SELECT lr.*, lt.name as leave_type_name
           FROM leave_requests lr
           JOIN leave_types lt ON lr.leave_type_id = lt.id
           WHERE lr.employee_id = ?
           ORDER BY lr.created_at DESC LIMIT 5`,
          [decoded.userId]
        );

        const employeePayslips: any = await query(
          `SELECT * FROM payroll 
           WHERE employee_id = ?
           ORDER BY year DESC, month DESC LIMIT 3`,
          [decoded.userId]
        );

        dashboardData = {
          profile: employeeData[0] || null,
          attendance: employeeAttendance,
          leaves: employeeLeaves,
          payslips: employeePayslips,
          stats: {
            totalLeaves: 25, // From leave policy
            availableLeaves: 18, // Calculate from leave_requests
            usedLeaves: 7,
            presentDays: todayAttendance[0].count,
          },
        };
        break;
    }

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
