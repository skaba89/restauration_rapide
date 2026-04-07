import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';

// Demo data for compliance
const DEMO_CHECKLISTS = [
  {
    id: 'cl-001',
    type: 'checklist',
    checklistType: 'opening',
    date: new Date().toISOString(),
    data: {
      items: [
        { id: '1', category: 'Cuisine', task: 'Vérifier température des frigos', completed: true, completedAt: new Date().toISOString(), completedBy: 'Fatoumata S.' },
        { id: '2', category: 'Cuisine', task: 'Allumer les équipements de cuisson', completed: true, completedAt: new Date().toISOString(), completedBy: 'Fatoumata S.' },
        { id: '3', category: 'Cuisine', task: 'Vérifier les stocks de produits frais', completed: false },
        { id: '4', category: 'Salle', task: 'Nettoyer et préparer les tables', completed: true, completedAt: new Date().toISOString(), completedBy: 'Aïssata T.' },
        { id: '5', category: 'Salle', task: 'Vérifier la propreté des sols', completed: true, completedAt: new Date().toISOString(), completedBy: 'Aïssata T.' },
        { id: '6', category: 'Hygiène', task: 'Vérifier les distributeurs de savon', completed: true, completedAt: new Date().toISOString(), completedBy: 'Moussa B.' },
        { id: '7', category: 'Hygiène', task: 'Remplir les distributeurs d\'essuie-mains', completed: false },
      ],
    },
    completedBy: 'Fatoumata S.',
    status: 'pending',
    notes: 'Ouverture du jour - 8h00',
  },
  {
    id: 'cl-002',
    type: 'checklist',
    checklistType: 'closing',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    data: {
      items: [
        { id: '1', category: 'Cuisine', task: 'Éteindre les équipements de cuisson', completed: true, completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), completedBy: 'Ibrahim K.' },
        { id: '2', category: 'Cuisine', task: 'Ranger les denrées alimentaires', completed: true, completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), completedBy: 'Ibrahim K.' },
        { id: '3', category: 'Cuisine', task: 'Nettoyer les plans de travail', completed: true, completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), completedBy: 'Ibrahim K.' },
        { id: '4', category: 'Salle', task: 'Nettoyer les tables et chaises', completed: true, completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), completedBy: 'Aïssata T.' },
        { id: '5', category: 'Salle', task: 'Balayer et laver les sols', completed: true, completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), completedBy: 'Seydou K.' },
        { id: '6', category: 'Sécurité', task: 'Vérifier les fermetures (portes, fenêtres)', completed: true, completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), completedBy: 'Ibrahim K.' },
      ],
    },
    completedBy: 'Ibrahim K.',
    signature: 'signature_closing_001',
    status: 'completed',
  },
  {
    id: 'cl-003',
    type: 'checklist',
    checklistType: 'weekly_cleaning',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    data: {
      items: [
        { id: '1', category: 'Cuisine', task: 'Nettoyage en profondeur des frigos', completed: true, completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), completedBy: 'Fatoumata S.' },
        { id: '2', category: 'Cuisine', task: 'Nettoyage des hottes et filtres', completed: true, completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), completedBy: 'Ibrahim K.' },
        { id: '3', category: 'Cuisine', task: 'Détartrer la machine à café', completed: true, completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), completedBy: 'Moussa B.' },
        { id: '4', category: 'Salle', task: 'Nettoyage des vitres', completed: true, completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), completedBy: 'Aïssata T.' },
        { id: '5', category: 'Salle', task: 'Nettoyage des stores/rideaux', completed: false },
        { id: '6', category: 'Extérieur', task: 'Nettoyage terrasse', completed: true, completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), completedBy: 'Seydou K.' },
        { id: '7', category: 'Extérieur', task: 'Nettoyage des poubelles', completed: true, completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), completedBy: 'Seydou K.' },
      ],
    },
    completedBy: 'Fatoumata S.',
    status: 'completed',
    notes: 'Nettoyage hebdomadaire effectué',
  },
];

const DEMO_TEMPERATURE_LOGS = [
  // Today's logs
  { id: 'temp-001', equipmentId: 'fridge-1', equipmentName: 'Frigo Principal', temperature: 3.5, recordedAt: new Date().toISOString(), recordedBy: 'Fatoumata S.', status: 'normal' },
  { id: 'temp-002', equipmentId: 'fridge-2', equipmentName: 'Frigo Boissons', temperature: 4.2, recordedAt: new Date().toISOString(), recordedBy: 'Fatoumata S.', status: 'normal' },
  { id: 'temp-003', equipmentId: 'fridge-3', equipmentName: 'Frigo Légumes', temperature: 5.2, recordedAt: new Date().toISOString(), recordedBy: 'Fatoumata S.', status: 'warning' },
  { id: 'temp-004', equipmentId: 'freezer-1', equipmentName: 'Congélateur Principal', temperature: -18.5, recordedAt: new Date().toISOString(), recordedBy: 'Fatoumata S.', status: 'normal' },
  { id: 'temp-005', equipmentId: 'freezer-2', equipmentName: 'Congélateur Glaces', temperature: -22.0, recordedAt: new Date().toISOString(), recordedBy: 'Fatoumata S.', status: 'normal' },
  // Yesterday's logs
  { id: 'temp-006', equipmentId: 'fridge-1', equipmentName: 'Frigo Principal', temperature: 4.0, recordedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), recordedBy: 'Ibrahim K.', status: 'normal' },
  { id: 'temp-007', equipmentId: 'fridge-2', equipmentName: 'Frigo Boissons', temperature: 4.8, recordedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), recordedBy: 'Ibrahim K.', status: 'normal' },
  { id: 'temp-008', equipmentId: 'fridge-3', equipmentName: 'Frigo Légumes', temperature: 3.8, recordedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), recordedBy: 'Ibrahim K.', status: 'normal' },
  { id: 'temp-009', equipmentId: 'freezer-1', equipmentName: 'Congélateur Principal', temperature: -19.0, recordedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), recordedBy: 'Ibrahim K.', status: 'normal' },
  { id: 'temp-010', equipmentId: 'freezer-2', equipmentName: 'Congélateur Glaces', temperature: -21.5, recordedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), recordedBy: 'Ibrahim K.', status: 'normal' },
  // 2 days ago
  { id: 'temp-011', equipmentId: 'fridge-1', equipmentName: 'Frigo Principal', temperature: 3.8, recordedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), recordedBy: 'Moussa B.', status: 'normal' },
  { id: 'temp-012', equipmentId: 'fridge-2', equipmentName: 'Frigo Boissons', temperature: 6.5, recordedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), recordedBy: 'Moussa B.', status: 'critical' },
  { id: 'temp-013', equipmentId: 'freezer-1', equipmentName: 'Congélateur Principal', temperature: -14.0, recordedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), recordedBy: 'Moussa B.', status: 'critical' },
  // 3 days ago
  { id: 'temp-014', equipmentId: 'fridge-1', equipmentName: 'Frigo Principal', temperature: 4.1, recordedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), recordedBy: 'Fatoumata S.', status: 'normal' },
  { id: 'temp-015', equipmentId: 'freezer-1', equipmentName: 'Congélateur Principal', temperature: -18.8, recordedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), recordedBy: 'Fatoumata S.', status: 'normal' },
];

const DEMO_CLEANING_SCHEDULE = [
  { id: 'clean-001', area: 'Cuisine', task: 'Nettoyage sol profond', frequency: 'weekly', nextDue: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), assignedTo: 'Fatoumata S.', lastCompleted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'upcoming' },
  { id: 'clean-002', area: 'Salle', task: 'Nettoyage sols et tables', frequency: 'daily', nextDue: new Date().toISOString(), assignedTo: 'Aïssata T.', lastCompleted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' },
  { id: 'clean-003', area: 'Toilettes', task: 'Désinfection complète', frequency: 'daily', nextDue: new Date().toISOString(), assignedTo: 'Moussa B.', lastCompleted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' },
  { id: 'clean-004', area: 'Extérieur', task: 'Nettoyage terrasse', frequency: 'weekly', nextDue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), assignedTo: 'Seydou K.', lastCompleted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'upcoming' },
  { id: 'clean-005', area: 'Cuisine', task: 'Nettoyage hottes', frequency: 'weekly', nextDue: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), assignedTo: 'Ibrahim K.', lastCompleted: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), status: 'overdue' },
  { id: 'clean-006', area: 'Réserve', task: 'Organisation et nettoyage', frequency: 'biweekly', nextDue: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), assignedTo: 'Fatoumata S.', lastCompleted: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), status: 'upcoming' },
];

const DEMO_INSPECTIONS = [
  { id: 'insp-001', type: 'hygiene', scheduledAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), inspector: 'Direction de l\'Hygiène', status: 'scheduled', notes: 'Inspection annuelle d\'hygiène' },
  { id: 'insp-002', type: 'fire_safety', scheduledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), inspector: 'Pompiers de Conakry', status: 'scheduled', notes: 'Contrôle sécurité incendie' },
  { id: 'insp-003', type: 'hygiene', scheduledAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), inspector: 'Direction de l\'Hygiène', status: 'completed', result: 'passed', score: 92, notes: 'Excellent niveau d\'hygiène' },
  { id: 'insp-004', type: 'health', scheduledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), inspector: 'Services Sanitaires', status: 'completed', result: 'passed', score: 88, notes: 'Quelques points à améliorer dans la réserve' },
  { id: 'insp-005', type: 'hygiene', scheduledAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), inspector: 'Direction de l\'Hygiène', status: 'completed', result: 'conditional', score: 75, notes: 'Amélioration nécessaire du système de ventilation' },
];

const DEMO_CERTIFICATES = [
  { id: 'cert-001', name: 'Certificat d\'Hygiène', expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), status: 'valid' },
  { id: 'cert-002', name: 'Licence d\'Exploitation', expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), status: 'expiring_soon' },
  { id: 'cert-003', name: 'Certificat Incendie', expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), status: 'expiring_soon' },
  { id: 'cert-004', name: 'Formation HACCP', expiryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), status: 'expired' },
];

// Helper function to determine temperature status
function getTemperatureStatus(temperature: number, equipmentType: string): 'normal' | 'warning' | 'critical' {
  if (equipmentType.includes('fridge') || equipmentType.includes('Frigo')) {
    if (temperature >= 0 && temperature <= 4) return 'normal';
    if (temperature > 4 && temperature <= 5) return 'warning';
    return 'critical';
  } else {
    // Freezer
    if (temperature <= -18) return 'normal';
    if (temperature > -18 && temperature <= -15) return 'warning';
    return 'critical';
  }
}

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const demo = searchParams.get('demo') === 'true';

  if (demo || !process.env.DATABASE_URL) {
    // Return demo data
    switch (type) {
      case 'checklists':
        return NextResponse.json({ success: true, data: DEMO_CHECKLISTS });
      case 'temperatures':
        return NextResponse.json({ success: true, data: DEMO_TEMPERATURE_LOGS });
      case 'cleaning':
        return NextResponse.json({ success: true, data: DEMO_CLEANING_SCHEDULE });
      case 'inspections':
        return NextResponse.json({ success: true, data: DEMO_INSPECTIONS });
      case 'certificates':
        return NextResponse.json({ success: true, data: DEMO_CERTIFICATES });
      case 'stats':
        const totalTempLogs = DEMO_TEMPERATURE_LOGS.length;
        const alertCount = DEMO_TEMPERATURE_LOGS.filter(t => t.status !== 'normal').length;
        const totalCleaningTasks = DEMO_CLEANING_SCHEDULE.length;
        const overdueTasks = DEMO_CLEANING_SCHEDULE.filter(c => c.status === 'overdue').length;
        const upcomingInspections = DEMO_INSPECTIONS.filter(i => i.status === 'scheduled').length;
        const expiringCerts = DEMO_CERTIFICATES.filter(c => c.status === 'expiring_soon' || c.status === 'expired').length;
        
        return NextResponse.json({
          success: true,
          data: {
            checklistsCount: DEMO_CHECKLISTS.length,
            temperatureLogsCount: totalTempLogs,
            temperatureAlerts: alertCount,
            cleaningTasksCount: totalCleaningTasks,
            overdueCleaningTasks: overdueTasks,
            upcomingInspections,
            expiringCertificates: expiringCerts,
          },
        });
      default:
        return NextResponse.json({
          success: true,
          data: {
            checklists: DEMO_CHECKLISTS,
            temperatures: DEMO_TEMPERATURE_LOGS,
            cleaning: DEMO_CLEANING_SCHEDULE,
            inspections: DEMO_INSPECTIONS,
            certificates: DEMO_CERTIFICATES,
          },
        });
    }
  }

  // Real database implementation would go here
  return NextResponse.json({ success: true, data: [] });
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { type, data } = body;

  // Demo mode - just return success with generated ID
  const newId = `new-${Date.now()}`;

  switch (type) {
    case 'checklist':
      return NextResponse.json({
        success: true,
        data: {
          id: newId,
          ...data,
          createdAt: new Date().toISOString(),
        },
      });
    case 'temperature':
      const status = getTemperatureStatus(data.temperature, data.equipmentName || 'fridge');
      return NextResponse.json({
        success: true,
        data: {
          id: newId,
          ...data,
          status,
          recordedAt: new Date().toISOString(),
        },
      });
    case 'cleaning':
      return NextResponse.json({
        success: true,
        data: {
          id: newId,
          ...data,
          createdAt: new Date().toISOString(),
        },
      });
    case 'inspection':
      return NextResponse.json({
        success: true,
        data: {
          id: newId,
          ...data,
          createdAt: new Date().toISOString(),
        },
      });
    default:
      return NextResponse.json({ success: false, error: 'Type non supporté' }, { status: 400 });
  }
});

export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { id, type, data } = body;

  // Demo mode - just return success
  return NextResponse.json({
    success: true,
    data: {
      id,
      ...data,
      updatedAt: new Date().toISOString(),
    },
  });
});
