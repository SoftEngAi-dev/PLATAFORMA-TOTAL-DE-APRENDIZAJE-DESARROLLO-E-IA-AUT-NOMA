import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

const databasePath = resolve(process.env.TOTALAI_DB_PATH ?? ".data/totalai.sqlite");
mkdirSync(dirname(databasePath), { recursive: true });
const database = new DatabaseSync(databasePath);

database.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'es',
    level TEXT NOT NULL DEFAULT 'explorer',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS identities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    subject TEXT NOT NULL,
    password_hash TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(provider, subject)
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS progress (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL,
    status TEXT NOT NULL,
    completed_percent INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL,
    PRIMARY KEY(user_id, lesson_id)
  );
`);

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

function verifyPassword(password, stored) {
  if (!stored?.includes(":")) return false;
  const [salt, expected] = stored.split(":");
  const actual = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

function tokenHash(token) {
  return scryptSync(token, "totalai-session", 32).toString("hex");
}

function validateCredential(provider, value) {
  if (provider === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "email_invalid";
  }
  if (provider === "phone" && !/^\+[1-9]\d{7,14}$/.test(value)) {
    return "phone_invalid";
  }
  return null;
}

function userFromId(id) {
  const user = database.prepare("SELECT id, display_name AS displayName, language, level FROM users WHERE id = ?").get(id);
  if (!user) return null;
  const progress = database.prepare(
    "SELECT lesson_id AS lessonId, status, completed_percent AS completedPercent, updated_at AS updatedAt FROM progress WHERE user_id = ? ORDER BY updated_at DESC"
  ).all(id);
  return { ...user, skills: [], progress };
}

function createSession(userId) {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expires = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);
  database.prepare("INSERT INTO sessions(token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .run(tokenHash(token), userId, expires.toISOString(), now.toISOString());
  return { token, expiresAt: expires.toISOString() };
}

export function registerCredential({ provider, subject, password, displayName }) {
  if (!["email", "phone"].includes(provider)) return { error: "credential_provider_invalid" };
  const normalized = String(subject ?? "").trim().toLowerCase();
  const validation = validateCredential(provider, normalized);
  if (validation) return { error: validation };
  if (typeof password !== "string" || password.length < 8) return { error: "password_too_short" };
  if (database.prepare("SELECT id FROM identities WHERE provider = ? AND subject = ?").get(provider, normalized)) {
    return { error: "identity_already_exists" };
  }
  const userId = randomUUID();
  const now = new Date().toISOString();
  database.prepare("INSERT INTO users(id, display_name, created_at) VALUES (?, ?, ?)").run(
    userId,
    String(displayName ?? normalized.split("@")[0]).trim().slice(0, 80) || "Explorador",
    now
  );
  database.prepare("INSERT INTO identities(id, user_id, provider, subject, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(randomUUID(), userId, provider, normalized, hashPassword(password), now);
  return { user: userFromId(userId), session: createSession(userId) };
}

export function loginCredential({ provider, subject, password }) {
  const normalized = String(subject ?? "").trim().toLowerCase();
  const identity = database.prepare("SELECT user_id AS userId, password_hash AS passwordHash FROM identities WHERE provider = ? AND subject = ?")
    .get(provider, normalized);
  if (!identity || !verifyPassword(String(password ?? ""), identity.passwordHash)) return { error: "invalid_credentials" };
  return { user: userFromId(identity.userId), session: createSession(identity.userId) };
}

export function loginDevelopmentSocial({ provider, subject, displayName }) {
  if (!["google", "github", "facebook", "x"].includes(provider)) return { error: "social_provider_invalid" };
  if ((process.env.AUTH_MODE ?? "development") !== "development") return { error: "oauth_not_configured" };
  const normalized = String(subject ?? "").trim();
  if (!normalized) return { error: "social_subject_required" };
  let identity = database.prepare("SELECT user_id AS userId FROM identities WHERE provider = ? AND subject = ?")
    .get(provider, normalized);
  if (!identity) {
    const userId = randomUUID();
    const now = new Date().toISOString();
    database.prepare("INSERT INTO users(id, display_name, created_at) VALUES (?, ?, ?)").run(
      userId, String(displayName ?? "Usuario social").trim().slice(0, 80), now
    );
    database.prepare("INSERT INTO identities(id, user_id, provider, subject, created_at) VALUES (?, ?, ?, ?, ?)")
      .run(randomUUID(), userId, provider, normalized, now);
    identity = { userId };
  }
  return { user: userFromId(identity.userId), session: createSession(identity.userId), developmentOnly: true };
}

export function userForToken(token) {
  if (!token) return null;
  const session = database.prepare("SELECT user_id AS userId, expires_at AS expiresAt FROM sessions WHERE token_hash = ?")
    .get(tokenHash(token));
  if (!session || new Date(session.expiresAt) <= new Date()) return null;
  return userFromId(session.userId);
}

export function saveProgress(userId, lessonId, status, completedPercent) {
  const allowed = ["not_started", "in_progress", "completed"];
  if (!allowed.includes(status) || !lessonId) return { error: "progress_invalid" };
  const percent = Math.max(0, Math.min(100, Number(completedPercent) || (status === "completed" ? 100 : 0)));
  const updatedAt = new Date().toISOString();
  database.prepare(`
    INSERT INTO progress(user_id, lesson_id, status, completed_percent, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, lesson_id) DO UPDATE SET status = excluded.status,
      completed_percent = excluded.completed_percent, updated_at = excluded.updated_at
  `).run(userId, lessonId, status, percent, updatedAt);
  return { progress: userFromId(userId).progress };
}
