import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-responses';

// Types
interface CateringPackage {
  id: string;
  name: string;
  description: string;
  pricePerPerson: number;
  minGuests: number;
  maxGuests: number | null;
  menuItems: string[];
  includes: string[];
  imageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

// Demo Packages Data
const DEMO_PACKAGES: CateringPackage[] = [
  {
    id: '1',
    name: 'Package Découverte',
    description: 'Idéal pour les petits événements et réunions intimes. Inclut un menu simple avec 2 plats au choix et boissons.',
    pricePerPerson: 25000,
    minGuests: 10,
    maxGuests: 30,
    menuItems: [
      'Riz Gras au Poulet',
      'Attieké Poisson Grillé',
      'Jus de Bissap',
      'Eau minérale'
    ],
    includes: [
      'Service traiteur sur place',
      'Vaisselle et couverts',
      'Service 4 heures',
      '1 serveur pour 15 personnes'
    ],
    imageUrl: null,
    isActive: true,
    isFeatured: false,
    sortOrder: 1
  },
  {
    id: '2',
    name: 'Package Familial',
    description: 'Parfait pour les célébrations familiales et anniversaires. Menu varié avec plusieurs plats traditionnels.',
    pricePerPerson: 35000,
    minGuests: 20,
    maxGuests: 60,
    menuItems: [
      'Riz Gras au Poulet',
      'Maffé de Bœuf',
      'Attieké Poisson Grillé',
      'Alloco',
      'Salade Marocaine',
      'Jus de Bissap',
      'Jus de Gingembre',
      'Eau minérale'
    ],
    includes: [
      'Service traiteur complet',
      'Vaisselle et couverts premium',
      'Décoration de base',
      'Service 6 heures',
      '1 serveur pour 10 personnes',
      '1 chef sur site'
    ],
    imageUrl: null,
    isActive: true,
    isFeatured: true,
    sortOrder: 2
  },
  {
    id: '3',
    name: 'Package Prestige',
    description: 'Notre offre premium pour les événements importants. Menu gastronomique avec service personnalisé.',
    pricePerPerson: 55000,
    minGuests: 30,
    maxGuests: 100,
    menuItems: [
      'Apéritifs variés',
      'Riz Gras Royal (avec viandes variées)',
      'Maffé de Bœuf',
      'Thiéboudienne',
      'Kedjenou de Poulet',
      'Poisson Braisé',
      'Salades variées',
      'Desserts maison',
      'Cocktails signature',
      'Jus frais variés',
      'Champagne local'
    ],
    includes: [
      'Service traiteur premium',
      'Vaisselle cristal et argenterie',
      'Décoration florale',
      'Service 8 heures',
      '1 serveur pour 8 personnes',
      '2 chefs sur site',
      'Maître d\'hôtel',
      'Bar à cocktails'
    ],
    imageUrl: null,
    isActive: true,
    isFeatured: true,
    sortOrder: 3
  },
  {
    id: '4',
    name: 'Package Mariage',
    description: 'Le package ultime pour votre jour spécial. Service complet avec menu personnalisé et décoration.',
    pricePerPerson: 75000,
    minGuests: 50,
    maxGuests: 300,
    menuItems: [
      'Cocktail de bienvenue',
      'Entrées variées (4 au choix)',
      'Riz Gras Royal',
      'Maffé de Bœuf premium',
      'Thiéboudienne',
      'Poisson entier braisé',
      'Brochettes variées',
      'Buffet de fromages',
      'Buffet de desserts',
      'Gâteau de mariage',
      'Boissons illimitées',
      'Champagne'
    ],
    includes: [
      'Service traiteur de luxe',
      'Vaisselle cristal et argenterie',
      'Décoration complète (fleurs, nappes)',
      'Service 10 heures',
      '1 serveur pour 6 personnes',
      '3 chefs sur site',
      'Maître d\'hôtel dédié',
      'Bar premium ouvert',
      'Équipe de nettoyage',
      'Coordination jour J'
    ],
    imageUrl: null,
    isActive: true,
    isFeatured: true,
    sortOrder: 4
  },
  {
    id: '5',
    name: 'Package Entreprise',
    description: 'Solution professionnelle pour séminaires, formations et événements corporate.',
    pricePerPerson: 30000,
    minGuests: 15,
    maxGuests: 150,
    menuItems: [
      'Petit déjeuner continental',
      'Pause café avec pâtisseries',
      'Déjeuner buffet (3 plats au choix)',
      'Boissons (café, thé, jus, eau)'
    ],
    includes: [
      'Service traiteur professionnel',
      'Vaisselle et couverts',
      'Service adapté aux horaires business',
      '1 serveur pour 20 personnes',
      'Setup salle de conférence'
    ],
    imageUrl: null,
    isActive: true,
    isFeatured: false,
    sortOrder: 5
  },
  {
    id: '6',
    name: 'Package Cocktail',
    description: 'Parfait pour les événements cocktail, lancements de produits et soirées networking.',
    pricePerPerson: 20000,
    minGuests: 20,
    maxGuests: 100,
    menuItems: [
      'Amuse-bouche variés (8 types)',
      'Mini-brochettes',
      'Bouchées apéritives',
      'Cocktails signature',
      'Jus frais',
      'Champagne'
    ],
    includes: [
      'Service cocktail debout',
      'Plateaux de service',
      'Bar mobile',
      'Service 4 heures',
      '1 serveur pour 15 personnes',
      'Barman'
    ],
    imageUrl: null,
    isActive: true,
    isFeatured: false,
    sortOrder: 6
  }
];

// In-memory store for demo
let packagesStore = [...DEMO_PACKAGES];

// Helper to generate IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Format GNF currency
const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} GNF`;

// GET - List packages
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const demo = searchParams.get('demo') === 'true';
  const featured = searchParams.get('featured');
  const active = searchParams.get('active');
  const id = searchParams.get('id');

  // If requesting a single package by ID
  if (id) {
    const pkg = packagesStore.find(p => p.id === id);
    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Package non trouvé' }, { status: 404 });
    }
    return NextResponse.json({ success: true, package: pkg });
  }

  let packages = [...packagesStore];

  // Apply filters
  if (featured === 'true') {
    packages = packages.filter(p => p.isFeatured);
  }

  if (active !== 'false') {
    packages = packages.filter(p => p.isActive);
  }

  // Sort by sortOrder
  packages.sort((a, b) => a.sortOrder - b.sortOrder);

  // Calculate price ranges
  const priceRange = {
    min: Math.min(...packages.map(p => p.pricePerPerson)),
    max: Math.max(...packages.map(p => p.pricePerPerson))
  };

  return NextResponse.json({
    success: true,
    packages,
    priceRange,
    total: packages.length,
    demo: true
  });
});

// POST - Create new package
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();

  const newPackage: CateringPackage = {
    id: generateId(),
    name: body.name,
    description: body.description || '',
    pricePerPerson: body.pricePerPerson || 0,
    minGuests: body.minGuests || 10,
    maxGuests: body.maxGuests || null,
    menuItems: body.menuItems || [],
    includes: body.includes || [],
    imageUrl: body.imageUrl || null,
    isActive: body.isActive ?? true,
    isFeatured: body.isFeatured ?? false,
    sortOrder: body.sortOrder || packagesStore.length + 1
  };

  packagesStore.push(newPackage);

  return NextResponse.json({
    success: true,
    package: newPackage,
    message: 'Package créé avec succès'
  });
});

// PUT - Update package
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 });
  }

  const index = packagesStore.findIndex(p => p.id === id);
  if (index === -1) {
    return NextResponse.json({ success: false, error: 'Package non trouvé' }, { status: 404 });
  }

  packagesStore[index] = {
    ...packagesStore[index],
    ...updates
  };

  return NextResponse.json({
    success: true,
    package: packagesStore[index],
    message: 'Package mis à jour avec succès'
  });
});

// DELETE - Delete package
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 });
  }

  const index = packagesStore.findIndex(p => p.id === id);
  if (index === -1) {
    return NextResponse.json({ success: false, error: 'Package non trouvé' }, { status: 404 });
  }

  // Soft delete - mark as inactive
  packagesStore[index] = {
    ...packagesStore[index],
    isActive: false
  };

  return NextResponse.json({
    success: true,
    message: 'Package désactivé avec succès'
  });
});
