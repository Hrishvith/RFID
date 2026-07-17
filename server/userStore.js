import { getUsersCollection } from "./db.js";

/** Converts a Mongo document ({_id, ...}) back to the app's user shape ({id, ...}). */
function toUser(doc) {
  if (!doc) return undefined;
  const { _id, ...rest } = doc;
  return { id: _id, ...rest };
}

/** Verified, logged-in-able accounts. Persisted in MongoDB Atlas. */
export async function readUsers() {
  const users = await getUsersCollection();
  const docs = await users.find({}).toArray();
  return docs.map(toUser);
}

// Case-insensitive *exact* match via collation (not regex - interpolating
// user input into a regex would be a NoSQL injection vector, e.g. an email
// of ".*" matching every user).
const CASE_INSENSITIVE = { locale: "en", strength: 2 };

export async function findUserByEmail(email) {
  const users = await getUsersCollection();
  const doc = await users.findOne({ email }, { collation: CASE_INSENSITIVE });
  return toUser(doc);
}

export async function addUser(user) {
  const users = await getUsersCollection();
  const { id, ...rest } = user;
  await users.insertOne({ _id: id, ...rest });
  return user;
}

/**
 * Registrations that have submitted the form but not yet verified their
 * OTP. Deliberately in-memory only (not written to disk) - if the server
 * restarts mid-verification the user just registers again.
 * Keyed by lowercased email.
 * @type {Map<string, { name: string, email: string, passwordHash: string, otp: string, otpExpiresAt: number }>}
 */
export const pendingRegistrations = new Map();

export const OTP_TTL_MS = 10 * 60 * 1000;

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
