// ============================================
// Restaurant OS - Receipt Download API
// GET /api/receipts/[orderId] - Generate and download PDF receipt (80mm thermal)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { 
  generateReceiptPDF, 
  generateTextReceipt,
  getDemoReceiptData,
  ReceiptData 
} from '@/lib/pdf/receipt';
import { db } from '@/lib/db';

// ============================================
// GET - Generate and download receipt PDF
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
    const format = searchParams.get('format') || 'pdf'; // 'pdf' or 'text'
    
    let receiptData: ReceiptData;
    
    if (demo) {
      // Use demo data
      receiptData = getDemoReceiptData(language);
      receiptData.orderNumber = orderId;
    } else {
      // Fetch real data from database
      receiptData = await fetchReceiptData(orderId, language);
    }
    
    // Check format requested
    if (format === 'text') {
      // Return plain text receipt for direct thermal printing
      const textReceipt = generateTextReceipt(receiptData);
      
      return new NextResponse(textReceipt, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="receipt-${receiptData.orderNumber}.txt"`,
          'Cache-Control': 'no-cache',
        },
      });
    }
    
    // Generate PDF receipt
    const pdfBuffer = await generateReceiptPDF(receiptData);
    
    // Return PDF response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${receiptData.orderNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    console.error('Error generating receipt:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate receipt',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================
// Fetch Receipt Data from Database
// ============================================

async function fetchReceiptData(orderId: string, language: 'fr' | 'en'): Promise<ReceiptData> {
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
      const demoData = getDemoReceiptData(language);
      demoData.orderNumber = orderId;
      return demoData;
    }
    
    // Map order to receipt data
    const restaurant = order.restaurant || {
      name: 'Restaurant OS',
      address: '',
      phone: '',
    };
    
    const receiptData: ReceiptData = {
      restaurant: {
        name: restaurant.name,
        address: restaurant.address || undefined,
        phone: restaurant.phone || undefined,
        taxId: restaurant.taxId || undefined,
      },
      
      orderNumber: order.orderNumber || orderId,
      orderType: (order.orderType || 'DINE_IN') as 'DINE_IN' | 'DELIVERY' | 'TAKEAWAY',
      tableNumber: order.table?.number?.toString(),
      
      customerName: order.customer?.name || undefined,
      customerPhone: order.customer?.phone || undefined,
      
      items: order.items.map(item => ({
        name: item.product?.name || item.name || 'Item',
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
      },
      
      delivery: order.delivery ? {
        address: order.delivery.address,
        driverName: order.delivery.driver?.name || undefined,
        driverPhone: order.delivery.driver?.phone || undefined,
      } : undefined,
      
      date: order.createdAt,
      notes: order.notes || undefined,
      
      language,
    };
    
    return receiptData;
    
  } catch (dbError) {
    console.error('Database error, falling back to demo data:', dbError);
    const demoData = getDemoReceiptData(language);
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
