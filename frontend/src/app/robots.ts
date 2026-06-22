import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/booking/'],
      disallow: ['/dashboard/', '/admin/', '/api/'], // Protect private dashboards from Google
    },
    sitemap: 'https://useclinixy.vercel.app/sitemap.xml',
  }
}
