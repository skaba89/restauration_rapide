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

// Demo Events Data (10 events as requested)
const DEMO_EVENTS: Event[] = [
  // 2 Mariages (confirmed)
  {
    id: '1',
    eventType: 'wedding',
    customerName: 'Amadou & Aïssata Koné',
    customerPhone: '+224 62 12 34 56',
    customerEmail: 'amadou.kone@email.com',
    eventName: 'Mariage Koné - Diallo',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    startTime: '14:00',
    endTime: '23:00',
    location: 'Salle des fêtes Kaloum, Conakry',
    guestCount: 150,
    menu: [
      { id: 'm1', name: 'Riz Gras au Poulet', quantity: 150, pricePerUnit: 45000 },
      { id: 'm2', name: 'Attieké Poisson Grillé', quantity: 150, pricePerUnit: 55000 },
      { id: 'm3', name: 'Sauce Arachide', quantity: 150, pricePerUnit: 35000 },
      { id: 'm4', name: 'Jus de Bissap', quantity: 300, pricePerUnit: 5000 },
    ],
    equipment: [
      { id: 'e1', name: 'Tables rondes (10 places)', quantity: 15, pricePerUnit: 25000 },
      { id: 'e2', name: 'Chaises décorées', quantity: 150, pricePerUnit: 5000 },
      { id: 'e3', name: 'Tente 20x30m', quantity: 1, pricePerUnit: 2500000 },
    ],
    staffRequired: ['Chef principal', '5 Serveurs', '2 Cuisiniers', 'Décorateur'],
    status: 'confirmed',
    totalAmount: 15500000,
    depositAmount: 5000000,
    depositPaid: true,
    notes: 'Thème blanc et or. Musique live prévue.',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    eventType: 'wedding',
    customerName: 'Ibrahim & Fatou Sylla',
    customerPhone: '+224 64 98 76 54',
    customerEmail: 'ibrahim.sylla@email.com',
    eventName: 'Mariage Sylla - Touré',
    date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    startTime: '16:00',
    endTime: '00:00',
    location: 'Jardin du Palais, Dixinn',
    guestCount: 200,
    menu: [
      { id: 'm1', name: 'Maffé de Bœuf', quantity: 200, pricePerUnit: 50000 },
      { id: 'm2', name: 'Thiéboudienne', quantity: 200, pricePerUnit: 45000 },
      { id: 'm3', name: 'Salade Marocaine', quantity: 200, pricePerUnit: 15000 },
      { id: 'm4', name: 'Gâteau Mariage', quantity: 1, pricePerUnit: 1500000 },
    ],
    equipment: [
      { id: 'e1', name: 'Tables rectangulaires', quantity: 25, pricePerUnit: 20000 },
      { id: 'e2', name: 'Chaises premium', quantity: 200, pricePerUnit: 7500 },
      { id: 'e3', name: 'Décoration florale', quantity: 1, pricePerUnit: 3000000 },
    ],
    staffRequired: ['Chef principal', '8 Serveurs', '4 Cuisiniers', '2 Décorateurs', 'DJ'],
    status: 'deposit_paid',
    totalAmount: 22000000,
    depositAmount: 8000000,
    depositPaid: true,
    notes: 'Cérémonie traditionnelle le matin. Soirée cocktail.',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  },
  // 3 Anniversaires (upcoming)
  {
    id: '3',
    eventType: 'birthday',
    customerName: 'Mamadou Diallo',
    customerPhone: '+224 62 11 22 33',
    customerEmail: 'mamadou.diallo@email.com',
    eventName: '50ème Anniversaire de Mamadou',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    startTime: '19:00',
    endTime: '02:00',
    location: 'Villa Familiale, Ratoma',
    guestCount: 80,
    menu: [
      { id: 'm1', name: 'Brochettes de Poulet', quantity: 160, pricePerUnit: 15000 },
      { id: 'm2', name: 'Alloco Sauce Graine', quantity: 80, pricePerUnit: 20000 },
      { id: 'm3', name: 'Gâteau Anniversaire', quantity: 1, pricePerUnit: 450000 },
    ],
    equipment: [
      { id: 'e1', name: 'Tables cocktail', quantity: 10, pricePerUnit: 15000 },
      { id: 'e2', name: 'Sono/Lumière', quantity: 1, pricePerUnit: 500000 },
    ],
    staffRequired: ['Chef', '3 Serveurs', 'Barman'],
    status: 'confirmed',
    totalAmount: 4500000,
    depositAmount: 1500000,
    depositPaid: true,
    notes: 'Surprise party - coordonner avec la famille.',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    eventType: 'birthday',
    customerName: 'Aminata Bamba',
    customerPhone: '+224 65 44 55 66',
    customerEmail: 'aminata.bamba@email.com',
    eventName: 'Anniversaire Aminata - 30 ans',
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    startTime: '18:00',
    endTime: '23:00',
    location: 'En salle - KFM DELICE VIP',
    guestCount: 40,
    menu: [
      { id: 'm1', name: 'Kedjenou de Poulet', quantity: 40, pricePerUnit: 35000 },
      { id: 'm2', name: 'Foutou Banane', quantity: 40, pricePerUnit: 25000 },
      { id: 'm3', name: 'Cocktails maison', quantity: 80, pricePerUnit: 10000 },
    ],
    equipment: [
      { id: 'e1', name: 'Décoration anniversaire', quantity: 1, pricePerUnit: 300000 },
    ],
    staffRequired: ['Chef', '2 Serveurs'],
    status: 'quote_sent',
    totalAmount: 2500000,
    depositAmount: 800000,
    depositPaid: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    eventType: 'birthday',
    customerName: 'Souleymane Keita',
    customerPhone: '+224 67 77 88 99',
    eventName: 'Anniversaire Petit Souley - 10 ans',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    startTime: '15:00',
    endTime: '19:00',
    location: 'Jardin familial, Matoto',
    guestCount: 30,
    menu: [
      { id: 'm1', name: 'Menu Enfants (Burger + Jus + Gâteau)', quantity: 30, pricePerUnit: 25000 },
      { id: 'm2', name: 'Gâteau Thème Super-héros', quantity: 1, pricePerUnit: 350000 },
      { id: 'm3', name: 'Popcorn & Barbe à papa', quantity: 1, pricePerUnit: 150000 },
    ],
    equipment: [
      { id: 'e1', name: 'Structure gonflable', quantity: 1, pricePerUnit: 300000 },
      { id: 'e2', name: 'Animateur enfants', quantity: 1, pricePerUnit: 200000 },
    ],
    staffRequired: ['Chef', '2 Serveurs', 'Animateur'],
    status: 'confirmed',
    totalAmount: 1800000,
    depositAmount: 600000,
    depositPaid: true,
    notes: 'Thème Spiderman. 20 enfants + 10 adultes.',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  // 2 Événements entreprise
  {
    id: '6',
    eventType: 'corporate',
    customerName: 'Société Minière de Guinée (SMG)',
    customerPhone: '+224 62 00 11 22',
    customerEmail: 'events@smg-guinea.com',
    eventName: 'Séminaire Annuel SMG',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    startTime: '08:00',
    endTime: '17:00',
    location: 'Hôtel Palm Camayenne, Conakry',
    guestCount: 100,
    menu: [
      { id: 'm1', name: 'Petit Déjeuner Continental', quantity: 100, pricePerUnit: 25000 },
      { id: 'm2', name: 'Déjeuner Buffet', quantity: 100, pricePerUnit: 65000 },
      { id: 'm3', name: 'Pause Café & Pâtisseries', quantity: 200, pricePerUnit: 10000 },
    ],
    equipment: [
      { id: 'e1', name: 'Projecteur & Écran', quantity: 2, pricePerUnit: 150000 },
      { id: 'e2', name: 'Micro & Sono', quantity: 1, pricePerUnit: 300000 },
    ],
    staffRequired: ['Chef', '4 Serveurs', 'Chef de rang'],
    status: 'quote_sent',
    totalAmount: 8500000,
    depositAmount: 3000000,
    depositPaid: false,
    notes: 'Salle de conférence réservée. Projection PowerPoint.',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: '7',
    eventType: 'corporate',
    customerName: 'Orange Guinée',
    customerPhone: '+224 62 33 44 55',
    customerEmail: 'rh@orange-guinee.com',
    eventName: 'Cocktail Lancement Produit',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    startTime: '18:30',
    endTime: '21:30',
    location: 'Terrasse KFM DELICE',
    guestCount: 60,
    menu: [
      { id: 'm1', name: 'Amuse-bouche variés', quantity: 180, pricePerUnit: 8000 },
      { id: 'm2', name: 'Cocktails signature', quantity: 120, pricePerUnit: 15000 },
      { id: 'm3', name: 'Desserts gourmands', quantity: 60, pricePerUnit: 12000 },
    ],
    equipment: [
      { id: 'e1', name: 'Bar mobile', quantity: 1, pricePerUnit: 200000 },
      { id: 'e2', name: 'Éclairage ambiance', quantity: 1, pricePerUnit: 150000 },
    ],
    staffRequired: ['Chef', '3 Serveurs', '2 Barmans'],
    status: 'confirmed',
    totalAmount: 3500000,
    depositAmount: 1200000,
    depositPaid: true,
    notes: 'Présence médias. Produit à mettre en avant: Orange Money 2.0',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  // 2 Baptêmes
  {
    id: '8',
    eventType: 'baptism',
    customerName: 'Famille Condé',
    customerPhone: '+224 65 12 34 56',
    customerEmail: 'condefamille@email.com',
    eventName: 'Baptême de Mohamed Condé',
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    startTime: '13:00',
    endTime: '18:00',
    location: 'Salle paroissiale, Kaloum',
    guestCount: 70,
    menu: [
      { id: 'm1', name: 'Riz au Gras', quantity: 70, pricePerUnit: 35000 },
      { id: 'm2', name: 'Poulet Braisé', quantity: 140, pricePerUnit: 12000 },
      { id: 'm3', name: 'Jus de Gingembre', quantity: 140, pricePerUnit: 5000 },
      { id: 'm4', name: 'Gâteau Baptême', quantity: 1, pricePerUnit: 300000 },
    ],
    equipment: [
      { id: 'e1', name: 'Tables et chaises', quantity: 70, pricePerUnit: 5000 },
      { id: 'e2', name: 'Décoration blanche', quantity: 1, pricePerUnit: 400000 },
    ],
    staffRequired: ['Chef', '3 Serveurs'],
    status: 'confirmed',
    totalAmount: 4800000,
    depositAmount: 1600000,
    depositPaid: true,
    notes: 'Enfant: Mohamed Condé, 6 mois. Parrain: M. Touré.',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
  },
  {
    id: '9',
    eventType: 'baptism',
    customerName: 'Famille Doumbouya',
    customerPhone: '+224 64 56 78 90',
    eventName: 'Baptême Jumelles Doumbouya',
    date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    startTime: '12:00',
    endTime: '17:00',
    location: 'Domicile - Dixinn',
    guestCount: 50,
    menu: [
      { id: 'm1', name: 'Maffé Poulet', quantity: 50, pricePerUnit: 40000 },
      { id: 'm2', name: 'Thiéboudienne', quantity: 50, pricePerUnit: 35000 },
      { id: 'm3', name: 'Gâteaux Jumelles (x2)', quantity: 2, pricePerUnit: 250000 },
    ],
    equipment: [
      { id: 'e1', name: 'Tente 10x10m', quantity: 1, pricePerUnit: 800000 },
      { id: 'e2', name: 'Tables et chaises', quantity: 50, pricePerUnit: 5000 },
    ],
    staffRequired: ['Chef', '2 Serveurs'],
    status: 'quote_sent',
    totalAmount: 3800000,
    depositAmount: 1200000,
    depositPaid: false,
    notes: 'Jumelles: Amina & Adama. Thème rose et blanc.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  // 1 pending inquiry
  {
    id: '10',
    eventType: 'other',
    customerName: 'Association des Femmes de Matoto',
    customerPhone: '+224 62 99 88 77',
    customerEmail: 'femmes.matoto@email.com',
    eventName: 'Fête de la Femme - Journée Internationale',
    date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    startTime: '10:00',
    endTime: '18:00',
    location: 'À déterminer',
    guestCount: 200,
    menu: [],
    equipment: [],
    staffRequired: [],
    status: 'inquiry',
    totalAmount: 0,
    depositAmount: 0,
    depositPaid: false,
    notes: 'Demande initiale reçue. Attente de confirmation du budget et du lieu.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

// In-memory store for demo
let eventsStore = [...DEMO_EVENTS];

// Helper to generate IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// GET - List events with filters
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const demo = searchParams.get('demo') === 'true';
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
    demo: true,
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
