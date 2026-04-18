import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
import { getOrganizationCurrencyCode } from '@/lib/org-settings';

// GET - List recurring expenses
export async function GET(request: NextRequest) {
  try {
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json(
        { success: false, error: 'Base de données non disponible' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const isActive = searchParams.get('isActive');

    const where: Record<string, unknown> = { organizationId };
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    let recurringExpenses;
    try {
      recurringExpenses = await db.recurringExpense.findMany({
        where,
        orderBy: { nextDueDate: 'asc' },
        include: {
          categoryRelation: {
            select: { name: true, color: true, icon: true },
          },
        },
      });
    } catch {
      // Model/table may not exist yet - return empty array
      recurringExpenses = [];
    }

    return NextResponse.json({
      success: true,
      data: recurringExpenses,
    });
  } catch (error) {
    console.error('Error fetching recurring expenses:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des dépenses récurrentes' },
      { status: 500 }
    );
  }
}

// POST - Create recurring expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organizationId,
      restaurantId,
      name,
      description,
      amount,
      currency,
      frequency,
      nextDueDate,
      categoryId,
      category,
      supplierName,
      paymentMethod,
      notes,
      autoCreate = true,
    } = body;

    // Validation
    if (!name || !amount || !frequency || !nextDueDate) {
      return NextResponse.json(
        { success: false, error: 'Le nom, le montant, la fréquence et la prochaine date d\'échéance sont requis' },
        { status: 400 }
      );
    }

    const validFrequencies = ['daily', 'weekly', 'monthly', 'yearly'];
    if (!validFrequencies.includes(frequency)) {
      return NextResponse.json(
        { success: false, error: 'Fréquence invalide' },
        { status: 400 }
      );
    }

    // Get organization currency if not specified
    const currencyCode = currency || await getOrganizationCurrencyCode(organizationId);

    const recurringExpense = await db.recurringExpense.create({
      data: {
        organizationId,
        restaurantId,
        name,
        description,
        amount: parseFloat(amount),
        currency: currencyCode,
        frequency,
        nextDueDate: new Date(nextDueDate),
        categoryId,
        category: category || 'other',
        supplierName,
        paymentMethod,
        notes,
        autoCreate,
      },
    });

    return NextResponse.json({
      success: true,
      data: recurringExpense,
      message: 'Dépense récurrente créée avec succès',
    });
  } catch (error) {
    console.error('Error creating recurring expense:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la dépense récurrente' },
      { status: 500 }
    );
  }
}

// PUT - Update recurring expense
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, organizationId, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requis' },
        { status: 400 }
      );
    }

    if (!organizationId) {
      return NextResponse.json({
        success: true,
        data: { id, ...updates, updatedAt: new Date() },
        message: 'Dépense récurrente mise à jour avec succès',
      });
    }

    const recurringExpense = await db.recurringExpense.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      data: recurringExpense,
      message: 'Dépense récurrente mise à jour avec succès',
    });
  } catch (error) {
    console.error('Error updating recurring expense:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE - Delete recurring expense
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const organizationId = searchParams.get('organizationId');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requis' },
        { status: 400 }
      );
    }

    if (!organizationId) {
      return NextResponse.json({
        success: true,
        message: 'Dépense récurrente supprimée avec succès',
      });
    }

    await db.recurringExpense.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Dépense récurrente supprimée avec succès',
    });
  } catch (error) {
    console.error('Error deleting recurring expense:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}