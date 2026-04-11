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
    if (plans.length === 0) {
      const demoPlans = [
        {
          id: 'plan-1',
          name: 'Déjeuner Express',
          description: 'Un repas par jour, du lundi au vendredi',
          mealsPerWeek: 5,
          mealsPerDay: 1,
          daysPerWeek: 5,
          price: 150000,
          duration: 30,
          features: JSON.stringify([
            '1 repas par jour',
            '5 jours par semaine (Lun-Ven)',
            'Choix du menu quotidien',
            'Livraison gratuite',
            'Support prioritaire'
          ]),
          isActive: true,
          isPopular: false,
          sortOrder: 1
        },
        {
          id: 'plan-2',
          name: 'Formule Complète',
          description: 'Déjeuner et dîner, du lundi au vendredi',
          mealsPerWeek: 10,
          mealsPerDay: 2,
          daysPerWeek: 5,
          price: 280000,
          duration: 30,
          features: JSON.stringify([
            '2 repas par jour (déj. + dîn.)',
            '5 jours par semaine (Lun-Ven)',
            'Menu varié chaque jour',
            'Livraison gratuite',
            'Boisson incluse',
            'Support prioritaire'
          ]),
          isActive: true,
          isPopular: true,
          sortOrder: 2
        },
        {
          id: 'plan-3',
          name: 'Premium Week',
          description: 'Deux repas par jour, 7 jours sur 7',
          mealsPerWeek: 14,
          mealsPerDay: 2,
          daysPerWeek: 7,
          price: 380000,
          duration: 30,
          features: JSON.stringify([
            '2 repas par jour (déj. + dîn.)',
            '7 jours sur 7',
            'Menu premium',
            'Livraison prioritaire',
            'Boissons et desserts inclus',
            'Chef à disposition',
            'Support VIP 24/7'
          ]),
          isActive: true,
          isPopular: false,
          sortOrder: 3
        },
        {
          id: 'plan-4',
          name: 'Entreprise',
          description: 'Solution sur mesure pour votre entreprise',
          mealsPerWeek: 0,
          mealsPerDay: 0,
          daysPerWeek: 0,
          price: 0,
          duration: 30,
          features: JSON.stringify([
            'Tarification personnalisée',
            'Nombre de repas illimité',
            'Menu corporate',
            'Facturation mensuelle',
            'Gestion des invités',
            'Statistiques et rapports',
            'Account manager dédié'
          ]),
          isActive: true,
          isPopular: false,
          sortOrder: 4
        }
      ];

      return NextResponse.json({
        success: true,
        plans: demoPlans,
        isDemo: true
      });
    }

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
