// Restaurant Template API - Assign/Get template for restaurant
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';

// GET /api/restaurants/[id]/template - Get restaurant's current template
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;

    const restaurant = await db.restaurant.findUnique({
      where: { id },
      include: {
        template: true,
      },
    });

    if (!restaurant) {
      return apiError('Restaurant non trouvé', 404);
    }

    // If restaurant has a template, return it
    if (restaurant.template) {
      const parsedTemplate = {
        ...restaurant.template,
        themeConfig: typeof restaurant.template.themeConfig === 'string' 
          ? JSON.parse(restaurant.template.themeConfig) 
          : restaurant.template.themeConfig,
        components: typeof restaurant.template.components === 'string' 
          ? JSON.parse(restaurant.template.components) 
          : restaurant.template.components,
        images: restaurant.template.images 
          ? (typeof restaurant.template.images === 'string' 
              ? JSON.parse(restaurant.template.images) 
              : restaurant.template.images) 
          : null,
      };

      return apiSuccess({
        template: parsedTemplate,
        assignedAt: restaurant.updatedAt,
        customColors: {
          primary: restaurant.primaryColor,
          secondary: restaurant.secondaryColor,
        },
      });
    }

    // Return default theme based on restaurant colors
    return apiSuccess({
      template: null,
      assignedAt: null,
      customColors: {
        primary: restaurant.primaryColor || '#F97316',
        secondary: restaurant.secondaryColor || '#EA580C',
      },
      defaultTheme: {
        colors: {
          primary: restaurant.primaryColor || '#F97316',
          secondary: restaurant.secondaryColor || '#EA580C',
          accent: '#FFC107',
          background: '#FFFFFF',
          text: '#1F2937',
          textMuted: '#6B7280',
        },
        fonts: {
          heading: 'Inter',
          body: 'Inter',
        },
        layout: {
          headerStyle: 'fixed',
          footerStyle: 'minimal',
          heroStyle: 'medium',
          cardStyle: 'rounded',
        },
      },
    });
  });
}

// POST /api/restaurants/[id]/template - Assign template to restaurant
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    const body = await request.json();
    const { templateId, customColors } = body;

    // Check if restaurant exists
    const restaurant = await db.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      return apiError('Restaurant non trouvé', 404);
    }

    // If templateId is provided, validate and assign
    if (templateId) {
      const template = await db.restaurantTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        return apiError('Template non trouvé', 404);
      }

      // Check if template is exclusive
      if (template.isExclusive && template.exclusiveRestaurantId && template.exclusiveRestaurantId !== id) {
        return apiError('Ce template est exclusif à un autre restaurant', 403);
      }

      // Check if template is active
      if (!template.isActive) {
        return apiError('Ce template n\'est pas disponible', 400);
      }

      // Update restaurant with template
      const updatedRestaurant = await db.restaurant.update({
        where: { id },
        data: {
          templateId,
          ...(customColors?.primary && { primaryColor: customColors.primary }),
          ...(customColors?.secondary && { secondaryColor: customColors.secondary }),
        },
        include: {
          template: true,
        },
      });

      return apiSuccess({
        template: updatedRestaurant.template,
        customColors: {
          primary: updatedRestaurant.primaryColor,
          secondary: updatedRestaurant.secondaryColor,
        },
      }, 'Template assigné avec succès');
    }

    // If no templateId, just update custom colors
    if (customColors) {
      const updatedRestaurant = await db.restaurant.update({
        where: { id },
        data: {
          ...(customColors.primary && { primaryColor: customColors.primary }),
          ...(customColors.secondary && { secondaryColor: customColors.secondary }),
        },
      });

      return apiSuccess({
        template: null,
        customColors: {
          primary: updatedRestaurant.primaryColor,
          secondary: updatedRestaurant.secondaryColor,
        },
      }, 'Couleurs personnalisées mises à jour');
    }

    return apiError('templateId ou customColors requis', 400);
  });
}

// DELETE /api/restaurants/[id]/template - Remove template from restaurant
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;

    const restaurant = await db.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      return apiError('Restaurant non trouvé', 404);
    }

    // Remove template from restaurant
    await db.restaurant.update({
      where: { id },
      data: {
        templateId: null,
      },
    });

    return apiSuccess({ removed: true }, 'Template retiré');
  });
}
