import dotenv from "dotenv";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export function isSmtpConfigured() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!isSmtpConfigured()) {
    console.warn(
      "SMTP not configured. Password reset emails will be logged to the console instead."
    );
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

const transporter = createTransporter();

export async function sendPasswordResetEmail(to, resetUrl) {
  const subject = "Reset Your Habit Tracker Password";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body style="margin:0; padding:0; background-color:#f4f4f8; font-family:Arial,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f8; padding:40px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.08); overflow:hidden;">
              <tr>
                <td style="background:#7c5cff; padding:32px 40px; text-align:center;">
                  <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700;">Password Reset</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:36px 40px 24px;">
                  <p style="margin:0 0 16px; color:#374151; font-size:16px; line-height:1.6;">Hi there,</p>
                  <p style="margin:0 0 24px; color:#374151; font-size:16px; line-height:1.6;">
                    We received a request to reset your <strong>Habit Tracker</strong> account password.
                    Click the button below to set a new password:
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                    <tr>
                      <td style="border-radius:12px; background:#7c5cff;">
                        <a href="${resetUrl}" target="_blank" style="display:inline-block; padding:14px 36px; color:#ffffff; text-decoration:none; font-size:16px; font-weight:600;">
                          Reset My Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:0 0 16px; color:#6b7280; font-size:14px; line-height:1.6;">
                    This link will expire in <strong>5 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
                  </p>
                  <p style="margin:0 0 8px; color:#9ca3af; font-size:12px; line-height:1.5;">
                    If the button above does not work, copy and paste this URL into your browser:
                  </p>
                  <p style="margin:0; word-break:break-all; color:#7c5cff; font-size:12px; line-height:1.5;">
                    <a href="${resetUrl}" style="color:#7c5cff; text-decoration:underline;">${resetUrl}</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 40px 28px; border-top:1px solid #f3f4f6; text-align:center;">
                  <p style="margin:0; color:#9ca3af; font-size:12px;">
                    &copy; ${new Date().getFullYear()} Habit Tracker
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

Hi there,

We received a request to reset your Habit Tracker account password.
Visit the link below to set a new password:

${resetUrl}

This link will expire in 5 minutes.
If you did not request this, you can safely ignore this email.
  `.trim();

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  };

  if (!transporter) {
    console.log("\nPASSWORD RESET EMAIL (dev mode)");
    console.log("------------------------------------------");
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Link:    ${resetUrl}`);
    console.log("------------------------------------------\n");
    return { sent: false, resetUrl };
  }

  const info = await transporter.sendMail(mailOptions);
  console.log(
    "Password reset email sent",
    JSON.stringify({
      to,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    })
  );
  return { sent: true, info };
}
