// ============================================
// Single Inventory Item API for KFM DELICE
// GET/PUT/DELETE operations for individual items
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';

// GET - Retrieve single inventory item
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const demo = searchParams.get('demo') === 'true';

  if (demo) {
    // Demo mode - return mock item
    const demoItem = {
      id,
      name: 'Riz',
      category: 'ingredients',
      quantity: 50,
      unit: 'kg',
      minStock: 20,
      maxStock: 100,
      reorderPoint: 30,
      reorderQuantity: 50,
      cost: 5000,
      sellingPrice: 6000,
      supplier: 'Marché Central',
      location: 'Entrepôt A',
      status: 'in_stock',
      lastRestocked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return apiSuccess({ item: demoItem });
  }

  try {
    const item = await db.inventoryItem.findUnique({
      where: { id },
      include: {
        supplier: true,
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        menuItemLinks: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      return apiError('Article non trouvé', 404);
    }

    // Calculate status
    const status = item.quantity <= 0 
      ? 'out_of_stock' 
      : item.quantity <= item.minStock 
        ? 'low_stock' 
        : 'in_stock';

    return apiSuccess({ item: { ...item, status } });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return apiError('Erreur lors de la récupération de l\'article', 500);
  }
});

// PUT - Update inventory item
export const PUT = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();
  const searchParams = request.nextUrl.searchParams;
  const demo = searchParams.get('demo') === 'true';

  if (demo) {
    // Demo mode - return mock updated item
    const updatedItem = {
      id,
      ...body,
      status: body.quantity <= 0 
        ? 'out_of_stock' 
        : body.quantity <= (body.minStock || 0) 
          ? 'low_stock' 
          : 'in_stock',
      updatedAt: new Date().toISOString(),
    };
    return apiSuccess({ item: updatedItem }, 'Article mis à jour');
  }

  try {
    // Check if item exists
    const existingItem = await db.inventoryItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return apiError('Article non trouvé', 404);
    }

    // Extract updatable fields
    const {
      name,
      sku,
      category,
      subcategory,
      description,
      unit,
      quantity,
      minStock,
      maxStock,
      reorderPoint,
      reorderQuantity,
      cost,
      sellingPrice,
      location,
      expiryDate,
      imageUrl,
      barcode,
      isActive,
      notes,
      supplierId,
    } = body;

    // Update item
    const updatedItem = await db.inventoryItem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(sku !== undefined && { sku }),
        ...(category !== undefined && { category }),
        ...(subcategory !== undefined && { subcategory }),
        ...(description !== undefined && { description }),
        ...(unit !== undefined && { unit }),
        ...(quantity !== undefined && { quantity: parseFloat(quantity) }),
        ...(minStock !== undefined && { minStock: parseFloat(minStock) }),
        ...(maxStock !== undefined && { maxStock: parseFloat(maxStock) }),
        ...(reorderPoint !== undefined && { reorderPoint: parseFloat(reorderPoint) }),
        ...(reorderQuantity !== undefined && { reorderQuantity: parseFloat(reorderQuantity) }),
        ...(cost !== undefined && { cost: parseFloat(cost) }),
        ...(sellingPrice !== undefined && { sellingPrice: parseFloat(sellingPrice) }),
        ...(location !== undefined && { location }),
        ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(barcode !== undefined && { barcode }),
        ...(isActive !== undefined && { isActive }),
        ...(notes !== undefined && { notes }),
        ...(supplierId !== undefined && { supplierId }),
        updatedAt: new Date(),
      },
      include: {
        supplier: true,
      },
    });

    return apiSuccess({ item: updatedItem }, 'Article mis à jour avec succès');
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return apiError('Erreur lors de la mise à jour de l\'article', 500);
  }
});

// DELETE - Delete inventory item
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const demo = searchParams.get('demo') === 'true';

  if (demo) {
    return apiSuccess({}, 'Article supprimé avec succès');
  }

  try {
    // Check if item exists
    const existingItem = await db.inventoryItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return apiError('Article non trouvé', 404);
    }

    // Delete item (cascade will handle related records)
    await db.inventoryItem.delete({
      where: { id },
    });

    return apiSuccess({}, 'Article supprimé avec succès');
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return apiError('Erreur lors de la suppression de l\'article', 500);
  }
});
