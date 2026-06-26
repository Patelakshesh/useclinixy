import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendPasswordResetEmail = async (to: string, name: string, resetToken: string, origin?: string): Promise<void> => {
  const frontendUrl = origin || process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  const transporter = createTransporter();
  if (!transporter) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f7f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f9; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="100%" max-width="560" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); overflow: hidden; max-width: 560px; margin: 0 auto;">
              <tr>
                <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                  <h1 style="margin: 0; color: #2563eb; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Clinixy</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 22px; font-weight: 700;">Password Reset Request</h2>
                  <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
                    Hello <strong>${name}</strong>,<br><br>
                    We received a request to reset the password for your Clinixy account. To set a new password, please click the button below.
                  </p>
                  
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding: 10px 0 30px;">
                        <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 32px; border-radius: 8px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2); transition: background-color 0.2s;">
                          Reset My Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                    <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.5;">
                      <strong>Note:</strong> For security reasons, this link will expire in <strong>15 minutes</strong>.
                    </p>
                  </div>
                  
                  <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                    If you did not request a password reset, you can safely ignore this email. Your password will remain completely secure.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0 0 8px; color: #94a3b8; font-size: 13px;">
                    This is an automated message, please do not reply.
                  </p>
                  <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} Clinixy. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Clinixy" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Reset Your Clinixy Password',
    html,
  });
};

export const sendWelcomeEmail = async (to: string, name: string, clinicName: string): Promise<void> => {
  const transporter = createTransporter();
  if (!transporter) return;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 32px 40px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Clinixy</h1>
      </div>
      <div style="padding: 40px;">
        <h2 style="color: #1e293b; font-size: 20px; font-weight: 600; margin: 0 0 12px;">Welcome to Clinixy! 🎉</h2>
        <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          Hi ${name}, your clinic <strong>${clinicName}</strong> has been successfully registered.
          Your trial has started — no credit card required.
        </p>
        <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
          Log in to your dashboard to add doctors, manage patients, and start accepting appointments.
        </p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="display: inline-block; background: #1e293b; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 15px; font-weight: 600;">
          Go to Dashboard →
        </a>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Clinixy" <${process.env.SMTP_USER}>`,
    to,
    subject: `Welcome to Clinixy — ${clinicName} is ready!`,
    html,
  });
};
