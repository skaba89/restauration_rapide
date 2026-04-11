const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer, 
        AlignmentType, HeadingLevel, BorderStyle, WidthType, PageNumber, ShadingType,
        VerticalAlign, LevelFormat, PageBreak, TableOfContents } = require('docx');
const fs = require('fs');

// Color palette - Midnight Code
const colors = {
  primary: "#020617",
  body: "#1E293B",
  secondary: "#64748B",
  accent: "#94A3B8",
  tableBg: "#F8FAFC",
  headerBg: "#E2E8F0"
};

const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: colors.accent };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Times New Roman", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 56, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: colors.body, font: "Times New Roman" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: colors.secondary, font: "Times New Roman" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } }
    ]
  },
  numbering: {
    config: [
      { reference: "bullet-list",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-features",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-api",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-improvements",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-security",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-deploy",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
    ]
  },
  sections: [
    // Cover Page
    {
      properties: { page: { margin: { top: 0, right: 0, bottom: 0, left: 0 } } },
      children: [
        new Paragraph({ spacing: { before: 6000 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({ text: "RAPPORT D'ANALYSE", size: 72, bold: true, color: colors.primary, font: "Times New Roman" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "Restaurant OS - KFM DELICE", size: 48, color: colors.secondary, font: "Times New Roman" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 },
          children: [new TextRun({ text: "Application SaaS de Gestion de Restaurant pour l'Afrique", size: 28, italics: true, color: colors.accent, font: "Times New Roman" })]
        }),
        new Paragraph({ spacing: { before: 4000 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Version 1.0 - Mars 2026", size: 24, color: colors.secondary, font: "Times New Roman" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200 },
          children: [new TextRun({ text: "Conakry, Guinée", size: 22, color: colors.accent, font: "Times New Roman" })]
        }),
        new Paragraph({ children: [new PageBreak()] })
      ]
    },
    // Main Content
    {
      properties: { page: { margin: { top: 1800, right: 1440, bottom: 1440, left: 1440 } } },
      headers: {
        default: new Header({ children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "Restaurant OS - Analyse Technique", size: 18, color: colors.secondary, font: "Times New Roman" })]
        })] })
      },
      footers: {
        default: new Footer({ children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Page ", size: 18, font: "Times New Roman" }), 
                     new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Times New Roman" }), 
                     new TextRun({ text: " / ", size: 18, font: "Times New Roman" }),
                     new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: "Times New Roman" })]
        })] })
      },
      children: [
        // Table of Contents
        new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("Table des Matières")] }),
        new TableOfContents("Table des Matières", { hyperlink: true, headingStyleRange: "1-3" }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 400 },
          children: [new TextRun({ text: "Note: Cliquez droit sur la table et sélectionnez \"Mettre à jour le champ\" pour actualiser les numéros de page.", size: 18, color: "999999", italics: true, font: "Times New Roman" })]
        }),
        new Paragraph({ children: [new PageBreak()] }),

        // Executive Summary
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Résumé Exécutif")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Restaurant OS est une application SaaS (Software as a Service) multi-tenant conçue pour la gestion complète de restaurants en Afrique. Cette solution moderne offre une plateforme intégrée permettant de gérer les commandes, les menus, les livraisons, les réservations et les paiements Mobile Money. Le projet a été spécialement configuré pour KFM DELICE, un restaurant fast-food basé à Conakry, en Guinée, avec une personnalisation complète incluant la devise locale (Franc Guinéen - GNF) et les méthodes de paiement Mobile Money locales (Orange Money et MTN MoMo).", font: "Times New Roman", size: 22 })]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "L'architecture technique repose sur Next.js 16 avec TypeScript, Prisma ORM pour la gestion de base de données, et une série de services tiers incluant Pusher pour le temps réel, Cloudinary pour le stockage d'images, et NEON PostgreSQL pour la persistance des données. Le projet comprend actuellement 128 fichiers TSX (composants React) et 117 fichiers TypeScript, représentant un total de 3,1 Mo de code source, ce qui démontre l'ampleur et la maturité de cette solution.", font: "Times New Roman", size: 22 })]
        }),

        // Architecture
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Architecture Technique")] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 Stack Technologique")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "L'application utilise une stack moderne et robuste, spécifiquement choisie pour répondre aux exigences de performance et de scalabilité d'un environnement SaaS multi-tenant. Le framework Next.js 16 avec son architecture App Router permet une gestion efficace du rendu côté serveur et client, tandis que TypeScript garantit la sécurité du typage et améliore la maintenabilité du code. Tailwind CSS 4 offre un système de styling utilitaire performant et cohérent.", font: "Times New Roman", size: 22 })]
        }),
        
        new Table({
          columnWidths: [3120, 6240],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Technologie", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Description et Utilisation", bold: true, size: 22, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Next.js 16", bold: true, size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Framework React avec App Router, SSR/SSG, et optimisations automatiques", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "TypeScript", bold: true, size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Typage statique pour la sécurité du code et l'autocomplétion", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Prisma 6", bold: true, size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "ORM moderne avec migrations, client type-safe et introspection DB", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Tailwind CSS 4", bold: true, size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Framework CSS utilitaire avec design system personnalisable", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "shadcn/ui", bold: true, size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Bibliothèque de composants accessible et personnalisable", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "NEON PostgreSQL", bold: true, size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Base de données serverless avec auto-scaling et branch", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Pusher", bold: true, size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "WebSockets pour notifications temps réel et tracking", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Cloudinary", bold: true, size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Gestion et optimisation automatique des images et médias", size: 22, font: "Times New Roman" })] })] })
            ]})
          ]
        }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 300 },
          children: [new TextRun({ text: "Tableau 1: Stack technologique principale", size: 18, italics: true, color: colors.secondary, font: "Times New Roman" })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.2 Structure du Projet")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Le projet suit une architecture modulaire et bien organisée, facilitant la maintenance et l'extension. La séparation claire entre les différentes couches de l'application (présentation, logique métier, données) permet une évolution indépendante de chaque composant. Cette structure reflète les meilleures pratiques du développement Next.js moderne.", font: "Times New Roman", size: 22 })]
        }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "src/app/ (1.8 Mo) : Pages et routes de l'application avec App Router", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "src/components/ (508 Ko) : Composants réutilisables et UI", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "src/lib/ (620 Ko) : Utilitaires, services et configurations", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "prisma/ (128 Ko) : Schéma de base de données et migrations", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 300 }, children: [new TextRun({ text: "scripts/ : Scripts de configuration et seeding", font: "Times New Roman", size: 22 })] }),

        // Database Schema
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Modèle de Données")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Le schéma de base de données Prisma est remarquablement complet avec plus de 50 modèles interconnectés. Cette richesse permet de gérer tous les aspects d'un restaurant moderne, des commandes aux réservations, en passant par la fidélité et les livraisons. La conception suit les principes de normalisation tout en optimisant les performances pour les requêtes fréquentes.", font: "Times New Roman", size: 22 })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.1 Entités Principales")] }),
        new Table({
          columnWidths: [2340, 2340, 4680],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Catégorie", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Modèles", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Description", bold: true, size: 22, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Utilisateurs", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "User, Session, RefreshToken, OtpCode", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Gestion des comptes, authentification et sécurité", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Organisation", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Organization, OrganizationSettings, Brand", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Structure multi-tenant avec configuration globale", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Restaurant", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Restaurant, Menu, MenuCategory, MenuItem", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Gestion des restaurants et menus avec variants", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Commandes", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Order, OrderItem, Cart, CartItem", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Cycle complet de commande avec historique", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Livraison", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Delivery, Driver, DeliveryZone, DeliveryTrackingEvent", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Gestion des livreurs et zones de livraison", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Clients", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "CustomerProfile, LoyaltyTransaction, Review", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Profils clients avec programme de fidélité", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Paiements", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Payment, Currency, Country", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Support multi-devises et paiement Mobile Money", size: 22, font: "Times New Roman" })] })] })
            ]})
          ]
        }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 300 },
          children: [new TextRun({ text: "Tableau 2: Principales entités du modèle de données", size: 18, italics: true, color: colors.secondary, font: "Times New Roman" })] }),

        // Features
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. Fonctionnalités")] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.1 Fonctionnalités Core")] }),
        new Paragraph({ numbering: { reference: "numbered-features", level: 0 }, children: [new TextRun({ text: "Menu Public : Affichage du menu restaurant accessible sans authentification avec navigation par catégories, recherche et filtrage. Interface optimisée pour mobile avec design responsive et temps de chargement optimisé.", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "numbered-features", level: 0 }, children: [new TextRun({ text: "Panier et Checkout : Gestion du panier avec persistance locale via Zustand, calcul automatique des totaux, application des frais de livraison par zone, et validation des montants minimums de commande.", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "numbered-features", level: 0 }, children: [new TextRun({ text: "Système de Commandes : Workflow complet de commande avec statuts (en attente, confirmée, en préparation, prête, livrée), notifications temps réel, et historique détaillé pour le suivi.", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "numbered-features", level: 0 }, children: [new TextRun({ text: "Gestion des Livraisons : Attribution automatique ou manuelle des livreurs, tracking GPS en temps réel, zones de livraison configurables avec frais personnalisés par quartier.", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "numbered-features", level: 0 }, children: [new TextRun({ text: "Programme de Fidélité : Système de points configurable avec niveaux, récompenses personnalisables, et historique des transactions de fidélité par client.", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "numbered-features", level: 0 }, spacing: { after: 300 }, children: [new TextRun({ text: "Réservations : Gestion des réservations avec contrôle de capacité, rappels automatiques, gestion des no-show, et attribution de tables.", font: "Times New Roman", size: 22 })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.2 API Endpoints")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "L'application expose une API REST complète avec 44 endpoints couvrant tous les aspects de la gestion restaurant. Ces endpoints suivent les conventions RESTful et retournent des réponses JSON standardisées avec gestion d'erreurs cohérente.", font: "Times New Roman", size: 22 })]
        }),
        new Paragraph({ numbering: { reference: "numbered-api", level: 0 }, children: [new TextRun({ text: "API Publiques : /api/public/restaurants, /api/public/restaurant/[slug], /api/public/orders - Accès sans authentification pour consultation et création de commandes.", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "numbered-api", level: 0 }, children: [new TextRun({ text: "API Admin : /api/admin/restaurants, /api/admin/users, /api/admin/analytics, /api/admin/subscriptions - Gestion complète pour les administrateurs.", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "numbered-api", level: 0 }, children: [new TextRun({ text: "API Restaurant : /api/orders, /api/menu, /api/reservations, /api/customers - Opérations quotidiennes du restaurant.", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "numbered-api", level: 0 }, children: [new TextRun({ text: "Webhooks : /api/webhooks/orange-money, /api/webhooks/mtn-momo, /api/webhooks/wave - Intégration paiements Mobile Money.", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "numbered-api", level: 0 }, spacing: { after: 300 }, children: [new TextRun({ text: "Health Check : /api/health - Monitoring de l'application et de la base de données.", font: "Times New Roman", size: 22 })] }),

        // Points forts
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. Points Forts")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "L'application Restaurant OS présente plusieurs atouts majeurs qui en font une solution compétitive sur le marché africain de la gestion de restaurants. Ces points forts ont été identifiés lors de l'analyse approfondie du code source et de l'architecture.", font: "Times New Roman", size: 22 })]
        }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Architecture Multi-Tenant : Support natif de plusieurs organisations et restaurants avec isolation des données et configuration individuelle par tenant.", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Mobile Money Africain : Intégration native d'Orange Money et MTN MoMo avec détection automatique des opérateurs par préfixe téléphonique.", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Interface Mobile-First : Design responsive optimisé pour les smartphones, avec interactions tactiles fluides et navigation intuitive.", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Temps Réel : Notifications instantanées via Pusher/WebSocket pour les commandes, livraisons et mises à jour de statut.", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Modèle de Données Complet : Schéma Prisma exhaustif couvrant tous les aspects métier d'un restaurant moderne.", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 300 }, children: [new TextRun({ text: "Deployment Ready : Configuration Render.yaml pour déploiement one-click sur Render avec variables d'environnement documentées.", font: "Times New Roman", size: 22 })] }),

        // Points à améliorer
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. Axes d'Amélioration")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Malgré ses nombreux atouts, l'application présente quelques zones nécessitant une attention particulière pour atteindre un niveau de qualité production. Ces améliorations sont classées par priorité et impact sur l'expérience utilisateur.", font: "Times New Roman", size: 22 })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.1 Tests et Qualité")] }),
        new Paragraph({ numbering: { reference: "numbered-improvements", level: 0 }, children: [new TextRun({ text: "Couverture de Tests : Ajouter des tests unitaires et d'intégration avec Vitest et Playwright pour garantir la stabilité du code. Actuellement, les tests existants sont limités.", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "numbered-improvements", level: 0 }, children: [new TextRun({ text: "Tests E2E Mobile : Développer des tests spécifiques pour les interactions tactiles iOS/Android afin de valider l'expérience mobile.", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "numbered-improvements", level: 0 }, spacing: { after: 200 }, children: [new TextRun({ text: "Documentation API : Compléter la documentation OpenAPI avec des exemples de requêtes/réponses pour chaque endpoint.", font: "Times New Roman", size: 22 })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.2 Sécurité")] }),
        new Paragraph({ numbering: { reference: "numbered-security", level: 0 }, children: [new TextRun({ text: "Rate Limiting : Implémenter un rate limiting plus strict sur les endpoints sensibles (authentification, création de commandes) pour prévenir les abus.", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "numbered-security", level: 0 }, children: [new TextRun({ text: "Validation des Entrées : Renforcer la validation Zod sur tous les endpoints API avec messages d'erreur localisés en français.", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "numbered-security", level: 0 }, spacing: { after: 200 }, children: [new TextRun({ text: "Audit Logging : Compléter le système d'audit logs pour tracer toutes les actions sensibles (modifications de prix, annulations de commandes).", font: "Times New Roman", size: 22 })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.3 Performance")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Optimiser les images de menu avec Cloudinary auto-transformations", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Implémenter le caching Redis pour les données de menu fréquemment accédées", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 300 }, children: [new TextRun({ text: "Ajouter la pagination sur les listes de commandes et clients", font: "Times New Roman", size: 22 })] }),

        // KFM DELICE Setup
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. Configuration KFM DELICE")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Le projet a été spécifiquement configuré pour KFM DELICE avec une personnalisation complète adaptée au marché guinéen. Cette configuration comprend les données du restaurant, le menu local, et l'intégration des méthodes de paiement locales.", font: "Times New Roman", size: 22 })]
        }),

        new Table({
          columnWidths: [3120, 6240],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Élément", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Configuration", bold: true, size: 22, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Nom du Restaurant", bold: true, size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "KFM DELICE", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Localisation", bold: true, size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Kaloum, Conakry, Guinée", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Devise", bold: true, size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Franc Guinéen (GNF)", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Articles au Menu", bold: true, size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "29 articles répartis en 7 catégories", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Zones de Livraison", bold: true, size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "8 zones à Conakry (Kaloum, Dixinn, Ratoma, Matam, Matoto, Simbaya, Yimbaya, Cosa)", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Mobile Money", bold: true, size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Orange Money (622,624,625,626), MTN MoMo (667,668,669)", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Email Admin", bold: true, size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "kfm.delice@guinee.com", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "URL Menu Public", bold: true, size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "/menu/kfm-delice", size: 22, font: "Times New Roman" })] })] })
            ]})
          ]
        }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 300 },
          children: [new TextRun({ text: "Tableau 3: Configuration spécifique KFM DELICE", size: 18, italics: true, color: colors.secondary, font: "Times New Roman" })] }),

        // Deployment
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("8. Déploiement")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Le projet est configuré pour un déploiement sur Render (plan gratuit) avec toutes les optimisations nécessaires pour un environnement de production. Le fichier render.yaml permet un déploiement automatisé avec configuration des variables d'environnement.", font: "Times New Roman", size: 22 })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("8.1 Étapes de Déploiement")] }),
        new Paragraph({ numbering: { reference: "numbered-deploy", level: 0 }, children: [new TextRun({ text: "Créer un compte sur render.com et connecter le repository GitHub skaba89/restauration-rapide", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "numbered-deploy", level: 0 }, children: [new TextRun({ text: "Créer un nouveau Web Service avec la configuration définie dans render.yaml (Build: npm run build, Start: npm run start)", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "numbered-deploy", level: 0 }, children: [new TextRun({ text: "Configurer les variables d'environnement (DATABASE_URL, PUSHER_*, CLOUDINARY_*, NEXTAUTH_*)", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "numbered-deploy", level: 0 }, children: [new TextRun({ text: "Déployer et attendre le build complet (5-10 minutes)", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "numbered-deploy", level: 0 }, children: [new TextRun({ text: "Exécuter l'API d'initialisation : POST /api/setup/kfm-delice pour créer les données du restaurant", font: "Times New Roman", size: 22 })] }),
        new Paragraph({ numbering: { reference: "numbered-deploy", level: 0 }, spacing: { after: 300 }, children: [new TextRun({ text: "Accéder au menu public et à l'interface d'administration", font: "Times New Roman", size: 22 })] }),

        // Conclusion
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("9. Conclusion")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Restaurant OS représente une solution SaaS robuste et bien conçue pour la gestion de restaurants africains. L'architecture technique moderne avec Next.js 16, TypeScript et Prisma offre une base solide pour l'évolution du produit. L'intégration native du Mobile Money africain (Orange Money, MTN MoMo) et la configuration multi-devises démontrent une attention particulière aux besoins spécifiques du marché cible.", font: "Times New Roman", size: 22 })]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "La configuration personnalisée pour KFM DELICE en Guinée illustre parfaitement la flexibilité de la plateforme. Avec 29 articles de menu, 8 zones de livraison à Conakry, et le support du Franc Guinéen, le restaurant est prêt à opérationnaliser la solution. Les identifiants de connexion (kfm.delice@guinee.com / KfmDelice2024!) permettent un accès immédiat à l'interface d'administration.", font: "Times New Roman", size: 22 })]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Pour une mise en production optimale, il est recommandé de renforcer la couverture de tests, d'implémenter un monitoring proactif avec alertes, et de former le personnel du restaurant à l'utilisation de l'interface. Le potentiel d'évolution est significatif avec l'ajout de fonctionnalités comme la gestion des stocks, les analyses prédictives, ou l'intégration de nouveaux opérateurs Mobile Money.", font: "Times New Roman", size: 22 })]
        })
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/z/my-project/download/Analyse_Restaurant_OS_KFM_DELICE.docx", buffer);
  console.log("Document créé avec succès: Analyse_Restaurant_OS_KFM_DELICE.docx");
});
