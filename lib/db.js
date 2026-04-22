/**
 * lib/db.js - Singleton better-sqlite3 instance
 */
import path     from 'path'
import fs       from 'fs'
import Database from 'better-sqlite3'
import bcrypt   from 'bcrypt'
import crypto   from 'crypto'
import { STAFF_ROSTER, STAFF_DEFAULT_PASSWORD } from './roleConfig.js'

const DB_PATH    = process.env.DB_PATH    || path.join(process.cwd(), 'data', 'gigva.sqlite')
const SALT_ROUNDS = 12
let _db = null

export function db() {
    if (_db) return _db
  const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')
    _db.pragma('foreign_keys = ON')
  migrate(_db)
    return _db
}

function migrate(database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS users (
              id TEXT PRIMARY KEY, name TEXT NOT NULL,
              email TEXT NOT NULL UNIQUE COLLATE NOCASE,
              password_hash TEXT NOT NULL, company TEXT DEFAULT '',
              phone TEXT DEFAULT '', role TEXT DEFAULT '',
              is_admin INTEGER DEFAULT 0, status TEXT DEFAULT 'active',
              created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
              updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        );
        CREATE TABLE IF NOT EXISTS demos (
              id TEXT PRIMARY KEY, name TEXT NOT NULL,
              email TEXT NOT NULL COLLATE NOCASE, company TEXT DEFAULT '',
              phone TEXT DEFAULT '', message TEXT DEFAULT '',
              interests TEXT DEFAULT '[]', business_type TEXT DEFAULT '',
              source TEXT DEFAULT 'demo', status TEXT DEFAULT 'pending',
              notes TEXT DEFAULT '',
              created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
              updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        );
        CREATE TABLE IF NOT EXISTS contacts (
              id TEXT PRIMARY KEY, name TEXT NOT NULL,
              email TEXT NOT NULL COLLATE NOCASE, company TEXT DEFAULT '',
              role TEXT DEFAULT '', message TEXT NOT NULL,
              status TEXT DEFAULT 'new', notes TEXT DEFAULT '',
              created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
              updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        );
        CREATE TABLE IF NOT EXISTS newsletter (
              id TEXT PRIMARY KEY,
              email TEXT NOT NULL UNIQUE COLLATE NOCASE,
              created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        );
        CREATE TABLE IF NOT EXISTS inbox_messages (
              id TEXT PRIMARY KEY,
              to_email TEXT NOT NULL COLLATE NOCASE,
              from_email TEXT NOT NULL, from_name TEXT DEFAULT '',
              subject TEXT DEFAULT '(no subject)',
              body_text TEXT DEFAULT '', body_html TEXT DEFAULT '',
              is_read INTEGER DEFAULT 0,
              created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
              replied INTEGER DEFAULT 0, replied_at TEXT,
              replied_by TEXT, reply_text TEXT
        );
        CREATE TABLE IF NOT EXISTS sent_emails (
              id TEXT PRIMARY KEY,
              from_email TEXT NOT NULL COLLATE NOCASE,
              to_email TEXT NOT NULL, subject TEXT DEFAULT '',
              body_text TEXT DEFAULT '', body_html TEXT DEFAULT '',
              resend_id TEXT DEFAULT '',
              sent_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        );
        CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
        CREATE INDEX IF NOT EXISTS idx_demos_email       ON demos(email);
        CREATE INDEX IF NOT EXISTS idx_contacts_email    ON contacts(email);
        CREATE INDEX IF NOT EXISTS idx_demos_status      ON demos(status);
        CREATE INDEX IF NOT EXISTS idx_contacts_status   ON contacts(status);
        CREATE INDEX IF NOT EXISTS idx_inbox_to_email    ON inbox_messages(to_email);
        CREATE INDEX IF NOT EXISTS idx_inbox_created_at  ON inbox_messages(created_at);
        CREATE INDEX IF NOT EXISTS idx_sent_from_email   ON sent_emails(from_email);
        CREATE INDEX IF NOT EXISTS idx_sent_sent_at      ON sent_emails(sent_at);
    `)
  const replyColsSQL = [
    "ALTER TABLE inbox_messages ADD COLUMN replied     INTEGER DEFAULT 0",
    "ALTER TABLE inbox_messages ADD COLUMN replied_at  TEXT",
    "ALTER TABLE inbox_messages ADD COLUMN replied_by  TEXT",
    "ALTER TABLE inbox_messages ADD COLUMN reply_text  TEXT",
  ]
  for (const sql of replyColsSQL) {
    try { database.prepare(sql).run() } catch (_) {}
  }
  try { database.prepare("ALTER TABLE inbox_messages ADD COLUMN message_id TEXT DEFAULT ''").run() } catch (_) {}
  try {
    database.exec(`CREATE TABLE IF NOT EXISTS sent_emails (
      id TEXT PRIMARY KEY, from_email TEXT NOT NULL COLLATE NOCASE,
      to_email TEXT NOT NULL, subject TEXT DEFAULT '',
      body_text TEXT DEFAULT '', body_html TEXT DEFAULT '',
      resend_id TEXT DEFAULT '',
      sent_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    )`)
  } catch (_) {}
  try { database.prepare("CREATE INDEX IF NOT EXISTS idx_sent_from_email ON sent_emails(from_email)").run() } catch (_) {}
  try { database.prepare("CREATE INDEX IF NOT EXISTS idx_sent_sent_at ON sent_emails(sent_at)").run() } catch (_) {}
  seedAllStaff(database)
}

function seedAllStaff(database) {
  const adminEmail = process.env.ADMIN_EMAIL    || 'infoeddie1@gmail.com'
  const adminPass  = process.env.ADMIN_PASSWORD
  if (!adminPass) {
    console.warn('[db] WARNING: ADMIN_PASSWORD env var is not set.')
  }
  const existing = database.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail)
  if (!existing && adminPass) {
    const hash = bcrypt.hashSync(adminPass, SALT_ROUNDS)
    const id   = crypto.randomBytes(8).toString('hex')
    database.prepare(`
      INSERT INTO users (id, name, email, password_hash, company, role, is_admin, status)
      VALUES (?, 'Super Admin', ?, ?, 'Gigva Kenya', 'superadmin', 1, 'active')
    `).run(id, adminEmail, hash)
    console.log('[db] Super admin seeded:', adminEmail)
  }
  const staffHash = bcrypt.hashSync(STAFF_DEFAULT_PASSWORD, 10)
  for (const member of STAFF_ROSTER) {
    const existing = database.prepare('SELECT id FROM users WHERE email = ?').get(member.email)
    if (!existing) {
      const id = crypto.randomBytes(8).toString('hex')
      database.prepare(`
        INSERT INTO users (id, name, email, password_hash, company, role, is_admin, status)
        VALUES (?, ?, ?, ?, ?, ?, 0, 'active')
      `).run(id, member.name, member.email, staffHash, member.company, member.role)
      console.log('[db] Staff seeded:', member.email, `(${member.role})`)
    }
  }
}
