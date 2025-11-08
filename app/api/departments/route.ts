import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

// Get departments
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    jwt.verify(token, process.env.JWT_SECRET!);

    const departments = await query(
      `SELECT d.*, 
       COUNT(e.id) as employee_count,
       (SELECT CONCAT(first_name, ' ', last_name) FROM employees WHERE id = d.manager_id) as manager_name
       FROM departments d
       LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'active'
       GROUP BY d.id
       ORDER BY d.name`
    );

    return NextResponse.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

// Create department (Admin/HR only)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    
    if (decoded.role !== 'admin' && decoded.role !== 'hr') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, description, managerId, budget } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      );
    }

    const result: any = await query(
      `INSERT INTO departments (name, description, manager_id, budget, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [name, description || null, managerId || null, budget || null]
    );

    return NextResponse.json({
      id: result.insertId,
      message: 'Department created successfully',
    });
  } catch (error) {
    console.error('Create department error:', error);
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    );
  }
}

// Update department
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    
    if (decoded.role !== 'admin' && decoded.role !== 'hr') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, name, description, managerId, budget } = await request.json();

    if (!id || !name) {
      return NextResponse.json(
        { error: 'Department ID and name are required' },
        { status: 400 }
      );
    }

    await query(
      `UPDATE departments 
       SET name = ?, description = ?, manager_id = ?, budget = ?
       WHERE id = ?`,
      [name, description || null, managerId || null, budget || null, id]
    );

    return NextResponse.json({
      message: 'Department updated successfully',
    });
  } catch (error) {
    console.error('Update department error:', error);
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

// Delete department
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete departments' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Department ID is required' },
        { status: 400 }
      );
    }

    // Check if department has employees
    const employees: any = await query(
      'SELECT COUNT(*) as count FROM employees WHERE department_id = ? AND status = "active"',
      [id]
    );

    if (employees[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete department with active employees' },
        { status: 400 }
      );
    }

    await query('DELETE FROM departments WHERE id = ?', [id]);

    return NextResponse.json({
      message: 'Department deleted successfully',
    });
  } catch (error) {
    console.error('Delete department error:', error);
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    );
  }
}
