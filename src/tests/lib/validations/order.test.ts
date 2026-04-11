import { describe, it, expect } from 'vitest';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderFilterSchema,
  orderItemSchema,
  orderStatusSchema,
  orderTypeSchema,
} from '@/lib/validations/order';

describe('Order Validations', () => {
  describe('orderItemSchema', () => {
    it('should validate order item', () => {
      const result = orderItemSchema.safeParse({
        itemName: 'Attieke Poisson',
        quantity: 2,
        unitPrice: 3500,
      });

      expect(result.success).toBe(true);
    });

    it('should reject zero quantity', () => {
      const result = orderItemSchema.safeParse({
        itemName: 'Attieke Poisson',
        quantity: 0,
        unitPrice: 3500,
      });

      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const result = orderItemSchema.safeParse({
        itemName: 'Attieke Poisson',
        quantity: 1,
        unitPrice: -100,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('createOrderSchema', () => {
    const validOrder = {
      restaurantId: 'rest-123',
      customerName: 'Kouame Jean',
      customerPhone: '+2250700000001',
      orderType: 'DELIVERY',
      items: [
        { itemName: 'Attieke Poisson', quantity: 2, unitPrice: 3500 },
      ],
      deliveryAddress: 'Cocody, Abidjan',
    };

    it('should validate delivery order with address', () => {
      const result = createOrderSchema.safeParse(validOrder);
      expect(result.success).toBe(true);
    });

    it('should validate dine-in order without address', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        orderType: 'DINE_IN',
        tableNumber: 'T5',
        deliveryAddress: undefined,
      });

      expect(result.success).toBe(true);
    });

    it('should reject delivery order without address', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        deliveryAddress: undefined,
      });

      expect(result.success).toBe(false);
    });

    it('should reject empty items array', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        items: [],
      });

      expect(result.success).toBe(false);
    });

    it('should validate takeaway order', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        orderType: 'TAKEAWAY',
        deliveryAddress: undefined,
      });

      expect(result.success).toBe(true);
    });

    it('should validate with scheduled time', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        scheduledAt: new Date(Date.now() + 3600000).toISOString(),
        asap: false,
      });

      expect(result.success).toBe(true);
    });

    it('should validate with discount code', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        discount: 500,
        discountCode: 'PROMO10',
      });

      expect(result.success).toBe(true);
    });

    it('should validate with payment method', () => {
      const result = createOrderSchema.safeParse({
        ...validOrder,
        paymentMethod: 'MOBILE_MONEY_ORANGE',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('updateOrderStatusSchema', () => {
    it('should validate status update', () => {
      const result = updateOrderStatusSchema.safeParse({
        id: 'order-123',
        status: 'CONFIRMED',
      });

      expect(result.success).toBe(true);
    });

    it('should validate cancellation with reason', () => {
      const result = updateOrderStatusSchema.safeParse({
        id: 'order-123',
        status: 'CANCELLED',
        cancellationReason: 'Client injoignable',
      });

      expect(result.success).toBe(true);
    });

    it('should validate payment status update', () => {
      const result = updateOrderStatusSchema.safeParse({
        id: 'order-123',
        paymentStatus: 'PAID',
      });

      expect(result.success).toBe(true);
    });

    it('should require id', () => {
      const result = updateOrderStatusSchema.safeParse({
        status: 'CONFIRMED',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('orderFilterSchema', () => {
    it('should parse pagination params', () => {
      const result = orderFilterSchema.safeParse({
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
      const result = orderFilterSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should limit max page size', () => {
      const result = orderFilterSchema.safeParse({
        limit: '500',
      });

      expect(result.success).toBe(false);
    });

    it('should validate date filters', () => {
      const result = orderFilterSchema.safeParse({
        dateFrom: '2024-01-01T00:00:00.000Z',
        dateTo: '2024-12-31T23:59:59.000Z',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('orderStatusSchema', () => {
    it('should accept valid statuses', () => {
      const validStatuses = [
        'PENDING',
        'CONFIRMED',
        'PREPARING',
        'READY',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED',
        'REFUNDED',
      ];

      validStatuses.forEach((status) => {
        const result = orderStatusSchema.safeParse(status);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('orderTypeSchema', () => {
    it('should accept valid types', () => {
      const validTypes = ['DINE_IN', 'TAKEAWAY', 'DELIVERY', 'DRIVE_THRU'];

      validTypes.forEach((type) => {
        const result = orderTypeSchema.safeParse(type);
        expect(result.success).toBe(true);
      });
    });
  });
});
