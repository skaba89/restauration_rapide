// ============================================
// Inventory Management API for KFM DELICE
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler, getPagination } from '@/lib/api-responses';

// Types
interface InventoryItem {
  id: string;
  name: string;
  category: 'ingredients' | 'packaging' | 'beverages' | 'supplies';
  quantity: number;
  unit: string;
  minStock: number;
  cost: number;
  supplier?: string;
  expiryDate?: string;
  location?: string;
  lastRestocked?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
}

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousQty: number;
  newQty: number;
  reason: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  expectedDelivery?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email?: string;
  address?: string;
}
let inventoryItems = [];
let stockMovements = [];
let purchaseOrders = [];

// GET - List items with filters
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const category = searchParams.get('category');
  const lowStock = searchParams.get('lowStock') === 'true';
  const search = searchParams.get('search');
  const itemId = searchParams.get('id');

  // Get single item
  if (itemId) {
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item) {
      return apiError('Article non trouvé', 404);
    }
    return apiSuccess({ item });
  }

  // Get stock movements
  if (action === 'movements') {
    const itemFilter = searchParams.get('itemId');
    let filtered = [...stockMovements];
    if (itemFilter) {
      filtered = filtered.filter(m => m.itemId === itemFilter);
    }
    return apiSuccess({ movements: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) });
  }

  // Get alerts
  if (action === 'alerts') {
    const alerts = inventoryItems
      .filter(item => item.status === 'low_stock' || item.status === 'out_of_stock')
      .map(item => ({
        id: `alert-${item.id}`,
        itemId: item.id,
        itemName: item.name,
        type: item.status === 'out_of_stock' ? 'out_of_stock' : 'low_stock',
        message: item.status === 'out_of_stock' 
          ? `Rupture de stock: ${item.name}` 
          : `Stock bas: ${item.name} - ${item.quantity} ${item.unit} restant(s)`,
        quantity: item.quantity,
        minStock: item.minStock,
        createdAt: new Date().toISOString(),
      }));
    return apiSuccess({ alerts });
  }

  // Get suppliers
  if (action === 'suppliers') {
    return apiSuccess({ suppliers: [] });
  }

  // Get purchase orders
  if (action === 'purchase-orders') {
    const statusFilter = searchParams.get('status');
    let filtered = [...purchaseOrders];
    if (statusFilter) {
      filtered = filtered.filter(o => o.status === statusFilter);
    }
    return apiSuccess({ orders: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) });
  }

  // Get stats
  if (action === 'stats') {
    const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
    const totalItems = inventoryItems.length;
    const lowStockCount = inventoryItems.filter(i => i.status === 'low_stock').length;
    const outOfStockCount = inventoryItems.filter(i => i.status === 'out_of_stock').length;
    const inStockCount = inventoryItems.filter(i => i.status === 'in_stock').length;
    const categoryStats = inventoryItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return apiSuccess({
      totalValue,
      totalItems,
      lowStockCount,
      outOfStockCount,
      inStockCount,
      categoryStats,
    });
  }

  // Filter inventory items
  let filtered = [...inventoryItems];

  if (category && category !== 'all') {
    filtered = filtered.filter(item => item.category === category);
  }

  if (lowStock) {
    filtered = filtered.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock');
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      item.supplier?.toLowerCase().includes(searchLower) ||
      item.location?.toLowerCase().includes(searchLower)
    );
  }

  return apiSuccess({
    items: filtered,
    stats: {
      totalValue: inventoryItems.reduce((sum, item) => sum + (item.quantity * item.cost), 0),
      totalItems: inventoryItems.length,
      lowStockCount: inventoryItems.filter(i => i.status === 'low_stock').length,
      outOfStockCount: inventoryItems.filter(i => i.status === 'out_of_stock').length,
    },
  });
});

// POST - Create new item or stock movement
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { action, ...data } = body;

  // Create new inventory item
  if (action === 'create_item' || !action) {
    const { name, category, quantity, unit, minStock, cost, supplier, location, expiryDate } = data;

    if (!name || !category || quantity === undefined || !unit || minStock === undefined || cost === undefined) {
      return apiError('Tous les champs obligatoires doivent être remplis', 400);
    }

    const status = quantity <= 0 ? 'out_of_stock' : quantity <= minStock ? 'low_stock' : 'in_stock';

    const newItem: InventoryItem = {
      id: `${Date.now()}`,
      name,
      category,
      quantity,
      unit,
      minStock,
      cost,
      supplier,
      location,
      expiryDate,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inventoryItems.push(newItem);

    return apiSuccess({ item: newItem }, 'Article créé avec succès');
  }

  // Add stock movement
  if (action === 'stock_movement') {
    const { itemId, type, quantity, reason, notes, createdBy } = data;

    if (!itemId || !type || quantity === undefined || !reason) {
      return apiError('Tous les champs obligatoires doivent être remplis', 400);
    }

    const itemIndex = inventoryItems.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
      return apiError('Article non trouvé', 404);
    }

    const item = inventoryItems[itemIndex];
    const previousQty = item.quantity;
    let newQty = previousQty;

    if (type === 'in') {
      newQty = previousQty + quantity;
    } else if (type === 'out') {
      newQty = Math.max(0, previousQty - quantity);
    } else {
      newQty = quantity;
    }

    const status = newQty <= 0 ? 'out_of_stock' : newQty <= item.minStock ? 'low_stock' : 'in_stock';

    // Update item
    inventoryItems[itemIndex] = {
      ...item,
      quantity: newQty,
      status,
      updatedAt: new Date().toISOString(),
      lastRestocked: type === 'in' ? new Date().toISOString() : item.lastRestocked,
    };

    // Add movement record
    const movement: StockMovement = {
      id: `${Date.now()}`,
      itemId,
      itemName: item.name,
      type,
      quantity,
      previousQty,
      newQty,
      reason,
      notes,
      createdAt: new Date().toISOString(),
      createdBy: createdBy || 'Admin',
    };

    stockMovements.unshift(movement);

    return apiSuccess({ item: inventoryItems[itemIndex], movement }, 'Mouvement enregistré avec succès');
  }

  // Create purchase order
  if (action === 'create_purchase_order') {
    const { supplierId, supplierName, items, expectedDelivery, notes, createdBy } = data;

    if (!supplierId || !items || items.length === 0) {
      return apiError('Fournisseur et articles requis', 400);
    }

    const totalAmount = items.reduce((sum: number, item: PurchaseOrderItem) => sum + item.totalPrice, 0);

    const order: PurchaseOrder = {
      id: `${Date.now()}`,
      supplierId,
      supplierName,
      items,
      totalAmount,
      status: 'pending',
      expectedDelivery,
      notes,
      createdAt: new Date().toISOString(),
      createdBy: createdBy || 'Admin',
    };

    purchaseOrders.unshift(order);

    return apiSuccess({ order }, 'Commande créée avec succès');
  }

  return apiError('Action non reconnue', 400);
});

// PUT - Update item
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return apiError('ID requis', 400);
  }

  const itemIndex = inventoryItems.findIndex(i => i.id === id);
  if (itemIndex === -1) {
    return apiError('Article non trouvé', 404);
  }

  const item = inventoryItems[itemIndex];
  const newQuantity = updates.quantity !== undefined ? updates.quantity : item.quantity;
  const newMinStock = updates.minStock !== undefined ? updates.minStock : item.minStock;
  const status = newQuantity <= 0 ? 'out_of_stock' : newQuantity <= newMinStock ? 'low_stock' : 'in_stock';

  inventoryItems[itemIndex] = {
    ...item,
    ...updates,
    quantity: newQuantity,
    minStock: newMinStock,
    status,
    updatedAt: new Date().toISOString(),
  };

  return apiSuccess({ item: inventoryItems[itemIndex] }, 'Article mis à jour');
});

// DELETE - Delete item
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const action = searchParams.get('action');

  // Delete inventory item
  if (id && !action) {
    const itemIndex = inventoryItems.findIndex(i => i.id === id);
    if (itemIndex === -1) {
      return apiError('Article non trouvé', 404);
    }

    inventoryItems = inventoryItems.filter(i => i.id !== id);
    return apiSuccess({}, 'Article supprimé avec succès');
  }

  // Cancel purchase order
  if (action === 'cancel_order' && id) {
    const orderIndex = purchaseOrders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      return apiError('Commande non trouvée', 404);
    }

    purchaseOrders[orderIndex].status = 'cancelled';
    return apiSuccess({ order: purchaseOrders[orderIndex] }, 'Commande annulée');
  }

  return apiError('ID requis', 400);
});