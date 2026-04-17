// Debug endpoint to check database connection
// SECURITY: Blocked in production, requires SUPER_ADMIN auth in dev
import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/auth-middleware';

export const GET = withRole(['SUPER_ADMIN'], async (request: NextRequest) => {
  // Block entirely in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint is disabled in production',
    }, { status: 404 });
  }

  const debug: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      hasUrl: !!process.env.DATABASE_URL,
      isPostgres: process.env.DATABASE_URL?.startsWith('postgresql://') || process.env.DATABASE_URL?.startsWith('postgres://') || false,
    },
    defaults: {
      defaultCountry: process.env.DEFAULT_COUNTRY_CODE || 'not_set',
      defaultCurrency: process.env.DEFAULT_CURRENCY_CODE || 'not_set',
    },
  };

  // Try to connect to database
  let dbStatus = 'not_tested';

  try {
    const { db } = await import('@/lib/db');

    if (!db) {
      debug.database = {
        ...(debug.database as object),
        status: 'unavailable',
        error: 'Database client not initialized',
      };
    } else {
      // Test basic connection
      await db.$queryRaw`SELECT 1 as test`;
      dbStatus = 'connected';

      // Try to count some tables
      try {
        const currencies = await db.currency.count();
        const countries = await db.country.count();
        const users = await db.user.count();
        const restaurants = await db.restaurant.count();

        debug.database = {
          ...(debug.database as object),
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
          ...(debug.database as object),
          status: 'tables_missing',
          error: tableError instanceof Error ? tableError.message : 'Unknown error',
        };
      }
    }
  } catch (error) {
    dbStatus = 'error';
    const dbError = error instanceof Error ? error.message : 'Unknown database error';
    debug.database = {
      ...(debug.database as object),
      status: dbStatus,
      error: dbError,
    };
  }

  // Provide actionable recommendations
  const recommendations: string[] = [];

  if (!(debug.database as Record<string, unknown>).hasUrl) {
    recommendations.push('DATABASE_URL is not set. Add it in Render environment variables.');
  } else if (!(debug.database as Record<string, unknown>).isPostgres) {
    recommendations.push('DATABASE_URL should be a PostgreSQL connection string starting with postgresql://');
  }

  if ((debug.database as Record<string, unknown>).status === 'error') {
    recommendations.push('Database connection failed. Check if Neon database is accessible.');
    recommendations.push('Try adding ?sslmode=require to DATABASE_URL');
  }

  if ((debug.database as Record<string, unknown>).status === 'tables_missing') {
    recommendations.push('Database is empty. Call /api/setup/kfm-delice to seed data.');
  }

  return NextResponse.json({
    ...debug,
    recommendations,
    nextSteps: recommendations.length > 0 ? recommendations : ['All checks passed! Try accessing /menu/kfm-delice'],
  });
});
