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

// Demo templates with the Guinée Savane exclusive template
const DEMO_TEMPLATES = [
  {
    id: 'template-guinee-savane',
    name: 'Guinée Savane',
    slug: 'guinee-savane',
    description: 'Template exclusif pour KFM DELICE - Inspiré des savanes guinéennes avec des motifs traditionnels et des tons chauds de la terre.',
    themeConfig: JSON.stringify({
      colors: {
        primary: '#D4A574', // Savanna gold
        secondary: '#8B4513', // Earth brown
        accent: '#228B22', // Forest green
        background: '#FFF8DC', // Corn silk
        text: '#2D2D2D',
        textMuted: '#6B7280',
      },
      fonts: {
        heading: 'Poppins',
        body: 'Inter',
      },
      layout: {
        headerStyle: 'transparent',
        footerStyle: 'full',
        heroStyle: 'full',
        cardStyle: 'rounded',
      },
      patterns: {
        borders: true,
        backgrounds: true,
        pattern: 'kente',
      },
    } as ThemeConfig),
    components: JSON.stringify({
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
    } as ComponentsConfig),
    images: JSON.stringify({
      logo: '/templates/guinee-savane/logo.svg',
      banner: '/templates/guinee-savane/banner.jpg',
      backgrounds: [
        '/templates/guinee-savane/bg-1.jpg',
        '/templates/guinee-savane/bg-2.jpg',
      ],
    }),
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
  },
  {
    id: 'template-modern-orange',
    name: 'Modern Orange',
    slug: 'modern-orange',
    description: 'Un template moderne et élégant avec des accents orange vifs, parfait pour les restaurants contemporains.',
    themeConfig: JSON.stringify({
      colors: {
        primary: '#F97316',
        secondary: '#EA580C',
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
    } as ThemeConfig),
    components: JSON.stringify({
      hero: true,
      featured: true,
      menu: true,
      gallery: false,
      reviews: true,
      contact: true,
      social: true,
      newsletter: false,
      reservations: true,
      delivery: true,
    } as ComponentsConfig),
    images: null,
    customCss: null,
    isPremium: false,
    isExclusive: false,
    exclusiveRestaurantId: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'template-dark-elegant',
    name: 'Dark Elegant',
    slug: 'dark-elegant',
    description: 'Un template sombre et sophistiqué pour les restaurants haut de gamme.',
    themeConfig: JSON.stringify({
      colors: {
        primary: '#D4AF37',
        secondary: '#1A1A1A',
        accent: '#C9A227',
        background: '#0F0F0F',
        text: '#FFFFFF',
        textMuted: '#9CA3AF',
      },
      fonts: {
        heading: 'Playfair Display',
        body: 'Lato',
      },
      layout: {
        headerStyle: 'fixed',
        footerStyle: 'full',
        heroStyle: 'full',
        cardStyle: 'square',
      },
    } as ThemeConfig),
    components: JSON.stringify({
      hero: true,
      featured: true,
      menu: true,
      gallery: true,
      reviews: true,
      contact: true,
      social: false,
      newsletter: true,
      reservations: true,
      delivery: false,
    } as ComponentsConfig),
    images: null,
    customCss: null,
    isPremium: true,
    isExclusive: false,
    exclusiveRestaurantId: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'template-fresh-green',
    name: 'Fresh Green',
    slug: 'fresh-green',
    description: 'Un template frais et naturel avec des tons verts, idéal pour les restaurants bio et végétariens.',
    themeConfig: JSON.stringify({
      colors: {
        primary: '#22C55E',
        secondary: '#16A34A',
        accent: '#84CC16',
        background: '#F0FDF4',
        text: '#1F2937',
        textMuted: '#6B7280',
      },
      fonts: {
        heading: 'Nunito',
        body: 'Open Sans',
      },
      layout: {
        headerStyle: 'static',
        footerStyle: 'minimal',
        heroStyle: 'small',
        cardStyle: 'pill',
      },
    } as ThemeConfig),
    components: JSON.stringify({
      hero: true,
      featured: false,
      menu: true,
      gallery: true,
      reviews: true,
      contact: true,
      social: true,
      newsletter: true,
      reservations: true,
      delivery: true,
    } as ComponentsConfig),
    images: null,
    customCss: null,
    isPremium: false,
    isExclusive: false,
    exclusiveRestaurantId: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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

      // If no templates in database, return demo templates
      if (templates.length === 0) {
        // Filter demo templates based on params
        let filteredTemplates = DEMO_TEMPLATES;
        
        if (isActive !== null) {
          filteredTemplates = filteredTemplates.filter(t => t.isActive === (isActive === 'true'));
        }
        
        if (isPremium !== null) {
          filteredTemplates = filteredTemplates.filter(t => t.isPremium === (isPremium === 'true'));
        }

        // Check exclusive template availability
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
      // If database error, return demo templates
      console.log('Using demo templates due to database error');
      
      let filteredTemplates = DEMO_TEMPLATES;
      
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
