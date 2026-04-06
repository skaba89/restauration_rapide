// Run Prisma migrations via API
// Call this endpoint to trigger database migrations
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: Request) {
  const result = {
    timestamp: new Date().toISOString(),
    success: false,
    message: '',
    output: '',
    error: '',
  };

  // Only allow in production or with secret key
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');

  if (process.env.NODE_ENV !== 'production' && !secret) {
    result.message = 'Migration endpoint - use ?secret=YOUR_KEY in development';
    return NextResponse.json(result, { status: 200 });
  }

  try {
    console.log('Running Prisma db push...');

    const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss --skip-generate', {
      timeout: 120000, // 2 minutes timeout
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
    });

    result.output = stdout;
    result.error = stderr;
    result.success = true;
    result.message = 'Migration completed successfully';

    console.log('Migration stdout:', stdout);
    if (stderr) console.log('Migration stderr:', stderr);

  } catch (error: unknown) {
    result.success = false;
    result.message = 'Migration failed';
    const err = error as { message?: string; stdout?: string };
    result.error = err.message || String(error);
    result.output = err.stdout || '';
    console.error('Migration error:', error);
  }

  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function POST(request: Request) {
  return GET(request);
}
