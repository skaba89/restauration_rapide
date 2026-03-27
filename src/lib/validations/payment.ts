import { z } from 'zod';

// Payment method enum
export const paymentMethodSchema = z.enum([
  'CASH',
  'MOBILE_MONEY_ORANGE',
  'MOBILE_MONEY_MTN',
  'MOBILE_MONEY_WAVE',
  'MOBILE_MONEY_MPESA',
  'MOBILE_MONEY_MOOV',
  'CARD',
  'WALLET',
  'BANK_TRANSFER',
]);

// Payment status enum
export const paymentStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'PAID',
  'PARTIAL',
  'FAILED',
  'REFUNDED',
  'CANCELLED',
]);

// Mobile money providers
export const mobileMoneyProviderSchema = z.enum([
  'ORANGE',
  'MTN',
  'WAVE',
  'MPESA',
  'MOOV',
  'AIRTEL',
  'FREE',
]);

// Create payment schema
export const createPaymentSchema = z.object({
  orderId: z.string().min(1, 'La commande est requise'),
  amount: z.number().positive('Le montant doit etre positif'),
  currency: z.string().length(3, 'Code devise invalide').default('XOF'),
  method: paymentMethodSchema,
  phoneNumber: z.string().min(8, 'Numero de telephone invalide').optional(),
  customerEmail: z.string().email('Email invalide').optional(),
  metadata: z.record(z.string(), z.any()).optional(),
}).refine(
  (data) => {
    // Phone number required for mobile money payments
    if (data.method.startsWith('MOBILE_MONEY_') && !data.phoneNumber) {
      return false;
    }
    return true;
  },
  { message: 'Le numero de telephone est requis pour les paiements Mobile Money', path: ['phoneNumber'] }
);

// Mobile money payment schema
export const mobileMoneyPaymentSchema = z.object({
  orderId: z.string().min(1, 'La commande est requise'),
  amount: z.number().positive('Le montant doit etre positif'),
  provider: mobileMoneyProviderSchema,
  phoneNumber: z.string().min(8, 'Numero de telephone invalide'),
  currency: z.string().length(3).default('XOF'),
  callbackUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Payment confirmation schema
export const paymentConfirmationSchema = z.object({
  paymentId: z.string().min(1, 'L\'ID du paiement est requis'),
  transactionId: z.string().min(1, 'L\'ID de transaction est requis'),
  status: paymentStatusSchema,
  providerReference: z.string().optional(),
  amount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  paidAt: z.string().datetime().or(z.date()).optional(),
  failureReason: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Payment webhook schema (for Mobile Money callbacks)
export const paymentWebhookSchema = z.object({
  transactionId: z.string().min(1),
  status: z.enum(['success', 'failed', 'pending', 'cancelled']),
  amount: z.number().positive(),
  currency: z.string().length(3),
  phoneNumber: z.string().optional(),
  providerReference: z.string().optional(),
  timestamp: z.string().datetime().or(z.date()),
  signature: z.string().optional(), // For webhook verification
  metadata: z.record(z.string(), z.any()).optional(),
});

// Refund schema
export const refundSchema = z.object({
  paymentId: z.string().min(1, 'L\'ID du paiement est requis'),
  amount: z.number().positive('Le montant doit etre positif').optional(),
  reason: z.string().min(10, 'La raison doit contenir au moins 10 caracteres').max(500),
  fullRefund: z.boolean().default(false),
});

// Payment filter schema
export const paymentFilterSchema = z.object({
  orderId: z.string().optional(),
  organizationId: z.string().optional(),
  status: paymentStatusSchema.optional(),
  method: paymentMethodSchema.optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Orange Money specific schema
export const orangeMoneyPaymentSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive(),
  phoneNumber: z.string().regex(/^(\+225|225)?[0-9]{8,10}$/, 'Numero Orange Money invalide'),
  currency: z.string().default('XOF'),
});

// MTN MoMo specific schema
export const mtnMomoPaymentSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive(),
  phoneNumber: z.string().regex(/^(\+225|225)?[0-9]{8,10}$/, 'Numero MTN invalide'),
  currency: z.string().default('XOF'),
});

// Wave specific schema
export const wavePaymentSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive(),
  phoneNumber: z.string().regex(/^(\+221|221)?[0-9]{9}$/, 'Numero Wave invalide'),
  currency: z.string().default('XOF'),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type MobileMoneyPaymentInput = z.infer<typeof mobileMoneyPaymentSchema>;
export type PaymentConfirmationInput = z.infer<typeof paymentConfirmationSchema>;
export type PaymentWebhookInput = z.infer<typeof paymentWebhookSchema>;
export type RefundInput = z.infer<typeof refundSchema>;
export type PaymentFilterInput = z.infer<typeof paymentFilterSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type MobileMoneyProvider = z.infer<typeof mobileMoneyProviderSchema>;
