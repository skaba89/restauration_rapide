import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';

// Types
interface QuoteItem {
  id: string;
  category: 'menu' | 'equipment' | 'staff' | 'service';
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Quote {
  id: string;
  eventId?: string;
  quoteNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  eventName?: string;
  eventType: 'wedding' | 'birthday' | 'corporate' | 'baptism' | 'other';
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  guestCount: number;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  depositAmount: number;
  depositPercentage: number;
  validUntil: Date;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  notes?: string;
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory store
let quotesStore = [];

// Helper to generate quote number
const generateQuoteNumber = () => {
  const year = new Date().getFullYear();
  const count = quotesStore.length + 1;
  return `DEV-${year}-${count.toString().padStart(3, '0')}`;
};

// Helper to generate IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// GET - Get quotes
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const status = searchParams.get('status');
  const eventId = searchParams.get('eventId');

  // Single quote by ID
  if (id) {
    const quote = quotesStore.find(q => q.id === id);
    if (!quote) {
      return NextResponse.json({ success: false, error: 'Devis non trouvé' }, { status: 404 });
    }
    return NextResponse.json({ success: true, quote });
  }

  // Quote by event ID
  if (eventId) {
    const quote = quotesStore.find(q => q.eventId === eventId);
    return NextResponse.json({ success: true, quote: quote || null });
  }

  let quotes = [...quotesStore];

  // Filter by status
  if (status && status !== 'all') {
    quotes = quotes.filter(q => q.status === status);
  }

  // Sort by date descending
  quotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Stats
  const stats = {
    total: quotes.length,
    draft: quotes.filter(q => q.status === 'draft').length,
    sent: quotes.filter(q => q.status === 'sent').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    rejected: quotes.filter(q => q.status === 'rejected').length,
    totalValue: quotes.reduce((sum, q) => sum + q.totalAmount, 0),
    pendingValue: quotes
      .filter(q => q.status === 'sent')
      .reduce((sum, q) => sum + q.totalAmount, 0),
  };

  return NextResponse.json({
    success: true,
    quotes,
    stats,
  });
});

// POST - Create quote
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();

  // Calculate totals
  const subtotal = (body.items || []).reduce((sum: number, item: QuoteItem) => sum + item.totalPrice, 0);
  const discount = body.discount || 0;
  const totalAmount = subtotal - discount;
  const depositPercentage = body.depositPercentage || 30;
  const depositAmount = Math.round(totalAmount * (depositPercentage / 100));

  const newQuote: Quote = {
    id: generateId(),
    eventId: body.eventId,
    quoteNumber: generateQuoteNumber(),
    customerName: body.customerName,
    customerPhone: body.customerPhone,
    customerEmail: body.customerEmail,
    eventName: body.eventName,
    eventType: body.eventType || 'other',
    date: new Date(body.date),
    startTime: body.startTime || '12:00',
    endTime: body.endTime || '18:00',
    location: body.location || 'À déterminer',
    guestCount: body.guestCount || 0,
    items: body.items || [],
    subtotal,
    discount,
    totalAmount,
    depositAmount,
    depositPercentage,
    validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days validity
    status: 'draft',
    notes: body.notes,
    internalNotes: body.internalNotes,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  quotesStore.unshift(newQuote);

  return NextResponse.json({
    success: true,
    quote: newQuote,
    message: 'Devis créé avec succès',
  });
});

// PUT - Update/approve quote
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { id, action, ...updates } = body;

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 });
  }

  const index = quotesStore.findIndex(q => q.id === id);
  if (index === -1) {
    return NextResponse.json({ success: false, error: 'Devis non trouvé' }, { status: 404 });
  }

  const quote = quotesStore[index];

  // Handle actions
  if (action === 'send') {
    // Send quote (change status to sent)
    quotesStore[index] = {
      ...quote,
      status: 'sent',
      updatedAt: new Date(),
    };
  } else if (action === 'accept') {
    // Accept quote - create confirmed event
    quotesStore[index] = {
      ...quote,
      status: 'accepted',
      updatedAt: new Date(),
    };

    // Return event data for creation
    return NextResponse.json({
      success: true,
      quote: quotesStore[index],
      message: 'Devis accepté',
      createEvent: {
        eventType: quote.eventType,
        customerName: quote.customerName,
        customerPhone: quote.customerPhone,
        customerEmail: quote.customerEmail,
        eventName: quote.eventName,
        date: quote.date,
        startTime: quote.startTime,
        endTime: quote.endTime,
        location: quote.location,
        guestCount: quote.guestCount,
        menu: quote.items.filter(i => i.category === 'menu').map(i => ({
          id: generateId(),
          name: i.name,
          quantity: i.quantity,
          pricePerUnit: i.unitPrice,
        })),
        equipment: quote.items.filter(i => i.category === 'equipment').map(i => ({
          id: generateId(),
          name: i.name,
          quantity: i.quantity,
          pricePerUnit: i.unitPrice,
        })),
        staffRequired: quote.items.filter(i => i.category === 'staff').map(i => i.name),
        status: 'confirmed',
        totalAmount: quote.totalAmount,
        depositAmount: quote.depositAmount,
        depositPaid: false,
        notes: quote.notes,
      },
    });
  } else if (action === 'reject') {
    quotesStore[index] = {
      ...quote,
      status: 'rejected',
      updatedAt: new Date(),
    };
  } else {
    // Regular update
    if (updates.date) {
      updates.date = new Date(updates.date);
    }

    // Recalculate totals if items changed
    if (updates.items) {
      const subtotal = updates.items.reduce((sum: number, item: QuoteItem) => sum + item.totalPrice, 0);
      const discount = updates.discount || quote.discount;
      updates.subtotal = subtotal;
      updates.totalAmount = subtotal - discount;
      updates.depositAmount = Math.round(updates.totalAmount * ((updates.depositPercentage || quote.depositPercentage) / 100));
    }

    quotesStore[index] = {
      ...quote,
      ...updates,
      updatedAt: new Date(),
    };
  }

  return NextResponse.json({
    success: true,
    quote: quotesStore[index],
    message: 'Devis mis à jour avec succès',
  });
});

// DELETE - Delete quote
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 });
  }

  const index = quotesStore.findIndex(q => q.id === id);
  if (index === -1) {
    return NextResponse.json({ success: false, error: 'Devis non trouvé' }, { status: 404 });
  }

  // Only allow deleting draft quotes
  if (quotesStore[index].status !== 'draft') {
    return NextResponse.json({
      success: false,
      error: 'Seuls les devis en brouillon peuvent être supprimés',
    }, { status: 400 });
  }

  quotesStore.splice(index, 1);

  return NextResponse.json({
    success: true,
    message: 'Devis supprimé avec succès',
  });
});