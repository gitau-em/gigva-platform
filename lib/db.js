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
                CREATE TABLE IF NOT EXISTS message_attachments (
              id TEXT PRIMARY KEY,
              message_id TEXT NOT NULL,
              message_type TEXT NOT NULL DEFAULT 'sent',
              filename TEXT NOT NULL,
              mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
              size INTEGER NOT NULL DEFAULT 0,
              data BLOB NOT NULL,
              created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
              FOREIGN KEY (message_id) REFERENCES sent_emails(id) ON DELETE CASCADE
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

  // Payroll tables
  try { database.exec(`
    CREATE TABLE IF NOT EXISTS payroll_employees (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL,
      employee_id TEXT UNIQUE,
      department TEXT DEFAULT '',
      designation TEXT DEFAULT '',
      email TEXT NOT NULL,
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      date_employed TEXT DEFAULT '',
      marital_status TEXT DEFAULT 'Single',
      id_number TEXT DEFAULT '',
      bank_name TEXT DEFAULT '',
      bank_account TEXT DEFAULT '',
      bank_code TEXT DEFAULT '',
      basic_pay REAL DEFAULT 0,
      house_allowance REAL DEFAULT 0,
      car_benefit REAL DEFAULT 0,
      other_allowances REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );
    CREATE TABLE IF NOT EXISTS payroll_payslips (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      employee_id TEXT REFERENCES payroll_employees(id),
      period_month INTEGER NOT NULL,
      period_year INTEGER NOT NULL,
      period_start TEXT DEFAULT '',
      period_end TEXT DEFAULT '',
      basic_pay REAL DEFAULT 0,
      house_allowance REAL DEFAULT 0,
      car_benefit REAL DEFAULT 0,
      other_allowances REAL DEFAULT 0,
      gross_pay REAL DEFAULT 0,
      nssf REAL DEFAULT 0,
      pension_provident REAL DEFAULT 0,
      hosp_mortgage_interest REAL DEFAULT 0,
      gross_taxable REAL DEFAULT 0,
      net_taxable REAL DEFAULT 0,
      paye REAL DEFAULT 0,
      personal_relief REAL DEFAULT 0,
      net_tax REAL DEFAULT 0,
      nhif REAL DEFAULT 0,
      net_pay REAL DEFAULT 0,
      leave_balance_days INTEGER DEFAULT 0,
      leave_from TEXT DEFAULT '',
      leave_to TEXT DEFAULT '',
      leave_days_taken INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      slip_ref TEXT DEFAULT '',
      generated_by TEXT DEFAULT '',
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    )
  `) } catch (_) {}
  seedPayrollEmployees(database)

  seedAllStaff(database)
}

function seedPayrollEmployees(database) {
  const count = database.prepare('SELECT COUNT(*) as n FROM payroll_employees').get()
  if (count && count.n > 0) return
  const STAFF = [
    { name: 'Mwangi Kamau', employee_id: 'GVA-001', department: 'Executive', designation: 'Chief Executive Officer', email: 'ceo@gigva.co.ke', date_employed: '2012-01-01', marital_status: 'Single', basic_pay: 250000, house_allowance: 30000, car_benefit: 20000, other_allowances: 0 },
    { name: 'Aisha Waweru', employee_id: 'GVA-002', department: 'Technology', designation: 'Chief Technology Officer', email: 'cto@gigva.co.ke', date_employed: '2012-01-01', marital_status: 'Single', basic_pay: 220000, house_allowance: 25000, car_benefit: 15000, other_allowances: 0 },
    { name: 'Samuel Otieno', employee_id: 'GVA-003', department: 'Customer Success', designation: 'Head of Customer Success', email: 'samuel.otieno@gigva.co.ke', date_employed: '2012-03-01', marital_status: 'Married', basic_pay: 150000, house_allowance: 20000, car_benefit: 10000, other_allowances: 0 },
    { name: 'Njeri Mwangi', employee_id: 'GVA-004', department: 'Product', designation: 'Product Manager', email: 'njeri.mwangi@gigva.co.ke', date_employed: '2013-06-01', marital_status: 'Single', basic_pay: 140000, house_allowance: 15000, car_benefit: 0, other_allowances: 0 },
    { name: 'Edward Gitau', employee_id: 'GVA-005', department: 'Engineering', designation: 'Lead Engineer', email: 'edward.gitau@gigva.co.ke', date_employed: '2013-06-01', marital_status: 'Single', basic_pay: 135000, house_allowance: 15000, car_benefit: 0, other_allowances: 0 },
    { name: 'Daniel Njoroge', employee_id: 'GVA-006', department: 'Operations', designation: 'Operations Lead', email: 'daniel.njoroge@gigva.co.ke', date_employed: '2014-01-01', marital_status: 'Married', basic_pay: 120000, house_allowance: 12000, car_benefit: 0, other_allowances: 0 },
    { name: 'James Odhiambo', employee_id: 'GVA-007', department: 'Finance', designation: 'Finance Manager', email: 'james.odhiambo@gigva.co.ke', date_employed: '2014-03-01', marital_status: 'Single', basic_pay: 125000, house_allowance: 12000, car_benefit: 0, other_allowances: 0 },
    { name: 'Fatuma Kamau', employee_id: 'GVA-008', department: 'People & Culture', designation: 'People & Culture Manager', email: 'fatuma.kamau@gigva.co.ke', date_employed: '2014-06-01', marital_status: 'Married', basic_pay: 120000, house_allowance: 11750, car_benefit: 0, other_allowances: 0 },
  ]
  const ins = database.prepare('INSERT OR IGNORE INTO payroll_employees (name, employee_id, department, designation, email, date_employed, marital_status, basic_pay, house_allowance, car_benefit, other_allowances, is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,1)')
  for (const s of STAFF) ins.run(s.name, s.employee_id, s.department, s.designation, s.email, s.date_employed, s.marital_status, s.basic_pay, s.house_allowance, s.car_benefit, s.other_allowances)
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
