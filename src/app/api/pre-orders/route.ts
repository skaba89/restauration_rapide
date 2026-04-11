import { NextRequest, NextResponse } from 'next/server';

// Types
interface PreOrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface PreOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  scheduledDate: string;
  scheduledTime: string;
  items: PreOrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  recurringEndDate?: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes?: string;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  deliveryAddress?: string;
  createdAt: string;
  updatedAt: string;
}

// Demo pre-orders data
const DEMO_PRE_ORDERS: PreOrder[] = [
  {
    id: 'PO-001',
    customerName: 'Koné Ibrahim',
    customerPhone: '+224 62 345 67 89',
    customerEmail: 'ibrahim.kone@email.com',
    scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scheduledTime: '12:00',
    items: [
      { id: '1', name: 'Attieké Poisson Grillé', quantity: 2, price: 15000 },
      { id: '2', name: 'Jus de Bissap', quantity: 2, price: 5000 }
    ],
    status: 'pending',
    isRecurring: false,
    totalAmount: 40000,
    paymentStatus: 'pending',
    orderType: 'takeaway',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PO-002',
    customerName: 'Diallo Fatou',
    customerPhone: '+224 62 234 56 78',
    customerEmail: 'fatou.diallo@email.com',
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scheduledTime: '19:30',
    items: [
      { id: '1', name: 'Kedjenou de Poulet', quantity: 1, price: 12000 },
      { id: '2', name: 'Riz Gras', quantity: 1, price: 8000 }
    ],
    status: 'confirmed',
    isRecurring: false,
    totalAmount: 20000,
    paymentStatus: 'paid',
    orderType: 'delivery',
    deliveryAddress: 'Quartier Kaloum, Rue 23',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PO-003',
    customerName: 'Touré Amadou',
    customerPhone: '+224 62 123 45 67',
    scheduledDate: new Date(Date.now() + 0 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scheduledTime: '12:30',
    items: [
      { id: '1', name: 'Thiéboudienne', quantity: 2, price: 16000 }
    ],
    status: 'preparing',
    isRecurring: true,
    recurringPattern: 'weekly',
    recurringEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalAmount: 32000,
    paymentStatus: 'paid',
    orderType: 'dine_in',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PO-004',
    customerName: 'Sy Savane',
    customerPhone: '+224 66 111 22 33',
    customerEmail: 'savane.sy@email.com',
    scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scheduledTime: '13:00',
    items: [
      { id: '1', name: 'Poulet Braisé', quantity: 3, price: 18000 },
      { id: '2', name: 'Alloco', quantity: 3, price: 3000 },
      { id: '3', name: 'Jus de Gingembre', quantity: 3, price: 5000 }
    ],
    status: 'pending',
    isRecurring: false,
    totalAmount: 78000,
    paymentStatus: 'pending',
    orderType: 'takeaway',
    notes: 'Poulet bien cuit, sauce piment à côté',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PO-005',
    customerName: 'Bamba Seydou',
    customerPhone: '+224 64 444 55 66',
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scheduledTime: '20:00',
    items: [
      { id: '1', name: 'Garba', quantity: 5, price: 7000 }
    ],
    status: 'confirmed',
    isRecurring: true,
    recurringPattern: 'monthly',
    recurringEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalAmount: 35000,
    paymentStatus: 'paid',
    orderType: 'takeaway',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PO-006',
    customerName: 'Kouyaté Aïssata',
    customerPhone: '+224 62 777 88 99',
    customerEmail: 'aissata.kouyate@email.com',
    scheduledDate: new Date(Date.now() + 0 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scheduledTime: '12:00',
    items: [
      { id: '1', name: 'Foutou Banane', quantity: 2, price: 10000 },
      { id: '2', name: 'Sauce Arachide', quantity: 2, price: 8000 }
    ],
    status: 'ready',
    isRecurring: false,
    totalAmount: 36000,
    paymentStatus: 'paid',
    orderType: 'takeaway',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PO-007',
    customerName: 'Camara Moussa',
    customerPhone: '+224 66 222 33 44',
    scheduledDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scheduledTime: '12:30',
    items: [
      { id: '1', name: 'Mafe', quantity: 4, price: 12000 },
      { id: '2', name: 'Riz Blanc', quantity: 4, price: 5000 }
    ],
    status: 'pending',
    isRecurring: true,
    recurringPattern: 'daily',
    recurringEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalAmount: 68000,
    paymentStatus: 'pending',
    orderType: 'delivery',
    deliveryAddress: 'Quartier Dixinn, Avenue de la République',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PO-008',
    customerName: 'Doubaye Mariam',
    customerPhone: '+224 62 555 66 77',
    customerEmail: 'mariam.doubaye@email.com',
    scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scheduledTime: '19:00',
    items: [
      { id: '1', name: 'Poulet DG', quantity: 2, price: 22000 },
      { id: '2', name: 'Plantain Frit', quantity: 2, price: 4000 }
    ],
    status: 'confirmed',
    isRecurring: false,
    totalAmount: 52000,
    paymentStatus: 'paid',
    orderType: 'dine_in',
    notes: 'Table près de la fenêtre, anniversaire',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PO-009',
    customerName: 'Traoré Youssouf',
    customerPhone: '+224 64 888 99 00',
    scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scheduledTime: '13:00',
    items: [
      { id: '1', name: 'Attieké Poisson', quantity: 1, price: 15000 }
    ],
    status: 'completed',
    isRecurring: false,
    totalAmount: 15000,
    paymentStatus: 'paid',
    orderType: 'takeaway',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'PO-010',
    customerName: 'Condé Alpha',
    customerPhone: '+224 66 333 44 55',
    customerEmail: 'alpha.conde@email.com',
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scheduledTime: '12:00',
    items: [
      { id: '1', name: 'Yassa Poisson', quantity: 3, price: 14000 },
      { id: '2', name: 'Jus de Bissap', quantity: 3, price: 5000 }
    ],
    status: 'pending',
    isRecurring: true,
    recurringPattern: 'weekly',
    recurringEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalAmount: 57000,
    paymentStatus: 'pending',
    orderType: 'delivery',
    deliveryAddress: 'Quartier Matam, Rue 45',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PO-011',
    customerName: 'Keita Fatoumata',
    customerPhone: '+224 62 111 22 33',
    scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scheduledTime: '20:00',
    items: [
      { id: '1', name: 'Kedjenou', quantity: 2, price: 12000 }
    ],
    status: 'cancelled',
    isRecurring: false,
    totalAmount: 24000,
    paymentStatus: 'refunded',
    orderType: 'delivery',
    notes: 'Client absent - annulé',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'PO-012',
    customerName: 'Diane Sory',
    customerPhone: '+224 64 666 77 88',
    customerEmail: 'sory.diane@email.com',
    scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scheduledTime: '13:30',
    items: [
      { id: '1', name: 'Riz Gras', quantity: 5, price: 8000 },
      { id: '2', name: 'Brochettes', quantity: 10, price: 2500 }
    ],
    status: 'pending',
    isRecurring: false,
    totalAmount: 65000,
    paymentStatus: 'pending',
    orderType: 'takeaway',
    notes: 'Équipe de travail - 5 personnes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// In-memory store for demo mode (simulates database)
let preOrdersStore = [...DEMO_PRE_ORDERS];

// GET - List pre-orders with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const demo = searchParams.get('demo') === 'true';
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const search = searchParams.get('search');
    const customerId = searchParams.get('customerId');

    // Use demo data or filter by organization/restaurant
    let preOrders = demo ? [...preOrdersStore] : [...preOrdersStore];

    // Apply filters
    if (status && status !== 'all') {
      preOrders = preOrders.filter(po => po.status === status);
    }

    if (date) {
      preOrders = preOrders.filter(po => po.scheduledDate === date);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      preOrders = preOrders.filter(po => 
        po.customerName.toLowerCase().includes(searchLower) ||
        po.customerPhone.includes(search) ||
        po.id.toLowerCase().includes(searchLower)
      );
    }

    // Sort by scheduled date and time
    preOrders.sort((a, b) => {
      const dateCompare = a.scheduledDate.localeCompare(b.scheduledDate);
      if (dateCompare !== 0) return dateCompare;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });

    // Calculate stats
    const stats = {
      total: preOrders.length,
      pending: preOrders.filter(po => po.status === 'pending').length,
      confirmed: preOrders.filter(po => po.status === 'confirmed').length,
      preparing: preOrders.filter(po => po.status === 'preparing').length,
      ready: preOrders.filter(po => po.status === 'ready').length,
      completed: preOrders.filter(po => po.status === 'completed').length,
      cancelled: preOrders.filter(po => po.status === 'cancelled').length,
      recurring: preOrders.filter(po => po.isRecurring).length,
      totalValue: preOrders.reduce((sum, po) => sum + po.totalAmount, 0),
      paidValue: preOrders.filter(po => po.paymentStatus === 'paid').reduce((sum, po) => sum + po.totalAmount, 0),
    };

    return NextResponse.json({
      success: true,
      preOrders,
      stats,
      total: preOrders.length
    });
  } catch (error) {
    console.error('Error fetching pre-orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pre-orders' },
      { status: 500 }
    );
  }
}

// POST - Create pre-order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      scheduledDate,
      scheduledTime,
      items,
      isRecurring = false,
      recurringPattern,
      recurringEndDate,
      notes,
      orderType,
      deliveryAddress
    } = body;

    // Validation
    if (!customerName || !customerPhone || !scheduledDate || !scheduledTime || !items?.length) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate scheduled date is in the future
    const scheduled = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduled < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Scheduled date must be in the future' },
        { status: 400 }
      );
    }

    // Calculate total
    const totalAmount = items.reduce((sum: number, item: PreOrderItem) => 
      sum + (item.price * item.quantity), 0
    );

    // Generate ID
    const id = `PO-${String(preOrdersStore.length + 1).padStart(3, '0')}`;

    const newPreOrder: PreOrder = {
      id,
      customerName,
      customerPhone,
      customerEmail,
      scheduledDate,
      scheduledTime,
      items: items.map((item: PreOrderItem, index: number) => ({
        ...item,
        id: item.id || String(index + 1)
      })),
      status: 'pending',
      isRecurring,
      recurringPattern: isRecurring ? recurringPattern : undefined,
      recurringEndDate: isRecurring ? recurringEndDate : undefined,
      totalAmount,
      paymentStatus: 'pending',
      notes,
      orderType: orderType || 'takeaway',
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    preOrdersStore.push(newPreOrder);

    return NextResponse.json({
      success: true,
      preOrder: newPreOrder,
      message: 'Pré-commande créée avec succès'
    });
  } catch (error) {
    console.error('Error creating pre-order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create pre-order' },
      { status: 500 }
    );
  }
}

// PUT - Update pre-order status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, paymentStatus, notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Pre-order ID is required' },
        { status: 400 }
      );
    }

    const index = preOrdersStore.findIndex(po => po.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Pre-order not found' },
        { status: 404 }
      );
    }

    // Update the pre-order
    preOrdersStore[index] = {
      ...preOrdersStore[index],
      status: status || preOrdersStore[index].status,
      paymentStatus: paymentStatus || preOrdersStore[index].paymentStatus,
      notes: notes !== undefined ? notes : preOrdersStore[index].notes,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      preOrder: preOrdersStore[index],
      message: 'Pré-commande mise à jour avec succès'
    });
  } catch (error) {
    console.error('Error updating pre-order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update pre-order' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel pre-order
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Pre-order ID is required' },
        { status: 400 }
      );
    }

    const index = preOrdersStore.findIndex(po => po.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Pre-order not found' },
        { status: 404 }
      );
    }

    // Instead of deleting, mark as cancelled
    preOrdersStore[index] = {
      ...preOrdersStore[index],
      status: 'cancelled',
      paymentStatus: preOrdersStore[index].paymentStatus === 'paid' ? 'refunded' : preOrdersStore[index].paymentStatus,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Pré-commande annulée avec succès'
    });
  } catch (error) {
    console.error('Error cancelling pre-order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel pre-order' },
      { status: 500 }
    );
  }
}
