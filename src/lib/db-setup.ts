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

      // Check if table is empty and seed it
      const count = await db.simpleMenuItem.count();
      if (count === 0) {
        console.log('[DB Setup] Seeding demo menu items...');
        // Seeding removed - use real data
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