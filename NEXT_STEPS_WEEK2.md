# 🎯 PROCHAINES ÉTAPES - SEMAINE 2

*Après déploiement des corrections de sécurité (Semaine 1)*

---

## 📦 FONCTIONNALITÉS À IMPLÉMENTER

### 1. Terminal POS (Point de Vente) - PRIORITAIRE

**Objectif:** Interface caisse rapide pour les caissiers

**Fichiers à créer:**
```
src/
├── app/
│   └── pos/
│       ├── page.tsx              # Page principale POS
│       ├── components/
│       │   ├── product-grid.tsx  # Grille produits
│       │   ├── cart-panel.tsx    # Panier actuel
│       │   ├── payment-modal.tsx # Modal paiement
│       │   └── receipt-preview.tsx # Aperçu ticket
│       └── utils/
│           └── pos-helpers.ts    # Helpers métier
└── lib/
    └── pos/
        ├── cart-manager.ts       # Gestion panier
        ├── discount-engine.ts    # Calcul remises
        └── receipt-generator.ts  # Génération tickets
```

**Features:**
- [ ] Recherche produit rapide (barcode, nom, catégorie)
- [ ] Ajout au panier en 1 click
- [ ] Modification quantités
- [ ] Remises manuelles (% ou fixe)
- [ ] Multi-paiement (cash + mobile money)
- [ ] Impression ticket thermique (80mm)
- [ ] Ouverture/fermeture caisse
- [ ] Mode offline ( IndexedDB)

**UI Mockup:**
```
┌─────────────────────────────────────────────────────┐
│  RESTAURANT OS - CAISSE            [Conakry] 14:30  │
├─────────────────────────────────────────────────────┤
│  RECHERCHE: [____________________]  [📷 Scanner]    │
│  Catégorie: [Tous ▼]  Burgers  Pizzas  Boissons     │
├──────────────────┬──────────────────────────────────┤
│  PRODUITS        │  PANIER ACTUEL                   │
│  ┌────┐ ┌────┐   │  ┌────────────────────────────┐  │
│  │🍔  │ │🍕  │   │  │ 1x Burger Classic    50k  │  │
│  │Burger│Pizza│   │  │ 1x Coca Cola         15k  │  │
│  │50k │ │45k │   │  │                          │  │
│  └────┘ └────┘   │  │ Total:          65 000 GNF │  │
│                  │  │ Remise:        -5 000 GNF  │  │
│  ┌────┐ ┌────┐   │  │ ─────────────────────────  │  │
│  │🥤  │ │🍟  │   │  │ À payer:      60 000 GNF  │  │
│  │Coca│ │Frites│   │  │                          │  │
│  │15k │ │25k │   │  │ [Payer] [Annuler] [Imprimer]│ │
│  └────┘ └────┘   │  └────────────────────────────┘  │
└──────────────────┴──────────────────────────────────┘
```

---

### 2. Dashboard Analytics

**Objectif:** Vue d'ensemble du chiffre d'affaires et performances

**Fichiers à modifier/créer:**
```
src/
├── app/
│   └── dashboard/
│       ├── page.tsx              # Dashboard principal
│       ├── components/
│       │   ├── revenue-chart.tsx # Graphique CA (Recharts)
│       │   ├── stats-cards.tsx   # KPIs du jour
│       │   ├── top-products.tsx  # Top 10 produits
│       │   └── orders-timeline.tsx # Commandes par heure
│       └── api/
│           └── analytics/
│               └── summary/route.ts # API stats aggregées
```

**KPIs à afficher:**
- [ ] Chiffre d'affaires du jour (vs hier)
- [ ] Nombre de commandes (vs hier)
- [ ] Panier moyen
- [ ] Produit le plus vendu
- [ ] Heure de pointe
- [ ] Taux de croissance (7 jours)
- [ ] Paiements par méthode (camembert)

**API Endpoint:**
```typescript
// GET /api/analytics/summary?period=today|week|month
{
  revenue: {
    today: 2500000,      // GNF
    yesterday: 2100000,
    growth: 19.05        // %
  },
  orders: {
    today: 87,
    yesterday: 72,
    growth: 20.83
  },
  averageCart: 28736,    // GNF
  topProducts: [
    { name: "Burger Classic", qty: 34, revenue: 1700000 },
    { name: "Coca Cola", qty: 52, revenue: 780000 }
  ],
  paymentsByMethod: {
    cash: 65,            // %
    orangeMoney: 25,
    mtnMoney: 10
  }
}
```

---

### 3. Gestion de Stock

**Objectif:** Suivi des stocks et alertes automatiques

**Fichiers à créer:**
```
src/
├── app/
│   └── inventory/
│       ├── page.tsx              # Liste produits + stocks
│       ├── low-stock/page.tsx    # Alertes stock faible
│       └── adjustments/page.tsx  # Historique mouvements
├── lib/
│   └── inventory/
│       ├── stock-manager.ts      # Logique stock
│       └── alerts-engine.ts      # Système d'alertes
└── prisma/
    └── schema.prisma             # Ajouter: InventoryLog
```

**Nouveau modèle Prisma:**
```prisma
model InventoryLog {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  type        String   // IN, OUT, ADJUSTMENT, WASTE
  quantity    Int
  reason      String?
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  
  @@index([productId, createdAt])
}
```

**Features:**
- [ ] Stock initial par produit
- [ ] Décrémentation auto à chaque vente
- [ ] Seuil d'alerte configurable
- [ ] Notifications email/SMS stock faible
- [ ] Historique des mouvements
- [ ] Inventaire physique (corrections)
- [ ] Export Excel/PDF

---

### 4. Tickets & Reçus PDF

**Objectif:** Génération de tickets professionnels

**Dépendance:** `npm install pdfkit @types/pdfkit`

**Fichier:**
```
src/lib/receipt-generator.ts
```

**Exemple code:**
```typescript
import PDFDocument from 'pdfkit';
import fs from 'fs';

export async function generateReceipt(order: OrderWithDetails) {
  const doc = new PDFDocument({ size: [210, 350], margin: 10 }); // 80mm thermal
  
  // Header
  doc.fontSize(14).text('RESTAURANT OS', { align: 'center' });
  doc.fontSize(10).text('Conakry, Guinée', { align: 'center' });
  doc.text(`Tel: +224 XX XX XX XX`, { align: 'center' });
  doc.moveDown();
  
  // Order info
  doc.text(`Ticket #${order.id.slice(-6)}`);
  doc.text(`Date: ${formatDate(order.createdAt)}`);
  doc.text(`Caissier: ${order.cashier.name}`);
  doc.moveDown();
  
  // Items
  order.items.forEach(item => {
    doc.text(`${item.quantity}x ${item.product.name}`);
    doc.text(`    ${formatGNF(item.price * item.quantity)}`, { align: 'right' });
  });
  
  doc.moveDown();
  doc.text('────────────────────────', { align: 'center' });
  doc.text(`TOTAL: ${formatGNF(order.total)}`, { bold: true });
  doc.text(`Paiement: ${order.paymentMethod}`);
  doc.moveDown();
  
  // Footer
  doc.text('Merci de votre visite!', { align: 'center' });
  doc.text('À bientôt chez Restaurant OS', { align: 'center' });
  
  // Save or stream
  const pdfBuffer = [];
  doc.on('data', chunk => pdfBuffer.push(chunk));
  
  return new Promise<Buffer>(resolve => {
    doc.on('end', () => resolve(Buffer.concat(pdfBuffer)));
  });
}
```

---

## 📅 PLANIFICATION SEMAINE 2

### Lundi: Terminal POS (Partie 1)
- [ ] Structure dossiers et composants
- [ ] Grille produits avec recherche
- [ ] Gestion panier (ajout/suppression)
- [ ] Tests unitaires

### Mardi: Terminal POS (Partie 2)
- [ ] Modal paiement multi-methods
- [ ] Intégration Orange Money test
- [ ] Génération ticket (version simple)
- [ ] Tests E2E flux complet

### Mercredi: Dashboard
- [ ] API analytics summary
- [ ] Graphiques Recharts (CA, commandes)
- [ ] Cartes KPIs
- [ ] Top produits
- [ ] Filtres par période

### Jeudi: Gestion Stock
- [ ] Modèle InventoryLog
- [ ] Migration Prisma
- [ ] Page liste stocks
- [ ] Alertes stock faible
- [ ] Historique mouvements

### Vendredi: Finalisation
- [ ] Tickets PDF professionnels
- [ ] Tests intensifs
- [ ] Corrections bugs
- [ ] Documentation
- [ ] Déploiement Render

---

## 🧪 TESTS À PRÉVOIR

### Tests Unitaires
```bash
# Exécuter
npm run test

# Couverture cible: >80%
```

### Tests E2E (Playwright)
```typescript
// tests/e2e/pos.spec.ts
test('flux commande complet', async ({ page }) => {
  await page.goto('/pos');
  await page.click('[data-product="burger-classic"]');
  await page.click('[data-action="pay"]');
  await page.selectOption('[name="paymentMethod"]', 'orange-money');
  await page.click('[type="submit"]');
  await expect(page.locator('[data-receipt]')).toBeVisible();
});
```

---

## 📊 MÉTRIQUES DE SUCCÈS

### Performance
- Temps chargement POS: < 2s
- Ajout au panier: < 100ms
- Génération ticket: < 500ms

### UX
- Clicks minimum pour une commande: < 5
- Formation nouveau caissier: < 30min
- Satisfaction utilisateur: > 4/5

### Business
- Commandes traitées/heure: +30%
- Erreurs de caisse: -50%
- Temps d'attente client: -40%

---

## 🔗 LIENS UTILES

- **Recharts:** https://recharts.org/
- **PDFKit:** https://pdfkit.org/
- **Playwright:** https://playwright.dev/
- **Orange Money API:** https://developer.orange.com/apis/payment-ci

---

**Prêt pour la Semaine 2?** Commencez par le POS terminal! 🚀
