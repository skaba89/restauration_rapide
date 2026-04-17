import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { db, isDatabaseAvailable } = await import('@/lib/db');
    if (isDatabaseAvailable() && db) {
      const deliveries = await db.delivery.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          order: { include: { restaurant: { select: { name: true } } } },
          driver: { select: { firstName: true, lastName: true, phone: true } },
        },
      });
      return NextResponse.json({ data: deliveries, total: deliveries.length });
    }
  } catch (error) {
    console.error('Database error:', error);
  }
  return NextResponse.json({ data: [], total: 0 });
}