// Admin Inventory API - Gestion des stocks
import { NextRequest } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
import { apiSuccess, apiError, getPaginationParams } from '@/lib/api-responses';

// Helper to calculate stock status
function calculateStockStatus(quantity: number, minStock: number, maxStock: number): string {
  if (quantity === 0) return 'OUT_OF_STOCK';
  if (quantity < minStock) return 'LOW_STOCK';
  if (quantity > maxStock) return 'OVERSTOCKED';
  return 'IN_STOCK';
}

// GET /api/admin/inventory - List inventory items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Try database first
    if (isDatabaseAvailable() && db) {
      const where: any = {};
      
      if (category && category !== 'all') {
        where.category = category;
      }
      if (status && status !== 'all') {
        where.status = status;
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [items, total] = await Promise.all([
        db.ingredient.findMany({
          where,
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        db.ingredient.count({ where }),
      ]);

      // Transform to expected format with calculated fields
      const transformedItems = items.map(item => ({
        ...item,
        totalValue: item.quantity * (item.costPerUnit || 0),
        status: calculateStockStatus(item.quantity, item.lowStockThreshold || 0, item.lowStockThreshold * 2 || 100),
        sku: item.id.substring(0, 8).toUpperCase(),
        category: 'INGREDIENTS',
        unit: item.unit || 'unité',
        minStock: item.lowStockThreshold || 0,
        maxStock: (item.lowStockThreshold || 0) * 2,
        lastRestocked: item.updatedAt,
      }));

      return apiSuccess({ data: transformedItems, total, page, limit });
    }
    let filteredItems = [];
    
    if (category && category !== 'all') {
      filteredItems = filteredItems.filter(i => i.category === category);
    }
    if (status && status !== 'all') {
      filteredItems = filteredItems.filter(i => i.status === status);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filteredItems = filteredItems.filter(i => 
        i.name.toLowerCase().includes(searchLower) ||
        i.sku.toLowerCase().includes(searchLower)
      );
    }

    const total = filteredItems.length;
    const paginatedItems = filteredItems.slice(skip, skip + limit);

    return apiSuccess({ data: paginatedItems, total, page, limit });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return apiError('Erreur lors du chargement de l\'inventaire', 500);
  }
}

// POST /api/admin/inventory - Create inventory item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      sku,
      category,
      quantity,
      unit,
      minStock,
      maxStock,
      costPerUnit,
      supplier,
      organizationId,
    } = body;

    if (!name || !organizationId) {
      return apiError('Nom et organisation sont requis', 400);
    }

    const qty = parseFloat(quantity) || 0;
    const min = parseFloat(minStock) || 0;
    const max = parseFloat(maxStock) || min * 2 || 100;
    const cost = parseFloat(costPerUnit) || 0;
    const status = calculateStockStatus(qty, min, max);

    // Try database first
    if (isDatabaseAvailable() && db) {
      const item = await db.ingredient.create({
        data: {
          name,
          unit: unit || 'unité',
          costPerUnit: cost,
          quantity: qty,
          lowStockThreshold: min,
          organizationId,
        },
      });

      return apiSuccess({
        ...item,
        sku: item.id.substring(0, 8).toUpperCase(),
        category: category || 'INGREDIENTS',
        minStock: min,
        maxStock: max,
        totalValue: qty * cost,
        status,
        lastRestocked: new Date().toISOString(),
        supplier,
      }, 'Article créé avec succès', 201);
    }

    // Fallback: return mock created item
    const newItem = {
      id: `inv-${Date.now()}`,
      name,
      sku: sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
      category: category || 'INGREDIENTS',
      quantity: qty,
      unit: unit || 'unité',
      minStock: min,
      maxStock: max,
      costPerUnit: cost,
      totalValue: qty * cost,
      status,
      lastRestocked: new Date().toISOString(),
      supplier: supplier || null,
      organizationId,
      createdAt: new Date().toISOString(),
    };

    return apiSuccess(newItem, 'Article créé avec succès', 201);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return apiError('Erreur lors de la création de l\'article', 500);
  }
}