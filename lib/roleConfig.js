/**
 * lib/roleConfig.js
 * Central role configuration.
 * Referenced by: db seeding, JWT signing, dashboard, email routing.
 *
 * Pure JS — no server-only imports. Safe to import from both
 * client components and API routes.
 */

// ── Staff roster ──────────────────────────────────────────────────────────────
// Source of truth for initial staff accounts.
// Default password for all staff: blue1ocean  (they can change it later)
export const STAFF_ROSTER = [
  {
        name:    'Mwangi Kamau',
        email:   'ceo@gigva.co.ke',
        company: 'Gigva Kenya',
        role:    'ceo',
        is_admin: 0,
  },
  {
        name:    'Aisha Waweru',
        email:   'cto@gigva.co.ke',
        company: 'Gigva Kenya',
        role:    'cto',
        is_admin: 0,
  },
  {
        name:    'Samuel Otieno',
        email:   'samuel.otieno@gigva.co.ke',
        company: 'Gigva Kenya',
        role:    'customer_success',
        is_admin: 0,
  },
  {
        name:    'Njeri Mwangi',
        email:   'njeri.mwangi@gigva.co.ke',
        company: 'Gigva Kenya',
        role:    'product',
        is_admin: 0,
  },
  {
        name:    'Edward Gitau',
        email:   'edward.gitau@gigva.co.ke',
        company: 'Gigva Kenya',
        role:    'engineering',
        is_admin: 0,
  },
  {
        name:    'Daniel Njoroge',
        email:   'daniel.njoroge@gigva.co.ke',
        company: 'Gigva Kenya',
        role:    'operations',
        is_admin: 0,
  },
  {
        name:    'James Odhiambo',
        email:   'james.odhiambo@gigva.co.ke',
        company: 'Gigva Kenya',
        role:    'finance',
        is_admin: 0,
  },
  {
        name:    'Fatuma Kamau',
        email:   'fatuma.kamau@gigva.co.ke',
        company: 'Gigva Kenya',
        role:    'people_ops',
        is_admin: 0,
  },
  ]

export const STAFF_DEFAULT_PASSWORD = 'blue1ocean'

// ── Role definitions ──────────────────────────────────────────────────────────
// Each role controls:
//   label          — display name
//   description    — shown in dashboard workspace banner
//   badge          — Tailwind classes for badge pill
//   headerColor    — Tailwind classes for top-bar background
//   tabActiveClass — Tailwind classes for active tab indicator
//   tabs           — which dashboard tabs this role can see
export const ROLES = {
    superadmin: {
          label:          'Super Admin',
          description:    'Full system access — user management, all inboxes',
          badge:          'bg-indigo-600 text-white',
          headerColor:    'bg-indigo-700',
          tabActiveClass: 'border-indigo-600 text-indigo-600 bg-indigo-50',
          tabs:           ['messages', 'demos', 'trials', 'users', 'inbox', 'sent'],
    },
    ceo: {
          label:          'CEO',
          description:    'Business overview — all leads, bookings & trials',
          badge:          'bg-sky-600 text-white',
          headerColor:    'bg-sky-700',
          tabActiveClass: 'border-sky-600 text-sky-600 bg-sky-50',
          tabs:           ['messages', 'demos', 'trials', 'inbox', 'sent'],
    },
    cto: {
          label:          'CTO',
          description:    'Platform & engineering — trial requests, tech feedback',
          badge:          'bg-violet-600 text-white',
          headerColor:    'bg-violet-700',
          tabActiveClass: 'border-violet-600 text-violet-600 bg-violet-50',
          tabs:           ['trials', 'messages', 'inbox', 'sent'],
    },
    customer_success: {
          label:          'Customer Success',
          description:    'Onboarding & support — messages, demos, trials',
          badge:          'bg-green-600 text-white',
          headerColor:    'bg-green-700',
          tabActiveClass: 'border-green-600 text-green-600 bg-green-50',
          tabs:           ['messages', 'demos', 'trials', 'inbox', 'sent'],
    },
    product: {
          label:          'Product',
          description:    'Product feedback — demo requests & user insights',
          badge:          'bg-amber-600 text-white',
          headerColor:    'bg-amber-700',
          tabActiveClass: 'border-amber-600 text-amber-600 bg-amber-50',
          tabs:           ['demos', 'messages', 'inbox', 'sent'],
    },
    engineering: {
          label:          'Lead Engineer',
          description:    'Technical setup — free trial requests, technical queries',
          badge:          'bg-cyan-700 text-white',
          headerColor:    'bg-cyan-800',
          tabActiveClass: 'border-cyan-700 text-cyan-700 bg-cyan-50',
          tabs:           ['trials', 'messages', 'inbox', 'sent'],
    },
    operations: {
          label:          'Operations Lead',
          description:    'Operational logistics — demo bookings, process queries',
          badge:          'bg-orange-600 text-white',
          headerColor:    'bg-orange-700',
          tabActiveClass: 'border-orange-600 text-orange-600 bg-orange-50',
          tabs:           ['demos', 'messages', 'inbox', 'sent'],
    },
    finance: {
          label:          'Finance & Compliance',
          description:    'Financial & compliance enquiries',
          badge:          'bg-teal-600 text-white',
          headerColor:    'bg-teal-700',
          tabActiveClass: 'border-teal-600 text-teal-600 bg-teal-50',
          tabs:           ['messages', 'inbox', 'sent'],
    },
    people_ops: {
          label:          'People & Culture',
          description:    'HR & recruitment — general enquiries',
          badge:          'bg-rose-600 text-white',
          headerColor:    'bg-rose-700',
          tabActiveClass: 'border-rose-600 text-rose-600 bg-rose-50',
          tabs:           ['messages', 'inbox', 'sent'],
    },
}

// ── Email notification routing ────────────────────────────────────────────────
// Which staff addresses receive notifications for each event type.
// These match the STAFF_ROSTER emails above.
// Override at runtime via env vars NOTIFY_CONTACT_TO / NOTIFY_DEMO_TO / NOTIFY_TRIAL_TO
// (comma-separated addresses).
export const DEFAULT_NOTIFY = {
    contact: [
          'ceo@gigva.co.ke',
          'samuel.otieno@gigva.co.ke',
        ],
    demo: [
          'ceo@gigva.co.ke',
          'samuel.otieno@gigva.co.ke',
          'njeri.mwangi@gigva.co.ke',
        ],
    trial: [
          'ceo@gigva.co.ke',
          'cto@gigva.co.ke',
          'samuel.otieno@gigva.co.ke',
          'edward.gitau@gigva.co.ke',
        ],
}

/** Resolve recipients — honours optional env-var overrides. */
export function getNotifyRecipients(type) {
    const envKey = `NOTIFY_${type.toUpperCase()}_TO`
    const raw    = typeof process !== 'undefined' ? process.env[envKey] : undefined
    if (raw) return raw.split(',').map(e => e.trim()).filter(Boolean)
    return DEFAULT_NOTIFY[type] || []
}
