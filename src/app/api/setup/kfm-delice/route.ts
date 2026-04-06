// Setup KFM DELICE - Calls the main setup endpoint
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Call the main setup endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010';
    const response = await fetch(`${baseUrl}/api/setup/db`);
    const data = await response.json();
    
    return NextResponse.json({
      message: 'KFM DELICE setup triggered',
      setupResult: data,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json({
      success: false,
      error: err.message || 'Setup failed',
    }, { status: 500 });
  }
}
