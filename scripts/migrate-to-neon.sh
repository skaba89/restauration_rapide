#!/bin/bash

# ============================================
# Restaurant OS - NEON Migration Script
# Migre SQLite vers PostgreSQL (NEON)
# ============================================

set -e

echo "🚀 Restaurant OS - Migration vers NEON PostgreSQL"
echo "================================================"
echo ""

# Vérifier que .env existe
if [ ! -f .env ]; then
    echo "❌ Fichier .env non trouvé!"
    echo "   Créez .env à partir de .env.production.neon.example"
    exit 1
fi

# Vérifier DATABASE_URL
if ! grep -q "DATABASE_URL" .env; then
    echo "❌ DATABASE_URL non configurée dans .env"
    exit 1
fi

echo "📦 Étape 1: Sauvegarde de la base SQLite existante..."
if [ -f prisma/dev.db ]; then
    cp prisma/dev.db prisma/dev.db.backup
    echo "   ✅ Sauvegarde créée: prisma/dev.db.backup"
else
    echo "   ⚠️  Aucune base SQLite existante à sauvegarder"
fi

echo ""
echo "📦 Étape 2: Remplacement du schema Prisma..."
cp prisma/schema.prisma prisma/schema.sqlite.prisma.backup
cp prisma/schema.production.prisma prisma/schema.prisma
echo "   ✅ Schema PostgreSQL activé"

echo ""
echo "📦 Étape 3: Génération du client Prisma..."
npx prisma generate
echo "   ✅ Client Prisma généré"

echo ""
echo "📦 Étape 4: Création des tables dans NEON..."
echo "   ⚠️  Cette opération va créer toutes les tables dans votre base NEON"
read -p "   Continuer? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma db push --accept-data-loss
    echo "   ✅ Tables créées avec succès"
else
    echo "   ❌ Opération annulée"
    exit 1
fi

echo ""
echo "📦 Étape 5: Seed des données initiales (optionnel)..."
read -p "   Exécuter le seed? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run seed
    echo "   ✅ Données de démo insérées"
fi

echo ""
echo "✅ Migration terminée avec succès!"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Configurez les variables dans Vercel"
echo "   2. Déployez avec: git push origin main"
echo "   3. Vérifiez que l'app fonctionne sur l'URL Vercel"
