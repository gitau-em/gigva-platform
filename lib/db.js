/**
 * lib/db.js
 * Singleton better-sqlite3 database connection with auto-schema init.
 * Creates the SQLite file + users table on first boot, seeds admin user.
 */

import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import bcrypt from 'bcrypt'

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'gigva.sqlite')

let _db = null

function initSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      email       TEXT    NOT NULL UNIQUE,
      password_hash TEXT  NOT NULL,
      role        TEXT    NOT NULL DEFAULT 'staff',
      is_admin    INTEGER NOT NULL DEFAULT 0,
      status      TEXT    NOT NULL DEFAULT 'active',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)
}

function seedAdmin(database) {
  const email    = process.env.ADMIN_EMAIL    || 'admin@gigvakenya.co.ke'
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe_SetInEnv!'
  const name     = process.env.ADMIN_NAME     || 'Gigva Admin'

  const existing = database.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
  if (!existing) {
    const hash = bcrypt.hashSync(password, 12)
    database.prepare(
      'INSERT INTO users (name, email, password_hash, role, is_admin, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, email.toLowerCase(), hash, 'admin', 1, 'active')
    console.log('[db] Seeded admin user:', email)
  }
}

export function db() {
  if (_db) return _db

  // Ensure data directory exists
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')

  initSchema(_db)
  seedAdmin(_db)

  return _db
}
