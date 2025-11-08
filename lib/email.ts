import nodemailer from 'nodemailer';

// Gmail credentials from environment variables
const GMAIL_USER = process.env.GMAIL_USER || 'afterx0411@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || 'rbut pmfe ufdg eykd';

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"WorkZen HRMS" <${GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Email templates
export const emailTemplates = {
  // Employee credentials email
  employeeCredentials: (email: string, password: string, employeeName: string, employeeCode: string) => ({
    subject: 'Welcome to WorkZen HRMS - Your Account Credentials',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
          .credential-item { margin: 10px 0; }
          .label { font-weight: bold; color: #666; }
          .value { color: #0ea5e9; font-size: 18px; }
          .warning { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to WorkZen HRMS</h1>
          </div>
          <div class="content">
            <h2>Hello ${employeeName},</h2>
            <p>Your account has been successfully created in WorkZen HRMS. Below are your login credentials:</p>
            
            <div class="credentials">
              <div class="credential-item">
                <span class="label">Employee Code:</span>
                <div class="value">${employeeCode}</div>
              </div>
              <div class="credential-item">
                <span class="label">Email:</span>
                <div class="value">${email}</div>
              </div>
              <div class="credential-item">
                <span class="label">Password:</span>
                <div class="value">${password}</div>
              </div>
            </div>

            <div class="warning">
              <strong>⚠️ Important:</strong> Please change your password after first login for security purposes.
            </div>

            <p>You can now login to the system using these credentials at: <a href="http://localhost:3000/login">http://localhost:3000/login</a></p>
            
            <p>If you have any questions, please contact your HR department.</p>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} WorkZen HRMS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Leave approval email
  leaveApproved: (employeeName: string, leaveType: string, startDate: string, endDate: string, totalDays: number) => ({
    subject: 'Leave Request Approved - WorkZen HRMS',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .info-item { margin: 10px 0; }
          .label { font-weight: bold; color: #666; }
          .value { color: #059669; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Leave Request Approved</h1>
          </div>
          <div class="content">
            <h2>Hello ${employeeName},</h2>
            <p>Your leave request has been approved by HR.</p>
            
            <div class="info-box">
              <div class="info-item">
                <span class="label">Leave Type:</span>
                <span class="value">${leaveType}</span>
              </div>
              <div class="info-item">
                <span class="label">Start Date:</span>
                <span class="value">${startDate}</span>
              </div>
              <div class="info-item">
                <span class="label">End Date:</span>
                <span class="value">${endDate}</span>
              </div>
              <div class="info-item">
                <span class="label">Total Days:</span>
                <span class="value">${totalDays} days</span>
              </div>
            </div>

            <p>Enjoy your time off!</p>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} WorkZen HRMS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Leave rejection email
  leaveRejected: (employeeName: string, leaveType: string, startDate: string, endDate: string, reason: string) => ({
    subject: 'Leave Request Rejected - WorkZen HRMS',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
          .info-item { margin: 10px 0; }
          .label { font-weight: bold; color: #666; }
          .value { color: #dc2626; }
          .reason-box { background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Leave Request Rejected</h1>
          </div>
          <div class="content">
            <h2>Hello ${employeeName},</h2>
            <p>Unfortunately, your leave request has been rejected.</p>
            
            <div class="info-box">
              <div class="info-item">
                <span class="label">Leave Type:</span>
                <span class="value">${leaveType}</span>
              </div>
              <div class="info-item">
                <span class="label">Start Date:</span>
                <span class="value">${startDate}</span>
              </div>
              <div class="info-item">
                <span class="label">End Date:</span>
                <span class="value">${endDate}</span>
              </div>
            </div>

            ${reason ? `
              <div class="reason-box">
                <strong>Reason for Rejection:</strong>
                <p>${reason}</p>
              </div>
            ` : ''}

            <p>Please contact HR if you have any questions.</p>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} WorkZen HRMS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Payslip email
  payslip: (employeeName: string, month: string, year: number, netSalary: number, payslipPath: string) => ({
    subject: `Payslip for ${month} ${year} - WorkZen HRMS`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .salary-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6; text-align: center; }
          .net-salary { font-size: 32px; font-weight: bold; color: #8b5cf6; margin: 10px 0; }
          .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Your Payslip is Ready</h1>
          </div>
          <div class="content">
            <h2>Hello ${employeeName},</h2>
            <p>Your payslip for <strong>${month} ${year}</strong> has been generated and is ready for download.</p>
            
            <div class="salary-box">
              <div style="color: #666; font-size: 14px;">Net Salary</div>
              <div class="net-salary">₹${netSalary.toLocaleString()}</div>
            </div>

            <div style="text-align: center;">
              <a href="${payslipPath}" class="button">Download Payslip</a>
            </div>

            <p>You can also view and download your payslip from your employee dashboard.</p>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} WorkZen HRMS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};
