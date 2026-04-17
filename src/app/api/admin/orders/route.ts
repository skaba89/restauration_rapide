import { NextResponse, NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/auth-middleware';

export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { db, isDatabaseAvailable } = await import('@/lib/db');
    
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json(
        { success: false, error: 'Base de données non disponible' },
        { status: 503 }
      );
    }
    
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
  } catch (error) {
    console.error('Admin orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des commandes' },
      { status: 500 }
    );
  }
});
