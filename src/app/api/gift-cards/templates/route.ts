import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';

// GET - List all gift card templates
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const occasion = searchParams.get('occasion');
  const active = searchParams.get('active');

  let templates = [];

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
    sortOrder: 0,
  };
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

  const existingTemplates: any[] = [];
  const templateIndex = existingTemplates.findIndex(t => t.id === id);

  if (templateIndex === -1) {
    return NextResponse.json({
      success: false,
      error: 'Template non trouvé',
    }, { status: 404 });
  }
  const updatedTemplate = {
    ...existingTemplates[templateIndex],
    ...updates,
  };

  return NextResponse.json({
    success: true,
    data: updatedTemplate,
    message: 'Template mis à jour avec succès',
  });
});