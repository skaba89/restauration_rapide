import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

// Plus Jakarta Sans — headings (bold, premium, modern)
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

// Outfit — body text (clean, readable, professional)
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Geist Mono — code and numbers
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Base URL for the application
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://restauration-kfm.onrender.com";

// Comprehensive metadata for SEO
export const metadata: Metadata = {
  // Basic metadata
  title: {
    default: "Restaurant OS - Africa-First Restaurant Management System",
    template: "%s | Restaurant OS",
  },
  description:
    "Système de gestion de restaurant multi-devises, multi-pays, avec support mobile money et livraison moto. Orange Money, MTN MoMo, Wave, M-Pesa. Africa-First, Global-Ready.",
  keywords: [
    // Primary keywords
    "restaurant management",
    "POS system",
    "restaurant POS",
    "point of sale",
    "restaurant software",
    // Africa-specific keywords
    "Africa restaurant",
    "West Africa POS",
    "Côte d'Ivoire restaurant",
    "Nigeria restaurant",
    "Senegal restaurant",
    "Ghana restaurant",
    // Mobile Money keywords
    "Mobile Money",
    "Orange Money",
    "MTN MoMo",
    "Wave payment",
    "M-Pesa",
    "mobile payment Africa",
    // Feature keywords
    "restaurant delivery",
    "moto delivery",
    "food delivery Africa",
    "kitchen display system",
    "KDS",
    "restaurant analytics",
    "multi-currency",
    "multi-restaurant",
    // Software keywords
    "SaaS restaurant",
    "cloud POS",
    "offline POS",
    "PWA restaurant",
    // Language keywords
    "gestion restaurant",
    "logiciel restaurant",
    "caisse restaurant",
    "système caisse",
  ],
  authors: [{ name: "Restaurant OS Team", url: baseUrl }],
  creator: "Restaurant OS",
  publisher: "Restaurant OS",
  
  // Robots and indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Icons
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: [
      { url: "/icons/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
  
  // Manifest for PWA
  manifest: "/manifest.json",
  
  // Canonical URL
  alternates: {
    canonical: baseUrl,
    languages: {
      "fr-FR": `${baseUrl}/fr`,
      "en-US": `${baseUrl}/en`,
    },
  },
  
  // Open Graph metadata
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["en_US", "en_GB"],
    url: baseUrl,
    siteName: "Restaurant OS",
    title: "Restaurant OS - Africa-First Restaurant Management System",
    description:
      "Système de gestion de restaurant multi-devises avec Mobile Money (Orange Money, MTN, Wave, M-Pesa), livraison GPS et analytics. Africa-First.",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Restaurant OS - Africa-First Restaurant Management",
      },
      {
        url: `${baseUrl}/og-image-square.png`,
        width: 800,
        height: 800,
        alt: "Restaurant OS Logo",
      },
    ],
  },
  
  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    site: "@restaurantos",
    creator: "@restaurantos",
    title: "Restaurant OS - Africa-First Restaurant Management",
    description:
      "Gérez votre restaurant avec Mobile Money, livraison GPS et analytics. Africa-First, Global-Ready.",
    images: [`${baseUrl}/og-image.png`],
  },
  
  // Verification tags
  verification: {
    google: "google-site-verification-code",
    // Add actual verification codes when available
  },
  
  // Category
  category: "Business Software",
  
  // Application info
  applicationName: "Restaurant OS",
  
  // Apple specific
  appleWebApp: {
    capable: true,
    title: "Restaurant OS",
    statusBarStyle: "black-translucent",
  },
  
  // Format detection
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  
  // Other metadata
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-TileColor": "#1C3D5A",
    "msapplication-config": "/browserconfig.xml",
  },
};

// Viewport configuration
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1C3D5A" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1E2D" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light dark",
};

// JSON-LD structured data for the root layout
const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Restaurant OS",
  description:
    "Africa-First Restaurant Management System with Mobile Money integration, delivery tracking, and multi-currency support.",
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+224-620-00-00-00",
    contactType: "customer service",
    areaServed: "GN",
    availableLanguage: ["French"],
  },
  sameAs: [
    "https://facebook.com/kfmdelice",
    "https://instagram.com/kfmdelice",
    "https://whatsapp.com/channel/kfmdelice",
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kaloum, Avenue de la République",
    addressLocality: "Conakry",
    addressRegion: "Conakry",
    postalCode: "00224",
    addressCountry: "GN",
  },
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Restaurant OS",
  url: baseUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${baseUrl}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const jsonLdSoftwareApp = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Restaurant OS",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, iOS, Android",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "256",
  },
  description:
    "Africa-First Restaurant Management System with Mobile Money integration, delivery tracking, and multi-currency support.",
  featureList: [
    "Mobile Money Integration (Orange Money, MTN MoMo, Wave, M-Pesa)",
    "Real-time GPS Delivery Tracking",
    "Kitchen Display System",
    "Multi-restaurant Management",
    "Analytics Dashboard",
    "Offline PWA Support",
    "Multi-currency Support",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdOrganization),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdWebSite),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdSoftwareApp),
          }}
        />
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* DNS Prefetch for performance */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body
        className={`${plusJakarta.variable} ${outfit.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
        >
          Aller au contenu principal
        </a>
        <Providers>
          <div id="main-content" role="main" tabIndex={-1}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
