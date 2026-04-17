// Admin Expenses API - Gestion des dépenses
import { NextRequest } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
import { apiSuccess, apiError, getPaginationParams } from '@/lib/api-responses';

// GET /api/admin/expenses - List expenses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const restaurantId = searchParams.get('restaurantId');

    // Try database first
    if (isDatabaseAvailable() && db) {
      const where: any = {};
      
      if (category && category !== 'all') {
        where.category = category;
      }
      if (status && status !== 'all') {
        where.status = status;
      }
      if (restaurantId) {
        where.restaurantId = restaurantId;
      }

      const [expenses, total] = await Promise.all([
        db.expense.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            restaurant: {
              select: { name: true },
            },
          },
        }),
        db.expense.count({ where }),
      ]);

      return apiSuccess({ data: expenses, total, page, limit });
    }
    let filteredExpenses = [];
    
    if (category && category !== 'all') {
      filteredExpenses = filteredExpenses.filter(e => e.category === category);
    }
    if (status && status !== 'all') {
      filteredExpenses = filteredExpenses.filter(e => e.status === status);
    }

    const total = filteredExpenses.length;
    const paginatedExpenses = filteredExpenses.slice(skip, skip + limit);

    return apiSuccess({ data: paginatedExpenses, total, page, limit });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return apiError('Erreur lors du chargement des dépenses', 500);
  }
}

// POST /api/admin/expenses - Create expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      description,
      category,
      amount,
      restaurantId,
      notes,
      paidBy,
    } = body;

    if (!description || !category || !amount || !restaurantId) {
      return apiError('Description, catégorie, montant et restaurant sont requis', 400);
    }

    // Try database first
    if (isDatabaseAvailable() && db) {
      const expense = await db.expense.create({
        data: {
          description,
          category,
          amount: parseFloat(amount),
          restaurantId,
          notes: notes || null,
          paidBy: paidBy || 'Admin',
          status: 'PENDING',
          date: new Date(),
        },
        include: {
          restaurant: {
            select: { name: true },
          },
        },
      });

      return apiSuccess(expense, 'Dépense créée avec succès', 201);
    }

    // Fallback: return mock created expense
    const newExpense = {
      id: `exp-${Date.now()}`,
      description,
      category,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      status: 'PENDING',
      paidBy: paidBy || 'Admin',
      restaurantId,
      restaurant: { name: 'KFM DELICE' },
      notes: notes || null,
      createdAt: new Date().toISOString(),
    };

    return apiSuccess(newExpense, 'Dépense créée avec succès', 201);
  } catch (error) {
    console.error('Error creating expense:', error);
    return apiError('Erreur lors de la création de la dépense', 500);
  }
}