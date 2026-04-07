// ============================================
// Employment Contracts API - KFM DELICE
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler, getPagination } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { z } from 'zod';
import { getOrganizationCurrencyCode } from '@/lib/org-settings';

// Demo contracts data for KFM DELICE
const DEMO_CONTRACTS = [
  {
    id: '1',
    staffId: '1',
    staffName: 'Amadou Diallo',
    contractType: 'CDI',
    contractNumber: 'CTR-2024-001',
    title: 'Contrat CDI - Directeur',
    startDate: new Date('2022-01-15'),
    endDate: null,
    trialPeriodDays: 90,
    salary: 5000000,
    salaryType: 'monthly',
    currency: 'GNF',
    workingHoursPerWeek: 45,
    position: 'Directeur',
    department: 'Direction',
    benefits: JSON.stringify({ healthInsurance: true, transport: true, meals: true }),
    workingDays: JSON.stringify(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']),
    noticePeriodDays: 30,
    status: 'active',
    createdAt: new Date('2022-01-10'),
  },
  {
    id: '2',
    staffId: '2',
    staffName: 'Fatou Sylla',
    contractType: 'CDI',
    contractNumber: 'CTR-2024-002',
    title: 'Contrat CDI - Chef Cuisinier',
    startDate: new Date('2022-03-01'),
    endDate: null,
    trialPeriodDays: 60,
    salary: 4000000,
    salaryType: 'monthly',
    currency: 'GNF',
    workingHoursPerWeek: 48,
    position: 'Chef Cuisinier',
    department: 'Cuisine',
    benefits: JSON.stringify({ healthInsurance: true, meals: true }),
    workingDays: JSON.stringify(['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    noticePeriodDays: 30,
    status: 'active',
    createdAt: new Date('2022-02-25'),
  },
  {
    id: '3',
    staffId: '3',
    staffName: 'Ibrahim Keita',
    contractType: 'CDD',
    contractNumber: 'CTR-2024-003',
    title: 'Contrat CDD - Cuisinier (Saisonnier)',
    startDate: new Date('2023-01-10'),
    endDate: new Date('2024-12-31'),
    trialPeriodDays: 30,
    salary: 2500000,
    salaryType: 'monthly',
    currency: 'GNF',
    workingHoursPerWeek: 45,
    position: 'Cuisinier',
    department: 'Cuisine',
    benefits: JSON.stringify({ meals: true }),
    workingDays: JSON.stringify(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
    noticePeriodDays: 15,
    status: 'active',
    createdAt: new Date('2023-01-05'),
  },
  {
    id: '4',
    staffId: '4',
    staffName: 'Marie Koulibaly',
    contractType: 'CDI',
    contractNumber: 'CTR-2024-004',
    title: 'Contrat CDI - Serveuse',
    startDate: new Date('2023-06-15'),
    endDate: null,
    trialPeriodDays: 30,
    salary: 1500000,
    salaryType: 'monthly',
    currency: 'GNF',
    workingHoursPerWeek: 40,
    position: 'Serveuse',
    department: 'Service',
    benefits: JSON.stringify({ meals: true, tips: true }),
    workingDays: JSON.stringify(['wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    noticePeriodDays: 15,
    status: 'active',
    createdAt: new Date('2023-06-10'),
  },
  {
    id: '5',
    staffId: '5',
    staffName: 'Moussa Camara',
    contractType: 'CDD',
    contractNumber: 'CTR-2024-005',
    title: 'Contrat CDD - Livreur',
    startDate: new Date('2023-09-01'),
    endDate: new Date('2024-08-31'),
    trialPeriodDays: 14,
    salary: 1200000,
    salaryType: 'monthly',
    currency: 'GNF',
    workingHoursPerWeek: 44,
    position: 'Livreur',
    department: 'Livraison',
    benefits: JSON.stringify({ transport: true, meals: true }),
    workingDays: JSON.stringify(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']),
    noticePeriodDays: 7,
    status: 'active',
    createdAt: new Date('2023-08-28'),
  },
  {
    id: '6',
    staffId: '6',
    staffName: 'Aissatou Traore',
    contractType: 'CDI',
    contractNumber: 'CTR-2024-006',
    title: 'Contrat CDI - Caissière',
    startDate: new Date('2023-04-20'),
    endDate: null,
    trialPeriodDays: 30,
    salary: 1800000,
    salaryType: 'monthly',
    currency: 'GNF',
    workingHoursPerWeek: 40,
    position: 'Caissière',
    department: 'Administration',
    benefits: JSON.stringify({ healthInsurance: true, meals: true }),
    workingDays: JSON.stringify(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
    noticePeriodDays: 30,
    status: 'active',
    createdAt: new Date('2023-04-15'),
  },
  {
    id: '7',
    staffId: '7',
    staffName: 'Sekou Konate',
    contractType: 'CDI',
    contractNumber: 'CTR-2024-007',
    title: 'Contrat CDI - Cuisinier',
    startDate: new Date('2023-11-05'),
    endDate: null,
    trialPeriodDays: 30,
    salary: 2200000,
    salaryType: 'monthly',
    currency: 'GNF',
    workingHoursPerWeek: 45,
    position: 'Cuisinier',
    department: 'Cuisine',
    benefits: JSON.stringify({ meals: true }),
    workingDays: JSON.stringify(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
    noticePeriodDays: 15,
    status: 'terminated',
    terminationReason: 'Démission volontaire',
    terminationDate: new Date('2024-05-15'),
    createdAt: new Date('2023-11-01'),
  },
  {
    id: '8',
    staffId: '8',
    staffName: 'Fanta Diarra',
    contractType: 'Trial',
    contractNumber: 'CTR-2024-008',
    title: 'Période d\'essai - Serveuse',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-02-14'),
    trialPeriodDays: 30,
    salary: 1500000,
    salaryType: 'monthly',
    currency: 'GNF',
    workingHoursPerWeek: 40,
    position: 'Serveuse',
    department: 'Service',
    benefits: JSON.stringify({ meals: true }),
    workingDays: JSON.stringify(['wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    noticePeriodDays: 7,
    status: 'active',
    createdAt: new Date('2024-01-12'),
  },
  {
    id: '9',
    staffId: '9',
    staffName: 'Oumar Bah',
    contractType: 'CDI',
    contractNumber: 'CTR-2024-009',
    title: 'Contrat CDI - Agent d\'entretien',
    startDate: new Date('2024-02-01'),
    endDate: null,
    trialPeriodDays: 30,
    salary: 1000000,
    salaryType: 'monthly',
    currency: 'GNF',
    workingHoursPerWeek: 35,
    position: 'Agent d\'entretien',
    department: 'Entretien',
    benefits: JSON.stringify({ meals: true }),
    workingDays: JSON.stringify(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
    noticePeriodDays: 15,
    status: 'active',
    createdAt: new Date('2024-01-28'),
  },
  {
    id: '10',
    staffId: '10',
    staffName: 'Adama Sow',
    contractType: 'CDD',
    contractNumber: 'CTR-2024-010',
    title: 'Contrat CDD - Livreur',
    startDate: new Date('2024-03-10'),
    endDate: new Date('2024-06-10'),
    trialPeriodDays: 7,
    salary: 1200000,
    salaryType: 'monthly',
    currency: 'GNF',
    workingHoursPerWeek: 44,
    position: 'Livreur',
    department: 'Livraison',
    benefits: JSON.stringify({ transport: true, meals: true }),
    workingDays: JSON.stringify(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']),
    noticePeriodDays: 7,
    status: 'expired',
    createdAt: new Date('2024-03-08'),
  },
];

// Contract type labels
const CONTRACT_TYPE_LABELS: Record<string, string> = {
  CDI: 'CDI (Durée indéterminée)',
  CDD: 'CDD (Durée déterminée)',
  Seasonal: 'Saisonnier',
  Internship: 'Stage',
  Trial: 'Période d\'essai',
};

// Validation schema
const createContractSchema = z.object({
  staffId: z.string().min(1, 'ID employé requis'),
  contractType: z.enum(['CDI', 'CDD', 'Seasonal', 'Internship', 'Trial']),
  title: z.string().min(3, 'Titre requis'),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  trialPeriodDays: z.number().optional().nullable(),
  salary: z.number().min(0, 'Salaire invalide'),
  salaryType: z.enum(['hourly', 'daily', 'weekly', 'monthly']).default('monthly'),
  currency: z.string().default('GNF'),
  workingHoursPerWeek: z.number().optional().nullable(),
  position: z.string().min(1, 'Poste requis'),
  department: z.string().optional().nullable(),
  benefits: z.string().optional().nullable(),
  workingDays: z.string().optional().nullable(),
  noticePeriodDays: z.number().default(30),
  clauses: z.string().optional().nullable(),
});

// GET - List contracts with filters
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const demo = searchParams.get('demo') === 'true';
  const organizationId = searchParams.get('organizationId') || '';
  const staffId = searchParams.get('staffId');
  const status = searchParams.get('status');
  const contractType = searchParams.get('contractType');
  const { page, limit, skip } = getPagination(searchParams);

  // Return demo data
  if (demo || !organizationId) {
    let filteredContracts = [...DEMO_CONTRACTS];

    if (staffId) {
      filteredContracts = filteredContracts.filter(c => c.staffId === staffId);
    }
    if (status && status !== 'all') {
      filteredContracts = filteredContracts.filter(c => c.status === status);
    }
    if (contractType && contractType !== 'all') {
      filteredContracts = filteredContracts.filter(c => c.contractType === contractType);
    }

    const total = filteredContracts.length;
    const paginatedContracts = filteredContracts.slice(skip, skip + limit);

    return apiSuccess({
      contracts: paginatedContracts.map(c => ({
        ...c,
        contractTypeLabel: CONTRACT_TYPE_LABELS[c.contractType] || c.contractType,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }

  // Real database query
  try {
    const where: Record<string, unknown> = {};

    if (staffId) {
      where.staffId = staffId;
    }
    if (status && status !== 'all') {
      where.status = status;
    }
    if (contractType && contractType !== 'all') {
      where.contractType = contractType;
    }

    const [contracts, total] = await Promise.all([
      db.employmentContract.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          staff: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
      db.employmentContract.count({ where }),
    ]);

    return apiSuccess({
      contracts: contracts.map(c => ({
        ...c,
        staffName: `${c.staff.firstName} ${c.staff.lastName}`,
        contractTypeLabel: CONTRACT_TYPE_LABELS[c.contractType] || c.contractType,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return apiError('Erreur lors de la récupération des contrats', 500);
  }
});

// POST - Create new contract
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const demo = body.demo === true;
  const organizationId = body.organizationId || '';

  const validated = createContractSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const data = validated.data;

  // Generate contract number
  const contractNumber = `CTR-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;

  // Demo mode
  if (demo || !organizationId) {
    const newContract = {
      id: `${Date.now()}`,
      ...data,
      contractNumber,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      status: 'active',
      staffName: 'Nouvel employé',
      createdAt: new Date(),
    };
    return apiSuccess({
      contract: { ...newContract, contractTypeLabel: CONTRACT_TYPE_LABELS[data.contractType] || data.contractType },
      message: 'Contrat créé (mode démo)',
    });
  }

  // Real database creation
  try {
    // Get organization currency if not specified
    const currencyCode = data.currency || await getOrganizationCurrencyCode(organizationId);
    
    const contract = await db.employmentContract.create({
      data: {
        staffId: data.staffId,
        contractType: data.contractType,
        contractNumber,
        title: data.title,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        trialPeriodDays: data.trialPeriodDays || null,
        salary: data.salary,
        salaryType: data.salaryType,
        currency: currencyCode,
        workingHoursPerWeek: data.workingHoursPerWeek || null,
        position: data.position,
        department: data.department || null,
        benefits: data.benefits || null,
        workingDays: data.workingDays || null,
        noticePeriodDays: data.noticePeriodDays,
        clauses: data.clauses || null,
        status: 'active',
      },
      include: {
        staff: { select: { firstName: true, lastName: true } },
      },
    });

    return apiSuccess({
      contract: {
        ...contract,
        staffName: `${contract.staff.firstName} ${contract.staff.lastName}`,
        contractTypeLabel: CONTRACT_TYPE_LABELS[contract.contractType] || contract.contractType,
      },
      message: 'Contrat créé avec succès',
    });
  } catch (error: unknown) {
    console.error('Error creating contract:', error);
    const err = error as { code?: string };
    if (err.code === 'P2002') {
      return apiError('Un contrat avec ce numéro existe déjà', 400);
    }
    return apiError('Erreur lors de la création du contrat', 500);
  }
});

// PUT - Update contract (terminate, etc.)
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { id, demo, organizationId, action, ...updateData } = body;

  if (!id) {
    return apiError('ID du contrat requis', 400);
  }

  // Demo mode
  if (demo || !organizationId) {
    const existingContract = DEMO_CONTRACTS.find(c => c.id === id);
    if (!existingContract) {
      return apiError('Contrat non trouvé', 404);
    }

    let updatedContract = { ...existingContract };

    if (action === 'terminate') {
      updatedContract = {
        ...updatedContract,
        status: 'terminated',
        terminationReason: updateData.terminationReason || 'Non spécifié',
        terminationDate: new Date(),
      };
    } else if (action === 'update') {
      updatedContract = { ...updatedContract, ...updateData };
    }

    return apiSuccess({
      contract: { ...updatedContract, contractTypeLabel: CONTRACT_TYPE_LABELS[updatedContract.contractType] || updatedContract.contractType },
      message: 'Contrat mis à jour (mode démo)',
    });
  }

  // Real database update
  try {
    let data: Record<string, unknown> = {};

    if (action === 'terminate') {
      data = {
        status: 'terminated',
        terminationReason: updateData.terminationReason || null,
        terminationDate: new Date(),
      };
    } else if (action === 'update') {
      data = updateData;
    }

    const contract = await db.employmentContract.update({
      where: { id },
      data,
      include: {
        staff: { select: { firstName: true, lastName: true } },
      },
    });

    return apiSuccess({
      contract: {
        ...contract,
        staffName: `${contract.staff.firstName} ${contract.staff.lastName}`,
        contractTypeLabel: CONTRACT_TYPE_LABELS[contract.contractType] || contract.contractType,
      },
      message: 'Contrat mis à jour avec succès',
    });
  } catch (error: unknown) {
    console.error('Error updating contract:', error);
    const err = error as { code?: string };
    if (err.code === 'P2025') {
      return apiError('Contrat non trouvé', 404);
    }
    return apiError('Erreur lors de la mise à jour du contrat', 500);
  }
});
