/**
 * lib/db-init.js  â  run once before starting the server
 * Usage:
 *   node lib/db-init.js
 *   node lib/db-init.js --reset     (drops and recreates the database)
 *
 * CommonJS script â intentionally separate from the ESM app code.
 * Staff data is inlined here to avoid ESM/CJS interop issues.
 */

try { require('dotenv').config({ path: '.env.local' }); } catch(e) { /* dotenv not needed in production */ }
const path   = require('path')
const fs     = require('fs')
const DB     = require('better-sqlite3')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const DB_PATH         = process.env.DB_PATH       || path.join(process.cwd(), 'data', 'gigva.sqlite')
const ADMIN_EMAIL     = process.env.ADMIN_EMAIL    || 'infoeddie1@gmail.com'
const ADMIN_PASS      = process.env.ADMIN_PASSWORD
const STAFF_PASSWORD  = 'blue1ocean'
const SALT_ROUNDS     = 12

if (!ADMIN_PASS) {
  console.error('ERROR: ADMIN_PASSWORD is not set in .env.local. Aborting.')
  process.exit(1)
}

// ââ Staff roster (mirrors lib/roleConfig.js) ââââââââââââââââââââââââââââââ
const STAFF_ROSTER = [
  { name: 'Mwangi Kamau',   email: 'ceo@gigva.co.ke',            role: 'ceo'              },
  { name: 'Aisha Waweru',   email: 'cto@gigva.co.ke',            role: 'cto'              },
  { name: 'Samuel Otieno',  email: 'samuel.otieno@gigva.co.ke',  role: 'customer_success' },
  { name: 'Njeri Mwangi',   email: 'njeri.mwangi@gigva.co.ke',   role: 'product'          },
  { name: 'Edward Gitau',   email: 'edward.gitau@gigva.co.ke',   role: 'engineering'      },
  { name: 'Daniel Njoroge', email: 'daniel.njoroge@gigva.co.ke', role: 'operations'       },
  { name: 'James Odhiambo', email: 'james.odhiambo@gigva.co.ke', role: 'finance'          },
  { name: 'Fatuma Kamau',   email: 'fatuma.kamau@gigva.co.ke',   role: 'people_ops'       },
]

// ââ Ensure data directory âââââââââââââââââââââââââââââââââââââââââââââââââ
const dir = path.dirname(DB_PATH)
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

// ââ Optional reset ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
if (process.argv.includes('--reset') && fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH)
  console.log('â Database reset.')
}

const database = new DB(DB_PATH)
database.pragma('journal_mode = WAL')
database.pragma('foreign_keys = ON')

// ââ Schema ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    company TEXT DEFAULT '', phone TEXT DEFAULT '', role TEXT DEFAULT '',
    is_admin INTEGER DEFAULT 0, status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  CREATE TABLE IF NOT EXISTS demos (
    id TEXT PRIMARY KEY, name TEXT NOT NULL,
    email TEXT NOT NULL COLLATE NOCASE,
    company TEXT DEFAULT '', phone TEXT DEFAULT '',
    message TEXT DEFAULT '', interests TEXT DEFAULT '[]',
    business_type TEXT DEFAULT '',
    source TEXT DEFAULT 'demo',
    status TEXT DEFAULT 'pending', notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY, name TEXT NOT NULL,
    email TEXT NOT NULL COLLATE NOCASE,
    company TEXT DEFAULT '', role TEXT DEFAULT '', message TEXT NOT NULL,
    status TEXT DEFAULT 'new', notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  CREATE TABLE IF NOT EXISTS newsletter (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  CREATE INDEX IF NOT EXISTS idx_users_email     ON users(email);
  CREATE INDEX IF NOT EXISTS idx_demos_email     ON demos(email);
  CREATE INDEX IF NOT EXISTS idx_demos_status    ON demos(status);
  CREATE INDEX IF NOT EXISTS idx_contacts_email  ON contacts(email);
  CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
`)

// ââ Seed superadmin âââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const existingAdmin = database.prepare('SELECT id FROM users WHERE email = ?').get(ADMIN_EMAIL)
if (!existingAdmin) {
  const hash = bcrypt.hashSync(ADMIN_PASS, SALT_ROUNDS)
  const id   = crypto.randomBytes(8).toString('hex')
  database.prepare(`
    INSERT INTO users (id, name, email, password_hash, company, role, is_admin, status)
    VALUES (?, 'Super Admin', ?, ?, 'Gigva Kenya', 'superadmin', 1, 'active')
  `).run(id, ADMIN_EMAIL, hash)
  console.log(`â Superadmin created: ${ADMIN_EMAIL}`)
} else {
  console.log(`â Superadmin exists:  ${ADMIN_EMAIL}`)
}

// ââ Seed all staff (shared hash for speed) ââââââââââââââââââââââââââââââââ
const staffHash = bcrypt.hashSync(STAFF_PASSWORD, 10)
let seeded = 0, skipped = 0

for (const member of STAFF_ROSTER) {
  const exists = database.prepare('SELECT id FROM users WHERE email = ?').get(member.email)
  if (!exists) {
    const id = crypto.randomBytes(8).toString('hex')
    database.prepare(`
      INSERT INTO users (id, name, email, password_hash, company, role, is_admin, status)
      VALUES (?, ?, ?, ?, 'Gigva Kenya', ?, 0, 'active')
    `).run(id, member.name, member.email, staffHash, member.role)
    seeded++
  } else {
    skipped++
  }
}

console.log(`â Staff accounts: ${seeded} seeded, ${skipped} already exist`)

database.close()

console.log(`\nâ Database ready: ${path.resolve(DB_PATH)}`)
console.log('\nââ Staff login credentials ââââââââââââââââââââââââââââââ')
console.log('  Portal URL: http://localhost:3000/admin')
console.log('  Email:      <name>@gigva.co.ke  (e.g. ceo@gigva.co.ke)')
console.log('  Password:   blue1ocean')
console.log('\nââ Superadmin credentials âââââââââââââââââââââââââââââââ')
console.log('  Email:      ' + ADMIN_EMAIL)
console.log('  Password:   (from ADMIN_PASSWORD in .env.local)')
console.log('\n  npm run dev  â  http://localhost:3000\n')
