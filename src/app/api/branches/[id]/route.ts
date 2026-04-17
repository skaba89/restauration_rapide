import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler, apiSuccess, apiError } from '@/lib/api-responses';
import { db } from '@/lib/db';

// GET - Get branch by ID with full details
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId');
  const includeSettings = searchParams.get('includeSettings') === 'true';
  const includeHours = searchParams.get('includeHours') === 'true';
  const includeUsers = searchParams.get('includeUsers') === 'true';

  // Production mode - fetch from database
  try {
    const branch = await db.branch.findUnique({
      where: { id },
      include: {
        settings: includeSettings,
        hours: includeHours ? { orderBy: { dayOfWeek: 'asc' } } : false,
        users: includeUsers ? { include: { user: true } } : false,
      },
    });

    if (!branch) {
      return apiError('Succursale non trouvée', 404);
    }

    return apiSuccess(branch);
  } catch (error) {
    console.error('Database error:', error);
    return apiError('Erreur lors de la récupération de la succursale', 500);
  }
});

// PUT - Update branch
export const PUT = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();
  const { organizationId, settings, hours, ...updates } = body;

  // Production mode
  try {
    // Check if branch exists
    const existing = await db.branch.findUnique({ where: { id } });
    if (!existing) {
      return apiError('Succursale non trouvée', 404);
    }

    // Update branch with settings and hours
    const branch = await db.branch.update({
      where: { id },
      data: {
        ...updates,
        ...(settings && {
          settings: {
            upsert: {
              create: settings,
              update: settings,
            },
          },
        }),
      },
      include: {
        settings: true,
        hours: true,
      },
    });

    // Update hours if provided
    if (hours && Array.isArray(hours)) {
      // Delete existing hours
      await db.branchHour.deleteMany({ where: { branchId: id } });
      
      // Create new hours
      await db.branchHour.createMany({
        data: hours.map((h: any) => ({
          branchId: id,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
          breakStart: h.breakStart,
          breakEnd: h.breakEnd,
        })),
      });
    }

    return apiSuccess(branch, 'Succursale mise à jour avec succès');
  } catch (error) {
    console.error('Database error:', error);
    return apiError('Erreur lors de la mise à jour de la succursale', 500);
  }
});

// DELETE - Archive/deactivate branch
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId');

  // Production mode
  try {
    const branch = await db.branch.findUnique({ where: { id } });
    
    if (!branch) {
      return apiError('Succursale non trouvée', 404);
    }

    if (branch.isMain) {
      return apiError('Impossible de supprimer la succursale principale', 400);
    }

    await db.branch.update({
      where: { id },
      data: {
        isActive: false,
        status: 'CLOSED',
        isOpen: false,
      },
    });

    return apiSuccess({ id }, 'Succursale archivée avec succès');
  } catch (error) {
    console.error('Database error:', error);
    return apiError('Erreur lors de l\'archivage de la succursale', 500);
  }
});