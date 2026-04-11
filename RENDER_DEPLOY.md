# KFM DELICE - Déploiement sur Render

## 🚀 Étapes de déploiement

### 1. Créer un compte sur Render
Allez sur [render.com](https://render.com) et créez un compte gratuit.

### 2. Créer un nouveau Web Service
1. Cliquez sur **"New +"** → **"Web Service"**
2. Connectez votre compte GitHub
3. Sélectionnez le repository : `skaba89/restauration-rapide`
4. Configurez le service :
   - **Name** : `kfm-delice`
   - **Region** : Oregon (ou le plus proche)
   - **Branch** : master
   - **Runtime** : Node
   - **Build Command** : `npm run build`
   - **Start Command** : `npm run start`
   - **Plan** : Free

### 3. Variables d'environnement

Ajoutez ces variables dans **Environment** → **Environment Variables** :

```env
# Base de données NEON
DATABASE_URL=postgresql://neondb_owner:npg_xxx@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Authentification
NEXTAUTH_SECRET=votre_secret_aleatoire_32_caracteres
NEXTAUTH_URL=https://votre-app.onrender.com

# Pusher (WebSocket temps réel)
PUSHER_APP_ID=votre_app_id
PUSHER_KEY=votre_key
PUSHER_SECRET=votre_secret
PUSHER_CLUSTER=eu

# Cloudinary (Stockage images)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Configuration par défaut
DEFAULT_COUNTRY_CODE=GN
DEFAULT_CURRENCY_CODE=GNF
HOSTNAME=0.0.0.0
```

### 4. Déployer
Cliquez sur **"Create Web Service"** et attendez le déploiement (5-10 minutes).

### 5. Initialiser les données KFM DELICE

Après le déploiement, exécutez le script de configuration :

#### Option A : Via Render Shell
1. Allez dans votre Web Service sur Render
2. Cliquez sur **"Shell"**
3. Exécutez :
```bash
npm run seed:kfm
```

#### Option B : Via API (à créer)
Créez un endpoint d'initialisation accessible une seule fois.

---

## 🔐 Identifiants de connexion

| Champ | Valeur |
|-------|--------|
| **Email** | `kfm.delice@guinee.com` |
| **Mot de passe** | `KfmDelice2024!` |

---

## 🌐 URLs importantes

- **Site** : `https://votre-app.onrender.com`
- **Menu public** : `https://votre-app.onrender.com/menu/kfm-delice`
- **Admin** : `https://votre-app.onrender.com/admin`
- **Login** : `https://votre-app.onrender.com/login`

---

## 📱 Configuration Mobile Money Guinée

L'application supporte les paiements Mobile Money suivants :

| Opérateur | Préfixes |
|-----------|----------|
| **Orange Money** | 622, 624, 625, 626 |
| **MTN MoMo** | 667, 668, 669 |

---

## 🔧 Dépannage

### Erreur 502 Bad Gateway
- Vérifiez que `HOSTNAME=0.0.0.0` est défini
- Vérifiez que le port utilise `${PORT:-10000}`

### Erreur de base de données
- Vérifiez que `DATABASE_URL` est correct
- Vérifiez que la base NEON est active

### Build échoue
- Vérifiez les logs dans Render
- Assurez-vous que toutes les variables sont définies
