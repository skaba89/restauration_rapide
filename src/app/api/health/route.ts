// Health check API - Simple route to verify API is working
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'KFM DELICE API is running',
    version: '1.0.0',
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
