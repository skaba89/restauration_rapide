// AI Recommendations Service for KFM DELICE
// Provides intelligent menu recommendations based on various factors

export interface Recommendation {
  itemId: string;
  itemName: string;
  itemDescription?: string;
  price: number;
  imageUrl?: string;
  score: number;
  reason: 'popular' | 'complementary' | 'personal' | 'seasonal' | 'time_based';
  reasonText: string;
  category?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  isPopular?: boolean;
  isSeasonal?: boolean;
  tags?: string[];
}

export interface OrderHistory {
  customerId: string;
  items: { itemId: string; quantity: number; date: Date }[];
  totalSpent: number;
  visitCount: number;
  preferredCategories: string[];
}

// Demo menu items
const DEMO_MENU_ITEMS: MenuItem[] = [
  { id: 'item-001', name: 'Attieké Poisson Grillé', description: 'Attieké avec poisson grillé et sauce tomate', price: 15000, category: 'Plats Principaux', isPopular: true, tags: ['poisson', 'traditionnel', 'déjeuner'] },
  { id: 'item-002', name: 'Kedjenou de Poulet', description: 'Ragoût de poulet mijoté aux légumes', price: 12000, category: 'Plats Principaux', isPopular: true, tags: ['poulet', 'traditionnel'] },
  { id: 'item-003', name: 'Thiéboudienne', description: 'Riz rouge au poisson et légumes', price: 14000, category: 'Plats Principaux', isPopular: true, tags: ['poisson', 'riz', 'sénégalais'] },
  { id: 'item-004', name: 'Alloco Sauce Graine', description: 'Bananes plantain frites avec sauce palava', price: 8000, category: 'Plats Principaux', tags: ['végétarien', 'banane'] },
  { id: 'item-005', name: 'Riz Gras', description: 'Riz gras à la viande', price: 10000, category: 'Plats Principaux', isPopular: true, tags: ['viande', 'riz'] },
  { id: 'item-006', name: 'Garba', description: 'Attieké avec thon et piment', price: 7000, category: 'Plats Principaux', tags: ['thon', 'rapide'] },
  { id: 'item-007', name: 'Foutou Banane', description: 'Pâte de banane avec sauce', price: 9000, category: 'Plats Principaux', tags: ['banane', 'traditionnel'] },
  { id: 'item-008', name: 'Jus de Bissap', description: 'Jus naturel de fleur d\'hibiscus', price: 2000, category: 'Boissons', isPopular: true, tags: ['boisson', 'naturel', 'frais'] },
  { id: 'item-009', name: 'Jus de Gingembre', description: 'Jus de gingembre frais et énergisant', price: 2000, category: 'Boissons', tags: ['boisson', 'naturel', 'énergisant'] },
  { id: 'item-010', name: 'Banane Plantain Frite', description: 'Bananes plantain croustillantes', price: 3000, category: 'Accompagnements', tags: ['accompagnement', 'végétarien'] },
  { id: 'item-011', name: 'Salade Ivoirienne', description: 'Salade fraîche avec sauce locale', price: 5000, category: 'Entrées', tags: ['salade', 'frais', 'léger'] },
  { id: 'item-012', name: 'Brochettes de Poulet', description: 'Brochettes grillées marinées', price: 6000, category: 'Entrées', isPopular: true, tags: ['poulet', 'grillé'] },
];

// Popular items based on order frequency
const POPULARITY_SCORES: Record<string, number> = {
  'item-001': 95,
  'item-002': 88,
  'item-003': 85,
  'item-005': 82,
  'item-008': 78,
  'item-012': 75,
  'item-006': 70,
  'item-007': 65,
};

// Item complements (what goes well together)
const COMPLEMENTS: Record<string, string[]> = {
  'item-001': ['item-008', 'item-009', 'item-010'], // Attieké -> Boissons, Plantain
  'item-002': ['item-008', 'item-011'], // Kedjenou -> Bissap, Salade
  'item-003': ['item-008'], // Thiéboudienne -> Bissap
  'item-005': ['item-009', 'item-012'], // Riz Gras -> Gingembre, Brochettes
  'item-006': ['item-008', 'item-009'], // Garba -> Boissons
};

// Time-based recommendations
const TIME_RECOMMENDATIONS = {
  breakfast: ['item-004', 'item-008', 'item-009'], // Alloco, Jus
  lunch: ['item-001', 'item-002', 'item-003', 'item-005', 'item-006'], // Plats principaux
  dinner: ['item-001', 'item-002', 'item-003', 'item-007'], // Plats du soir
  snack: ['item-010', 'item-012'], // Plantain, Brochettes
};

// Seasonal recommendations (by month)
const SEASONAL_ITEMS: Record<number, string[]> = {
  1: ['item-001', 'item-002'], // Janvier - plats réconfortants
  2: ['item-001', 'item-002'],
  3: ['item-011', 'item-008'], // Mars - salades et jus frais
  4: ['item-011', 'item-008'],
  5: ['item-006', 'item-008', 'item-009'], // Mai - plats frais
  6: ['item-006', 'item-008', 'item-009'], // Juin - saison des jus
  7: ['item-004', 'item-008', 'item-009'], // Juillet - plats légers
  8: ['item-004', 'item-008', 'item-009'],
  9: ['item-001', 'item-002', 'item-003'], // Septembre - rentrée
  10: ['item-001', 'item-002', 'item-003'],
  11: ['item-002', 'item-005'], // Novembre - plats copieux
  12: ['item-001', 'item-002', 'item-012'], // Décembre - fêtes
};

/**
 * Get recommendations based on customer history and context
 */
export async function getPersonalizedRecommendations(
  customerId?: string,
  currentItems: string[] = [],
  limit: number = 5
): Promise<Recommendation[]> {
  // In a real app, we would fetch customer history from database
  const recommendations: Recommendation[] = [];

  // Get time-based recommendations
  const hour = new Date().getHours();
  let timeContext: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  if (hour >= 6 && hour < 11) timeContext = 'breakfast';
  else if (hour >= 11 && hour < 15) timeContext = 'lunch';
  else if (hour >= 15 && hour < 18) timeContext = 'snack';
  else timeContext = 'dinner';

  // Get seasonal context
  const month = new Date().getMonth() + 1;
  const seasonalItems = SEASONAL_ITEMS[month] || [];

  // Generate recommendations
  for (const item of DEMO_MENU_ITEMS) {
    if (currentItems.includes(item.id)) continue;

    let score = 0;
    let reason: Recommendation['reason'] = 'popular';
    let reasonText = '';

    // Popularity score
    const popularityScore = POPULARITY_SCORES[item.id] || 50;
    score += popularityScore * 0.3;

    // Complementary items
    if (currentItems.length > 0) {
      for (const current of currentItems) {
        const complements = COMPLEMENTS[current] || [];
        if (complements.includes(item.id)) {
          score += 30;
          reason = 'complementary';
          reasonText = 'Se marie bien avec votre commande';
        }
      }
    }

    // Time-based score
    if (TIME_RECOMMENDATIONS[timeContext].includes(item.id)) {
      score += 20;
      if (reason !== 'complementary') {
        reason = 'time_based';
        reasonText = timeContext === 'lunch' ? 'Parfait pour le déjeuner' :
                     timeContext === 'dinner' ? 'Idéal pour le dîner' :
                     timeContext === 'breakfast' ? 'Parfait pour le petit-déjeuner' :
                     'Excellent pour une collation';
      }
    }

    // Seasonal score
    if (seasonalItems.includes(item.id)) {
      score += 15;
      if (reason === 'popular') {
        reason = 'seasonal';
        reasonText = 'De saison';
      }
    }

    // Popular items boost
    if (item.isPopular) {
      score += 10;
      if (reason === 'popular') {
        reasonText = 'Très populaire';
      }
    }

    recommendations.push({
      itemId: item.id,
      itemName: item.name,
      itemDescription: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      score: Math.min(100, score),
      reason,
      reasonText: reasonText || 'Recommandé pour vous',
      category: item.category,
    });
  }

  // Sort by score and return top results
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get most popular items
 */
export async function getPopularItems(limit: number = 5): Promise<Recommendation[]> {
  const items = DEMO_MENU_ITEMS
    .filter(item => POPULARITY_SCORES[item.id])
    .sort((a, b) => (POPULARITY_SCORES[b.id] || 0) - (POPULARITY_SCORES[a.id] || 0))
    .slice(0, limit);

  return items.map(item => ({
    itemId: item.id,
    itemName: item.name,
    itemDescription: item.description,
    price: item.price,
    imageUrl: item.imageUrl,
    score: POPULARITY_SCORES[item.id] || 50,
    reason: 'popular' as const,
    reasonText: 'Le plus commandé',
    category: item.category,
  }));
}

/**
 * Get complementary items for a given item
 */
export async function getComplementaryItems(itemId: string, limit: number = 3): Promise<Recommendation[]> {
  const complements = COMPLEMENTS[itemId] || [];
  
  return complements
    .slice(0, limit)
    .map(id => {
      const item = DEMO_MENU_ITEMS.find(i => i.id === id);
      if (!item) return null;
      
      return {
        itemId: item.id,
        itemName: item.name,
        itemDescription: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        score: 80,
        reason: 'complementary' as const,
        reasonText: 'Souvent commandé ensemble',
        category: item.category,
      };
    })
    .filter((r): r is Recommendation => r !== null);
}

/**
 * Get time-based recommendations
 */
export async function getTimeBasedRecommendations(limit: number = 5): Promise<Recommendation[]> {
  const hour = new Date().getHours();
  let timeContext: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  let timeLabel: string;

  if (hour >= 6 && hour < 11) {
    timeContext = 'breakfast';
    timeLabel = 'Petit-déjeuner';
  } else if (hour >= 11 && hour < 15) {
    timeContext = 'lunch';
    timeLabel = 'Déjeuner';
  } else if (hour >= 15 && hour < 18) {
    timeContext = 'snack';
    timeLabel = 'Collation';
  } else {
    timeContext = 'dinner';
    timeLabel = 'Dîner';
  }

  const itemIds = TIME_RECOMMENDATIONS[timeContext];
  
  return itemIds
    .slice(0, limit)
    .map(id => {
      const item = DEMO_MENU_ITEMS.find(i => i.id === id);
      if (!item) return null;
      
      return {
        itemId: item.id,
        itemName: item.name,
        itemDescription: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        score: 85,
        reason: 'time_based' as const,
        reasonText: `Parfait pour le ${timeLabel.toLowerCase()}`,
        category: item.category,
      };
    })
    .filter((r): r is Recommendation => r !== null);
}

/**
 * Get seasonal recommendations
 */
export async function getSeasonalRecommendations(limit: number = 5): Promise<Recommendation[]> {
  const month = new Date().getMonth() + 1;
  const itemIds = SEASONAL_ITEMS[month] || [];
  
  const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  
  return itemIds
    .slice(0, limit)
    .map(id => {
      const item = DEMO_MENU_ITEMS.find(i => i.id === id);
      if (!item) return null;
      
      return {
        itemId: item.id,
        itemName: item.name,
        itemDescription: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        score: 80,
        reason: 'seasonal' as const,
        reasonText: `Spécial ${monthNames[month - 1]}`,
        category: item.category,
      };
    })
    .filter((r): r is Recommendation => r !== null);
}

/**
 * Get all menu items
 */
export function getAllMenuItems(): MenuItem[] {
  return DEMO_MENU_ITEMS;
}

/**
 * Get recommendation context
 */
export function getRecommendationContext(): {
  timeOfDay: string;
  season: string;
  dayOfWeek: string;
} {
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth() + 1;
  
  let timeOfDay: string;
  if (hour >= 6 && hour < 11) timeOfDay = 'Petit-déjeuner';
  else if (hour >= 11 && hour < 15) timeOfDay = 'Déjeuner';
  else if (hour >= 15 && hour < 18) timeOfDay = 'Collation';
  else timeOfDay = 'Dîner';

  const seasons = ['Hiver', 'Printemps', 'Été', 'Automne'];
  const seasonIndex = Math.floor((month - 1) / 3);
  const season = seasons[seasonIndex];

  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const dayOfWeek = days[now.getDay()];

  return { timeOfDay, season, dayOfWeek };
}
