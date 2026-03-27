// ============================================
// Restaurant OS - Invoice Download API
// GET /api/invoices/[orderId] - Generate and download PDF invoice
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { 
  generateInvoicePDF, 
  getDemoInvoiceData,
  InvoiceData 
} from '@/lib/pdf/invoice';
import { db } from '@/lib/db';

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
    const demo = searchParams.get('demo') === 'true';
    const language = (searchParams.get('lang') === 'en' ? 'en' : 'fr') as 'fr' | 'en';
    
    let invoiceData: InvoiceData;
    
    if (demo) {
      // Use demo data
      invoiceData = getDemoInvoiceData(language);
      invoiceData.orderNumber = orderId;
    } else {
      // Fetch real data from database
      invoiceData = await fetchInvoiceData(orderId, language);
    }
    
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
        error: 'Failed to generate invoice',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================
// Fetch Invoice Data from Database
// ============================================

async function fetchInvoiceData(orderId: string, language: 'fr' | 'en'): Promise<InvoiceData> {
  // Try to fetch from database
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
        payment: true,
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
      // Fall back to demo data if order not found
      console.log(`Order ${orderId} not found, using demo data`);
      const demoData = getDemoInvoiceData(language);
      demoData.orderNumber = orderId;
      return demoData;
    }
    
    // Map order to invoice data
    const restaurant = order.restaurant || {
      name: 'Restaurant OS',
      address: '',
      phone: '',
      email: '',
    };
    
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
        name: order.customer.name || '',
        email: order.customer.email || undefined,
        phone: order.customer.phone || undefined,
        address: order.customer.address || undefined,
      } : undefined,
      
      orderType: (order.orderType || 'DINE_IN') as 'DINE_IN' | 'DELIVERY' | 'TAKEAWAY',
      tableNumber: order.table?.number?.toString(),
      
      items: order.items.map(item => ({
        name: item.product?.name || item.name || 'Item',
        description: item.product?.description || undefined,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity,
        notes: item.notes || undefined,
      })),
      
      subtotal: order.subtotal || order.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      tax: order.tax || 0,
      taxRate: 18,
      discount: order.discount || undefined,
      tip: order.tip || undefined,
      deliveryFee: order.deliveryFee || undefined,
      total: order.total,
      currency: order.currency || 'XOF',
      
      payment: {
        method: (order.payment?.method || 'CASH') as any,
        amount: order.total,
        reference: order.payment?.reference || undefined,
        phoneNumber: order.payment?.phoneNumber || undefined,
        status: (order.payment?.status || 'COMPLETED') as any,
      },
      
      delivery: order.delivery ? {
        address: order.delivery.address,
        fee: order.delivery.fee || 0,
        driverName: order.delivery.driver?.name || undefined,
        driverPhone: order.delivery.driver?.phone || undefined,
        estimatedTime: order.delivery.estimatedTime || undefined,
      } : undefined,
      
      notes: order.notes || undefined,
      
      language,
    };
    
    return invoiceData;
    
  } catch (dbError) {
    console.error('Database error, falling back to demo data:', dbError);
    const demoData = getDemoInvoiceData(language);
    demoData.orderNumber = orderId;
    return demoData;
  }
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
