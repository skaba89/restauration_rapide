import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';

// Demo gift card templates
const DEMO_TEMPLATES = [
  {
    id: '1',
    name: 'Classique KFM',
    description: 'Design élégant avec les couleurs de KFM DELICE',
    occasion: 'general',
    design: {
      primaryColor: '#F97316',
      secondaryColor: '#EA580C',
      pattern: 'solid',
      borderRadius: 16,
    },
    imageUrl: '/gift-cards/classic.png',
    isDefault: true,
    isActive: true,
    sortOrder: 0,
  },
  {
    id: '2',
    name: 'Anniversaire',
    description: 'Parfait pour célébrer un anniversaire spécial',
    occasion: 'birthday',
    design: {
      primaryColor: '#EC4899',
      secondaryColor: '#DB2777',
      pattern: 'confetti',
      borderRadius: 16,
    },
    imageUrl: '/gift-cards/birthday.png',
    isDefault: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: '3',
    name: 'Mariage',
    description: 'Design romantique pour les jeunes mariés',
    occasion: 'wedding',
    design: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#7C3AED',
      pattern: 'hearts',
      borderRadius: 16,
    },
    imageUrl: '/gift-cards/wedding.png',
    isDefault: false,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: '4',
    name: 'Fêtes',
    description: 'Design festif pour les grandes occasions',
    occasion: 'holiday',
    design: {
      primaryColor: '#10B981',
      secondaryColor: '#059669',
      pattern: 'stars',
      borderRadius: 16,
    },
    imageUrl: '/gift-cards/holiday.png',
    isDefault: false,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: '5',
    name: 'Remerciement',
    description: 'Pour exprimer votre gratitude',
    occasion: 'thank_you',
    design: {
      primaryColor: '#3B82F6',
      secondaryColor: '#2563EB',
      pattern: 'gradient',
      borderRadius: 16,
    },
    imageUrl: '/gift-cards/thanks.png',
    isDefault: false,
    isActive: true,
    sortOrder: 4,
  },
  {
    id: '6',
    name: 'Entreprise',
    description: 'Design professionnel pour les cadeaux d\'entreprise',
    occasion: 'corporate',
    design: {
      primaryColor: '#1F2937',
      secondaryColor: '#111827',
      pattern: 'stripes',
      borderRadius: 8,
    },
    imageUrl: '/gift-cards/corporate.png',
    isDefault: false,
    isActive: true,
    sortOrder: 5,
  },
  {
    id: '7',
    name: 'Nouveau-né',
    description: 'Pour accueillir un nouveau-né',
    occasion: 'new_baby',
    design: {
      primaryColor: '#FDE68A',
      secondaryColor: '#FCD34D',
      pattern: 'bubbles',
      borderRadius: 20,
    },
    imageUrl: '/gift-cards/baby.png',
    isDefault: false,
    isActive: true,
    sortOrder: 6,
  },
  {
    id: '8',
    name: 'Diplômé',
    description: 'Pour féliciter un nouveau diplômé',
    occasion: 'graduation',
    design: {
      primaryColor: '#6366F1',
      secondaryColor: '#4F46E5',
      pattern: 'diploma',
      borderRadius: 12,
    },
    imageUrl: '/gift-cards/graduation.png',
    isDefault: false,
    isActive: true,
    sortOrder: 7,
  },
];

// GET - List all gift card templates
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const occasion = searchParams.get('occasion');
  const active = searchParams.get('active');

  let templates = [...DEMO_TEMPLATES];

  // Filter by occasion
  if (occasion) {
    templates = templates.filter(t => t.occasion === occasion);
  }

  // Filter by active status
  if (active !== null) {
    const isActive = active === 'true';
    templates = templates.filter(t => t.isActive === isActive);
  }

  // Sort by sortOrder
  templates.sort((a, b) => a.sortOrder - b.sortOrder);

  // Group by occasion
  const grouped = templates.reduce((acc, template) => {
    const occasionKey = template.occasion || 'general';
    if (!acc[occasionKey]) {
      acc[occasionKey] = [];
    }
    acc[occasionKey].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);

  return NextResponse.json({
    success: true,
    data: templates,
    grouped,
    occasions: [...new Set(templates.map(t => t.occasion))],
    stats: {
      total: templates.length,
      active: templates.filter(t => t.isActive).length,
      occasions: [...new Set(templates.map(t => t.occasion))].length,
    },
  });
});

// POST - Create a new gift card template
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { name, description, occasion, design, imageUrl } = body;

  if (!name) {
    return NextResponse.json({
      success: false,
      error: 'Le nom du template est requis',
    }, { status: 400 });
  }

  // Create new template
  const newTemplate = {
    id: `${Date.now()}`,
    name,
    description: description || '',
    occasion: occasion || 'general',
    design: design || {
      primaryColor: '#F97316',
      secondaryColor: '#EA580C',
      pattern: 'solid',
      borderRadius: 16,
    },
    imageUrl: imageUrl || null,
    isDefault: false,
    isActive: true,
    sortOrder: DEMO_TEMPLATES.length,
  };

  // In demo mode, we just return success
  return NextResponse.json({
    success: true,
    data: newTemplate,
    message: 'Template créé avec succès',
  });
});

// PUT - Update a gift card template
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({
      success: false,
      error: 'L\'ID du template est requis',
    }, { status: 400 });
  }

  const templateIndex = DEMO_TEMPLATES.findIndex(t => t.id === id);

  if (templateIndex === -1) {
    return NextResponse.json({
      success: false,
      error: 'Template non trouvé',
    }, { status: 404 });
  }

  // In demo mode, return the updated template
  const updatedTemplate = {
    ...DEMO_TEMPLATES[templateIndex],
    ...updates,
  };

  return NextResponse.json({
    success: true,
    data: updatedTemplate,
    message: 'Template mis à jour avec succès',
  });
});
