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
    transactions: [] as any[],
  },
];

// POST - Refund gift card
export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;
  const body = await request.json();
  const { reason, processedBy, refundAmount } = body;

  const upperCode = code.toUpperCase();

  // Find the gift card
  const cardIndex = DEMO_GIFT_CARDS.findIndex(c => c.code === upperCode);

  if (cardIndex === -1) {
    return NextResponse.json({
      success: false,
      error: 'Carte cadeau non trouvée',
    }, { status: 404 });
  }

  const card = DEMO_GIFT_CARDS[cardIndex];

  // Check if already cancelled
  if (card.status === 'cancelled') {
    return NextResponse.json({
      success: false,
      error: 'Cette carte a déjà été annulée',
    }, { status: 400 });
  }

  // Check if used (partial or full)
  if (card.status === 'used' && card.currentBalance === 0) {
    return NextResponse.json({
      success: false,
      error: 'Cette carte est entièrement utilisée et ne peut pas être remboursée',
    }, { status: 400 });
  }

  // Determine refund amount
  const actualRefundAmount = refundAmount || card.currentBalance;

  if (actualRefundAmount > card.currentBalance) {
    return NextResponse.json({
      success: false,
      error: `Le montant du remboursement ne peut pas dépasser le solde actuel (${card.currentBalance.toLocaleString('fr-FR')} GNF)`,
    }, { status: 400 });
  }

  const previousBalance = card.currentBalance;
  const previousStatus = card.status;

  // Process refund
  if (actualRefundAmount === card.currentBalance) {
    // Full refund - cancel the card
    card.status = 'cancelled';
    card.currentBalance = 0;
  } else {
    // Partial refund
    card.currentBalance -= actualRefundAmount;
  }

  // Add transaction record
  const transaction = {
    id: `tx-refund-${Date.now()}`,
    giftCardId: card.id,
    type: 'refund',
    amount: actualRefundAmount,
    previousBalance,
    newBalance: card.currentBalance,
    reason,
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
      refundedAmount: actualRefundAmount,
      remainingBalance: card.currentBalance,
      previousStatus,
      newStatus: card.status,
      transactionId: transaction.id,
      message: actualRefundAmount === previousBalance
        ? `Carte cadeau annulée. Remboursement de ${actualRefundAmount.toLocaleString('fr-FR')} GNF effectué`
        : `Remboursement partiel de ${actualRefundAmount.toLocaleString('fr-FR')} GNF effectué. Solde restant: ${card.currentBalance.toLocaleString('fr-FR')} GNF`,
    },
  });
});
