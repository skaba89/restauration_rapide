// Menu Category API - Single category operations
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { generateSlug } from '@/lib/utils-helpers';
import { NextRequest } from 'next/server';

// GET /api/menu-categories/[id] - Get a single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;

    const category = await db.menuCategory.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { name: 'asc' }
        },
        _count: { select: { items: true } }
      }
    });

    if (!category) {
      return apiError('Catégorie non trouvée', 404);
    }

    return apiSuccess(category);
  });
}

// PUT /api/menu-categories/[id] - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    const body = await request.json();
    const { name, description, icon, isActive, sortOrder } = body;

    const existingCategory = await db.menuCategory.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return apiError('Catégorie non trouvée', 404);
    }

    const updateData: Record<string, unknown> = {};

    if (name) {
      updateData.name = name;
      const slug = generateSlug(name);
      // Check for duplicate slug
      const duplicate = await db.menuCategory.findFirst({
        where: { 
          menuId: existingCategory.menuId, 
          slug,
          id: { not: id }
        }
      });
      updateData.slug = duplicate ? `${slug}-${Date.now()}` : slug;
    }
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const category = await db.menuCategory.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { items: true } }
      }
    });

    return apiSuccess(category);
  });
}

// DELETE /api/menu-categories/[id] - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;

    const category = await db.menuCategory.findUnique({
      where: { id },
      include: {
        _count: { select: { items: true } }
      }
    });

    if (!category) {
      return apiError('Catégorie non trouvée', 404);
    }

    // Delete all items in this category first
    await db.menuItem.deleteMany({
      where: { categoryId: id }
    });

    // Then delete the category
    await db.menuCategory.delete({
      where: { id }
    });

    return apiSuccess({ message: 'Catégorie supprimée avec succès' });
  });
}
