// ============================================
// RESTAURANT OS - Delivery Validations
// Zod schemas for delivery operations
// ============================================

import { z } from 'zod';

// Delivery status enum validation
export const DeliveryStatusSchema = z.enum([
  'PENDING',
  'SEARCHING_DRIVER',
  'DRIVER_ASSIGNED',
  'DRIVER_ARRIVED_PICKUP',
  'PICKED_UP',
  'DRIVER_ARRIVED_DROPOFF',
  'DELIVERED',
  'FAILED',
  'CANCELLED',
  'RETURNED',
]);

export type DeliveryStatus = z.infer<typeof DeliveryStatusSchema>;

// Create delivery schema
export const CreateDeliverySchema = z.object({
  orderId: z.string().cuid('ID de commande invalide'),
  organizationId: z.string().cuid('ID organisation invalide').optional(),
  restaurantId: z.string().cuid('ID restaurant invalide'),
  customerName: z.string().min(2, 'Nom trop court').max(100, 'Nom trop long'),
  customerPhone: z.string().min(8, 'Numéro invalide').optional(),
  customerEmail: z.string().email('Email invalide').optional(),
  
  // Addresses
  pickupAddress: z.object({
    street: z.string().min(5, 'Adresse requise'),
    city: z.string().min(2, 'Ville requise'),
    district: z.string().optional(),
    landmark: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  dropoffAddress: z.object({
    street: z.string().min(5, 'Adresse requise'),
    city: z.string().min(2, 'Ville requise'),
    district: z.string().optional(),
    landmark: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  
  // Delivery details
  deliveryType: z.enum(['STANDARD', 'EXPRESS', 'SCHEDULED']).default('STANDARD'),
  scheduledAt: z.string().datetime().optional(),
  estimatedDuration: z.number().int().positive().optional(),
  distance: z.number().positive().optional(),
  
  // Pricing
  deliveryFee: z.number().nonnegative('Frais invalides').default(0),
  totalAmount: z.number().positive('Montant requis'),
  currency: z.string().length(3, 'Code devise invalide').default('GNF'),
  
  // Payment
  paymentMethod: z.enum(['CASH', 'MOBILE_MONEY_ORANGE', 'MOBILE_MONEY_MTN', 'WAVE', 'CARD']),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED']).default('PENDING'),
  
  // Driver
  driverId: z.string().cuid().optional(),
  driverInstructions: z.string().max(500).optional(),
  
  // Metadata
  notes: z.string().max(1000).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateDeliveryInput = z.infer<typeof CreateDeliverySchema>;

// Update delivery schema (partial)
export const UpdateDeliverySchema = CreateDeliverySchema.partial().extend({
  id: z.string().cuid('ID invalide'),
  status: DeliveryStatusSchema.optional(),
  driverId: z.string().cuid().nullable().optional(),
  
  // Tracking
  pickedUpAt: z.string().datetime().nullable().optional(),
  deliveredAt: z.string().datetime().nullable().optional(),
  cancelledAt: z.string().datetime().nullable().optional(),
  
  // Location updates
  currentLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
    updatedAt: z.string().datetime(),
  }).optional(),
});

export type UpdateDeliveryInput = z.infer<typeof UpdateDeliverySchema>;

// Delivery query params schema
export const DeliveryQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive().default(1)),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100).default(20)),
  organizationId: z.string().cuid().optional(),
  restaurantId: z.string().cuid().optional(),
  driverId: z.string().cuid().optional(),
  orderId: z.string().cuid().optional(),
  status: DeliveryStatusSchema.optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'status', 'totalAmount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type DeliveryQueryInput = z.infer<typeof DeliveryQuerySchema>;

// Helper function to validate delivery status transition
export function isValidStatusTransition(from: DeliveryStatus, to: DeliveryStatus): boolean {
  const validTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
    PENDING: ['SEARCHING_DRIVER', 'CANCELLED'],
    SEARCHING_DRIVER: ['DRIVER_ASSIGNED', 'CANCELLED'],
    DRIVER_ASSIGNED: ['DRIVER_ARRIVED_PICKUP', 'CANCELLED'],
    DRIVER_ARRIVED_PICKUP: ['PICKED_UP', 'CANCELLED'],
    PICKED_UP: ['DRIVER_ARRIVED_DROPOFF', 'FAILED'],
    DRIVER_ARRIVED_DROPOFF: ['DELIVERED', 'FAILED'],
    DELIVERED: ['RETURNED'],
    FAILED: [],
    CANCELLED: [],
    RETURNED: [],
  };

  return validTransitions[from]?.includes(to) || false;
}

// Helper function to get status display info
export function getStatusDisplayInfo(status: DeliveryStatus): {
  label: string;
  color: string;
  icon: string;
} {
  const statusInfo: Record<DeliveryStatus, { label: string; color: string; icon: string }> = {
    PENDING: { label: 'En attente', color: 'gray', icon: '⏳' },
    SEARCHING_DRIVER: { label: 'Recherche livreur', color: 'yellow', icon: '🔍' },
    DRIVER_ASSIGNED: { label: 'Livreur assigné', color: 'blue', icon: '👤' },
    DRIVER_ARRIVED_PICKUP: { label: 'Arrivé au restaurant', color: 'cyan', icon: '🏪' },
    PICKED_UP: { label: 'Commande récupérée', color: 'indigo', icon: '📦' },
    DRIVER_ARRIVED_DROPOFF: { label: 'Arrivé à destination', color: 'purple', icon: '🏠' },
    DELIVERED: { label: 'Livré', color: 'green', icon: '✅' },
    FAILED: { label: 'Échoué', color: 'red', icon: '❌' },
    CANCELLED: { label: 'Annulé', color: 'red', icon: '🚫' },
    RETURNED: { label: 'Retourné', color: 'orange', icon: '↩️' },
  };

  return statusInfo[status] || { label: status, color: 'gray', icon: '❓' };
}
