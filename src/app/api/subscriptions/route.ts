import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List subscriptions or plans
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const plans = searchParams.get('plans') === 'true';
    const status = searchParams.get('status');
    const id = searchParams.get('id');

    // Return plans if requested
    if (plans) {
      return NextResponse.json({
        success: true,
        plans: []
      });
    }

    // Return single subscription if ID provided
    if (id) {
      const subscription = await db.subscription.findUnique({
        where: { id },
        include: {
          orders: {
            take: 10,
            orderBy: { date: 'desc' }
          }
        }
      });
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

    const organizationId = searchParams.get('organizationId');

    const where: any = {};
    if (organizationId) {
      where.organizationId = organizationId;
    }
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
    const {
      organizationId,
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
    let plan = null;
    const finalPlanName = planName || plan?.name || 'Formule Personnalisée';
    const finalMealsPerDay = mealsPerDay || plan?.mealsPerDay || 1;
    const finalDaysPerWeek = daysPerWeek || plan?.daysPerWeek || 5;
    const finalPrice = monthlyPrice || plan?.pricePerMonth || 0;

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

    const subscription = await db.subscription.findUnique({ where: { id } });
    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Abonnement non trouvé' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // Handle different actions
    switch (action) {
      case 'pause':
        if (subscription.status !== 'active') {
          return NextResponse.json(
            { success: false, error: 'Seuls les abonnements actifs peuvent être mis en pause' },
            { status: 400 }
          );
        }
        updateData.status = 'paused';
        updateData.pauseStartDate = new Date().toISOString().split('T')[0];
        updateData.pauseEndDate = pauseEndDate;
        break;

      case 'resume':
        if (subscription.status !== 'paused') {
          return NextResponse.json(
            { success: false, error: 'Seuls les abonnements en pause peuvent être repris' },
            { status: 400 }
          );
        }
        updateData.status = 'active';
        updateData.pauseStartDate = null;
        updateData.pauseEndDate = null;
        break;

      case 'cancel':
        updateData.status = 'cancelled';
        updateData.autoRenew = false;
        break;

      case 'skipDay':
        if (!skipDate) {
          return NextResponse.json(
            { success: false, error: 'Date requise' },
            { status: 400 }
          );
        }
        const currentSkipDates = subscription.skipDates ? JSON.parse(subscription.skipDates) : [];
        if (!currentSkipDates.includes(skipDate)) {
          updateData.skipDates = JSON.stringify([...currentSkipDates, skipDate]);
        }
        break;

      case 'unskipDay':
        if (!skipDate) {
          return NextResponse.json(
            { success: false, error: 'Date requise' },
            { status: 400 }
          );
        }
        const existingSkipDates = subscription.skipDates ? JSON.parse(subscription.skipDates) : [];
        updateData.skipDates = JSON.stringify(existingSkipDates.filter((d: string) => d !== skipDate));
        break;

      case 'updateAutoRenew':
        updateData.autoRenew = autoRenew;
        break;

      default:
        // General update
        if (status) updateData.status = status;
        if (notes) updateData.notes = notes;
        break;
    }

    const updated = await db.subscription.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      subscription: updated,
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

    // Mark as cancelled instead of deleting
    const updated = await db.subscription.update({
      where: { id },
      data: {
        status: 'cancelled',
        autoRenew: false,
      },
    });

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
