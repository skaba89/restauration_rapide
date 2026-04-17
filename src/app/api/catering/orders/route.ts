import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';

// Types
interface CateringOrder {
  id: string;
  orderNumber: string;
  packageId: string | null;
  packageName: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  eventType: string;
  eventName: string | null;
  eventDate: Date;
  eventTime: string;
  endTime: string | null;
  guestCount: number;
  venue: string | null;
  venueAddress: string | null;
  venueNotes: string | null;
  menuCustomizations: string[];
  specialRequests: string | null;
  dietaryNotes: string | null;
  staffRequired: string[];
  equipmentNeeded: string[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  depositAmount: number;
  depositPaid: boolean;
  depositPaidAt: Date | null;
  status: string;
  internalNotes: string | null;
  quotedAt: Date | null;
  confirmedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  createdAt: Date;
}
let ordersStore = [];

// Helper to generate order number
const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const num = String(ordersStore.length + 1).padStart(3, '0');
  return `CAT-${year}-${num}`;
};

// Helper to generate IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// GET - List orders
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const status = searchParams.get('status');
  const eventType = searchParams.get('eventType');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const search = searchParams.get('search');

  // If requesting a single order by ID
  if (id) {
    const order = ordersStore.find(o => o.id === id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Commande non trouvée' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  }

  let orders = [...ordersStore];

  // Apply filters
  if (status && status !== 'all') {
    orders = orders.filter(o => o.status === status);
  }

  if (eventType && eventType !== 'all') {
    orders = orders.filter(o => o.eventType === eventType);
  }

  if (startDate) {
    const start = new Date(startDate);
    orders = orders.filter(o => new Date(o.eventDate) >= start);
  }

  if (endDate) {
    const end = new Date(endDate);
    orders = orders.filter(o => new Date(o.eventDate) <= end);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    orders = orders.filter(o =>
      o.customerName.toLowerCase().includes(searchLower) ||
      o.eventName?.toLowerCase().includes(searchLower) ||
      o.orderNumber.toLowerCase().includes(searchLower) ||
      o.venue?.toLowerCase().includes(searchLower)
    );
  }

  // Sort by date descending
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Calculate stats
  const stats = {
    total: orders.length,
    inquiry: orders.filter(o => o.status === 'inquiry').length,
    quoteSent: orders.filter(o => o.status === 'quote_sent').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    depositPaid: orders.filter(o => o.status === 'deposit_paid').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    upcoming: orders.filter(o =>
      new Date(o.eventDate) >= new Date() &&
      !['completed', 'cancelled'].includes(o.status)
    ).length,
    totalRevenue: orders
      .filter(o => ['deposit_paid', 'confirmed', 'completed'].includes(o.status))
      .reduce((sum, o) => sum + o.finalAmount, 0),
    pendingDeposits: orders
      .filter(o => ['confirmed', 'quote_sent'].includes(o.status) && !o.depositPaid)
      .reduce((sum, o) => sum + o.depositAmount, 0),
    totalGuests: orders.reduce((sum, o) => sum + o.guestCount, 0)
  };

  return NextResponse.json({
    success: true,
    orders,
    stats
  });
});

// POST - Create new order/inquiry
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();

  const newOrder: CateringOrder = {
    id: generateId(),
    orderNumber: generateOrderNumber(),
    packageId: body.packageId || null,
    packageName: body.packageName || null,
    customerName: body.customerName,
    customerEmail: body.customerEmail || null,
    customerPhone: body.customerPhone,
    eventType: body.eventType || 'other',
    eventName: body.eventName || null,
    eventDate: new Date(body.eventDate),
    eventTime: body.eventTime || '12:00',
    endTime: body.endTime || null,
    guestCount: body.guestCount || 0,
    venue: body.venue || null,
    venueAddress: body.venueAddress || null,
    venueNotes: body.venueNotes || null,
    menuCustomizations: body.menuCustomizations || [],
    specialRequests: body.specialRequests || null,
    dietaryNotes: body.dietaryNotes || null,
    staffRequired: body.staffRequired || [],
    equipmentNeeded: body.equipmentNeeded || [],
    totalAmount: body.totalAmount || 0,
    discountAmount: body.discountAmount || 0,
    finalAmount: body.finalAmount || 0,
    depositAmount: body.depositAmount || 0,
    depositPaid: false,
    depositPaidAt: null,
    status: 'inquiry',
    internalNotes: body.internalNotes || null,
    quotedAt: null,
    confirmedAt: null,
    completedAt: null,
    cancelledAt: null,
    cancellationReason: null,
    createdAt: new Date()
  };

  ordersStore.unshift(newOrder);

  return NextResponse.json({
    success: true,
    order: newOrder,
    message: 'Demande de traiteur créée avec succès'
  });
});

// PUT - Update order
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { id, action, ...updates } = body;

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 });
  }

  const index = ordersStore.findIndex(o => o.id === id);
  if (index === -1) {
    return NextResponse.json({ success: false, error: 'Commande non trouvée' }, { status: 404 });
  }

  // Handle date conversion
  if (updates.eventDate) {
    updates.eventDate = new Date(updates.eventDate);
  }

  // Handle status actions
  if (action === 'send_quote') {
    updates.status = 'quote_sent';
    updates.quotedAt = new Date();
  } else if (action === 'confirm') {
    updates.status = 'confirmed';
    updates.confirmedAt = new Date();
  } else if (action === 'pay_deposit') {
    updates.depositPaid = true;
    updates.depositPaidAt = new Date();
    updates.status = 'deposit_paid';
  } else if (action === 'complete') {
    updates.status = 'completed';
    updates.completedAt = new Date();
  } else if (action === 'cancel') {
    updates.status = 'cancelled';
    updates.cancelledAt = new Date();
    updates.cancellationReason = updates.cancellationReason || null;
  }

  ordersStore[index] = {
    ...ordersStore[index],
    ...updates
  };

  return NextResponse.json({
    success: true,
    order: ordersStore[index],
    message: 'Commande mise à jour avec succès'
  });
});

// DELETE - Cancel order
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 });
  }

  const index = ordersStore.findIndex(o => o.id === id);
  if (index === -1) {
    return NextResponse.json({ success: false, error: 'Commande non trouvée' }, { status: 404 });
  }

  // Mark as cancelled instead of deleting
  ordersStore[index] = {
    ...ordersStore[index],
    status: 'cancelled',
    cancelledAt: new Date()
  };

  return NextResponse.json({
    success: true,
    message: 'Commande annulée avec succès'
  });
});