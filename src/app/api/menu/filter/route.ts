import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Filter menu items by various criteria
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const allergens = searchParams.get('allergens')?.split(',').filter(Boolean) || [];
  const dietaryLabels = searchParams.get('dietaryLabels')?.split(',').filter(Boolean) || [];
  const excludeAllergens = searchParams.get('excludeAllergens') === 'true';
  const search = searchParams.get('search')?.toLowerCase() || '';
  const category = searchParams.get('category');
  const maxCalories = searchParams.get('maxCalories') ? parseInt(searchParams.get('maxCalories')!) : null;
  const minProtein = searchParams.get('minProtein') ? parseInt(searchParams.get('minProtein')!) : null;

  try {
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Base de données non disponible' },
        { status: 503 }
      );
    }

    // Build where clause
    const where: Record<string, unknown> = {
      isAvailable: true,
    };

    // Filter by allergens (items that have a specific allergen)
    if (allergens.length > 0) {
      if (excludeAllergens) {
        where.allergens = {
          none: {
            allergen: {
              name: { in: allergens },
            },
          },
        };
      } else {
        where.allergens = {
          some: {
            allergen: {
              name: { in: allergens },
            },
          },
        };
      }
    }

    // Filter by dietary labels (using boolean flags on MenuItem)
    if (dietaryLabels.length > 0) {
      const dietaryConditions: Record<string, unknown>[] = [];
      for (const label of dietaryLabels) {
        switch (label.toLowerCase()) {
          case 'vegetarian':
            dietaryConditions.push({ isVegetarian: true });
            break;
          case 'vegan':
            dietaryConditions.push({ isVegan: true });
            break;
          case 'halal':
            dietaryConditions.push({ isHalal: true });
            break;
          case 'gluten-free':
          case 'glutenfree':
            dietaryConditions.push({ isGlutenFree: true });
            break;
        }
      }
      if (dietaryConditions.length > 0) {
        where.OR = dietaryConditions;
      }
    }

    // Filter by search
    if (search) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []),
        {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        },
      ];
    }

    // Filter by category slug or category ID
    if (category) {
      where.category = {
        OR: [
          { slug: category },
          { id: category },
          { name: { contains: category, mode: 'insensitive' } },
        ],
      };
    }

    // Filter by max calories
    if (maxCalories !== null) {
      where.calories = { ...(where.calories as object || {}), lte: maxCalories };
    }

    // Filter by min protein
    if (minProtein !== null) {
      where.protein = { ...(where.protein as object || {}), gte: minProtein };
    }

    const items = await db.menuItem.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        allergens: {
          include: {
            allergen: {
              select: { id: true, name: true, icon: true },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Calculate stats
    const stats = {
      totalItems: items.length,
      averagePrice: items.length > 0
        ? Math.round(items.reduce((sum, item) => sum + item.price, 0) / items.length)
        : 0,
      minPrice: items.length > 0 ? Math.min(...items.map(i => i.price)) : 0,
      maxPrice: items.length > 0 ? Math.max(...items.map(i => i.price)) : 0,
      averageCalories: items.length > 0
        ? Math.round(items.filter(i => i.calories).reduce((sum, item) => sum + (item.calories || 0), 0) / items.filter(i => i.calories).length)
        : 0,
      vegetarianCount: items.filter(i => i.isVegetarian).length,
      veganCount: items.filter(i => i.isVegan).length,
      halalCount: items.filter(i => i.isHalal).length,
      glutenFreeCount: items.filter(i => i.isGlutenFree).length,
    };

    return NextResponse.json({
      success: true,
      data: items,
      stats,
    });
  } catch (error) {
    console.error('Error filtering menu items:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du filtrage' },
      { status: 500 }
    );
  }
}
