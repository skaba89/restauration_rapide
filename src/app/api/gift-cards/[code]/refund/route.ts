import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';

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
  const giftCards: any[] = [];
  const cardIndex = giftCards.findIndex(c => c.code === upperCode);

  if (cardIndex === -1) {
    return NextResponse.json({
      success: false,
      error: 'Carte cadeau non trouvée',
    }, { status: 404 });
  }

  const card = giftCards[cardIndex];

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
      error: `Le montant du remboursement ne peut pas dépasser le solde actuel (${card.currentBalance.toLocaleString('fr-FR')} FGN)`,
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
  giftCards[cardIndex] = card;

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
        ? `Carte cadeau annulée. Remboursement de ${actualRefundAmount.toLocaleString('fr-FR')} FGN effectué`
        : `Remboursement partiel de ${actualRefundAmount.toLocaleString('fr-FR')} FGN effectué. Solde restant: ${card.currentBalance.toLocaleString('fr-FR')} FGN`,
    },
  });
});