// ============================================
// Restaurant OS - Database Connection
// Production: database-only, no demo fallback
// ============================================
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Track database connection status
let dbConnectionStatus: 'unknown' | 'connected' | 'error' = 'unknown'
let dbInstance: PrismaClient | null = null
let connectionPromise: Promise<boolean> | null = null
let connectionTestedAt = 0
const CONNECTION_TEST_INTERVAL = 30000 // Re-test every 30s

// Create Prisma client
function createPrismaClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL) {
    console.error('[DB] CRITICAL: DATABASE_URL is not set. All database operations will fail.');
    console.error('[DB] Set DATABASE_URL in your environment variables (.env or Render dashboard).');
    dbConnectionStatus = 'error'
    return null
  }

  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
    
    dbConnectionStatus = 'unknown'
    return client
  } catch (error) {
    console.error('[DB] Failed to create Prisma client:', error)
    dbConnectionStatus = 'error'
    return null
  }
}

// Export db - will be null if DATABASE_URL is not set
export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production' && db) {
  globalForPrisma.prisma = db
}

// Helper to check if database is available (fast, synchronous check)
export function isDatabaseAvailable(): boolean {
  return db !== null && dbConnectionStatus === 'connected'
}

// Async check that tests connection with timeout
export async function ensureDbConnection(timeoutMs: number = 5000): Promise<boolean> {
  if (!db) return false

  // If recently tested and connected, skip re-test
  const now = Date.now()
  if (dbConnectionStatus === 'connected' && (now - connectionTestedAt) < CONNECTION_TEST_INTERVAL) {
    return true
  }

  // If currently testing, wait for that result
  if (connectionPromise) {
    return connectionPromise
  }

  connectionPromise = (async () => {
    try {
      const result = await Promise.race([
        db!.$queryRaw`SELECT 1`,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), timeoutMs)
        ),
      ])
      dbConnectionStatus = 'connected'
      connectionTestedAt = Date.now()
      return true
    } catch (error) {
      console.error('[DB] Connection test failed:', error instanceof Error ? error.message : 'Unknown error')
      dbConnectionStatus = 'error'
      connectionTestedAt = Date.now()
      return false
    } finally {
      connectionPromise = null
    }
  })()

  return connectionPromise
}

// Helper to get database status
export function getDatabaseStatus(): 'unknown' | 'connected' | 'error' {
  return dbConnectionStatus
}

// Helper to mark database as unavailable
export function markDatabaseUnavailable(): void {
  dbConnectionStatus = 'error'
  connectionTestedAt = 0
}

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  return ensureDbConnection()
}
