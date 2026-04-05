# Déploiement Render - Guide Étape par Étape

## 📋 Architecture Finale

```
┌─────────────────────────────────────────────────────────────┐
│                    RENDER (Frontend + API)                   │
│                    Next.js + React + Tailwind                │
│                    (Gratuit: 750 heures/mois)                │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  NEON (DB)   │ │  PUSHER      │ │  CLOUDINARY  │
│  PostgreSQL  │ │  Realtime    │ │  Images      │
│  (0.5 GB)    │ │  (200k/jour) │ │  (25 GB)     │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## Étape 1: Créer un compte Render

1. Aller sur **https://render.com**
2. Cliquer sur **"Get Started for Free"**
3. Choisir **"Sign up with GitHub"**
4. Autoriser Render à accéder à votre GitHub

---

## Étape 2: Pousser le code sur GitHub

Dans votre terminal Git Bash:

```bash
cd ~/Documents/PROJET_IA_CONAKRY/restauration_rapide

# Ajouter tous les fichiers
git add .

# Créer un commit
git commit -m "Restaurant OS - Version complète"

# Pousser sur GitHub
git push origin master --force
```

---

## Étape 3: Créer le Web Service sur Render

1. Aller sur **https://dashboard.render.com**
2. Cliquer sur **"New +"** (en haut à droite)
3. Sélectionner **"Web Service"**
4. Autoriser l'accès à vos repositories GitHub
5. Trouver et sélectionner **"restauration_rapide"**
6. Cliquer **"Connect"**

---

## Étape 4: Configurer le Web Service

Remplir les champs:

| Champ | Valeur |
|-------|--------|
| **Name** | `restaurant-os` (ou le nom de votre choix) |
| **Region** | `Oregon (US West)` ou `Frankfurt (EU Central)` |
| **Branch** | `master` |
| **Root Directory** | (laisser vide) |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npx prisma generate && npm run build` |
| **Start Command** | `npm run start` |
| **Instance Type** | `Free` ⚠️ |

---

## Étape 5: Ajouter les Variables d'Environnement

Cliquer sur **"Advanced"** → **"Add Environment Variable"**

Ajouter ces variables une par une:

### Base de données (NEON)
```
DATABASE_URL = postgresql://neondb_owner:npg_Na7YByjPd6oM@ep-purple-credit-amcj54ym-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Pusher (Temps réel)
```
PUSHER_APP_ID = 2133805
PUSHER_KEY = 1a29aab5e26674291660
PUSHER_SECRET = edbcb0c4ccf85d944030
NEXT_PUBLIC_PUSHER_KEY = 1a29aab5e26674291660
NEXT_PUBLIC_PUSHER_CLUSTER = eu
```

### Cloudinary (Images)
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = dposre2tc
CLOUDINARY_API_KEY = 925519687893382
CLOUDINARY_API_SECRET = TtU7PA_CxVkXgqHqCfX5xx7ymVk
```

### Application
```
NEXTAUTH_SECRET = restaurant-os-production-secret-2024-secure
NEXT_PUBLIC_APP_NAME = Restaurant OS
NODE_ENV = production
```

---

## Étape 6: Déployer

1. Vérifier que **"Free"** est sélectionné comme Instance Type
2. Cliquer sur **"Deploy Web Service"**
3. Attendre 5-10 minutes (le premier build est plus long)

Vous verrez:
- ⏳ "Building..."
- ⏳ "Deploying..."
- ✅ "Live" avec l'URL verte

---

## Étape 7: Configurer NEXTAUTH_URL

1. Une fois déployé, copier votre URL Render:
   ```
   https://restaurant-os.onrender.com
   ```

2. Aller dans **Environment** (menu à gauche)
3. Cliquer **"Add Environment Variable"**
4. Ajouter:
   ```
   NEXTAUTH_URL = https://restaurant-os.onrender.com
   ```
5. Cliquer **"Save Changes"**
6. Render va redéployer automatiquement

---

## Étape 8: Tester l'Application

1. Ouvrir votre URL: `https://restaurant-os.onrender.com`
2. Attendre quelques secondes (le free tier "s'endort")
3. Tester la connexion:
   - **Email**: `admin@restaurant-os.com`
   - **Mot de passe**: `admin123`

---

## ⚠️ Important: Limites du Plan Gratuit Render

| Limite | Détail |
|--------|--------|
| **Spin down** | L'app s'endort après 15 min d'inactivité |
| **Cold start** | 30-60 secondes pour "réveiller" l'app |
| **750 heures/mois** | Suffisant pour 1 service 24/7 |
| **512 MB RAM** | Suffisant pour Next.js |

---

## 🔧 Fichier render.yaml (Optionnel)

Pour un déploiement automatisé, créer un fichier `render.yaml` à la racine:

```yaml
services:
  - type: web
    name: restaurant-os
    env: node
    region: frankfurt
    branch: master
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: PUSHER_APP_ID
        sync: false
      - key: PUSHER_KEY
        sync: false
      - key: PUSHER_SECRET
        sync: false
      - key: NEXT_PUBLIC_PUSHER_KEY
        sync: false
      - key: NEXT_PUBLIC_PUSHER_CLUSTER
        value: eu
      - key: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
      - key: NEXTAUTH_SECRET
        sync: false
      - key: NEXT_PUBLIC_APP_NAME
        value: Restaurant OS
```

---

## 📱 Domaine Personnalisé (Optionnel)

1. Aller dans **Settings** → **Custom Domains**
2. Cliquer **"Add Custom Domain"**
3. Entrer: `restaurant.votre-entreprise.com`
4. Configurer les DNS comme indiqué

---

## ✅ Checklist Finale

- [ ] Compte Render créé avec GitHub
- [ ] Code poussé sur GitHub (`restauration_rapide`)
- [ ] Web Service créé
- [ ] 12 variables d'environnement ajoutées
- [ ] Déploiement réussi
- [ ] NEXTAUTH_URL configuré
- [ ] Application accessible en ligne

---

## 🆚 Comparaison Render vs Vercel

| Fonctionnalité | Render | Vercel |
|----------------|--------|--------|
| **Prix** | Gratuit | Gratuit |
| **Cold start** | 30-60 sec | < 5 sec |
| **Sleep** | Après 15 min | Jamais |
| **Build time** | 5-10 min | 2-3 min |
| **Backend API** | ✅ Natif | ✅ Serverless |
| **WebSockets** | ✅ Supporté | ⚠️ Limité |
| **PostgreSQL** | ⚠️ 90 jours gratuit | ❌ Non |

**Render est idéal si vous avez besoin de:**
- WebSockets persistants (Pusher fonctionne mieux)
- Sessions longues
- Backend API robuste

---

**Coût total: 0€/mois** 🎉
