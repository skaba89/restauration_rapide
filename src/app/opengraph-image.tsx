import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Restaurant OS - Africa-First Restaurant Management';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Default OG Image for the landing page
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 50%, #FEF3C7 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at 20% 80%, rgba(249, 115, 22, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)',
          }}
        />

        {/* Logo and Branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          {/* Logo Icon */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 20,
              boxShadow: '0 10px 40px rgba(249, 115, 22, 0.3)',
            }}
          >
            <span
              style={{
                fontSize: 48,
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              R
            </span>
          </div>

          {/* Brand Name */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                fontSize: 56,
                fontWeight: 'bold',
                color: '#1F2937',
                letterSpacing: '-0.02em',
              }}
            >
              Restaurant OS
            </span>
            <span
              style={{
                fontSize: 20,
                color: '#6B7280',
                marginTop: 4,
              }}
            >
              Africa-First Restaurant Management
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: 50,
          }}
        >
          <span
            style={{
              fontSize: 32,
              fontWeight: '600',
              color: '#374151',
              marginBottom: 16,
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            Le système de gestion pensé pour les restaurateurs africains
          </span>
          <span
            style={{
              fontSize: 20,
              color: '#6B7280',
              maxWidth: 800,
              lineHeight: 1.5,
            }}
          >
            Mobile Money • Livraison GPS • Analytics • Multi-restaurant
          </span>
        </div>

        {/* Feature Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            marginBottom: 50,
          }}
        >
          {[
            { name: 'Orange Money', color: '#FF6600' },
            { name: 'MTN MoMo', color: '#FFCC00' },
            { name: 'Wave', color: '#1DC8F2' },
            { name: 'M-Pesa', color: '#00A650' },
          ].map((provider) => (
            <div
              key={provider.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 24px',
                borderRadius: 100,
                background: 'white',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                border: '1px solid #F3F4F6',
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: provider.color,
                  marginRight: 10,
                }}
              />
              <span
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                {provider.name}
              </span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 60,
          }}
        >
          {[
            { value: '500+', label: 'Restaurants' },
            { value: '50K+', label: 'Commandes/mois' },
            { value: '4', label: 'Pays' },
            { value: '99.9%', label: 'Uptime' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 'bold',
                  color: '#F97316',
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: '#6B7280',
                  marginTop: 4,
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              padding: '14px 32px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(249, 115, 22, 0.3)',
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: 'white',
              }}
            >
              Essai Gratuit 14 jours →
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
