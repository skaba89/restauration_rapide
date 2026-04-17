// ============================================
// Shifts API - Shift Templates
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { z } from 'zod';

// Role labels
const ROLE_LABELS: Record<string, string> = {
  manager: 'Directeur',
  chef: 'Chef Cuisinier',
  cook: 'Cuisinier',
  waiter: 'Serveur/Serveuse',
  cashier: 'Caissier(ère)',
  delivery_driver: 'Livreur',
  cleaner: 'Agent d\'entretien',
};

// Day labels
const DAY_LABELS: Record<number, string> = {
  0: 'Dimanche',
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
};

// Validation schema
const createShiftTemplateSchema = z.object({
  name: z.string().min(2, 'Le nom doit avoir au moins 2 caractères'),
  role: z.enum(['manager', 'chef', 'cook', 'waiter', 'cashier', 'delivery_driver', 'cleaner']),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  breakDuration: z.number().min(0).max(120),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
});

// GET - Get shift templates
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get('organizationId') || '';
  const role = searchParams.get('role');

  // For real implementation, you would fetch from database
  return apiSuccess({
    templates: [],
  });
});

// POST - Create shift template
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const organizationId = body.organizationId || '';

  const validated = createShiftTemplateSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const data = validated.data;

  // Validate time range
  if (data.startTime >= data.endTime) {
    return apiError('L\'heure de début doit être avant l\'heure de fin', 400);
  }

  // Real implementation would save to database
  return apiSuccess({
    template: {
      id: `st${Date.now()}`,
      ...data,
      color: data.color || getDefaultColor(data.role),
      daysOfWeek: data.daysOfWeek || [1, 2, 3, 4, 5],
      roleLabel: ROLE_LABELS[data.role] || data.role,
      dayLabels: (data.daysOfWeek || [1, 2, 3, 4, 5]).map(d => DAY_LABELS[d]),
      hoursPerShift: calculateShiftHours(data.startTime, data.endTime, data.breakDuration),
    },
    message: 'Modèle de shift créé avec succès',
  });
});

// Helper functions
function calculateShiftHours(start: string, end: string, breakMinutes: number): number {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  
  let hours = endH - startH + (endM - startM) / 60;
  
  // Handle overnight shifts
  if (hours < 0) {
    hours += 24;
  }
  
  return Math.round((hours - breakMinutes / 60) * 100) / 100;
}

function getDefaultColor(role: string): string {
  const colors: Record<string, string> = {
    manager: '#8B5CF6',
    chef: '#EF4444',
    cook: '#F97316',
    waiter: '#3B82F6',
    cashier: '#10B981',
    delivery_driver: '#F59E0B',
    cleaner: '#6B7280',
  };
  return colors[role] || '#6B7280';
}