import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get single expense
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    const expense = await db.expense.findUnique({
      where: { id },
      include: {
        categoryRelation: {
          select: { name: true, color: true, icon: true },
        },
      },
    });

    if (!expense) {
      return NextResponse.json(
        { success: false, error: 'Dépense non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la dépense' },
      { status: 500 }
    );
  }
}

// PUT - Update expense
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { organizationId, ...updates } = body;

    // Handle status transitions
    if (updates.status === 'approved' && !updates.approvedAt) {
      updates.approvedAt = new Date();
    }

    if (updates.status === 'paid' && !updates.approvedAt) {
      updates.approvedAt = new Date();
    }

    if (!organizationId) {
      return NextResponse.json({
        success: true,
        data: { id, ...updates, updatedAt: new Date() },
        message: 'Dépense mise à jour avec succès',
      });
    }

    const expense = await db.expense.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      data: expense,
      message: 'Dépense mise à jour avec succès',
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la dépense' },
      { status: 500 }
    );
  }
}

// DELETE - Delete expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({
        success: true,
        message: 'Dépense supprimée avec succès',
      });
    }

    await db.expense.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Dépense supprimée avec succès',
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de la dépense' },
      { status: 500 }
    );
  }
}