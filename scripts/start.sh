#!/bin/bash
# KFM DELICE Startup Script for Render

echo "🚀 Starting KFM DELICE..."

# Run database migrations
echo "📦 Running database migrations..."
./node_modules/.bin/prisma db push --accept-data-loss

# Wait for the database to be ready
sleep 2

# Start the Next.js server in the background
echo "🌐 Starting Next.js server..."
HOSTNAME=0.0.0.0 PORT=${PORT:-10000} ./node_modules/.bin/next start &

# Wait for the server to be ready
echo "⏳ Waiting for server to be ready..."
sleep 10

# Call the setup API to seed the database
echo "🌱 Seeding database..."
curl -s "http://localhost:${PORT:-10000}/api/setup/kfm-delice" > /dev/null 2>&1 || true

# Wait for all background processes
wait
