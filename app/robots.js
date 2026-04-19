const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://gigvakenya.co.ke'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/data/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
