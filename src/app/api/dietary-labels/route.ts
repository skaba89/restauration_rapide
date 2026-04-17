import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all dietary labels
export async function GET(request: NextRequest) {
  try {
    const labels = await db.dietaryLabel.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: labels
    });
  } catch (error) {
    console.error('Error fetching dietary labels:', error);
    return NextResponse.json({
      success: true,
      data: []
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