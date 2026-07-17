import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import {
  findUserByEmail,
  addUser,
  pendingRegistrations,
  generateOtp,
  OTP_TTL_MS,
} from "./userStore.js";
import { migrateLegacyUsersJson } from "./db.js";
import { sendOtpEmail } from "./mailer.js";

const PORT = process.env.PORT ?? 4000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Only this email is allowed to log in, regardless of how many accounts
// exist in users.json. Change ADMIN_EMAIL in .env to switch admins.
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "hrishvith@gmail.com").toLowerCase();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[mock-api] ${req.method} ${req.path}`);
  next();
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }
  let existing;
  try {
    existing = await findUserByEmail(email);
  } catch (err) {
    console.error("[mock-api] Database unreachable during register:", err.message);
    return res
      .status(503)
      .json({ message: "Unable to reach the database right now. Please try again in a moment." });
  }
  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const otp = generateOtp();
  const otpExpiresAt = Date.now() + OTP_TTL_MS;

  pendingRegistrations.set(email.toLowerCase(), { name, email, passwordHash, otp, otpExpiresAt });

  try {
    await sendOtpEmail(email, otp);
  } catch (err) {
    console.error("[mock-api] Failed to send OTP email:", err.message);
    return res
      .status(502)
      .json({ message: "Failed to send verification email. Please try again." });
  }

  console.log(`[mock-api] OTP for ${email}: ${otp} (also emailed)`);
  res.status(200).json({ message: "Verification code sent to your email.", email });
});

app.post("/api/auth/verify-otp", async (req, res) => {
  const { email, otp } = req.body ?? {};

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and verification code are required." });
  }

  const pending = pendingRegistrations.get(String(email).toLowerCase());
  if (!pending) {
    return res
      .status(400)
      .json({ message: "No pending registration found for this email. Please register again." });
  }
  if (Date.now() > pending.otpExpiresAt) {
    pendingRegistrations.delete(email.toLowerCase());
    return res
      .status(400)
      .json({ message: "Verification code expired. Please register again." });
  }
  if (pending.otp !== String(otp).trim()) {
    return res.status(400).json({ message: "Incorrect verification code." });
  }

  try {
    await addUser({
      id: randomUUID(),
      name: pending.name,
      email: pending.email,
      passwordHash: pending.passwordHash,
      role: pending.email.toLowerCase() === ADMIN_EMAIL ? "Administrator" : "User",
      department: null,
      phone: null,
      avatar: null,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[mock-api] Database unreachable during verify-otp:", err.message);
    return res
      .status(503)
      .json({ message: "Unable to reach the database right now. Please try again in a moment." });
  }
  pendingRegistrations.delete(email.toLowerCase());

  res.status(200).json({ message: "Account verified successfully. You can now log in." });
});

app.post("/api/auth/resend-otp", async (req, res) => {
  const { email } = req.body ?? {};
  const pending = pendingRegistrations.get(String(email ?? "").toLowerCase());

  if (!pending) {
    return res
      .status(400)
      .json({ message: "No pending registration found for this email. Please register again." });
  }

  pending.otp = generateOtp();
  pending.otpExpiresAt = Date.now() + OTP_TTL_MS;

  try {
    await sendOtpEmail(email, pending.otp);
  } catch (err) {
    console.error("[mock-api] Failed to resend OTP email:", err.message);
    return res
      .status(502)
      .json({ message: "Failed to send verification email. Please try again." });
  }

  console.log(`[mock-api] Resent OTP for ${email}: ${pending.otp}`);
  res.status(200).json({ message: "Verification code resent." });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password, portal } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  if (portal !== "admin" && portal !== "user") {
    return res.status(400).json({ message: "Unknown login portal." });
  }

  const isAdminAccount = email.trim().toLowerCase() === ADMIN_EMAIL;

  if (portal === "admin" && !isAdminAccount) {
    return res
      .status(403)
      .json({ message: "This login is restricted to the administrator account." });
  }
  if (portal === "user" && isAdminAccount) {
    return res
      .status(403)
      .json({ message: "Administrators should sign in from the Admin Login page." });
  }

  let user;
  try {
    user = await findUserByEmail(email);
  } catch (err) {
    console.error("[mock-api] Database unreachable during login:", err.message);
    return res
      .status(503)
      .json({ message: "Unable to reach the database right now. Please try again in a moment." });
  }
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const { passwordHash: _passwordHash, ...safeUser } = user;
  res.status(200).json({ user: safeUser, token: randomUUID() });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

migrateLegacyUsersJson()
  .catch((err) => console.error("[mock-api] Legacy users.json migration failed:", err))
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`[mock-api] Auth server ready at http://localhost:${PORT}`);
    });
  });
