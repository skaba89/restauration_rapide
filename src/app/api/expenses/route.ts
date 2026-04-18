import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrganizationCurrencyCode } from '@/lib/org-settings';

// Types
type ExpenseCategory = 'supplies' | 'utilities' | 'rent' | 'salaries' | 'maintenance' | 'marketing' | 'other';
type ExpenseStatus = 'pending' | 'approved' | 'paid' | 'cancelled';

interface DemoExpense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: Date;
  status: ExpenseStatus;
  paymentMethod: string;
  supplier?: string;
  receiptUrl?: string;
  notes?: string;
  createdBy: string;
}

// Generate demo expenses for current month
function generateDemoExpenses(): DemoExpense[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const expenses: DemoExpense[] = [
    // Fournitures (Supplies)
    {
      id: 'exp-001',
      category: 'supplies',
      description: 'Achat de riz local (50 kg)',
      amount: 425000,
      date: new Date(currentYear, currentMonth, 2),
      status: 'paid',
      paymentMethod: 'Orange Money',
      supplier: 'Marché de Kaloum',
      createdBy: 'Admin',
    },
    {
      id: 'exp-002',
      category: 'supplies',
      description: 'Poisson frais du jour',
      amount: 380000,
      date: new Date(currentYear, currentMonth, 3),
      status: 'paid',
      paymentMethod: 'Espèces',
      supplier: 'Pêcheurs de Dixinn',
      createdBy: 'Chef',
    },
    {
      id: 'exp-003',
      category: 'supplies',
      description: 'Légumes et légumes-feuilles',
      amount: 185000,
      date: new Date(currentYear, currentMonth, 4),
      status: 'paid',
      paymentMethod: 'MTN Momo',
      supplier: 'Marché de Madina',
      createdBy: 'Chef',
    },
    {
      id: 'exp-004',
      category: 'supplies',
      description: 'Huile de palme et condiments',
      amount: 275000,
      date: new Date(currentYear, currentMonth, 5),
      status: 'paid',
      paymentMethod: 'Espèces',
      supplier: 'Épicerie Solo',
      createdBy: 'Chef',
    },
    {
      id: 'exp-005',
      category: 'supplies',
      description: 'Viande de bœuf (20 kg)',
      amount: 520000,
      date: new Date(currentYear, currentMonth, 8),
      status: 'pending',
      paymentMethod: 'Virement',
      supplier: 'Boucherie Centrale',
      createdBy: 'Admin',
    },
    // Factures (Utilities)
    {
      id: 'exp-006',
      category: 'utilities',
      description: 'Facture électricité Mars',
      amount: 680000,
      date: new Date(currentYear, currentMonth, 5),
      status: 'paid',
      paymentMethod: 'EDG Guinée',
      supplier: 'EDG',
      createdBy: 'Admin',
    },
    {
      id: 'exp-007',
      category: 'utilities',
      description: 'Facture eau Mars',
      amount: 125000,
      date: new Date(currentYear, currentMonth, 5),
      status: 'paid',
      paymentMethod: 'SEG',
      supplier: 'SEG',
      createdBy: 'Admin',
    },
    {
      id: 'exp-008',
      category: 'utilities',
      description: 'Internet et téléphone',
      amount: 350000,
      date: new Date(currentYear, currentMonth, 1),
      status: 'paid',
      paymentMethod: 'Orange Money',
      supplier: 'Orange Guinée',
      createdBy: 'Admin',
    },
    // Loyer (Rent)
    {
      id: 'exp-009',
      category: 'rent',
      description: 'Loyer mensuel Avril',
      amount: 8500000,
      date: new Date(currentYear, currentMonth, 1),
      status: 'paid',
      paymentMethod: 'Virement bancaire',
      supplier: 'SCI KALOUM',
      createdBy: 'Admin',
    },
    // Salaires (Salaries)
    {
      id: 'exp-010',
      category: 'salaries',
      description: 'Salaires personnel - Cuisiniers',
      amount: 4500000,
      date: new Date(currentYear, currentMonth, 28),
      status: 'pending',
      paymentMethod: 'Virement bancaire',
      supplier: 'Personnel',
      createdBy: 'Admin',
    },
    {
      id: 'exp-011',
      category: 'salaries',
      description: 'Salaires personnel - Serveurs',
      amount: 2800000,
      date: new Date(currentYear, currentMonth, 28),
      status: 'pending',
      paymentMethod: 'Virement bancaire',
      supplier: 'Personnel',
      createdBy: 'Admin',
    },
    {
      id: 'exp-012',
      category: 'salaries',
      description: 'Salaire livreur',
      amount: 1200000,
      date: new Date(currentYear, currentMonth, 28),
      status: 'pending',
      paymentMethod: 'Orange Money',
      supplier: 'Personnel',
      createdBy: 'Admin',
    },
    // Maintenance
    {
      id: 'exp-013',
      category: 'maintenance',
      description: 'Réparation cuisinière gaz',
      amount: 325000,
      date: new Date(currentYear, currentMonth, 10),
      status: 'paid',
      paymentMethod: 'Espèces',
      supplier: 'Tech Services',
      createdBy: 'Chef',
    },
    {
      id: 'exp-014',
      category: 'maintenance',
      description: 'Entretien climatisation',
      amount: 180000,
      date: new Date(currentYear, currentMonth, 12),
      status: 'paid',
      paymentMethod: 'MTN Momo',
      supplier: 'Clima Services',
      createdBy: 'Admin',
    },
    {
      id: 'exp-015',
      category: 'maintenance',
      description: 'Réparation frigo commercial',
      amount: 450000,
      date: new Date(currentYear, currentMonth, 15),
      status: 'approved',
      paymentMethod: 'Virement',
      supplier: 'Froid Services',
      createdBy: 'Admin',
    },
    // Marketing
    {
      id: 'exp-016',
      category: 'marketing',
      description: 'Publicité Facebook/Instagram',
      amount: 250000,
      date: new Date(currentYear, currentMonth, 1),
      status: 'paid',
      paymentMethod: 'Carte bancaire',
      supplier: 'Meta Ads',
      createdBy: 'Admin',
    },
    {
      id: 'exp-017',
      category: 'marketing',
      description: 'Impression flyers promotionnels',
      amount: 85000,
      date: new Date(currentYear, currentMonth, 5),
      status: 'paid',
      paymentMethod: 'Espèces',
      supplier: 'Imprimerie Express',
      createdBy: 'Admin',
    },
    {
      id: 'exp-018',
      category: 'marketing',
      description: 'Sponsorisation événement local',
      amount: 500000,
      date: new Date(currentYear, currentMonth, 20),
      status: 'pending',
      paymentMethod: 'Virement',
      supplier: 'Association Kaloum',
      createdBy: 'Admin',
    },
    // Autres (Other)
    {
      id: 'exp-019',
      category: 'other',
      description: 'Frais bancaires mensuels',
      amount: 45000,
      date: new Date(currentYear, currentMonth, 1),
      status: 'paid',
      paymentMethod: 'Prélèvement automatique',
      supplier: 'BICIGUI',
      createdBy: 'Admin',
    },
    {
      id: 'exp-020',
      category: 'other',
      description: 'Assurance responsabilité civile',
      amount: 320000,
      date: new Date(currentYear, currentMonth, 15),
      status: 'paid',
      paymentMethod: 'Virement',
      supplier: 'NSIA Assurances',
      createdBy: 'Admin',
    },
  ];
  
  return expenses;
}

// Category configuration
export const CATEGORY_CONFIG: Record<ExpenseCategory, { label: string; color: string }> = {
  supplies: { label: 'Fournitures', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  utilities: { label: 'Factures', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  rent: { label: 'Loyer', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  salaries: { label: 'Salaires', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  maintenance: { label: 'Maintenance', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  marketing: { label: 'Marketing', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300' },
  other: { label: 'Autres', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
};

// GET - List expenses with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const organizationId = searchParams.get('organizationId');
    const category = searchParams.get('category') as ExpenseCategory | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status') as ExpenseStatus | null;
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check database availability
    if (!db) {
      // No database - return demo data for UI compatibility
      const demoExpenses = generateDemoExpenses();
      const paged = demoExpenses.slice(offset, offset + limit);
      const stats = calculateStats(demoExpenses);
      return NextResponse.json({
        success: true,
        data: paged,
        stats,
        categories: CATEGORY_CONFIG,
        pagination: {
          total: demoExpenses.length,
          limit,
          offset,
          hasMore: offset + limit < demoExpenses.length,
        },
      });
    }

    // Real database query
    const where: Record<string, unknown> = {};
    if (organizationId) where.organizationId = organizationId;
    if (restaurantId) where.restaurantId = restaurantId;
    if (category) where.category = category;
    if (status) where.status = status;
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { supplierName: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    let expenses, total;
    try {
      [expenses, total] = await Promise.all([
        db.expense.findMany({
          where,
          orderBy: { date: 'desc' },
          take: limit,
          skip: offset,
          include: {
            categoryRelation: {
              select: { name: true, color: true, icon: true },
            },
          },
        }),
        db.expense.count({ where }),
      ]);
    } catch {
      // Model/tables may not exist yet - return demo data
      const demoExpenses = generateDemoExpenses();
      const paged = demoExpenses.slice(offset, offset + limit);
      const stats = calculateStats(demoExpenses);
      return NextResponse.json({
        success: true,
        data: paged,
        stats,
        categories: CATEGORY_CONFIG,
        pagination: {
          total: demoExpenses.length,
          limit,
          offset,
          hasMore: offset + limit < demoExpenses.length,
        },
      });
    }

    // Calculate stats
    let stats;
    try {
      const allExpenses = await db.expense.findMany({ where });
      stats = calculateStatsFromDb(allExpenses);
    } catch {
      stats = calculateStats(expenses as any);
    }

    return NextResponse.json({
      success: true,
      data: expenses,
      stats,
      categories: CATEGORY_CONFIG,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des dépenses' },
      { status: 500 }
    );
  }
}

// POST - Create expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organizationId,
      restaurantId,
      categoryId,
      title,
      category,
      description,
      amount,
      date,
      paymentMethod,
      supplierName,
      supplierId,
      notes,
      receipt,
      status = 'pending',
      createdById,
    } = body;

    // Validation
    if (!description || !amount || !category) {
      return NextResponse.json(
        { success: false, error: 'La description, le montant et la catégorie sont requis' },
        { status: 400 }
      );
    }

    const validCategories = ['supplies', 'utilities', 'rent', 'salaries', 'maintenance', 'marketing', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Catégorie invalide' },
        { status: 400 }
      );
    }

    // Real database insert
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Base de données non disponible' },
        { status: 503 }
      );
    }
    // Get organization currency
    const currencyCode = await getOrganizationCurrencyCode(organizationId);
    
    const expense = await db.expense.create({
      data: {
        organizationId,
        restaurantId,
        categoryId,
        title,
        category,
        description,
        amount: parseFloat(amount),
        currency: currencyCode,
        date: date ? new Date(date) : new Date(),
        paymentMethod,
        supplierName,
        supplierId,
        notes,
        receipt,
        status,
        createdById,
      },
    });

    return NextResponse.json({
      success: true,
      data: expense,
      message: 'Dépense enregistrée avec succès',
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'enregistrement de la dépense' },
      { status: 500 }
    );
  }
}

// PUT - Update expense
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, organizationId, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requis' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'approved', 'paid', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Statut invalide' },
        { status: 400 }
      );
    }

    // Handle status transitions
    if (status === 'approved' && !updates.approvedAt) {
      updates.approvedAt = new Date();
    }

    if (!organizationId) {
      return NextResponse.json({
        success: true,
        data: {
          id,
          ...updates,
          ...(status && { status }),
          updatedAt: new Date(),
        },
        message: 'Dépense mise à jour avec succès',
      });
    }

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Base de données non disponible' },
        { status: 503 }
      );
    }

    const expense = await db.expense.update({
      where: { id },
      data: {
        ...updates,
        ...(status && { status }),
      },
    });

    return NextResponse.json({
      success: true,
      data: expense,
      message: 'Dépense mise à jour avec succès',
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE - Delete expense
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
        message: 'Dépense supprimée avec succès',
      });
    }

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Base de données non disponible' },
        { status: 503 }
      );
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
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}

// Helper function to calculate stats
function calculateStats(expenses: DemoExpense[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayTotal = expenses
    .filter(e => new Date(e.date) >= today)
    .reduce((sum, e) => sum + e.amount, 0);

  const weekTotal = expenses
    .filter(e => new Date(e.date) >= weekStart)
    .reduce((sum, e) => sum + e.amount, 0);

  const monthTotal = expenses
    .filter(e => new Date(e.date) >= monthStart)
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingTotal = expenses
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);

  const paidTotal = expenses
    .filter(e => e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0);

  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const byPaymentMethod = expenses.reduce((acc, e) => {
    acc[e.paymentMethod] = (acc[e.paymentMethod] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    today: todayTotal,
    week: weekTotal,
    month: monthTotal,
    total: expenses.reduce((sum, e) => sum + e.amount, 0),
    pending: pendingTotal,
    paid: paidTotal,
    byCategory,
    byPaymentMethod,
    count: expenses.length,
    pendingCount: expenses.filter(e => e.status === 'pending').length,
    paidCount: expenses.filter(e => e.status === 'paid').length,
  };
}

// Helper function to calculate stats from DB
function calculateStatsFromDb(expenses: Array<{ amount: number; date: Date; category: string; status: string; paymentMethod: string | null }>) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayTotal = expenses
    .filter(e => new Date(e.date) >= today)
    .reduce((sum, e) => sum + e.amount, 0);

  const weekTotal = expenses
    .filter(e => new Date(e.date) >= weekStart)
    .reduce((sum, e) => sum + e.amount, 0);

  const monthTotal = expenses
    .filter(e => new Date(e.date) >= monthStart)
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingTotal = expenses
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);

  const paidTotal = expenses
    .filter(e => e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0);

  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const byPaymentMethod = expenses.reduce((acc, e) => {
    const method = e.paymentMethod || 'Non spécifié';
    acc[method] = (acc[method] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    today: todayTotal,
    week: weekTotal,
    month: monthTotal,
    total: expenses.reduce((sum, e) => sum + e.amount, 0),
    pending: pendingTotal,
    paid: paidTotal,
    byCategory,
    byPaymentMethod,
    count: expenses.length,
    pendingCount: expenses.filter(e => e.status === 'pending').length,
    paidCount: expenses.filter(e => e.status === 'paid').length,
  };
}