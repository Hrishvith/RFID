import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { existsSync, readFileSync, renameSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

// Loaded here directly (not just relied on via mailer.js) so MONGODB_URI is
// available regardless of module import order.
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEGACY_USERS_JSON = path.join(__dirname, "users.json");

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set in .env - cannot connect to MongoDB.");
}

// Without an explicit timeout, the driver retries server selection for its
// 30s default on every single query before giving up - which is exactly
// what made login "hang" instead of failing fast with a clear error.
const client = new MongoClient(MONGODB_URI, {
  serverSelectionTimeoutMS: 6000,
  connectTimeoutMS: 6000,
});
// Connecting lazily (only on first actual use, inside a try/catch at the
// call site) instead of eagerly at module load avoids two problems seen in
// production: an eager connect() that fails before anything awaits it is an
// unhandled rejection that crashes the whole process, and caching that one
// rejected promise forever means the server would need a manual restart to
// ever work again even after MongoDB comes back. Resetting dbPromise on
// failure lets the very next request retry instead.
let dbPromise = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = client
      .connect()
      .then((c) => c.db("rfid"))
      .catch((err) => {
        dbPromise = null;
        throw err;
      });
  }
  return dbPromise;
}

export async function getUsersCollection() {
  const db = await getDb();
  return db.collection("users");
}

/**
 * One-time migration from the old server/users.json flat file into the
 * "users" collection, run once at server startup. No-op if the collection
 * already has users (already migrated) or users.json doesn't exist.
 */
export async function migrateLegacyUsersJson() {
  if (!existsSync(LEGACY_USERS_JSON)) return;

  const users = await getUsersCollection();
  const existingCount = await users.countDocuments();
  if (existingCount > 0) return;

  const legacyUsers = JSON.parse(readFileSync(LEGACY_USERS_JSON, "utf-8"));
  if (legacyUsers.length === 0) return;

  await users.insertMany(legacyUsers.map(({ id, ...rest }) => ({ _id: id, ...rest })));

  renameSync(LEGACY_USERS_JSON, `${LEGACY_USERS_JSON}.migrated`);
  console.log(
    `[mock-api] Migrated ${legacyUsers.length} user(s) from users.json into MongoDB (users.json renamed to users.json.migrated).`
  );
}
