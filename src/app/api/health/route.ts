// Health check API - Simple route to verify API is working
// Enhanced: includes database warmup on health check
import { NextResponse } from 'next/server';
import { db, ensureDbConnection, getDatabaseStatus } from '@/lib/db';

// Version unique pour forcer le rebuild - VERSION 2.0.2
const BUILD_VERSION = '2.0.2';
const BUILD_TIME = new Date().toISOString();
const BUILD_COMMIT = 'LATEST_DEPLOY';

export async function GET() {
  // Attempt to warm up database connection on health check
  let dbStatus = 'not_configured';
  try {
    if (db) {
      const ready = await ensureDbConnection(10000);
      dbStatus = ready ? 'connected' : getDatabaseStatus();
    }
  } catch (e) {
    dbStatus = 'error';
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    buildTime: BUILD_TIME,
    buildVersion: BUILD_VERSION,
    buildCommit: BUILD_COMMIT,
    message: 'KFM DELICE API is running - VERSION 2.0.2 - DB WARMUP',
    version: BUILD_VERSION,
    demo: false,
    database: dbStatus,
    features: [
      'Authentication',
      'Real-time sync via WebSocket',
      'Guinea as default country',
      'GNF as default currency',
      'Inventory management',
      'Order management',
      'Database auto-warmup',
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
