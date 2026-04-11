import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Types
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  mealsPerDay: number;
  daysPerWeek: number;
  pricePerMonth: number;
  features: string[];
  popular?: boolean;
}

// Demo subscription plans
const DEMO_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-1',
    name: 'Déjeuner Express',
    description: 'Un repas par jour, du lundi au vendredi',
    mealsPerDay: 1,
    daysPerWeek: 5,
    pricePerMonth: 150000,
    features: [
      '1 repas par jour',
      '5 jours par semaine (Lun-Ven)',
      'Choix du menu quotidien',
      'Livraison gratuite',
      'Support prioritaire'
    ]
  },
  {
    id: 'plan-2',
    name: 'Formule Complète',
    description: 'Déjeuner et dîner, du lundi au vendredi',
    mealsPerDay: 2,
    daysPerWeek: 5,
    pricePerMonth: 280000,
    features: [
      '2 repas par jour (déj. + dîn.)',
      '5 jours par semaine (Lun-Ven)',
      'Menu varié chaque jour',
      'Livraison gratuite',
      'Boisson incluse',
      'Support prioritaire'
    ],
    popular: true
  },
  {
    id: 'plan-3',
    name: 'Premium Week',
    description: 'Deux repas par jour, 7 jours sur 7',
    mealsPerDay: 2,
    daysPerWeek: 7,
    pricePerMonth: 380000,
    features: [
      '2 repas par jour (déj. + dîn.)',
      '7 jours sur 7',
      'Menu premium',
      'Livraison prioritaire',
      'Boissons et desserts inclus',
      'Chef à disposition',
      'Support VIP 24/7'
    ]
  },
  {
    id: 'plan-4',
    name: 'Entreprise',
    description: 'Solution sur mesure pour votre entreprise',
    mealsPerDay: 0,
    daysPerWeek: 0,
    pricePerMonth: 0,
    features: [
      'Tarification personnalisée',
      'Nombre de repas illimité',
      'Menu corporate',
      'Facturation mensuelle',
      'Gestion des invités',
      'Statistiques et rapports',
      'Account manager dédié'
    ]
  }
];

// Demo subscriptions
const DEMO_SUBSCRIPTIONS = [
  {
    id: 'SUB-001',
    customerName: 'Koné Ibrahim',
    customerPhone: '+224 62 345 67 89',
    customerEmail: 'ibrahim.kone@email.com',
    planId: 'plan-2',
    planName: 'Formule Complète',
    mealsPerDay: 2,
    daysPerWeek: 5,
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    autoRenew: true,
    monthlyPrice: 280000,
    nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    skippedDays: [],
    totalMealsDelivered: 30,
    deliveryAddress: 'Quartier Kaloum, Rue 45',
    preferredTime: '12:00',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SUB-002',
    customerName: 'Diallo Fatou',
    customerPhone: '+224 62 234 56 78',
    customerEmail: 'fatou.diallo@email.com',
    planId: 'plan-1',
    planName: 'Déjeuner Express',
    mealsPerDay: 1,
    daysPerWeek: 5,
    startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    autoRenew: true,
    monthlyPrice: 150000,
    nextBillingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    skippedDays: ['2024-01-15', '2024-01-16'],
    totalMealsDelivered: 18,
    deliveryAddress: 'Quartier Dixinn, Avenue de la République',
    preferredTime: '12:30',
    dietaryNotes: 'Pas de porc',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SUB-003',
    customerName: 'Touré Amadou',
    customerPhone: '+224 62 123 45 67',
    planId: 'plan-3',
    planName: 'Premium Week',
    mealsPerDay: 2,
    daysPerWeek: 7,
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'paused',
    autoRenew: true,
    monthlyPrice: 380000,
    nextBillingDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    skippedDays: [],
    totalMealsDelivered: 40,
    pauseStartDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    pauseEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    deliveryAddress: 'Quartier Matam, Rue 12',
    preferredTime: '12:00',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SUB-004',
    customerName: 'Sy Savane',
    customerPhone: '+224 66 111 22 33',
    customerEmail: 'savane.sy@email.com',
    planId: 'plan-2',
    planName: 'Formule Complète',
    mealsPerDay: 2,
    daysPerWeek: 5,
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    autoRenew: false,
    monthlyPrice: 280000,
    nextBillingDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    skippedDays: [],
    totalMealsDelivered: 10,
    deliveryAddress: 'Quartier Ratoma, Avenue 8',
    preferredTime: '19:00',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SUB-005',
    customerName: 'Bamba Seydou',
    customerPhone: '+224 64 444 55 66',
    planId: 'plan-1',
    planName: 'Déjeuner Express',
    mealsPerDay: 1,
    daysPerWeek: 5,
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'expired',
    autoRenew: false,
    monthlyPrice: 150000,
    nextBillingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    skippedDays: [],
    totalMealsDelivered: 100,
    deliveryAddress: 'Centre ville',
    preferredTime: '12:00',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// In-memory store for demo
let subscriptionsStore = [...DEMO_SUBSCRIPTIONS];

// GET - List subscriptions or plans
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const useDemo = searchParams.get('demo') === 'true';
    const plans = searchParams.get('plans') === 'true';
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const id = searchParams.get('id');

    // Return plans if requested
    if (plans) {
      return NextResponse.json({
        success: true,
        plans: DEMO_PLANS
      });
    }

    // Return single subscription if ID provided
    if (id) {
      const subscription = subscriptionsStore.find(s => s.id === id);
      if (!subscription) {
        return NextResponse.json(
          { success: false, error: 'Abonnement non trouvé' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        subscription
      });
    }

    // Try to get from database first (if not demo mode)
    if (!useDemo) {
      try {
        const organizationId = searchParams.get('organizationId') || 'demo-org';
        
        const where: any = { organizationId };
        if (status && status !== 'all') {
          where.status = status;
        }

        const dbSubscriptions = await db.subscription.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: {
            orders: {
              take: 10,
              orderBy: { date: 'desc' }
            }
          }
        });

        if (dbSubscriptions.length > 0) {
          // Calculate stats
          const stats = {
            total: dbSubscriptions.length,
            active: dbSubscriptions.filter(s => s.status === 'active').length,
            paused: dbSubscriptions.filter(s => s.status === 'paused').length,
            expired: dbSubscriptions.filter(s => s.status === 'expired').length,
            cancelled: dbSubscriptions.filter(s => s.status === 'cancelled').length,
            totalRevenue: dbSubscriptions
              .filter(s => s.status === 'active')
              .reduce((sum, s) => sum + s.price, 0),
            totalMealsDelivered: dbSubscriptions.reduce((sum, s) => sum + (s.mealsDelivered || 0), 0)
          };

          return NextResponse.json({
            success: true,
            subscriptions: dbSubscriptions.map(s => ({
              id: s.id,
              customerName: s.customerName || 'N/A',
              customerPhone: s.customerPhone || 'N/A',
              customerEmail: s.customerEmail,
              planId: s.planId,
              planName: s.planName || s.mealPlan,
              mealsPerDay: s.mealsPerDay || 1,
              daysPerWeek: s.daysPerWeek || 5,
              startDate: s.startDate?.toISOString().split('T')[0],
              endDate: s.endDate?.toISOString().split('T')[0],
              status: s.status,
              autoRenew: s.autoRenew,
              monthlyPrice: s.price,
              nextBillingDate: s.nextPaymentAt?.toISOString().split('T')[0],
              skippedDays: s.skipDates ? JSON.parse(s.skipDates) : [],
              totalMealsDelivered: s.mealsDelivered || 0,
              deliveryAddress: s.deliveryAddress,
              preferredTime: s.preferredTime || '12:00',
              dietaryNotes: s.dietaryNotes,
              createdAt: s.createdAt?.toISOString(),
              updatedAt: s.updatedAt?.toISOString()
            })),
            stats,
            total: dbSubscriptions.length
          });
        }
      } catch (dbError) {
        console.log('Using demo data due to DB error:', dbError);
      }
    }

    // Use demo data
    let subscriptions = [...subscriptionsStore];

    // Apply filters
    if (status && status !== 'all') {
      subscriptions = subscriptions.filter(s => s.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      subscriptions = subscriptions.filter(s => 
        s.customerName.toLowerCase().includes(searchLower) ||
        s.customerPhone.includes(search) ||
        s.id.toLowerCase().includes(searchLower)
      );
    }

    // Calculate stats
    const stats = {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'active').length,
      paused: subscriptions.filter(s => s.status === 'paused').length,
      expired: subscriptions.filter(s => s.status === 'expired').length,
      cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
      totalRevenue: subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + s.monthlyPrice, 0),
      totalMealsDelivered: subscriptions.reduce((sum, s) => sum + s.totalMealsDelivered, 0)
    };

    return NextResponse.json({
      success: true,
      subscriptions,
      stats,
      total: subscriptions.length,
      isDemo: true
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des abonnements' },
      { status: 500 }
    );
  }
}

// POST - Create subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const useDemo = body.demo === true || request.nextUrl.searchParams.get('demo') === 'true';
    const {
      organizationId = 'demo-org',
      customerName,
      customerPhone,
      customerEmail,
      planId,
      planName,
      mealsPerDay = 1,
      daysPerWeek = 5,
      monthlyPrice,
      startDate,
      autoRenew = true,
      deliveryAddress,
      preferredTime = '12:00',
      dietaryNotes,
      deliveryNotes,
      daysOfWeek
    } = body;

    // Validation
    if (!customerName || !customerPhone || !startDate) {
      return NextResponse.json(
        { success: false, error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Find plan details if not provided
    let plan = DEMO_PLANS.find(p => p.id === planId);
    const finalPlanName = planName || plan?.name || 'Formule Personnalisée';
    const finalMealsPerDay = mealsPerDay || plan?.mealsPerDay || 1;
    const finalDaysPerWeek = daysPerWeek || plan?.daysPerWeek || 5;
    const finalPrice = monthlyPrice || plan?.pricePerMonth || 0;

    if (!useDemo) {
      try {
        // Calculate next billing date (1 month from start)
        const start = new Date(startDate);
        const nextBilling = new Date(start);
        nextBilling.setMonth(nextBilling.getMonth() + 1);

        const subscription = await db.subscription.create({
          data: {
            organizationId,
            customerName,
            customerPhone,
            customerEmail,
            planId,
            planName: finalPlanName,
            mealsPerDay: finalMealsPerDay,
            daysPerWeek: finalDaysPerWeek,
            price: finalPrice,
            currency: 'GNF',
            startDate: new Date(startDate),
            nextPaymentAt: nextBilling,
            status: 'active',
            autoRenew,
            deliveryAddress,
            preferredTime,
            dietaryNotes,
            daysOfWeek: daysOfWeek ? JSON.stringify(daysOfWeek) : null
          }
        });

        return NextResponse.json({
          success: true,
          subscription: {
            id: subscription.id,
            customerName: subscription.customerName,
            customerPhone: subscription.customerPhone,
            planName: subscription.planName,
            status: subscription.status,
            startDate: subscription.startDate?.toISOString().split('T')[0]
          },
          message: 'Abonnement créé avec succès'
        });
      } catch (dbError) {
        console.log('Using demo mode due to DB error:', dbError);
      }
    }

    // Demo mode - create in memory
    const start = new Date(startDate);
    const nextBilling = new Date(start);
    nextBilling.setMonth(nextBilling.getMonth() + 1);

    const id = `SUB-${String(subscriptionsStore.length + 1).padStart(3, '0')}`;

    const newSubscription = {
      id,
      customerName,
      customerPhone,
      customerEmail,
      planId: planId || 'custom',
      planName: finalPlanName,
      mealsPerDay: finalMealsPerDay,
      daysPerWeek: finalDaysPerWeek,
      startDate,
      status: 'active' as const,
      autoRenew,
      monthlyPrice: finalPrice,
      nextBillingDate: nextBilling.toISOString().split('T')[0],
      skippedDays: [],
      totalMealsDelivered: 0,
      deliveryAddress,
      preferredTime,
      dietaryNotes,
      deliveryNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    subscriptionsStore.push(newSubscription as any);

    return NextResponse.json({
      success: true,
      subscription: newSubscription,
      message: 'Abonnement créé avec succès (démo)'
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'abonnement' },
      { status: 500 }
    );
  }
}

// PUT - Update subscription (pause, resume, skip day, etc.)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, skipDate, pauseEndDate, autoRenew, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID d\'abonnement requis' },
        { status: 400 }
      );
    }

    const index = subscriptionsStore.findIndex(s => s.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Abonnement non trouvé' },
        { status: 404 }
      );
    }

    const subscription = subscriptionsStore[index] as any;

    // Handle different actions
    switch (action) {
      case 'pause':
        if (subscription.status !== 'active') {
          return NextResponse.json(
            { success: false, error: 'Seuls les abonnements actifs peuvent être mis en pause' },
            { status: 400 }
          );
        }
        subscription.status = 'paused';
        subscription.pauseStartDate = new Date().toISOString().split('T')[0];
        subscription.pauseEndDate = pauseEndDate;
        break;

      case 'resume':
        if (subscription.status !== 'paused') {
          return NextResponse.json(
            { success: false, error: 'Seuls les abonnements en pause peuvent être repris' },
            { status: 400 }
          );
        }
        subscription.status = 'active';
        subscription.pauseStartDate = undefined;
        subscription.pauseEndDate = undefined;
        break;

      case 'cancel':
        subscription.status = 'cancelled';
        subscription.autoRenew = false;
        break;

      case 'skipDay':
        if (!skipDate) {
          return NextResponse.json(
            { success: false, error: 'Date requise' },
            { status: 400 }
          );
        }
        if (!subscription.skippedDays.includes(skipDate)) {
          subscription.skippedDays = [...subscription.skippedDays, skipDate];
        }
        break;

      case 'unskipDay':
        if (!skipDate) {
          return NextResponse.json(
            { success: false, error: 'Date requise' },
            { status: 400 }
          );
        }
        subscription.skippedDays = subscription.skippedDays.filter((d: string) => d !== skipDate);
        break;

      case 'updateAutoRenew':
        subscription.autoRenew = autoRenew;
        break;

      default:
        // General update
        if (status) subscription.status = status;
        if (notes) subscription.notes = notes;
        break;
    }

    subscription.updatedAt = new Date().toISOString();
    subscriptionsStore[index] = subscription;

    return NextResponse.json({
      success: true,
      subscription,
      message: 'Abonnement mis à jour avec succès'
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID d\'abonnement requis' },
        { status: 400 }
      );
    }

    const index = subscriptionsStore.findIndex(s => s.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Abonnement non trouvé' },
        { status: 404 }
      );
    }

    // Mark as cancelled instead of deleting
    subscriptionsStore[index] = {
      ...subscriptionsStore[index],
      status: 'cancelled',
      autoRenew: false,
      updatedAt: new Date().toISOString()
    } as any;

    return NextResponse.json({
      success: true,
      message: 'Abonnement annulé avec succès'
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'annulation' },
      { status: 500 }
    );
  }
}
