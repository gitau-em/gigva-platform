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

  // Payroll tables
  database.exec(`
    CREATE TABLE IF NOT EXISTS payroll_employees (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      name              TEXT NOT NULL,
      employee_id       TEXT,
      department        TEXT DEFAULT '',
      designation       TEXT DEFAULT '',
      email             TEXT NOT NULL,
      phone             TEXT DEFAULT '',
      address           TEXT DEFAULT '',
      date_employed     TEXT DEFAULT '',
      marital_status    TEXT DEFAULT '',
      id_number         TEXT DEFAULT '',
      bank_name         TEXT DEFAULT '',
      bank_account      TEXT DEFAULT '',
      bank_code         TEXT DEFAULT '',
      basic_pay         REAL DEFAULT 0,
      house_allowance   REAL DEFAULT 0,
      car_benefit       REAL DEFAULT 0,
      other_allowances  REAL DEFAULT 0,
      is_active         INTEGER DEFAULT 1,
      created_at        TEXT DEFAULT (datetime('now')),
      updated_at        TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS payroll_payslips (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id           INTEGER DEFAULT 0,
      period_month          INTEGER DEFAULT 0,
      period_year           INTEGER DEFAULT 0,
      period_start          TEXT DEFAULT '',
      period_end            TEXT DEFAULT '',
      basic_pay             REAL DEFAULT 0,
      house_allowance       REAL DEFAULT 0,
      car_benefit           REAL DEFAULT 0,
      other_allowances      REAL DEFAULT 0,
      gross_pay             REAL DEFAULT 0,
      nssf                  REAL DEFAULT 0,
      nssf_tier1            REAL DEFAULT 0,
      nssf_tier2            REAL DEFAULT 0,
      shif                  REAL DEFAULT 0,
      housing_levy          REAL DEFAULT 0,
      pension_provident     REAL DEFAULT 0,
      hosp_mortgage_interest REAL DEFAULT 0,
      gross_taxable         REAL DEFAULT 0,
      net_taxable           REAL DEFAULT 0,
      paye                  REAL DEFAULT 0,
      personal_relief       REAL DEFAULT 0,
      net_tax               REAL DEFAULT 0,
      nhif                  REAL DEFAULT 0,
      total_deductions      REAL DEFAULT 0,
      net_pay               REAL DEFAULT 0,
      leave_balance_days    INTEGER DEFAULT 0,
      leave_from            TEXT DEFAULT '',
      leave_to              TEXT DEFAULT '',
      leave_days_taken      INTEGER DEFAULT 0,
      notes                 TEXT DEFAULT '',
      slip_ref              TEXT DEFAULT '',
      generated_by          TEXT DEFAULT '',
      created_at            TEXT DEFAULT (datetime('now'))
    );
  `)

  // Safe migration: add any columns missing from existing payroll_payslips table
  try {
    const payslipCols = database.pragma('table_info(payroll_payslips)').map(r => r.name)
    const payslipMissingCols = [
      { name: 'employee_id',            def: 'INTEGER DEFAULT 0' },
      { name: 'period_month',           def: 'INTEGER DEFAULT 0' },
      { name: 'period_year',            def: 'INTEGER DEFAULT 0' },
      { name: 'period_start',           def: "TEXT DEFAULT ''" },
      { name: 'period_end',             def: "TEXT DEFAULT ''" },
      { name: 'basic_pay',              def: 'REAL DEFAULT 0' },
      { name: 'house_allowance',        def: 'REAL DEFAULT 0' },
      { name: 'car_benefit',            def: 'REAL DEFAULT 0' },
      { name: 'other_allowances',       def: 'REAL DEFAULT 0' },
      { name: 'gross_pay',              def: 'REAL DEFAULT 0' },
      { name: 'nssf',                   def: 'REAL DEFAULT 0' },
      { name: 'nssf_tier1',             def: 'REAL DEFAULT 0' },
      { name: 'nssf_tier2',             def: 'REAL DEFAULT 0' },
      { name: 'shif',                   def: 'REAL DEFAULT 0' },
      { name: 'housing_levy',           def: 'REAL DEFAULT 0' },
      { name: 'pension_provident',      def: 'REAL DEFAULT 0' },
      { name: 'hosp_mortgage_interest', def: 'REAL DEFAULT 0' },
      { name: 'gross_taxable',          def: 'REAL DEFAULT 0' },
      { name: 'net_taxable',            def: 'REAL DEFAULT 0' },
      { name: 'paye',                   def: 'REAL DEFAULT 0' },
      { name: 'personal_relief',        def: 'REAL DEFAULT 0' },
      { name: 'net_tax',                def: 'REAL DEFAULT 0' },
      { name: 'nhif',                   def: 'REAL DEFAULT 0' },
      { name: 'total_deductions',       def: 'REAL DEFAULT 0' },
      { name: 'net_pay',                def: 'REAL DEFAULT 0' },
      { name: 'leave_balance_days',     def: 'INTEGER DEFAULT 0' },
      { name: 'leave_from',             def: "TEXT DEFAULT ''" },
      { name: 'leave_to',               def: "TEXT DEFAULT ''" },
      { name: 'leave_days_taken',       def: 'INTEGER DEFAULT 0' },
      { name: 'notes',                  def: "TEXT DEFAULT ''" },
      { name: 'slip_ref',               def: "TEXT DEFAULT ''" },
      { name: 'generated_by',           def: "TEXT DEFAULT ''" },
      { name: 'created_at',             def: "TEXT DEFAULT (datetime('now'))" },
    ]
    for (const col of payslipMissingCols) {
      if (!payslipCols.includes(col.name)) {
        database.exec(`ALTER TABLE payroll_payslips ADD COLUMN ${col.name} ${col.def}`)
      }
    }
  } catch(e) {
    console.error('[db] payroll migration error:', e.message)
  }
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
