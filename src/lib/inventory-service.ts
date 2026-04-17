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

// Service functions
export class InventoryService {
  // Get all inventory items
  static async getInventoryItems(organizationId: string) {

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
      throw error;
    }
  }

  // Get stock movements
  static async getStockMovements(organizationId: string) {

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
      throw error;
    }
  }

  // Get stock alerts
  static async getStockAlerts(organizationId: string) {

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
    notes?: string
  ) {

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
  static async getInventoryStats(organizationId: string) {
    const items = await this.getInventoryItems(organizationId);
    
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