import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withErrorHandler } from '@/lib/api-responses';

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

    return NextResponse.json({
      success: true,
      data: entries,
      pagination: { total, limit, offset },
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      data: [],
      pagination: {
        total: 0,
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