import { NextResponse, NextRequest } from 'next/server';
import { getDemoOrders } from '@/lib/demo-order-store';
import { withAdminAuth } from '@/lib/auth-middleware';

export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    // Try to fetch from database
    const { db, isDatabaseAvailable } = await import('@/lib/db');
    
    if (isDatabaseAvailable() && db) {
      try {
        const orders = await db.order.findMany({
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: {
            restaurant: { select: { name: true } },
            customer: { select: { firstName: true, lastName: true, phone: true } },
            items: true,
          },
        });
        if (orders.length > 0) {
          return NextResponse.json({ data: orders, total: orders.length });
        }
      } catch (dbError) {
        console.warn('Database error in admin orders:', dbError);
      }
    }
  } catch (error) {
    console.error('Admin orders error:', error);
  }
  
  // Return demo data from SHARED store (same as kitchen)
  const demoOrders = getDemoOrders().map(o => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    restaurant: { name: 'KFM DELICE' },
    orderType: o.orderType,
    status: o.status,
    paymentStatus: o.paymentStatus,
    subtotal: o.subtotal,
    total: o.total,
    deliveryFee: o.deliveryFee,
    deliveryAddress: o.deliveryAddress,
    deliveryCity: o.deliveryCity,
    tableNumber: o.tableNumber,
    notes: o.notes,
    priority: o.priority,
    driverName: o.driverName,
    driverPhone: o.driverPhone,
    items: o.items.map(item => ({
      id: item.id,
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      status: item.status,
      notes: item.notes,
    })),
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    completedAt: o.completedAt,
    cancelledAt: o.cancelledAt,
    cancellationReason: o.cancellationReason,
  }));

  return NextResponse.json({ data: demoOrders, total: demoOrders.length });
});
