// Shared demo menu store - single source of truth for demo data
// Both admin and public APIs read/write from here so changes are reflected everywhere

export interface DemoMenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  costPrice: number;
  isAvailable: boolean;
  preparationTime: number;
  isPopular: boolean;
  isNew: boolean;
  allergens: string[];
  image: string | null;
  orderCount: number;
  slug: string;
}

// Mutable array - changes here are reflected across all API routes
const menuItems: DemoMenuItem[] = [
  // PLATS IVOIRIENS
  { id: '1', name: 'Attieké Poisson Grillé', description: 'Semoule de manioc avec poisson grillé, sauce tomate et légumes frais', category: 'Plats Ivoiriens', price: 45000, costPrice: 25000, isAvailable: true, preparationTime: 20, isPopular: true, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', orderCount: 150, slug: 'attieke-poisson' },
  { id: '2', name: 'Alloco Sauce Graine', description: 'Bananes plantains frites avec sauce graine de palme', category: 'Plats Ivoiriens', price: 25000, costPrice: 12000, isAvailable: true, preparationTime: 15, isPopular: true, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80', orderCount: 120, slug: 'alloco-sauce' },
  { id: '3', name: 'Garba', description: 'Attieké avec poisson frit, oignons et piment', category: 'Plats Ivoiriens', price: 30000, costPrice: 15000, isAvailable: true, preparationTime: 15, isPopular: true, isNew: false, allergens: ['fish'], image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80', orderCount: 200, slug: 'garba' },
  
  // PLATS SÉNÉGALAIS
  { id: '4', name: 'Thiéboudienne', description: 'Riz au poisson et légumes, plat national sénégalais', category: 'Plats Sénégalais', price: 45000, costPrice: 25000, isAvailable: true, preparationTime: 45, isPopular: true, isNew: false, allergens: ['fish'], image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80', orderCount: 180, slug: 'thieboudienne' },
  { id: '5', name: 'Yassa Poulet', description: 'Poulet mariné au citron et oignons caramélisés', category: 'Plats Sénégalais', price: 40000, costPrice: 22000, isAvailable: true, preparationTime: 30, isPopular: true, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80', orderCount: 160, slug: 'yassa-poulet' },
  { id: '6', name: 'Mafé', description: 'Ragoût de viande à la sauce d\'arachide crémeuse', category: 'Plats Sénégalais', price: 40000, costPrice: 20000, isAvailable: true, preparationTime: 35, isPopular: true, isNew: false, allergens: ['peanuts'], image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', orderCount: 140, slug: 'mafe' },
  
  // PLATS GUINÉENS
  { id: '7', name: 'Poulet Yassa Guinéen', description: 'Poulet mariné au citron style guinéen', category: 'Plats Guinéens', price: 45000, costPrice: 25000, isAvailable: true, preparationTime: 35, isPopular: true, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80', orderCount: 100, slug: 'poulet-yassa-gn' },
  { id: '8', name: 'Konkoé', description: 'Pâte de manioc avec sauce aux arachides', category: 'Plats Guinéens', price: 30000, costPrice: 15000, isAvailable: true, preparationTime: 30, isPopular: true, isNew: false, allergens: ['peanuts'], image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80', orderCount: 80, slug: 'konkoe' },
  
  // GRILLADES
  { id: '9', name: 'Mix Grill', description: 'Assortiment de grillades (poulet, boeuf, agneau)', category: 'Grillades', price: 65000, costPrice: 35000, isAvailable: true, preparationTime: 30, isPopular: true, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', orderCount: 190, slug: 'mix-grill' },
  { id: '10', name: 'Poulet Braisé', description: 'Demi-poulet grillé aux épices africaines', category: 'Grillades', price: 35000, costPrice: 18000, isAvailable: true, preparationTime: 30, isPopular: true, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80', orderCount: 220, slug: 'poulet-braise' },
  { id: '11', name: 'Brochettes de Boeuf', description: '5 brochettes de boeuf marinées aux épices', category: 'Grillades', price: 30000, costPrice: 15000, isAvailable: true, preparationTime: 20, isPopular: false, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80', orderCount: 130, slug: 'brochettes-boeuf' },
  
  // FAST FOOD
  { id: '12', name: 'Burger KFM', description: 'Burger maison avec viande fraîche et sauce spéciale', category: 'Fast Food', price: 25000, costPrice: 12000, isAvailable: true, preparationTime: 15, isPopular: true, isNew: false, allergens: ['gluten'], image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', orderCount: 250, slug: 'burger-kfm' },
  { id: '13', name: 'Chawarma Poulet', description: 'Chawarma au poulet grillé avec sauce blanche', category: 'Fast Food', price: 20000, costPrice: 10000, isAvailable: true, preparationTime: 10, isPopular: true, isNew: false, allergens: ['gluten'], image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80', orderCount: 280, slug: 'chawarma-poulet' },
  { id: '14', name: 'Chawarma Viande', description: 'Chawarma à la viande épicée', category: 'Fast Food', price: 22000, costPrice: 11000, isAvailable: true, preparationTime: 10, isPopular: false, isNew: false, allergens: ['gluten'], image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&q=80', orderCount: 150, slug: 'chawarma-viande' },
  
  // BOISSONS
  { id: '15', name: 'Jus de Bissap', description: 'Jus naturel de fleur d\'hibiscus', category: 'Boissons', price: 4000, costPrice: 1500, isAvailable: true, preparationTime: 3, isPopular: true, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80', orderCount: 300, slug: 'jus-bissap' },
  { id: '16', name: 'Jus de Gingembre', description: 'Jus de gingembre frais et épicé', category: 'Boissons', price: 4000, costPrice: 1500, isAvailable: true, preparationTime: 3, isPopular: true, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80', orderCount: 250, slug: 'jus-gingembre' },
  { id: '17', name: 'Jus de Baobab', description: 'Jus de fruit de baobab', category: 'Boissons', price: 5000, costPrice: 2000, isAvailable: true, preparationTime: 3, isPopular: false, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80', orderCount: 120, slug: 'jus-baobab' },
  { id: '18', name: 'Ataya', description: 'Thé à la menthe guinéen', category: 'Boissons', price: 3000, costPrice: 1000, isAvailable: true, preparationTime: 10, isPopular: false, isNew: false, allergens: [], image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80', orderCount: 180, slug: 'ataya' },
];

// Category display order
const CATEGORY_ORDER = ['Plats Ivoiriens', 'Plats Sénégalais', 'Plats Guinéens', 'Grillades', 'Fast Food', 'Boissons'];

// Get all items (returns a copy to prevent accidental mutation)
export function getDemoMenuItems(): DemoMenuItem[] {
  return [...menuItems];
}

// Get a single item by ID
export function getDemoMenuItem(id: string): DemoMenuItem | undefined {
  return menuItems.find(item => item.id === id);
}

// Check if an ID belongs to a demo item
export function isDemoItemId(id: string): boolean {
  return menuItems.some(item => item.id === id);
}

// Update a demo item by ID - returns the updated item or null
export function updateDemoMenuItem(id: string, updateData: Partial<DemoMenuItem>): DemoMenuItem | null {
  const index = menuItems.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  const current = menuItems[index];
  const updated = {
    ...current,
    ...updateData,
    id: current.id, // ID cannot be changed
  };
  menuItems[index] = updated;
  return updated;
}

// Add a new demo item - returns the created item
export function addDemoMenuItem(item: Omit<DemoMenuItem, 'id'> & { id?: string }): DemoMenuItem {
  const newItem: DemoMenuItem = {
    ...item,
    id: item.id || `demo-${Date.now()}`,
    slug: item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  };
  menuItems.push(newItem);
  return newItem;
}

// Remove a demo item by ID - returns true if deleted
export function removeDemoMenuItem(id: string): boolean {
  const index = menuItems.findIndex(item => item.id === id);
  if (index === -1) return false;
  menuItems.splice(index, 1);
  return true;
}

// Get items grouped by category (for restaurant API hierarchy)
export function getDemoMenuByCategory(): Array<{
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  icon: string | null;
  items: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string | null;
    price: number;
    discountPrice: number | null;
    prepTime: number;
    calories: number | null;
    isAvailable: boolean;
    isFeatured: boolean;
    isPopular: boolean;
    isNew: boolean;
    isVegetarian: boolean;
    isVegan: boolean;
    isHalal: boolean;
    isGlutenFree: boolean;
    isSpicy: boolean;
    spicyLevel: number;
    rating: number;
    reviewCount: number;
    variants: any[];
    options: any[];
  }>;
}> {
  const categoryMap = new Map<string, DemoMenuItem[]>();
  
  for (const item of menuItems) {
    if (!item.isAvailable) continue;
    const cat = item.category;
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, []);
    }
    categoryMap.get(cat)!.push(item);
  }
  
  return CATEGORY_ORDER
    .filter(name => categoryMap.has(name))
    .map((name, index) => ({
      id: `cat-${index}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description: `Spécialités ${name.toLowerCase()}`,
      image: null,
      icon: null,
      items: (categoryMap.get(name) || []).map(item => ({
        id: item.id,
        name: item.name,
        slug: item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: item.description,
        image: item.image,
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
      })),
    }));
}
