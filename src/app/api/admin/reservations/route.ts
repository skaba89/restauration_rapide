import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { db, isDatabaseAvailable } = await import('@/lib/db');
    if (isDatabaseAvailable() && db) {
      const reservations = await db.reservation.findMany({ take: 50, orderBy: { createdAt: 'desc' }, include: { restaurant: { select: { name: true } }, tables: { include: { table: { select: { number: true } } } } } });
      return NextResponse.json({ data: reservations, total: reservations.length });
    }
  } catch (error) { console.error('Database error:', error); }
  return NextResponse.json({ data: [], total: 0 });
}