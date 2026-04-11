import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Demo dietary labels
const DEMO_DIETARY_LABELS = [
  { id: 'vegetarian', name: 'Végétarien', slug: 'vegetarian', icon: '🥬', description: 'Sans viande ni poisson', color: 'bg-green-100 text-green-700', isActive: true },
  { id: 'vegan', name: 'Vegan', slug: 'vegan', icon: '🌱', description: 'Sans produits animaux', color: 'bg-emerald-100 text-emerald-700', isActive: true },
  { id: 'halal', name: 'Halal', slug: 'halal', icon: '☪️', description: 'Conforme aux prescriptions islamiques', color: 'bg-blue-100 text-blue-700', isActive: true },
  { id: 'gluten-free', name: 'Sans Gluten', slug: 'gluten-free', icon: '🌾', description: 'Sans gluten', color: 'bg-amber-100 text-amber-700', isActive: true },
  { id: 'kosher', name: 'Casher', slug: 'kosher', icon: '✡️', description: 'Conforme aux prescriptions juives', color: 'bg-purple-100 text-purple-700', isActive: true },
  { id: 'dairy-free', name: 'Sans Lait', slug: 'dairy-free', icon: '🥛', description: 'Sans produits laitiers', color: 'bg-cyan-100 text-cyan-700', isActive: true },
  { id: 'nut-free', name: 'Sans Fruits à Coque', slug: 'nut-free', icon: '🌰', description: 'Sans fruits à coque', color: 'bg-orange-100 text-orange-700', isActive: true },
  { id: 'low-carb', name: 'Faible en Glucides', slug: 'low-carb', icon: '🍖', description: 'Régime cétogène friendly', color: 'bg-red-100 text-red-700', isActive: true },
];

// GET - List all dietary labels
export async function GET(request: NextRequest) {
  try {
    const labels = await db.dietaryLabel.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    // Return demo data if no labels exist
    if (labels.length === 0) {
      return NextResponse.json({
        success: true,
        data: DEMO_DIETARY_LABELS
      });
    }

    return NextResponse.json({
      success: true,
      data: labels
    });
  } catch (error) {
    console.error('Error fetching dietary labels:', error);
    return NextResponse.json({
      success: true,
      data: DEMO_DIETARY_LABELS
    });
  }
}

// POST - Create a new dietary label
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, icon, description, color } = body;

    const label = await db.dietaryLabel.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        icon,
        description,
        color
      }
    });

    return NextResponse.json({
      success: true,
      data: label
    });
  } catch (error) {
    console.error('Error creating dietary label:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création'
    }, { status: 500 });
  }
}

// PUT - Update a dietary label
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, icon, description, color, isActive } = body;

    const label = await db.dietaryLabel.update({
      where: { id },
      data: { name, icon, description, color, isActive }
    });

    return NextResponse.json({
      success: true,
      data: label
    });
  } catch (error) {
    console.error('Error updating dietary label:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la mise à jour'
    }, { status: 500 });
  }
}

// DELETE - Delete a dietary label
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID requis'
      }, { status: 400 });
    }

    await db.dietaryLabel.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Label supprimé'
    });
  } catch (error) {
    console.error('Error deleting dietary label:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la suppression'
    }, { status: 500 });
  }
}
