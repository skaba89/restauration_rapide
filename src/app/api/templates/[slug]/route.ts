// Template API - Get template by slug
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';

// Demo template for Guinée Savane
const DEMO_TEMPLATE = {
  id: 'template-guinee-savane',
  name: 'Guinée Savane',
  slug: 'guinee-savane',
  description: 'Template exclusif pour KFM DELICE - Inspiré des savanes guinéennes avec des motifs traditionnels et des tons chauds de la terre.',
  themeConfig: {
    colors: {
      primary: '#D4A574',
      secondary: '#8B4513',
      accent: '#228B22',
      background: '#FFF8DC',
      text: '#2D2D2D',
      textMuted: '#6B7280',
    },
    fonts: {
      heading: 'Poppins',
      body: 'Inter',
    },
    layout: {
      headerStyle: 'transparent' as const,
      footerStyle: 'full' as const,
      heroStyle: 'full' as const,
      cardStyle: 'rounded' as const,
    },
    patterns: {
      borders: true,
      backgrounds: true,
      pattern: 'kente' as const,
    },
  },
  components: {
    hero: true,
    featured: true,
    menu: true,
    gallery: true,
    reviews: true,
    contact: true,
    social: true,
    newsletter: true,
    reservations: true,
    delivery: true,
  },
  images: {
    logo: '/templates/guinee-savane/logo.svg',
    banner: '/templates/guinee-savane/banner.jpg',
    backgrounds: [
      '/templates/guinee-savane/bg-1.jpg',
      '/templates/guinee-savane/bg-2.jpg',
    ],
  },
  customCss: `
    /* Guinée Savane Custom Styles */
    .kente-border {
      border-image: linear-gradient(90deg, #D4A574, #8B4513, #228B22, #D4A574) 1;
    }
    .tribal-pattern {
      background-image: url('/patterns/tribal.svg');
    }
  `,
  isPremium: true,
  isExclusive: true,
  exclusiveRestaurantId: 'kfm-delice',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// GET /api/templates/[slug] - Get template by slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return withErrorHandler(async () => {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    // Try to get template from database
    try {
      const template = await db.restaurantTemplate.findUnique({
        where: { slug },
      });

      if (!template) {
        // Check if it's the demo template
        if (slug === 'guinee-savane') {
          // Check if exclusive template is available for this restaurant
          if (restaurantId && DEMO_TEMPLATE.exclusiveRestaurantId !== restaurantId) {
            return apiError('Ce template est exclusif et non disponible pour ce restaurant', 403);
          }
          return apiSuccess(DEMO_TEMPLATE);
        }
        return apiError('Template non trouvé', 404);
      }

      // Check if exclusive template is available for this restaurant
      if (template.isExclusive && restaurantId && template.exclusiveRestaurantId !== restaurantId) {
        return apiError('Ce template est exclusif et non disponible pour ce restaurant', 403);
      }

      // Parse JSON fields
      const parsedTemplate = {
        ...template,
        themeConfig: typeof template.themeConfig === 'string' ? JSON.parse(template.themeConfig) : template.themeConfig,
        components: typeof template.components === 'string' ? JSON.parse(template.components) : template.components,
        images: template.images ? (typeof template.images === 'string' ? JSON.parse(template.images) : template.images) : null,
      };

      return apiSuccess(parsedTemplate);
    } catch (error) {
      // If database error, check demo templates
      console.log('Using demo template due to database error');
      
      if (slug === 'guinee-savane') {
        if (restaurantId && DEMO_TEMPLATE.exclusiveRestaurantId !== restaurantId) {
          return apiError('Ce template est exclusif et non disponible pour ce restaurant', 403);
        }
        return apiSuccess(DEMO_TEMPLATE);
      }
      
      return apiError('Template non trouvé', 404);
    }
  });
}

// PUT /api/templates/[slug] - Update template (admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return withErrorHandler(async () => {
    const { slug } = await params;
    const body = await request.json();

    const existing = await db.restaurantTemplate.findUnique({
      where: { slug },
    });

    if (!existing) {
      return apiError('Template non trouvé', 404);
    }

    const updateData: Record<string, unknown> = {};
    
    if (body.name) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.themeConfig) updateData.themeConfig = typeof body.themeConfig === 'string' ? body.themeConfig : JSON.stringify(body.themeConfig);
    if (body.components) updateData.components = typeof body.components === 'string' ? body.components : JSON.stringify(body.components);
    if (body.images !== undefined) updateData.images = body.images ? (typeof body.images === 'string' ? body.images : JSON.stringify(body.images)) : null;
    if (body.customCss !== undefined) updateData.customCss = body.customCss;
    if (body.isPremium !== undefined) updateData.isPremium = body.isPremium;
    if (body.isExclusive !== undefined) updateData.isExclusive = body.isExclusive;
    if (body.exclusiveRestaurantId !== undefined) updateData.exclusiveRestaurantId = body.exclusiveRestaurantId;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const template = await db.restaurantTemplate.update({
      where: { slug },
      data: updateData,
    });

    return apiSuccess(template, 'Template mis à jour');
  });
}

// DELETE /api/templates/[slug] - Delete template (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return withErrorHandler(async () => {
    const { slug } = await params;

    const existing = await db.restaurantTemplate.findUnique({
      where: { slug },
    });

    if (!existing) {
      return apiError('Template non trouvé', 404);
    }

    // Check if template is in use
    const restaurantsUsingTemplate = await db.restaurant.count({
      where: { templateId: existing.id },
    });

    if (restaurantsUsingTemplate > 0) {
      return apiError('Ce template est utilisé par des restaurants et ne peut pas être supprimé', 400);
    }

    await db.restaurantTemplate.delete({
      where: { slug },
    });

    return apiSuccess({ deleted: true }, 'Template supprimé');
  });
}
