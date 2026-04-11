import { z } from 'zod';

// Order status enum
export const orderStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED',
]);

// Payment status enum
export const paymentStatusSchema = z.enum([
  'PENDING',
  'PARTIAL',
  'PAID',
  'REFUNDED',
  'FAILED',
]);

// Order type enum
export const orderTypeSchema = z.enum([
  'DINE_IN',
  'TAKEAWAY',
  'DELIVERY',
  'DRIVE_THRU',
]);

// Order item schema
export const orderItemSchema = z.object({
  menuItemId: z.string().optional(),
  itemName: z.string().min(1, 'Le nom de l\'article est requis'),
  itemImage: z.string().url().optional(),
  quantity: z.number().int().positive('La quantite doit etre positive'),
  unitPrice: z.number().positive('Le prix unitaire doit etre positif'),
  variantId: z.string().optional(),
  variantName: z.string().optional(),
  options: z.string().optional(), // JSON string
  notes: z.string().max(500, 'Les notes ne peuvent pas depasser 500 caracteres').optional(),
});

// Create order schema
export const createOrderSchema = z.object({
  restaurantId: z.string().min(1, 'Le restaurant est requis'),
  customerId: z.string().optional(),
  customerName: z.string().min(2, 'Le nom du client est requis'),
  customerPhone: z.string().min(8, 'Numero de telephone invalide'),
  customerEmail: z.string().email('Email invalide').optional(),
  orderType: orderTypeSchema.default('DELIVERY'),
  source: z.string().default('web'),
  tableId: z.string().optional(),
  tableNumber: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'Au moins un article est requis'),
  deliveryAddress: z.string().optional(),
  deliveryCity: z.string().optional(),
  deliveryDistrict: z.string().optional(),
  deliveryLandmark: z.string().optional(),
  deliveryLat: z.number().optional(),
  deliveryLng: z.number().optional(),
  deliveryNotes: z.string().max(500).optional(),
  deliveryFee: z.number().min(0).default(0),
  scheduledAt: z.string().datetime().optional(),
  asap: z.boolean().default(true),
  discount: z.number().min(0).default(0),
  discountCode: z.string().optional(),
  notes: z.string().max(1000).optional(),
  paymentMethod: z.enum([
    'CASH',
    'MOBILE_MONEY_ORANGE',
    'MOBILE_MONEY_MTN',
    'MOBILE_MONEY_WAVE',
    'MOBILE_MONEY_MPESA',
    'MOBILE_MONEY_MOOV',
    'CARD',
    'WALLET',
  ]).optional(),
  loyaltyPointsUsed: z.number().int().min(0).default(0),
}).refine(
  (data) => {
    if (data.orderType === 'DELIVERY' && !data.deliveryAddress) {
      return false;
    }
    return true;
  },
  { message: 'L\'adresse de livraison est requise pour les commandes en livraison', path: ['deliveryAddress'] }
);

// Update order status schema
export const updateOrderStatusSchema = z.object({
  id: z.string().min(1, 'L\'ID est requis'),
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  internalNotes: z.string().max(1000).optional(),
  cancellationReason: z.string().max(500).optional(),
});

// Order filter schema for queries
export const orderFilterSchema = z.object({
  restaurantId: z.string().optional(),
  organizationId: z.string().optional(),
  status: orderStatusSchema.optional(),
  customerId: z.string().optional(),
  orderType: orderTypeSchema.optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(),
  demo: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderFilterInput = z.infer<typeof orderFilterSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderType = z.infer<typeof orderTypeSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
