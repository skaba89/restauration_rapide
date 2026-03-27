// ============================================
// RESTAURANT OS - Landing Page
// Africa-First Restaurant Management System
// ============================================

import { Metadata } from 'next';
import LandingPageClient from '@/components/landing/landing-client';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://restaurant-os.app';

// Generate metadata dynamically
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Restaurant OS - Africa-First Restaurant Management System',
    description:
      'Le système de gestion de restaurant pensé pour l\'Afrique. Mobile Money (Orange Money, MTN MoMo, Wave, M-Pesa), livraison GPS, Kitchen Display, Analytics. Essayez gratuitement 14 jours.',
    keywords: [
      'restaurant management',
      'POS system Africa',
      'Mobile Money restaurant',
      'Orange Money',
      'MTN MoMo',
      'Wave payment',
      'M-Pesa',
      'restaurant delivery',
      'kitchen display system',
      'restaurant analytics',
      'gestion restaurant',
      'logiciel restaurant Afrique',
      'caisse restaurant',
    ],
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title: 'Restaurant OS - Africa-First Restaurant Management System',
      description:
        'Le système de gestion de restaurant pensé pour l\'Afrique. Mobile Money, livraison GPS, Kitchen Display, Analytics. Essayez gratuitement.',
      url: baseUrl,
      siteName: 'Restaurant OS',
      type: 'website',
      locale: 'fr_FR',
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Restaurant OS - Africa-First Restaurant Management',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Restaurant OS - Africa-First Restaurant Management',
      description:
        'Le système de gestion de restaurant pensé pour l\'Afrique. Mobile Money, GPS, Analytics. Essayez gratuitement.',
      images: [`${baseUrl}/og-image.png`],
      site: '@restaurantos',
      creator: '@restaurantos',
    },
    other: {
      'product:price:amount': '0',
      'product:price:currency': 'USD',
      'product:availability': 'in stock',
      'product:brand': 'Restaurant OS',
      'product:category': 'Business Software',
      'app:version': '1.0.0',
    },
  };
}

export default function LandingPage() {
  return <LandingPageClient />;
}
