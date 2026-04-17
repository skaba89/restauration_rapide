import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';

// Types
interface EventMenuItem {
  id: string;
  menuItemId?: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
}

interface EventEquipment {
  id: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
}

interface Event {
  id: string;
  eventType: 'wedding' | 'birthday' | 'corporate' | 'baptism' | 'other';
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  eventName?: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  guestCount: number;
  menu: EventMenuItem[];
  equipment: EventEquipment[];
  staffRequired: string[];
  status: 'inquiry' | 'quote_sent' | 'confirmed' | 'deposit_paid' | 'completed' | 'cancelled';
  totalAmount: number;
  depositAmount: number;
  depositPaid: boolean;
  notes?: string;
  createdAt: Date;
}
let eventsStore = [];

// Helper to generate IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// GET - List events with filters
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const eventType = searchParams.get('eventType');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const search = searchParams.get('search');
  const id = searchParams.get('id');

  // If requesting a single event by ID
  if (id) {
    const event = eventsStore.find(e => e.id === id);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Événement non trouvé' }, { status: 404 });
    }
    return NextResponse.json({ success: true, event });
  }

  let events = [...eventsStore];

  // Apply filters
  if (status && status !== 'all') {
    events = events.filter(e => e.status === status);
  }

  if (eventType && eventType !== 'all') {
    events = events.filter(e => e.eventType === eventType);
  }

  if (startDate) {
    const start = new Date(startDate);
    events = events.filter(e => new Date(e.date) >= start);
  }

  if (endDate) {
    const end = new Date(endDate);
    events = events.filter(e => new Date(e.date) <= end);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    events = events.filter(e => 
      e.customerName.toLowerCase().includes(searchLower) ||
      e.eventName?.toLowerCase().includes(searchLower) ||
      e.location.toLowerCase().includes(searchLower)
    );
  }

  // Sort by date ascending
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate stats
  const stats = {
    total: events.length,
    inquiry: events.filter(e => e.status === 'inquiry').length,
    quoteSent: events.filter(e => e.status === 'quote_sent').length,
    confirmed: events.filter(e => e.status === 'confirmed').length,
    depositPaid: events.filter(e => e.status === 'deposit_paid').length,
    completed: events.filter(e => e.status === 'completed').length,
    cancelled: events.filter(e => e.status === 'cancelled').length,
    upcoming: events.filter(e => 
      new Date(e.date) >= new Date() && 
      !['completed', 'cancelled'].includes(e.status)
    ).length,
    totalRevenue: events
      .filter(e => ['confirmed', 'deposit_paid', 'completed'].includes(e.status))
      .reduce((sum, e) => sum + e.totalAmount, 0),
    pendingDeposits: events
      .filter(e => (e.status === 'confirmed' || e.status === 'quote_sent') && !e.depositPaid)
      .reduce((sum, e) => sum + e.depositAmount, 0),
  };

  return NextResponse.json({
    success: true,
    events,
    stats,
  });
});

// POST - Create event inquiry
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  
  const newEvent: Event = {
    id: generateId(),
    eventType: body.eventType || 'other',
    customerName: body.customerName,
    customerPhone: body.customerPhone,
    customerEmail: body.customerEmail,
    eventName: body.eventName,
    date: new Date(body.date),
    startTime: body.startTime || '12:00',
    endTime: body.endTime || '18:00',
    location: body.location || 'À déterminer',
    guestCount: body.guestCount || 0,
    menu: body.menu || [],
    equipment: body.equipment || [],
    staffRequired: body.staffRequired || [],
    status: 'inquiry',
    totalAmount: body.totalAmount || 0,
    depositAmount: body.depositAmount || 0,
    depositPaid: false,
    notes: body.notes,
    createdAt: new Date(),
  };

  eventsStore.unshift(newEvent);

  return NextResponse.json({
    success: true,
    event: newEvent,
    message: 'Demande d\'événement créée avec succès',
  });
});

// PUT - Update event
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 });
  }

  const index = eventsStore.findIndex(e => e.id === id);
  if (index === -1) {
    return NextResponse.json({ success: false, error: 'Événement non trouvé' }, { status: 404 });
  }

  // Handle date conversion
  if (updates.date) {
    updates.date = new Date(updates.date);
  }

  eventsStore[index] = {
    ...eventsStore[index],
    ...updates,
  };

  return NextResponse.json({
    success: true,
    event: eventsStore[index],
    message: 'Événement mis à jour avec succès',
  });
});

// DELETE - Cancel event
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 });
  }

  const index = eventsStore.findIndex(e => e.id === id);
  if (index === -1) {
    return NextResponse.json({ success: false, error: 'Événement non trouvé' }, { status: 404 });
  }

  // Instead of deleting, mark as cancelled
  eventsStore[index] = {
    ...eventsStore[index],
    status: 'cancelled',
  };

  return NextResponse.json({
    success: true,
    message: 'Événement annulé avec succès',
  });
});