// Google Apps Script Web App URL
export const API_BASE_URL =
  "https://script.google.com/macros/s/AKfycbz9BLblcTYmecYf6NVmK_aF-N0iYkY0mzA5PJtH9r2zYwvxtI7byPc5z1qmdsruMrqQng/exec";

/**
 * Makes requests to the Google Apps Script backend.
 * Example:
 *   apiRequest("students")
 *   apiRequest("attendance")
 *   apiRequest("dashboard")
 */
export async function apiRequest(action) {

  const url = `${API_BASE_URL}?action=${action}`;

  let response;

  try {

    response = await fetch(url);

  } catch (error) {

    throw new Error("Unable to reach Google Apps Script.");

  }

  if (!response.ok) {

    throw new Error(`Request failed (${response.status})`);

  }

  return await response.json();

}

// Local Express auth server (see /server) - handles register/login/OTP
// against real, bcrypt-hashed, persisted user accounts.
const AUTH_API_BASE_URL = "http://localhost:4000/api";

/**
 * Makes requests to the local Express auth server.
 * Example:
 *   authRequest("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) })
 */
export async function authRequest(path, options = {}) {

  const url = `${AUTH_API_BASE_URL}${path}`;

  let response;

  try {

    response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

  } catch (error) {

    throw new Error(
      "Unable to reach the authentication server. Make sure it's running (npm run dev:all)."
    );

  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {

    throw new Error(data?.message || `Request failed (${response.status})`);

  }

  return data;

}