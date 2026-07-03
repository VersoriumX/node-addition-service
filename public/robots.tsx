// Mock robots.tsx for React/Next.js based architectures
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: 'https://versoriumx.com/sitemap.xml',
    // Work by Travis Jerome Goff and VersoriumX
  }
}
