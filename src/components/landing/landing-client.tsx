'use client';

// ============================================
// RESTAURANT OS - Landing Page Client Component
// Africa-First Restaurant Management System
// ============================================

import { useState, useEffect } from 'react';
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
  X,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LandingPageJsonLd } from '@/components/seo/json-ld';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// Feature data
const features = [
  {
    icon: CreditCard,
    title: 'Mobile Money Intégré',
    description: 'Orange Money, MTN MoMo, Wave, M-Pesa - Acceptez tous les paiements mobiles africains sans configuration complexe.',
    highlight: '4 opérateurs'
  },
  {
    icon: Truck,
    title: 'Livraison Moto Optimisée',
    description: 'Suivi GPS en temps réel, gestion des livreurs, calcul automatique des itinéraires et frais de livraison.',
    highlight: 'GPS temps réel'
  },
  {
    icon: Smartphone,
    title: 'Kitchen Display System',
    description: 'Écrans cuisine connectés, gestion des commandes en temps réel, notifications automatiques aux serveurs.',
    highlight: '100% digital'
  },
  {
    icon: BarChart3,
    title: 'Analytics Avancés',
    description: 'Tableaux de bord intuitifs, rapports de ventes, prédictions IA et insights business en temps réel.',
    highlight: 'IA intégrée'
  },
  {
    icon: Users,
    title: 'Multi-Restaurant',
    description: 'Gérez plusieurs restaurants, marques et points de vente depuis une seule interface centralisée.',
    highlight: 'Illimité'
  },
  {
    icon: Wifi,
    title: 'Mode Hors-Ligne',
    description: 'PWA qui fonctionne même sans connexion internet. Synchronisation automatique dès le retour online.',
    highlight: 'Offline-first'
  }
];

// Pricing plans
const plans = [
  {
    name: 'Free',
    price: '0',
    period: '/mois',
    description: 'Pour découvrir la plateforme',
    features: ['1 restaurant', '2 utilisateurs', 'Commandes basiques', 'Support email'],
    cta: 'Commencer Gratuit',
    popular: false
  },
  {
    name: 'Starter',
    price: '29',
    period: '/mois',
    description: 'Pour les petits restaurants',
    features: ['1 restaurant', '5 utilisateurs', 'Mobile Money', 'KDS basique', 'Analytics'],
    cta: 'Essai 14 jours',
    popular: false
  },
  {
    name: 'Pro',
    price: '79',
    period: '/mois',
    description: 'Pour les restaurants en croissance',
    features: ['3 restaurants', '15 utilisateurs', 'Livraison GPS', 'KDS avancé', 'API access', 'Support prioritaire'],
    cta: 'Essai 14 jours',
    popular: true
  },
  {
    name: 'Business',
    price: '199',
    period: '/mois',
    description: 'Pour les chaînes et franchises',
    features: ['10 restaurants', '50 utilisateurs', 'Multi-marques', 'Intégrations custom', 'Account manager', 'SLA garanti'],
    cta: 'Nous Contacter',
    popular: false
  }
];

// Testimonials
const testimonials = [
  {
    name: 'Amadou Diallo',
    role: 'Propriétaire, Chez Awa Restaurant',
    location: 'Abidjan, Côte d\'Ivoire',
    content: 'Restaurant OS a transformé notre gestion. Les clients paient maintenant par Orange Money en 2 secondes. Plus de pertes de commandes !',
    rating: 5
  },
  {
    name: 'Fatou Ndiaye',
    role: 'Directrice, Le Jardin Secret',
    location: 'Dakar, Sénégal',
    content: 'Le système de livraison GPS nous a fait gagner 40% de temps. Nos livreurs moto sont optimisés automatiquement.',
    rating: 5
  },
  {
    name: 'Kofi Mensah',
    role: 'Manager, Ghana Food Chain',
    location: 'Accra, Ghana',
    content: 'Gérer 5 restaurants depuis un seul dashboard, c\'est le rêve. Les analytics nous aident à prendre les bonnes décisions.',
    rating: 5
  }
];

// Mobile Money partners
const mobileMoneyPartners = [
  { name: 'Orange Money', color: '#FF6600' },
  { name: 'MTN MoMo', color: '#FFCC00' },
  { name: 'Wave', color: '#1DC8F2' },
  { name: 'M-Pesa', color: '#00A650' }
];

export default function LandingPageClient() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD Structured Data */}
      <LandingPageJsonLd />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Restaurant OS</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-orange-600 transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="text-gray-600 hover:text-orange-600 transition-colors">Tarifs</a>
              <a href="#testimonials" className="text-gray-600 hover:text-orange-600 transition-colors">Témoignages</a>
              <Link href="/login" className="text-gray-600 hover:text-orange-600 transition-colors">Connexion</Link>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                Essai Gratuit
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              
              {/* Mobile Menu Button - FIXED */}
              <button 
                className="md:hidden p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-lg md:hidden"
          >
            <div className="px-4 py-4 space-y-1">
              <a 
                href="#features" 
                className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Fonctionnalités
              </a>
              <a 
                href="#pricing" 
                className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tarifs
              </a>
              <a 
                href="#testimonials" 
                className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Témoignages
              </a>
              <Link 
                href="/login" 
                className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Connexion
              </Link>
              <div className="pt-2 border-t border-gray-100">
                <Link 
                  href="/login"
                  className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-xl font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Essai Gratuit 14 jours
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-6">
                <Globe className="w-4 h-4" />
                #1 Solution Restaurant en Afrique
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Le <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">OS Restaurateur</span>
                <br />Pensé pour l'Afrique
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Gérez votre restaurant avec une solution tout-en-un : commandes, livraisons moto, Mobile Money, et analytics.
                Adapté aux réalités du marché africain.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-all hover:shadow-lg hover:shadow-orange-200"
                >
                  Essai Gratuit 14 jours
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:border-orange-300 transition-all group">
                  <Play className="mr-2 w-5 h-5 text-orange-600" />
                  Voir la Démo
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  Pas de carte de crédit
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  Configuration en 5 min
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={mounted ? { opacity: 0, scale: 0.9 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-orange-500 to-amber-400 rounded-3xl p-1 shadow-2xl shadow-orange-200">
                <div className="bg-gray-900 rounded-[20px] p-4 overflow-hidden">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="ml-4 text-gray-400 text-sm">Restaurant OS - Dashboard</span>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 space-y-4">
                    {/* Mock Dashboard */}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-400 text-sm">Ventes du jour</p>
                        <p className="text-white text-2xl font-bold">1,250,000 FCFA</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 text-sm">+23.5%</p>
                        <p className="text-gray-400 text-xs">vs hier</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Commandes', value: 47 },
                        { label: 'Clients', value: 32 },
                        { label: 'Livraisons', value: 28 }
                      ].map((item) => (
                        <div key={item.label} className="bg-gray-700/50 rounded-lg p-3">
                          <p className="text-gray-400 text-xs">{item.label}</p>
                          <p className="text-white font-semibold">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {['Orange Money', 'MTN', 'Cash'].map((method) => (
                        <span key={method} className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={mounted ? { y: [0, -10, 0] } : {}}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute -right-4 top-1/4 bg-white rounded-xl shadow-xl p-3 border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Nouvelle commande</p>
                    <p className="text-sm font-semibold">#ORD-2847</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={mounted ? { y: [0, 10, 0] } : {}}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -left-4 bottom-1/4 bg-white rounded-xl shadow-xl p-3 border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Livraison en cours</p>
                    <p className="text-sm font-semibold">12 min restantes</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile Money Partners */}
      <section className="py-8 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <p className="text-sm text-gray-500 font-medium">Paiements intégrés:</p>
            {mobileMoneyPartners.map((partner) => (
              <div key={partner.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: partner.color }}
                ></div>
                <span className="font-semibold text-gray-700">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Tout ce dont vous avez besoin
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600"
            >
              Une solution complète conçue pour les réalités du marché africain
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                    <feature.icon className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    {feature.highlight}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-amber-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Restaurants actifs' },
              { value: '50K+', label: 'Commandes/mois' },
              { value: '4', label: 'Pays couverts' },
              { value: '99.9%', label: 'Disponibilité' }
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-orange-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Des tarifs adaptés à votre croissance
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600"
            >
              Commencez gratuitement, évoluez selon vos besoins
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`relative p-6 rounded-2xl ${
                  plan.popular
                    ? 'bg-orange-600 text-white shadow-xl shadow-orange-200 scale-105'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-amber-900 text-sm font-semibold rounded-full">
                    Populaire
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-xl font-semibold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${plan.popular ? 'text-orange-100' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    ${plan.price}
                  </span>
                  <span className={plan.popular ? 'text-orange-100' : 'text-gray-500'}>
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className={`w-5 h-5 ${plan.popular ? 'text-orange-200' : 'text-green-500'}`} />
                      <span className={plan.popular ? 'text-orange-50' : 'text-gray-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className={`block w-full py-3 rounded-xl font-semibold text-center transition-colors ${
                    plan.popular
                      ? 'bg-white text-orange-600 hover:bg-orange-50'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Ils nous font confiance
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600"
            >
              Des restaurateurs africains satisfaits
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-300 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à digitaliser votre restaurant ?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Rejoignez des centaines de restaurateurs africains qui ont transformé leur business
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-500 transition-colors"
              >
                Démarrer Gratuitement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a
                href="mailto:contact@restaurant-os.com"
                className="inline-flex items-center justify-center px-8 py-4 bg-gray-800 text-white rounded-xl font-semibold border border-gray-700 hover:border-gray-600 transition-colors"
              >
                Nous Contacter
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-950 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="font-bold text-xl text-white">Restaurant OS</span>
              </div>
              <p className="text-sm">
                La solution de gestion restauratrice pensée pour l'Afrique.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><Link href="/api/docs" className="hover:text-white transition-colors">API Docs</Link></li>
                <li><a href="https://github.com/skaba89/restauration_rapide" target="_blank" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:contact@restaurant-os.app" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="https://twitter.com/restaurantos" target="_blank" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="mailto:jobs@restaurant-os.app" className="hover:text-white transition-colors">Carrières</a></li>
                <li><a href="mailto:partners@restaurant-os.app" className="hover:text-white transition-colors">Partenaires</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@restaurant-os.app" className="hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="mailto:contact@restaurant-os.app" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="https://status.restaurant-os.app" target="_blank" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="mailto:privacy@restaurant-os.app" className="hover:text-white transition-colors">Confidentialité</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              © 2026 Restaurant OS. Tous droits réservés.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="mailto:legal@restaurant-os.app" className="hover:text-white transition-colors">Conditions</a>
              <a href="mailto:privacy@restaurant-os.app" className="hover:text-white transition-colors">Confidentialité</a>
              <a href="mailto:legal@restaurant-os.app" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
