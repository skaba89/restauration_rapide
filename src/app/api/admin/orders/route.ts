import { NextResponse } from 'next/server';

// Demo data for admin orders
const DEMO_ORDERS = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    customerName: 'Amadou Diallo',
    customerPhone: '+224 622 00 00 01',
    restaurant: { name: 'KFM DELICE' },
    orderType: 'DELIVERY',
    status: 'PREPARING',
    paymentStatus: 'PAID',
    total: 45000,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    customerName: 'Fatou Ndiaye',
    customerPhone: '+224 622 00 00 02',
    restaurant: { name: 'KFM DELICE' },
    orderType: 'DINE_IN',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    total: 25000,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    customerName: 'Kofi Mensah',
    customerPhone: '+224 622 00 00 03',
    restaurant: { name: 'KFM DELICE' },
    orderType: 'TAKEAWAY',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    total: 35000,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export async function GET() {
  try {
    // Try to fetch from database
    const { db, isDatabaseAvailable } = await import('@/lib/db');
    
    if (isDatabaseAvailable() && db) {
      const orders = await db.order.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          restaurant: { select: { name: true } },
          customer: { select: { firstName: true, lastName: true, phone: true } },
          items: { select: { name: true, quantity: true, price: true } },
        },
      });
      return NextResponse.json({ data: orders, total: orders.length });
    }
  } catch (error) {
    console.error('Database error:', error);
  }
  
  // Return demo data
  return NextResponse.json({ data: DEMO_ORDERS, total: DEMO_ORDERS.length });
}
