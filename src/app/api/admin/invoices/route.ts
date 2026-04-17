// ============================================
// Restaurant OS - Admin Invoices API
// API de gestion des factures
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';
import { withAdminAuth } from '@/lib/auth-middleware';

// GET /api/admin/invoices - Liste des factures
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const organizationId = searchParams.get('organizationId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

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
export const POST = withAdminAuth(async (request: NextRequest) => {
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
});