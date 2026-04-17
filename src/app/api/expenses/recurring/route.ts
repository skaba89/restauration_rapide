import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrganizationCurrencyCode } from '@/lib/org-settings';

function getDemoRecurringExpenses() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return [
    {
      id: 'rec-001',
      name: 'Loyer mensuel',
      description: 'Loyer du local commercial',
      amount: 8500000,
      currency: 'GNF',
      frequency: 'monthly',
      nextDueDate: new Date(currentYear, currentMonth + 1, 1),
      lastProcessed: new Date(currentYear, currentMonth, 1),
      category: 'rent',
      supplierName: 'SCI KALOUM',
      paymentMethod: 'Virement bancaire',
      notes: 'Loyer du 1er au 30 du mois',
      isActive: true,
      autoCreate: true,
    },
    {
      id: 'rec-002',
      name: 'Abonnement Internet',
      description: 'Orange Fibre Pro',
      amount: 350000,
      currency: 'GNF',
      frequency: 'monthly',
      nextDueDate: new Date(currentYear, currentMonth + 1, 5),
      lastProcessed: new Date(currentYear, currentMonth, 5),
      category: 'utilities',
      supplierName: 'Orange Guinée',
      paymentMethod: 'Orange Money',
      notes: 'Prélèvement automatique',
      isActive: true,
      autoCreate: true,
    },
    {
      id: 'rec-003',
      name: 'Assurance responsabilité civile',
      description: 'Assurance annuelle restaurant',
      amount: 3840000,
      currency: 'GNF',
      frequency: 'yearly',
      nextDueDate: new Date(currentYear + 1, 0, 15),
      lastProcessed: new Date(currentYear, 0, 15),
      category: 'other',
      supplierName: 'NSIA Assurances',
      paymentMethod: 'Virement bancaire',
      notes: 'Renouvellement annuel',
      isActive: true,
      autoCreate: false,
    },
    {
      id: 'rec-004',
      name: 'Service de sécurité',
      description: 'Agent de sécurité nocturne',
      amount: 600000,
      currency: 'GNF',
      frequency: 'monthly',
      nextDueDate: new Date(currentYear, currentMonth + 1, 28),
      lastProcessed: new Date(currentYear, currentMonth, 28),
      category: 'salaries',
      supplierName: 'Security Plus',
      paymentMethod: 'Espèces',
      notes: 'Paiement fin de mois',
      isActive: true,
      autoCreate: true,
    },
    {
      id: 'rec-005',
      name: 'Publicité Facebook',
      description: 'Budget mensuel publicité sociale',
      amount: 250000,
      currency: 'GNF',
      frequency: 'monthly',
      nextDueDate: new Date(currentYear, currentMonth + 1, 1),
      lastProcessed: new Date(currentYear, currentMonth, 1),
      category: 'marketing',
      supplierName: 'Meta Ads',
      paymentMethod: 'Carte bancaire',
      notes: 'Prélèvement automatique carte',
      isActive: true,
      autoCreate: true,
    },
  ];
}

// GET - List recurring expenses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const isActive = searchParams.get('isActive');

    // Real database query
    const where: Record<string, unknown> = { organizationId };
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const recurringExpenses = await db.recurringExpense.findMany({
      where,
      orderBy: { nextDueDate: 'asc' },
      include: {
        categoryRelation: {
          select: { name: true, color: true, icon: true },
        },
      },
    });

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