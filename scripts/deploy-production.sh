#!/bin/bash

# ============================================
# Restaurant OS - Production Deployment Script
# ============================================

set -e

echo "🚀 Restaurant OS - Production Deployment"
echo "============================================"

# Colors for output
RED='\033[0m'
GREEN='\033[0m'
YELLOW='\033[1m'
NC='\033[0m'

# Check if Docker is installed
if !command -v docker &> /dev/null; then
    echo "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if !command -v docker-compose &> /dev/null && !docker compose version &> /dev/null 2>&1; then
    echo "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Load environment variables
if [ -f .env.production ]; then
    echo "${GREEN}✅ Found .env.production${NC}"
    export $(grep -v '^#' .env.production | xargs)
else
    echo "${YELLOW}⚠️  No .env.production file found. Using defaults.${NC}"
fi

# Create necessary directories
echo "\n📁 Creating necessary directories..."
mkdir -p logs backups

# Generate VAPID keys if not set
if [ -z "$NEXT_PUBLIC_VAPID_PUBLIC_KEY" ] || [ -z "$VAPID_PRIVATE_KEY" ]; then
    echo "\n🔐 Generating VAPID keys for push notifications..."
    node scripts/generate-vapid-keys.js
    if [ -f .env.vapid ]; then
        # Source the VAPID keys
        export $(grep -v '^#' .env.vapid | xargs)
        echo "${GREEN}✅ VAPID keys generated${NC}"
    fi
fi

# Build Docker images
echo "\n🐳 Building Docker images..."
docker compose -f docker-compose.prod.yml build --no-cache

# Run database migrations
echo "\n🔄 Running database migrations..."
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy

# Seed the database
echo "\n🌱 Seeding database with initial data..."
docker compose -f docker-compose.prod.yml run --rm app npm run seed

# Start all services
echo "\n🚀 Starting all services..."
docker compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "\n⏳ Waiting for services to be healthy..."
sleep 10

# Check service status
echo "\n📊 Service Status:"
docker compose -f docker-compose.prod.yml ps

# Get the URL
if [ -n "$NEXTAUTH_URL" ]; then
    echo "\n${GREEN}✅ Deployment complete!${NC}"
    echo "🌐 Application URL: $NEXTAUTH_URL"
    echo "📊 Health check: $NEXTAUTH_URL/api"
    echo "🔌 WebSocket: ws://localhost:3001"
else
    echo "\n${GREEN}✅ Deployment complete!${NC}"
    echo "🌐 Application URL: http://localhost:3000"
fi

echo "\n${YELLOW}📝 Next steps:${NC}"
echo "1. Configure your domain in Caddyfile"
echo "2. Set up SSL certificates (automatic with Caddy)"
echo "3. Configure Mobile Money webhook URLs in provider dashboards"
echo "4. Test push notifications with VAPID keys"
