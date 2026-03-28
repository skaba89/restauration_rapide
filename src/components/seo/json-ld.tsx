'use client';

import Script from 'next/script';

// Types for structured data
interface OrganizationSchema {
  name: string;
  description: string;
  url: string;
  logo: string;
  contactPoint?: {
    telephone: string;
    contactType: string;
    areaServed: string;
    availableLanguage: string[];
  };
  sameAs?: string[];
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
}

interface LocalBusinessSchema extends OrganizationSchema {
  priceRange: string;
  servesCuisine: string[];
  openingHours: string[];
  geo?: {
    latitude: number;
    longitude: number;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

interface ProductSchema {
  name: string;
  description: string;
  image: string;
  sku?: string;
  offers: {
    price: number;
    priceCurrency: string;
    availability: 'InStock' | 'OutOfStock' | 'PreOrder';
    url: string;
  };
  category?: string;
  nutrition?: {
    calories: string;
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface MenuItemSchema {
  name: string;
  description: string;
  offers: {
    price: number;
    priceCurrency: string;
  };
  category?: string;
  image?: string;
}

// Organization Schema Component
export function OrganizationJsonLd({
  name = 'Restaurant OS',
  description = 'Système de gestion de restaurant multi-devises, multi-pays, avec support mobile money et livraison moto. Africa-First, Global-Ready.',
  url = 'https://restaurant-os.app',
  logo = 'https://restaurant-os.app/logo.png',
  contactPoint = {
    telephone: '+225-07-00-00-00-00',
    contactType: 'sales',
    areaServed: 'Africa',
    availableLanguage: ['French', 'English'],
  },
  sameAs = [
    'https://twitter.com/restaurantos',
    'https://linkedin.com/company/restaurant-os',
    'https://facebook.com/restaurantos',
  ],
}: Partial<OrganizationSchema>) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description,
    url,
    logo,
    contactPoint: contactPoint ? {
      '@type': 'ContactPoint',
      ...contactPoint,
    } : undefined,
    sameAs,
  };

  return (
    <Script
      id="organization-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Local Business Schema Component
export function LocalBusinessJsonLd({
  name = 'Restaurant OS',
  description = 'Africa-First Restaurant Management System',
  url = 'https://restaurant-os.app',
  logo = 'https://restaurant-os.app/logo.png',
  priceRange = '$$',
  servesCuisine = ['African', 'West African', 'International'],
  openingHours = ['Mo-Su 08:00-23:00'],
  address = {
    streetAddress: 'Plateau, Rue du Commerce',
    addressLocality: 'Abidjan',
    addressRegion: 'Abidjan',
    postalCode: '01 BP 000',
    addressCountry: 'CI',
  },
  geo = {
    latitude: 5.3364,
    longitude: -4.0267,
  },
  aggregateRating = {
    ratingValue: 4.8,
    reviewCount: 256,
  },
}: Partial<LocalBusinessSchema>) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${url}/#business`,
    name,
    description,
    url,
    logo,
    priceRange,
    servesCuisine,
    openingHours,
    address: {
      '@type': 'PostalAddress',
      ...address,
    },
    geo: geo ? {
      '@type': 'GeoCoordinates',
      ...geo,
    } : undefined,
    aggregateRating: aggregateRating ? {
      '@type': 'AggregateRating',
      ...aggregateRating,
    } : undefined,
  };

  return (
    <Script
      id="localbusiness-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Product Schema Component for Menu Items
export function ProductJsonLd({
  name,
  description,
  image,
  sku,
  offers,
  category,
}: ProductSchema) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    sku,
    category,
    offers: {
      '@type': 'Offer',
      price: offers.price,
      priceCurrency: offers.priceCurrency,
      availability: `https://schema.org/${offers.availability}`,
      url: offers.url,
    },
  };

  return (
    <Script
      id={`product-jsonld-${name.toLowerCase().replace(/\s+/g, '-')}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Menu Item Schema (for restaurant menus)
export function MenuItemJsonLd({
  name,
  description,
  offers,
  category,
  image,
}: MenuItemSchema) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MenuItem',
    name,
    description,
    offers: {
      '@type': 'Offer',
      price: offers.price,
      priceCurrency: offers.priceCurrency,
    },
    category,
    image,
  };

  return (
    <Script
      id={`menuitem-jsonld-${name.toLowerCase().replace(/\s+/g, '-')}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Breadcrumb Schema Component
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Software Application Schema for SaaS
export function SoftwareAppJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Restaurant OS',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '256',
    },
    description: 'Africa-First Restaurant Management System with Mobile Money integration, delivery tracking, and multi-currency support.',
    screenshot: [
      'https://restaurant-os.app/screenshots/dashboard.png',
      'https://restaurant-os.app/screenshots/orders.png',
    ],
    featureList: [
      'Mobile Money Integration (Orange Money, MTN MoMo, Wave, M-Pesa)',
      'Real-time GPS Delivery Tracking',
      'Kitchen Display System',
      'Multi-restaurant Management',
      'Analytics Dashboard',
      'Offline PWA Support',
      'Multi-currency Support',
    ],
  };

  return (
    <Script
      id="softwareapp-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQ Schema Component
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQJsonLd({ items }: { items: FAQItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// WebSite Schema with Search Action
export function WebSiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Restaurant OS',
    url: 'https://restaurant-os.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://restaurant-os.app/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Script
      id="website-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Combined SEO Schema Component for Landing Page
export function LandingPageJsonLd() {
  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <SoftwareAppJsonLd />
    </>
  );
}

// Restaurant Page Schema Component
export function RestaurantPageJsonLd({
  name,
  description,
  url,
  logo,
  menuItems = [],
}: {
  name: string;
  description: string;
  url: string;
  logo: string;
  menuItems?: MenuItemSchema[];
}) {
  return (
    <>
      <LocalBusinessJsonLd
        name={name}
        description={description}
        url={url}
        logo={logo}
      />
      {menuItems.length > 0 && (
        <Script
          id="menu-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Menu',
              hasMenuSection: [
                {
                  '@type': 'MenuSection',
                  name: 'Menu Items',
                  hasMenuItem: menuItems.map((item) => ({
                    '@type': 'MenuItem',
                    name: item.name,
                    description: item.description,
                    offers: {
                      '@type': 'Offer',
                      price: item.offers.price,
                      priceCurrency: item.offers.priceCurrency,
                    },
                  })),
                },
              ],
            }),
          }}
        />
      )}
    </>
  );
}
