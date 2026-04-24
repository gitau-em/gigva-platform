/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // ── HTTP Security Headers ───────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.tawk.to https://tawk.to https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://*.tawk.to",
              "img-src 'self' data: blob: https://*.tawk.to https://www.google-analytics.com",
              "font-src 'self' https://*.tawk.to",
              "connect-src 'self' https://*.tawk.to wss://*.tawk.to https://www.google-analytics.com https://analytics.google.com",
              "frame-src 'self' https://*.tawk.to",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },

  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [96, 128, 256, 384, 480],
  },

  // Ensure server-only modules never reach the client bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'better-sqlite3': false,
        'nodemailer': false,
        bcrypt: false,
        fs: false,
        path: false,
        crypto: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
