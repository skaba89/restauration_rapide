import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, rateLimitConfigs } from '@/lib/rate-limit';

// ============================================
// Validation Schema
// ============================================

const subscribeSchema = z.object({
  endpoint: z.string().url('Invalid push endpoint'),
  keys: z.object({
    p256dh: z.string().min(1, 'p256dh key is required'),
    auth: z.string().min(1, 'auth key is required'),
  }),
  userId: z.string().optional(),
});

// ============================================
// POST /api/push/subscribe
// Subscribe to push notifications
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
    const validation = subscribeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données d\'abonnement invalides',
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const { endpoint, keys, userId } = validation.data;

    // Get user ID from session or request
    const effectiveUserId = userId || 'demo-user-id';

    // In production, save to database
    // await prisma.pushSubscription.create({
    //   data: {
    //     userId: effectiveUserId,
    //     endpoint,
    //     p256dh: keys.p256dh,
    //     auth: keys.auth,
    //   }
    // });

    console.log('[Push] Subscription saved:', { userId: effectiveUserId, endpoint: endpoint.substring(0, 50) + '...' });

    return NextResponse.json({
      success: true,
      message: 'Subscription enregistrée avec succès',
      subscriptionId: `sub-${Date.now()}`,
    });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}

// ============================================
// GET /api/push/subscribe
// Get VAPID public key for client-side subscription
// ============================================

export async function GET() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!vapidPublicKey) {
    return NextResponse.json({
      success: false,
      error: 'Push notifications not configured',
      configured: false,
    });
  }

  return NextResponse.json({
    success: true,
    configured: true,
    vapidPublicKey,
  });
}
