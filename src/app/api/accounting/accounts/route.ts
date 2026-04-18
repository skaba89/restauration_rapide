import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withErrorHandler } from '@/lib/api-responses';

// GET - Get chart of accounts
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get('organizationId') || 'kfm-delice';
  const type = searchParams.get('type');
  const isActive = searchParams.get('isActive');

  // Demo data for KFM DELICE
  const demoAccounts = [
    // Assets (Classes 1-2-3)
    { id: '1', code: '10', name: 'Capital', type: 'EQUITY', isActive: true, isSystem: true },
    { id: '2', code: '12', name: "Résultat de l'exercice", type: 'EQUITY', isActive: true, isSystem: true },
    { id: '3', code: '16', name: 'Emprunts et dettes assimilées', type: 'LIABILITY', isActive: true, isSystem: true },
    { id: '4', code: '21', name: 'Immobilisations incorporelles', type: 'ASSET', isActive: true, isSystem: true },
    { id: '5', code: '23', name: 'Bâtiments', type: 'ASSET', isActive: true, isSystem: true },
    { id: '6', code: '24', name: 'Matériel et outillage', type: 'ASSET', isActive: true, isSystem: true },
    { id: '7', code: '25', name: 'Matériel de transport', type: 'ASSET', isActive: true, isSystem: true },
    { id: '8', code: '26', name: 'Mobilier et matériel de bureau', type: 'ASSET', isActive: true, isSystem: true },
    { id: '9', code: '28', name: 'Amortissements', type: 'ASSET', isActive: true, isSystem: true },
    { id: '10', code: '31', name: 'Stocks de marchandises', type: 'ASSET', isActive: true, isSystem: true },
    { id: '11', code: '32', name: 'Stocks de matières premières', type: 'ASSET', isActive: true, isSystem: true },
    { id: '12', code: '40', name: 'Fournisseurs', type: 'LIABILITY', isActive: true, isSystem: true },
    { id: '13', code: '41', name: 'Clients', type: 'ASSET', isActive: true, isSystem: true },
    { id: '14', code: '42', name: 'Personnel', type: 'LIABILITY', isActive: true, isSystem: true },
    { id: '15', code: '44', name: 'État et collectivités publiques', type: 'LIABILITY', isActive: true, isSystem: true },
    { id: '16', code: '52', name: 'Banques', type: 'ASSET', isActive: true, isSystem: true },
    { id: '17', code: '57', name: 'Caisse', type: 'ASSET', isActive: true, isSystem: true },
    // Revenue & Expenses (Classes 6-7-8)
    { id: '18', code: '60', name: 'Achats et variations de stocks', type: 'EXPENSE', isActive: true, isSystem: true },
    { id: '19', code: '601', name: 'Achats de denrées alimentaires', type: 'EXPENSE', isActive: true, mapping: 'food_cost', isSystem: true },
    { id: '20', code: '602', name: 'Achats de boissons', type: 'EXPENSE', isActive: true, mapping: 'beverage_cost', isSystem: true },
    { id: '21', code: '61', name: 'Transports', type: 'EXPENSE', isActive: true, isSystem: true },
    { id: '22', code: '62', name: 'Services extérieurs', type: 'EXPENSE', isActive: true, isSystem: true },
    { id: '23', code: '63', name: 'Impôts et taxes', type: 'EXPENSE', isActive: true, isSystem: true },
    { id: '24', code: '64', name: 'Charges de personnel', type: 'EXPENSE', isActive: true, isSystem: true },
    { id: '25', code: '641', name: 'Rémunérations du personnel', type: 'EXPENSE', isActive: true, mapping: 'salaries', isSystem: true },
    { id: '26', code: '622', name: 'Locations', type: 'EXPENSE', isActive: true, mapping: 'rent', isSystem: true },
    { id: '27', code: '624', name: 'Eau et électricité', type: 'EXPENSE', isActive: true, mapping: 'utilities', isSystem: true },
    { id: '28', code: '625', name: 'Publicité', type: 'EXPENSE', isActive: true, mapping: 'marketing', isSystem: true },
    { id: '29', code: '65', name: 'Autres charges', type: 'EXPENSE', isActive: true, isSystem: true },
    { id: '30', code: '70', name: 'Ventes de marchandises', type: 'REVENUE', isActive: true, isSystem: true },
    { id: '31', code: '701', name: 'Ventes de plats', type: 'REVENUE', isActive: true, mapping: 'food_sales', isSystem: true },
    { id: '32', code: '702', name: 'Ventes de boissons', type: 'REVENUE', isActive: true, mapping: 'beverage_sales', isSystem: true },
    { id: '33', code: '706', name: 'Services rendus', type: 'REVENUE', isActive: true, isSystem: true },
    { id: '34', code: '707', name: 'Frais de livraison', type: 'REVENUE', isActive: true, mapping: 'delivery_fees', isSystem: true },
    { id: '35', code: '708', name: 'Frais de service', type: 'REVENUE', isActive: true, mapping: 'service_charges', isSystem: true },
    { id: '36', code: '75', name: 'Autres produits', type: 'REVENUE', isActive: true, isSystem: true },
    // TVA Accounts
    { id: '37', code: '4421', name: 'TVA collectée', type: 'LIABILITY', isActive: true, isSystem: true },
    { id: '38', code: '4422', name: 'TVA déductible', type: 'ASSET', isActive: true, isSystem: true },
    { id: '39', code: '4427', name: 'TVA à payer', type: 'LIABILITY', isActive: true, isSystem: true },
  ];

  try {
    if (!db) {
      return NextResponse.json({
        success: true,
        data: demoAccounts.map(acc => ({
          ...acc,
          organizationId,
          parentCode: null,
          category: null,
          description: null,
          allowManual: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      });
    }

    let accounts = await db.accountingAccount.findMany({
      where: {
        organizationId,
        ...(type && { type: type as any }),
        ...(isActive !== null && { isActive: isActive === 'true' }),
      },
      orderBy: { code: 'asc' },
    });

    // Return demo data if no accounts in database
    if (accounts.length === 0) {
      accounts = demoAccounts.map(acc => ({
        ...acc,
        organizationId,
        parentCode: null,
        category: null,
        description: null,
        allowManual: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })) as any;
    }

    return NextResponse.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    // Return demo data on error
    return NextResponse.json({
      success: true,
      data: demoAccounts.map(acc => ({
        ...acc,
        organizationId,
        parentCode: null,
        category: null,
        description: null,
        allowManual: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    });
  }
});

// POST - Create new account
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { organizationId = 'kfm-delice', code, name, type, parentCode, mapping, description } = body;

  if (!code || !name || !type) {
    return NextResponse.json(
      { success: false, error: 'Code, nom et type sont requis' },
      { status: 400 }
    );
  }

  try {
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Base de données non disponible' },
        { status: 503 }
      );
    }
    const account = await db.accountingAccount.create({
      data: {
        organizationId,
        code,
        name,
        type,
        parentCode,
        mapping,
        description,
        isSystem: false,
        isActive: true,
        allowManual: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: account,
      message: 'Compte créé avec succès',
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Ce code de compte existe déjà' },
        { status: 400 }
      );
    }
    throw error;
  }
});

// PUT - Update account
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { id, name, mapping, isActive, description } = body;

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID du compte requis' },
      { status: 400 }
    );
  }

  const account = await db.accountingAccount.update({
    where: { id },
    data: {
      name,
      mapping,
      isActive,
      description,
    },
  });

  return NextResponse.json({
    success: true,
    data: account,
    message: 'Compte mis à jour avec succès',
  });
});

// DELETE - Delete account
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID du compte requis' },
      { status: 400 }
    );
  }

  // Check if account is system account
  const account = await db.accountingAccount.findUnique({
    where: { id },
  });

  if (account?.isSystem) {
    return NextResponse.json(
      { success: false, error: 'Les comptes système ne peuvent pas être supprimés' },
      { status: 400 }
    );
  }

  await db.accountingAccount.delete({
    where: { id },
  });

  return NextResponse.json({
    success: true,
    message: 'Compte supprimé avec succès',
  });
});
