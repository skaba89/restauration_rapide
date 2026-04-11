import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Demo floor plans data
const DEMO_FLOOR_PLANS = [
  {
    id: 'demo-1',
    name: 'Plan Principal',
    description: 'Plan de salle principal du restaurant',
    layout: JSON.stringify({
      sections: [
        { id: 'main', name: 'Salle Principale', color: '#3b82f6' },
        { id: 'terrace', name: 'Terrasse', color: '#22c55e' },
        { id: 'vip', name: 'VIP', color: '#f59e0b' },
        { id: 'intimate', name: 'Coins Intimes', color: '#ec4899' },
      ],
      canvasWidth: 800,
      canvasHeight: 600,
    }),
    isDefault: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-2',
    name: 'Plan Événement',
    description: 'Configuration spéciale pour les événements',
    layout: JSON.stringify({
      sections: [
        { id: 'main', name: 'Zone Principale', color: '#8b5cf6' },
        { id: 'stage', name: 'Scène', color: '#ef4444' },
      ],
      canvasWidth: 1000,
      canvasHeight: 800,
    }),
    isDefault: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// In-memory store for demo mode
let demoFloorPlansStore = [...DEMO_FLOOR_PLANS];

// GET - List floor plans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const demo = searchParams.get('demo') === 'true';

    // Demo mode
    if (demo || !restaurantId) {
      return NextResponse.json({
        success: true,
        floorPlans: demoFloorPlansStore.map(fp => ({
          ...fp,
          layout: fp.layout ? JSON.parse(fp.layout) : null,
        })),
        demo: true,
      });
    }

    // Real database query
    const floorPlans = await db.floorPlan.findMany({
      where: {
        restaurantId,
        isActive: true,
      },
      include: {
        _count: {
          select: { tables: true },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    });

    const transformedFloorPlans = floorPlans.map(fp => ({
      id: fp.id,
      name: fp.name,
      description: fp.description,
      layout: fp.layout ? JSON.parse(fp.layout) : null,
      isDefault: fp.isDefault,
      isActive: fp.isActive,
      tableCount: fp._count.tables,
      createdAt: fp.createdAt,
      updatedAt: fp.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      floorPlans: transformedFloorPlans,
      demo: false,
    });
  } catch (error) {
    console.error('Error fetching floor plans:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des plans de salle',
        floorPlans: demoFloorPlansStore.map(fp => ({
          ...fp,
          layout: fp.layout ? JSON.parse(fp.layout) : null,
        })),
        demo: true,
      },
      { status: 500 }
    );
  }
}

// POST - Create a new floor plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      restaurantId, 
      name, 
      description, 
      layout,
      isDefault = false,
      demo = false,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Le nom du plan de salle est requis' },
        { status: 400 }
      );
    }

    // Demo mode
    if (demo || !restaurantId) {
      const newFloorPlan = {
        id: `demo-${Date.now()}`,
        name,
        description: description || null,
        layout: layout ? JSON.stringify(layout) : null,
        isDefault,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      demoFloorPlansStore.push(newFloorPlan);
      
      return NextResponse.json({
        success: true,
        floorPlan: {
          ...newFloorPlan,
          layout: layout || null,
        },
        demo: true,
      });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.floorPlan.updateMany({
        where: { restaurantId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create floor plan in database
    const floorPlan = await db.floorPlan.create({
      data: {
        restaurantId,
        name,
        description: description || null,
        layout: layout ? JSON.stringify(layout) : null,
        isDefault,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      floorPlan: {
        id: floorPlan.id,
        name: floorPlan.name,
        description: floorPlan.description,
        layout: layout || null,
        isDefault: floorPlan.isDefault,
        isActive: floorPlan.isActive,
        createdAt: floorPlan.createdAt,
        updatedAt: floorPlan.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error creating floor plan:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du plan de salle' },
      { status: 500 }
    );
  }
}

// PUT - Update floor plans (batch)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { floorPlans, demo = false } = body;

    if (!Array.isArray(floorPlans)) {
      return NextResponse.json(
        { success: false, error: 'Format de données invalide' },
        { status: 400 }
      );
    }

    // Demo mode
    if (demo) {
      demoFloorPlansStore = floorPlans.map(fp => ({
        ...fp,
        layout: fp.layout ? JSON.stringify(fp.layout) : null,
        updatedAt: new Date(),
      }));
      
      return NextResponse.json({
        success: true,
        message: 'Plans de salle mis à jour avec succès',
        demo: true,
      });
    }

    // Real database update
    for (const fp of floorPlans) {
      await db.floorPlan.update({
        where: { id: fp.id },
        data: {
          name: fp.name,
          description: fp.description,
          layout: fp.layout ? JSON.stringify(fp.layout) : null,
          isDefault: fp.isDefault,
          isActive: fp.isActive,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Plans de salle mis à jour avec succès',
    });
  } catch (error) {
    console.error('Error updating floor plans:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour des plans de salle' },
      { status: 500 }
    );
  }
}
