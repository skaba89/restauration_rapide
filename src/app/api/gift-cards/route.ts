import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';

// Generate unique gift card code: KFM-XXXX-XXXX
function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'KFM-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  code += '-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Demo gift cards data
const DEMO_GIFT_CARDS = [
  {
    id: '1',
    code: 'KFM-A7X2-M9P4',
    initialAmount: 50000,
    currentBalance: 50000,
    status: 'active' as const,
    buyerName: 'Koné Ibrahim',
    buyerPhone: '+225 07 12 34 56 78',
    recipientName: 'Diallo Fatou',
    recipientPhone: '+225 05 98 76 54 32',
    deliveryMethod: 'sms' as const,
    purchasedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 363 * 24 * 60 * 60 * 1000),
    transactions: [
      { id: 't1', giftCardId: '1', type: 'purchase' as const, amount: 50000, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
    ],
  },
  {
    id: '2',
    code: 'KFM-B3K8-N2W5',
    initialAmount: 25000,
    currentBalance: 12500,
    status: 'active' as const,
    buyerName: 'Touré Amadou',
    buyerPhone: '+225 07 88 11 22 33',
    recipientName: 'Bamba Seydou',
    recipientPhone: '+225 05 44 55 66 77',
    deliveryMethod: 'email' as const,
    purchasedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 358 * 24 * 60 * 60 * 1000),
    transactions: [
      { id: 't2', giftCardId: '2', type: 'purchase' as const, amount: 25000, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { id: 't3', giftCardId: '2', type: 'redemption' as const, amount: 12500, orderId: 'ORD-2024-001', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    ],
  },
  {
    id: '3',
    code: 'KFM-C5D1-H8R9',
    initialAmount: 100000,
    currentBalance: 0,
    status: 'used' as const,
    buyerName: 'Kouamé Jean',
    buyerPhone: '+225 07 33 44 55 66',
    recipientName: 'Yao Kouassi',
    recipientPhone: '+225 05 11 22 33 44',
    deliveryMethod: 'print' as const,
    purchasedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
    transactions: [
      { id: 't4', giftCardId: '3', type: 'purchase' as const, amount: 100000, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { id: 't5', giftCardId: '3', type: 'redemption' as const, amount: 45000, orderId: 'ORD-2024-015', createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
      { id: 't6', giftCardId: '3', type: 'redemption' as const, amount: 55000, orderId: 'ORD-2024-028', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
    ],
  },
  {
    id: '4',
    code: 'KFM-D9F2-J4L7',
    initialAmount: 30000,
    currentBalance: 30000,
    status: 'expired' as const,
    buyerName: 'Traoré Aïssata',
    buyerPhone: '+225 07 55 66 77 88',
    recipientName: 'Sylla Fatoumata',
    recipientPhone: '+225 05 99 88 77 66',
    deliveryMethod: 'sms' as const,
    purchasedAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    transactions: [
      { id: 't7', giftCardId: '4', type: 'purchase' as const, amount: 30000, createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000) }
    ],
  },
  {
    id: '5',
    code: 'KFM-E2G6-K1M3',
    initialAmount: 75000,
    currentBalance: 45000,
    status: 'active' as const,
    buyerName: 'Diarra Moussa',
    buyerPhone: '+225 07 22 33 44 55',
    recipientName: 'Coulibaly Mariam',
    recipientPhone: '+225 05 66 77 88 99',
    deliveryMethod: 'email' as const,
    purchasedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 351 * 24 * 60 * 60 * 1000),
    transactions: [
      { id: 't8', giftCardId: '5', type: 'purchase' as const, amount: 75000, createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      { id: 't9', giftCardId: '5', type: 'redemption' as const, amount: 30000, orderId: 'ORD-2024-042', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
    ],
  },
  {
    id: '6',
    code: 'KFM-F8H3-L5N2',
    initialAmount: 15000,
    currentBalance: 0,
    status: 'cancelled' as const,
    buyerName: 'Ouattara Issouf',
    buyerPhone: '+225 07 11 99 88 77',
    recipientName: 'Konaté Fanta',
    recipientPhone: '+225 05 33 22 11 00',
    deliveryMethod: 'print' as const,
    purchasedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 360 * 24 * 60 * 60 * 1000),
    transactions: [
      { id: 't10', giftCardId: '6', type: 'purchase' as const, amount: 15000, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { id: 't11', giftCardId: '6', type: 'refund' as const, amount: 15000, createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) }
    ],
  },
  {
    id: '7',
    code: 'KFM-G1J7-M4P8',
    initialAmount: 60000,
    currentBalance: 60000,
    status: 'active' as const,
    buyerName: 'Sangaré Salimata',
    buyerPhone: '+225 07 44 55 66 77',
    recipientName: 'Keïta Abdoulaye',
    recipientPhone: '+225 05 88 77 66 55',
    deliveryMethod: 'sms' as const,
    purchasedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 364 * 24 * 60 * 60 * 1000),
    transactions: [
      { id: 't12', giftCardId: '7', type: 'purchase' as const, amount: 60000, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
    ],
  },
  {
    id: '8',
    code: 'KFM-H6K2-N9Q1',
    initialAmount: 40000,
    currentBalance: 18000,
    status: 'active' as const,
    buyerName: 'Cissé Moussa',
    buyerPhone: '+225 07 77 88 99 00',
    recipientName: 'Dembélé Aminata',
    recipientPhone: '+225 05 22 11 00 99',
    deliveryMethod: 'email' as const,
    purchasedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 344 * 24 * 60 * 60 * 1000),
    transactions: [
      { id: 't13', giftCardId: '8', type: 'purchase' as const, amount: 40000, createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) },
      { id: 't14', giftCardId: '8', type: 'redemption' as const, amount: 12000, orderId: 'ORD-2024-035', createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
      { id: 't15', giftCardId: '8', type: 'redemption' as const, amount: 10000, orderId: 'ORD-2024-048', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    ],
  },
  {
    id: '9',
    code: 'KFM-I3L9-P2R5',
    initialAmount: 20000,
    currentBalance: 20000,
    status: 'active' as const,
    buyerName: 'Kaba Ibrahima',
    buyerPhone: '+225 07 00 11 22 33',
    recipientName: 'Bah Aissatou',
    recipientPhone: '+225 05 44 33 22 11',
    deliveryMethod: 'print' as const,
    purchasedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 362 * 24 * 60 * 60 * 1000),
    transactions: [
      { id: 't16', giftCardId: '9', type: 'purchase' as const, amount: 20000, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    ],
  },
  {
    id: '10',
    code: 'KFM-J7M1-Q6S3',
    initialAmount: 80000,
    currentBalance: 25000,
    status: 'active' as const,
    buyerName: 'Fofana Mamadou',
    buyerPhone: '+225 07 66 77 88 99',
    recipientName: 'Soumahoro Adama',
    recipientPhone: '+225 05 00 99 88 77',
    deliveryMethod: 'sms' as const,
    purchasedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 355 * 24 * 60 * 60 * 1000),
    transactions: [
      { id: 't17', giftCardId: '10', type: 'purchase' as const, amount: 80000, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { id: 't18', giftCardId: '10', type: 'redemption' as const, amount: 35000, orderId: 'ORD-2024-038', createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
      { id: 't19', giftCardId: '10', type: 'redemption' as const, amount: 20000, orderId: 'ORD-2024-045', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) }
    ],
  },
];

// Types
interface GiftCardTransaction {
  id: string;
  giftCardId: string;
  type: 'purchase' | 'redemption' | 'refund';
  amount: number;
  orderId?: string;
  createdAt: Date;
}

interface GiftCard {
  id: string;
  code: string;
  initialAmount: number;
  currentBalance: number;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  buyerName: string;
  buyerPhone: string;
  recipientName?: string;
  recipientPhone?: string;
  deliveryMethod: 'sms' | 'email' | 'print';
  purchasedAt: Date;
  expiresAt: Date;
  transactions: GiftCardTransaction[];
}

// In-memory storage
let giftCards: GiftCard[] = [...DEMO_GIFT_CARDS];

// GET - List gift cards with filters
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const demo = searchParams.get('demo') === 'true';
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';
  const code = searchParams.get('code') || '';

  let filteredCards = demo ? DEMO_GIFT_CARDS : giftCards;

  // Check balance by code
  if (code) {
    const card = filteredCards.find(c => c.code.toLowerCase() === code.toLowerCase());
    if (!card) {
      return NextResponse.json({
        success: false,
        error: 'Carte cadeau non trouvée',
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: {
        code: card.code,
        balance: card.currentBalance,
        status: card.status,
        expiresAt: card.expiresAt,
      },
    });
  }

  // Filter by status
  if (status) {
    filteredCards = filteredCards.filter(c => c.status === status);
  }

  // Filter by search term
  if (search) {
    const searchLower = search.toLowerCase();
    filteredCards = filteredCards.filter(c =>
      c.code.toLowerCase().includes(searchLower) ||
      c.buyerName.toLowerCase().includes(searchLower) ||
      (c.recipientName && c.recipientName.toLowerCase().includes(searchLower))
    );
  }

  // Calculate stats
  const stats = {
    total: filteredCards.length,
    active: filteredCards.filter(c => c.status === 'active').length,
    used: filteredCards.filter(c => c.status === 'used').length,
    expired: filteredCards.filter(c => c.status === 'expired').length,
    totalBalance: filteredCards.reduce((sum, c) => sum + c.currentBalance, 0),
    totalValue: filteredCards.reduce((sum, c) => sum + c.initialAmount, 0),
  };

  return NextResponse.json({
    success: true,
    data: filteredCards,
    stats,
  });
});

// POST - Create new gift card
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();

  // Check for unique code
  let code = generateGiftCardCode();
  let attempts = 0;
  while (giftCards.some(c => c.code === code) && attempts < 10) {
    code = generateGiftCardCode();
    attempts++;
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const newCard: GiftCard = {
    id: `${Date.now()}`,
    code,
    initialAmount: body.initialAmount,
    currentBalance: body.initialAmount,
    status: 'active',
    buyerName: body.buyerName,
    buyerPhone: body.buyerPhone,
    recipientName: body.recipientName,
    recipientPhone: body.recipientPhone,
    deliveryMethod: body.deliveryMethod || 'print',
    purchasedAt: now,
    expiresAt,
    transactions: [
      {
        id: `t${Date.now()}`,
        giftCardId: `${Date.now()}`,
        type: 'purchase',
        amount: body.initialAmount,
        createdAt: now,
      }
    ],
  };

  giftCards.push(newCard);

  return NextResponse.json({
    success: true,
    data: newCard,
    message: 'Carte cadeau créée avec succès',
  });
});

// PUT - Update gift card (redeem, add balance)
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { id, action, amount, orderId } = body;

  const index = giftCards.findIndex(c => c.id === id);
  if (index === -1) {
    return NextResponse.json(
      { success: false, error: 'Carte cadeau non trouvée' },
      { status: 404 }
    );
  }

  const card = giftCards[index];

  if (action === 'redeem') {
    if (card.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Cette carte ne peut pas être utilisée' },
        { status: 400 }
      );
    }

    if (card.currentBalance < amount) {
      return NextResponse.json(
        { success: false, error: 'Solde insuffisant' },
        { status: 400 }
      );
    }

    card.currentBalance -= amount;
    card.transactions.push({
      id: `t${Date.now()}`,
      giftCardId: card.id,
      type: 'redemption',
      amount,
      orderId,
      createdAt: new Date(),
    });

    if (card.currentBalance === 0) {
      card.status = 'used';
    }
  } else if (action === 'cancel') {
    card.status = 'cancelled';
    card.transactions.push({
      id: `t${Date.now()}`,
      giftCardId: card.id,
      type: 'refund',
      amount: card.currentBalance,
      createdAt: new Date(),
    });
    card.currentBalance = 0;
  }

  giftCards[index] = card;

  return NextResponse.json({
    success: true,
    data: card,
    message: action === 'redeem' ? 'Paiement effectué' : 'Carte annulée',
  });
});

// DELETE - Delete gift card (admin only)
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID requis' },
      { status: 400 }
    );
  }

  const index = giftCards.findIndex(c => c.id === id);
  if (index === -1) {
    return NextResponse.json(
      { success: false, error: 'Carte cadeau non trouvée' },
      { status: 404 }
    );
  }

  giftCards.splice(index, 1);

  return NextResponse.json({
    success: true,
    message: 'Carte cadeau supprimée',
  });
});
