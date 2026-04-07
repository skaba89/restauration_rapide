// Integrations API - Third-party service integrations management
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';

// Demo integrations data
const DEMO_INTEGRATIONS = {
  payment: [
    {
      id: 'int-payment-1',
      type: 'payment',
      provider: 'orange_money',
      name: 'Orange Money',
      status: 'active',
      config: {
        merchantCode: 'KFM001',
        apiKey: '***hidden***',
        callbackUrl: 'https://kfm-delice.onrender.com/api/webhooks/orange-money',
      },
      features: ['payment', 'refund', 'status_check'],
      fees: { percentage: 1.5, fixed: 0 },
      createdAt: new Date('2024-01-01'),
      lastSync: new Date(),
    },
    {
      id: 'int-payment-2',
      type: 'payment',
      provider: 'mtn_momo',
      name: 'MTN MoMo',
      status: 'active',
      config: {
        subscriptionKey: '***hidden***',
        apiKey: '***hidden***',
        callbackUrl: 'https://kfm-delice.onrender.com/api/webhooks/mtn-momo',
      },
      features: ['payment', 'refund', 'status_check'],
      fees: { percentage: 2.0, fixed: 0 },
      createdAt: new Date('2024-01-01'),
      lastSync: new Date(),
    },
    {
      id: 'int-payment-3',
      type: 'payment',
      provider: 'wave',
      name: 'Wave',
      status: 'pending',
      config: {
        apiKey: '',
        callbackUrl: 'https://kfm-delice.onrender.com/api/webhooks/wave',
      },
      features: ['payment'],
      fees: { percentage: 1.0, fixed: 0 },
      createdAt: new Date('2024-02-15'),
      lastSync: null,
    },
  ],
  messaging: [
    {
      id: 'int-msg-1',
      type: 'messaging',
      provider: 'whatsapp_business',
      name: 'WhatsApp Business',
      status: 'active',
      config: {
        phoneNumberId: '224622123456',
        businessAccountId: '***hidden***',
        accessToken: '***hidden***',
        webhookUrl: 'https://kfm-delice.onrender.com/api/webhooks/whatsapp',
      },
      features: ['order_notification', 'delivery_update', 'reservation_reminder', 'promotion'],
      templates: 12,
      createdAt: new Date('2024-01-01'),
      lastSync: new Date(),
    },
    {
      id: 'int-msg-2',
      type: 'messaging',
      provider: 'orange_sms',
      name: 'Orange SMS',
      status: 'active',
      config: {
        senderId: 'KFMDELICE',
        apiKey: '***hidden***',
      },
      features: ['order_notification', 'otp', 'promotion'],
      templates: 8,
      createdAt: new Date('2024-01-01'),
      lastSync: new Date(),
    },
    {
      id: 'int-msg-3',
      type: 'messaging',
      provider: 'mtn_sms',
      name: 'MTN SMS',
      status: 'inactive',
      config: {
        senderId: 'KFMDELICE',
        apiKey: '',
      },
      features: ['order_notification', 'otp'],
      templates: 0,
      createdAt: new Date('2024-02-01'),
      lastSync: null,
    },
  ],
  maps: [
    {
      id: 'int-map-1',
      type: 'maps',
      provider: 'google_maps',
      name: 'Google Maps',
      status: 'active',
      config: {
        apiKey: '***hidden***',
        mapId: 'kfm-delice-map',
      },
      features: ['delivery_tracking', 'address_autocomplete', 'distance_calculation'],
      usage: { requests: 4567, limit: 10000 },
      createdAt: new Date('2024-01-01'),
      lastSync: new Date(),
    },
  ],
  social: [
    {
      id: 'int-social-1',
      type: 'social',
      provider: 'facebook',
      name: 'Facebook Page',
      status: 'active',
      config: {
        pageId: 'kfm-delice-guinea',
        pageName: 'KFM DELICE Guinea',
        accessToken: '***hidden***',
      },
      features: ['menu_sync', 'reviews', 'messaging'],
      followers: 12450,
      createdAt: new Date('2024-01-01'),
      lastSync: new Date(),
    },
    {
      id: 'int-social-2',
      type: 'social',
      provider: 'instagram',
      name: 'Instagram Business',
      status: 'active',
      config: {
        accountId: 'kfm-delice-gn',
        accountName: '@kfm.delice.gn',
        accessToken: '***hidden***',
      },
      features: ['menu_posts', 'stories'],
      followers: 8920,
      createdAt: new Date('2024-01-15'),
      lastSync: new Date(),
    },
  ],
  analytics: [
    {
      id: 'int-analytics-1',
      type: 'analytics',
      provider: 'google_analytics',
      name: 'Google Analytics 4',
      status: 'active',
      config: {
        measurementId: 'G-XXXXXXXXXX',
        propertyId: '123456789',
      },
      features: ['page_views', 'events', 'ecommerce'],
      createdAt: new Date('2024-01-01'),
      lastSync: new Date(),
    },
  ],
};

// GET /api/integrations - List integrations
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const type = searchParams.get('type');
    const provider = searchParams.get('provider');
    const status = searchParams.get('status');
    const demo = searchParams.get('demo');

    // Return demo data if demo mode or no organization specified
    if (demo === 'true' || !organizationId) {
      let integrations: any[] = [];
      
      // Gather all integrations or filter by type
      if (type && DEMO_INTEGRATIONS[type as keyof typeof DEMO_INTEGRATIONS]) {
        integrations = DEMO_INTEGRATIONS[type as keyof typeof DEMO_INTEGRATIONS];
      } else {
        integrations = [
          ...DEMO_INTEGRATIONS.payment,
          ...DEMO_INTEGRATIONS.messaging,
          ...DEMO_INTEGRATIONS.maps,
          ...DEMO_INTEGRATIONS.social,
          ...DEMO_INTEGRATIONS.analytics,
        ];
      }

      // Apply filters
      if (provider) {
        integrations = integrations.filter(i => i.provider === provider);
      }
      if (status) {
        integrations = integrations.filter(i => i.status === status);
      }

      // Calculate summary
      const summary = {
        total: integrations.length,
        active: integrations.filter(i => i.status === 'active').length,
        pending: integrations.filter(i => i.status === 'pending').length,
        inactive: integrations.filter(i => i.status === 'inactive').length,
        byType: {
          payment: DEMO_INTEGRATIONS.payment.length,
          messaging: DEMO_INTEGRATIONS.messaging.length,
          maps: DEMO_INTEGRATIONS.maps.length,
          social: DEMO_INTEGRATIONS.social.length,
          analytics: DEMO_INTEGRATIONS.analytics.length,
        },
      };

      return apiSuccess({
        data: integrations,
        summary,
      });
    }

    // For real database - would need an Integration model
    // For now, return demo data
    return apiSuccess({
      data: [
        ...DEMO_INTEGRATIONS.payment,
        ...DEMO_INTEGRATIONS.messaging,
        ...DEMO_INTEGRATIONS.maps,
        ...DEMO_INTEGRATIONS.social,
        ...DEMO_INTEGRATIONS.analytics,
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
