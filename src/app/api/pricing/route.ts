import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Retrieve all subscription plans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    // Try to fetch from database
    let plans: unknown[] = [];
    try {
      const whereClause = activeOnly ? { isActive: true } : {};
      plans = await db.subscriptionPlan.findMany({
        where: whereClause,
        orderBy: { sortOrder: 'asc' },
      });
    } catch {
      console.log('Database not available');
    }

    // Parse features JSON for each plan
    const plansWithFeatures = plans.map((plan: Record<string, unknown>) => ({
      ...plan,
      features: typeof plan.features === 'string' ? JSON.parse(plan.features as string) : plan.features,
    }));

    return NextResponse.json({
      success: true,
      data: plansWithFeatures,
      trial: {
        duration: 14,
        unit: 'days',
        description: 'Essai gratuit de 14 jours',
      },
    });
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des forfaits' },
      { status: 500 }
    );
  }
}

// POST - Create a subscription (placeholder for Stripe integration)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, planSlug, billingPeriod = 'monthly' } = body;

    if (!organizationId || !planSlug) {
      return NextResponse.json(
        { success: false, error: 'ID organisation et forfait requis' },
        { status: 400 }
      );
    }

    // Validate plan exists
    const validPlans = ['STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE'];
    if (!validPlans.includes(planSlug)) {
      return NextResponse.json(
        { success: false, error: 'Forfait invalide' },
        { status: 400 }
      );
    }

    // TODO: Implement Stripe subscription creation
    // This is a placeholder for the Stripe integration
    // In production, you would:
    // 1. Create a Stripe customer if not exists
    // 2. Create a Stripe subscription
    // 3. Update the organization with subscription details
    // 4. Handle webhooks for payment confirmation
    const plan = null;
    
    return NextResponse.json({
      success: true,
      message: 'Abonnement créé avec succès',
      data: {
        organizationId,
        plan: planSlug,
        planName: plan?.name,
        price: plan?.price,
        currency: plan?.currency,
        billingPeriod,
        status: 'trialing',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      note: 'Stripe integration pending.',
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'abonnement' },
      { status: 500 }
    );
  }
}

// PUT - Update subscription (upgrade/downgrade)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, newPlanSlug } = body;

    if (!organizationId || !newPlanSlug) {
      return NextResponse.json(
        { success: false, error: 'ID organisation et nouveau forfait requis' },
        { status: 400 }
      );
    }

    // TODO: Implement Stripe subscription update
    // This would handle proration and immediate plan changes

    const plan = null;

    return NextResponse.json({
      success: true,
      message: 'Forfait mis à jour avec succès',
      data: {
        organizationId,
        newPlan: newPlanSlug,
        planName: plan?.name,
        price: plan?.price,
      },
      note: 'Stripe integration pending.',
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'abonnement' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'ID organisation requis' },
        { status: 400 }
      );
    }

    // TODO: Implement Stripe subscription cancellation
    // This would schedule cancellation at period end or immediately

    return NextResponse.json({
      success: true,
      message: 'Abonnement annulé avec succès',
      data: {
        organizationId,
        status: 'canceled',
        canceledAt: new Date(),
      },
      note: 'Stripe integration pending.',
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'annulation de l\'abonnement' },
      { status: 500 }
    );
  }
}