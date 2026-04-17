import { NextResponse, NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/auth-middleware';

export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { db, isDatabaseAvailable } = await import('@/lib/db');
    
    if (isDatabaseAvailable() && db) {
      const orders = await db.order.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          restaurant: { select: { name: true } },
          customer: { select: { firstName: true, lastName: true, phone: true } },
          items: true,
        },
      });
      return NextResponse.json({ data: orders, total: orders.length });
    }
  } catch (error) {
    console.error('Admin orders error:', error);
  }
  
  return NextResponse.json({ data: [], total: 0 });
});
