// Fix Admin Password - DISABLED for security reasons
// This endpoint was removed in P1 remediation because it exposed hardcoded credentials
// without any authentication. Use /api/setup/reset-admin with proper auth instead.
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Endpoint désactivé pour raisons de sécurité. Utilisez /api/setup/reset-admin avec authentification.' },
    { status: 410 }
  );
}
