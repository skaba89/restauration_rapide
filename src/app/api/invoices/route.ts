import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrencyCodeSync, formatCurrency } from '@/lib/currency-context';

// GET /api/invoices - Get all invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const restaurantId = searchParams.get('restaurantId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const demo = searchParams.get('demo') === 'true';

    if (demo || !organizationId) {
      // Return demo data
      const demoInvoices = [
        {
          id: '1',
          invoiceNumber: 'FAC-2024-001',
          type: 'client',
          status: 'paid',
          clientName: 'Entreprise ABC',
          clientEmail: 'contact@abc.com',
          clientPhone: '+224 620 00 00 10',
          issueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          items: [
            { id: '1', description: 'Service traiteur - Réunion annuelle', quantity: 1, unitPrice: 2500000, totalPrice: 2500000 },
          ],
          subtotal: 2500000,
          tax: 0,
          discount: 0,
          total: 2500000,
          currency: 'GNF',
          createdAt: new Date(),
        },
      ];
      
      return NextResponse.json({ success: true, data: { invoices: demoInvoices } });
    }

    const where: any = { organizationId };
    if (restaurantId) where.restaurantId = restaurantId;
    if (type) where.type = type;
    if (status) where.status = status;

    const invoices = await db.invoice.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: { invoices } });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organizationId,
      restaurantId,
      type,
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      supplierId,
      dueDate,
      items,
      notes,
      terms,
    } = body;

    const demo = new URL(request.url).searchParams.get('demo') === 'true';
    
    if (demo || !organizationId) {
      return NextResponse.json({
        success: true,
        data: {
          invoice: {
            id: `demo-${Date.now()}`,
            invoiceNumber: `FAC-2024-${Date.now().toString().slice(-3)}`,
            ...body,
            status: 'draft',
            createdAt: new Date(),
          },
        },
      });
    }

    // Generate invoice number
    const lastInvoice = await db.invoice.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    const invoiceNumber = lastInvoice
      ? `FAC-${new Date().getFullYear()}-${String(parseInt(lastInvoice.invoiceNumber.split('-')[2]) + 1).padStart(3, '0')}`
      : `FAC-${new Date().getFullYear()}-001`;

    const subtotal = items.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
    const total = subtotal;

    const invoice = await db.invoice.create({
      data: {
        organizationId,
        restaurantId,
        invoiceNumber,
        type: type || 'client',
        status: 'draft',
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        supplierId,
        issueDate: new Date(),
        dueDate: new Date(dueDate || Date.now() + 15 * 24 * 60 * 60 * 1000),
        subtotal,
        total,
        currency: getCurrencyCodeSync(),
        notes,
        terms,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, data: { invoice } });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

// PUT /api/invoices - Update invoice
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, ...updateData } = body;

    const demo = new URL(request.url).searchParams.get('demo') === 'true';
    
    if (demo || !id) {
      return NextResponse.json({
        success: true,
        data: {
          invoice: {
            id: id || `demo-${Date.now()}`,
            ...body,
            updatedAt: new Date(),
          },
        },
      });
    }

    const updatePayload: any = { ...updateData };
    
    if (status === 'paid') {
      updatePayload.paidAt = new Date();
    }
    
    updatePayload.status = status;

    const invoice = await db.invoice.update({
      where: { id },
      data: updatePayload,
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, data: { invoice } });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices - Delete invoice
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const demo = searchParams.get('demo') === 'true';

    if (demo || !id) {
      return NextResponse.json({ success: true });
    }

    await db.invoice.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
