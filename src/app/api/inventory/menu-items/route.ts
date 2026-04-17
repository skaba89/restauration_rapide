// ============================================
// Menu Item Inventory Linking API for KFM DELICE
// Link inventory items to menu items (recipe management)
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';

// GET - Get inventory links for a menu item or all menu items with their inventory
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const menuItemId = searchParams.get('menuItemId');
  const inventoryItemId = searchParams.get('inventoryItemId');

  try {
    const where: any = {};
    
    if (menuItemId) {
      where.menuItemId = menuItemId;
    }
    if (inventoryItemId) {
      where.inventoryItemId = inventoryItemId;
    }

    const links = await db.menuItemInventory.findMany({
      where,
      include: {
        menuItem: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            isAvailable: true,
          },
        },
        inventoryItem: {
          select: {
            id: true,
            name: true,
            unit: true,
            quantity: true,
            minStock: true,
            cost: true,
            category: true,
          },
        },
      },
    });

    return apiSuccess({ links });
  } catch (error) {
    console.error('Error fetching menu item inventory links:', error);
    return apiError('Erreur lors de la récupération des liens', 500);
  }
});

// POST - Create or update menu item inventory link
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const searchParams = request.nextUrl.searchParams;

  const { menuItemId, inventoryItemId, quantity, unit } = body;

  if (!menuItemId || !inventoryItemId || quantity === undefined) {
    return apiError('menuItemId, inventoryItemId et quantity sont requis', 400);
  }

  try {
    // Verify menu item exists
    const menuItem = await db.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem) {
      return apiError('Article du menu non trouvé', 404);
    }

    // Verify inventory item exists
    const inventoryItem = await db.inventoryItem.findUnique({
      where: { id: inventoryItemId },
    });

    if (!inventoryItem) {
      return apiError('Article d\'inventaire non trouvé', 404);
    }

    // Use upsert to create or update
    const link = await db.menuItemInventory.upsert({
      where: {
        menuItemId_inventoryItemId: {
          menuItemId,
          inventoryItemId,
        },
      },
      update: {
        quantity: parseFloat(quantity),
        unit: unit || inventoryItem.unit,
      },
      create: {
        menuItemId,
        inventoryItemId,
        quantity: parseFloat(quantity),
        unit: unit || inventoryItem.unit,
      },
      include: {
        menuItem: {
          select: {
            id: true,
            name: true,
          },
        },
        inventoryItem: {
          select: {
            id: true,
            name: true,
            unit: true,
          },
        },
      },
    });

    return apiSuccess({ link }, 'Lien créé avec succès');
  } catch (error) {
    console.error('Error creating menu item inventory link:', error);
    return apiError('Erreur lors de la création du lien', 500);
  }
});

// DELETE - Remove menu item inventory link
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const linkId = searchParams.get('id');
  const menuItemId = searchParams.get('menuItemId');
  const inventoryItemId = searchParams.get('inventoryItemId');

  try {
    if (linkId) {
      await db.menuItemInventory.delete({
        where: { id: linkId },
      });
    } else if (menuItemId && inventoryItemId) {
      await db.menuItemInventory.delete({
        where: {
          menuItemId_inventoryItemId: {
            menuItemId,
            inventoryItemId,
          },
        },
      });
    } else {
      return apiError('ID ou combinaison menuItemId/inventoryItemId requis', 400);
    }

    return apiSuccess({}, 'Lien supprimé avec succès');
  } catch (error) {
    console.error('Error deleting menu item inventory link:', error);
    return apiError('Erreur lors de la suppression du lien', 500);
  }
});

// PUT - Batch update for menu item inventory (used when order is placed)
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const searchParams = request.nextUrl.searchParams;

  const { orderId, organizationId, userId } = body;

  if (!orderId) {
    return apiError('orderId est requis', 400);
  }

  try {
    // Get order items with menu item inventory links
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                menuItemLinks: {
                  include: {
                    inventoryItem: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return apiError('Commande non trouvée', 404);
    }

    const deductions: any[] = [];
    const alerts: string[] = [];

    // Process each order item
    for (const orderItem of order.items) {
      if (!orderItem.menuItem?.menuItemLinks) continue;

      for (const link of orderItem.menuItem.menuItemLinks) {
        const deductQty = link.quantity * orderItem.quantity;
        const inventoryItem = link.inventoryItem;

        if (!inventoryItem) continue;

        const previousQty = inventoryItem.quantity;
        const newQty = Math.max(0, previousQty - deductQty);

        // Update inventory item
        await db.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: newQty,
            updatedAt: new Date(),
          },
        });

        // Create transaction record
        await db.inventoryTransaction.create({
          data: {
            organizationId: organizationId || order.restaurantId,
            restaurantId: order.restaurantId,
            itemId: inventoryItem.id,
            type: 'OUT',
            quantity: deductQty,
            previousQty,
            newQty,
            unitCost: inventoryItem.cost,
            totalCost: inventoryItem.cost ? inventoryItem.cost * deductQty : null,
            reason: 'Commande client',
            reference: orderId,
            referenceType: 'ORDER',
            userId,
          },
        });

        // Create alert if low stock
        if (newQty > 0 && newQty <= inventoryItem.minStock) {
          await db.stockAlert.create({
            data: {
              organizationId: organizationId || order.restaurantId,
              restaurantId: order.restaurantId,
              itemId: inventoryItem.id,
              type: 'LOW_STOCK',
              message: `Stock bas: ${inventoryItem.name} - ${newQty} ${inventoryItem.unit} restant(s)`,
              threshold: inventoryItem.minStock,
              currentQty: newQty,
            },
          });
          alerts.push(`${inventoryItem.name} - Stock bas`);
        } else if (newQty <= 0) {
          await db.stockAlert.create({
            data: {
              organizationId: organizationId || order.restaurantId,
              restaurantId: order.restaurantId,
              itemId: inventoryItem.id,
              type: 'OUT_OF_STOCK',
              message: `Rupture de stock: ${inventoryItem.name}`,
              threshold: inventoryItem.minStock,
              currentQty: 0,
            },
          });
          alerts.push(`${inventoryItem.name} - Rupture de stock`);
        }

        deductions.push({
          itemId: inventoryItem.id,
          name: inventoryItem.name,
          deducted: deductQty,
          previousQty,
          newQty,
        });
      }
    }

    return apiSuccess({ 
      deducted: deductions.length,
      details: deductions,
      alerts 
    }, 'Stock déduit avec succès');
  } catch (error) {
    console.error('Error deducting stock:', error);
    return apiError('Erreur lors de la déduction du stock', 500);
  }
});