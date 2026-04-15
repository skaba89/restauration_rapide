# 📋 CHECKLIST POST-DÉPLOIEMENT

## ✅ APRÈS AVOIR POUSSÉ LE CODE

### 1. Vérifier GitHub (immédiat)
- [ ] Aller sur: https://github.com/skaba89/restauration_rapide/commits/master
- [ ] Confirmer dernier commit = `01c39f7` ou plus récent
- [ ] Voir les 3 nouveaux commits:
  - `294e596` - Corrections sécurité + rate limiting
  - `19a585d` - Guide déploiement
  - `01c39f7` - Script push automatique

### 2. Attendre déploiement Render (2-5 min)
- [ ] Render détecte automatiquement le push
- [ ] Build en cours → Logs disponibles
- [ ] Statut passe à "Live"

### 3. Vérifier logs Render
- [ ] Dashboard Render → Votre service → Logs
- [ ] Chercher erreurs de build
- [ ] Messages clés:
  - ✅ "Build succeeded"
  - ✅ "Deploying..."
  - ✅ "Live"
  - ❌ "Build failed" → Investiguer

### 4. Tester l'application déployée

#### Navigation de base
- [ ] Page d'accueil charge correctement
- [ ] Login fonctionne
- [ ] Dashboard s'affiche (`/dashboard`)

#### API Endpoints
- [ ] `GET /api/orders` - Retourne les commandes
- [ ] `POST /api/deliveries` - Plus d'erreur ligne 182
- [ ] `GET /api/analytics/summary` - Stats dashboard

#### Rate Limiting (nouveau)
- [ ] Faire 110 requêtes rapides sur une API
- [ ] La 101ème devrait retourner erreur 429
- [ ] Message: "Too many requests"

#### Sécurité
- [ ] JWT tokens fonctionnent
- [ ] Routes protégées rejettent requêtes sans auth
- [ ] Validation Zod bloque inputs invalides

### 5. Base de données Neon
- [ ] Connexion établie (vérifier logs)
- [ ] Migration Prisma appliquée
- [ ] Table `RateLimit` créée
- [ ] Données existantes intactes

### 6. Tests spécifiques Guinée
- [ ] Devise GNF affichée correctement
- [ ] Orange Money Guinée configurable
- [ ] Timezone Africa/Conakry (UTC+0)

---

## 🐛 SI PROBLÈMES

### Build échoue sur Render
```bash
# Vérifier logs d'erreur
Dashboard Render → Logs → Filtrer "error"

# Causes communes:
# - Dépendance manquante dans package.json
# - Erreur TypeScript non détectée en local
# - Variable d'environnement manquante
```

### Application plante au démarrage
```bash
# Vérifier variables d'environnement Render:
DATABASE_URL=postgresql://... (Neon)
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://votre-app.onrender.com

# Redémarrer service:
Dashboard Render → Restart
```

### Ancienne version toujours affichée
```bash
# Vider cache CDN Render:
Dashboard Render → Settings → Clear cache

# Ou tester en navigation privée:
Ctrl+Shift+N (Chrome)
Cmd+Shift+N (Safari)
```

---

## 📊 MÉTRIQUES À SURVEILLER

### Performance
- Temps de réponse API: < 500ms
- Temps de chargement page: < 3s
- Uptime: > 99%

### Usage
- Requêtes API / heure
- Utilisateurs connectés
- Commandes créées / jour

### Erreurs
- Taux d'erreur: < 1%
- 429 Too Many Requests (rate limiting)
- 500 Internal Server Error

---

## 🎯 PROCHAINES ÉTAPES APRÈS DÉPLOIEMENT

### Semaine 1: Stabilisation
- [ ] Surveiller logs erreurs
- [ ] Corriger bugs remontés
- [ ] Optimiser requêtes lentes

### Semaine 2: Fonctionnalités
- [ ] Terminal POS complet
- [ ] Dashboard analytics temps réel
- [ ] Gestion stock avec alertes

### Semaine 3: Paiements
- [ ] Orange Money Guinée (production)
- [ ] MTN Mobile Money
- [ ] Wave CI/SN

### Semaine 4: Marketing
- [ ] Landing page commerciale
- [ ] Pricing GNF affiché
- [ ] Démo publique fonctionnelle

---

**Date de déploiement:** _______________  
**Version déployée:** _______________  
**Notes:** _______________
