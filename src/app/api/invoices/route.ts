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