// Shared utility for building menu categories from different data sources
// Used by /api/public/menu and /api/public/restaurant/[slug]

const CATEGORY_ORDER = [
  'Plats Ivoiriens', 'Plats Sénégalais', 'Plats Guinéens',
  'Grillades', 'Fast Food', 'Boissons', 'Desserts', 'Autres',
];

// Build categories from SimpleMenuItem DB records (flat table used by admin menu CRUD)
export function buildCategoriesFromSimpleMenuItems(items: any[]) {
  const categoryMap = new Map<string, any[]>();

  for (const item of items) {
    if (!item.isAvailable) continue;
    const cat = item.category || 'Autres';
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat)!.push({
      id: item.id,
      name: item.name,
      slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: item.description || '',
      image: item.image,
      imageUrl: item.image,
      price: item.price,
      discountPrice: null,
      prepTime: item.preparationTime,
      calories: null,
      isAvailable: item.isAvailable,
      isFeatured: item.isPopular || false,
      isPopular: item.isPopular,
      isNew: item.isNew,
      isVegetarian: false,
      isVegan: false,
      isHalal: true,
      isGlutenFree: false,
      isSpicy: false,
      spicyLevel: 0,
      rating: 0,
      reviewCount: 0,
      variants: [],
      options: [],
    });
  }

  return buildOrderedCategories(categoryMap);
}

// Build ordered categories from a category->items map
function buildOrderedCategories(categoryMap: Map<string, any[]>) {
  // Show known categories in order first
  const orderedCategories = CATEGORY_ORDER
    .filter(name => categoryMap.has(name))
    .map((name, index) => ({
      id: `cat-${index}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description: `Spécialités ${name.toLowerCase()}`,
      image: null,
      icon: null,
      items: categoryMap.get(name) || [],
    }));

  // Add any categories not in the predefined order (added by admin)
  const extraCategories: any[] = [];
  categoryMap.forEach((items, name) => {
    if (!CATEGORY_ORDER.includes(name)) {
      extraCategories.push({
        id: `cat-${orderedCategories.length + extraCategories.length}`,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description: `Spécialités ${name.toLowerCase()}`,
        image: null,
        icon: null,
        items,
      });
    }
  });

  return [...orderedCategories, ...extraCategories];
}
