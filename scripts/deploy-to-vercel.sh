#!/bin/bash

# Restaurant OS - Vercel Deployment Script
# Architecture: Vercel + NEON + Pusher + Cloudinary

set -e

echo "🚀 Restaurant OS - Déploiement Vercel"
echo "======================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installation de Vercel CLI..."
    npm install -g vercel
fi

# Set production environment variables for Vercel
echo "🔧 Configuration des variables d'environnement..."
echo ""
echo "⚠️  IMPORTANT: Copiez ces variables dans Vercel Dashboard > Settings > Environment Variables:"
echo ""

cat << 'ENVS'
# DATABASE - NEON PostgreSQL
DATABASE_URL=postgresql://neondb_owner:npg_Na7YByjPd6oM@ep-purple-credit-amcj54ym-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require

# CLOUDINARY - Stockage d'images
CLOUDINARY_URL=cloudinary://925519687893382:TtU7PA_CxVkXgqHqCfX5xx7ymVk@dposre2tc
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dposre2tc
CLOUDINARY_API_KEY=925519687893382
CLOUDINARY_API_SECRET=TtU7PA_CxVkXgqHqCfX5xx7ymVk

# PUSHER - Temps réel
PUSHER_APP_ID=2133805
PUSHER_KEY=1a29aab5e26674291660
PUSHER_SECRET=edbcb0c4ccf85d944030
NEXT_PUBLIC_PUSHER_KEY=1a29aab5e26674291660
NEXT_PUBLIC_PUSHER_CLUSTER=eu

# APPLICATION
NEXTAUTH_SECRET=restaurant-os-production-secret-2024-secure
NEXTAUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_NAME=Restaurant OS
ENVS

echo ""
echo "📋 Étapes de déploiement:"
echo "   1. Aller sur https://vercel.com"
echo "   2. Créer un compte / Se connecter"
echo "   3. Cliquer 'Add New...' > 'Project'"
echo "   4. Importer depuis Git ou uploader le dossier"
echo "   5. Configurer les variables d'environnement ci-dessus"
echo "   6. Cliquer 'Deploy'"
echo ""
echo "🎉 Bon déploiement !"
