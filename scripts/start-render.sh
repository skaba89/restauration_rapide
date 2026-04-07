#!/bin/bash
# KFM DELICE Startup Script for Render
# This script handles database migrations and starts the server

# Don't exit on error - we want to continue even if migration fails
# set -e

echo "=========================================="
echo "🚀 Starting KFM DELICE on Render..."
echo "=========================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is not set!"
    echo "Please configure DATABASE_URL in Render environment variables"
    exit 1
fi

echo "✅ DATABASE_URL is configured"
echo "   (Connection string hidden for security)"

# Determine if we're using PostgreSQL (production) or SQLite (development)
IS_POSTGRES=$(echo "$DATABASE_URL" | grep -c "postgresql" || echo "0")

if [ "$IS_POSTGRES" -gt 0 ]; then
    echo "📊 Using PostgreSQL database (production mode)"
    SCHEMA_PATH="./prisma/schema.production.prisma"
else
    echo "📊 Using SQLite database (development mode)"
    SCHEMA_PATH="./prisma/schema.prisma"
fi

# Run Prisma generate with the correct schema
echo ""
echo "📦 Generating Prisma Client..."
npx prisma generate --schema=$SCHEMA_PATH 2>&1 || echo "⚠️ Prisma generate warning (may already exist)"

# Run Prisma migrations - push schema to database
echo ""
echo "📦 Running Prisma db push with schema: $SCHEMA_PATH..."
npx prisma db push --accept-data-loss --skip-generate --schema=$SCHEMA_PATH 2>&1 || {
    echo "⚠️ Prisma db push had issues, but continuing..."
}

# Wait a moment for database to be ready
echo ""
echo "⏳ Waiting for database to stabilize..."
sleep 3

# Seed the database if needed (create initial admin user, etc.)
echo ""
echo "📦 Checking if database needs seeding..."

# Check if User table exists and has users
USER_COUNT=$(npx prisma db execute --stdin --schema=$SCHEMA_PATH <<< "SELECT COUNT(*) FROM \"User\";" 2>/dev/null | grep -oE '[0-9]+' || echo "0")

if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
    echo "No users found, running seed..."
    npm run seed 2>&1 || echo "⚠️ Seed had issues, but continuing..."
else
    echo "Database already has $USER_COUNT users, skipping seed"
fi

# Start the Next.js server
echo ""
echo "🌐 Starting Next.js server on port ${PORT:-10000}..."
export HOSTNAME=0.0.0.0
export PORT=${PORT:-10000}

# Use the standalone server
echo "=========================================="
echo "✅ Server starting..."
echo "=========================================="

exec node .next/standalone/server.js
