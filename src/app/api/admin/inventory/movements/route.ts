// Admin Inventory Movements API - Mouvements de stock
import { NextRequest } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
import { apiSuccess, apiError, getPaginationParams } from '@/lib/api-responses';

// Demo stock movements
const DEMO_MOVEMENTS = [
  {
    id: 'mov-1',
    itemId: 'inv-1',
    item: { name: 'Riz' },
    type: 'IN',
    quantity: 200,
    reason: 'Réapprovisionnement',
    date: new Date('2025-01-15').toISOString(),
    user: 'Admin',
    organizationId: 'demo-org-1',
  },
  {
    id: 'mov-2',
    itemId: 'inv-2',
    item: { name: 'Poulet' },
    type: 'OUT',
    quantity: 20,
    reason: 'Utilisation cuisine',
    date: new Date('2025-01-15').toISOString(),
    user: 'Chef',
    organizationId: 'demo-org-1',
  },
  {
    id: 'mov-3',
    itemId: 'inv-5',
    item: { name: 'Tomates' },
    type: 'IN',
    quantity: 100,
    reason: 'Achat marché',
    date: new Date('2025-01-16').toISOString(),
    user: 'Admin',
    organizationId: 'demo-org-1',
  },
  {
    id: 'mov-4',
    itemId: 'inv-4',
    item: { name: 'Poisson frais' },
    type: 'OUT',
    quantity: 50,
    reason: 'Utilisation cuisine',
    date: new Date('2025-01-14').toISOString(),
    user: 'Chef',
    organizationId: 'demo-org-1',
  },
  {
    id: 'mov-5',
    itemId: 'inv-7',
    item: { name: 'Coca-Cola' },
    type: 'OUT',
    quantity: 30,
    reason: 'Ventes',
    date: new Date('2025-01-15').toISOString(),
    user: 'Caissier',
    organizationId: 'demo-org-1',
  },
  {
    id: 'mov-6',
    itemId: 'inv-8',
    item: { name: 'Attiéké' },
    type: 'IN',
    quantity: 50,
    reason: 'Réapprovisionnement',
    date: new Date('2025-01-15').toISOString(),
    user: 'Admin',
    organizationId: 'demo-org-1',
  },
  {
    id: 'mov-7',
    itemId: 'inv-3',
    item: { name: 'Huile végétale' },
    type: 'OUT',
    quantity: 15,
    reason: 'Utilisation cuisine',
    date: new Date('2025-01-14').toISOString(),
    user: 'Chef',
    organizationId: 'demo-org-1',
  },
  {
    id: 'mov-8',
    itemId: 'inv-6',
    item: { name: 'Oignons' },
    type: 'ADJUSTMENT',
    quantity: -5,
    reason: 'Correction inventaire',
    date: new Date('2025-01-13').toISOString(),
    user: 'Admin',
    organizationId: 'demo-org-1',
  },
];

// GET /api/admin/inventory/movements - List stock movements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const type = searchParams.get('type');
    const itemId = searchParams.get('itemId');
    const organizationId = searchParams.get('organizationId');

    // Try database first
    if (isDatabaseAvailable() && db) {
      const where: any = {};
      
      if (type && type !== 'all') {
        where.type = type;
      }
      if (itemId) {
        where.ingredientId = itemId;
      }
      if (organizationId) {
        where.ingredient = { organizationId };
      }

      const [movements, total] = await Promise.all([
        db.stockMovement.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            ingredient: {
              select: { name: true },
            },
          },
        }),
        db.stockMovement.count({ where }),
      ]);

      // Transform to expected format
      const transformedMovements = movements.map(m => ({
        id: m.id,
        itemId: m.ingredientId,
        item: { name: m.ingredient.name },
        type: m.type || 'IN',
        quantity: m.quantity,
        reason: 'Mouvement de stock',
        date: m.createdAt.toISOString(),
        user: 'Système',
        organizationId: m.ingredient.organizationId,
      }));

      return apiSuccess({ data: transformedMovements, total, page, limit });
    }

    // Fallback to demo data
    let filteredMovements = [...DEMO_MOVEMENTS];
    
    if (type && type !== 'all') {
      filteredMovements = filteredMovements.filter(m => m.type === type);
    }
    if (itemId) {
      filteredMovements = filteredMovements.filter(m => m.itemId === itemId);
    }
    if (organizationId) {
      filteredMovements = filteredMovements.filter(m => m.organizationId === organizationId);
    }

    const total = filteredMovements.length;
    const paginatedMovements = filteredMovements.slice(skip, skip + limit);

    return apiSuccess({ data: paginatedMovements, total, page, limit });
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    return apiError('Erreur lors du chargement des mouvements', 500);
  }
}

// POST /api/admin/inventory/movements - Create stock movement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, type, quantity, reason, user, organizationId } = body;

    if (!itemId || !type || quantity === undefined) {
      return apiError('Article, type et quantité sont requis', 400);
    }

    const qty = parseFloat(quantity);

    // Try database first
    if (isDatabaseAvailable() && db) {
      // Create movement and update stock in transaction
      const result = await db.$transaction(async (tx) => {
        // Get current ingredient
        const ingredient = await tx.ingredient.findUnique({
          where: { id: itemId },
        });

        if (!ingredient) {
          throw new Error('Article non trouvé');
        }

        // Calculate new quantity
        const newQuantity = type === 'IN' 
          ? ingredient.quantity + qty 
          : type === 'OUT' 
            ? ingredient.quantity - qty 
            : ingredient.quantity + qty; // ADJUSTMENT can be negative

        // Update ingredient stock
        const updatedIngredient = await tx.ingredient.update({
          where: { id: itemId },
          data: { quantity: Math.max(0, newQuantity) },
        });

        // Create stock movement
        const movement = await tx.stockMovement.create({
          data: {
            ingredientId: itemId,
            quantity: qty,
            type: type as any,
          },
        });

        return { movement, ingredient: updatedIngredient };
      });

      return apiSuccess({
        id: result.movement.id,
        itemId,
        item: { name: result.ingredient.name },
        type,
        quantity: qty,
        reason: reason || 'Mouvement manuel',
        date: result.movement.createdAt.toISOString(),
        user: user || 'Admin',
        organizationId: result.ingredient.organizationId,
      }, 'Mouvement enregistré avec succès', 201);
    }

    // Fallback: return mock created movement
    const newMovement = {
      id: `mov-${Date.now()}`,
      itemId,
      item: { name: 'Article' },
      type,
      quantity: qty,
      reason: reason || 'Mouvement manuel',
      date: new Date().toISOString(),
      user: user || 'Admin',
      organizationId,
    };

    return apiSuccess(newMovement, 'Mouvement enregistré avec succès', 201);
  } catch (error) {
    console.error('Error creating stock movement:', error);
    return apiError('Erreur lors de l\'enregistrement du mouvement', 500);
  }
}
