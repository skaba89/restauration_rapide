#!/bin/bash
# KFM DELICE Startup Script for Render
# Auto-creates database tables on first run

echo "=========================================="
echo "Starting KFM DELICE on Render..."
echo "=========================================="

# Set hostname and port for Render
export HOSTNAME=0.0.0.0
export PORT=${PORT:-10000}

echo "Host: $HOSTNAME"
echo "Port: $PORT"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is not set. Cannot start without database."
    echo "Please configure DATABASE_URL in Render environment variables."
    exit 1
fi

echo "DATABASE_URL is configured"

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate 2>&1
if [ $? -ne 0 ]; then
    echo "WARNING: Prisma generate failed, trying with production schema..."
    if [ -f "prisma/schema.production.prisma" ]; then
        npx prisma generate --schema=./prisma/schema.production.prisma 2>&1
    fi
fi

# Create/Update database tables (critical for first deploy)
echo ""
echo "Syncing database schema..."
SCHEMA_FLAG=""
if [ -f "prisma/schema.production.prisma" ]; then
    SCHEMA_FLAG="--schema=./prisma/schema.production.prisma"
fi

npx prisma db push $SCHEMA_FLAG --accept-data-loss 2>&1
if [ $? -ne 0 ]; then
    echo "ERROR: Database schema sync failed!"
    echo "The application may not work correctly."
    # Don't exit - let the app start anyway, user can debug
fi

echo "Database sync completed."

# Check if standalone build exists
if [ ! -f ".next/standalone/server.js" ]; then
    echo "ERROR: Standalone server not found!"
    exit 1
fi

echo ""
echo "Starting Next.js server..."
echo "=========================================="

# Start the standalone server
cd .next/standalone
exec node server.js
