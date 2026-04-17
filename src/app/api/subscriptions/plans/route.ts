import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all meal plans
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId') || 'demo-org';
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const where: any = { organizationId };
    if (activeOnly) {
      where.isActive = true;
    }

    const plans = await db.mealPlan.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    // If no plans exist, return demo data

    return NextResponse.json({
      success: true,
      plans: plans.map(p => ({
        ...p,
        features: p.features ? JSON.parse(p.features) : [],
        menuItems: p.menuItems ? JSON.parse(p.menuItems) : []
      }))
    });
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meal plans' },
      { status: 500 }
    );
  }
}

// POST - Create a new meal plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organizationId,
      name,
      description,
      mealsPerWeek,
      mealsPerDay = 1,
      daysPerWeek = 5,
      price,
      duration = 30,
      menuItems,
      features,
      isPopular = false,
      sortOrder = 0
    } = body;

    if (!organizationId || !name || !price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const plan = await db.mealPlan.create({
      data: {
        organizationId,
        name,
        description,
        mealsPerWeek,
        mealsPerDay,
        daysPerWeek,
        price,
        duration,
        menuItems: menuItems ? JSON.stringify(menuItems) : null,
        features: features ? JSON.stringify(features) : null,
        isPopular,
        sortOrder
      }
    });

    return NextResponse.json({
      success: true,
      plan: {
        ...plan,
        features: plan.features ? JSON.parse(plan.features) : [],
        menuItems: plan.menuItems ? JSON.parse(plan.menuItems) : []
      },
      message: 'Formule créée avec succès'
    });
  } catch (error) {
    console.error('Error creating meal plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create meal plan' },
      { status: 500 }
    );
  }
}

// PUT - Update a meal plan
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Handle JSON fields
    if (updates.features) {
      updates.features = JSON.stringify(updates.features);
    }
    if (updates.menuItems) {
      updates.menuItems = JSON.stringify(updates.menuItems);
    }

    const plan = await db.mealPlan.update({
      where: { id },
      data: updates
    });

    return NextResponse.json({
      success: true,
      plan: {
        ...plan,
        features: plan.features ? JSON.parse(plan.features) : [],
        menuItems: plan.menuItems ? JSON.parse(plan.menuItems) : []
      },
      message: 'Formule mise à jour avec succès'
    });
  } catch (error) {
    console.error('Error updating meal plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update meal plan' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a meal plan
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    await db.mealPlan.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Formule supprimée avec succès'
    });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete meal plan' },
      { status: 500 }
    );
  }
}