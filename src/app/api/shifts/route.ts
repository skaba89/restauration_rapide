// ============================================
// Shifts API - Shift Templates
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { z } from 'zod';

// Demo shift templates
const DEMO_SHIFT_TEMPLATES = [
  { id: 'st1', name: 'Matin Cuisine', role: 'cook', startTime: '06:00', endTime: '14:00', breakDuration: 30, color: '#FFA500', daysOfWeek: [1, 2, 3, 4, 5] },
  { id: 'st2', name: 'Soir Cuisine', role: 'cook', startTime: '14:00', endTime: '22:00', breakDuration: 30, color: '#FF8C00', daysOfWeek: [1, 2, 3, 4, 5] },
  { id: 'st3', name: 'Service Déjeuner', role: 'waiter', startTime: '11:00', endTime: '15:00', breakDuration: 15, color: '#4CAF50', daysOfWeek: [1, 2, 3, 4, 5, 6, 0] },
  { id: 'st4', name: 'Service Dîner', role: 'waiter', startTime: '18:00', endTime: '23:00', breakDuration: 30, color: '#45a049', daysOfWeek: [4, 5, 6] },
  { id: 'st5', name: 'Livraison Jour', role: 'delivery_driver', startTime: '10:00', endTime: '16:00', breakDuration: 30, color: '#2196F3', daysOfWeek: [1, 2, 3, 4, 5] },
  { id: 'st6', name: 'Livraison Soir', role: 'delivery_driver', startTime: '17:00', endTime: '23:00', breakDuration: 30, color: '#1976D2', daysOfWeek: [4, 5, 6] },
  { id: 'st7', name: 'Bar Evening', role: 'waiter', startTime: '17:00', endTime: '01:00', breakDuration: 45, color: '#9C27B0', daysOfWeek: [4, 5, 6] },
  { id: 'st8', name: 'Caissier Journée', role: 'cashier', startTime: '08:00', endTime: '16:00', breakDuration: 30, color: '#10B981', daysOfWeek: [1, 2, 3, 4, 5] },
  { id: 'st9', name: 'Chef Matin', role: 'chef', startTime: '06:00', endTime: '14:00', breakDuration: 30, color: '#EF4444', daysOfWeek: [1, 2, 3, 4, 5, 6] },
  { id: 'st10', name: 'Chef Soir', role: 'chef', startTime: '10:00', endTime: '22:00', breakDuration: 45, color: '#DC2626', daysOfWeek: [4, 5, 6, 0] },
  { id: 'st11', name: 'Manager Journée', role: 'manager', startTime: '08:00', endTime: '17:00', breakDuration: 60, color: '#8B5CF6', daysOfWeek: [1, 2, 3, 4, 5] },
  { id: 'st12', name: 'Ménage Matin', role: 'cleaner', startTime: '06:00', endTime: '10:00', breakDuration: 0, color: '#6B7280', daysOfWeek: [1, 2, 3, 4, 5, 6] },
];

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
  const demo = searchParams.get('demo') === 'true';
  const organizationId = searchParams.get('organizationId') || '';
  const role = searchParams.get('role');

  // Demo mode
  if (demo || !organizationId) {
    let templates = [...DEMO_SHIFT_TEMPLATES];

    if (role && role !== 'all') {
      templates = templates.filter(t => t.role === role);
    }

    return apiSuccess({
      templates: templates.map(t => ({
        ...t,
        roleLabel: ROLE_LABELS[t.role] || t.role,
        dayLabels: t.daysOfWeek.map(d => DAY_LABELS[d]),
        hoursPerShift: calculateShiftHours(t.startTime, t.endTime, t.breakDuration),
      })),
    });
  }

  // For real implementation, you would fetch from database
  // For now, return demo data
  return apiSuccess({
    templates: DEMO_SHIFT_TEMPLATES.map(t => ({
      ...t,
      roleLabel: ROLE_LABELS[t.role] || t.role,
      dayLabels: t.daysOfWeek.map(d => DAY_LABELS[d]),
      hoursPerShift: calculateShiftHours(t.startTime, t.endTime, t.breakDuration),
    })),
  });
});

// POST - Create shift template
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const demo = body.demo === true;
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

  // Demo mode
  if (demo || !organizationId) {
    const newTemplate = {
      id: `st${Date.now()}`,
      ...data,
      color: data.color || getDefaultColor(data.role),
      daysOfWeek: data.daysOfWeek || [1, 2, 3, 4, 5],
    };

    return apiSuccess({
      template: {
        ...newTemplate,
        roleLabel: ROLE_LABELS[newTemplate.role] || newTemplate.role,
        dayLabels: newTemplate.daysOfWeek.map(d => DAY_LABELS[d]),
        hoursPerShift: calculateShiftHours(newTemplate.startTime, newTemplate.endTime, newTemplate.breakDuration),
      },
      message: 'Modèle de shift créé (mode démo)',
    });
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
