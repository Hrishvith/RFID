import dotenv from "dotenv";

dotenv.config();

// Render blocks all outbound SMTP traffic (both port 465 and 587 hang until
// timeout, regardless of DNS/IPv4 fixes), so OTP emails go through Resend's
// HTTP API instead - plain HTTPS, which isn't blocked.
const { RESEND_API_KEY, RESEND_FROM_EMAIL } = process.env;

if (!RESEND_API_KEY) {
  console.warn(
    "[mock-api] RESEND_API_KEY is not set in .env - OTP emails will fail to send."
  );
}

const FROM_EMAIL = RESEND_FROM_EMAIL || "RFID Smart Attendance <onboarding@resend.dev>";

/**
 * @param {string} to
 * @param {string} otp
 */
export async function sendOtpEmail(to, otp) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject: `${otp} is your RFID Attendance verification code`,
      text: `Your verification code is ${otp}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 420px; margin: 0 auto;">
          <p style="color:#0f172a; font-size:15px;">Use the code below to verify your RFID Attendance account:</p>
          <p style="font-size:32px; font-weight:700; letter-spacing:6px; color:#2563eb; margin:20px 0;">${otp}</p>
          <p style="color:#64748b; font-size:13px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend API request failed (${response.status}): ${body}`);
  }
}
