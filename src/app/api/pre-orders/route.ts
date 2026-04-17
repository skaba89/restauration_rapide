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
let preOrdersStore = [];

// GET - List pre-orders with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const search = searchParams.get('search');
    const customerId = searchParams.get('customerId');
    let preOrdersStore: any[] = [];

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