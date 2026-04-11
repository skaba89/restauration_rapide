// Recommendations API - Returns AI-powered recommendations with demo support
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, withErrorHandler } from '@/lib/api-responses';

// Demo recommendations data
const DEMO_RECOMMENDATIONS = [
  { itemId: 'item-001', itemName: 'Attieké Poisson Grillé', price: 8000, score: 95, reason: 'popular' as const, reasonText: 'Le plus commandé', category: 'Plats Principaux' },
  { itemId: 'item-002', itemName: 'Kedjenou de Poulet', price: 7000, score: 88, reason: 'popular' as const, reasonText: 'Très populaire', category: 'Plats Principaux' },
  { itemId: 'item-003', itemName: 'Thiéboudienne', price: 7000, score: 85, reason: 'seasonal' as const, reasonText: 'Spécial avril', category: 'Plats Principaux' },
  { itemId: 'item-008', itemName: 'Jus de Bissap', price: 1500, score: 78, reason: 'popular' as const, reasonText: 'Très rafraîchissant', category: 'Boissons' },
  { itemId: 'item-004', itemName: 'Alloco Sauce Graine', price: 5000, score: 75, reason: 'time_based' as const, reasonText: 'Parfait pour maintenant', category: 'Accompagnements' },
];

// Get time of day context
function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'Petit-déjeuner';
  if (hour >= 11 && hour < 14) return 'Déjeuner';
  if (hour >= 14 && hour < 17) return 'Collation';
  return 'Dîner';
}

// Get season context
function getSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'Printemps';
  if (month >= 5 && month <= 7) return 'Été';
  if (month >= 8 && month <= 10) return 'Automne';
  return 'Hiver';
}

// Get day of week in French
function getDayOfWeek(): string {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[new Date().getDay()];
}

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    const organizationId = searchParams.get('organizationId');
    const restaurantId = searchParams.get('restaurantId');
    const currentItems = searchParams.get('currentItems')?.split(',').filter(Boolean) || [];

    // Build context
    const context = {
      timeOfDay: getTimeOfDay(),
      season: getSeason(),
      dayOfWeek: getDayOfWeek(),
    };

    // If no organization/restaurant, return demo data
    if (!organizationId && !restaurantId) {
      return apiSuccess({
        personalized: getPersonalizedRecommendations(DEMO_RECOMMENDATIONS, currentItems, type, limit),
        popular: DEMO_RECOMMENDATIONS.filter(r => r.reason === 'popular').slice(0, limit),
        seasonal: DEMO_RECOMMENDATIONS.filter(r => r.reason === 'seasonal' || r.reason === 'popular').slice(0, limit),
        timeBased: DEMO_RECOMMENDATIONS.slice(0, limit),
        context,
      });
    }

    // Try to get real data from database
    try {
      // Get top selling items
      const topItems = await db.orderItem.groupBy({
        by: ['menuItemId', 'itemName'],
        where: {
          order: {
            ...(restaurantId ? { restaurantId } : {}),
            ...(organizationId ? { restaurant: { organizationId } } : {}),
          },
        },
        _sum: { quantity: true, totalPrice: true },
        _count: true,
        orderBy: { _sum: { quantity: 'desc' } },
        take: limit * 2,
      });

      // Get menu items for details
      const menuItemIds = topItems.map(item => item.menuItemId).filter(Boolean) as string[];
      const menuItems = await db.menuItem.findMany({
        where: { id: { in: menuItemIds } },
        include: { category: { select: { name: true } } },
      });

      // Map to recommendation format
      const recommendations = topItems
        .filter(item => item.menuItemId)
        .map((item, index) => {
          const menuItem = menuItems.find(m => m.id === item.menuItemId);
          return {
            itemId: item.menuItemId!,
            itemName: item.itemName,
            price: menuItem?.price || 0,
            imageUrl: menuItem?.image,
            score: Math.max(50, 100 - index * 5),
            reason: index < 3 ? 'popular' as const : 'personal' as const,
            reasonText: index < 3 ? 'Populaire' : 'Recommandé pour vous',
            category: menuItem?.category?.name,
          };
        });

      // If no real data, fall back to demo
      if (recommendations.length === 0) {
        return apiSuccess({
          personalized: getPersonalizedRecommendations(DEMO_RECOMMENDATIONS, currentItems, type, limit),
          popular: DEMO_RECOMMENDATIONS.filter(r => r.reason === 'popular').slice(0, limit),
          seasonal: DEMO_RECOMMENDATIONS.filter(r => r.reason === 'seasonal' || r.reason === 'popular').slice(0, limit),
          timeBased: DEMO_RECOMMENDATIONS.slice(0, limit),
          context,
        });
      }

      return apiSuccess({
        personalized: getPersonalizedRecommendations(recommendations, currentItems, type, limit),
        popular: recommendations.filter(r => r.reason === 'popular').slice(0, limit),
        seasonal: recommendations.slice(0, limit),
        timeBased: recommendations.slice(0, limit),
        context,
      });
    } catch (error) {
      // Fall back to demo on any database error
      console.error('Recommendations DB error, falling back to demo:', error);
      return apiSuccess({
        personalized: getPersonalizedRecommendations(DEMO_RECOMMENDATIONS, currentItems, type, limit),
        popular: DEMO_RECOMMENDATIONS.filter(r => r.reason === 'popular').slice(0, limit),
        seasonal: DEMO_RECOMMENDATIONS.filter(r => r.reason === 'seasonal' || r.reason === 'popular').slice(0, limit),
        timeBased: DEMO_RECOMMENDATIONS.slice(0, limit),
        context,
      });
    }
  });
}

// Helper to get personalized recommendations
function getPersonalizedRecommendations(
  items: typeof DEMO_RECOMMENDATIONS,
  currentItems: string[],
  type: string | null,
  limit: number
) {
  let filtered = items.filter(item => !currentItems.includes(item.itemId));

  if (type === 'seasonal') {
    filtered = filtered.filter(r => r.reason === 'seasonal' || r.reason === 'popular');
  } else if (type === 'popular') {
    filtered = filtered.filter(r => r.reason === 'popular');
  } else if (type === 'time_based') {
    // Return all items, sorted by score
    filtered = filtered.sort((a, b) => b.score - a.score);
  }

  return filtered.slice(0, limit);
}
