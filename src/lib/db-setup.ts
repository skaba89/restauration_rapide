// Auto-setup: Creates SimpleMenuItem table if it doesn't exist and seeds demo data
// This ensures demo menu modifications persist across server restarts on Render
import { db } from './db';

let setupDone = false;
let setupPromise: Promise<boolean> | null = null;

const DEMO_SEED_DATA = [
  { id: '1', name: 'Attieké Poisson Grillé', description: 'Semoule de manioc avec poisson grillé, sauce tomate et légumes frais', category: 'Plats Ivoiriens', price: 45000, costPrice: 25000, isAvailable: true, preparationTime: 20, isPopular: true, isNew: false, allergens: '[]', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', orderCount: 150 },
  { id: '2', name: 'Alloco Sauce Graine', description: 'Bananes plantains frites avec sauce graine de palme', category: 'Plats Ivoiriens', price: 25000, costPrice: 12000, isAvailable: true, preparationTime: 15, isPopular: true, isNew: false, allergens: '[]', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80', orderCount: 120 },
  { id: '3', name: 'Garba', description: 'Attieké avec poisson frit, oignons et piment', category: 'Plats Ivoiriens', price: 30000, costPrice: 15000, isAvailable: true, preparationTime: 15, isPopular: true, isNew: false, allergens: '["fish"]', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80', orderCount: 200 },
  { id: '4', name: 'Thiéboudienne', description: 'Riz au poisson et légumes, plat national sénégalais', category: 'Plats Sénégalais', price: 45000, costPrice: 25000, isAvailable: true, preparationTime: 45, isPopular: true, isNew: false, allergens: '["fish"]', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80', orderCount: 180 },
  { id: '5', name: 'Yassa Poulet', description: 'Poulet mariné au citron et oignons caramélisés', category: 'Plats Sénégalais', price: 40000, costPrice: 22000, isAvailable: true, preparationTime: 30, isPopular: true, isNew: false, allergens: '[]', image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80', orderCount: 160 },
  { id: '6', name: 'Mafé', description: 'Ragoût de viande à la sauce d\'arachide crémeuse', category: 'Plats Sénégalais', price: 40000, costPrice: 20000, isAvailable: true, preparationTime: 35, isPopular: true, isNew: false, allergens: '["peanuts"]', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', orderCount: 140 },
  { id: '7', name: 'Poulet Yassa Guinéen', description: 'Poulet mariné au citron style guinéen', category: 'Plats Guinéens', price: 45000, costPrice: 25000, isAvailable: true, preparationTime: 35, isPopular: true, isNew: false, allergens: '[]', image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80', orderCount: 100 },
  { id: '8', name: 'Konkoé', description: 'Pâte de manioc avec sauce aux arachides', category: 'Plats Guinéens', price: 30000, costPrice: 15000, isAvailable: true, preparationTime: 30, isPopular: true, isNew: false, allergens: '["peanuts"]', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80', orderCount: 80 },
  { id: '9', name: 'Mix Grill', description: 'Assortiment de grillades (poulet, boeuf, agneau)', category: 'Grillades', price: 65000, costPrice: 35000, isAvailable: true, preparationTime: 30, isPopular: true, isNew: false, allergens: '[]', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', orderCount: 190 },
  { id: '10', name: 'Poulet Braisé', description: 'Demi-poulet grillé aux épices africaines', category: 'Grillades', price: 35000, costPrice: 18000, isAvailable: true, preparationTime: 30, isPopular: true, isNew: false, allergens: '[]', image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80', orderCount: 220 },
  { id: '11', name: 'Brochettes de Boeuf', description: '5 brochettes de boeuf marinées aux épices', category: 'Grillades', price: 30000, costPrice: 15000, isAvailable: true, preparationTime: 20, isPopular: false, isNew: false, allergens: '[]', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80', orderCount: 130 },
  { id: '12', name: 'Burger KFM', description: 'Burger maison avec viande fraîche et sauce spéciale', category: 'Fast Food', price: 25000, costPrice: 12000, isAvailable: true, preparationTime: 15, isPopular: true, isNew: false, allergens: '["gluten"]', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', orderCount: 250 },
  { id: '13', name: 'Chawarma Poulet', description: 'Chawarma au poulet grillé avec sauce blanche', category: 'Fast Food', price: 20000, costPrice: 10000, isAvailable: true, preparationTime: 10, isPopular: true, isNew: false, allergens: '["gluten"]', image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80', orderCount: 280 },
  { id: '14', name: 'Chawarma Viande', description: 'Chawarma à la viande épicée', category: 'Fast Food', price: 22000, costPrice: 11000, isAvailable: true, preparationTime: 10, isPopular: false, isNew: false, allergens: '["gluten"]', image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&q=80', orderCount: 150 },
  { id: '15', name: 'Jus de Bissap', description: 'Jus naturel de fleur d\'hibiscus', category: 'Boissons', price: 4000, costPrice: 1500, isAvailable: true, preparationTime: 3, isPopular: true, isNew: false, allergens: '[]', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80', orderCount: 300 },
  { id: '16', name: 'Jus de Gingembre', description: 'Jus de gingembre frais et épicé', category: 'Boissons', price: 4000, costPrice: 1500, isAvailable: true, preparationTime: 3, isPopular: true, isNew: false, allergens: '[]', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80', orderCount: 250 },
  { id: '17', name: 'Jus de Baobab', description: 'Jus de fruit de baobab', category: 'Boissons', price: 5000, costPrice: 2000, isAvailable: true, preparationTime: 3, isPopular: false, isNew: false, allergens: '[]', image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80', orderCount: 120 },
  { id: '18', name: 'Ataya', description: 'Thé à la menthe guinéen', category: 'Boissons', price: 3000, costPrice: 1000, isAvailable: true, preparationTime: 10, isPopular: false, isNew: false, allergens: '[]', image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80', orderCount: 180 },
];

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

      // Check if table is empty and seed it
      const count = await db.simpleMenuItem.count();
      if (count === 0) {
        console.log('[DB Setup] Seeding demo menu items...');
        for (const item of DEMO_SEED_DATA) {
          try {
            await db.simpleMenuItem.create({
              data: {
                id: item.id,
                name: item.name,
                description: item.description,
                category: item.category,
                price: item.price,
                costPrice: item.costPrice,
                image: item.image,
                isAvailable: item.isAvailable,
                isPopular: item.isPopular,
                isNew: item.isNew,
                preparationTime: item.preparationTime,
                allergens: item.allergens,
                orderCount: item.orderCount,
              },
            });
          } catch (e) {
            // If the item already exists (e.g. concurrent request), skip it
            console.warn(`[DB Setup] Skipping item ${item.id}:`, (e as Error).message);
          }
        }
        console.log('[DB Setup] Demo menu items seeded successfully');
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
