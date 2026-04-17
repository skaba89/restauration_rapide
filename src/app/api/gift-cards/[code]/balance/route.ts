import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';

// GET - Check gift card balance by code
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;
  const upperCode = code.toUpperCase();

  // Find the gift card
  const card = null;

  if (!card) {
    return NextResponse.json({
      success: false,
      error: 'Carte cadeau non trouvée. Vérifiez le code et réessayez.',
    }, { status: 404 });
  }

  // Check if expired
  const now = new Date();
  const isExpired = card.status === 'expired' || new Date(card.expiresAt) < now;

  // Check if usable
  const isUsable = card.status === 'active' && !isExpired && card.currentBalance > 0;

  return NextResponse.json({
    success: true,
    data: {
      code: card.code,
      balance: card.currentBalance,
      initialBalance: card.initialAmount,
      status: isExpired ? 'expired' : card.status,
      isUsable,
      expiresAt: card.expiresAt,
      purchasedAt: card.purchasedAt,
      recipientName: card.recipientName,
      formattedBalance: `${card.currentBalance.toLocaleString('fr-FR')} GNF`,
      formattedExpiry: new Date(card.expiresAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
    },
  });
});