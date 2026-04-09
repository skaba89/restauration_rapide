#!/bin/bash
# KFM DELICE Startup Script for Render
# This script handles database migrations and starts the server

echo "=========================================="
echo "🚀 Starting KFM DELICE on Render..."
echo "=========================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️ WARNING: DATABASE_URL is not set!"
    echo "Running in demo mode without database"
fi

# Set hostname and port for Render
export HOSTNAME=0.0.0.0
export PORT=${PORT:-10000}

echo "📡 Host: $HOSTNAME"
echo "🔌 Port: $PORT"

# Determine if we're using PostgreSQL (production) or SQLite (development)
if [ -n "$DATABASE_URL" ]; then
    IS_POSTGRES=$(echo "$DATABASE_URL" | grep -c "postgresql" || echo "0")
    
    if [ "$IS_POSTGRES" -gt 0 ]; then
        echo "📊 Using PostgreSQL database (production mode)"
        SCHEMA_PATH="./prisma/schema.production.prisma"
        
        # Generate Prisma client
        echo ""
        echo "📦 Generating Prisma Client..."
        npx prisma generate --schema=$SCHEMA_PATH 2>&1 || echo "⚠️ Prisma generate warning"
        
        # Push schema to database
        echo ""
        echo "📦 Pushing database schema..."
        npx prisma db push --accept-data-loss --skip-generate --schema=$SCHEMA_PATH 2>&1 || {
            echo "⚠️ Prisma db push had issues, but continuing..."
        }
    fi
fi

# Check if standalone build exists
if [ ! -f ".next/standalone/server.js" ]; then
    echo "❌ ERROR: Standalone server not found!"
    echo "Looking for: .next/standalone/server.js"
    echo "Directory contents:"
    ls -la .next/ 2>/dev/null || echo ".next directory not found"
    exit 1
fi

echo ""
echo "✅ Standalone server found"
echo ""

# Start the standalone server
echo "🌐 Starting Next.js standalone server..."
echo "=========================================="

# Change to standalone directory and run
cd .next/standalone
exec node server.js
