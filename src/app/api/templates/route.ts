// Templates API - List available restaurant templates
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';

// Theme configuration interface
interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textMuted: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: {
    headerStyle: 'fixed' | 'static' | 'transparent';
    footerStyle: 'minimal' | 'full' | 'none';
    heroStyle: 'full' | 'medium' | 'small' | 'none';
    cardStyle: 'rounded' | 'square' | 'pill';
  };
  patterns?: {
    borders: boolean;
    backgrounds: boolean;
    pattern: 'kente' | 'tribal' | 'geometric' | 'none';
  };
}

// Components configuration interface
interface ComponentsConfig {
  hero: boolean;
  featured: boolean;
  menu: boolean;
  gallery: boolean;
  reviews: boolean;
  contact: boolean;
  social: boolean;
  newsletter: boolean;
  reservations: boolean;
  delivery: boolean;
}

// GET /api/templates - List available templates
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const isActive = searchParams.get('isActive');
    const isPremium = searchParams.get('isPremium');
    const restaurantId = searchParams.get('restaurantId');

    // Try to get templates from database
    try {
      const where = {
        ...(isActive !== null && { isActive: isActive === 'true' }),
        ...(isPremium !== null && { isPremium: isPremium === 'true' }),
      };

      const templates = await db.restaurantTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isExclusive: 'desc' },
          { isPremium: 'desc' },
          { name: 'asc' },
        ],
      });

      // Check exclusive template availability for restaurant
      let availableTemplates = templates;
      if (restaurantId) {
        availableTemplates = templates.filter(t => 
          !t.isExclusive || t.exclusiveRestaurantId === restaurantId
        );
      }

      const total = await db.restaurantTemplate.count({ where });

      return apiSuccess({
        data: availableTemplates,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.log('Using demo templates due to database error');
      
      let filteredTemplates = [];
      
      if (isActive !== null) {
        filteredTemplates = filteredTemplates.filter(t => t.isActive === (isActive === 'true'));
      }
      
      if (isPremium !== null) {
        filteredTemplates = filteredTemplates.filter(t => t.isPremium === (isPremium === 'true'));
      }

      if (restaurantId) {
        filteredTemplates = filteredTemplates.filter(t => 
          !t.isExclusive || t.exclusiveRestaurantId === restaurantId
        );
      }

      const total = filteredTemplates.length;
      const paginatedTemplates = filteredTemplates.slice(skip, skip + limit);

      return apiSuccess({
        data: paginatedTemplates,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }
  });
}

// POST /api/templates - Create new template (admin only)
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      themeConfig,
      components,
      images,
      customCss,
      isPremium,
      isExclusive,
      exclusiveRestaurantId,
    } = body;

    if (!name || !slug || !themeConfig || !components) {
      return apiError('Nom, slug, themeConfig et components sont requis');
    }

    // Check if slug already exists
    const existing = await db.restaurantTemplate.findUnique({
      where: { slug },
    });

    if (existing) {
      return apiError('Un template avec ce slug existe déjà', 409);
    }

    const template = await db.restaurantTemplate.create({
      data: {
        name,
        slug,
        description,
        themeConfig: typeof themeConfig === 'string' ? themeConfig : JSON.stringify(themeConfig),
        components: typeof components === 'string' ? components : JSON.stringify(components),
        images: images ? (typeof images === 'string' ? images : JSON.stringify(images)) : null,
        customCss,
        isPremium: isPremium ?? false,
        isExclusive: isExclusive ?? false,
        exclusiveRestaurantId,
        isActive: true,
      },
    });

    return apiSuccess(template, 'Template créé avec succès', 201);
  });
}