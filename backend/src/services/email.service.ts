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

export const sendPasswordResetEmail = async (to: string, name: string, resetToken: string): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  const transporter = createTransporter();
  if (!transporter) return;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 32px 40px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Clinixy</h1>
      </div>
      <div style="padding: 40px;">
        <h2 style="color: #1e293b; font-size: 20px; font-weight: 600; margin: 0 0 12px;">Reset Your Password</h2>
        <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
          Hi ${name}, we received a request to reset the password for your Clinixy account.
          Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background: #1e293b; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; letter-spacing: -0.2px;">
          Reset Password →
        </a>
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 28px 0 0;">
          If you didn't request this, you can safely ignore this email. Your password won't change.
        </p>
      </div>
      <div style="background: #f8fafc; padding: 20px 40px; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Clinixy · All rights reserved</p>
      </div>
    </div>
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
