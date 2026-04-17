// ============================================
// Suppliers API for KFM DELICE
// GET/POST operations for supplier management
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';

// GET - List suppliers
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const active = searchParams.get('active');
  const search = searchParams.get('search');

  try {
    const organizationId = searchParams.get('organizationId');

    const where: any = {};
    if (organizationId) {
      where.organizationId = organizationId;
    }
    if (active !== null && active !== undefined) {
      where.isActive = active === 'true';
    }

    const suppliers = await db.supplier.findMany({
      where,
      include: {
        _count: {
          select: { 
            inventoryItems: true,
            purchaseOrders: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Transform to include counts
    const transformedSuppliers = suppliers.map(s => ({
      ...s,
      itemCount: s._count.inventoryItems,
      totalOrders: s._count.purchaseOrders,
    }));

    return apiSuccess({ suppliers: transformedSuppliers });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return apiError('Erreur lors de la récupération des fournisseurs', 500);
  }
});

// POST - Create supplier
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const searchParams = request.nextUrl.searchParams;

  const { 
    organizationId,
    name, 
    contactName, 
    phone, 
    email, 
    address, 
    paymentTerms, 
    deliveryDays 
  } = body;

  // Validate required fields
  if (!name || !phone) {
    return apiError('Nom et téléphone sont requis', 400);
  }

  try {
    if (!organizationId) {
      return apiError('organizationId est requis', 400);
    }

    // Check if supplier with same name exists
    const existingSupplier = await db.supplier.findFirst({
      where: {
        organizationId,
        name,
      },
    });

    if (existingSupplier) {
      return apiError('Un fournisseur avec ce nom existe déjà', 400);
    }

    const supplier = await db.supplier.create({
      data: {
        organizationId,
        name,
        contactName,
        phone,
        email,
        address,
        paymentTerms,
        deliveryDays,
        isActive: true,
      },
    });

    return apiSuccess({ supplier }, 'Fournisseur créé avec succès');
  } catch (error) {
    console.error('Error creating supplier:', error);
    return apiError('Erreur lors de la création du fournisseur', 500);
  }
});

// PUT - Update supplier
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const searchParams = request.nextUrl.searchParams;

  const { 
    id,
    name, 
    contactName, 
    phone, 
    email, 
    address, 
    paymentTerms, 
    deliveryDays,
    isActive 
  } = body;

  if (!id) {
    return apiError('ID requis', 400);
  }

  try {
    const existingSupplier = await db.supplier.findUnique({
      where: { id },
    });

    if (!existingSupplier) {
      return apiError('Fournisseur non trouvé', 404);
    }

    const supplier = await db.supplier.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(contactName !== undefined && { contactName }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
        ...(paymentTerms !== undefined && { paymentTerms }),
        ...(deliveryDays !== undefined && { deliveryDays }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      },
    });

    return apiSuccess({ supplier }, 'Fournisseur mis à jour avec succès');
  } catch (error) {
    console.error('Error updating supplier:', error);
    return apiError('Erreur lors de la mise à jour du fournisseur', 500);
  }
});

// DELETE - Delete supplier
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return apiError('ID requis', 400);
  }

  try {
    const existingSupplier = await db.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: { inventoryItems: true },
        },
      },
    });

    if (!existingSupplier) {
      return apiError('Fournisseur non trouvé', 404);
    }

    // Check if supplier has inventory items
    if (existingSupplier._count.inventoryItems > 0) {
      return apiError(
        'Impossible de supprimer ce fournisseur car il est lié à des articles d\'inventaire', 
        400
      );
    }

    await db.supplier.delete({
      where: { id },
    });

    return apiSuccess({}, 'Fournisseur supprimé avec succès');
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return apiError('Erreur lors de la suppression du fournisseur', 500);
  }
});