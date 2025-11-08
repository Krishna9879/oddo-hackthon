import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

// Get employee profile
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const employees: any = await query(
      `SELECT e.*, u.email, u.role, u.created_at as user_created_at
       FROM employees e
       JOIN users u ON e.user_id = u.id
       WHERE e.user_id = ?`,
      [decoded.userId]
    );

    if (!Array.isArray(employees) || employees.length === 0) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(employees[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// Update employee profile (request to HR for sensitive fields)
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const updates = await request.json();

    // Fields employees can update directly
    const allowedFields = ['phone', 'address', 'emergency_contact', 'emergency_phone'];
    
    // Fields that require HR approval
    const restrictedFields = ['bank_name', 'account_number', 'ifsc_code', 'pan_number'];

    const directUpdates: any = {};
    const pendingUpdates: any = {};

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        directUpdates[key] = updates[key];
      } else if (restrictedFields.includes(key)) {
        pendingUpdates[key] = updates[key];
      }
    });

    // Get employee ID from user_id
    const [employees]: any = await query(
      'SELECT id FROM employees WHERE user_id = ?',
      [decoded.userId]
    );

    if (!Array.isArray(employees) || employees.length === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const employeeId = employees[0].id;

    // Apply direct updates
    if (Object.keys(directUpdates).length > 0) {
      const setClause = Object.keys(directUpdates)
        .map(key => `${key} = ?`)
        .join(', ');
      const values = [...Object.values(directUpdates), employeeId];

      await query(
        `UPDATE employees SET ${setClause} WHERE id = ?`,
        values
      );
    }

    // Create update request for restricted fields
    if (Object.keys(pendingUpdates).length > 0) {
      await query(
        `INSERT INTO profile_update_requests 
         (employee_id, field_updates, status, created_at)
         VALUES (?, ?, 'pending', NOW())`,
        [employeeId, JSON.stringify(pendingUpdates)]
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      pendingApproval: Object.keys(pendingUpdates).length > 0,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
