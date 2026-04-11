// ============================================
// Inventory Management API for KFM DELICE
// CRUD operations with demo mode support
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

// Demo Data - 15+ items for KFM DELICE
const DEMO_INVENTORY_ITEMS: InventoryItem[] = [
  { id: '1', name: 'Riz', category: 'ingredients', quantity: 50, unit: 'kg', minStock: 20, cost: 5000, supplier: 'Marché Central', location: 'Entrepôt A', status: 'in_stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastRestocked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', name: 'Huile', category: 'ingredients', quantity: 20, unit: 'L', minStock: 10, cost: 8000, supplier: 'Fournisseur Pro', location: 'Entrepôt A', status: 'in_stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: 'Tomates', category: 'ingredients', quantity: 10, unit: 'kg', minStock: 15, cost: 4000, supplier: 'Marché Central', location: 'Réfrigérateur 1', status: 'low_stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', name: 'Oignons', category: 'ingredients', quantity: 15, unit: 'kg', minStock: 10, cost: 2500, supplier: 'Marché Central', location: 'Entrepôt B', status: 'in_stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '5', name: 'Poulet', category: 'ingredients', quantity: 20, unit: 'kg', minStock: 15, cost: 18000, supplier: 'Boucherie Diallo', location: 'Congélateur 1', status: 'in_stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastRestocked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '6', name: 'Poisson', category: 'ingredients', quantity: 15, unit: 'kg', minStock: 10, cost: 25000, supplier: 'Pêcherie du Port', location: 'Congélateur 2', status: 'in_stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '7', name: 'Bouteilles d\'eau', category: 'beverages', quantity: 50, unit: 'unités', minStock: 30, cost: 500, supplier: 'Boissons Plus', location: 'Stock B', status: 'in_stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '8', name: 'Sacs plastique', category: 'packaging', quantity: 100, unit: 'unités', minStock: 50, cost: 200, supplier: 'Emballages Express', location: 'Stock C', status: 'in_stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '9', name: 'Jus de Bissap', category: 'beverages', quantity: 10, unit: 'L', minStock: 5, cost: 5000, supplier: 'Production locale', location: 'Réfrigérateur 2', status: 'in_stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '10', name: 'Charbon', category: 'supplies', quantity: 30, unit: 'kg', minStock: 20, cost: 3000, supplier: 'Fournisseur Village', location: 'Extérieur', status: 'in_stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '11', name: 'Attieké', category: 'ingredients', quantity: 8, unit: 'kg', minStock: 10, cost: 3500, supplier: 'Marché Central', location: 'Réfrigérateur 1', status: 'low_stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '12', name: 'Piment', category: 'ingredients', quantity: 3, unit: 'kg', minStock: 2, cost: 6000, supplier: 'Marché Central', location: 'Entrepôt B', status: 'in_stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '13', name: 'Gingembre', category: 'ingredients', quantity: 5, unit: 'kg', minStock: 3, cost: 6000, supplier: 'Marché Central', location: 'Réfrigérateur 1', status: 'in_stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '14', name: 'Ail', category: 'ingredients', quantity: 4, unit: 'kg', minStock: 5, cost: 8000, supplier: 'Marché Central', location: 'Entrepôt B', status: 'low_stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '15', name: 'Boîtes emballage', category: 'packaging', quantity: 200, unit: 'unités', minStock: 100, cost: 300, supplier: 'Emballages Express', location: 'Stock C', status: 'in_stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '16', name: 'Serviettes', category: 'packaging', quantity: 150, unit: 'unités', minStock: 50, cost: 150, supplier: 'Fournitures Pro', location: 'Stock C', status: 'in_stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '17', name: 'Savon vaisselle', category: 'supplies', quantity: 5, unit: 'L', minStock: 3, cost: 4000, supplier: 'Supermarché', location: 'Cuisine', status: 'in_stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '18', name: 'Coca-Cola', category: 'beverages', quantity: 24, unit: 'bouteilles', minStock: 20, cost: 800, supplier: 'Boissons Plus', location: 'Stock B', status: 'in_stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '19', name: 'Frites surgelées', category: 'ingredients', quantity: 0, unit: 'kg', minStock: 5, cost: 12000, supplier: 'Aliments Frais', location: 'Congélateur 1', status: 'out_of_stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '20', name: 'Banane plantain', category: 'ingredients', quantity: 12, unit: 'régimes', minStock: 5, cost: 3000, supplier: 'Marché Central', location: 'Entrepôt A', status: 'in_stock', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

// Demo stock movements
const DEMO_STOCK_MOVEMENTS: StockMovement[] = [
  { id: '1', itemId: '1', itemName: 'Riz', type: 'in', quantity: 50, previousQty: 0, newQty: 50, reason: 'Livraison fournisseur', notes: 'Livraison du Marché Central', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), createdBy: 'Admin' },
  { id: '2', itemId: '5', itemName: 'Poulet', type: 'in', quantity: 20, previousQty: 5, newQty: 25, reason: 'Achat', notes: 'Commande Boucherie Diallo', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), createdBy: 'Admin' },
  { id: '3', itemId: '5', itemName: 'Poulet', type: 'out', quantity: 5, previousQty: 25, newQty: 20, reason: 'Utilisation cuisine', notes: 'Service du jour', createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), createdBy: 'Chef' },
  { id: '4', itemId: '11', itemName: 'Attieké', type: 'out', quantity: 7, previousQty: 15, newQty: 8, reason: 'Utilisation cuisine', notes: 'Service midi', createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), createdBy: 'Chef' },
  { id: '5', itemId: '2', itemName: 'Huile', type: 'adjustment', quantity: 20, previousQty: 22, newQty: 20, reason: 'Inventaire', notes: 'Vérification stock', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), createdBy: 'Admin' },
  { id: '6', itemId: '19', itemName: 'Frites surgelées', type: 'out', quantity: 10, previousQty: 10, newQty: 0, reason: 'Utilisation cuisine', notes: 'Stock épuisé', createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), createdBy: 'Chef' },
];

// Demo suppliers
const DEMO_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Marché Central', contact: 'Mamadou Diallo', phone: '+224 620 00 00 01', email: 'marche.central@email.com', address: 'Marché Central, Conakry' },
  { id: '2', name: 'Boucherie Diallo', contact: 'Ibrahima Diallo', phone: '+224 620 00 00 02', address: 'Kaloum, Conakry' },
  { id: '3', name: 'Pêcherie du Port', contact: 'Fatou Camara', phone: '+224 620 00 00 03', address: 'Port de Conakry' },
  { id: '4', name: 'Boissons Plus', contact: 'Sekou Traoré', phone: '+224 620 00 00 04', email: 'boissons.plus@email.com', address: 'Ratoma, Conakry' },
  { id: '5', name: 'Emballages Express', contact: 'Aminata Sylla', phone: '+224 620 00 00 05', address: 'Dixinn, Conakry' },
  { id: '6', name: 'Fournisseur Pro', contact: 'Mohamed Koné', phone: '+224 620 00 00 06', email: 'fournisseur.pro@email.com', address: 'Matam, Conakry' },
];

// Demo purchase orders
const DEMO_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: '1',
    supplierId: '1',
    supplierName: 'Marché Central',
    items: [
      { itemId: '1', itemName: 'Riz', quantity: 30, unitPrice: 5000, totalPrice: 150000 },
      { itemId: '3', itemName: 'Tomates', quantity: 20, unitPrice: 4000, totalPrice: 80000 },
    ],
    totalAmount: 230000,
    status: 'pending',
    expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Commande hebdomadaire',
    createdAt: new Date().toISOString(),
    createdBy: 'Admin',
  },
  {
    id: '2',
    supplierId: '2',
    supplierName: 'Boucherie Diallo',
    items: [
      { itemId: '5', itemName: 'Poulet', quantity: 25, unitPrice: 18000, totalPrice: 450000 },
    ],
    totalAmount: 450000,
    status: 'ordered',
    expectedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'Admin',
  },
];

// In-memory storage for demo mode
let inventoryItems = [...DEMO_INVENTORY_ITEMS];
let stockMovements = [...DEMO_STOCK_MOVEMENTS];
let purchaseOrders = [...DEMO_PURCHASE_ORDERS];

// GET - List items with filters
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const demo = searchParams.get('demo') === 'true' || !searchParams.get('organizationId');
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
    return apiSuccess({ suppliers: DEMO_SUPPLIERS });
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
