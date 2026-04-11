// Health check API - Simple route to verify API is working
import { NextResponse } from 'next/server';

// Version unique pour forcer le rebuild - VERSION 2.0.1 - Build 2026-04-09
const BUILD_VERSION = '2.0.1';
const BUILD_TIME = new Date().toISOString();
const BUILD_COMMIT = 'LATEST_DEPLOY';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    buildTime: BUILD_TIME,
    buildVersion: BUILD_VERSION,
    buildCommit: BUILD_COMMIT,
    message: 'KFM DELICE API is running - VERSION 2.0.1 - AUTO-DEPLOY FIX',
    version: BUILD_VERSION,
    demoAccounts: [
      { email: 'admin@kfm-delice.com', password: 'AdminKFM2024!', role: 'SUPER_ADMIN' },
      { email: 'demo@kfm-delice.com', password: 'demo123', role: 'ORG_ADMIN' },
      { email: 'contact@kfm-delice.com', password: 'KfmDelice2024!', role: 'ORG_ADMIN' },
      { email: 'amadou@kfm-delice.com', password: 'kfm2024!', role: 'RESTAURANT_MANAGER' },
    ],
    features: [
      'Authentication with demo mode',
      'Real-time sync via WebSocket',
      'Guinea as default country',
      'GNF as default currency',
      'Inventory management',
      'Order management',
    ],
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    status: 'ok',
    message: 'POST received',
    buildVersion: BUILD_VERSION,
    data: body,
  });
}
