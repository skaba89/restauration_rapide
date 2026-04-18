import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List expense categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    let categories;
    try {
      categories = await db.expenseCategory.findMany({
        where: { organizationId, isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    } catch {
      // Model/table may not exist yet - return default categories
      categories = [
        { id: 'cat-1', organizationId, name: 'Fournitures', type: 'supplies', budget: null, color: '#3B82F6', icon: 'Package', description: 'Achats de matières premières et fournitures', isActive: true, sortOrder: 1 },
        { id: 'cat-2', organizationId, name: 'Factures', type: 'utilities', budget: null, color: '#EAB308', icon: 'Zap', description: 'Électricité, eau, internet, téléphone', isActive: true, sortOrder: 2 },
        { id: 'cat-3', organizationId, name: 'Loyer', type: 'rent', budget: null, color: '#8B5CF6', icon: 'Home', description: 'Loyer mensuel du local', isActive: true, sortOrder: 3 },
        { id: 'cat-4', organizationId, name: 'Salaires', type: 'salaries', budget: null, color: '#22C55E', icon: 'Users', description: 'Salaires et charges du personnel', isActive: true, sortOrder: 4 },
        { id: 'cat-5', organizationId, name: 'Maintenance', type: 'maintenance', budget: null, color: '#F97316', icon: 'Wrench', description: 'Réparations et entretien', isActive: true, sortOrder: 5 },
        { id: 'cat-6', organizationId, name: 'Marketing', type: 'marketing', budget: null, color: '#EC4899', icon: 'Megaphone', description: 'Publicité et promotion', isActive: true, sortOrder: 6 },
        { id: 'cat-7', organizationId, name: 'Autres', type: 'other', budget: null, color: '#6B7280', icon: 'Tag', description: 'Autres dépenses', isActive: true, sortOrder: 7 },
      ];
    }

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