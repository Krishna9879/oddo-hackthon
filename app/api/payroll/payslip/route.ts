import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { sendEmail, emailTemplates } from '@/lib/email';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// GET payslip for employee
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
    const payrollId = searchParams.get('payrollId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // Get employee ID
    const [employees]: any = await pool.execute(
      'SELECT id FROM employees WHERE user_id = ?',
      [payload.userId]
    );

    if (employees.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const employeeId = employees[0].id;

    let query = `
      SELECT p.*, e.first_name, e.last_name, e.employee_code, e.department, e.designation
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.employee_id = ?
    `;
    const params: any[] = [employeeId];

    if (payrollId) {
      query += ' AND p.id = ?';
      params.push(payrollId);
    }

    if (month && year) {
      query += ' AND p.month = ? AND p.year = ?';
      params.push(month, year);
    }

    query += ' ORDER BY p.year DESC, p.month DESC LIMIT 1';

    const [payroll]: any = await pool.execute(query, params);

    if (payroll.length === 0) {
      return NextResponse.json({ error: 'Payslip not found' }, { status: 404 });
    }

    return NextResponse.json(payroll[0]);
  } catch (error) {
    console.error('Get payslip error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST generate payslips for payrun and send emails
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !['admin', 'payroll_officer'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { payrunId } = await request.json();

    if (!payrunId) {
      return NextResponse.json({ error: 'Payrun ID is required' }, { status: 400 });
    }

    // Get payrun details
    const [payrun]: any = await pool.execute(
      'SELECT * FROM payruns WHERE id = ?',
      [payrunId]
    );

    if (payrun.length === 0) {
      return NextResponse.json({ error: 'Payrun not found' }, { status: 404 });
    }

    const payrunData = payrun[0];

    // Get all payroll records for this payrun
    const [payrollRecords]: any = await pool.execute(
      `SELECT p.*, e.first_name, e.last_name, e.employee_code, e.department, e.designation, 
              e.user_id, u.email
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       JOIN users u ON e.user_id = u.id
       WHERE p.payrun_id = ?`,
      [payrunId]
    );

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    // Create payslips directory if it doesn't exist
    const payslipsDir = join(process.cwd(), 'public', 'payslips');
    if (!existsSync(payslipsDir)) {
      await mkdir(payslipsDir, { recursive: true });
    }

    let emailsSent = 0;
    let emailsFailed = 0;

    // Generate payslip for each employee
    for (const payroll of payrollRecords) {
      try {
        // Generate payslip HTML
        const payslipHtml = generatePayslipHTML(payroll, monthNames[payroll.month - 1], payroll.year);

        // Save payslip as HTML file
        const payslipFilename = `payslip_${payroll.employee_code}_${payroll.year}_${String(payroll.month).padStart(2, '0')}.html`;
        const payslipPath = join(payslipsDir, payslipFilename);
        await writeFile(payslipPath, payslipHtml, 'utf-8');

        const payslipUrl = `/payslips/${payslipFilename}`;

        // Update payroll record with payslip path
        await pool.execute(
          `UPDATE payroll 
           SET payslip_generated = TRUE, payslip_path = ?
           WHERE id = ?`,
          [payslipUrl, payroll.id]
        );

        // Send email to employee
        try {
          const emailTemplate = emailTemplates.payslip(
            `${payroll.first_name} ${payroll.last_name}`,
            monthNames[payroll.month - 1],
            payroll.year,
            parseFloat(payroll.net_salary),
            payslipUrl
          );

          const emailSent = await sendEmail({
            to: payroll.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          });

          if (emailSent) {
            await pool.execute(
              `UPDATE payroll 
               SET payslip_sent_at = NOW()
               WHERE id = ?`,
              [payroll.id]
            );
            emailsSent++;
          } else {
            emailsFailed++;
          }
        } catch (emailError) {
          console.error(`Failed to send email to ${payroll.email}:`, emailError);
          emailsFailed++;
        }

        // Create notification for employee
        await pool.execute(
          `INSERT INTO notifications (user_id, title, message, type, action_url, created_at)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            payroll.user_id || null,
            'Payslip Generated',
            `Your payslip for ${monthNames[payroll.month - 1]} ${payroll.year} is ready. Net Salary: ₹${parseFloat(payroll.net_salary).toLocaleString()}`,
            'success',
            `/payroll/payslip?month=${payroll.month}&year=${payroll.year}`
          ]
        );
      } catch (error) {
        console.error(`Failed to generate payslip for employee ${payroll.employee_code}:`, error);
        emailsFailed++;
      }
    }

    return NextResponse.json({
      message: 'Payslips generated successfully',
      total: payrollRecords.length,
      emailsSent,
      emailsFailed,
    });
  } catch (error) {
    console.error('Generate payslips error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generatePayslipHTML(payroll: any, month: string, year: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payslip - ${month} ${year}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .payslip {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #0ea5e9;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #0ea5e9;
      margin: 0;
    }
    .company-info {
      color: #666;
      font-size: 14px;
    }
    .employee-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .info-section h3 {
      color: #333;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
    }
    .info-label {
      color: #666;
      font-weight: 500;
    }
    .info-value {
      color: #333;
      font-weight: 600;
    }
    .salary-breakdown {
      margin: 30px 0;
    }
    .salary-breakdown h3 {
      color: #333;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .salary-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .salary-row.total {
      border-top: 2px solid #0ea5e9;
      border-bottom: 2px solid #0ea5e9;
      font-weight: bold;
      font-size: 18px;
      margin-top: 10px;
      padding-top: 15px;
    }
    .salary-label {
      color: #666;
    }
    .salary-value {
      color: #333;
      font-weight: 600;
    }
    .net-salary {
      background: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin-top: 30px;
    }
    .net-salary-label {
      font-size: 14px;
      opacity: 0.9;
    }
    .net-salary-value {
      font-size: 32px;
      font-weight: bold;
      margin-top: 10px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #666;
      font-size: 12px;
    }
    .attendance-summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-top: 20px;
    }
    .attendance-item {
      text-align: center;
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
    }
    .attendance-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }
    .attendance-value {
      font-size: 24px;
      font-weight: bold;
      color: #0ea5e9;
    }
  </style>
</head>
<body>
  <div class="payslip">
    <div class="header">
      <h1>WorkZen HRMS</h1>
      <div class="company-info">
        <p>Salary Statement</p>
        <p>${month} ${year}</p>
      </div>
    </div>

    <div class="employee-info">
      <div class="info-section">
        <h3>Employee Information</h3>
        <div class="info-item">
          <span class="info-label">Employee Code:</span>
          <span class="info-value">${payroll.employee_code}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Name:</span>
          <span class="info-value">${payroll.first_name} ${payroll.last_name}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Department:</span>
          <span class="info-value">${payroll.department || 'N/A'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Designation:</span>
          <span class="info-value">${payroll.designation || 'N/A'}</span>
        </div>
      </div>

      <div class="info-section">
        <h3>Pay Period</h3>
        <div class="info-item">
          <span class="info-label">Month:</span>
          <span class="info-value">${month}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Year:</span>
          <span class="info-value">${year}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Payment Date:</span>
          <span class="info-value">${payroll.payment_date || 'N/A'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Status:</span>
          <span class="info-value">${payroll.status}</span>
        </div>
      </div>
    </div>

    <div class="salary-breakdown">
      <h3>Salary Breakdown</h3>
      <div class="salary-row">
        <span class="salary-label">Basic Salary</span>
        <span class="salary-value">₹${parseFloat(payroll.basic_salary || 0).toLocaleString()}</span>
      </div>
      <div class="salary-row">
        <span class="salary-label">Allowances</span>
        <span class="salary-value">₹${parseFloat(payroll.allowances || 0).toLocaleString()}</span>
      </div>
      ${payroll.bonus ? `
      <div class="salary-row">
        <span class="salary-label">Bonus</span>
        <span class="salary-value">₹${parseFloat(payroll.bonus).toLocaleString()}</span>
      </div>
      ` : ''}
      <div class="salary-row total">
        <span class="salary-label">Gross Salary</span>
        <span class="salary-value">₹${parseFloat(payroll.gross_salary || 0).toLocaleString()}</span>
      </div>
      <div class="salary-row">
        <span class="salary-label">Provident Fund (PF)</span>
        <span class="salary-value">-₹${((parseFloat(payroll.basic_salary || 0) * 12) / 100).toLocaleString()}</span>
      </div>
      <div class="salary-row">
        <span class="salary-label">Tax Deduction</span>
        <span class="salary-value">-₹${((parseFloat(payroll.gross_salary || 0) * 10) / 100).toLocaleString()}</span>
      </div>
      ${payroll.penalty ? `
      <div class="salary-row">
        <span class="salary-label">Penalty</span>
        <span class="salary-value">-₹${parseFloat(payroll.penalty).toLocaleString()}</span>
      </div>
      ` : ''}
      <div class="salary-row">
        <span class="salary-label">Total Deductions</span>
        <span class="salary-value">-₹${parseFloat(payroll.deductions || 0).toLocaleString()}</span>
      </div>
    </div>

    <div class="net-salary">
      <div class="net-salary-label">Net Salary</div>
      <div class="net-salary-value">₹${parseFloat(payroll.net_salary || 0).toLocaleString()}</div>
    </div>

    <div class="attendance-summary">
      <div class="attendance-item">
        <div class="attendance-label">Working Days</div>
        <div class="attendance-value">${payroll.working_days || 0}</div>
      </div>
      <div class="attendance-item">
        <div class="attendance-label">Present Days</div>
        <div class="attendance-value">${payroll.present_days || 0}</div>
      </div>
      <div class="attendance-item">
        <div class="attendance-label">Absent Days</div>
        <div class="attendance-value">${payroll.absent_days || 0}</div>
      </div>
      <div class="attendance-item">
        <div class="attendance-label">Leave Days</div>
        <div class="attendance-value">${payroll.leave_days || 0}</div>
      </div>
    </div>

    <div class="footer">
      <p>This is a computer-generated document and does not require a signature.</p>
      <p>&copy; ${new Date().getFullYear()} WorkZen HRMS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
