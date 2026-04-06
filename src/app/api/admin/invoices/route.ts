// ============================================
// Restaurant OS - Admin Invoices API
// API de gestion des factures
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';

// Demo data for invoices
const demoInvoices = [
  {
    id: 'inv-001',
    invoiceNumber: 'FAC-2025-001',
    organizationId: 'org-1',
    organization: { id: 'org-1', name: 'Le Groupe Savana', email: 'contact@savana.com' },
    restaurantId: 'rest-1',
    restaurant: { id: 'rest-1', name: 'KFM DELICE' },
    type: 'SUBSCRIPTION',
    amount: 99000,
    tax: 0,
    taxRate: 0,
    total: 99000,
    status: 'PAID',
    dueDate: '2025-01-15T00:00:00.000Z',
    createdAt: '2025-01-01T00:00:00.000Z',
    paidAt: '2025-01-10T14:30:00.000Z',
    paymentMethod: 'ORANGE_MONEY',
    paymentRef: 'OM-123456789',
    items: [
      { description: 'Abonnement Business - Janvier 2025', quantity: 1, unitPrice: 99000, total: 99000 }
    ],
    notes: 'Facture mensuelle abonnement',
    pdfUrl: '/invoices/FAC-2025-001.pdf'
  },
  {
    id: 'inv-002',
    invoiceNumber: 'FAC-2025-002',
    organizationId: 'org-2',
    organization: { id: 'org-2', name: 'Saveurs d\'Afrique', email: 'info@saveurs-afrique.com' },
    restaurantId: 'rest-2',
    restaurant: { id: 'rest-2', name: 'Saveurs d\'Afrique' },
    type: 'SUBSCRIPTION',
    amount: 49000,
    tax: 0,
    taxRate: 0,
    total: 49000,
    status: 'PENDING',
    dueDate: '2025-01-20T00:00:00.000Z',
    createdAt: '2025-01-05T00:00:00.000Z',
    paidAt: null,
    paymentMethod: null,
    paymentRef: null,
    items: [
      { description: 'Abonnement Pro - Janvier 2025', quantity: 1, unitPrice: 49000, total: 49000 }
    ],
    notes: 'En attente de paiement',
    pdfUrl: '/invoices/FAC-2025-002.pdf'
  },
  {
    id: 'inv-003',
    invoiceNumber: 'FAC-2025-003',
    organizationId: 'org-3',
    organization: { id: 'org-3', name: 'La Terrasse Grill', email: 'contact@terrasse-grill.com' },
    restaurantId: 'rest-3',
    restaurant: { id: 'rest-3', name: 'La Terrasse Grill' },
    type: 'SUBSCRIPTION',
    amount: 249000,
    tax: 0,
    taxRate: 0,
    total: 249000,
    status: 'PAID',
    dueDate: '2025-01-25T00:00:00.000Z',
    createdAt: '2025-01-10T00:00:00.000Z',
    paidAt: '2025-01-12T09:15:00.000Z',
    paymentMethod: 'BANK_TRANSFER',
    paymentRef: 'VIR-987654',
    items: [
      { description: 'Abonnement Enterprise - Janvier 2025', quantity: 1, unitPrice: 249000, total: 249000 }
    ],
    notes: 'Client premium - paiement anticipé',
    pdfUrl: '/invoices/FAC-2025-003.pdf'
  },
  {
    id: 'inv-004',
    invoiceNumber: 'FAC-2025-004',
    organizationId: 'org-4',
    organization: { id: 'org-4', name: 'Café du Plateau', email: 'cafe@plateau.com' },
    restaurantId: 'rest-4',
    restaurant: { id: 'rest-4', name: 'Café du Plateau' },
    type: 'SUBSCRIPTION',
    amount: 49000,
    tax: 0,
    taxRate: 0,
    total: 49000,
    status: 'OVERDUE',
    dueDate: '2025-01-05T00:00:00.000Z',
    createdAt: '2024-12-20T00:00:00.000Z',
    paidAt: null,
    paymentMethod: null,
    paymentRef: null,
    items: [
      { description: 'Abonnement Pro - Décembre 2024', quantity: 1, unitPrice: 49000, total: 49000 }
    ],
    notes: 'URGENT - Facture en retard de paiement',
    pdfUrl: '/invoices/FAC-2025-004.pdf'
  },
  {
    id: 'inv-005',
    invoiceNumber: 'FAC-2025-005',
    organizationId: 'org-5',
    organization: { id: 'org-5', name: 'Maquis Chez Maman', email: 'maquis@maman.com' },
    restaurantId: 'rest-5',
    restaurant: { id: 'rest-5', name: 'Maquis Chez Maman' },
    type: 'SUBSCRIPTION',
    amount: 0,
    tax: 0,
    taxRate: 0,
    total: 0,
    status: 'DRAFT',
    dueDate: '2025-02-01T00:00:00.000Z',
    createdAt: '2025-01-15T00:00:00.000Z',
    paidAt: null,
    paymentMethod: null,
    paymentRef: null,
    items: [
      { description: 'Plan Starter - Gratuit', quantity: 1, unitPrice: 0, total: 0 }
    ],
    notes: 'Plan gratuit - pas de facturation',
    pdfUrl: null
  },
  {
    id: 'inv-006',
    invoiceNumber: 'FAC-2025-006',
    organizationId: 'org-1',
    organization: { id: 'org-1', name: 'Le Groupe Savana', email: 'contact@savana.com' },
    restaurantId: 'rest-1',
    restaurant: { id: 'rest-1', name: 'KFM DELICE' },
    type: 'EXTRA',
    amount: 25000,
    tax: 0,
    taxRate: 0,
    total: 25000,
    status: 'PAID',
    dueDate: '2025-01-10T00:00:00.000Z',
    createdAt: '2025-01-08T00:00:00.000Z',
    paidAt: '2025-01-09T16:45:00.000Z',
    paymentMethod: 'MTN_MONEY',
    paymentRef: 'MM-456789123',
    items: [
      { description: 'Frais de configuration additionnels', quantity: 1, unitPrice: 15000, total: 15000 },
      { description: 'Support technique prioritaire - Janvier', quantity: 1, unitPrice: 10000, total: 10000 }
    ],
    notes: 'Services additionnels demandés par le client',
    pdfUrl: '/invoices/FAC-2025-006.pdf'
  },
  {
    id: 'inv-007',
    invoiceNumber: 'FAC-2025-007',
    organizationId: 'org-2',
    organization: { id: 'org-2', name: 'Saveurs d\'Afrique', email: 'info@saveurs-afrique.com' },
    restaurantId: 'rest-2',
    restaurant: { id: 'rest-2', name: 'Saveurs d\'Afrique' },
    type: 'PENALTY',
    amount: 5000,
    tax: 0,
    taxRate: 0,
    total: 5000,
    status: 'PENDING',
    dueDate: '2025-01-25T00:00:00.000Z',
    createdAt: '2025-01-18T00:00:00.000Z',
    paidAt: null,
    paymentMethod: null,
    paymentRef: null,
    items: [
      { description: 'Pénalité de retard - FAC-2024-045', quantity: 1, unitPrice: 5000, total: 5000 }
    ],
    notes: 'Pénalité pour retard de paiement',
    pdfUrl: '/invoices/FAC-2025-007.pdf'
  },
  {
    id: 'inv-008',
    invoiceNumber: 'FAC-2025-008',
    organizationId: 'org-6',
    organization: { id: 'org-6', name: 'Restaurant Le Jardin', email: 'contact@le-jardin.com' },
    restaurantId: 'rest-6',
    restaurant: { id: 'rest-6', name: 'Restaurant Le Jardin' },
    type: 'SUBSCRIPTION',
    amount: 99000,
    tax: 0,
    taxRate: 0,
    total: 99000,
    status: 'CANCELLED',
    dueDate: '2025-01-30T00:00:00.000Z',
    createdAt: '2025-01-12T00:00:00.000Z',
    paidAt: null,
    paymentMethod: null,
    paymentRef: null,
    items: [
      { description: 'Abonnement Business - Janvier 2025', quantity: 1, unitPrice: 99000, total: 99000 }
    ],
    notes: 'Annulé - Résiliation du contrat',
    pdfUrl: null
  }
];

// GET /api/admin/invoices - Liste des factures
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const organizationId = searchParams.get('organizationId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const demo = searchParams.get('demo') === 'true';

    let filteredInvoices = [...demoInvoices];

    // Filter by status
    if (status && status !== 'all') {
      filteredInvoices = filteredInvoices.filter(inv => inv.status === status);
    }

    // Filter by organization
    if (organizationId) {
      filteredInvoices = filteredInvoices.filter(inv => inv.organizationId === organizationId);
    }

    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      filteredInvoices = filteredInvoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(searchLower) ||
        inv.organization.name.toLowerCase().includes(searchLower) ||
        inv.restaurant.name.toLowerCase().includes(searchLower)
      );
    }

    // Calculate stats
    const stats = {
      total: filteredInvoices.length,
      totalAmount: filteredInvoices.reduce((sum, inv) => sum + inv.total, 0),
      paid: filteredInvoices.filter(inv => inv.status === 'PAID').length,
      paidAmount: filteredInvoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.total, 0),
      pending: filteredInvoices.filter(inv => inv.status === 'PENDING').length,
      pendingAmount: filteredInvoices.filter(inv => inv.status === 'PENDING').reduce((sum, inv) => sum + inv.total, 0),
      overdue: filteredInvoices.filter(inv => inv.status === 'OVERDUE').length,
      overdueAmount: filteredInvoices.filter(inv => inv.status === 'OVERDUE').reduce((sum, inv) => sum + inv.total, 0),
      draft: filteredInvoices.filter(inv => inv.status === 'DRAFT').length,
      cancelled: filteredInvoices.filter(inv => inv.status === 'CANCELLED').length,
    };

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      data: paginatedInvoices,
      stats,
      pagination: {
        page,
        limit,
        total: filteredInvoices.length,
        totalPages: Math.ceil(filteredInvoices.length / limit)
      }
    });
  });
}

// POST /api/admin/invoices - Créer une facture
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      organizationId,
      restaurantId,
      type = 'EXTRA',
      items,
      notes,
      dueDate
    } = body;

    // Validation
    if (!organizationId || !items || items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Organization ID et articles sont requis'
      }, { status: 400 });
    }

    // Calculate totals
    const amount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const tax = 0; // Pas de TVA pour l'instant
    const total = amount + tax;

    // Generate invoice number
    const invoiceNumber = `FAC-2025-${String(demoInvoices.length + 1).padStart(3, '0')}`;

    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      organizationId,
      organization: { id: organizationId, name: 'Nouvelle Organisation', email: 'new@org.com' },
      restaurantId,
      restaurant: { id: restaurantId, name: 'Restaurant' },
      type,
      amount,
      tax,
      taxRate: 0,
      total,
      status: 'DRAFT',
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      paidAt: null,
      paymentMethod: null,
      paymentRef: null,
      items: items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice
      })),
      notes,
      pdfUrl: null
    };

    // In production, save to database here
    // await prisma.invoice.create({ data: newInvoice });

    return NextResponse.json({
      success: true,
      data: newInvoice,
      message: 'Facture créée avec succès'
    }, { status: 201 });
  });
}
