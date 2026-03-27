import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, rateLimitConfigs } from '@/lib/rate-limit';

// ============================================
// Validation Schema
// ============================================

const unsubscribeSchema = z.object({
  endpoint: z.string().url('Invalid push endpoint'),
});

// ============================================
// POST /api/push/unsubscribe
// Unsubscribe from push notifications
// ============================================

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rateResult = checkRateLimit(clientIp, rateLimitConfigs.standard);
  
  if (!rateResult.success) {
    return NextResponse.json(
      { success: false, error: 'Trop de requêtes' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    
    // Validate input
    const validation = unsubscribeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données invalides',
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const { endpoint } = validation.data;

    // In production, remove from database
    // await prisma.pushSubscription.deleteMany({
    //   where: { endpoint }
    // });

    console.log('[Push] Unsubscribed:', endpoint.substring(0, 50) + '...');

    return NextResponse.json({
      success: true,
      message: 'Désinscription réussie',
    });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la désinscription' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/push/unsubscribe
// Alternative DELETE method for unsubscription
// ============================================

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json(
      { success: false, error: 'Endpoint requis' },
      { status: 400 }
    );
  }

  try {
    // In production, remove from database
    // await prisma.pushSubscription.deleteMany({
    //   where: { endpoint }
    // });

    console.log('[Push] Unsubscribed (DELETE):', endpoint.substring(0, 50) + '...');

    return NextResponse.json({
      success: true,
      message: 'Désinscription réussie',
    });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la désinscription' },
      { status: 500 }
    );
  }
}
