import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://restaurant-os.app';

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
      // Block AI training crawlers (optional - remove if you want AI indexing)
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
