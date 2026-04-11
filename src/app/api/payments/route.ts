// Payments API - Payment processing (mock for demo)
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';
import { generateTransactionId, getMobileMoneyProvider } from '@/lib/utils-helpers';

// Mobile Money Provider Configurations
const MOBILE_MONEY_CONFIGS = {
  MOBILE_MONEY_ORANGE: {
    name: 'Orange Money',
    currency: 'XOF',
    countries: ['CI', 'SN', 'ML', 'BF'],
  },
  MOBILE_MONEY_MTN: {
    name: 'MTN Mobile Money',
    currency: 'XOF',
    countries: ['CI', 'BJ', 'TG', 'GW'],
  },
  MOBILE_MONEY_WAVE: {
    name: 'Wave',
    currency: 'XOF',
    countries: ['CI', 'SN'],
  },
  MOBILE_MONEY_MPESA: {
    name: 'M-Pesa',
    currency: 'XOF',
    countries: ['CD', 'CG', 'MZ', 'KE', 'TZ', 'UG', 'RW'],
  },
  MOBILE_MONEY_MOOV: {
    name: 'Moov Money',
    currency: 'XOF',
    countries: ['BJ', 'TG', 'CI', 'BF', 'NE'],
  },
};

// GET /api/payments - Get payments
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const orderId = searchParams.get('orderId');
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const method = searchParams.get('method');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    if (!orderId && !organizationId) {
      return apiError('orderId ou organizationId est requis');
    }

    const where = {
      ...(orderId && { orderId }),
      ...(organizationId && { order: { restaurant: { organizationId } } }),
      ...(status && { status: status as string }),
      ...(method && { method: method as string }),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) }),
            },
          }
        : {}),
    };

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            include: {
              customer: true,
              restaurant: { select: { name: true } },
            },
          },
        },
      }),
      db.payment.count({ where }),
    ]);

    return apiSuccess({
      data: payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  });
}

// POST /api/payments - Process payment
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { orderId, method, phoneNumber, amount } = body;

    if (!orderId || !method) {
      return apiError('orderId et method sont requis');
    }

    // Get order
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: {
          include: {
            organization: {
              include: { settings: true },
            },
          },
        },
      },
    });

    if (!order) {
      return apiError('Commande non trouvée', 404);
    }

    const paymentAmount = amount || order.total;
    const transactionId = generateTransactionId();

    // Validate payment method
    const isMobileMoney = method.startsWith('MOBILE_MONEY_');
    const isCash = method === 'CASH';
    const isCard = method === 'CARD';
    const isWallet = method === 'WALLET';

    // Check if payment method is accepted
    const settings = order.restaurant?.organization?.settings;
    if (settings) {
      if (isMobileMoney && !settings.acceptsMobileMoney) {
        return apiError('Mobile Money non accepté par ce marchand');
      }
      if (isCash && !settings.acceptsCash) {
        return apiError('Paiement en espèces non accepté par ce marchand');
      }
      if (isCard && !settings.acceptsCard) {
        return apiError('Paiement par carte non accepté par ce marchand');
      }
      if (isWallet && !settings.acceptsWallet) {
        return apiError('Paiement par portefeuille non accepté par ce marchand');
      }
    }

    // For mobile money, validate phone and detect provider
    let provider = null;
    if (isMobileMoney && phoneNumber) {
      provider = getMobileMoneyProvider(phoneNumber);
      if (!provider) {
        return apiError('Impossible de détecter le fournisseur Mobile Money');
      }
    }

    // Create payment record
    const payment = await db.payment.create({
      data: {
        orderId,
        amount: paymentAmount,
        currencyId: order.currencyId,
        method: method as string,
        provider: provider || undefined,
        status: 'PENDING',
        phoneNumber: phoneNumber || order.customerPhone,
        transactionId,
      },
    });

    // Mobile Money payment flow
    if (isMobileMoney) {
      const config = MOBILE_MONEY_CONFIGS[method as keyof typeof MOBILE_MONEY_CONFIGS];

      // In production: call actual Mobile Money API
      // For demo: simulate payment processing
      const paymentData = {
        paymentId: payment.id,
        transactionId,
        provider: config?.name || method,
        amount: paymentAmount,
        currency: order.currencyId,
        phoneNumber: phoneNumber || order.customerPhone,
        status: 'pending_confirmation',
        message: `Paiement ${config?.name} en attente. Veuillez valider sur votre téléphone.`,
        ussdCode: getUSSDCode(method, paymentAmount, phoneNumber),
      };

      // Simulate async confirmation (in production, use webhooks)
      // For demo, auto-confirm after a delay
      setTimeout(async () => {
        try {
          const success = Math.random() > 0.2; // 80% success rate for demo
          await db.payment.update({
            where: { id: payment.id },
            data: {
              status: success ? 'PAID' : 'FAILED',
              processedAt: success ? new Date() : undefined,
              failedAt: success ? undefined : new Date(),
              failureReason: success ? undefined : 'Paiement refusé par l\'opérateur',
            },
          });

          if (success) {
            await db.order.update({
              where: { id: orderId },
              data: {
                paymentStatus: 'PAID',
                status: 'CONFIRMED',
                confirmedAt: new Date(),
              },
            });
          }
        } catch (error) {
          console.error('Payment auto-confirmation error:', error);
        }
      }, 5000);

      return apiSuccess(paymentData, 'Demande de paiement envoyée');
    }

    // Cash payment
    if (isCash) {
      return apiSuccess({
        ...payment,
        message: 'Paiement en espèces à effectuer à la livraison',
      }, 'Paiement en espèces enregistré');
    }

    // Card payment
    if (isCard) {
      // In production: integrate with card payment gateway (Stripe, Paystack, etc.)
      return apiSuccess({
        paymentId: payment.id,
        transactionId,
        status: 'pending',
        message: 'Redirection vers la page de paiement sécurisé...',
        checkoutUrl: `/checkout/${payment.id}`, // Mock checkout URL
      });
    }

    // Wallet payment
    if (isWallet) {
      // Check customer wallet balance
      const customer = order.customerId
        ? await db.customerProfile.findUnique({ where: { id: order.customerId } })
        : null;

      if (!customer) {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED', failureReason: 'Client non trouvé' },
        });
        return apiError('Client non trouvé', 404);
      }

      // For demo, simulate wallet check and deduction
      const walletBalance = customer.totalSpent * 0.1; // Mock wallet balance
      if (walletBalance < paymentAmount) {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED', failureReason: 'Solde insuffisant' },
        });
        return apiError('Solde insuffisant dans le portefeuille', 400);
      }

      // Deduct from wallet
      await db.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID', processedAt: new Date() },
      });

      await db.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED', confirmedAt: new Date() },
      });

      return apiSuccess({ ...payment, status: 'PAID' }, 'Paiement effectué avec succès');
    }

    return apiSuccess(payment, 'Paiement initié');
  });
}

// PATCH /api/payments - Confirm/Update payment
export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { paymentId, transactionId, status, providerReference, failureReason } = body;

    if (!paymentId && !transactionId) {
      return apiError('paymentId ou transactionId est requis');
    }

    const payment = await db.payment.findFirst({
      where: {
        ...(paymentId && { id: paymentId }),
        ...(transactionId && { transactionId }),
      },
    });

    if (!payment) {
      return apiError('Paiement non trouvé', 404);
    }

    // Update payment status
    const updateData: Record<string, unknown> = {
      ...(status && { status }),
      ...(providerReference && { providerReference }),
      ...(failureReason && { failureReason }),
    };

    if (status === 'PAID') {
      updateData.processedAt = new Date();
    } else if (status === 'FAILED') {
      updateData.failedAt = new Date();
    } else if (status === 'REFUNDED') {
      updateData.refundedAt = new Date();
    }

    const updatedPayment = await db.payment.update({
      where: { id: payment.id },
      data: updateData,
    });

    // Update order payment status
    if (status === 'PAID') {
      await db.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
      });
    } else if (status === 'FAILED') {
      await db.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: 'FAILED' },
      });
    } else if (status === 'REFUNDED') {
      await db.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: 'REFUNDED',
          status: 'REFUNDED',
        },
      });
    }

    return apiSuccess(updatedPayment, 'Paiement mis à jour');
  });
}

// GET providers list
export function GET_PROVIDERS() {
  return apiSuccess(
    Object.entries(MOBILE_MONEY_CONFIGS).map(([key, config]) => ({
      id: key,
      name: config.name,
      currency: config.currency,
      countries: config.countries,
    }))
  );
}

// Helper: Generate USSD code for mobile money
function getUSSDCode(method: string, _amount: number, _phone?: string): string | null {
  const ussdCodes: Record<string, string> = {
    MOBILE_MONEY_ORANGE: '#144#',
    MOBILE_MONEY_MTN: '*400#',
    MOBILE_MONEY_WAVE: '*99#',
    MOBILE_MONEY_MPESA: '*500#',
    MOBILE_MONEY_MOOV: '*155#',
  };
  return ussdCodes[method] || null;
}
