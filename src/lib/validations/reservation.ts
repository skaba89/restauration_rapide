import { z } from 'zod';

// Reservation status enum
export const reservationStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'SEATED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);

// Waitlist status enum
export const waitlistStatusSchema = z.enum([
  'WAITING',
  'NOTIFIED',
  'SEATED',
  'CANCELLED',
  'EXPIRED',
  'CONVERTED',
]);

// Occasion enum
export const occasionSchema = z.enum([
  'birthday',
  'anniversary',
  'business',
  'date',
  'other',
]).optional();

// Time validation regex (HH:mm)
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Create reservation schema
export const createReservationSchema = z.object({
  restaurantId: z.string().min(1, 'Le restaurant est requis'),
  customerId: z.string().optional(),
  guestName: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres').max(100),
  guestPhone: z.string().min(8, 'Numero de telephone invalide'),
  guestEmail: z.string().email('Email invalide').optional(),
  partySize: z.number().int().min(1, 'Au moins 1 personne requise').max(50, 'Maximum 50 personnes'),
  date: z.string().datetime().or(z.date()),
  time: z.string().regex(timeRegex, 'Format d\'heure invalide (HH:mm)'),
  duration: z.number().int().min(30).max(300).default(120), // minutes
  tableIds: z.array(z.string()).optional(),
  source: z.enum(['web', 'phone', 'walkin', 'app']).default('web'),
  occasion: occasionSchema,
  specialRequests: z.string().max(1000).optional(),
  dietaryNotes: z.string().max(500).optional(),
  depositAmount: z.number().min(0).optional(),
}).refine(
  (data) => {
    const reservationDate = new Date(data.date);
    return reservationDate >= new Date();
  },
  { message: 'La date de reservation doit etre dans le futur', path: ['date'] }
);

// Update reservation schema
export const updateReservationSchema = z.object({
  id: z.string().min(1, 'L\'ID est requis'),
  status: reservationStatusSchema.optional(),
  partySize: z.number().int().min(1).max(50).optional(),
  date: z.string().datetime().or(z.date()).optional(),
  time: z.string().regex(timeRegex, 'Format d\'heure invalide').optional(),
  duration: z.number().int().min(30).max(300).optional(),
  tableIds: z.array(z.string()).optional(),
  internalNotes: z.string().max(1000).optional(),
  cancellationReason: z.string().max(500).optional(),
});

// Create waitlist entry schema
export const createWaitlistSchema = z.object({
  restaurantId: z.string().min(1, 'Le restaurant est requis'),
  customerId: z.string().optional(),
  guestName: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres').max(100),
  guestPhone: z.string().min(8, 'Numero de telephone invalide'),
  partySize: z.number().int().min(1).max(50),
  preferredArea: z.string().max(100).optional(),
  specialRequests: z.string().max(500).optional(),
  priority: z.number().int().min(0).max(10).default(0),
});

// Update waitlist schema
export const updateWaitlistSchema = z.object({
  id: z.string().min(1, 'L\'ID est requis'),
  status: waitlistStatusSchema.optional(),
  estimatedWait: z.number().int().positive().optional(), // minutes
  quotedWait: z.number().int().positive().optional(),
  tableIds: z.array(z.string()).optional(),
  internalNotes: z.string().max(500).optional(),
});

// Reservation filter schema
export const reservationFilterSchema = z.object({
  restaurantId: z.string().optional(),
  organizationId: z.string().optional(),
  status: reservationStatusSchema.optional(),
  customerId: z.string().optional(),
  date: z.string().datetime().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(),
  demo: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Availability check schema
export const checkAvailabilitySchema = z.object({
  restaurantId: z.string().min(1, 'Le restaurant est requis'),
  date: z.string().datetime().or(z.date()),
  time: z.string().regex(timeRegex, 'Format d\'heure invalide'),
  partySize: z.number().int().min(1).max(50),
  duration: z.number().int().min(30).max(300).default(120),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
export type CreateWaitlistInput = z.infer<typeof createWaitlistSchema>;
export type UpdateWaitlistInput = z.infer<typeof updateWaitlistSchema>;
export type ReservationFilterInput = z.infer<typeof reservationFilterSchema>;
export type CheckAvailabilityInput = z.infer<typeof checkAvailabilitySchema>;
export type ReservationStatus = z.infer<typeof reservationStatusSchema>;
export type WaitlistStatus = z.infer<typeof waitlistStatusSchema>;
