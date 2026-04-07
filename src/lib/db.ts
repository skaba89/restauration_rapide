import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Track database connection status
let dbConnectionStatus: 'unknown' | 'connected' | 'error' = 'unknown'
let connectionCheckPromise: Promise<boolean> | null = null
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
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      // Add connection timeout for production
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
    
    // Test connection asynchronously (non-blocking)
    testConnection(client).catch(err => {
      console.error('Database connection test failed:', err)
    })
    
    return client
  } catch (error) {
    console.error('Failed to create Prisma client:', error)
    dbConnectionStatus = 'error'
    return null
  }
}

// Test database connection
async function testConnection(client: PrismaClient) {
  if (connectionCheckPromise) {
    return connectionCheckPromise
  }
  
  connectionCheckPromise = (async () => {
    try {
      // Simple query to test connection
      await client.$queryRaw`SELECT 1`
      dbConnectionStatus = 'connected'
      console.log('✅ Database connection established')
      return true
    } catch (error) {
      console.error('❌ Database connection failed:', error instanceof Error ? error.message : 'Unknown error')
      dbConnectionStatus = 'error'
      return false
    }
  })()
  
  return connectionCheckPromise
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

// Helper to reset connection status (useful after fixes)
export function resetConnectionStatus(): void {
  dbConnectionStatus = 'unknown'
  connectionCheckPromise = null
}
