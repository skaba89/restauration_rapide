import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://restauration-kfm.onrender.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Allow all search engines to crawl public pages
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Disallow authenticated/private routes
          '/api/',
          '/_next/',
          '/admin/',
          '/private/',
          // Disallow user-specific pages that shouldn't be indexed
          '/profile',
          '/wallet',
          '/notifications',
          // Disallow action URLs
          '/*?action=',
          '/*?filter=',
          '/*?sort=',
          // Disallow checkout and payment pages
          '/checkout',
          '/payment',
          // Disallow temporary/auth pages
          '/reset-password',
          '/verify-email',
          '/otp',
        ],
      },
      // Specific rules for major search engines
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/', '/private/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/', '/private/'],
      },
      // Allow social media crawlers full access for better sharing
      {
        userAgent: 'Twitterbot',
        allow: '/',
      },
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
      {
        userAgent: 'LinkedInBot',
        allow: '/',
      },
      {
        userAgent: 'WhatsApp',
        allow: '/',
      },
      {
        userAgent: 'TelegramBot',
        allow: '/',
      },
      // Allow AI training crawlers for Generative Engine Optimization (GEO)
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/'],
      },
      {
        userAgent: 'CCBot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
