#!/bin/bash

# 🚀 SCRIPT DE PUSH AUTOMATIQUE - RESTAURATION RAPIDE
# Ce script vous aide à pousser vos corrections vers GitHub

echo "🔍 Vérification de l'état Git..."
echo ""

cd /workspace/restauration_rapide

# Afficher les commits locaux non poussés
echo "📊 Commits en attente de push:"
git log --oneline origin/master..master
echo ""

if [ $? -ne 0 ]; then
    echo "✅ Votre branche est à jour avec le remote!"
    exit 0
fi

echo "⚠️  Vous avez des commits locaux à pousser."
echo ""
echo "Choisissez une méthode d'authentification:"
echo "1. Token GitHub (recommandé)"
echo "2. SSH (si déjà configuré)"
echo "3. Annuler et suivre le guide manuel"
echo ""
read -p "Votre choix (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📝 Entrez votre token GitHub:"
        echo "   (Le token ne sera pas affiché pour sécurité)"
        read -s GITHUB_TOKEN
        echo ""
        
        if [ -z "$GITHUB_TOKEN" ]; then
            echo "❌ Token vide. Abandon."
            exit 1
        fi
        
        echo ""
        echo "🚀 Push en cours avec token..."
        git push https://$GITHUB_TOKEN@github.com/skaba89/restauration_rapide.git master
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ SUCCÈS! Code poussé vers GitHub."
            echo ""
            echo "📋 Prochaines étapes:"
            echo "   1. Attendre 2-5 minutes pour déploiement Render auto"
            echo "   2. Vérifier: https://github.com/skaba89/restauration_rapide/commits/master"
            echo "   3. Vérifier Render: https://dashboard.render.com/"
            echo ""
        else
            echo ""
            echo "❌ Échec du push. Vérifiez votre token."
            echo "   Le token doit avoir les permissions 'repo' complètes."
            echo ""
            echo "💡 Pour générer un token:"
            echo "   1. Aller sur: https://github.com/settings/tokens"
            echo "   2. Click 'Generate new token (classic)'"
            echo "   3. Cocher: repo (Full control)"
            echo "   4. Copier et ré-exécuter ce script"
            exit 1
        fi
        ;;
        
    2)
        echo ""
        echo "🚀 Tentative de push SSH..."
        git remote set-url origin git@github.com:skaba89/restauration_rapide.git
        git push origin master
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ SUCCÈS! Code poussé vers GitHub."
        else
            echo ""
            echo "❌ Échec SSH. Clé non configurée?"
            echo ""
            echo "💡 Configurer SSH:"
            echo "   1. ssh-keygen -t ed25519 -C 'votre@email.com'"
            echo "   2. cat ~/.ssh/id_ed25519.pub"
            echo "   3. Copier la clé sur: https://github.com/settings/keys"
            echo "   4. Ré-exécuter ce script"
            
            # Remettre HTTPS
            git remote set-url origin https://github.com/skaba89/restauration_rapide.git
            exit 1
        fi
        ;;
        
    3|*)
        echo ""
        echo "ℹ️  Guide manuel disponible dans: DEPLOY_INSTRUCTIONS.md"
        echo ""
        echo "📖 Ouvrez ce fichier et suivez les instructions."
        exit 0
        ;;
esac
