// Health check API - Simple route to verify API is working
import { NextResponse } from 'next/server';

const BUILD_TIME = new Date().toISOString();

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    buildTime: BUILD_TIME,
    message: 'KFM DELICE API is running',
    version: '1.0.1',
    demoAccounts: [
      { email: 'demo@kfm-delice.com', password: 'demo123', role: 'ORG_ADMIN' },
      { email: 'contact@kfm-delice.com', password: 'KfmDelice2024!', role: 'ORG_ADMIN' },
      { email: 'admin@kfm-delice.com', password: 'AdminKFM2024!', role: 'SUPER_ADMIN' },
    ],
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    status: 'ok',
    message: 'POST received',
    data: body,
  });
}
