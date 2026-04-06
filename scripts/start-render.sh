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

# Run Prisma generate (should already be done in build, but just in case)
echo ""
echo "📦 Generating Prisma Client..."
npx prisma generate --schema=./prisma/schema.prisma 2>&1 || echo "⚠️ Prisma generate warning (may already exist)"

# Run Prisma migrations - push schema to database
echo ""
echo "📦 Running Prisma db push..."
npx prisma db push --accept-data-loss --skip-generate 2>&1 || {
    echo "⚠️ Prisma db push had issues, but continuing..."
}

# Wait a moment for database to be ready
echo ""
echo "⏳ Waiting for database to stabilize..."
sleep 2

# Seed the database if needed (create initial admin user, etc.)
echo ""
echo "📦 Checking if database needs seeding..."
# Check if we have any users
HAS_USERS=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM User;" 2>/dev/null || echo "0")
if [[ "$HAS_USERS" == *"0"* ]] || [[ -z "$HAS_USERS" ]]; then
    echo "No users found, running seed..."
    npm run seed 2>&1 || echo "⚠️ Seed had issues, but continuing..."
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
