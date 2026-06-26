import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/book'],
      disallow: ['/dashboard/', '/admin/', '/api/', '/auth-sync/'], // Protect private dashboards from Google
    },
    sitemap: 'https://useclinixy.online/sitemap.xml',
  }
}
