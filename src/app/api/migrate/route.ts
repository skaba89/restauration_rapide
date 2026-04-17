// Run Prisma migrations via API - DISABLED for security reasons
// This endpoint was removed in P1 remediation because it allowed Remote Code Execution
// via command injection without authentication. Run migrations via CLI instead.
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Endpoint désactivé pour raisons de sécurité. Exécutez les migrations via CLI: npx prisma db push' },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Endpoint désactivé pour raisons de sécurité. Exécutez les migrations via CLI: npx prisma db push' },
    { status: 410 }
  );
}
