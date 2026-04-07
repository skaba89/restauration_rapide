// ============================================
// Stock Adjustment API for KFM DELICE
// POST - Adjust stock for an inventory item
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';

// In-memory storage for demo mode
const demoItems: Record<string, any> = {};

// POST - Create stock adjustment
export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();
  const searchParams = request.nextUrl.searchParams;
  const demo = searchParams.get('demo') === 'true';

  const { type, quantity, reason, notes, userId, organizationId } = body;

  // Validate required fields
  if (!type || !quantity || !reason) {
    return apiError('Type, quantité et raison sont requis', 400);
  }

  if (!['IN', 'OUT', 'ADJUSTMENT'].includes(type)) {
    return apiError('Type invalide. Utilisez IN, OUT ou ADJUSTMENT', 400);
  }

  if (demo) {
    // Demo mode - simulate adjustment
    let item = demoItems[id] || {
      id,
      name: 'Riz',
      quantity: 50,
      minStock: 20,
      unit: 'kg',
    };

    const previousQty = item.quantity;
    let newQty = previousQty;

    if (type === 'IN') {
      newQty = previousQty + parseFloat(quantity);
    } else if (type === 'OUT') {
      newQty = Math.max(0, previousQty - parseFloat(quantity));
    } else {
      newQty = parseFloat(quantity);
    }

    const status = newQty <= 0 
      ? 'out_of_stock' 
      : newQty <= item.minStock 
        ? 'low_stock' 
        : 'in_stock';

    const transaction = {
      id: `tx-${Date.now()}`,
      itemId: id,
      itemName: item.name,
      type,
      quantity: parseFloat(quantity),
      previousQty,
      newQty,
      reason,
      notes,
      createdAt: new Date().toISOString(),
      createdBy: userId || 'Admin',
    };

    demoItems[id] = { ...item, quantity: newQty };

    return apiSuccess({ 
      item: { ...item, quantity: newQty, status },
      transaction 
    }, 'Mouvement de stock enregistré');
  }

  try {
    // Start transaction
    const result = await db.$transaction(async (tx) => {
      // Get current item
      const item = await tx.inventoryItem.findUnique({
        where: { id },
      });

      if (!item) {
        throw new Error('Article non trouvé');
      }

      const previousQty = item.quantity;
      let newQty = previousQty;

      // Calculate new quantity
      if (type === 'IN') {
        newQty = previousQty + parseFloat(quantity);
      } else if (type === 'OUT') {
        newQty = Math.max(0, previousQty - parseFloat(quantity));
      } else {
        // ADJUSTMENT - set to exact value
        newQty = parseFloat(quantity);
      }

      // Update item
      const updatedItem = await tx.inventoryItem.update({
        where: { id },
        data: {
          quantity: newQty,
          lastRestocked: type === 'IN' ? new Date() : item.lastRestocked,
          updatedAt: new Date(),
        },
      });

      // Create transaction record
      const transaction = await tx.inventoryTransaction.create({
        data: {
          organizationId: organizationId || item.organizationId,
          restaurantId: item.restaurantId,
          itemId: id,
          type,
          quantity: parseFloat(quantity),
          previousQty,
          newQty,
          unitCost: item.cost,
          totalCost: item.cost ? item.cost * parseFloat(quantity) : null,
          reason,
          notes,
          userId,
        },
      });

      return { item: updatedItem, transaction };
    });

    // Create stock alert if needed
    const status = result.item.quantity <= 0 
      ? 'out_of_stock' 
      : result.item.quantity <= result.item.minStock 
        ? 'low_stock' 
        : 'in_stock';

    if (status === 'low_stock' || status === 'out_of_stock') {
      await db.stockAlert.create({
        data: {
          organizationId: result.item.organizationId,
          restaurantId: result.item.restaurantId,
          itemId: result.item.id,
          type: status === 'out_of_stock' ? 'OUT_OF_STOCK' : 'LOW_STOCK',
          message: status === 'out_of_stock' 
            ? `Rupture de stock: ${result.item.name}` 
            : `Stock bas: ${result.item.name} - ${result.item.quantity} ${result.item.unit} restant(s)`,
          threshold: result.item.minStock,
          currentQty: result.item.quantity,
        },
      });
    }

    return apiSuccess({ 
      item: { ...result.item, status },
      transaction: result.transaction 
    }, 'Mouvement de stock enregistré avec succès');
  } catch (error: any) {
    console.error('Error creating stock adjustment:', error);
    if (error.message === 'Article non trouvé') {
      return apiError('Article non trouvé', 404);
    }
    return apiError('Erreur lors de l\'enregistrement du mouvement', 500);
  }
});
