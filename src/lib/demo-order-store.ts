// Shared demo order store - single source of truth for demo orders
// Both kitchen, admin, and public APIs read/write from here so actions are reflected everywhere

export interface DemoOrderItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  notes?: string;
}

export interface DemoOrder {
  id: string;
  orderNumber: string;
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  source: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: string;
  subtotal: number;
  total: number;
  deliveryFee?: number;
  deliveryAddress?: string;
  deliveryCity?: string;
  tableNumber?: string;
  notes?: string;
  priority: 'normal' | 'high' | 'urgent';
  estimatedTime: number;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  items: DemoOrderItem[];
  driverName?: string;
  driverPhone?: string;
}

// Initial demo orders
const INITIAL_ORDERS: DemoOrder[] = [
  {
    id: 'demo-ord-1',
    orderNumber: 'ORD-2024-0145',
    restaurantId: 'demo-rest-1',
    customerName: 'Amadou Diallo',
    customerPhone: '+224 623 21 72 40',
    orderType: 'DINE_IN',
    source: 'pos',
    tableNumber: '5',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    subtotal: 70000,
    total: 70000,
    priority: 'normal',
    estimatedTime: 20,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    items: [
      { id: 'item-1', itemName: 'Thiéboudienne', quantity: 2, unitPrice: 25000, totalPrice: 50000, status: 'pending', notes: 'Sans piment' },
      { id: 'item-2', itemName: 'Jus de Bissap', quantity: 2, unitPrice: 4000, totalPrice: 8000, status: 'pending' },
    ],
  },
  {
    id: 'demo-ord-2',
    orderNumber: 'ORD-2024-0144',
    restaurantId: 'demo-rest-1',
    customerName: 'Fatou Sylla',
    customerPhone: '+224 628 00 00 02',
    orderType: 'TAKEAWAY',
    source: 'app',
    status: 'PREPARING',
    paymentStatus: 'PAID',
    subtotal: 45000,
    total: 45000,
    priority: 'high',
    estimatedTime: 15,
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    notes: 'Client pressé',
    items: [
      { id: 'item-3', itemName: 'Yassa Poulet', quantity: 1, unitPrice: 30000, totalPrice: 30000, status: 'preparing' },
      { id: 'item-4', itemName: 'Attieké Poisson Grillé', quantity: 1, unitPrice: 15000, totalPrice: 15000, status: 'preparing' },
    ],
  },
  {
    id: 'demo-ord-3',
    orderNumber: 'ORD-2024-0143',
    restaurantId: 'demo-rest-1',
    customerName: 'Ibrahima Keita',
    customerPhone: '+224 628 00 00 03',
    orderType: 'DINE_IN',
    source: 'pos',
    tableNumber: '12',
    status: 'PREPARING',
    paymentStatus: 'PAID',
    subtotal: 95000,
    total: 95000,
    priority: 'urgent',
    estimatedTime: 25,
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
    items: [
      { id: 'item-5', itemName: 'Poulet Braisé', quantity: 3, unitPrice: 25000, totalPrice: 75000, status: 'preparing' },
      { id: 'item-6', itemName: 'Alloco Sauce Graine', quantity: 2, unitPrice: 10000, totalPrice: 20000, status: 'preparing' },
    ],
  },
  {
    id: 'demo-ord-4',
    orderNumber: 'ORD-2024-0142',
    restaurantId: 'demo-rest-1',
    customerName: 'Mariama Touré',
    customerPhone: '+224 628 00 00 04',
    orderType: 'DELIVERY',
    source: 'web',
    status: 'READY',
    paymentStatus: 'PAID',
    subtotal: 75000,
    total: 80000,
    deliveryFee: 5000,
    deliveryAddress: 'Nongo, près de la mosquée',
    deliveryCity: 'Conakry',
    priority: 'high',
    estimatedTime: 20,
    createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
    notes: 'Sans oignon',
    items: [
      { id: 'item-7', itemName: 'Mix Grill', quantity: 1, unitPrice: 45000, totalPrice: 45000, status: 'ready' },
      { id: 'item-8', itemName: 'Chawarma Poulet', quantity: 1, unitPrice: 20000, totalPrice: 20000, status: 'ready' },
      { id: 'item-9', itemName: 'Jus de Gingembre', quantity: 2, unitPrice: 5000, totalPrice: 10000, status: 'ready' },
    ],
  },
  {
    id: 'demo-ord-5',
    orderNumber: 'ORD-2024-0141',
    restaurantId: 'demo-rest-1',
    customerName: 'Seydou Bamba',
    customerPhone: '+224 628 00 00 05',
    orderType: 'DINE_IN',
    source: 'pos',
    tableNumber: '8',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    subtotal: 60000,
    total: 60000,
    priority: 'normal',
    estimatedTime: 20,
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    items: [
      { id: 'item-10', itemName: 'Mafé', quantity: 2, unitPrice: 25000, totalPrice: 50000, status: 'pending' },
      { id: 'item-11', itemName: 'Ataya', quantity: 2, unitPrice: 5000, totalPrice: 10000, status: 'pending' },
    ],
  },
  {
    id: 'demo-ord-6',
    orderNumber: 'ORD-2024-0140',
    restaurantId: 'demo-rest-1',
    customerName: 'Aminata Condé',
    customerPhone: '+224 628 00 00 06',
    orderType: 'DELIVERY',
    source: 'app',
    status: 'OUT_FOR_DELIVERY',
    paymentStatus: 'PAID',
    subtotal: 90000,
    total: 95000,
    deliveryFee: 5000,
    deliveryAddress: 'Kaloum, Boulbinet',
    deliveryCity: 'Conakry',
    priority: 'normal',
    estimatedTime: 30,
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
    driverName: 'Moussa Camara',
    driverPhone: '+224 660 00 00 01',
    items: [
      { id: 'item-12', itemName: 'Garba', quantity: 2, unitPrice: 20000, totalPrice: 40000, status: 'ready' },
      { id: 'item-13', itemName: 'Burger KFM', quantity: 2, unitPrice: 25000, totalPrice: 50000, status: 'ready' },
    ],
  },
  {
    id: 'demo-ord-7',
    orderNumber: 'ORD-2024-0139',
    restaurantId: 'demo-rest-1',
    customerName: 'Oumar Bah',
    customerPhone: '+224 628 00 00 07',
    orderType: 'DINE_IN',
    source: 'pos',
    tableNumber: '3',
    status: 'CONFIRMED',
    paymentStatus: 'PENDING',
    subtotal: 30000,
    total: 30000,
    priority: 'normal',
    estimatedTime: 15,
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
    items: [
      { id: 'item-14', itemName: 'Alloco Sauce Graine', quantity: 1, unitPrice: 15000, totalPrice: 15000, status: 'pending' },
      { id: 'item-15', itemName: 'Jus de Baobab', quantity: 3, unitPrice: 5000, totalPrice: 15000, status: 'pending' },
    ],
  },
  {
    id: 'demo-ord-8',
    orderNumber: 'ORD-2024-0138',
    restaurantId: 'demo-rest-1',
    customerName: 'Djenaba Barry',
    customerPhone: '+224 628 00 00 08',
    orderType: 'TAKEAWAY',
    source: 'web',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    subtotal: 50000,
    total: 50000,
    priority: 'normal',
    estimatedTime: 10,
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    completedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    items: [
      { id: 'item-16', itemName: 'Chawarma Viande', quantity: 2, unitPrice: 22000, totalPrice: 44000, status: 'served' },
      { id: 'item-17', itemName: 'Jus de Bissap', quantity: 1, unitPrice: 4000, totalPrice: 4000, status: 'served' },
    ],
  },
];

// In-memory store
let orders: DemoOrder[] = JSON.parse(JSON.stringify(INITIAL_ORDERS));

export function getDemoOrders(): DemoOrder[] {
  return orders;
}

export function getDemoOrderById(id: string): DemoOrder | undefined {
  return orders.find(o => o.id === id);
}

export function getDemoOrdersByStatus(statuses: string[]): DemoOrder[] {
  return orders.filter(o => statuses.includes(o.status));
}

export function updateDemoOrderStatus(id: string, status: DemoOrder['status']): DemoOrder | null {
  const order = orders.find(o => o.id === id);
  if (!order) return null;
  order.status = status;
  order.updatedAt = new Date().toISOString();
  if (status === 'COMPLETED' || status === 'DELIVERED') {
    order.completedAt = new Date().toISOString();
  }
  if (status === 'CANCELLED') {
    order.cancelledAt = new Date().toISOString();
  }
  // Update item statuses to match order
  const itemStatusMap: Record<string, string> = {
    PENDING: 'pending', CONFIRMED: 'pending', PREPARING: 'preparing',
    READY: 'ready', COMPLETED: 'served', DELIVERED: 'served', CANCELLED: 'cancelled',
  };
  const newItemStatus = itemStatusMap[status] || 'pending';
  order.items.forEach(item => { item.status = newItemStatus; });
  return order;
}

export function assignDriverToOrder(id: string, driverName: string, driverPhone: string): DemoOrder | null {
  const order = orders.find(o => o.id === id);
  if (!order) return null;
  order.driverName = driverName;
  order.driverPhone = driverPhone;
  order.status = 'OUT_FOR_DELIVERY';
  order.updatedAt = new Date().toISOString();
  return order;
}

export function removeDemoOrder(id: string): boolean {
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return false;
  orders.splice(idx, 1);
  return true;
}

export function addDemoOrder(order: Omit<DemoOrder, 'id' | 'createdAt' | 'updatedAt'>): DemoOrder {
  const newOrder: DemoOrder = {
    ...order,
    id: `demo-ord-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.unshift(newOrder);
  return newOrder;
}
