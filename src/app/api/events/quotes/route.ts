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

// Demo quotes
const DEMO_QUOTES: Quote[] = [
  {
    id: 'q1',
    eventId: '4',
    quoteNumber: 'DEV-2024-001',
    customerName: 'Aminata Bamba',
    customerPhone: '+224 65 44 55 66',
    customerEmail: 'aminata.bamba@email.com',
    eventName: 'Anniversaire Aminata - 30 ans',
    eventType: 'birthday',
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    startTime: '18:00',
    endTime: '23:00',
    location: 'En salle - KFM DELICE VIP',
    guestCount: 40,
    items: [
      { id: 'i1', category: 'menu', name: 'Kedjenou de Poulet', quantity: 40, unitPrice: 35000, totalPrice: 1400000 },
      { id: 'i2', category: 'menu', name: 'Foutou Banane', quantity: 40, unitPrice: 25000, totalPrice: 1000000 },
      { id: 'i3', category: 'menu', name: 'Cocktails maison', quantity: 80, unitPrice: 10000, totalPrice: 800000 },
      { id: 'i4', category: 'equipment', name: 'Décoration anniversaire', quantity: 1, unitPrice: 300000, totalPrice: 300000 },
      { id: 'i5', category: 'staff', name: 'Chef + 2 Serveurs', quantity: 1, unitPrice: 200000, totalPrice: 200000 },
    ],
    subtotal: 3700000,
    discount: 1200000,
    totalAmount: 2500000,
    depositAmount: 800000,
    depositPercentage: 30,
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'sent',
    notes: 'Menu choisi par la cliente. Décoration thème blanc et rose.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'q2',
    eventId: '6',
    quoteNumber: 'DEV-2024-002',
    customerName: 'Société Minière de Guinée (SMG)',
    customerPhone: '+224 62 00 11 22',
    customerEmail: 'events@smg-guinea.com',
    eventName: 'Séminaire Annuel SMG',
    eventType: 'corporate',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    startTime: '08:00',
    endTime: '17:00',
    location: 'Hôtel Palm Camayenne, Conakry',
    guestCount: 100,
    items: [
      { id: 'i1', category: 'menu', name: 'Petit Déjeuner Continental', quantity: 100, unitPrice: 25000, totalPrice: 2500000 },
      { id: 'i2', category: 'menu', name: 'Déjeuner Buffet', quantity: 100, unitPrice: 65000, totalPrice: 6500000 },
      { id: 'i3', category: 'menu', name: 'Pause Café & Pâtisseries', quantity: 200, unitPrice: 10000, totalPrice: 2000000 },
      { id: 'i4', category: 'equipment', name: 'Projecteur & Écran (x2)', quantity: 2, unitPrice: 150000, totalPrice: 300000 },
      { id: 'i5', category: 'equipment', name: 'Micro & Sono', quantity: 1, unitPrice: 300000, totalPrice: 300000 },
      { id: 'i6', category: 'staff', name: 'Équipe service complet', quantity: 1, unitPrice: 500000, totalPrice: 500000 },
    ],
    subtotal: 12100000,
    discount: 3600000,
    totalAmount: 8500000,
    depositAmount: 3000000,
    depositPercentage: 35,
    validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    status: 'sent',
    notes: 'Devis envoyé au service RH. Attente validation budget.',
    internalNotes: 'Client corporate - possibilité de contrat annuel',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'q3',
    eventId: '9',
    quoteNumber: 'DEV-2024-003',
    customerName: 'Famille Doumbouya',
    customerPhone: '+224 64 56 78 90',
    eventName: 'Baptême Jumelles Doumbouya',
    eventType: 'baptism',
    date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    startTime: '12:00',
    endTime: '17:00',
    location: 'Domicile - Dixinn',
    guestCount: 50,
    items: [
      { id: 'i1', category: 'menu', name: 'Maffé Poulet', quantity: 50, unitPrice: 40000, totalPrice: 2000000 },
      { id: 'i2', category: 'menu', name: 'Thiéboudienne', quantity: 50, unitPrice: 35000, totalPrice: 1750000 },
      { id: 'i3', category: 'menu', name: 'Gâteaux Jumelles (x2)', quantity: 2, unitPrice: 250000, totalPrice: 500000 },
      { id: 'i4', category: 'equipment', name: 'Tente 10x10m', quantity: 1, unitPrice: 800000, totalPrice: 800000 },
      { id: 'i5', category: 'equipment', name: 'Tables et chaises (50)', quantity: 50, unitPrice: 5000, totalPrice: 250000 },
    ],
    subtotal: 5300000,
    discount: 1500000,
    totalAmount: 3800000,
    depositAmount: 1200000,
    depositPercentage: 30,
    validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    status: 'sent',
    notes: 'Jumelles: Amina & Adama. Thème rose et blanc.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

// In-memory store
let quotesStore = [...DEMO_QUOTES];

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
