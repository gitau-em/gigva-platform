const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://gigva.co.ke'

export default function sitemap() {
  const routes = [
    { url: '/',          priority: 1.0, changeFrequency: 'weekly'  },
    { url: '/product',   priority: 0.9, changeFrequency: 'monthly' },
    { url: '/features',  priority: 0.9, changeFrequency: 'monthly' },
    { url: '/pricing',   priority: 0.8, changeFrequency: 'monthly' },
    { url: '/about',     priority: 0.7, changeFrequency: 'monthly' },
    { url: '/security',  priority: 0.7, changeFrequency: 'monthly' },
    { url: '/book-demo', priority: 0.8, changeFrequency: 'monthly' },
    { url: '/contact',   priority: 0.7, changeFrequency: 'monthly' },
    { url: '/trial',     priority: 0.9, changeFrequency: 'monthly' },
    { url: '/login',     priority: 0.5, changeFrequency: 'yearly'  },
    { url: '/privacy',   priority: 0.3, changeFrequency: 'yearly'  },
    { url: '/terms',     priority: 0.3, changeFrequency: 'yearly'  },
    { url: '/saas-platform-kenya', priority: 0.9, changeFrequency: 'monthly' },
  ]

  return routes.map(r => ({
    url: `${BASE}${r.url}`,
    lastModified:    new Date(),
    changeFrequency: r.changeFrequency,
    priority:        r.priority,
  }))
}
