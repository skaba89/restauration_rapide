import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';

// Demo gift cards storage (in-memory, same as main route)
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
    transactions: [] as any[],
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
    transactions: [] as any[],
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
    transactions: [] as any[],
  },
];

// POST - Redeem gift card
export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;
  const body = await request.json();
  const { amount, orderId, processedBy } = body;

  const upperCode = code.toUpperCase();
  const redeemAmount = parseFloat(amount);

  // Validate amount
  if (!redeemAmount || redeemAmount <= 0) {
    return NextResponse.json({
      success: false,
      error: 'Le montant doit être supérieur à zéro',
    }, { status: 400 });
  }

  // Find the gift card
  const cardIndex = DEMO_GIFT_CARDS.findIndex(c => c.code === upperCode);

  if (cardIndex === -1) {
    return NextResponse.json({
      success: false,
      error: 'Carte cadeau non trouvée',
    }, { status: 404 });
  }

  const card = DEMO_GIFT_CARDS[cardIndex];

  // Check if active
  if (card.status !== 'active') {
    return NextResponse.json({
      success: false,
      error: `Cette carte est ${card.status === 'used' ? 'entièrement utilisée' : card.status === 'expired' ? 'expirée' : 'annulée'}`,
    }, { status: 400 });
  }

  // Check if expired
  const now = new Date();
  if (new Date(card.expiresAt) < now) {
    return NextResponse.json({
      success: false,
      error: 'Cette carte cadeau a expiré',
    }, { status: 400 });
  }

  // Check if sufficient balance
  if (card.currentBalance < redeemAmount) {
    return NextResponse.json({
      success: false,
      error: `Solde insuffisant. Solde disponible: ${card.currentBalance.toLocaleString('fr-FR')} GNF`,
      data: {
        currentBalance: card.currentBalance,
        requestedAmount: redeemAmount,
      },
    }, { status: 400 });
  }

  // Process redemption
  const previousBalance = card.currentBalance;
  card.currentBalance -= redeemAmount;

  // Update status if fully used
  if (card.currentBalance === 0) {
    card.status = 'used';
  }

  // Add transaction record
  const transaction = {
    id: `tx-${Date.now()}`,
    giftCardId: card.id,
    type: 'redemption',
    amount: redeemAmount,
    previousBalance,
    newBalance: card.currentBalance,
    orderId,
    processedBy,
    createdAt: new Date(),
  };
  card.transactions.push(transaction);

  // Update the array
  DEMO_GIFT_CARDS[cardIndex] = card;

  return NextResponse.json({
    success: true,
    data: {
      code: card.code,
      redeemedAmount: redeemAmount,
      remainingBalance: card.currentBalance,
      status: card.status,
      transactionId: transaction.id,
      message: redeemAmount === previousBalance
        ? 'Carte cadeau entièrement utilisée'
        : `Paiement de ${redeemAmount.toLocaleString('fr-FR')} GNF effectué. Solde restant: ${card.currentBalance.toLocaleString('fr-FR')} GNF`,
    },
  });
});
