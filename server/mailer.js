import dotenv from "dotenv";

dotenv.config();

// Render blocks all outbound SMTP traffic (both port 465 and 587 hang until
// timeout, regardless of DNS/IPv4 fixes), so OTP emails go through Brevo's
// HTTP API instead - plain HTTPS, which isn't blocked. Unlike Resend's
// sandbox mode, Brevo's free tier can email any recipient once the sender
// address below is verified - no domain ownership required.
const { BREVO_API_KEY, BREVO_FROM_EMAIL, BREVO_FROM_NAME } = process.env;

if (!BREVO_API_KEY) {
  console.warn(
    "[mock-api] BREVO_API_KEY is not set in .env - OTP emails will fail to send."
  );
}

const FROM_EMAIL = BREVO_FROM_EMAIL || "royalkumar.112112@gmail.com";
const FROM_NAME = BREVO_FROM_NAME || "RFID Smart Attendance";

/**
 * @param {string} to
 * @param {string} otp
 */
export async function sendOtpEmail(to, otp) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to }],
      subject: `${otp} is your RFID Attendance verification code`,
      textContent: `Your verification code is ${otp}. It expires in 10 minutes.`,
      htmlContent: `
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
    throw new Error(`Brevo API request failed (${response.status}): ${body}`);
  }
}
