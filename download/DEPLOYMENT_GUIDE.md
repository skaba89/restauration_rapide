# Restaurant OS - Guide de Déploiement Gratuit

## Architecture de Production

```
┌─────────────────────────────────────────────────────────────┐
│                      VERCEL (Frontend)                       │
│                    nextjs + react + tailwind                 │
│                     (Gratuit: 100GB/mois)                    │
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

## Services Configurés ✅

| Service | Compte | Plan | Utilisation |
|---------|--------|------|-------------|
| **NEON** | ✅ Configuré | Free | 0.5 GB PostgreSQL |
| **Pusher** | ✅ Configuré | Free | 200k messages/jour |
| **Cloudinary** | ✅ Configuré | Free | 25 GB stockage |
| **Vercel** | ⏳ À déployer | Free | 100 GB bande passante |

## Variables d'Environnement

Copiez ces variables dans **Vercel Dashboard > Settings > Environment Variables**:

```bash
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
NEXT_PUBLIC_APP_NAME=Restaurant OS
```

## Étapes de Déploiement sur Vercel

### Option 1: Via GitHub (Recommandé)

1. **Pousser le code sur GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Restaurant OS"
   git remote add origin https://github.com/votre-username/restaurant-os.git
   git push -u origin main
   ```

2. **Connecter à Vercel**
   - Aller sur https://vercel.com
   - Cliquer "Add New..." > "Project"
   - Sélectionner votre repository GitHub
   - Framework: Next.js (auto-détecté)

3. **Configurer les variables d'environnement**
   - Dans "Environment Variables", coller les variables ci-dessus
   - IMPORTANT: Remplacer `NEXTAUTH_URL` par votre URL Vercel

4. **Déployer**
   - Cliquer "Deploy"
   - Attendre 2-3 minutes

### Option 2: Via Vercel CLI

```bash
# Se connecter à Vercel
npx vercel login

# Déployer
npx vercel --prod

# Configurer les variables d'environnement
npx vercel env add DATABASE_URL production
npx vercel env add PUSHER_APP_ID production
# ... etc
```

### Option 3: Drag & Drop

1. Builder le projet localement:
   ```bash
   npm run build
   ```

2. Aller sur https://vercel.com/new
3. Glisser le dossier du projet

## Post-Déploiement

### 1. Mettre à jour NEXTAUTH_URL

Dans Vercel Dashboard, modifier `NEXTAUTH_URL` avec votre URL:
```
NEXTAUTH_URL=https://votre-app.vercel.app
```

### 2. Configurer le domaine personnalisé (optionnel)

Vercel permet d'ajouter un domaine personnalisé gratuitement:
- Settings > Domains > Add
- Ex: `restaurant-votre-entreprise.com`

### 3. Vérifier les logs

Vercel Dashboard > Deployments > [votre déploiement] > Logs

## Base de Données NEON

### Tables créées (77 tables)

- `User`, `Organization`, `Brand`, `Restaurant`
- `Product`, `Category`, `Menu`, `Order`
- `Delivery`, `Driver`, `Vehicle`
- `Reservation`, `Table`, `Customer`
- Et 60+ autres tables...

### Données de démonstration

- 16 devises africaines (XOF, XAF, NGN, KES, etc.)
- 20 pays africains
- 1 utilisateur admin par défaut

## Fonctionnalités Temps Réel (Pusher)

- Commandes en temps réel
- Suivi des livraisons
- Affichage cuisine (KDS)
- Notifications push
- Réservations

## Stockage Images (Cloudinary)

Upload preset créé: `restaurant-os`

Dossiers organisés:
- `restaurant-os/restaurants` - Logos restaurants
- `restaurant-os/menus` - Images menus
- `restaurant-os/products` - Photos produits
- `restaurant-os/users` - Avatars utilisateurs

## Support

- Vercel: https://vercel.com/docs
- NEON: https://neon.tech/docs
- Pusher: https://pusher.com/docs
- Cloudinary: https://cloudinary.com/documentation

---

**Coût total: 0€/mois** 🎉
