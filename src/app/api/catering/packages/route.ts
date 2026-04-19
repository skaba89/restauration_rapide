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
let packagesStore = [];

// Helper to generate IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Format FGN currency
const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} FGN`;

// GET - List packages
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
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
    total: packages.length
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