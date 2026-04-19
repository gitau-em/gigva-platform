# Gigva Kenya — Next.js Application

Production-ready SaaS website for Gigva — M-Pesa reconciliation software for Kenyan SMBs.

**Stack:** Next.js 14 App Router · Tailwind CSS 3 · better-sqlite3 · bcrypt · JWT · Zod

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Open .env.local — set JWT_SECRET to a 64-byte random hex string:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 3. Initialise database (creates SQLite + admin user)
node lib/db-init.js

# 4. Run development server
npm run dev   # http://localhost:3000
```

---

## Pages

| Route        | Purpose                                                    |
|-------------|-------------------------------------------------------------|
| `/`          | Home — hero, problem, live dashboard, workflow, modules    |
| `/product`   | Product overview with architecture detail                  |
| `/features`  | Full feature list + step-by-step workflow walkthroughs     |
| `/pricing`   | Three-tier pricing with full FAQ                           |
| `/about`     | Team, mission, security, direct contact                    |
| `/contact`   | Demo request form + general contact form                   |
| `/privacy`   | Privacy policy (Kenya DPA 2019 compliant)                  |
| `/terms`     | Terms of service                                           |

---

## API Routes

| Method | Path                   | Auth   | Description                    |
|--------|------------------------|--------|--------------------------------|
| POST   | `/api/auth/register`   | Public | Create account (bcrypt + JWT)  |
| POST   | `/api/auth/login`      | Public | Login, returns JWT token       |
| POST   | `/api/demo`            | Public | Submit demo booking request    |
| GET    | `/api/demo`            | —      | List all demo requests         |
| POST   | `/api/contact`         | Public | Submit contact form message    |
| GET    | `/api/contact`         | —      | List all contact messages      |
| POST   | `/api/newsletter`      | Public | Subscribe email to updates     |
| GET    | `/api/health`          | Public | Health check endpoint          |

---

## Component Map

```
components/
├── layout/
│   ├── Navbar.js          Fixed nav — mobile responsive, route-aware active state
│   └── Footer.js          Site footer — ICP targeting, DPA compliance note
│
├── home/
│   ├── Hero.js            Two-col hero — headline, value prop, mini dashboard, dual CTAs
│   ├── ProblemStatement.js The problem M-Pesa + Excel creates for Kenyan SMBs
│   ├── HowItWorks.js      5-step workflow with explicit IN/OUT at each step
│   ├── Modules.js         4-module breakdown — Payments, Analytics, Alerts, Integrations
│   ├── SocialProof.js     Early-access positioning + 3 testimonials with star ratings
│   ├── PricingSnippet.js  Plan comparison teaser with dual CTA
│   └── CtaBanner.js       Bottom CTA — ICP-specific, dual buttons
│
├── product/
│   └── DashboardPreview.js  Realistic dashboard with:
│                            - 7 transactions with date/amount/status/sender
│                            - 4 metric cards (revenue, reconciled, flagged, failed)
│                            - Working status filter buttons
│                            - Live search by name or reference
│                            - Export button, "Last synced" indicator
│
├── forms/
│   ├── DemoForm.js        Name/email/company/phone/businessType/interests/message
│   │                      Full validation, loading state, success state
│   └── ContactForm.js     Name/email/company/role/message with validation
│
└── ui/
    └── Button.js          Reusable Button (primary/secondary/ghost/danger) + Badge
```

---

## Architecture Decisions

### Positioning
One platform, not multiple products. Every page describes Gigva as a unified Business OS
with four built-in modules. No "Gigva AI", no "Gigva Cloud" — just one product.

### ICP Targeting
All copy targets "Kenyan retail shops, logistics firms, and SMEs handling daily M-Pesa 
transactions" — not generic "companies". Every feature description includes a specific 
use-case.

### Dashboard Realism
`DashboardPreview` renders a fully interactive transaction table with:
- M-Pesa reference codes in Safaricom format (e.g. QHJ2KXPL7)
- KSh amounts with realistic distributions
- Sender names (Kenyan names)
- Four status types: Reconciled / Unmatched / Pending / Failed
- Working filters and search

### Honest metrics
No fake "1,200+ clients" or "47 counties" claims. The site presents Gigva as an early-access
product. Social proof uses unattributed quotes appropriate for that stage.

### Security
- bcrypt cost 12 (~250ms/hash) in `lib/auth.js`
- JWT HS256, 7-day expiry in `lib/auth.js`
- Parameterised queries via better-sqlite3 prepared statements
- Synchronous `seedAdmin` using `bcrypt.hashSync` — safe at startup, avoids async issues
- `prefers-reduced-motion` support in `globals.css`

---

## Environment Variables

```bash
# Required
JWT_SECRET=<64-byte hex string>

# Admin credentials (hashed at DB init, not stored in plain text at runtime)
ADMIN_EMAIL=admin@gigvakenya.co.ke
ADMIN_PASSWORD=@G19631993

# Optional
DB_PATH=./data/gigva.sqlite
NEXT_PUBLIC_SITE_URL=https://gigvakenya.co.ke
NODE_ENV=production
```

---

## Deployment

### Vercel (recommended for Next.js)

```bash
npm install -g vercel
vercel
# Set environment variables in the Vercel dashboard
```

> **Note:** better-sqlite3 requires a writable filesystem. On serverless platforms,
> switch to a hosted database such as Turso (SQLite-compatible) or Neon (PostgreSQL).

### Self-hosted (Ubuntu 22.04)

```bash
npm run build
PORT=3000 node_modules/.bin/next start

# With PM2
npm install -g pm2
pm2 start node_modules/.bin/next --name gigva -- start
pm2 save && pm2 startup
```

---

## SEO

- Page-level `metadata` exports on every route
- `app/sitemap.js` — auto-generates `/sitemap.xml`
- `app/robots.js` — auto-generates `/robots.txt` (blocks `/api/` and `/data/`)
- `lang="en-KE"` on `<html>`
- Skip-to-content link for accessibility
- `prefers-reduced-motion` respected in CSS
