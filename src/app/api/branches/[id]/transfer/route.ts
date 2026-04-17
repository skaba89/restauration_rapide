import { NextRequest } from 'next/server';
import { withErrorHandler, apiSuccess, apiError } from '@/lib/api-responses';
import { db } from '@/lib/db';

// GET - List stock transfers for a branch
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId');
  const status = searchParams.get('status');
  const direction = searchParams.get('direction') || 'all'; // incoming, outgoing, all

  // Production mode
  try {
    const where: any = {
      OR: [
        { fromBranchId: id },
        { toBranchId: id },
      ],
    };

    if (status) {
      where.status = status;
    }

    const transfers = await db.stockTransfer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Add direction flag
    const transfersWithDirection = transfers.map(t => ({
      ...t,
      direction: t.fromBranchId === id ? 'outgoing' : 'incoming',
    }));

    return apiSuccess({
      transfers: transfersWithDirection,
      total: transfers.length,
    });
  } catch (error) {
    console.error('Database error:', error);
    return apiError('Erreur lors de la récupération des transferts', 500);
  }
});

// POST - Create a new stock transfer request
export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: fromBranchId } = await params;
  const body = await request.json();
  const { organizationId, toBranchId, items, notes, requestedBy } = body;

  // Validate
  if (!toBranchId) {
    return apiError('La succursale de destination est requise', 400);
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return apiError('Au moins un article est requis', 400);
  }
  if (fromBranchId === toBranchId) {
    return apiError('La source et la destination doivent être différentes', 400);
  }

  // Production mode
  try {
    // Verify branches exist and are active
    const [fromBranch, toBranch] = await Promise.all([
      db.branch.findUnique({ where: { id: fromBranchId } }),
      db.branch.findUnique({ where: { id: toBranchId } }),
    ]);

    if (!fromBranch || !fromBranch.isActive) {
      return apiError('Succursale source non trouvée ou inactive', 404);
    }
    if (!toBranch || !toBranch.isActive) {
      return apiError('Succursale de destination non trouvée ou inactive', 404);
    }

    const transfer = await db.stockTransfer.create({
      data: {
        organizationId,
        fromBranchId,
        toBranchId,
        items: JSON.stringify(items),
        status: 'PENDING',
        requestedBy,
        notes,
      },
    });

    return apiSuccess(transfer, 'Demande de transfert créée avec succès');
  } catch (error) {
    console.error('Database error:', error);
    return apiError('Erreur lors de la création du transfert', 500);
  }
});

// PUT - Update transfer status (approve, ship, receive, cancel)
export const PUT = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: branchId } = await params;
  const body = await request.json();
  const { organizationId, transferId, action, userId, rejectionReason } = body;

  // Validate
  if (!transferId) {
    return apiError('ID de transfert requis', 400);
  }
  if (!['approve', 'ship', 'receive', 'cancel', 'reject'].includes(action)) {
    return apiError('Action invalide', 400);
  }

  // Production mode
  try {
    const transfer = await db.stockTransfer.findUnique({ where: { id: transferId } });
    
    if (!transfer) {
      return apiError('Transfert non trouvé', 404);
    }

    // Verify branch is involved
    if (transfer.fromBranchId !== branchId && transfer.toBranchId !== branchId) {
      return apiError('Ce transfert n\'implique pas cette succursale', 403);
    }

    let updateData: any = {};

    switch (action) {
      case 'approve':
        if (transfer.status !== 'PENDING') {
          return apiError('Seul un transfert en attente peut être approuvé', 400);
        }
        updateData = { status: 'APPROVED', approvedBy: userId, approvedAt: new Date() };
        break;
      case 'ship':
        if (transfer.status !== 'APPROVED') {
          return apiError('Le transfert doit être approuvé avant l\'expédition', 400);
        }
        updateData = { status: 'IN_TRANSIT', shippedAt: new Date() };
        break;
      case 'receive':
        if (transfer.status !== 'IN_TRANSIT') {
          return apiError('Le transfert doit être en transit avant réception', 400);
        }
        updateData = { status: 'DELIVERED', receivedAt: new Date() };
        break;
      case 'cancel':
        if (!['PENDING', 'APPROVED'].includes(transfer.status)) {
          return apiError('Ce transfert ne peut plus être annulé', 400);
        }
        updateData = { status: 'CANCELLED' };
        break;
      case 'reject':
        if (transfer.status !== 'PENDING') {
          return apiError('Seul un transfert en attente peut être rejeté', 400);
        }
        updateData = { status: 'REJECTED', rejectionReason };
        break;
    }

    const updated = await db.stockTransfer.update({
      where: { id: transferId },
      data: updateData,
    });

    return apiSuccess(updated, `Transfert mis à jour avec succès`);
  } catch (error) {
    console.error('Database error:', error);
    return apiError('Erreur lors de la mise à jour du transfert', 500);
  }
});