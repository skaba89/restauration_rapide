# Déploiement Vercel - Guide Étape par Étape

## 📋 Prérequis

- Un compte GitHub (gratuit)
- Le code du projet Restaurant OS

---

## Étape 1: Créer un compte Vercel

1. Aller sur **https://vercel.com**
2. Cliquer sur **"Sign Up"** (en haut à droite)
3. Choisir **"Continue with GitHub"**
4. Autoriser Vercel à accéder à votre GitHub

---

## Étape 2: Préparer le code sur GitHub

### 2.1 Créer un repository GitHub

1. Aller sur **https://github.com/new**
2. Remplir:
   - **Repository name**: `restaurant-os`
   - **Description**: `Restaurant Management SaaS for Africa`
   - **Visibility**: Public ou Private (au choix)
3. Cliquer **"Create repository"**

### 2.2 Pousser le code

Dans votre terminal local:

```bash
# Aller dans le dossier du projet
cd /home/z/my-project

# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Créer un commit
git commit -m "Initial commit - Restaurant OS SaaS"

# Ajouter le remote GitHub
git remote add origin https://github.com/VOTRE-USERNAME/restaurant-os.git

# Pousser sur GitHub
git branch -M main
git push -u origin main
```

---

## Étape 3: Importer le projet sur Vercel

1. Aller sur **https://vercel.com/new**
2. Vous verrez une liste de vos repositories GitHub
3. Trouver **"restaurant-os"**
4. Cliquer sur **"Import"**

---

## Étape 4: Configurer le projet

### 4.1 Paramètres de base

Laisser les valeurs par défaut:
- **Framework Preset**: Next.js (auto-détecté)
- **Root Directory**: ./
- **Build Command**: `npm run build`
- **Output Directory**: .next

### 4.2 Ajouter les variables d'environnement

Cliquer sur **"Environment Variables"** et ajouter CES VARIABLES une par une:

```
DATABASE_URL
postgresql://neondb_owner:npg_Na7YByjPd6oM@ep-purple-credit-amcj54ym-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require
```

```
PUSHER_APP_ID
2133805
```

```
PUSHER_KEY
1a29aab5e26674291660
```

```
PUSHER_SECRET
edbcb0c4ccf85d944030
```

```
NEXT_PUBLIC_PUSHER_KEY
1a29aab5e26674291660
```

```
NEXT_PUBLIC_PUSHER_CLUSTER
eu
```

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
dposre2tc
```

```
CLOUDINARY_API_KEY
925519687893382
```

```
CLOUDINARY_API_SECRET
TtU7PA_CxVkXgqHqCfX5xx7ymVk
```

```
NEXTAUTH_SECRET
restaurant-os-production-secret-2024-secure
```

```
NEXT_PUBLIC_APP_NAME
Restaurant OS
```

**Note:** Ne PAS ajouter NEXTAUTH_URL maintenant (on le fera après avoir l'URL)

---

## Étape 5: Déployer

1. Vérifier que toutes les variables sont ajoutées
2. Cliquer sur **"Deploy"**
3. Attendre 2-5 minutes (le build se lance)

Vous verrez:
- ⏳ "Building..." 
- ⏳ "Deploying..."
- ✅ "Congratulations!" avec confettis

---

## Étape 6: Récupérer l'URL et finaliser

### 6.1 Noter votre URL

Après le déploiement, Vercel vous donne une URL comme:
```
https://restaurant-os-xyz123.vercel.app
```

### 6.2 Ajouter NEXTAUTH_URL

1. Aller dans **Settings** > **Environment Variables**
2. Cliquer **"Add"**
3. Ajouter:
   ```
   NEXTAUTH_URL
   https://restaurant-os-xyz123.vercel.app
   ```
   (Remplacer par VOTRE URL)

4. Cliquer **"Save"**

### 6.3 Redéployer

Pour appliquer la nouvelle variable:
1. Aller dans **"Deployments"**
2. Cliquer sur les **"..."** du dernier déploiement
3. Sélectionner **"Redeploy"**

---

## Étape 7: Tester votre application

1. Ouvrir votre URL: `https://restaurant-os-xyz123.vercel.app`
2. Vérifier que la page d'accueil s'affiche
3. Tester la connexion avec:
   - **Email**: `admin@restaurant-os.com`
   - **Mot de passe**: `admin123`

---

## 🔧 Dépannage

### Erreur "Build Failed"

Vérifier les logs:
1. Aller dans **Deployments**
2. Cliquer sur le déploiement échoué
3. Lire les logs d'erreur

### Erreur "Database connection"

Vérifier que `DATABASE_URL` est correctement copiée (sans espaces)

### Erreur "Unauthorized"

Vérifier que `NEXTAUTH_URL` correspond à votre URL Vercel

---

## 📱 Domaine Personnalisé (Optionnel)

Pour utiliser votre propre domaine:

1. **Settings** > **Domains**
2. Cliquer **"Add"**
3. Entrer: `restaurant.votre-entreprise.com`
4. Suivre les instructions DNS

---

## ✅ Checklist Finale

- [ ] Compte Vercel créé
- [ ] Code poussé sur GitHub
- [ ] Projet importé sur Vercel
- [ ] 11 variables d'environnement ajoutées
- [ ] Déploiement réussi
- [ ] NEXTAUTH_URL configuré
- [ ] Application accessible en ligne

---

**Félicitations ! 🎉 Votre Restaurant OS est en ligne !**
