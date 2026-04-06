import { NextResponse } from 'next/server';

const DEMO_DELIVERIES = [
  {
    id: '1',
    order: { orderNumber: 'ORD-001', customerName: 'Amadou Diallo', customerPhone: '+224 622 00 00 01', restaurant: { name: 'KFM DELICE' } },
    driver: { firstName: 'Ibrahim', lastName: 'Touré', phone: '+224 622 00 00 10' },
    status: 'IN_TRANSIT',
    pickupAddress: 'Kaloum, Conakry',
    dropoffAddress: 'Dixinn, Conakry',
    deliveryFee: 5000,
    distance: 5.2,
    estimatedTime: 25,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    order: { orderNumber: 'ORD-002', customerName: 'Fatou Ndiaye', customerPhone: '+224 622 00 00 02', restaurant: { name: 'KFM DELICE' } },
    driver: { firstName: 'Mariama', lastName: 'Diallo', phone: '+224 622 00 00 11' },
    status: 'PICKED_UP',
    pickupAddress: 'Kaloum, Conakry',
    dropoffAddress: 'Matam, Conakry',
    deliveryFee: 3500,
    distance: 3.8,
    estimatedTime: 18,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '3',
    order: { orderNumber: 'ORD-003', customerName: 'Kofi Mensah', customerPhone: '+224 622 00 00 03', restaurant: { name: 'KFM DELICE' } },
    status: 'PENDING',
    pickupAddress: 'Kaloum, Conakry',
    dropoffAddress: 'Ratoma, Conakry',
    deliveryFee: 6000,
    distance: 7.5,
    estimatedTime: 35,
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
];

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
  return NextResponse.json({ data: DEMO_DELIVERIES, total: DEMO_DELIVERIES.length });
}
