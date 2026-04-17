import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { db, isDatabaseAvailable } = await import('@/lib/db');
    if (isDatabaseAvailable() && db) {
      const employees = await db.user.findMany({ where: { role: { not: 'CUSTOMER' } }, take: 50, include: { staffProfiles: { include: { restaurant: { select: { name: true } } } }, organizationUsers: { include: { organization: { select: { name: true } } } } } });
      return NextResponse.json({ data: employees, total: employees.length });
    }
  } catch (error) { console.error('Database error:', error); }
  return NextResponse.json({ data: [], total: 0 });
}