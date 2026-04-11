// ============================================
// Restaurant OS - Inventory Management Service
// Stock tracking, alerts, and predictions
// ============================================

import { logger } from '@/lib/logger';

// ============================================
// Inventory Types
// ============================================

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string; // kg, L, unit, etc.
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  cost: number; // Cost per unit
  supplier?: string;
  location?: string; // Storage location
  expiryDate?: Date;
  lastRestocked?: Date;
  lastUsed?: Date;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference?: string; // Order ID, invoice number, etc.
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface StockAlert {
  id: string;
  itemId: string;
  itemName: string;
  type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired';
  message: string;
  severity: 'warning' | 'critical' | 'info';
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface InventoryCategory {
  id: string;
  name: string;
  itemCount: number;
  totalValue: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  items: string[]; // Item IDs they supply
  leadTime: number; // Days
  minOrderValue?: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
  totalCost: number;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  createdAt: Date;
  expectedDelivery?: Date;
  receivedAt?: Date;
  notes?: string;
}

export interface InventoryPrediction {
  itemId: string;
  itemName: string;
  currentStock: number;
  predictedDemand: number;
  daysUntilStockout: number;
  suggestedOrderQuantity: number;
  suggestedOrderDate: Date;
  confidence: number; // 0-100
}

export interface InventoryReport {
  generatedAt: Date;
  period: { start: Date; end: Date };
  summary: {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    expiringItems: number;
    movements: number;
  };
  topUsedItems: Array<{ name: string; quantity: number }>;
  alerts: StockAlert[];
}

// ============================================
// Inventory Service Class
// ============================================

class InventoryService {
  private items: Map<string, InventoryItem> = new Map();
  private movements: StockMovement[] = [];
  private alerts: StockAlert[] = [];

  constructor() {
    this.initializeDemoData();
  }

  /**
   * Initialize demo data
   */
  private initializeDemoData(): void {
    const demoItems: InventoryItem[] = [
      { id: '1', name: 'Poisson Thiof', sku: 'POI-001', category: 'Poisson & Fruits de mer', unit: 'kg', currentStock: 45, minStock: 10, maxStock: 100, reorderPoint: 20, cost: 8500, supplier: 'Pêcheur Abidjan', status: 'in_stock' },
      { id: '2', name: 'Poulet Fermier', sku: 'POU-001', category: 'Viandes', unit: 'kg', currentStock: 25, minStock: 15, maxStock: 80, reorderPoint: 25, cost: 4500, supplier: 'Volaille Plus', status: 'in_stock' },
      { id: '3', name: 'Attieké', sku: 'ATT-001', category: 'Féculents', unit: 'kg', currentStock: 8, minStock: 10, maxStock: 50, reorderPoint: 15, cost: 1500, supplier: 'Manioc Express', status: 'low_stock' },
      { id: '4', name: 'Riz Local', sku: 'RIZ-001', category: 'Féculents', unit: 'kg', currentStock: 150, minStock: 50, maxStock: 300, reorderPoint: 75, cost: 800, supplier: 'Riz Ivoire', status: 'in_stock' },
      { id: '5', name: 'Huile de Palme', sku: 'HUI-001', category: 'Huiles & Graisses', unit: 'L', currentStock: 35, minStock: 20, maxStock: 100, reorderPoint: 30, cost: 2500, supplier: 'Palme Or', status: 'in_stock' },
      { id: '6', name: 'Tomates Fraîches', sku: 'TOM-001', category: 'Légumes', unit: 'kg', currentStock: 2, minStock: 10, maxStock: 40, reorderPoint: 15, cost: 1200, supplier: 'Maraicher Local', status: 'low_stock' },
      { id: '7', name: 'Oignons', sku: 'OIG-001', category: 'Légumes', unit: 'kg', currentStock: 28, minStock: 15, maxStock: 60, reorderPoint: 20, cost: 800, supplier: 'Maraicher Local', status: 'in_stock' },
      { id: '8', name: 'Bananes Plantain', sku: 'BAN-001', category: 'Fruits', unit: 'kg', currentStock: 40, minStock: 20, maxStock: 80, reorderPoint: 30, cost: 600, supplier: 'Fruit Express', status: 'in_stock' },
      { id: '9', name: 'Jus de Bissap', sku: 'JUS-001', category: 'Boissons', unit: 'L', currentStock: 18, minStock: 10, maxStock: 50, reorderPoint: 15, cost: 2000, status: 'in_stock' },
      { id: '10', name: 'Gingembre', sku: 'GIN-001', category: 'Épices', unit: 'kg', currentStock: 5, minStock: 3, maxStock: 15, reorderPoint: 5, cost: 3500, status: 'in_stock' },
      { id: '11', name: 'Piment', sku: 'PIM-001', category: 'Épices', unit: 'kg', currentStock: 0, minStock: 2, maxStock: 10, reorderPoint: 3, cost: 5000, status: 'out_of_stock' },
      { id: '12', name: 'Crème Fraîche', sku: 'CRE-001', category: 'Produits Laitiers', unit: 'L', currentStock: 12, minStock: 5, maxStock: 25, reorderPoint: 8, cost: 4500, expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), status: 'in_stock' },
    ];

    demoItems.forEach(item => this.items.set(item.id, item));
  }

  /**
   * Get all inventory items
   */
  async getItems(restaurantId: string, filters?: {
    category?: string;
    status?: string;
    lowStock?: boolean;
    search?: string;
  }): Promise<InventoryItem[]> {
    let items = Array.from(this.items.values());

    if (filters) {
      if (filters.category) {
        items = items.filter(i => i.category === filters.category);
      }
      if (filters.status) {
        items = items.filter(i => i.status === filters.status);
      }
      if (filters.lowStock) {
        items = items.filter(i => i.currentStock <= i.reorderPoint);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        items = items.filter(i => 
          i.name.toLowerCase().includes(search) ||
          i.sku.toLowerCase().includes(search)
        );
      }
    }

    return items;
  }

  /**
   * Get single inventory item
   */
  async getItem(itemId: string): Promise<InventoryItem | null> {
    return this.items.get(itemId) || null;
  }

  /**
   * Update stock quantity
   */
  async updateStock(
    itemId: string,
    quantity: number,
    type: 'in' | 'out' | 'adjustment',
    reason: string,
    userId: string,
    userName: string,
    reference?: string
  ): Promise<InventoryItem> {
    const item = this.items.get(itemId);
    if (!item) throw new Error('Item not found');

    const previousStock = item.currentStock;
    let newStock = previousStock;

    switch (type) {
      case 'in':
        newStock = previousStock + quantity;
        break;
      case 'out':
        newStock = Math.max(0, previousStock - quantity);
        break;
      case 'adjustment':
        newStock = quantity;
        break;
    }

    // Update item
    item.currentStock = newStock;
    item.lastRestocked = type === 'in' ? new Date() : item.lastRestocked;
    item.lastUsed = type === 'out' ? new Date() : item.lastUsed;
    item.status = this.calculateStatus(item);

    // Record movement
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      itemId,
      itemName: item.name,
      type,
      quantity,
      previousStock,
      newStock,
      reason,
      reference,
      userId,
      userName,
      timestamp: new Date(),
    };
    this.movements.push(movement);

    // Check for alerts
    await this.checkAndCreateAlerts(item);

    return item;
  }

  /**
   * Calculate item status
   */
  private calculateStatus(item: InventoryItem): InventoryItem['status'] {
    if (item.expiryDate && new Date(item.expiryDate) < new Date()) {
      return 'expired';
    }
    if (item.currentStock === 0) {
      return 'out_of_stock';
    }
    if (item.currentStock <= item.minStock) {
      return 'low_stock';
    }
    return 'in_stock';
  }

  /**
   * Check and create alerts
   */
  private async checkAndCreateAlerts(item: InventoryItem): Promise<void> {
    // Low stock alert
    if (item.currentStock <= item.reorderPoint && item.currentStock > 0) {
      await this.createAlert({
        itemId: item.id,
        itemName: item.name,
        type: 'low_stock',
        message: `Stock faible pour ${item.name}: ${item.currentStock} ${item.unit} restant(s)`,
        severity: 'warning',
      });
    }

    // Out of stock alert
    if (item.currentStock === 0) {
      await this.createAlert({
        itemId: item.id,
        itemName: item.name,
        type: 'out_of_stock',
        message: `Rupture de stock: ${item.name}`,
        severity: 'critical',
      });
    }

    // Expiring soon alert
    if (item.expiryDate) {
      const daysUntilExpiry = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        await this.createAlert({
          itemId: item.id,
          itemName: item.name,
          type: 'expiring_soon',
          message: `${item.name} expire dans ${daysUntilExpiry} jour(s)`,
          severity: 'warning',
        });
      }
    }
  }

  /**
   * Create an alert
   */
  private async createAlert(alert: Omit<StockAlert, 'id' | 'createdAt' | 'acknowledged'>): Promise<StockAlert> {
    const newAlert: StockAlert = {
      ...alert,
      id: `alert-${Date.now()}`,
      createdAt: new Date(),
      acknowledged: false,
    };
    this.alerts.push(newAlert);
    return newAlert;
  }

  /**
   * Get alerts
   */
  async getAlerts(acknowledged?: boolean): Promise<StockAlert[]> {
    let alerts = [...this.alerts];
    if (acknowledged !== undefined) {
      alerts = alerts.filter(a => a.acknowledged === acknowledged);
    }
    return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = new Date();
    }
  }

  /**
   * Get stock movements
   */
  async getMovements(itemId?: string, limit: number = 50): Promise<StockMovement[]> {
    let movements = [...this.movements];
    if (itemId) {
      movements = movements.filter(m => m.itemId === itemId);
    }
    return movements
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get categories summary
   */
  async getCategories(restaurantId: string): Promise<InventoryCategory[]> {
    const items = Array.from(this.items.values());
    const categoryMap = new Map<string, { count: number; value: number }>();

    items.forEach(item => {
      const existing = categoryMap.get(item.category) || { count: 0, value: 0 };
      categoryMap.set(item.category, {
        count: existing.count + 1,
        value: existing.value + (item.currentStock * item.cost),
      });
    });

    return Array.from(categoryMap.entries()).map(([name, data]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      itemCount: data.count,
      totalValue: data.value,
    }));
  }

  /**
   * Get inventory predictions
   */
  async getPredictions(restaurantId: string): Promise<InventoryPrediction[]> {
    const items = Array.from(this.items.values());
    
    // Simple prediction based on average daily usage
    // In production, this would use ML models
    return items.map(item => {
      // Assume average 2kg usage per day for demo
      const avgDailyUsage = 2;
      const daysUntilStockout = item.currentStock / avgDailyUsage;
      const suggestedOrderDate = new Date(Date.now() + (daysUntilStockout - 5) * 24 * 60 * 60 * 1000);

      return {
        itemId: item.id,
        itemName: item.name,
        currentStock: item.currentStock,
        predictedDemand: avgDailyUsage * 14, // 2 weeks
        daysUntilStockout: Math.round(daysUntilStockout),
        suggestedOrderQuantity: Math.max(item.reorderPoint * 2, 30),
        suggestedOrderDate,
        confidence: 75 + Math.random() * 20, // Random confidence for demo
      };
    });
  }

  /**
   * Generate inventory report
   */
  async generateReport(
    restaurantId: string,
    period: { start: Date; end: Date }
  ): Promise<InventoryReport> {
    const items = Array.from(this.items.values());
    const movements = this.movements.filter(
      m => m.timestamp >= period.start && m.timestamp <= period.end
    );

    const topUsedItems = movements
      .filter(m => m.type === 'out')
      .reduce((acc, m) => {
        const existing = acc.find(a => a.name === m.itemName);
        if (existing) {
          existing.quantity += m.quantity;
        } else {
          acc.push({ name: m.itemName, quantity: m.quantity });
        }
        return acc;
      }, [] as Array<{ name: string; quantity: number }>)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return {
      generatedAt: new Date(),
      period,
      summary: {
        totalItems: items.length,
        totalValue: items.reduce((sum, i) => sum + i.currentStock * i.cost, 0),
        lowStockItems: items.filter(i => i.status === 'low_stock').length,
        outOfStockItems: items.filter(i => i.status === 'out_of_stock').length,
        expiringItems: items.filter(i => i.expiryDate && new Date(i.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length,
        movements: movements.length,
      },
      topUsedItems,
      alerts: await this.getAlerts(),
    };
  }

  /**
   * Create purchase order
   */
  async createPurchaseOrder(
    restaurantId: string,
    supplierId: string,
    items: Array<{ itemId: string; quantity: number }>,
    notes?: string
  ): Promise<PurchaseOrder> {
    const orderItems = items.map(item => {
      const inventoryItem = this.items.get(item.itemId);
      if (!inventoryItem) throw new Error(`Item ${item.itemId} not found`);
      return {
        itemId: item.itemId,
        itemName: inventoryItem.name,
        quantity: item.quantity,
        unitCost: inventoryItem.cost,
        totalCost: item.quantity * inventoryItem.cost,
      };
    });

    const order: PurchaseOrder = {
      id: `po-${Date.now()}`,
      supplierId,
      supplierName: 'Supplier Demo',
      items: orderItems,
      totalCost: orderItems.reduce((sum, i) => sum + i.totalCost, 0),
      status: 'draft',
      createdAt: new Date(),
      notes,
    };

    return order;
  }
}

// Export singleton instance
export const inventoryService = new InventoryService();
