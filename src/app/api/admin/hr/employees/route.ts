import { NextResponse } from 'next/server';

const DEMO_EMPLOYEES = [
  { id: '1', firstName: 'Amadou', lastName: 'Diallo', email: 'amadou@kfm-delice.com', phone: '+224 622 00 00 01', role: 'MANAGER', department: 'Administration', restaurant: { name: 'KFM DELICE' }, status: 'ACTIVE', salary: 1500000, hireDate: '2023-01-15', performance: 95, attendance: 98 },
  { id: '2', firstName: 'Fatou', lastName: 'Ndiaye', email: 'fatou@kfm-delice.com', phone: '+224 622 00 00 02', role: 'CHEF', department: 'Cuisine', restaurant: { name: 'KFM DELICE' }, status: 'ACTIVE', salary: 800000, hireDate: '2023-03-20', performance: 88, attendance: 95 },
  { id: '3', firstName: 'Kofi', lastName: 'Mensah', email: 'kofi@kfm-delice.com', phone: '+224 622 00 00 03', role: 'WAITER', department: 'Service', restaurant: { name: 'KFM DELICE' }, status: 'ACTIVE', salary: 400000, hireDate: '2023-06-10', performance: 92, attendance: 90 },
  { id: '4', firstName: 'Aisha', lastName: 'Bamba', email: 'aisha@kfm-delice.com', phone: '+224 622 00 00 04', role: 'CASHIER', department: 'Caisse', restaurant: { name: 'KFM DELICE' }, status: 'ACTIVE', salary: 450000, hireDate: '2023-08-01', performance: 85, attendance: 100 },
];

export async function GET() {
  try {
    const { db, isDatabaseAvailable } = await import('@/lib/db');
    if (isDatabaseAvailable() && db) {
      const employees = await db.user.findMany({ where: { role: { not: 'CUSTOMER' } }, take: 50, include: { staffProfiles: { include: { restaurant: { select: { name: true } } } }, organizationUsers: { include: { organization: { select: { name: true } } } } } });
      return NextResponse.json({ data: employees, total: employees.length });
    }
  } catch (error) { console.error('Database error:', error); }
  return NextResponse.json({ data: DEMO_EMPLOYEES, total: DEMO_EMPLOYEES.length });
}
