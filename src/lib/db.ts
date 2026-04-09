import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Track database connection status
let dbConnectionStatus: 'unknown' | 'connected' | 'error' = 'unknown'
let dbInstance: PrismaClient | null = null

// Create Prisma client with error handling
function createPrismaClient(): PrismaClient | null {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.log('ℹ️ No DATABASE_URL set - running in demo mode')
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
    
    // Don't test connection on startup - let it fail lazily
    // This prevents crashes if DB is unavailable at startup
    dbConnectionStatus = 'unknown'
    
    return client
  } catch (error) {
    console.error('Failed to create Prisma client:', error)
    dbConnectionStatus = 'error'
    return null
  }
}

// Export db - will be null if Prisma client creation fails
export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production' && db) {
  globalForPrisma.prisma = db
}

// Helper to check if database is available
export function isDatabaseAvailable(): boolean {
  return db !== null && dbConnectionStatus !== 'error'
}

// Helper to get database status
export function getDatabaseStatus(): 'unknown' | 'connected' | 'error' {
  return dbConnectionStatus
}

// Helper to mark database as unavailable (called when DB errors occur)
export function markDatabaseUnavailable(): void {
  dbConnectionStatus = 'error'
}

// Test database connection (can be called explicitly)
export async function testDatabaseConnection(): Promise<boolean> {
  if (!db) {
    return false
  }
  
  try {
    await db.$queryRaw`SELECT 1`
    dbConnectionStatus = 'connected'
    console.log('✅ Database connection established')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error instanceof Error ? error.message : 'Unknown error')
    dbConnectionStatus = 'error'
    return false
  }
}
