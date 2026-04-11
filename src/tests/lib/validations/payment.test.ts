import { describe, it, expect } from 'vitest';
import {
  createPaymentSchema,
  mobileMoneyPaymentSchema,
  paymentConfirmationSchema,
  paymentWebhookSchema,
  refundSchema,
  paymentFilterSchema,
  orangeMoneyPaymentSchema,
  mtnMomoPaymentSchema,
  wavePaymentSchema,
  paymentMethodSchema,
  paymentStatusSchema,
  mobileMoneyProviderSchema,
} from '@/lib/validations/payment';

describe('Payment Validations', () => {
  describe('paymentMethodSchema', () => {
    it('should accept valid payment methods', () => {
      const validMethods = [
        'CASH',
        'MOBILE_MONEY_ORANGE',
        'MOBILE_MONEY_MTN',
        'MOBILE_MONEY_WAVE',
        'MOBILE_MONEY_MPESA',
        'MOBILE_MONEY_MOOV',
        'CARD',
        'WALLET',
        'BANK_TRANSFER',
      ];

      validMethods.forEach((method) => {
        const result = paymentMethodSchema.safeParse(method);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid payment method', () => {
      const result = paymentMethodSchema.safeParse('INVALID_METHOD');
      expect(result.success).toBe(false);
    });
  });

  describe('paymentStatusSchema', () => {
    it('should accept valid statuses', () => {
      const validStatuses = [
        'PENDING',
        'PROCESSING',
        'PAID',
        'PARTIAL',
        'FAILED',
        'REFUNDED',
        'CANCELLED',
      ];

      validStatuses.forEach((status) => {
        const result = paymentStatusSchema.safeParse(status);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('mobileMoneyProviderSchema', () => {
    it('should accept valid providers', () => {
      const validProviders = [
        'ORANGE',
        'MTN',
        'WAVE',
        'MPESA',
        'MOOV',
        'AIRTEL',
        'FREE',
      ];

      validProviders.forEach((provider) => {
        const result = mobileMoneyProviderSchema.safeParse(provider);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('createPaymentSchema', () => {
    const validPayment = {
      orderId: 'order-123',
      amount: 5000,
      currency: 'XOF',
      method: 'MOBILE_MONEY_ORANGE' as const,
      phoneNumber: '+2250700000001',
    };

    it('should validate valid payment', () => {
      const result = createPaymentSchema.safeParse(validPayment);
      expect(result.success).toBe(true);
    });

    it('should reject payment without phone for mobile money', () => {
      const result = createPaymentSchema.safeParse({
        ...validPayment,
        phoneNumber: undefined,
      });

      expect(result.success).toBe(false);
    });

    it('should accept cash payment without phone', () => {
      const result = createPaymentSchema.safeParse({
        orderId: 'order-123',
        amount: 5000,
        currency: 'XOF',
        method: 'CASH',
      });

      expect(result.success).toBe(true);
    });

    it('should reject negative amount', () => {
      const result = createPaymentSchema.safeParse({
        ...validPayment,
        amount: -100,
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid currency code', () => {
      const result = createPaymentSchema.safeParse({
        ...validPayment,
        currency: 'INVALID',
      });

      expect(result.success).toBe(false);
    });

    it('should reject missing orderId', () => {
      const result = createPaymentSchema.safeParse({
        amount: 5000,
        method: 'CASH',
      });

      expect(result.success).toBe(false);
    });

    it('should accept card payment with email', () => {
      const result = createPaymentSchema.safeParse({
        orderId: 'order-123',
        amount: 10000,
        currency: 'XOF',
        method: 'CARD',
        customerEmail: 'customer@example.com',
      });

      expect(result.success).toBe(true);
    });

    it('should accept optional metadata', () => {
      const result = createPaymentSchema.safeParse({
        ...validPayment,
        metadata: {
          reference: 'REF-001',
          source: 'mobile_app',
        },
      });

      expect(result.success).toBe(true);
    });
  });

  describe('mobileMoneyPaymentSchema', () => {
    it('should validate mobile money payment', () => {
      const result = mobileMoneyPaymentSchema.safeParse({
        orderId: 'order-123',
        amount: 5000,
        provider: 'ORANGE',
        phoneNumber: '+2250700000001',
        currency: 'XOF',
      });

      expect(result.success).toBe(true);
    });

    it('should accept callback URL', () => {
      const result = mobileMoneyPaymentSchema.safeParse({
        orderId: 'order-123',
        amount: 5000,
        provider: 'MTN',
        phoneNumber: '+2250700000002',
        callbackUrl: 'https://example.com/webhook/mtn',
      });

      expect(result.success).toBe(true);
    });

    it('should reject missing phone number', () => {
      const result = mobileMoneyPaymentSchema.safeParse({
        orderId: 'order-123',
        amount: 5000,
        provider: 'WAVE',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('paymentConfirmationSchema', () => {
    it('should validate payment confirmation', () => {
      const result = paymentConfirmationSchema.safeParse({
        paymentId: 'pay-123',
        transactionId: 'txn-456',
        status: 'PAID',
      });

      expect(result.success).toBe(true);
    });

    it('should accept optional fields', () => {
      const result = paymentConfirmationSchema.safeParse({
        paymentId: 'pay-123',
        transactionId: 'txn-456',
        status: 'PAID',
        providerReference: 'provider-ref-789',
        amount: 5000,
        currency: 'XOF',
        paidAt: '2024-01-15T10:30:00.000Z',
      });

      expect(result.success).toBe(true);
    });

    it('should accept failure reason for failed payments', () => {
      const result = paymentConfirmationSchema.safeParse({
        paymentId: 'pay-123',
        transactionId: 'txn-456',
        status: 'FAILED',
        failureReason: 'Insufficient funds',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('paymentWebhookSchema', () => {
    it('should validate webhook payload', () => {
      const result = paymentWebhookSchema.safeParse({
        transactionId: 'txn-123',
        status: 'success',
        amount: 5000,
        currency: 'XOF',
        timestamp: '2024-01-15T10:30:00.000Z',
      });

      expect(result.success).toBe(true);
    });

    it('should accept optional phone and signature', () => {
      const result = paymentWebhookSchema.safeParse({
        transactionId: 'txn-123',
        status: 'failed',
        amount: 5000,
        currency: 'XOF',
        phoneNumber: '+2250700000001',
        providerReference: 'ref-456',
        timestamp: '2024-01-15T10:30:00.000Z',
        signature: 'abc123def456',
      });

      expect(result.success).toBe(true);
    });

    it('should accept all valid statuses', () => {
      const statuses = ['success', 'failed', 'pending', 'cancelled'] as const;
      
      statuses.forEach((status) => {
        const result = paymentWebhookSchema.safeParse({
          transactionId: 'txn-123',
          status,
          amount: 5000,
          currency: 'XOF',
          timestamp: '2024-01-15T10:30:00.000Z',
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject negative amount', () => {
      const result = paymentWebhookSchema.safeParse({
        transactionId: 'txn-123',
        status: 'success',
        amount: -100,
        currency: 'XOF',
        timestamp: '2024-01-15T10:30:00.000Z',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('refundSchema', () => {
    it('should validate full refund', () => {
      const result = refundSchema.safeParse({
        paymentId: 'pay-123',
        reason: 'Customer request - order cancelled',
        fullRefund: true,
      });

      expect(result.success).toBe(true);
    });

    it('should validate partial refund', () => {
      const result = refundSchema.safeParse({
        paymentId: 'pay-123',
        amount: 2500,
        reason: 'Partial refund for missing items',
        fullRefund: false,
      });

      expect(result.success).toBe(true);
    });

    it('should reject short reason', () => {
      const result = refundSchema.safeParse({
        paymentId: 'pay-123',
        reason: 'Too short',
        fullRefund: true,
      });

      expect(result.success).toBe(false);
    });

    it('should reject missing paymentId', () => {
      const result = refundSchema.safeParse({
        reason: 'Customer request for refund',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('paymentFilterSchema', () => {
    it('should parse pagination params', () => {
      const result = paymentFilterSchema.safeParse({
        page: '2',
        limit: '50',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(50);
      }
    });

    it('should use default pagination', () => {
      const result = paymentFilterSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should validate filter params', () => {
      const result = paymentFilterSchema.safeParse({
        orderId: 'order-123',
        organizationId: 'org-456',
        status: 'PAID',
        method: 'MOBILE_MONEY_ORANGE',
        dateFrom: '2024-01-01T00:00:00.000Z',
        dateTo: '2024-12-31T23:59:59.000Z',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('orangeMoneyPaymentSchema', () => {
    it('should validate Orange Money CI number', () => {
      const validNumbers = [
        '+2250700000001',
        '2250700000001',
        '0700000001',
        '+2250100000002',
      ];

      validNumbers.forEach((phone) => {
        const result = orangeMoneyPaymentSchema.safeParse({
          orderId: 'order-123',
          amount: 5000,
          phoneNumber: phone,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should default currency to XOF', () => {
      const result = orangeMoneyPaymentSchema.safeParse({
        orderId: 'order-123',
        amount: 5000,
        phoneNumber: '+2250700000001',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe('XOF');
      }
    });
  });

  describe('mtnMomoPaymentSchema', () => {
    it('should validate MTN CI number', () => {
      const result = mtnMomoPaymentSchema.safeParse({
        orderId: 'order-123',
        amount: 5000,
        phoneNumber: '+2250500000001',
        currency: 'XOF',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('wavePaymentSchema', () => {
    it('should validate Wave SN number', () => {
      const validNumbers = [
        '+221770000000',
        '221770000000',
        '770000000',
      ];

      validNumbers.forEach((phone) => {
        const result = wavePaymentSchema.safeParse({
          orderId: 'order-123',
          amount: 5000,
          phoneNumber: phone,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should default currency to XOF', () => {
      const result = wavePaymentSchema.safeParse({
        orderId: 'order-123',
        amount: 5000,
        phoneNumber: '+221770000000',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe('XOF');
      }
    });
  });
});
