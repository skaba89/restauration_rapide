import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://restaurant-os.app';

// Define all public routes with their priorities and change frequencies
const publicRoutes = [
  // Landing page - highest priority
  {
    url: '/',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 1.0,
  },
  // Authentication pages
  {
    url: '/login',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  {
    url: '/register',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  // Dashboard (public landing for authenticated users)
  {
    url: '/dashboard',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  },
  // Kitchen Display System
  {
    url: '/kitchen',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  },
  // API Documentation
  {
    url: '/api/docs',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  },
];

// Features/Pricing pages
const featureRoutes = [
  {
    url: '/#features',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  },
  {
    url: '/#pricing',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  },
  {
    url: '/#testimonials',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
];

// Legal pages (when they exist)
const legalRoutes = [
  {
    url: '/privacy',
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  },
  {
    url: '/terms',
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  },
  {
    url: '/cookies',
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  },
];

// App sections (for authenticated users, but still indexed)
const appRoutes = [
  {
    url: '/orders',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.5,
  },
  {
    url: '/menu',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  },
  {
    url: '/customers',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.5,
  },
  {
    url: '/deliveries',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.5,
  },
  {
    url: '/reservations',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.5,
  },
  {
    url: '/analytics',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  },
  {
    url: '/settings',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.4,
  },
];

// Blog/Help pages (for future use)
const helpRoutes = [
  {
    url: '/help',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  {
    url: '/blog',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  },
];

// Generate sitemap entries for dynamic restaurant pages
// This would typically fetch from a database in production
async function getRestaurantRoutes(): Promise<MetadataRoute.Sitemap> {
  // In production, fetch actual restaurants from database
  // For now, return empty array as this is a SaaS platform
  // where individual restaurant pages aren't public
  return [];
}

// Generate sitemap entries for dynamic menu items
// This would typically fetch from a database in production
async function getMenuRoutes(): Promise<MetadataRoute.Sitemap> {
  // In production, this could generate URLs for public menu pages
  // For a SaaS platform, menus are typically private per restaurant
  return [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch dynamic routes
  const restaurantRoutes = await getRestaurantRoutes();
  const menuRoutes = await getMenuRoutes();

  // Combine all routes
  const allRoutes = [
    ...publicRoutes,
    ...featureRoutes,
    ...legalRoutes,
    ...appRoutes,
    ...helpRoutes,
    ...restaurantRoutes,
    ...menuRoutes,
  ];

  // Add base URL to all routes
  return allRoutes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: {
        fr: `${baseUrl}/fr${route.url}`,
        en: `${baseUrl}/en${route.url}`,
      },
    },
  }));
}

// Sitemap index for large sites (if needed in future)
export async function generateSitemaps() {
  // For large sites with many URLs, generate multiple sitemaps
  // Currently not needed as we have a single sitemap
  return [{ id: 'main' }];
}
