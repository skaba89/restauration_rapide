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
let giftCards: GiftCard[] = [];

// GET - List gift cards with filters
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';
  const code = searchParams.get('code') || '';

  let giftCards;;

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