'use client';

import { useState } from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Pricing plans data
const PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    slug: 'STARTER',
    price: 29.99,
    currency: 'EUR',
    billingInterval: 'monthly',
    maxRestaurants: 1,
    maxUsers: 2,
    isPopular: false,
    description: 'Parfait pour débuter votre activité restaurant',
    features: [
      { name: '1 restaurant/page public', included: true },
      { name: '2 comptes utilisateurs', included: true },
      { name: 'Menu digital basique', included: true },
      { name: 'Commandes en ligne', included: true },
      { name: 'Paiement Mobile Money', included: true },
      { name: 'Réservations', included: false },
      { name: 'Livraison & drivers', included: false },
      { name: 'Programme de fidélité', included: false },
      { name: 'Multi-succursales', included: false },
      { name: 'Gestion des stocks', included: false },
      { name: 'Rapports avancés', included: false },
      { name: 'API access', included: false },
      { name: 'Multi-organisations', included: false },
      { name: 'White-label', included: false },
      { name: 'Support prioritaire', included: false },
      { name: 'Formation incluse', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    slug: 'PRO',
    price: 59.99,
    currency: 'EUR',
    billingInterval: 'monthly',
    maxRestaurants: 3,
    maxUsers: 5,
    isPopular: true,
    description: 'Idéal pour les restaurants en croissance',
    features: [
      { name: '3 restaurants/pages publics', included: true },
      { name: '5 comptes utilisateurs', included: true },
      { name: 'Menu digital basique', included: true },
      { name: 'Commandes en ligne', included: true },
      { name: 'Paiement Mobile Money', included: true },
      { name: 'Réservations', included: true },
      { name: 'Livraison & drivers', included: true },
      { name: 'Programme de fidélité', included: true },
      { name: 'Multi-succursales', included: false },
      { name: 'Gestion des stocks', included: false },
      { name: 'Rapports avancés', included: false },
      { name: 'API access', included: false },
      { name: 'Multi-organisations', included: false },
      { name: 'White-label', included: false },
      { name: 'Support prioritaire', included: false },
      { name: 'Formation incluse', included: false },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    slug: 'BUSINESS',
    price: 79.99,
    currency: 'EUR',
    billingInterval: 'monthly',
    maxRestaurants: 10,
    maxUsers: 15,
    isPopular: false,
    description: 'Pour les entreprises avec plusieurs points de vente',
    features: [
      { name: '10 restaurants/pages publics', included: true },
      { name: '15 comptes utilisateurs', included: true },
      { name: 'Menu digital basique', included: true },
      { name: 'Commandes en ligne', included: true },
      { name: 'Paiement Mobile Money', included: true },
      { name: 'Réservations', included: true },
      { name: 'Livraison & drivers', included: true },
      { name: 'Programme de fidélité', included: true },
      { name: 'Multi-succursales', included: true },
      { name: 'Gestion des stocks', included: true },
      { name: 'Rapports avancés', included: true },
      { name: 'API access', included: true },
      { name: 'Multi-organisations', included: false },
      { name: 'White-label', included: false },
      { name: 'Support prioritaire', included: false },
      { name: 'Formation incluse', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    slug: 'ENTERPRISE',
    price: 199.99,
    currency: 'EUR',
    billingInterval: 'monthly',
    maxRestaurants: -1, // Unlimited
    maxUsers: -1, // Unlimited
    isPopular: false,
    description: 'Solution complète pour les grandes organisations',
    features: [
      { name: 'Restaurants illimités', included: true },
      { name: 'Utilisateurs illimités', included: true },
      { name: 'Menu digital basique', included: true },
      { name: 'Commandes en ligne', included: true },
      { name: 'Paiement Mobile Money', included: true },
      { name: 'Réservations', included: true },
      { name: 'Livraison & drivers', included: true },
      { name: 'Programme de fidélité', included: true },
      { name: 'Multi-succursales', included: true },
      { name: 'Gestion des stocks', included: true },
      { name: 'Rapports avancés', included: true },
      { name: 'API access', included: true },
      { name: 'Multi-organisations', included: true },
      { name: 'White-label', included: true },
      { name: 'Support prioritaire', included: true },
      { name: 'Formation incluse', included: true },
    ],
  },
];

// FAQ data
const FAQ_ITEMS = [
  {
    question: 'Puis-je changer de forfait à tout moment ?',
    answer: 'Oui, vous pouvez upgrader ou downgrader votre forfait à tout moment. Les changements seront appliqués immédiatement et la facturation sera ajustée au prorata.',
  },
  {
    question: 'Qu\'est-ce que l\'essai gratuit de 14 jours ?',
    answer: 'Tous nos forfaits incluent un essai gratuit de 14 jours sans engagement. Vous avez accès à toutes les fonctionnalités du forfait choisi pendant cette période.',
  },
  {
    question: 'Comment fonctionne la facturation ?',
    answer: 'La facturation est mensuelle ou annuelle selon votre choix. Le paiement peut être effectué par carte bancaire, Mobile Money (Orange, MTN, Wave) ou virement bancaire.',
  },
  {
    question: 'Puis-je annuler mon abonnement ?',
    answer: 'Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. L\'annulation prend effet à la fin de la période de facturation en cours.',
  },
  {
    question: 'Quels modes de paiement acceptez-vous ?',
    answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard), les paiements Mobile Money (Orange Money, MTN Mobile Money, Wave), et les virements bancaires pour les forfaits Enterprise.',
  },
  {
    question: 'Y a-t-il des frais d\'installation ?',
    answer: 'Non, il n\'y a aucuns frais d\'installation. Vous pouvez commencer immédiatement avec l\'essai gratuit de 14 jours.',
  },
];

// Feature comparison for table
const FEATURE_COMPARISON = [
  { feature: 'Restaurants', starter: '1', pro: '3', business: '10', enterprise: 'Illimité' },
  { feature: 'Utilisateurs', starter: '2', pro: '5', business: '15', enterprise: 'Illimité' },
  { feature: 'Menu Digital', starter: true, pro: true, business: true, enterprise: true },
  { feature: 'Commandes en ligne', starter: true, pro: true, business: true, enterprise: true },
  { feature: 'Paiement Mobile Money', starter: true, pro: true, business: true, enterprise: true },
  { feature: 'Réservations', starter: false, pro: true, business: true, enterprise: true },
  { feature: 'Livraison & Drivers', starter: false, pro: true, business: true, enterprise: true },
  { feature: 'Programme de fidélité', starter: false, pro: true, business: true, enterprise: true },
  { feature: 'Multi-succursales', starter: false, pro: false, business: true, enterprise: true },
  { feature: 'Gestion des stocks', starter: false, pro: false, business: true, enterprise: true },
  { feature: 'Rapports avancés', starter: false, pro: false, business: true, enterprise: true },
  { feature: 'API access', starter: false, pro: false, business: true, enterprise: true },
  { feature: 'Multi-organisations', starter: false, pro: false, business: false, enterprise: true },
  { feature: 'White-label', starter: false, pro: false, business: false, enterprise: true },
  { feature: 'Support prioritaire', starter: false, pro: false, business: false, enterprise: true },
  { feature: 'Formation incluse', starter: false, pro: false, business: false, enterprise: true },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const getPrice = (price: number) => {
    if (billingPeriod === 'yearly') {
      return (price * 10).toFixed(2); // 2 months free
    }
    return price.toFixed(2);
  };

  const handleSubscribe = async (planSlug: string) => {
    // TODO: Implement subscription logic
    console.log('Subscribing to plan:', planSlug);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-orange-200/30 to-transparent rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24 text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            <Sparkles className="w-4 h-4 mr-2" />
            Essai gratuit 14 jours
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-clip-text text-transparent">
              Tarifs simples et transparents
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Choisissez le forfait adapté à votre restaurant. Sans engagement, sans surprise.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingPeriod === 'yearly'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Annuel
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                -17%
              </Badge>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col transition-all duration-300 hover:shadow-xl ${
                plan.isPopular
                  ? 'border-orange-500 border-2 shadow-lg scale-105 z-10 bg-gradient-to-b from-white to-orange-50 dark:from-gray-900 dark:to-orange-950/20'
                  : 'border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1">
                    Le plus populaire
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1">
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price === 0 ? 'Sur mesure' : `${getPrice(plan.price)}€`}</span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 dark:text-gray-400">
                        /{billingPeriod === 'yearly' ? 'an' : 'mois'}
                      </span>
                    )}
                  </div>
                  {billingPeriod === 'yearly' && plan.price > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {(plan.price * 12).toFixed(2)}€ économisés
                    </p>
                  )}
                </div>
                
                <ul className="space-y-3">
                  {plan.features.slice(0, 8).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button
                  onClick={() => handleSubscribe(plan.slug)}
                  className={`w-full ${
                    plan.isPopular
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                      : 'bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900'
                  }`}
                >
                  {plan.price === 0 ? 'Nous contacter' : 'Commencer l\'essai gratuit'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Comparaison des fonctionnalités</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Découvrez les fonctionnalités incluses dans chaque forfait
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="text-left p-4 font-semibold">Fonctionnalités</th>
                  <th className="text-center p-4 font-semibold">Starter</th>
                  <th className="text-center p-4 font-semibold bg-orange-50 dark:bg-orange-900/20">
                    <div className="flex flex-col items-center">
                      <span>Pro</span>
                      <Badge variant="secondary" className="mt-1 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        Populaire
                      </Badge>
                    </div>
                  </th>
                  <th className="text-center p-4 font-semibold">Business</th>
                  <th className="text-center p-4 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_COMPARISON.map((row, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="p-4 text-gray-700 dark:text-gray-300">{row.feature}</td>
                    <td className="text-center p-4">
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 dark:text-gray-600 mx-auto" />
                        )
                      ) : (
                        <span className="font-medium">{row.starter}</span>
                      )}
                    </td>
                    <td className="text-center p-4 bg-orange-50/50 dark:bg-orange-900/10">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 dark:text-gray-600 mx-auto" />
                        )
                      ) : (
                        <span className="font-medium">{row.pro}</span>
                      )}
                    </td>
                    <td className="text-center p-4">
                      {typeof row.business === 'boolean' ? (
                        row.business ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 dark:text-gray-600 mx-auto" />
                        )
                      ) : (
                        <span className="font-medium">{row.business}</span>
                      )}
                    </td>
                    <td className="text-center p-4">
                      {typeof row.enterprise === 'boolean' ? (
                        row.enterprise ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 dark:text-gray-600 mx-auto" />
                        )
                      ) : (
                        <span className="font-medium">{row.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-4 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Questions fréquentes</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Tout ce que vous devez savoir sur nos tarifs
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-6"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <span className="text-left font-medium">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400 pb-4">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à transformer votre restaurant ?
          </h2>
          <p className="text-orange-100 mb-8 text-lg">
            Commencez votre essai gratuit de 14 jours aujourd'hui. Aucune carte de crédit requise.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-orange-50">
            Commencer gratuitement
          </Button>
        </div>
      </div>
    </div>
  );
}
