// ============================================
// Restaurant OS - Invoice Download API
// GET /api/invoices/[orderId] - Generate and download PDF invoice
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { 
  generateInvoicePDF, 
  InvoiceData 
} from '@/lib/pdf/invoice';
import { db, isDatabaseAvailable } from '@/lib/db';

// ============================================
// GET - Generate and download invoice PDF
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const language = (searchParams.get('lang') === 'en' ? 'en' : 'fr') as 'fr' | 'en';

    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json(
        { success: false, error: 'Base de données non disponible' },
        { status: 503 }
      );
    }

    const invoiceData = await fetchInvoiceData(orderId, language);
    
    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);
    
    // Return PDF response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoiceData.invoiceNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    console.error('Error generating invoice:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error && error.message === 'Commande non trouvée'
          ? 'Commande non trouvée'
          : 'Failed to generate invoice',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: error instanceof Error && error.message === 'Commande non trouvée' ? 404 : 500 }
    );
  }
}

// ============================================
// Fetch Invoice Data from Database
// ============================================

async function fetchInvoiceData(orderId: string, language: 'fr' | 'en'): Promise<InvoiceData> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      customer: true,
      payments: {
        where: { status: { in: ['COMPLETED', 'PAID', 'PENDING'] } },
        take: 1,
      },
      delivery: {
        include: {
          driver: true,
        },
      },
      restaurant: true,
      table: true,
    },
  });
  
  if (!order) {
    throw new Error('Commande non trouvée');
  }
  
  // Map order to invoice data
  const restaurant = order.restaurant || {
    name: 'Restaurant OS',
    address: '',
    phone: '',
    email: '',
  };
  
  const payment = order.payments?.[0];

  const invoiceData: InvoiceData = {
    invoiceNumber: `INV-${new Date().getFullYear()}-${orderId.slice(-8).toUpperCase()}`,
    orderNumber: order.orderNumber || orderId,
    invoiceDate: order.createdAt,
    dueDate: new Date(order.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000),
    
    restaurant: {
      name: restaurant.name,
      address: restaurant.address || undefined,
      phone: restaurant.phone || undefined,
      email: restaurant.email || undefined,
      taxId: restaurant.taxId || undefined,
      website: restaurant.website || undefined,
    },
    
    customer: order.customer ? {
      name: order.customer.name || order.customerName || '',
      email: order.customer.email || order.customerEmail || undefined,
      phone: order.customer.phone || order.customerPhone || undefined,
      address: order.customer.address || undefined,
    } : (order.customerName ? {
      name: order.customerName,
      phone: order.customerPhone || undefined,
      email: order.customerEmail || undefined,
    } : undefined),
    
    orderType: (order.orderType || 'DINE_IN') as 'DINE_IN' | 'DELIVERY' | 'TAKEAWAY',
    tableNumber: order.tableNumber || undefined,
    
    items: order.items.map(item => ({
      name: item.itemName || 'Item',
      description: (item as any).menuItem?.description || undefined,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.unitPrice * item.quantity,
      notes: item.notes || undefined,
    })),
    
    subtotal: order.subtotal || order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    tax: order.tax || 0,
    taxRate: 18,
    discount: order.discount || undefined,
    tip: order.tip || undefined,
    deliveryFee: order.deliveryFee || undefined,
    total: order.total,
    currency: 'XOF',
    
    payment: {
      method: (payment?.method || 'CASH') as any,
      amount: order.total,
      reference: payment?.reference || undefined,
      phoneNumber: payment?.phoneNumber || undefined,
      status: (payment?.status || 'COMPLETED') as any,
    },
    
    delivery: order.delivery ? {
      address: order.delivery.address,
      fee: (order.delivery as any).fee || order.deliveryFee || 0,
      driverName: (order.delivery as any).driver?.name || undefined,
      driverPhone: (order.delivery as any).driver?.phone || undefined,
      estimatedTime: (order.delivery as any).estimatedTime || undefined,
    } : undefined,
    
    notes: order.notes || undefined,
    
    language,
  };
  
  return invoiceData;
}

// ============================================
// OPTIONS - CORS support
// ============================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
