import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { db, isDatabaseAvailable } = await import('@/lib/db');

    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json(
        { success: false, error: 'Base de données non disponible' },
        { status: 503 }
      );
    }

    const reservations = await db.reservation.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        restaurant: { select: { name: true } },
        tables: { include: { table: { select: { number: true } } } },
      },
    });
    return NextResponse.json({ data: reservations, total: reservations.length });
  } catch (error) {
    console.error('Admin reservations error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des réservations' },
      { status: 500 }
    );
  }
}
