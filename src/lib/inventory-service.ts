// ============================================
// Feature 1: Inventory Management Service
// ============================================

import { db } from '@/lib/db';

// Types
export interface InventoryItem {
  id: string;
  organizationId: string;
  name: string;
  unit: string;
  quantity: number;
  costPerUnit: number | null;
  lowStockThreshold: number;
  category: string;
  expiryDate: Date | null;
  supplier: string | null;
  location: string | null;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  ingredientId: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  previousQty: number;
  newQty: number;
  unit: string | null;
  referenceType: string | null;
  referenceId: string | null;
  notes: string | null;
  recordedBy: string | null;
  createdAt: Date;
}

export interface StockAlert {
  id: string;
  ingredientId: string;
  type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired';
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Demo data for inventory
const DEMO_INVENTORY_ITEMS = [
  { id: '1', name: 'Riz Local', unit: 'kg', quantity: 150, costPerUnit: 5000, lowStockThreshold: 50, category: 'Ingredients', status: 'in_stock' },
  { id: '2', name: 'Poisson Frais', unit: 'kg', quantity: 25, costPerUnit: 25000, lowStockThreshold: 20, category: 'Ingredients', status: 'in_stock' },
  { id: '3', name: 'Poulet', unit: 'kg', quantity: 15, costPerUnit: 18000, lowStockThreshold: 20, category: 'Ingredients', status: 'low_stock' },
  { id: '4', name: 'Huile Palme', unit: 'litre', quantity: 40, costPerUnit: 8000, lowStockThreshold: 15, category: 'Ingredients', status: 'in_stock' },
  { id: '5', name: 'Attieké', unit: 'kg', quantity: 8, costPerUnit: 3500, lowStockThreshold: 10, category: 'Ingredients', status: 'low_stock' },
  { id: '6', name: 'Tomates', unit: 'kg', quantity: 0, costPerUnit: 4000, lowStockThreshold: 10, category: 'Ingredients', status: 'out_of_stock' },
  { id: '7', name: 'Oignons', unit: 'kg', quantity: 35, costPerUnit: 2500, lowStockThreshold: 15, category: 'Ingredients', status: 'in_stock' },
  { id: '8', name: 'Gingembre', unit: 'kg', quantity: 5, costPerUnit: 6000, lowStockThreshold: 3, category: 'Ingredients', status: 'in_stock' },
  { id: '9', name: 'Jus Bissap', unit: 'litre', quantity: 20, costPerUnit: 5000, lowStockThreshold: 10, category: 'Beverages', status: 'in_stock' },
  { id: '10', name: 'Emballages', unit: 'paquet', quantity: 100, costPerUnit: 2000, lowStockThreshold: 30, category: 'Packaging', status: 'in_stock' },
];

const DEMO_STOCK_MOVEMENTS = [
  { id: '1', ingredientId: '1', ingredientName: 'Riz Local', type: 'in', quantity: 50, previousQty: 100, newQty: 150, unit: 'kg', notes: 'Livraison fournisseur', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: '2', ingredientId: '3', ingredientName: 'Poulet', type: 'out', quantity: 10, previousQty: 25, newQty: 15, unit: 'kg', notes: 'Commandes du jour', createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
  { id: '3', ingredientId: '5', ingredientName: 'Attieké', type: 'out', quantity: 7, previousQty: 15, newQty: 8, unit: 'kg', notes: 'Service midi', createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) },
];

// Service functions
export class InventoryService {
  // Get all inventory items
  static async getInventoryItems(organizationId: string, demo: boolean = false) {
    if (demo || !organizationId) {
      return DEMO_INVENTORY_ITEMS.map(item => ({
        ...item,
        organizationId: 'demo',
        expiryDate: null,
        supplier: null,
        location: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }

    try {
      const ingredients = await db.ingredient.findMany({
        where: { organizationId },
        orderBy: { name: 'asc' },
      });

      return ingredients.map(ing => ({
        ...ing,
        status: ing.quantity <= 0 ? 'out_of_stock' : 
                ing.quantity <= ing.lowStockThreshold ? 'low_stock' : 'in_stock',
      }));
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return DEMO_INVENTORY_ITEMS;
    }
  }

  // Get stock movements
  static async getStockMovements(organizationId: string, demo: boolean = false) {
    if (demo || !organizationId) {
      return DEMO_STOCK_MOVEMENTS;
    }

    try {
      const movements = await db.stockMovement.findMany({
        where: { organizationId },
        include: { ingredient: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return movements.map(m => ({
        ...m,
        ingredientName: m.ingredient?.name || 'Unknown',
      }));
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      return DEMO_STOCK_MOVEMENTS;
    }
  }

  // Get stock alerts
  static async getStockAlerts(organizationId: string, demo: boolean = false) {
    if (demo || !organizationId) {
      return [
        { id: '1', ingredientId: '3', ingredientName: 'Poulet', type: 'low_stock', message: 'Stock bas: 15 kg restant (seuil: 20 kg)', isRead: false, createdAt: new Date() },
        { id: '2', ingredientId: '5', ingredientName: 'Attieké', type: 'low_stock', message: 'Stock bas: 8 kg restant (seuil: 10 kg)', isRead: false, createdAt: new Date() },
        { id: '3', ingredientId: '6', ingredientName: 'Tomates', type: 'out_of_stock', message: 'Rupture de stock', isRead: false, createdAt: new Date() },
      ];
    }

    try {
      const lowStock = await db.ingredient.findMany({
        where: {
          organizationId,
          quantity: { lte: db.ingredient.fields.lowStockThreshold },
        },
      });

      return lowStock.map(ing => ({
        id: ing.id,
        ingredientId: ing.id,
        ingredientName: ing.name,
        type: ing.quantity <= 0 ? 'out_of_stock' : 'low_stock',
        message: ing.quantity <= 0 
          ? 'Rupture de stock' 
          : `Stock bas: ${ing.quantity} ${ing.unit} restant (seuil: ${ing.lowStockThreshold} ${ing.unit})`,
        isRead: false,
        createdAt: new Date(),
      }));
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      return [];
    }
  }

  // Add stock movement
  static async addStockMovement(
    organizationId: string,
    ingredientId: string,
    type: 'in' | 'out' | 'adjustment',
    quantity: number,
    notes?: string,
    demo: boolean = false
  ) {
    if (demo || !organizationId) {
      return { success: true, message: 'Movement recorded (demo mode)' };
    }

    try {
      const ingredient = await db.ingredient.findUnique({
        where: { id: ingredientId },
      });

      if (!ingredient) {
        throw new Error('Ingredient not found');
      }

      const previousQty = ingredient.quantity;
      const newQty = type === 'in' 
        ? previousQty + quantity 
        : type === 'out' 
          ? Math.max(0, previousQty - quantity)
          : quantity;

      await db.$transaction([
        db.stockMovement.create({
          data: {
            organizationId,
            ingredientId,
            type,
            quantity,
            previousQty,
            newQty,
            unit: ingredient.unit,
            notes,
          },
        }),
        db.ingredient.update({
          where: { id: ingredientId },
          data: { quantity: newQty },
        }),
      ]);

      return { success: true, message: 'Movement recorded' };
    } catch (error) {
      console.error('Error adding stock movement:', error);
      throw error;
    }
  }

  // Get inventory statistics
  static async getInventoryStats(organizationId: string, demo: boolean = false) {
    const items = await this.getInventoryItems(organizationId, demo);
    
    const totalValue = items.reduce((sum, item) => 
      sum + (item.quantity * (item.costPerUnit || 0)), 0
    );
    
    const lowStockCount = items.filter(i => i.status === 'low_stock').length;
    const outOfStockCount = items.filter(i => i.status === 'out_of_stock').length;

    return {
      totalItems: items.length,
      totalValue,
      lowStockCount,
      outOfStockCount,
      categories: [...new Set(items.map(i => i.category))],
    };
  }
}

export default InventoryService;
