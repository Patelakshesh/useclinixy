export const sendPasswordResetEmail = async (to: string, name: string, resetToken: string, origin?: string): Promise<void> => {
  const frontendUrl = origin || process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER;

  if (!apiKey || !senderEmail) {
    console.log('[Email Debug] Missing BREVO_API_KEY or BREVO_SENDER_EMAIL. Skipping email send.');
    return;
  }

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

  console.log(`[Email Debug] Attempting to send PASSWORD RESET email to: ${to} via Brevo API`);
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        sender: { name: "Clinixy", email: senderEmail },
        to: [{ email: to, name }],
        subject: 'Reset Your Clinixy Password',
        htmlContent: html
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Brevo API Error: ${response.status} ${errorData}`);
    }

    console.log(`[Email Debug] Successfully sent PASSWORD RESET email to: ${to}`);
  } catch (error) {
    console.error(`[Email Debug] FATAL ERROR sending PASSWORD RESET email to ${to}:`, error);
    throw error;
  }
};

export const sendWelcomeEmail = async (to: string, name: string, clinicName: string): Promise<void> => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER;

  if (!apiKey || !senderEmail) {
    console.log('[Email Debug] Missing BREVO_API_KEY or BREVO_SENDER_EMAIL. Skipping email send.');
    return;
  }

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

  console.log(`[Email Debug] Attempting to send Welcome email to: ${to} via Brevo API`);
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        sender: { name: "Clinixy", email: senderEmail },
        to: [{ email: to, name }],
        subject: `Welcome to Clinixy — ${clinicName} is ready!`,
        htmlContent: html
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Brevo API Error: ${response.status} ${errorData}`);
    }

    console.log(`[Email Debug] Successfully sent email to: ${to}`);
  } catch (error) {
    console.error(`[Email Debug] FATAL ERROR sending email to ${to}:`, error);
    throw error;
  }
};

// ─── ADMIN ALERT: New Clinic Registered ──────────────────────────────────────
export const sendAdminNewClinicAlert = async (
  clinicName: string,
  adminName: string,
  adminEmail: string,
  adminPhone: string,
  subdomain: string
): Promise<void> => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER;
  const ownerEmail = process.env.OWNER_ALERT_EMAIL || 'aksheshpatel97@gmail.com';

  if (!apiKey || !senderEmail) return;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 28px 36px;">
        <h1 style="color: #fff; margin: 0; font-size: 20px; font-weight: 700;">🎉 New Clinic Registered — Clinixy</h1>
      </div>
      <div style="padding: 36px;">
        <p style="color: #1e293b; font-size: 16px; margin: 0 0 20px;">A new clinic just signed up for Clinixy. Here are their details:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #f1f5f9; width: 40%;">Clinic Name</td><td style="padding: 10px 0; font-weight: 600; color: #1e293b; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${clinicName}</td></tr>
          <tr><td style="padding: 10px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Admin Name</td><td style="padding: 10px 0; font-weight: 600; color: #1e293b; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${adminName}</td></tr>
          <tr><td style="padding: 10px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Email</td><td style="padding: 10px 0; font-weight: 600; color: #2563eb; font-size: 14px; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${adminEmail}" style="color: #2563eb;">${adminEmail}</a></td></tr>
          <tr><td style="padding: 10px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Phone</td><td style="padding: 10px 0; font-weight: 600; color: #1e293b; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${adminPhone || 'Not provided'}</td></tr>
          <tr><td style="padding: 10px 0; color: #64748b; font-size: 14px;">Subdomain</td><td style="padding: 10px 0; font-weight: 600; color: #1e293b; font-size: 14px;"><a href="https://${subdomain}.useclinixy.online" style="color: #2563eb;">${subdomain}.useclinixy.online</a></td></tr>
        </table>
        <div style="margin-top: 28px; padding: 16px; background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 4px;">
          <p style="margin: 0; color: #15803d; font-size: 14px; font-weight: 600;">✅ Action: Contact them within 24 hours to welcome them and offer support.</p>
        </div>
      </div>
    </div>
  `;

  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        sender: { name: 'Clinixy Alerts', email: senderEmail },
        to: [{ email: ownerEmail, name: 'Clinixy Owner' }],
        subject: `🎉 New Signup: ${clinicName} just registered on Clinixy`,
        htmlContent: html
      })
    });
    console.log(`[Admin Alert] New clinic signup notification sent for: ${clinicName}`);
  } catch (error) {
    console.error('[Admin Alert] Failed to send new clinic notification:', error);
  }
};

// ─── ADMIN ALERT: Trial About to Expire ──────────────────────────────────────
export const sendAdminTrialExpiryAlert = async (
  clinicName: string,
  clinicEmail: string,
  clinicPhone: string,
  subdomain: string,
  daysLeft: number
): Promise<void> => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER;
  const ownerEmail = process.env.OWNER_ALERT_EMAIL || 'aksheshpatel97@gmail.com';

  if (!apiKey || !senderEmail) return;

  const urgencyColor = daysLeft <= 1 ? '#ef4444' : daysLeft <= 3 ? '#f97316' : '#eab308';
  const urgencyText = daysLeft === 0 ? 'EXPIRED TODAY' : daysLeft === 1 ? '1 DAY LEFT' : `${daysLeft} DAYS LEFT`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: ${urgencyColor}; padding: 28px 36px;">
        <h1 style="color: #fff; margin: 0; font-size: 20px; font-weight: 700;">⚠️ Trial Expiring — ${urgencyText}</h1>
      </div>
      <div style="padding: 36px;">
        <p style="color: #1e293b; font-size: 16px; margin: 0 0 20px;">A clinic's free trial is ending soon. Contact them now to convert to a paid plan:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #f1f5f9; width: 40%;">Clinic Name</td><td style="padding: 10px 0; font-weight: 600; color: #1e293b; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${clinicName}</td></tr>
          <tr><td style="padding: 10px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Email</td><td style="padding: 10px 0; font-weight: 600; font-size: 14px; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${clinicEmail}" style="color: #2563eb;">${clinicEmail}</a></td></tr>
          <tr><td style="padding: 10px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Phone</td><td style="padding: 10px 0; font-weight: 600; color: #1e293b; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${clinicPhone || 'Not provided'}</td></tr>
          <tr><td style="padding: 10px 0; color: #64748b; font-size: 14px;">Days Left</td><td style="padding: 10px 0; font-weight: 800; color: ${urgencyColor}; font-size: 16px;">${urgencyText}</td></tr>
        </table>
        <div style="margin-top: 28px; display: flex; gap: 12px;">
          <a href="mailto:${clinicEmail}" style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; margin-right: 12px;">📧 Email Them</a>
          <a href="https://wa.me/${clinicPhone?.replace(/[^0-9]/g, '')}" style="display: inline-block; background: #22c55e; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;">💬 WhatsApp</a>
        </div>
      </div>
    </div>
  `;

  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        sender: { name: 'Clinixy Alerts', email: senderEmail },
        to: [{ email: ownerEmail, name: 'Clinixy Owner' }],
        subject: `⚠️ Trial Expiring [${urgencyText}]: ${clinicName} — Contact Now`,
        htmlContent: html
      })
    });
    console.log(`[Admin Alert] Trial expiry alert sent for: ${clinicName} (${daysLeft} days left)`);
  } catch (error) {
    console.error('[Admin Alert] Failed to send trial expiry alert:', error);
  }
};

