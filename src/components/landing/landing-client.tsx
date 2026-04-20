'use client';

// ============================================
// RESTAURANT OS — Landing Page Client Component
// Africa-First Restaurant Management System
// Step 5: Conversion-Optimized with Savane Dorée Palette
// ============================================

import { useSyncExternalStore, useState, useEffect, useRef, useCallback } from 'react';
import { useCurrencySafe } from '@/lib/currency-context';
import Link from 'next/link';
import {
  Smartphone,
  Truck,
  BarChart3,
  Users,
  CreditCard,
  Wifi,
  Check,
  ArrowRight,
  Play,
  Star,
  MapPin,
  Globe,
  ChevronDown,
  Monitor,
  Utensils,
  Zap,
  Building2,
  Phone,
  Mail,
  Twitter,
  Linkedin,
  Facebook,
} from 'lucide-react';
import { LandingPageJsonLd, FAQJsonLd } from '@/components/seo/json-ld';
import { KPICard } from '@/components/dashboard/animated-counter';

// ============================================
// Intersection Observer hook for scroll animations
// ============================================
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// ============================================
// Section wrapper with scroll animation
// ============================================
function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useInView(0.1);
  const delayClass = delay > 0 ? `animate-delay-${delay}` : '';

  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? `animate-fade-in-up ${delayClass}` : 'opacity-0'}`}
    >
      {children}
    </div>
  );
}

// ============================================
// Data
// ============================================

const features = [
  {
    icon: CreditCard,
    title: 'Mobile Money Intégré',
    description:
      'Orange Money, MTN MoMo, Wave, M-Pesa — Acceptez tous les paiements mobiles africains sans configuration complexe.',
    highlight: '4 opérateurs',
  },
  {
    icon: Monitor,
    title: 'Point de Vente (POS)',
    description:
      'Interface tactile rapide, gestion des tables, tickets de caisse et suivi des paiements en temps réel.',
    highlight: 'Tactile',
  },
  {
    icon: Truck,
    title: 'Livraison Moto GPS',
    description:
      'Suivi GPS temps réel, gestion des livreurs, calcul automatique des itinéraires et frais de livraison.',
    highlight: 'GPS temps réel',
  },
  {
    icon: BarChart3,
    title: 'Analytics Avancés',
    description:
      'Tableaux de bord intuitifs, rapports de ventes, prédictions IA et insights business en temps réel.',
    highlight: 'IA intégrée',
  },
  {
    icon: Building2,
    title: 'Multi-Restaurant',
    description:
      'Gérez plusieurs restaurants, marques et points de vente depuis une seule interface centralisée.',
    highlight: 'Illimité',
  },
  {
    icon: Smartphone,
    title: 'Kitchen Display',
    description:
      'Écrans cuisine connectés, gestion des commandes en temps réel, notifications automatiques aux serveurs.',
    highlight: '100% digital',
  },
];

// 3 pricing tiers as specified
const plans = [
  {
    name: 'Starter',
    price: '0',
    period: '/mois',
    description: 'Gratuit pour démarrer',
    features: [
      '1 restaurant',
      '2 utilisateurs',
      'Commandes basiques',
      'Mobile Money (Orange Money, MTN)',
      'Support email',
      'Mode hors-ligne',
    ],
    cta: 'Commencer Gratuitement',
    popular: false,
  },
  {
    name: 'Pro',
    price: '79',
    period: '/mois',
    description: 'Pour les restaurants en croissance',
    features: [
      '3 restaurants',
      '15 utilisateurs',
      'Tous les Mobile Money',
      'Livraison GPS',
      'Kitchen Display avancé',
      'Analytics & IA',
      'API access',
      'Support prioritaire',
    ],
    cta: 'Essai Gratuit 14 jours',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '199',
    period: '/mois',
    description: 'Pour les chaînes & franchises',
    features: [
      'Restaurants illimités',
      'Utilisateurs illimités',
      'Multi-marques',
      'Intégrations custom',
      'Account manager dédié',
      'SLA garanti 99.9%',
      'Formation sur site',
      'Facturation personnalisée',
    ],
    cta: 'Nous Contacter',
    popular: false,
  },
];

const testimonials = [
  {
    name: 'Amadou Diallo',
    role: 'Propriétaire, Chez Awa Restaurant',
    location: 'Conakry, Guinée',
    content:
      'Restaurant OS a transformé notre gestion. Nos clients paient maintenant par Orange Money en 2 secondes. Plus aucune perte de commande grâce au Kitchen Display !',
    rating: 5,
  },
  {
    name: 'Fatou Ndiaye',
    role: 'Directrice, Le Jardin Secret',
    location: 'Dakar, Sénégal',
    content:
      'Le système de livraison GPS nous a fait gagner 40% de temps. Nos livreurs moto sont optimisés automatiquement. La clientèle est ravie de la rapidité.',
    rating: 5,
  },
  {
    name: 'Kofi Mensah',
    role: 'Manager, Ghana Food Chain',
    location: 'Accra, Ghana',
    content:
      'Gérer 5 restaurants depuis un seul dashboard, c\'est le rêve. Les analytics IA nous aident à anticiper la demande et réduire le gaspillage alimentaire.',
    rating: 5,
  },
];

const faqItems = [
  {
    question: "Qu'est-ce que Restaurant OS ?",
    answer:
      "Restaurant OS est un système de gestion complet tout-en-un conçu spécifiquement pour les restaurants en Afrique. Il comprend la gestion des commandes, un Kitchen Display System (KDS), le suivi GPS des livraisons moto, l'intégration Mobile Money (Orange Money, MTN MoMo, Wave, M-Pesa), des analytics avancés et un mode hors-ligne.",
  },
  {
    question: "Comment fonctionne le paiement Mobile Money ?",
    answer:
      "Restaurant OS intègre nativement les principaux opérateurs de paiement mobile africains : Orange Money et MTN MoMo en Guinée, Wave au Sénégal, et M-Pesa au Kenya. Lorsqu'un client passe commande, il paie directement via son téléphone en quelques secondes. La transaction est confirmée en temps réel.",
  },
  {
    question: "Restaurant OS fonctionne-t-il hors ligne ?",
    answer:
      "Oui ! Restaurant OS est une Progressive Web App (PWA) conçue avec une architecture offline-first. Si la connexion internet est interrompue, vous pouvez continuer à prendre des commandes, gérer votre menu et suivre les livraisons. Toutes les données se synchronisent automatiquement dès le retour de la connexion.",
  },
  {
    question: "Combien coûte Restaurant OS ?",
    answer:
      "Restaurant OS propose un plan Starter gratuit avec 1 restaurant et 2 utilisateurs. Le plan Pro à 79 $/mois inclut la livraison GPS et l'IA. Le plan Enterprise à 199 $/mois est conçu pour les chaînes. Tous les plans payants incluent un essai gratuit de 14 jours sans carte de crédit.",
  },
  {
    question: "Quels pays sont couverts ?",
    answer:
      "Restaurant OS couvre la Guinée (Conakry), la Côte d'Ivoire (Abidjan), le Sénégal (Dakar) et le Ghana (Accra). Nous prévoyons d'étendre au Mali, Burkina Faso, Cameroun et Nigeria. Chaque pays bénéficie d'une intégration avec les opérateurs Mobile Money locaux.",
  },
  {
    question: "Comment démarrer avec Restaurant OS ?",
    answer:
      "Créez un compte gratuitement, configurez les informations de votre restaurant (nom, menu, horaires), et vous êtes opérationnel en moins de 5 minutes. Notre équipe est disponible pour vous accompagner.",
  },
];

const mobileMoneyPartners = [
  { name: 'Orange Money', color: '#FF6600', logo: '/images/partners/orange-money.png' },
  { name: 'MTN MoMo', color: '#FFCC00', logo: '/images/partners/mtn-momo.png' },
  { name: 'Wave', color: '#1DC8F2', logo: '/images/partners/wave.png' },
  { name: 'M-Pesa', color: '#00A650', logo: '/images/partners/m-pesa.png' },
];

const footerLinks = {
  product: [
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'Tarifs', href: '#pricing' },
    { label: 'API Docs', href: '/api/docs' },
    { label: 'Changelog', href: 'https://github.com/skaba89/restauration_rapide', external: true },
  ],
  company: [
    { label: 'À propos', href: '/about' },
    { label: 'Blog', href: 'https://twitter.com/restaurantos', external: true },
    { label: 'Carrières', href: 'mailto:jobs@restaurant-os.app' },
    { label: 'Partenaires', href: 'mailto:partners@restaurant-os.app' },
  ],
  support: [
    { label: "Centre d'aide", href: 'mailto:support@restaurant-os.app' },
    { label: 'Contact', href: 'mailto:contact@restaurant-os.app' },
    { label: '+224 620 00 00 00', href: 'tel:+224620000000' },
    { label: 'Conakry, Guinée', href: '#' },
    { label: 'Status', href: 'https://status.restaurant-os.app', external: true },
    { label: 'Confidentialité', href: 'mailto:privacy@restaurant-os.app' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/restaurantos', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/restaurant-os', label: 'LinkedIn' },
  { icon: Facebook, href: 'https://facebook.com/restaurantos', label: 'Facebook' },
  { icon: Mail, href: 'mailto:contact@restaurant-os.app', label: 'Email' },
];

// ============================================
// Navigation Links (mobile menu)
// ============================================
const navLinks = [
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Tarifs', href: '#pricing' },
  { label: 'Témoignages', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
];

// ============================================
// Main Component
// ============================================
export default function LandingPageClient() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const { formatCurrency } = useCurrencySafe();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleFaq = useCallback((index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* JSON-LD Structured Data */}
      <LandingPageJsonLd />

      {/* ========== NAVIGATION ========== */}
      <nav
        aria-label="Navigation principale"
        className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 btn-gradient rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-foreground font-[family-name:var(--font-plus-jakarta)]">
                Restaurant OS
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                >
                  {link.label}
                </a>
              ))}
              <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                Connexion
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-5 py-2.5 btn-gradient rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-shadow"
              >
                Essai Gratuit
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              {/* Mobile hamburger */}
              <button
                aria-label="Menu de navigation"
                aria-expanded={mobileMenuOpen}
                className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4 space-y-3 animate-fade-in-up">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium rounded-lg hover:bg-accent/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/login"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium rounded-lg hover:bg-accent/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Connexion
              </Link>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="block w-full text-center px-5 py-3 btn-gradient rounded-xl font-semibold text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Essai Gratuit 14 jours
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ========== HERO SECTION ========== */}
      <section className="pt-28 pb-20 md:pt-36 md:pb-28 relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-background to-secondary/30 pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: copy */}
            <div className="text-center lg:text-left">
              <AnimatedSection>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-semibold mb-6">
                  <Globe className="w-4 h-4" />
                  #1 Solution Restaurant en Afrique
                </div>
              </AnimatedSection>

              <AnimatedSection delay={100}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 font-[family-name:var(--font-plus-jakarta)]">
                  Le{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-foreground">
                    OS Restaurateur
                  </span>
                  <br />
                  Pensé pour l&apos;Afrique
                </h1>
              </AnimatedSection>

              <AnimatedSection delay={200}>
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Gérez votre restaurant avec une solution tout-en-un : POS, livraisons moto, Mobile Money, Kitchen Display et analytics.
                  Adapté aux réalités du marché africain.
                </p>
              </AnimatedSection>

              <AnimatedSection delay={300}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-7 py-3.5 btn-gradient rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow text-base"
                  >
                    Essai Gratuit 14 jours
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-7 py-3.5 bg-card text-foreground rounded-xl font-semibold border border-border hover:border-primary/40 transition-all group text-base"
                  >
                    <Play className="mr-2 w-5 h-5 text-primary" />
                    Voir la Démo
                  </Link>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={400}>
                <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500" />
                    Pas de carte de crédit
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500" />
                    Configuration en 5 min
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Right: mock dashboard */}
            <AnimatedSection delay={200}>
              <div className="relative">
                <div className="relative btn-gradient rounded-3xl p-1 shadow-2xl">
                  <div className="bg-card rounded-[20px] p-4 overflow-hidden border border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-destructive/80" />
                      <div className="w-3 h-3 rounded-full bg-accent-foreground/60" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="ml-4 text-muted-foreground text-sm">Restaurant OS — Dashboard</span>
                    </div>
                    <div className="bg-muted rounded-xl p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-muted-foreground text-sm">Ventes du jour</p>
                          <p className="text-foreground text-2xl font-bold font-[family-name:var(--font-plus-jakarta)]">
                            {formatCurrency(1250000)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-500 text-sm font-semibold">+23.5%</p>
                          <p className="text-muted-foreground text-xs">vs hier</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Commandes', value: 47 },
                          { label: 'Clients', value: 32 },
                          { label: 'Livraisons', value: 28 },
                        ].map((item) => (
                          <div key={item.label} className="bg-background rounded-lg p-3 border border-border">
                            <p className="text-muted-foreground text-xs">{item.label}</p>
                            <p className="text-foreground font-semibold">{item.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {['Orange Money', 'MTN MoMo', 'Cash'].map((method) => (
                          <span
                            key={method}
                            className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                          >
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                {mounted && (
                  <>
                    <div className="absolute -right-4 top-1/4 glass-card rounded-xl shadow-xl p-3 border border-border animate-bounce">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Nouvelle commande</p>
                          <p className="text-sm font-semibold text-foreground">#ORD-2847</p>
                        </div>
                      </div>
                    </div>

                    <div className="absolute -left-4 bottom-1/4 glass-card rounded-xl shadow-xl p-3 border border-border animate-pulse">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                          <Truck className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Livraison en cours</p>
                          <p className="text-sm font-semibold text-foreground">12 min restantes</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ========== MOBILE MONEY PARTNERS ========== */}
      <section className="py-8 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <p className="text-sm text-muted-foreground font-medium">Paiements intégrés :</p>
            {mobileMoneyPartners.map((partner) => (
              <div key={partner.name} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-8 w-8 object-contain rounded"
                  loading="lazy"
                />
                <span className="font-semibold text-foreground">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TRUSTED BY / STATS ========== */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-plus-jakarta)]">
                La confiance des restaurateurs africains
              </h2>
              <p className="text-lg text-muted-foreground">
                Des chiffres qui parlent d&apos;eux-mêmes
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <AnimatedSection delay={100}>
              <KPICard
                title="Restaurants actifs"
                value={500}
                suffix="+"
                icon={Building2}
                trend={18.2}
                description="En Afrique de l'Ouest"
                variant="default"
              />
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <KPICard
                title="Commandes / mois"
                value={50000}
                suffix="+"
                icon={Zap}
                trend={32.5}
                description="Livraison + sur place"
                variant="amber"
              />
            </AnimatedSection>
            <AnimatedSection delay={300}>
              <KPICard
                title="Pays couverts"
                value={4}
                icon={Globe}
                description="Guinée, CI, Sénégal, Ghana"
                variant="emerald"
              />
            </AnimatedSection>
            <AnimatedSection delay={400}>
              <KPICard
                title="Disponibilité"
                value={99.9}
                suffix="%"
                decimals={1}
                icon={Wifi}
                description="SLA garanti"
                variant="default"
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ========== FEATURES GRID ========== */}
      <section id="features" className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-plus-jakarta)]">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-lg text-muted-foreground">
                Une solution complète conçue pour les réalités du marché africain
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <AnimatedSection key={feature.title} delay={Math.min(idx * 100, 400)}>
                <div className="glass-card group p-6 rounded-2xl hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:shadow-md transition-all duration-300">
                      <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                    </div>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {feature.highlight}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 font-[family-name:var(--font-plus-jakarta)]">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-plus-jakarta)]">
                Des tarifs adaptés à votre croissance
              </h2>
              <p className="text-lg text-muted-foreground">
                Commencez gratuitement, évoluez selon vos besoins
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {plans.map((plan, idx) => (
              <AnimatedSection key={plan.name} delay={Math.min(idx * 150, 300)}>
                <div
                  className={`relative p-6 md:p-8 rounded-2xl h-full flex flex-col transition-all duration-300 hover:shadow-lg ${
                    plan.popular
                      ? 'btn-gradient text-white shadow-xl scale-[1.03] lg:scale-105'
                      : 'glass-card border border-border hover:border-primary/30'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-amber-900 text-sm font-bold rounded-full shadow-md">
                      Le + populaire
                    </div>
                  )}

                  <div className="mb-6">
                    <h3
                      className={`text-xl font-semibold mb-2 font-[family-name:var(--font-plus-jakarta)] ${
                        plan.popular ? 'text-white' : 'text-foreground'
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <p className={`text-sm ${plan.popular ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <span
                      className={`text-4xl font-bold font-[family-name:var(--font-plus-jakarta)] ${
                        plan.popular ? 'text-white' : 'text-foreground'
                      }`}
                    >
                      ${plan.price}
                    </span>
                    <span className={plan.popular ? 'text-white/80' : 'text-muted-foreground'}>
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check
                          className={`w-5 h-5 flex-shrink-0 ${
                            plan.popular ? 'text-amber-200' : 'text-emerald-500'
                          }`}
                        />
                        <span
                          className={`text-sm ${plan.popular ? 'text-white/90' : 'text-muted-foreground'}`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/login"
                    className={`block w-full py-3.5 rounded-xl font-semibold text-center transition-all duration-200 ${
                      plan.popular
                        ? 'bg-white text-primary hover:bg-white/90 shadow-md'
                        : 'btn-gradient text-white hover:shadow-md'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section id="testimonials" className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-plus-jakarta)]">
                Ils nous font confiance
              </h2>
              <p className="text-lg text-muted-foreground">
                Des restaurateurs africains satisfaits
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <AnimatedSection key={testimonial.name} delay={Math.min(idx * 100, 300)}>
                <div className="glass-card p-6 rounded-2xl border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                    ))}
                  </div>

                  <p className="text-muted-foreground mb-6 italic leading-relaxed flex-grow">
                    &quot;{testimonial.content}&quot;
                  </p>

                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="w-12 h-12 btn-gradient rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                      {testimonial.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* JSON-LD for testimonials */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                itemListElement: testimonials.map((t, i) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  item: {
                    '@type': 'Review',
                    author: { '@type': 'Person', name: t.name },
                    reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: 5 },
                    reviewBody: t.content,
                  },
                })),
              }),
            }}
          />
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section id="faq" className="py-20 md:py-28">
        <FAQJsonLd items={faqItems} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-plus-jakarta)]">
                Questions Fréquentes
              </h2>
              <p className="text-lg text-muted-foreground">
                Tout ce que vous devez savoir sur Restaurant OS
              </p>
            </div>
          </AnimatedSection>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <AnimatedSection key={index} delay={Math.min(index * 50, 300)}>
                <div className="glass-card rounded-2xl border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-accent/30 transition-colors"
                    aria-expanded={openFaq === index}
                  >
                    <h3 className="text-lg font-semibold text-foreground pr-4 font-[family-name:var(--font-plus-jakarta)]">
                      {item.question}
                    </h3>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ${
                      openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="px-6 pb-6 text-muted-foreground leading-relaxed">{item.answer}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80 pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-[family-name:var(--font-plus-jakarta)]">
              Prêt à digitaliser votre restaurant ?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Rejoignez des centaines de restaurateurs africains qui ont transformé leur business avec Restaurant OS.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl text-base"
              >
                Démarrer Gratuitement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a
                href="mailto:contact@restaurant-os.app"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all text-base backdrop-blur-sm"
              >
                <Phone className="mr-2 w-5 h-5" />
                Nous Contacter
              </a>
            </div>

            <p className="mt-6 text-white/60 text-sm">
              Essai gratuit 14 jours · Aucune carte de crédit requise · Annulation à tout moment
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="pt-16 pb-8 bg-foreground/[0.03] border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 btn-gradient rounded-xl flex items-center justify-center shadow-md">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-foreground font-[family-name:var(--font-plus-jakarta)]">
                  Restaurant OS
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                La solution de gestion restauratrice pensée pour l&apos;Afrique. Mobile Money, livraison GPS, analytics.
              </p>
              {/* Social links */}
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel={social.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    aria-label={social.label}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Produit</h4>
              <ul className="space-y-3 text-sm">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : link.href.startsWith('/') ? (
                      <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Entreprise</h4>
              <ul className="space-y-3 text-sm">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : link.href.startsWith('/') ? (
                      <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-3 text-sm">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : link.href.startsWith('tel:') ? (
                      <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </a>
                    ) : (
                      <a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Restaurant OS. Tous droits réservés.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="mailto:legal@restaurant-os.app" className="text-muted-foreground hover:text-foreground transition-colors">
                Conditions
              </a>
              <a href="mailto:privacy@restaurant-os.app" className="text-muted-foreground hover:text-foreground transition-colors">
                Confidentialité
              </a>
              <a href="mailto:legal@restaurant-os.app" className="text-muted-foreground hover:text-foreground transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
