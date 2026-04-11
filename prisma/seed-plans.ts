/**
 * Seed file for Subscription Plans
 * 
 * Run with: npx ts-node prisma/seed-plans.ts
 * or: npx prisma db seed (if configured in package.json)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const subscriptionPlans = [
  {
    name: 'Starter',
    slug: 'STARTER',
    price: 29.99,
    currency: 'EUR',
    billingInterval: 'monthly',
    maxRestaurants: 1,
    maxUsers: 2,
    features: JSON.stringify([
      '1 restaurant/page public',
      '2 comptes utilisateurs',
      'Menu digital basique',
      'Commandes en ligne',
      'Paiement Mobile Money',
    ]),
    isPopular: false,
    sortOrder: 1,
    isActive: true,
  },
  {
    name: 'Pro',
    slug: 'PRO',
    price: 59.99,
    currency: 'EUR',
    billingInterval: 'monthly',
    maxRestaurants: 3,
    maxUsers: 5,
    features: JSON.stringify([
      '3 restaurants/pages publics',
      '5 comptes utilisateurs',
      'Tout Starter +',
      'Réservations',
      'Livraison & drivers',
      'Programme de fidélité',
    ]),
    isPopular: true,
    sortOrder: 2,
    isActive: true,
  },
  {
    name: 'Business',
    slug: 'BUSINESS',
    price: 79.99,
    currency: 'EUR',
    billingInterval: 'monthly',
    maxRestaurants: 10,
    maxUsers: 15,
    features: JSON.stringify([
      '10 restaurants/pages publics',
      '15 comptes utilisateurs',
      'Tout Pro +',
      'Multi-succursales',
      'Gestion des stocks',
      'Rapports avancés',
      'API access',
    ]),
    isPopular: false,
    sortOrder: 3,
    isActive: true,
  },
  {
    name: 'Enterprise',
    slug: 'ENTERPRISE',
    price: 199.99,
    currency: 'EUR',
    billingInterval: 'monthly',
    maxRestaurants: -1, // Unlimited
    maxUsers: -1, // Unlimited
    features: JSON.stringify([
      'Restaurants illimités',
      'Utilisateurs illimités',
      'Tout Business +',
      'Multi-organisations',
      'White-label',
      'Support prioritaire',
      'Formation incluse',
    ]),
    isPopular: false,
    sortOrder: 4,
    isActive: true,
  },
];

async function main() {
  console.log('🌱 Starting seed for subscription plans...');

  // Clear existing plans
  await prisma.subscriptionPlan.deleteMany({});
  console.log('🗑️ Cleared existing subscription plans');

  // Insert new plans
  for (const plan of subscriptionPlans) {
    const created = await prisma.subscriptionPlan.create({
      data: plan,
    });
    console.log(`✅ Created plan: ${created.name} (${created.slug})`);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
