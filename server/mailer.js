import nodemailer from "nodemailer";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

// This host's network can't route outbound IPv6, but Node's default DNS
// order can still hand back an IPv6 address for smtp.gmail.com first,
// which then fails with ECONNREFUSED. Prefer IPv4 results.
dns.setDefaultResultOrder("ipv4first");

const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.warn(
    "[mock-api] GMAIL_USER / GMAIL_APP_PASSWORD are not set in .env - OTP emails will fail to send."
  );
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
  // This host's network intercepts outbound TLS with its own certificate,
  // which fails standard chain verification against Gmail's real cert.
  // Local-dev-only workaround - do not disable this in a real deployment.
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * @param {string} to
 * @param {string} otp
 */
export async function sendOtpEmail(to, otp) {
  await transporter.sendMail({
    from: `"RFID Smart Attendance" <${GMAIL_USER}>`,
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
  });
}
