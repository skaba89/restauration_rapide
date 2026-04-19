import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';

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
  const giftCards: any[] = [];
  const cardIndex = giftCards.findIndex(c => c.code === upperCode);

  if (cardIndex === -1) {
    return NextResponse.json({
      success: false,
      error: 'Carte cadeau non trouvée',
    }, { status: 404 });
  }

  const card = giftCards[cardIndex];

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
      error: `Solde insuffisant. Solde disponible: ${card.currentBalance.toLocaleString('fr-FR')} FGN`,
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
  giftCards[cardIndex] = card;

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
        : `Paiement de ${redeemAmount.toLocaleString('fr-FR')} FGN effectué. Solde restant: ${card.currentBalance.toLocaleString('fr-FR')} FGN`,
    },
  });
});