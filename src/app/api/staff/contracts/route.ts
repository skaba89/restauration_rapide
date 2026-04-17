// ============================================
// Employment Contracts API - KFM DELICE
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler, getPagination } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { z } from 'zod';
import { getOrganizationCurrencyCode } from '@/lib/org-settings';

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
  const organizationId = searchParams.get('organizationId') || '';
  const staffId = searchParams.get('staffId');
  const status = searchParams.get('status');
  const contractType = searchParams.get('contractType');
  const { page, limit, skip } = getPagination(searchParams);

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
  const organizationId = body.organizationId || '';

  const validated = createContractSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const data = validated.data;

  // Generate contract number
  const contractNumber = `CTR-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;

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