# ============================================
# Restaurant OS - Guide de Déploiement Production
# Version 1.0.0
# ============================================

## Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration SSL/HTTPS](#configuration-sslhttps)
3. [Base de Données PostgreSQL](#base-de-données-postgresql)
4. [Configuration Mobile Money](#configuration-mobile-money)
5. [Notifications Push](#notifications-push)
6. [WebSocket Temps Réel](#websocket-temps-réel)
7. [Déploiement avec Docker](#déploiement-avec-docker)
8. [Monitoring & Health Checks](#monitoring--health-checks)

---

## 1. Prérequis

### Serveur

- Ubuntu 22.04 LTS ou supérieur
- Minimum 2 CPU, 4 GB RAM
- 20 GB d'espace disque
- Docker et Docker Compose installés

### Domaine

- Un domaine configuré (ex: `restaurant-os.com`)
- Enregistrement DNS pointant vers votre serveur

### Ports

- 80 (HTTP) - Redirection vers HTTPS
- 443 (HTTPS) - Application principale
- 5432 - PostgreSQL (interne)
- 6379 - Redis (interne)
- 3001 - WebSocket (interne)

---

## 2. Configuration SSL/HTTPS

### Option A: Caddy (Recommandé - Auto SSL)

Le fichier `Caddyfile` est déjà configuré. Modifiez-le avec votre domaine:

```
{
    email your-email@example.com
}

your-domain.com {
    reverse_proxy app:3000
    reverse_proxy /socket.io/* realtime:3001
}
```

### Option B: Nginx + Let's Encrypt

1. Installer Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. Obtenir le certificat:
```bash
sudo certbot --nginx -d your-domain.com
```

3. Utiliser la configuration Nginx fournie dans `docker/nginx.production.conf`

---

## 3. Base de Données PostgreSQL

### Configuration Docker

Le fichier `docker-compose.prod.yml` inclut déjà PostgreSQL. Les variables d'environnement:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@postgres:5432/restaurant_os?schema=public"
```

### Migration de SQLite vers PostgreSQL

1. Exporter les données SQLite:
```bash
npx prisma db pull
npx prisma generate
```

2. Pousser vers PostgreSQL:
```bash
npx prisma db push
```

---

## 4. Configuration Mobile Money

### Orange Money (Côte d'Ivoire, Sénégal)

1. Créer un compte marchand sur Orange Money Developer
2. Configurer les variables:

```
ORANGE_MONEY_API_KEY=your_api_key
ORANGE_MONEY_MERCHANT_ID=your_merchant_id
ORANGE_MONEY_WEBHOOK_SECRET=your_webhook_secret
```

URL de webhook: `https://your-domain.com/api/webhooks/orange-money`

### MTN Mobile Money

```
MTN_MOMO_SUBSCRIPTION_KEY=your_subscription_key
MTN_MOMO_API_USER=your_api_user
MTN_MOMO_API_KEY=your_api_key
```

URL de webhook: `https://your-domain.com/api/webhooks/mtn-momo`

### Wave (Sénégal, Côte d'Ivoire)

```
WAVE_API_KEY=your_wave_api_key
WAVE_WEBHOOK_SECRET=your_webhook_secret
```

URL de webhook: `https://your-domain.com/api/webhooks/wave`

### MPesa (Kenya, Tanzanie)

```
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
```

URL de webhook: `https://your-domain.com/api/webhooks/mpesa`

---

## 5. Notifications Push

### Générer les clés VAPID

```bash
bun scripts/generate-vapid-keys.js
```

### Configuration

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

---

## 6. WebSocket Temps Réel

### Architecture

```
[Nginx/Caddy] → [WebSocket Server:3001] → [Redis Pub/Sub]
```

### Configuration Nginx pour WebSocket

```nginx
location /socket.io/ {
    proxy_pass http://realtime:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 7d;
}
```

---

## 7. Déploiement avec Docker

### Quick Start

```bash
# 1. Copier le fichier d'environnement
cp .env.production .env

# 2. Éditer les variables
nano .env

# 3. Lancer le déploiement
./scripts/deploy-production.sh
```

### Commandes Docker utiles

```bash
# Voir les logs
docker compose -f docker-compose.prod.yml logs -f app

# Redémarrer un service
docker compose -f docker-compose.prod.yml restart app

# Mettre à jour
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Sauvegarder la base
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres restaurant_os > backup.sql
```

---

## 8. Monitoring & Health Checks

### Health Check Endpoints

- Application: `https://your-domain.com/api`
- WebSocket: `https://your-domain.com:3001/health`

### Sentry (Monitoring d'erreurs)

```
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ORG=restaurant-os
```

---

## Checklist Pré-Production

- [ ] Variables d'environnement configurées
- [ ] SSL/HTTPS activé
- [ ] Base de données PostgreSQL migrée
- [ ] Redis configuré pour le caching
- [ ] Webhooks Mobile Money testés
- [ ] Notifications push configurées
- [ ] WebSocket fonctionnel
- [ ] Monitoring Sentry activé
- [ ] Backups automatisés
- [ ] Rate limiting configuré
