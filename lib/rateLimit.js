/**
 * lib/rateLimit.js
 * Lightweight in-memory rate limiter for public API routes.
 * Keyed by IP address. Resets automatically via TTL.
 *
 * Usage:
 *   const limited = rateLimit(req, { max: 5, windowMs: 60_000 })
 *   if (limited) return NextResponse.json({ ok: false, msg: 'Too many requests.' }, { status: 429 })
 */

// { key: { count, resetAt } }
const store = new Map()

/**
 * @param {Request} req          - Next.js request object
 * @param {Object}  opts
 * @param {number}  opts.max       - Max requests per window (default 10)
 * @param {number}  opts.windowMs  - Window in ms (default 60 000 = 1 min)
 * @returns {boolean} true if the request should be blocked
 */
export function rateLimit(req, { max = 10, windowMs = 60_000 } = {}) {
  // Get IP from headers (works behind proxies/CDN)
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  const key = `${req.url}::${ip}`
  const now = Date.now()

  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return false  // allow
  }

  if (entry.count >= max) {
    return true   // block
  }

  entry.count += 1
  return false    // allow
}

// Periodically prune expired entries to avoid memory growth
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of store.entries()) {
    if (now > val.resetAt) store.delete(key)
  }
}, 5 * 60_000)   // prune every 5 minutes
