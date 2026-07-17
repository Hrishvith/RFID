import { authRequest } from "./apiClient";
import { mockDelay } from "../utils/mockDelay";

const SESSION_KEY = "rfid_dashboard_session";

/**
 * Authenticates against the local mock API server (see /server), which
 * checks the email/password against real registered (and verified) users -
 * a real HTTP round-trip instead of checking a bundled JSON file in the
 * browser.
 * @param {{ email: string, password: string, rememberMe?: boolean, portal: "admin" | "user" }} credentials
 */
export async function login({ email, password, rememberMe, portal }) {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const { user, token } = await authRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, portal }),
  });

  const session = { user, token, loggedInAt: Date.now() };
  const storage = rememberMe ? window.localStorage : window.sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logout() {
  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  const raw =
    window.localStorage.getItem(SESSION_KEY) ?? window.sessionStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Starts registration: the server creates a pending (unverified) record and
 * emails a one-time code to `email`. The account isn't created until
 * verifyOtp succeeds.
 * @param {{ name: string, email: string, password: string }} details
 */
export async function register({ name, email, password }) {
  if (!name || !email || !password) {
    throw new Error("Name, email and password are required.");
  }
  return authRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

/**
 * @param {{ email: string, otp: string }} details
 */
export async function verifyOtp({ email, otp }) {
  if (!email || !otp) {
    throw new Error("Email and verification code are required.");
  }
  return authRequest("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export async function resendOtp(email) {
  if (!email) throw new Error("Email is required.");
  return authRequest("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function requestPasswordReset(email) {
  await mockDelay(500);
  if (!email) throw new Error("Email is required.");
  return { sent: true, email };
}
