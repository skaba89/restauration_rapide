import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Demo categories for development
const DEMO_CATEGORIES = [
  { id: 'cat-001', name: 'Fournitures', type: 'supplies', budget: 5000000, color: '#3B82F6', icon: 'Package', description: 'Matières premières et ingrédients', isActive: true, sortOrder: 1 },
  { id: 'cat-002', name: 'Factures', type: 'utilities', budget: 2000000, color: '#EAB308', icon: 'Zap', description: 'Électricité, eau, internet', isActive: true, sortOrder: 2 },
  { id: 'cat-003', name: 'Loyer', type: 'rent', budget: 10000000, color: '#8B5CF6', icon: 'Home', description: 'Loyer mensuel du local', isActive: true, sortOrder: 3 },
  { id: 'cat-004', name: 'Salaires', type: 'salaries', budget: 15000000, color: '#22C55E', icon: 'Users', description: 'Salaires du personnel', isActive: true, sortOrder: 4 },
  { id: 'cat-005', name: 'Maintenance', type: 'maintenance', budget: 1000000, color: '#F97316', icon: 'Wrench', description: 'Réparations et entretien', isActive: true, sortOrder: 5 },
  { id: 'cat-006', name: 'Marketing', type: 'marketing', budget: 500000, color: '#EC4899', icon: 'Megaphone', description: 'Publicité et promotion', isActive: true, sortOrder: 6 },
  { id: 'cat-007', name: 'Autres', type: 'other', budget: 500000, color: '#6B7280', icon: 'MoreHorizontal', description: 'Dépenses diverses', isActive: true, sortOrder: 7 },
];

// GET - List expense categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const demo = searchParams.get('demo') === 'true';

    // Return demo data if requested or no organizationId
    if (demo || !organizationId) {
      return NextResponse.json({
        success: true,
        data: DEMO_CATEGORIES,
      });
    }

    // Real database query
    const categories = await db.expenseCategory.findMany({
      where: { organizationId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
}

// POST - Create expense category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organizationId,
      name,
      type,
      budget,
      color,
      icon,
      description,
      demo = false,
    } = body;

    // Validation
    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: 'Le nom et le type sont requis' },
        { status: 400 }
      );
    }

    const validTypes = ['supplies', 'utilities', 'rent', 'salaries', 'maintenance', 'marketing', 'other'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type de catégorie invalide' },
        { status: 400 }
      );
    }

    // Demo mode
    if (demo || !organizationId) {
      const newCategory = {
        id: `cat-${Date.now()}`,
        name,
        type,
        budget: budget || null,
        color: color || '#6B7280',
        icon: icon || 'Tag',
        description: description || null,
        isActive: true,
        sortOrder: DEMO_CATEGORIES.length + 1,
      };

      return NextResponse.json({
        success: true,
        data: newCategory,
        message: 'Catégorie créée avec succès',
      });
    }

    // Check if category with same name exists
    const existing = await db.expenseCategory.findFirst({
      where: { organizationId, name },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Une catégorie avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    // Get max sort order
    const maxSort = await db.expenseCategory.findFirst({
      where: { organizationId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const category = await db.expenseCategory.create({
      data: {
        organizationId,
        name,
        type,
        budget: budget || null,
        color: color || '#6B7280',
        icon: icon || 'Tag',
        description: description || null,
        sortOrder: (maxSort?.sortOrder || 0) + 1,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Catégorie créée avec succès',
    });
  } catch (error) {
    console.error('Error creating expense category:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la catégorie' },
      { status: 500 }
    );
  }
}

// PUT - Update expense category
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

    // Demo mode
    if (!organizationId) {
      return NextResponse.json({
        success: true,
        data: { id, ...updates, updatedAt: new Date() },
        message: 'Catégorie mise à jour avec succès',
      });
    }

    const category = await db.expenseCategory.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Catégorie mise à jour avec succès',
    });
  } catch (error) {
    console.error('Error updating expense category:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE - Delete expense category
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

    // Demo mode
    if (!organizationId) {
      return NextResponse.json({
        success: true,
        message: 'Catégorie supprimée avec succès',
      });
    }

    // Check if category has expenses
    const expensesCount = await db.expense.count({
      where: { categoryId: id },
    });

    if (expensesCount > 0) {
      // Soft delete - just mark as inactive
      await db.expenseCategory.update({
        where: { id },
        data: { isActive: false },
      });
    } else {
      // Hard delete
      await db.expenseCategory.delete({
        where: { id },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Catégorie supprimée avec succès',
    });
  } catch (error) {
    console.error('Error deleting expense category:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
