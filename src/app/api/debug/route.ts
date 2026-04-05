// Debug endpoint to check database connection
// This helps diagnose deployment issues
import { NextResponse } from 'next/server';

export async function GET() {
  const debug = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      hasUrl: !!process.env.DATABASE_URL,
      urlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'not_set',
      isPostgres: process.env.DATABASE_URL?.startsWith('postgresql://') || process.env.DATABASE_URL?.startsWith('postgres://') || false,
    },
    app: {
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL || 'not_set',
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not_set',
    },
    defaults: {
      defaultCountry: process.env.DEFAULT_COUNTRY_CODE || 'not_set',
      defaultCurrency: process.env.DEFAULT_CURRENCY_CODE || 'not_set',
    },
  };

  // Try to connect to database
  let dbStatus = 'not_tested';
  let dbError = null;
  let tableCount = 0;

  try {
    const { db } = await import('@/lib/db');

    // Test basic connection
    await db.$queryRaw`SELECT 1 as test`;
    dbStatus = 'connected';

    // Try to count some tables
    try {
      const currencies = await db.currency.count();
      const countries = await db.country.count();
      const users = await db.user.count();
      const restaurants = await db.restaurant.count();
      tableCount = currencies + countries + users + restaurants;

      debug.database = {
        ...debug.database,
        status: dbStatus,
        tables: {
          currencies,
          countries,
          users,
          restaurants,
        },
      };
    } catch (tableError) {
      debug.database = {
        ...debug.database,
        status: 'tables_missing',
        error: tableError instanceof Error ? tableError.message : 'Unknown error',
      };
    }
  } catch (error) {
    dbStatus = 'error';
    dbError = error instanceof Error ? error.message : 'Unknown database error';
    debug.database = {
      ...debug.database,
      status: dbStatus,
      error: dbError,
    };
  }

  // Provide actionable recommendations
  const recommendations: string[] = [];

  if (!debug.database.hasUrl) {
    recommendations.push('DATABASE_URL is not set. Add it in Render environment variables.');
  } else if (!debug.database.isPostgres) {
    recommendations.push('DATABASE_URL should be a PostgreSQL connection string starting with postgresql://');
  }

  if (!debug.app.hasNextAuthSecret) {
    recommendations.push('NEXTAUTH_SECRET is not set. Generate one with: openssl rand -base64 32');
  }

  if (!debug.app.hasNextAuthUrl) {
    recommendations.push('NEXTAUTH_URL should be set to https://kfm-delice.onrender.com');
  }

  if (debug.database.status === 'error') {
    recommendations.push('Database connection failed. Check if Neon database is accessible.');
    recommendations.push('Try adding ?sslmode=require to DATABASE_URL');
  }

  if (debug.database.status === 'tables_missing' || (debug.database.status === 'connected' && tableCount === 0)) {
    recommendations.push('Database is empty. Call /api/setup/kfm-delice to seed data.');
  }

  return NextResponse.json({
    ...debug,
    recommendations,
    nextSteps: recommendations.length > 0 ? recommendations : ['All checks passed! Try accessing /menu/kfm-delice'],
  });
}
