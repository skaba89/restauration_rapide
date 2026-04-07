import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';

// Demo gift cards data (same as main route)
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
  },
];

// GET - Check gift card balance by code
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) => {
  const { code } = await params;
  const upperCode = code.toUpperCase();

  // Find the gift card
  const card = DEMO_GIFT_CARDS.find(c => c.code === upperCode);

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
