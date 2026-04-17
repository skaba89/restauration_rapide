// Integrations API - Third-party service integrations management
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';

// GET /api/integrations - List integrations
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const type = searchParams.get('type');
    const provider = searchParams.get('provider');
    const status = searchParams.get('status');

    // For real database - would need an Integration model
    return apiSuccess({
      data: [
        { type: 'payment' },
        { type: 'messaging' },
        { type: 'maps' },
        { type: 'social' },
        { type: 'analytics' },
      ],
      summary: {
        total: 10,
        active: 7,
        pending: 1,
        inactive: 2,
        byType: {
          payment: 3,
          messaging: 3,
          maps: 1,
          social: 2,
          analytics: 1,
        },
      },
    });
  });
}

// POST /api/integrations - Configure integration
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      organizationId,
      type,
      provider,
      name,
      config,
      features,
    } = body;

    // Validation
    if (!organizationId || !type || !provider) {
      return apiError('organisation, type et provider sont requis');
    }

    // Validate config based on provider
    const validationErrors = validateConfig(provider, config);
    if (validationErrors.length > 0) {
      return apiError(`Configuration invalide: ${validationErrors.join(', ')}`);
    }

    // In production, would save to database
    const integration = {
      id: `int-${Date.now()}`,
      type,
      provider,
      name: name || provider,
      status: 'pending',
      config: maskSensitiveConfig(config),
      features: features || [],
      createdAt: new Date(),
      lastSync: null,
    };

    return apiSuccess(integration, 'Intégration configurée avec succès', 201);
  });
}

// PATCH /api/integrations - Update integration
export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { id, config, status, features } = body;

    if (!id) {
      return apiError('ID est requis');
    }

    // In production, would update in database
    const updated = {
      id,
      config: config ? maskSensitiveConfig(config) : undefined,
      status,
      features,
      lastSync: new Date(),
    };

    return apiSuccess(updated, 'Intégration mise à jour');
  });
}

// DELETE /api/integrations - Disconnect integration
export async function DELETE(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('ID est requis');
    }

    // In production, would delete from database
    return apiSuccess({ deleted: true }, 'Intégration déconnectée');
  });
}

// Helper functions
function validateConfig(provider: string, config: Record<string, any>): string[] {
  const errors: string[] = [];
  
  switch (provider) {
    case 'orange_money':
      if (!config.merchantCode) errors.push('merchantCode requis');
      if (!config.apiKey) errors.push('apiKey requis');
      break;
    case 'mtn_momo':
      if (!config.subscriptionKey) errors.push('subscriptionKey requis');
      if (!config.apiKey) errors.push('apiKey requis');
      break;
    case 'whatsapp_business':
      if (!config.phoneNumberId) errors.push('phoneNumberId requis');
      if (!config.accessToken) errors.push('accessToken requis');
      break;
    case 'google_maps':
      if (!config.apiKey) errors.push('apiKey requis');
      break;
    // Add more providers as needed
  }
  
  return errors;
}

function maskSensitiveConfig(config: Record<string, any>): Record<string, any> {
  const sensitiveKeys = ['apiKey', 'accessToken', 'secret', 'password', 'token'];
  const masked: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(config)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      masked[key] = '***hidden***';
    } else {
      masked[key] = value;
    }
  }
  
  return masked;
}