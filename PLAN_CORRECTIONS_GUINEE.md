# 🇬🇳 PLAN DE CORRECTIONS & AMÉLIORATIONS - RESTAURANT OS GUINÉE

## 📊 ÉTAT DES LIEUX (Avril 2025)

### ✅ DÉJÀ IMPLÉMENTÉ (80% fonctionnel)

| Fonctionnalité | Statut | Fichier | Notes |
|----------------|--------|---------|-------|
| **Authentification bcrypt** | ✅ OK | `src/lib/auth-secure.ts` | bcryptjs installé, hash + verify |
| **JWT sécurisé** | ✅ OK | `src/lib/auth-secure.ts` | HS256, refresh tokens, blacklist |
| **Devise GNF** | ✅ OK | `src/lib/currency.ts` | Franc Guinéen configuré |
| **Orange Money GN** | ✅ OK | `src/lib/payments/mobile-money.ts` | Support Guinée inclus |
| **MTN Mobile Money** | ✅ OK | `src/lib/payments/mobile-money.ts` | Sandbox + production |
| **Wave** | ✅ OK | `src/lib/payments/mobile-money.ts` | CI, SN supportés |
| **POS Terminal** | ✅ OK | `src/app/(restaurant-admin)/restaurant/[id]/pos/page.tsx` | Interface complète |
| **Gestion Stock** | ✅ OK | `src/app/api/inventory/route.ts` | CRUD + alertes |
| **182 API Routes** | ✅ OK | `src/app/api/` | Toutes catégories |
| **Multi-tenant** | ✅ OK | `prisma/schema.prisma` | Organization + Restaurant |
| **Offline-first** | ⚠️ Partiel | `src/lib/offline/` | À tester en conditions réelles |
| **Dashboard** | ⚠️ Partiel | `src/app/(restaurant-admin)/restaurant/[id]/dashboard/page.tsx` | À compléter |

---

## 🔧 CORRECTIONS CRITIQUES (Semaine 1)

### 1. Sécurisation API Deliveries

**Problème**: Cast enum non sécurisé ligne 182

**Fichier**: `src/app/api/deliveries/route.ts`

```typescript
// ❌ AVANT (non sécurisé)
...(status && { status: status as DeliveryStatus }),

// ✅ APRÈS (validé)
import { DeliveryStatusSchema } from '@/lib/validations';
...(status && { status: DeliveryStatusSchema.parse(status) }),
```

**Action**: Créer le schema Zod dans `src/lib/validations/delivery.ts`

---

### 2. Rate Limiting Persistant (Redis/PostgreSQL)

**Problème**: Rate limiter actuel est en mémoire (perdu au redémarrage)

**Solution**: Utiliser PostgreSQL pour stocker les compteurs

**Fichier à créer**: `src/lib/rate-limiter-db.ts`

```typescript
import { db } from '@/lib/db';

export class DatabaseRateLimiter {
  async checkLimit(identifier: string, limit: number, windowMs: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  }> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);

    // Compter les requêtes dans la fenêtre
    const count = await db.rateLimit.count({
      where: {
        identifier,
        createdAt: { gte: windowStart },
      },
    });

    if (count >= limit) {
      return { allowed: false, remaining: 0, resetAt: new Date(now.getTime() + windowMs) };
    }

    // Enregistrer la requête
    await db.rateLimit.create({
      data: { identifier, createdAt: now },
    });

    return {
      allowed: true,
      remaining: limit - count - 1,
      resetAt: new Date(now.getTime() + windowMs),
    };
  }
}
```

**Migration Prisma à ajouter**:
```prisma
model RateLimit {
  id        String   @id @default(cuid())
  identifier String
  createdAt DateTime @default(now())
  
  @@index([identifier, createdAt])
}
```

---

### 3. Validation des Inputs API

**Problème**: Certaines API n'ont pas de validation Zod

**Fichiers à vérifier**:
- `src/app/api/orders/route.ts`
- `src/app/api/payments/route.ts`
- `src/app/api/customers/route.ts`

**Solution**: Ajouter les schemas dans `src/lib/validations/`

---

## 📦 AMÉLIORATIONS MÉTIER (Semaine 2)

### 1. Dashboard Complet

**Fichier**: `src/app/(restaurant-admin)/restaurant/[id]/dashboard/page.tsx`

**À ajouter**:
- [ ] Graphique CA par jour (Chart.js ou Recharts)
- [ ] Top 5 produits
- [ ] Alertes stock faible
- [ ] Commandes en cours
- [ ] Stats temps réel (WebSocket)

**Mockup**:
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <StatCard title="CA Aujourd'hui" value={`${todayRevenue.toLocaleString()} GNF`} icon={TrendingUp} />
  <StatCard title="Commandes" value={todayOrders} icon={ShoppingBag} />
  <StatCard title="Clients" value={todayCustomers} icon={Users} />
  <StatCard title="Panier Moyen" value={`${avgCart.toLocaleString()} GNF`} icon={Calculator} />
</div>
```

---

### 2. Gestion Stock avec Alertes

**Fichier**: `src/app/(restaurant-admin)/restaurant/[id]/inventory/page.tsx`

**À compléter**:
- [ ] Liste des produits avec statut (OK / Faible / Rupture)
- [ ] Formulaire d'ajustement de stock
- [ ] Historique des mouvements
- [ ] Notifications stock faible (email/SMS)

**Seuils d'alerte**:
```typescript
const STOCK_THRESHOLDS = {
  critical: 0,      // Rouge
  low: 5,          // Orange
  normal: Infinity // Vert
};
```

---

### 3. Offline Mode Robuste

**Fichier**: `src/lib/offline/sync-engine.ts`

**Architecture**:
```typescript
class SyncEngine {
  private queue: LocalQueue;
  private isOnline: boolean;

  async enqueue(action: OfflineAction) {
    await this.queue.push(action);
    if (this.isOnline) {
      this.sync();
    }
  }

  async sync() {
    const actions = await this.queue.getAll();
    for (const action of actions) {
      try {
        await api.post(action.endpoint, action.data);
        await this.queue.remove(action.id);
      } catch (error) {
        // Retry later with exponential backoff
      }
    }
  }
}
```

---

## 🏪 FONCTIONNALITÉS AFRIQUE (Semaine 3)

### 1. Orange Money Guinée (Production)

**Configuration**:
```env
ORANGE_MONEY_API_KEY="om_gn_prod_xxx"
ORANGE_MONEY_CLIENT_ID="client_gn_xxx"
ORANGE_MONEY_CLIENT_SECRET="secret_gn_xxx"
ORANGE_MONEY_COUNTRY="GN"
ORANGE_MONEY_CURRENCY="GNF"
ORANGE_MONEY_WEBHOOK_SECRET="whsec_xxx"
```

**Endpoints à tester**:
- `POST /api/payments/orange-money/initiate`
- `POST /api/webhooks/orange-money`

**Flux de paiement**:
1. Client sélectionne "Orange Money"
2. API appelle Orange Money GN
3. USSD push sur le téléphone du client
4. Client valide sur son mobile
5. Webhook confirme le paiement
6. Commande validée

---

### 2. MTN Mobile Money Guinée

**Configuration**:
```env
MTN_MOMO_API_KEY="momo_gn_prod_xxx"
MTN_MOMO_CLIENT_ID="client_gn_xxx"
MTN_MOMO_CLIENT_SECRET="secret_gn_xxx"
MTN_MOMO_ENVIRONMENT="production"
MTN_MOMO_CURRENCY="GNF"
```

**Note**: MTN GN utilise l'API MoMo standard

---

### 3. Wave Guinée (À venir)

Wave n'est pas encore en Guinée mais prévoir l'intégration:
```typescript
// Réserver le code
case 'WAVE_GN':
  // À implémenter quand Wave lance en GN
  break;
```

---

## 🐳 DÉPLOIEMENT RENDER + NEON (Semaine 4)

### 1. Configuration Render

**Fichier**: `render.yaml` (déjà présent)

**Vérifier**:
- [ ] Région: Europe (Frankfurt) pour latence GN (~150ms)
- [ ] Instance: Standard ($7/mois) minimum
- [ ] Auto-deploy: ON
- [ ] Health check: `/api/health`

### 2. Configuration Neon PostgreSQL

**Steps**:
1. Créer projet Neon: `restaurant-os-gn`
2. Copier `DATABASE_URL` et `DATABASE_URL_DIRECT`
3. Activer Row Level Security (RLS)
4. Configurer backup automatique (quotidien)

**Commande migration**:
```bash
npx prisma migrate deploy
npx prisma generate
```

### 3. Variables d'Environnement Production

**.env.production**:
```env
DATABASE_URL="postgresql://xxx@ep-xxx.eu-central-1.aws.neon.tech/restaurant_os?sslmode=require"
DATABASE_URL_DIRECT="postgresql://xxx@ep-xxx.eu-central-1.aws.neon.tech/restaurant_os?sslmode=require"

JWT_SECRET="$(openssl rand -base64 32)"
NEXT_PUBLIC_APP_URL="https://restaurant-os-gn.onrender.com"
NODE_ENV="production"

DEFAULT_CURRENCY="GNF"
DEFAULT_TIMEZONE="Africa/Conakry"

ORANGE_MONEY_API_KEY="om_gn_prod_xxx"
ORANGE_MONEY_COUNTRY="GN"

SENTRY_DSN="https://xxx@sentry.io/xxx"
```

---

## 📈 MODÈLE ÉCONOMIQUE GUINÉE

### Pricing (Franc Guinéen - GNF)

| Plan | Prix/mois | Cible | Features |
|------|-----------|-------|----------|
| **Starter** | 150 000 GNF | Petit restaurant | POS, Menu, Commandes, 1 utilisateur |
| **Growth** | 350 000 GNF | Restaurant moyen | + Delivery, Inventory, Dashboard, 5 utilisateurs |
| **Pro** | 750 000 GNF | Chaîne | + Multi-site, Analytics, API, Illimité |
| **Enterprise** | Sur mesure | Franchises | White-label, SLA, Support 24/7 |

### Projections (Année 1)

| Mois | Clients | MRR (GNF) | MRR (EUR) |
|------|---------|-----------|-----------|
| M3 | 10 | 2 500 000 | ~300€ |
| M6 | 25 | 6 250 000 | ~750€ |
| M9 | 40 | 10 000 000 | ~1200€ |
| M12 | 50 | 15 000 000 | ~1800€ |

**Objectif**: 50 clients en 12 mois = 180M GNF/an (~21 600€)

---

## ✅ CHECKLIST FINALE

### Semaine 1 (Corrections)
- [ ] Fix API deliveries (enum cast)
- [ ] Rate limiting DB (PostgreSQL)
- [ ] Validation Zod toutes les APIs
- [ ] Tests unitaires critiques

### Semaine 2 (Dashboard)
- [ ] Page dashboard complète
- [ ] Graphiques (Recharts)
- [ ] Stats temps réel
- [ ] Alertes stock

### Semaine 3 (Paiements)
- [ ] Orange Money GN (sandbox → prod)
- [ ] MTN MoMo GN
- [ ] Tests end-to-end
- [ ] Documentation webhooks

### Semaine 4 (Déploiement)
- [ ] Migration Neon PostgreSQL
- [ ] Config Render production
- [ ] HTTPS/SSL
- [ ] Monitoring Sentry
- [ ] Backup automatique

---

## 📞 SUPPORT & MAINTENANCE

### Monitoring
- **Sentry**: Erreurs applicatives
- **UptimeRobot**: Disponibilité (99.9%)
- **Logs Render**: Debug production

### Support Clients
- **Email**: support@restaurant-os.gn
- **WhatsApp**: +224 XXX XXX XXX
- **Documentation**: docs.restaurant-os.gn

### Mises à Jour
- **Hebdomadaire**: Corrections bugs
- **Mensuelle**: Nouvelles features
- **Trimestrielle**: Breaking changes (préavis 30 jours)

---

*Document généré pour KFM DELICE - Avril 2025*
*Version: 1.0.0*
*Prochain review: Semaine 2*
