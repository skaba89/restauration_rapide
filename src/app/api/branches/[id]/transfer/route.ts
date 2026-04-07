import { NextRequest } from 'next/server';
import { withErrorHandler, apiSuccess, apiError } from '@/lib/api-responses';
import { db } from '@/lib/db';

// Demo stock transfers data
let DEMO_TRANSFERS = [
  {
    id: 'transfer-001',
    organizationId: 'org-001',
    fromBranchId: 'branch-001',
    fromBranchName: 'KFM DELICE - Kaloum',
    toBranchId: 'branch-002',
    toBranchName: 'KFM DELICE - Dixinn',
    items: [
      { name: 'Poisson frais', quantity: 20, unit: 'kg', notes: 'Qualité supérieure' },
      { name: 'Attieké', quantity: 50, unit: 'kg' },
      { name: 'Huile de palme', quantity: 10, unit: 'L' },
    ],
    status: 'DELIVERED',
    requestedBy: 'user-001',
    requestedByName: 'Amadou Touré',
    approvedBy: 'user-004',
    approvedByName: 'Fatou Diallo',
    requestedAt: '2024-01-15T08:00:00.000Z',
    approvedAt: '2024-01-15T08:30:00.000Z',
    shippedAt: '2024-01-15T09:00:00.000Z',
    receivedAt: '2024-01-15T10:30:00.000Z',
    notes: 'Transfert régulier de stock',
  },
  {
    id: 'transfer-002',
    organizationId: 'org-001',
    fromBranchId: 'branch-002',
    fromBranchName: 'KFM DELICE - Dixinn',
    toBranchId: 'branch-003',
    toBranchName: 'KFM DELICE - Matam',
    items: [
      { name: 'Poulet', quantity: 30, unit: 'kg' },
      { name: 'Légumes mélangés', quantity: 25, unit: 'kg' },
    ],
    status: 'IN_TRANSIT',
    requestedBy: 'user-006',
    requestedByName: 'Ibrahim Koné',
    approvedBy: 'user-004',
    approvedByName: 'Fatou Diallo',
    requestedAt: '2024-01-15T14:00:00.000Z',
    approvedAt: '2024-01-15T14:15:00.000Z',
    shippedAt: '2024-01-15T15:00:00.000Z',
    notes: 'Rush du soir - stock supplémentaire',
  },
  {
    id: 'transfer-003',
    organizationId: 'org-001',
    fromBranchId: 'branch-001',
    fromBranchName: 'KFM DELICE - Kaloum',
    toBranchId: 'branch-003',
    toBranchName: 'KFM DELICE - Matam',
    items: [
      { name: 'Riz', quantity: 100, unit: 'kg' },
      { name: 'Sauce tomate', quantity: 20, unit: 'L' },
    ],
    status: 'PENDING',
    requestedBy: 'user-006',
    requestedByName: 'Ibrahim Koné',
    requestedAt: '2024-01-15T16:00:00.000Z',
    notes: 'Besoin urgent pour le weekend',
  },
];

const DEMO_BRANCHES = [
  { id: 'branch-001', name: 'KFM DELICE - Kaloum', city: 'Kaloum', status: 'ACTIVE' },
  { id: 'branch-002', name: 'KFM DELICE - Dixinn', city: 'Dixinn', status: 'ACTIVE' },
  { id: 'branch-003', name: 'KFM DELICE - Matam', city: 'Matam', status: 'ACTIVE' },
  { id: 'branch-004', name: 'KFM DELICE - Ratoma', city: 'Ratoma', status: 'CONSTRUCTION' },
];

// GET - List stock transfers for a branch
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const demo = searchParams.get('demo') === 'true';
  const organizationId = searchParams.get('organizationId');
  const status = searchParams.get('status');
  const direction = searchParams.get('direction') || 'all'; // incoming, outgoing, all

  // Demo mode
  if (demo || !organizationId) {
    let transfers = DEMO_TRANSFERS.filter(t => 
      t.fromBranchId === id || t.toBranchId === id
    );

    if (direction === 'incoming') {
      transfers = transfers.filter(t => t.toBranchId === id);
    } else if (direction === 'outgoing') {
      transfers = transfers.filter(t => t.fromBranchId === id);
    }

    if (status && ['PENDING', 'APPROVED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].includes(status)) {
      transfers = transfers.filter(t => t.status === status);
    }

    // Add direction flag
    transfers = transfers.map(t => ({
      ...t,
      direction: t.fromBranchId === id ? 'outgoing' : 'incoming',
    }));

    return apiSuccess({
      transfers,
      total: transfers.length,
    });
  }

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
  const { organizationId, demo = false, toBranchId, items, notes, requestedBy } = body;

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

  // Demo mode
  if (demo || !organizationId) {
    const fromBranch = DEMO_BRANCHES.find(b => b.id === fromBranchId);
    const toBranch = DEMO_BRANCHES.find(b => b.id === toBranchId);

    if (!fromBranch || !toBranch) {
      return apiError('Succursale non trouvée', 404);
    }

    const newTransfer = {
      id: `transfer-${Date.now()}`,
      organizationId: 'org-001',
      fromBranchId,
      fromBranchName: fromBranch.name,
      toBranchId,
      toBranchName: toBranch.name,
      items,
      status: 'PENDING',
      requestedBy: requestedBy || 'user-001',
      requestedByName: 'Utilisateur Demo',
      requestedAt: new Date().toISOString(),
      notes,
    };

    DEMO_TRANSFERS.push(newTransfer);

    return apiSuccess(newTransfer, 'Demande de transfert créée avec succès');
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
  const { organizationId, demo = false, transferId, action, userId, rejectionReason } = body;

  // Validate
  if (!transferId) {
    return apiError('ID de transfert requis', 400);
  }
  if (!['approve', 'ship', 'receive', 'cancel', 'reject'].includes(action)) {
    return apiError('Action invalide', 400);
  }

  // Demo mode
  if (demo || !organizationId) {
    const transferIndex = DEMO_TRANSFERS.findIndex(t => t.id === transferId);
    
    if (transferIndex === -1) {
      return apiError('Transfert non trouvé', 404);
    }

    const transfer = DEMO_TRANSFERS[transferIndex];

    // Verify branch is involved in this transfer
    if (transfer.fromBranchId !== branchId && transfer.toBranchId !== branchId) {
      return apiError('Ce transfert n\'implique pas cette succursale', 403);
    }

    // Update status based on action
    switch (action) {
      case 'approve':
        if (transfer.status !== 'PENDING') {
          return apiError('Seul un transfert en attente peut être approuvé', 400);
        }
        transfer.status = 'APPROVED';
        transfer.approvedBy = userId || 'user-001';
        transfer.approvedByName = 'Utilisateur Demo';
        transfer.approvedAt = new Date().toISOString();
        break;
      case 'ship':
        if (transfer.status !== 'APPROVED') {
          return apiError('Le transfert doit être approuvé avant l\'expédition', 400);
        }
        transfer.status = 'IN_TRANSIT';
        transfer.shippedAt = new Date().toISOString();
        break;
      case 'receive':
        if (transfer.status !== 'IN_TRANSIT') {
          return apiError('Le transfert doit être en transit avant réception', 400);
        }
        transfer.status = 'DELIVERED';
        transfer.receivedAt = new Date().toISOString();
        break;
      case 'cancel':
        if (!['PENDING', 'APPROVED'].includes(transfer.status)) {
          return apiError('Ce transfert ne peut plus être annulé', 400);
        }
        transfer.status = 'CANCELLED';
        break;
      case 'reject':
        if (transfer.status !== 'PENDING') {
          return apiError('Seul un transfert en attente peut être rejeté', 400);
        }
        transfer.status = 'REJECTED';
        transfer.rejectionReason = rejectionReason;
        break;
    }

    DEMO_TRANSFERS[transferIndex] = transfer;

    return apiSuccess(transfer, `Transfert ${action === 'approve' ? 'approuvé' : action === 'ship' ? 'expédié' : action === 'receive' ? 'reçu' : action === 'reject' ? 'rejeté' : 'annulé'} avec succès`);
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
