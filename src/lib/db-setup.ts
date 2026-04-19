import { db } from './db';

let setupDone = false;
let setupPromise: Promise<boolean> | null = null;

// SQL to create the SimpleMenuItem table (PostgreSQL)
const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS "SimpleMenuItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Plats',
    "price" DOUBLE PRECISION NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "image" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "preparationTime" INTEGER NOT NULL DEFAULT 15,
    "allergens" TEXT,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

// Create indexes
const CREATE_INDEXES_SQL = `
CREATE INDEX IF NOT EXISTS "SimpleMenuItem_category_idx" ON "SimpleMenuItem"("category");
CREATE INDEX IF NOT EXISTS "SimpleMenuItem_isAvailable_idx" ON "SimpleMenuItem"("isAvailable");
`;

// Ensure the SimpleMenuItem table exists and is seeded
export async function ensureSimpleMenuItemTable(): Promise<boolean> {
  if (setupDone) return true;
  if (setupPromise) return setupPromise;

  setupPromise = (async () => {
    if (!db) {
      console.log('[DB Setup] No database client available');
      return false;
    }

    try {
      // Create the table if it doesn't exist
      await db.$executeRawUnsafe(CREATE_TABLE_SQL);
      await db.$executeRawUnsafe(CREATE_INDEXES_SQL);
      console.log('[DB Setup] SimpleMenuItem table verified');

      // Check if table is empty and seed it with default menu items
      const count = await db.simpleMenuItem.count();
      if (count === 0) {
        console.log('[DB Setup] Seeding default menu items for KFM DELICE...');
        const defaultItems = getDefaultMenuItems();
        for (const item of defaultItems) {
          await db.simpleMenuItem.create({ data: item });
        }
        console.log(`[DB Setup] ${defaultItems.length} default menu items seeded successfully`);
      }

      setupDone = true;
      return true;
    } catch (error) {
      console.error('[DB Setup] Failed to create/seed SimpleMenuItem table:', error);
      return false;
    }
  })();

  return setupPromise;
}

// Default menu items for KFM DELICE (Guinean fast-food restaurant)
function getDefaultMenuItems() {
  const now = new Date();
  return [
    // === Plats Guinéens ===
    {
      id: 'item-001', name: 'Riz sauce arachide', description: 'Riz blanc sauce à la pâte d\'arachide, légumes et viande de boeuf',
      category: 'Plats Guinéens', price: 15000, costPrice: 5000, isAvailable: true, isPopular: true, isNew: false, preparationTime: 20, orderCount: 0,
    },
    {
      id: 'item-002', name: 'Riz sauce feuille', description: 'Riz blanc sauce aux feuilles de manioc, poisson fumé',
      category: 'Plats Guinéens', price: 12000, costPrice: 4000, isAvailable: true, isPopular: true, isNew: false, preparationTime: 20, orderCount: 0,
    },
    {
      id: 'item-003', name: 'Riz gras', description: 'Riz cuisiné avec tomates, oignons, carottes et viande',
      category: 'Plats Guinéens', price: 10000, costPrice: 3500, isAvailable: true, isPopular: true, isNew: false, preparationTime: 15, orderCount: 0,
    },
    {
      id: 'item-004', name: 'Tô', description: 'Pâte de maïs avec sauce légumes, accompagnement traditionnel',
      category: 'Plats Guinéens', price: 8000, costPrice: 2500, isAvailable: true, isPopular: false, isNew: false, preparationTime: 15, orderCount: 0,
    },
    {
      id: 'item-005', name: 'Foutou', description: 'Pâte de banane plantain avec sauce graine',
      category: 'Plats Guinéens', price: 10000, costPrice: 3500, isAvailable: true, isPopular: true, isNew: false, preparationTime: 20, orderCount: 0,
    },
    {
      id: 'item-006', name: 'Riz sauce tomate oignon', description: 'Riz blanc avec sauce tomate oignon, poulet grillé',
      category: 'Plats Guinéens', price: 12000, costPrice: 4000, isAvailable: true, isPopular: false, isNew: false, preparationTime: 15, orderCount: 0,
    },
    // === Grillades ===
    {
      id: 'item-007', name: 'Poulet braisé', description: 'Poulet entier braisé aux épices, servi avec alloco',
      category: 'Grillades', price: 15000, costPrice: 6000, isAvailable: true, isPopular: true, isNew: false, preparationTime: 30, orderCount: 0,
    },
    {
      id: 'item-008', name: 'Poulet grillé (demi)', description: 'Demi-poulet grillé au charbon avec sauce pimentée',
      category: 'Grillades', price: 10000, costPrice: 4000, isAvailable: true, isPopular: true, isNew: false, preparationTime: 25, orderCount: 0,
    },
    {
      id: 'item-009', name: 'Brochette viande', description: 'Brochette de boeuf mariné grillée au charbon',
      category: 'Grillades', price: 8000, costPrice: 3000, isAvailable: true, isPopular: false, isNew: false, preparationTime: 20, orderCount: 0,
    },
    {
      id: 'item-010', name: 'Poisson braisé', description: 'Poisson entier braisé, sauce piquante et légumes',
      category: 'Grillades', price: 18000, costPrice: 7000, isAvailable: true, isPopular: true, isNew: false, preparationTime: 30, orderCount: 0,
    },
    {
      id: 'item-011', name: 'Côtelettes d\'agneau', description: 'Côtelettes d\'agneau grillées aux herbes',
      category: 'Grillades', price: 20000, costPrice: 9000, isAvailable: true, isPopular: false, isNew: true, preparationTime: 25, orderCount: 0,
    },
    // === Fast Food ===
    {
      id: 'item-012', name: 'Alloco', description: 'Beignets de banane plantain frits, servis avec piment',
      category: 'Fast Food', price: 5000, costPrice: 1500, isAvailable: true, isPopular: true, isNew: false, preparationTime: 10, orderCount: 0,
    },
    {
      id: 'item-013', name: 'Accra', description: 'Beignets de poisson ou crevettes, croustillants',
      category: 'Fast Food', price: 3000, costPrice: 1000, isAvailable: true, isPopular: true, isNew: false, preparationTime: 10, orderCount: 0,
    },
    {
      id: 'item-014', name: 'Sandwich poulet', description: 'Sandwich baguette avec poulet grillé, crudités et sauce',
      category: 'Fast Food', price: 7000, costPrice: 2500, isAvailable: true, isPopular: true, isNew: false, preparationTime: 10, orderCount: 0,
    },
    {
      id: 'item-015', name: 'Burgers KFM', description: 'Burger maison avec viande boeuf, fromage, salade, tomate',
      category: 'Fast Food', price: 10000, costPrice: 3500, isAvailable: true, isPopular: true, isNew: false, preparationTime: 15, orderCount: 0,
    },
    {
      id: 'item-016', name: 'Chawarma poulet', description: 'Pain libanais garni de poulet rôti, crudités et sauce blanche',
      category: 'Fast Food', price: 8000, costPrice: 3000, isAvailable: true, isPopular: false, isNew: true, preparationTime: 12, orderCount: 0,
    },
    {
      id: 'item-017', name: 'Pizza Margarita', description: 'Pizza tomate, mozzarella et basilic frais',
      category: 'Fast Food', price: 12000, costPrice: 4000, isAvailable: true, isPopular: false, isNew: true, preparationTime: 20, orderCount: 0,
    },
    {
      id: 'item-018', name: 'Frites maison', description: 'Frites de pommes de terre croustillantes',
      category: 'Fast Food', price: 4000, costPrice: 1000, isAvailable: true, isPopular: true, isNew: false, preparationTime: 10, orderCount: 0,
    },
    // === Boissons ===
    {
      id: 'item-019', name: 'Bissap', description: 'Jus d\'hibiscus glacé, boisson traditionnelle',
      category: 'Boissons', price: 3000, costPrice: 500, isAvailable: true, isPopular: true, isNew: false, preparationTime: 5, orderCount: 0,
    },
    {
      id: 'item-020', name: 'Gingembre', description: 'Jus de gingembre frais, sucré et pimenté',
      category: 'Boissons', price: 3000, costPrice: 500, isAvailable: true, isPopular: true, isNew: false, preparationTime: 5, orderCount: 0,
    },
    {
      id: 'item-021', name: 'Jus de mangue', description: 'Jus de mangue frais naturel',
      category: 'Boissons', price: 3000, costPrice: 800, isAvailable: true, isPopular: false, isNew: false, preparationTime: 5, orderCount: 0,
    },
    {
      id: 'item-022', name: 'Jus d\'ananas', description: 'Jus d\'ananas frais pressé',
      category: 'Boissons', price: 3000, costPrice: 800, isAvailable: true, isPopular: false, isNew: false, preparationTime: 5, orderCount: 0,
    },
    {
      id: 'item-023', name: 'Coca-Cola / Sprite', description: 'Soda glacé 33cl',
      category: 'Boissons', price: 2500, costPrice: 1200, isAvailable: true, isPopular: true, isNew: false, preparationTime: 2, orderCount: 0,
    },
    {
      id: 'item-024', name: 'Eau minérale', description: 'Bouteille d\'eau minérale 50cl',
      category: 'Boissons', price: 1500, costPrice: 500, isAvailable: true, isPopular: false, isNew: false, preparationTime: 2, orderCount: 0,
    },
    {
      id: 'item-025', name: 'Guinness / Flag', description: 'Bière pression ou bouteille',
      category: 'Boissons', price: 4000, costPrice: 1500, isAvailable: true, isPopular: true, isNew: false, preparationTime: 2, orderCount: 0,
    },
    // === Desserts ===
    {
      id: 'item-026', name: 'Fruits de saison', description: 'Assiette de fruits frais de saison (mangue, papaye, ananas)',
      category: 'Desserts', price: 5000, costPrice: 2000, isAvailable: true, isPopular: false, isNew: false, preparationTime: 5, orderCount: 0,
    },
    {
      id: 'item-027', name: 'Gâteau chocolat', description: 'Part de gâteau au chocolat maison',
      category: 'Desserts', price: 5000, costPrice: 1500, isAvailable: true, isPopular: false, isNew: false, preparationTime: 5, orderCount: 0,
    },
    {
      id: 'item-028', name: 'Glace artisanale', description: '2 boules de glace au choix (vanille, chocolat, coco)',
      category: 'Desserts', price: 4000, costPrice: 1200, isAvailable: true, isPopular: true, isNew: false, preparationTime: 5, orderCount: 0,
    },
    // === Petits déjeuners ===
    {
      id: 'item-029', name: 'Petit-déjeuner traditionnel', description: 'Thé, pain, beurre, confiture, oeufs et fruits',
      category: 'Petit-déjeuner', price: 8000, costPrice: 2500, isAvailable: true, isPopular: true, isNew: false, preparationTime: 10, orderCount: 0,
    },
    {
      id: 'item-030', name: 'Omelette complète', description: 'Omelette au fromage, tomates, oignons, servie avec pain',
      category: 'Petit-déjeuner', price: 6000, costPrice: 2000, isAvailable: true, isPopular: false, isNew: false, preparationTime: 10, orderCount: 0,
    },
    {
      id: 'item-031', name: 'Café expresso', description: 'Café expresso italien',
      category: 'Petit-déjeuner', price: 2000, costPrice: 500, isAvailable: true, isPopular: false, isNew: false, preparationTime: 3, orderCount: 0,
    },
    {
      id: 'item-032', name: 'Attiéké poisson', description: 'Semoule de manioc (attiéké) avec poisson grillé et piment',
      category: 'Plats Guinéens', price: 12000, costPrice: 4500, isAvailable: true, isPopular: true, isNew: true, preparationTime: 20, orderCount: 0,
    },
  ];
}