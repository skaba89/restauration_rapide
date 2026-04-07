// ============================================
// Suppliers API for KFM DELICE
// GET/POST operations for supplier management
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';

// Demo suppliers
const DEMO_SUPPLIERS = [
  {
    id: '1',
    name: 'Marché Central',
    contactName: 'Mamadou Diallo',
    phone: '+224 620 00 00 01',
    email: 'marche.central@email.com',
    address: 'Marché Central, Conakry',
    paymentTerms: 'Cash on Delivery',
    deliveryDays: 'Lundi, Mercredi, Vendredi',
    isActive: true,
    rating: 4.5,
    itemCount: 8,
    totalOrders: 45,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'Boucherie Diallo',
    contactName: 'Ibrahima Diallo',
    phone: '+224 620 00 00 02',
    email: null,
    address: 'Kaloum, Conakry',
    paymentTerms: 'Net 15',
    deliveryDays: 'Mardi, Jeudi, Samedi',
    isActive: true,
    rating: 4.8,
    itemCount: 3,
    totalOrders: 32,
    createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Pêcherie du Port',
    contactName: 'Fatou Camara',
    phone: '+224 620 00 00 03',
    email: null,
    address: 'Port de Conakry',
    paymentTerms: 'Cash on Delivery',
    deliveryDays: 'Quotidien',
    isActive: true,
    rating: 4.3,
    itemCount: 2,
    totalOrders: 28,
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    name: 'Boissons Plus',
    contactName: 'Sekou Traoré',
    phone: '+224 620 00 00 04',
    email: 'boissons.plus@email.com',
    address: 'Ratoma, Conakry',
    paymentTerms: 'Net 30',
    deliveryDays: 'Lundi, Jeudi',
    isActive: true,
    rating: 4.0,
    itemCount: 4,
    totalOrders: 18,
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    name: 'Emballages Express',
    contactName: 'Aminata Sylla',
    phone: '+224 620 00 00 05',
    email: null,
    address: 'Dixinn, Conakry',
    paymentTerms: 'Net 30',
    deliveryDays: 'Sur commande',
    isActive: true,
    rating: 4.6,
    itemCount: 5,
    totalOrders: 12,
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    name: 'Fournisseur Pro',
    contactName: 'Mohamed Koné',
    phone: '+224 620 00 00 06',
    email: 'fournisseur.pro@email.com',
    address: 'Matam, Conakry',
    paymentTerms: 'Net 15',
    deliveryDays: 'Mercredi, Samedi',
    isActive: false,
    rating: 3.8,
    itemCount: 2,
    totalOrders: 8,
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// GET - List suppliers
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const demo = searchParams.get('demo') === 'true';
  const active = searchParams.get('active');
  const search = searchParams.get('search');

  if (demo) {
    let suppliers = [...DEMO_SUPPLIERS];

    if (active !== null && active !== undefined) {
      suppliers = suppliers.filter(s => s.isActive === (active === 'true'));
    }
    if (search) {
      const searchLower = search.toLowerCase();
      suppliers = suppliers.filter(s => 
        s.name.toLowerCase().includes(searchLower) ||
        s.contactName?.toLowerCase().includes(searchLower) ||
        s.phone.includes(search)
      );
    }

    return apiSuccess({ suppliers });
  }

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
  const demo = searchParams.get('demo') === 'true';

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

  if (demo) {
    const newSupplier = {
      id: `${Date.now()}`,
      name,
      contactName,
      phone,
      email,
      address,
      paymentTerms,
      deliveryDays,
      isActive: true,
      rating: 0,
      itemCount: 0,
      totalOrders: 0,
      createdAt: new Date().toISOString(),
    };
    return apiSuccess({ supplier: newSupplier }, 'Fournisseur créé avec succès');
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
  const demo = searchParams.get('demo') === 'true';

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

  if (demo) {
    const updatedSupplier = {
      id,
      name,
      contactName,
      phone,
      email,
      address,
      paymentTerms,
      deliveryDays,
      isActive,
      updatedAt: new Date().toISOString(),
    };
    return apiSuccess({ supplier: updatedSupplier }, 'Fournisseur mis à jour');
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
  const demo = searchParams.get('demo') === 'true';
  const id = searchParams.get('id');

  if (!id) {
    return apiError('ID requis', 400);
  }

  if (demo) {
    return apiSuccess({}, 'Fournisseur supprimé avec succès');
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
