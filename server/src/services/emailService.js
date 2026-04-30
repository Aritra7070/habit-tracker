import nodemailer from "nodemailer";

/**
 * Create a reusable SMTP transporter.
 * Falls back to a console-only stub when SMTP is not configured (dev mode).
 */
function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn(
      "⚠️  SMTP not configured — emails will be logged to the console instead."
    );
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

const transporter = createTransporter();

/**
 * Send a password-reset email to the given address.
 *
 * @param {string} to        – recipient email
 * @param {string} resetUrl  – full URL the user should visit to reset their password
 */
export async function sendPasswordResetEmail(to, resetUrl) {
  const subject = "Reset Your Habit Tracker Password";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body style="margin:0; padding:0; background-color:#f4f4f8; font-family:'Inter',Arial,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f8; padding:40px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.08); overflow:hidden;">

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #7c5cff 0%, #6d4de6 100%); padding:32px 40px; text-align:center;">
                  <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700; letter-spacing:-0.5px;">
                    🔒 Password Reset
                  </h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:36px 40px 24px;">
                  <p style="margin:0 0 16px; color:#374151; font-size:16px; line-height:1.6;">
                    Hi there,
                  </p>
                  <p style="margin:0 0 24px; color:#374151; font-size:16px; line-height:1.6;">
                    We received a request to reset your <strong>Habit Tracker</strong> account password.
                    Click the button below to set a new password:
                  </p>

                  <!-- CTA Button -->
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                    <tr>
                      <td style="border-radius:12px; background:linear-gradient(135deg, #7c5cff 0%, #6d4de6 100%);">
                        <a href="${resetUrl}" target="_blank"
                          style="display:inline-block; padding:14px 36px; color:#ffffff; text-decoration:none; font-size:16px; font-weight:600; letter-spacing:0.3px;">
                          Reset My Password
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 16px; color:#6b7280; font-size:14px; line-height:1.6;">
                    This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.
                  </p>

                  <!-- Fallback link -->
                  <p style="margin:0 0 8px; color:#9ca3af; font-size:12px; line-height:1.5;">
                    If the button above doesn't work, copy and paste this URL into your browser:
                  </p>
                  <p style="margin:0; word-break:break-all; color:#7c5cff; font-size:12px; line-height:1.5;">
                    <a href="${resetUrl}" style="color:#7c5cff; text-decoration:underline;">${resetUrl}</a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px 28px; border-top:1px solid #f3f4f6; text-align:center;">
                  <p style="margin:0; color:#9ca3af; font-size:12px;">
                    © ${new Date().getFullYear()} Habit Tracker · Sent with ❤️
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

  const text = `
Reset Your Habit Tracker Password
──────────────────────────────────

Hi there,

We received a request to reset your Habit Tracker account password.
Visit the link below to set a new password:

${resetUrl}

This link will expire in 1 hour.
If you didn't request this, you can safely ignore this email.
  `.trim();

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  };

  // If no transporter, log to console (dev/test mode)
  if (!transporter) {
    console.log("\n══════════════════════════════════════════");
    console.log("📧  PASSWORD RESET EMAIL (dev mode)");
    console.log("──────────────────────────────────────────");
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Link:    ${resetUrl}`);
    console.log("══════════════════════════════════════════\n");
    return;
  }

  await transporter.sendMail(mailOptions);
  console.log(`📧  Password reset email sent to ${to}`);
}
