import { NextResponse } from 'next/server';

const DEMO_RESERVATIONS = [
  { id: '1', guestName: 'Amadou Diallo', guestPhone: '+224 622 00 00 01', guestEmail: 'amadou@email.com', partySize: 4, date: new Date().toISOString(), time: '19:00', status: 'CONFIRMED', restaurant: { name: 'KFM DELICE' }, table: { number: 'A1' }, specialRequests: 'Table près de la fenêtre' },
  { id: '2', guestName: 'Fatou Ndiaye', guestPhone: '+224 622 00 00 02', partySize: 2, date: new Date().toISOString(), time: '20:30', status: 'PENDING', restaurant: { name: 'KFM DELICE' } },
  { id: '3', guestName: 'Kofi Mensah', guestPhone: '+224 622 00 00 03', guestEmail: 'kofi@email.com', partySize: 6, date: new Date(Date.now() + 86400000).toISOString(), time: '12:30', status: 'CONFIRMED', restaurant: { name: 'KFM DELICE' }, table: { number: 'B3' }, specialRequests: 'Anniversaire' },
];

export async function GET() {
  try {
    const { db, isDatabaseAvailable } = await import('@/lib/db');
    if (isDatabaseAvailable() && db) {
      const reservations = await db.reservation.findMany({ take: 50, orderBy: { createdAt: 'desc' }, include: { restaurant: { select: { name: true } }, tables: { include: { table: { select: { number: true } } } } } });
      return NextResponse.json({ data: reservations, total: reservations.length });
    }
  } catch (error) { console.error('Database error:', error); }
  return NextResponse.json({ data: DEMO_RESERVATIONS, total: DEMO_RESERVATIONS.length });
}
