import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

// Get holidays
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    jwt.verify(token, process.env.JWT_SECRET!);

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear();

    const holidays = await query(
      `SELECT * FROM holidays 
       WHERE YEAR(date) = ?
       ORDER BY date`,
      [year]
    );

    return NextResponse.json(holidays);
  } catch (error) {
    console.error('Get holidays error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch holidays' },
      { status: 500 }
    );
  }
}

// Create holiday (HR/Admin only)
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

    const { name, date, description, isMandatory } = await request.json();

    if (!name || !date) {
      return NextResponse.json(
        { error: 'Name and date are required' },
        { status: 400 }
      );
    }

    const result: any = await query(
      `INSERT INTO holidays (name, date, description, is_mandatory)
       VALUES (?, ?, ?, ?)`,
      [name, date, description || null, isMandatory !== false]
    );

    return NextResponse.json({
      id: result.insertId,
      message: 'Holiday created successfully',
    });
  } catch (error) {
    console.error('Create holiday error:', error);
    return NextResponse.json(
      { error: 'Failed to create holiday' },
      { status: 500 }
    );
  }
}

// Delete holiday (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Holiday ID is required' },
        { status: 400 }
      );
    }

    await query('DELETE FROM holidays WHERE id = ?', [id]);

    return NextResponse.json({
      message: 'Holiday deleted successfully',
    });
  } catch (error) {
    console.error('Delete holiday error:', error);
    return NextResponse.json(
      { error: 'Failed to delete holiday' },
      { status: 500 }
    );
  }
}
