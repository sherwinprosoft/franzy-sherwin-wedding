-- Additive schema only. No existing tables or guest RSVP data are modified.
CREATE TABLE IF NOT EXISTS reception_records (
  key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL, revision INTEGER NOT NULL,
  updated_at TEXT NOT NULL, last_op TEXT NOT NULL, updated_by TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS reception_operations (
  id TEXT PRIMARY KEY NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL,
  revision INTEGER NOT NULL, updated_at TEXT NOT NULL, updated_by TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS reception_login_attempts (
  key TEXT PRIMARY KEY NOT NULL, count INTEGER NOT NULL, started_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS reception_login_attempts_time ON reception_login_attempts(started_at);
