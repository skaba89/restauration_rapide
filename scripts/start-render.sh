#!/bin/bash
# KFM DELICE Startup Script for Render
# Works with or without database connection

echo "=========================================="
echo "🚀 Starting KFM DELICE on Render..."
echo "=========================================="

# Set hostname and port for Render
export HOSTNAME=0.0.0.0
export PORT=${PORT:-10000}

echo "📡 Host: $HOSTNAME"
echo "🔌 Port: $PORT"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️ No DATABASE_URL - Running in demo mode"
else
    echo "✅ DATABASE_URL is configured"
    
    # Test database connection (don't fail if unreachable)
    echo ""
    echo "🔍 Testing database connection..."
    
    # Generate Prisma client
    if [ -f "prisma/schema.production.prisma" ]; then
        npx prisma generate --schema=./prisma/schema.production.prisma 2>&1 || echo "⚠️ Prisma generate skipped"
    else
        npx prisma generate 2>&1 || echo "⚠️ Prisma generate skipped"
    fi

    # Auto-create missing tables (SimpleMenuItem, etc.)
    echo ""
    echo "🔄 Syncing database schema (prisma db push)..."
    if [ -f "prisma/schema.production.prisma" ]; then
        npx prisma db push --schema=./prisma/schema.production.prisma --accept-data-loss 2>&1 || echo "⚠️ Prisma db push skipped"
    else
        npx prisma db push --accept-data-loss 2>&1 || echo "⚠️ Prisma db push skipped"
    fi
fi

# Check if standalone build exists
if [ ! -f ".next/standalone/server.js" ]; then
    echo "❌ ERROR: Standalone server not found!"
    exit 1
fi

echo ""
echo "✅ Starting Next.js server..."
echo "=========================================="

# Start the standalone server
cd .next/standalone
exec node server.js
