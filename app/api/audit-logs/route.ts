import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

// Get audit logs (Admin only)
export async function GET(request: NextRequest) {
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
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    let sql = `
      SELECT al.*, 
       CONCAT(u.first_name, ' ', u.last_name) as user_name,
       u.email as user_email,
       u.role as user_role
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (userId) {
      sql += ' AND al.user_id = ?';
      params.push(userId);
    }

    if (action) {
      sql += ' AND al.action = ?';
      params.push(action);
    }

    if (startDate) {
      sql += ' AND al.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND al.created_at <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY al.created_at DESC LIMIT ?';
    params.push(limit);

    const logs = await query(sql, params);

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Get audit logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

// Create audit log entry (internal helper)
export async function createAuditLog(
  userId: number,
  action: string,
  entity: string,
  entityId: number | null,
  details: any,
  ipAddress: string | null
) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, action, entity, entityId, JSON.stringify(details), ipAddress]
    );
  } catch (error) {
    console.error('Create audit log error:', error);
  }
}
