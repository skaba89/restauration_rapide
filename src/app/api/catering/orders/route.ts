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

// Demo Orders Data
const DEMO_ORDERS: CateringOrder[] = [
  {
    id: '1',
    orderNumber: 'CAT-2024-001',
    packageId: '4',
    packageName: 'Package Mariage',
    customerName: 'Amadou & Aïssata Koné',
    customerEmail: 'amadou.kone@email.com',
    customerPhone: '+224 62 12 34 56',
    eventType: 'wedding',
    eventName: 'Mariage Koné - Diallo',
    eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    eventTime: '14:00',
    endTime: '23:00',
    guestCount: 150,
    venue: 'Salle des fêtes Kaloum',
    venueAddress: 'Avenue de la République, Kaloum, Conakry',
    venueNotes: 'Salle climatisée, parking disponible',
    menuCustomizations: ['Thème blanc et or', 'Gâteau 3 étages', 'Champagne supplémentaire'],
    specialRequests: 'Musique live, DJ disponible sur place',
    dietaryNotes: '2 invités végétariens, 1 allergie aux fruits de mer',
    staffRequired: ['3 chefs', '25 serveurs', '3 barmans', '2 maîtres d\'hôtel'],
    equipmentNeeded: ['Tentes 20x30m', 'Tables rondes x15', 'Chaises décorées x150', 'Décoration florale'],
    totalAmount: 11250000,
    discountAmount: 500000,
    finalAmount: 10750000,
    depositAmount: 4300000,
    depositPaid: true,
    depositPaidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'confirmed',
    internalNotes: 'Client VIP, suivi prioritaire',
    quotedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    confirmedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    completedAt: null,
    cancelledAt: null,
    cancellationReason: null,
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    orderNumber: 'CAT-2024-002',
    packageId: '2',
    packageName: 'Package Familial',
    customerName: 'Mamadou Diallo',
    customerEmail: 'mamadou.diallo@email.com',
    customerPhone: '+224 62 11 22 33',
    eventType: 'birthday',
    eventName: '50ème Anniversaire',
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    eventTime: '19:00',
    endTime: '02:00',
    guestCount: 60,
    venue: 'Villa Familiale',
    venueAddress: 'Quartier Ratoma, Conakry',
    venueNotes: 'Jardin spacieux, piscine sur place',
    menuCustomizations: ['Gâteau anniversaire personnalisé', 'Bar à cocktails'],
    specialRequests: 'Surprise party - coordonner avec la famille',
    dietaryNotes: null,
    staffRequired: ['1 chef', '6 serveurs', '1 barman'],
    equipmentNeeded: ['Tentes 10x10m', 'Tables cocktail x8', 'Sono/Lumière'],
    totalAmount: 2100000,
    discountAmount: 100000,
    finalAmount: 2000000,
    depositAmount: 700000,
    depositPaid: true,
    depositPaidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'deposit_paid',
    internalNotes: 'Événement surprise, confirmer détails avec l\'organisateur',
    quotedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    confirmedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    completedAt: null,
    cancelledAt: null,
    cancellationReason: null,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    orderNumber: 'CAT-2024-003',
    packageId: '5',
    packageName: 'Package Entreprise',
    customerName: 'Société Minière de Guinée',
    customerEmail: 'events@smg-guinea.com',
    customerPhone: '+224 62 00 11 22',
    eventType: 'corporate',
    eventName: 'Séminaire Annuel SMG',
    eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    eventTime: '08:00',
    endTime: '17:00',
    guestCount: 100,
    venue: 'Hôtel Palm Camayenne',
    venueAddress: 'Boulevard de la République, Conakry',
    venueNotes: 'Salle de conférence réservée',
    menuCustomizations: ['Menu végétarien disponible', 'Pause café supplémentaire'],
    specialRequests: 'Projection PowerPoint, micro pour présentations',
    dietaryNotes: '5 participants végétariens',
    staffRequired: ['1 chef', '5 serveurs', '1 chef de rang'],
    equipmentNeeded: ['Projecteur & Écran x2', 'Micro & Sono'],
    totalAmount: 3000000,
    discountAmount: 0,
    finalAmount: 3000000,
    depositAmount: 1500000,
    depositPaid: false,
    depositPaidAt: null,
    status: 'quote_sent',
    internalNotes: 'Attente validation budget direction',
    quotedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    confirmedAt: null,
    completedAt: null,
    cancelledAt: null,
    cancellationReason: null,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: '4',
    orderNumber: 'CAT-2024-004',
    packageId: '6',
    packageName: 'Package Cocktail',
    customerName: 'Orange Guinée',
    customerEmail: 'rh@orange-guinee.com',
    customerPhone: '+224 62 33 44 55',
    eventType: 'corporate',
    eventName: 'Lancement Produit Orange Money 2.0',
    eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    eventTime: '18:30',
    endTime: '21:30',
    guestCount: 60,
    venue: 'KFM DELICE - Terrasse VIP',
    venueAddress: 'Restaurant KFM DELICE, Dixinn',
    venueNotes: 'Présence médias prévue',
    menuCustomizations: ['Cocktails aux couleurs Orange', 'Mini-brochettes premium'],
    specialRequests: 'Marqueting produit Orange visible',
    dietaryNotes: null,
    staffRequired: ['1 chef', '4 serveurs', '2 barmans'],
    equipmentNeeded: ['Bar mobile', 'Éclairage ambiance', 'Enceintes'],
    totalAmount: 1200000,
    discountAmount: 0,
    finalAmount: 1200000,
    depositAmount: 500000,
    depositPaid: true,
    depositPaidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'confirmed',
    internalNotes: 'Client corporate important - service premium',
    quotedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    confirmedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    completedAt: null,
    cancelledAt: null,
    cancellationReason: null,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
  },
  {
    id: '5',
    orderNumber: 'CAT-2024-005',
    packageId: null,
    packageName: null,
    customerName: 'Famille Condé',
    customerEmail: 'condefamille@email.com',
    customerPhone: '+224 65 12 34 56',
    eventType: 'baptism',
    eventName: 'Baptême de Mohamed Condé',
    eventDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    eventTime: '13:00',
    endTime: '18:00',
    guestCount: 70,
    venue: 'Salle paroissiale',
    venueAddress: 'Paroisse Saint-Pierre, Kaloum',
    venueNotes: 'Enfant: Mohamed Condé, 6 mois. Parrain: M. Touré',
    menuCustomizations: ['Menu traditionnel', 'Gâteau baptême'],
    specialRequests: 'Décoration blanche et bleue',
    dietaryNotes: null,
    staffRequired: ['1 chef', '5 serveurs'],
    equipmentNeeded: ['Tables et chaises x70', 'Décoration blanche'],
    totalAmount: 2450000,
    discountAmount: 0,
    finalAmount: 2450000,
    depositAmount: 850000,
    depositPaid: true,
    depositPaidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'deposit_paid',
    internalNotes: null,
    quotedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    confirmedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    completedAt: null,
    cancelledAt: null,
    cancellationReason: null,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  },
  {
    id: '6',
    orderNumber: 'CAT-2024-006',
    packageId: '2',
    packageName: 'Package Familial',
    customerName: 'Aminata Bamba',
    customerEmail: 'aminata.bamba@email.com',
    customerPhone: '+224 65 44 55 66',
    eventType: 'birthday',
    eventName: '30ème Anniversaire',
    eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    eventTime: '18:00',
    endTime: '23:00',
    guestCount: 40,
    venue: 'KFM DELICE - Salle VIP',
    venueAddress: 'Restaurant KFM DELICE, Dixinn',
    venueNotes: 'Salle privatisée',
    menuCustomizations: ['Gâteau thème voyage', 'Cocktails signature'],
    specialRequests: 'Thème voyage autour du monde',
    dietaryNotes: null,
    staffRequired: ['1 chef', '4 serveurs', '1 barman'],
    equipmentNeeded: ['Décoration anniversaire'],
    totalAmount: 1400000,
    discountAmount: 0,
    finalAmount: 1400000,
    depositAmount: 500000,
    depositPaid: false,
    depositPaidAt: null,
    status: 'quote_sent',
    internalNotes: 'Attente confirmation du thème',
    quotedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    confirmedAt: null,
    completedAt: null,
    cancelledAt: null,
    cancellationReason: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: '7',
    orderNumber: 'CAT-2024-007',
    packageId: '3',
    packageName: 'Package Prestige',
    customerName: 'Ibrahim & Fatou Sylla',
    customerEmail: 'ibrahim.sylla@email.com',
    customerPhone: '+224 64 98 76 54',
    eventType: 'wedding',
    eventName: 'Mariage Sylla - Touré',
    eventDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    eventTime: '16:00',
    endTime: '00:00',
    guestCount: 200,
    venue: 'Jardin du Palais',
    venueAddress: 'Dixinn, Conakry',
    venueNotes: 'Cérémonie traditionnelle le matin. Soirée cocktail.',
    menuCustomizations: ['Menu mixte traditionnel + moderne', 'Gâteau 5 étages'],
    specialRequests: 'Orchestre live, piste de danse',
    dietaryNotes: '10 invités végétariens',
    staffRequired: ['3 chefs', '30 serveurs', '4 barmans', '3 maîtres d\'hôtel'],
    equipmentNeeded: ['Tentes 30x40m', 'Tables rectangulaires x25', 'Chaises premium x200', 'Piste de danse', 'Sono/Lumière'],
    totalAmount: 11000000,
    discountAmount: 0,
    finalAmount: 11000000,
    depositAmount: 4400000,
    depositPaid: true,
    depositPaidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    status: 'deposit_paid',
    internalNotes: 'Grand mariage - équipe dédiée requise',
    quotedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    confirmedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    completedAt: null,
    cancelledAt: null,
    cancellationReason: null,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
  },
  {
    id: '8',
    orderNumber: 'CAT-2024-008',
    packageId: null,
    packageName: null,
    customerName: 'Association des Femmes de Matoto',
    customerEmail: 'femmes.matoto@email.com',
    customerPhone: '+224 62 99 88 77',
    eventType: 'other',
    eventName: 'Fête de la Femme - Journée Internationale',
    eventDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    eventTime: '10:00',
    endTime: '18:00',
    guestCount: 200,
    venue: null,
    venueAddress: null,
    venueNotes: 'Lieu à déterminer',
    menuCustomizations: [],
    specialRequests: 'Budget à confirmer avec le comité',
    dietaryNotes: null,
    staffRequired: [],
    equipmentNeeded: [],
    totalAmount: 0,
    discountAmount: 0,
    finalAmount: 0,
    depositAmount: 0,
    depositPaid: false,
    depositPaidAt: null,
    status: 'inquiry',
    internalNotes: 'Demande initiale - attente confirmation budget et lieu',
    quotedAt: null,
    confirmedAt: null,
    completedAt: null,
    cancelledAt: null,
    cancellationReason: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
];

// In-memory store for demo
let ordersStore = [...DEMO_ORDERS];

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
    stats,
    demo: true
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
