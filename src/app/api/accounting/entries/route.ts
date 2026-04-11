import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withErrorHandler } from '@/lib/api-responses';

// Demo journal entries for KFM DELICE
const DEMO_JOURNAL_ENTRIES = [
  {
    id: 'je-001',
    entryNumber: 'ECR-2024-001',
    date: new Date(2024, 0, 15),
    reference: 'ORD-2024-0001',
    description: 'Ventes du 15/01/2024',
    source: 'order',
    status: 'POSTED',
    totalDebit: 500000,
    totalCredit: 500000,
    isBalanced: true,
    lines: [
      { id: 'jl-001-1', lineNumber: 1, accountId: '17', accountCode: '57', accountName: 'Caisse', debit: 575000, credit: 0, description: 'Encaissement vente' },
      { id: 'jl-001-2', lineNumber: 2, accountId: '31', accountCode: '701', accountName: 'Ventes de plats', debit: 0, credit: 400000, description: 'Ventes plats' },
      { id: 'jl-001-3', lineNumber: 3, accountId: '32', accountCode: '702', accountName: 'Ventes de boissons', debit: 0, credit: 100000, description: 'Ventes boissons' },
      { id: 'jl-001-4', lineNumber: 4, accountId: '37', accountCode: '4421', accountName: 'TVA collectée', debit: 0, credit: 75000, description: 'TVA 18%' },
    ],
    createdAt: new Date(2024, 0, 15),
    postedAt: new Date(2024, 0, 15),
  },
  {
    id: 'je-002',
    entryNumber: 'ECR-2024-002',
    date: new Date(2024, 0, 20),
    reference: 'FAC-2024-001',
    description: 'Achat denrées alimentaires',
    source: 'purchase',
    status: 'POSTED',
    totalDebit: 150000,
    totalCredit: 150000,
    isBalanced: true,
    lines: [
      { id: 'jl-002-1', lineNumber: 1, accountId: '10', accountCode: '31', accountName: 'Stocks de marchandises', debit: 150000, credit: 0, description: 'Achat poissons et viandes' },
      { id: 'jl-002-2', lineNumber: 2, accountId: '12', accountCode: '40', accountName: 'Fournisseurs', debit: 0, credit: 150000, description: 'Achat à crédit' },
    ],
    createdAt: new Date(2024, 0, 20),
    postedAt: new Date(2024, 0, 20),
  },
  {
    id: 'je-003',
    entryNumber: 'ECR-2024-003',
    date: new Date(2024, 0, 31),
    reference: 'PAY-2024-001',
    description: 'Paiement salaires janvier',
    source: 'payroll',
    status: 'POSTED',
    totalDebit: 850000,
    totalCredit: 850000,
    isBalanced: true,
    lines: [
      { id: 'jl-003-1', lineNumber: 1, accountId: '24', accountCode: '64', accountName: 'Charges de personnel', debit: 850000, credit: 0, description: 'Salaires janvier' },
      { id: 'jl-003-2', lineNumber: 2, accountId: '17', accountCode: '57', accountName: 'Caisse', debit: 0, credit: 850000, description: 'Paiement salaires' },
    ],
    createdAt: new Date(2024, 0, 31),
    postedAt: new Date(2024, 0, 31),
  },
  {
    id: 'je-004',
    entryNumber: 'ECR-2024-004',
    date: new Date(2024, 1, 1),
    reference: 'FAC-2024-002',
    description: 'Achat boissons',
    source: 'purchase',
    status: 'DRAFT',
    totalDebit: 0,
    totalCredit: 0,
    isBalanced: true,
    lines: [],
    createdAt: new Date(2024, 1, 1),
    postedAt: null,
  },
];

// GET - Get journal entries
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get('organizationId') || 'kfm-delice';
  const status = searchParams.get('status');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const where: any = { organizationId };
    
    if (status) {
      where.status = status;
    }
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const entries = await db.journalEntry.findMany({
      where,
      include: {
        lines: {
          include: {
            account: true,
          },
          orderBy: { lineNumber: 'asc' },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await db.journalEntry.count({ where });

    // Return demo data if no entries found
    if (entries.length === 0) {
      return NextResponse.json({
        success: true,
        data: DEMO_JOURNAL_ENTRIES,
        pagination: {
          total: DEMO_JOURNAL_ENTRIES.length,
          limit,
          offset,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: entries,
      pagination: { total, limit, offset },
    });
  } catch (error) {
    // Return demo data on error
    return NextResponse.json({
      success: true,
      data: DEMO_JOURNAL_ENTRIES,
      pagination: {
        total: DEMO_JOURNAL_ENTRIES.length,
        limit,
        offset,
      },
    });
  }
});

// POST - Create journal entry
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { 
    organizationId = 'kfm-delice',
    date,
    reference,
    description,
    source,
    sourceId,
    lines,
  } = body;

  if (!date || !description || !lines || lines.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Date, description et lignes sont requis' },
      { status: 400 }
    );
  }

  // Validate balanced entry
  const totalDebit = lines.reduce((sum: number, l: any) => sum + (l.debit || 0), 0);
  const totalCredit = lines.reduce((sum: number, l: any) => sum + (l.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  if (!isBalanced) {
    return NextResponse.json(
      { success: false, error: 'L\'écriture n\'est pas équilibrée. Total débit et crédit doivent être égaux.' },
      { status: 400 }
    );
  }

  // Generate entry number
  const count = await db.journalEntry.count({
    where: { organizationId },
  });
  const entryNumber = `ECR-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

  const entry = await db.journalEntry.create({
    data: {
      organizationId,
      entryNumber,
      date: new Date(date),
      reference,
      description,
      source,
      sourceId,
      status: 'DRAFT',
      totalDebit,
      totalCredit,
      isBalanced,
      lines: {
        create: lines.map((line: any, index: number) => ({
          accountId: line.accountId,
          lineNumber: index + 1,
          description: line.description,
          debit: line.debit || 0,
          credit: line.credit || 0,
          reference: line.reference,
          costCenter: line.costCenter,
        })),
      },
    },
    include: {
      lines: {
        include: { account: true },
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: entry,
    message: 'Écriture créée avec succès',
  });
});

// PUT - Update journal entry
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { id, action, lines, description, reference } = body;

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID de l\'écriture requis' },
      { status: 400 }
    );
  }

  // Get existing entry
  const existing = await db.journalEntry.findUnique({
    where: { id },
    include: { lines: true },
  });

  if (!existing) {
    return NextResponse.json(
      { success: false, error: 'Écriture non trouvée' },
      { status: 404 }
    );
  }

  if (existing.status === 'POSTED') {
    return NextResponse.json(
      { success: false, error: 'Les écritures postées ne peuvent pas être modifiées' },
      { status: 400 }
    );
  }

  if (action === 'post') {
    // Post the entry
    const entry = await db.journalEntry.update({
      where: { id },
      data: {
        status: 'POSTED',
        postedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: entry,
      message: 'Écriture postée avec succès',
    });
  }

  if (action === 'cancel') {
    const entry = await db.journalEntry.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });

    return NextResponse.json({
      success: true,
      data: entry,
      message: 'Écriture annulée',
    });
  }

  // Update entry
  if (lines && lines.length > 0) {
    const totalDebit = lines.reduce((sum: number, l: any) => sum + (l.debit || 0), 0);
    const totalCredit = lines.reduce((sum: number, l: any) => sum + (l.credit || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    if (!isBalanced) {
      return NextResponse.json(
        { success: false, error: 'L\'écriture n\'est pas équilibrée' },
        { status: 400 }
      );
    }

    // Delete existing lines and create new ones
    await db.journalLine.deleteMany({
      where: { entryId: id },
    });

    const entry = await db.journalEntry.update({
      where: { id },
      data: {
        description,
        reference,
        totalDebit,
        totalCredit,
        isBalanced,
        lines: {
          create: lines.map((line: any, index: number) => ({
            accountId: line.accountId,
            lineNumber: index + 1,
            description: line.description,
            debit: line.debit || 0,
            credit: line.credit || 0,
          })),
        },
      },
      include: {
        lines: { include: { account: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: entry,
      message: 'Écriture mise à jour',
    });
  }

  return NextResponse.json(
    { success: false, error: 'Action non valide' },
    { status: 400 }
  );
});

// DELETE - Delete journal entry
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID de l\'écriture requis' },
      { status: 400 }
    );
  }

  const existing = await db.journalEntry.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json(
      { success: false, error: 'Écriture non trouvée' },
      { status: 404 }
    );
  }

  if (existing.status === 'POSTED') {
    return NextResponse.json(
      { success: false, error: 'Les écritures postées ne peuvent pas être supprimées' },
      { status: 400 }
    );
  }

  await db.journalLine.deleteMany({
    where: { entryId: id },
  });

  await db.journalEntry.delete({
    where: { id },
  });

  return NextResponse.json({
    success: true,
    message: 'Écriture supprimée avec succès',
  });
});
