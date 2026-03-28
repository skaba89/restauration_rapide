const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        Header, Footer, AlignmentType, PageOrientation, LevelFormat, 
        TableOfContents, HeadingLevel, BorderStyle, WidthType, 
        ShadingType, VerticalAlign, PageNumber, PageBreak } = require('docx');
const fs = require('fs');

// Color Palette - "Midnight Code" for tech/SaaS project
const colors = {
  primary: "020617",      // Midnight Black - Titles
  bodyText: "1E293B",     // Deep Slate Blue - Body
  secondary: "64748B",    // Cool Blue-Gray - Subtitles
  accent: "94A3B8",       // Steady Silver - Accent
  tableBg: "F8FAFC",      // Glacial Blue-White - Table background
  tableBorder: "CBD5E1",  // Light border
  highlight: "3B82F6"     // Blue highlight
};

const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: colors.tableBorder };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Times New Roman", size: 24 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 56, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: colors.bodyText, font: "Times New Roman" },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: colors.secondary, font: "Times New Roman" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } }
    ]
  },
  numbering: {
    config: [
      { reference: "bullet-list", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-list-1", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-list-2", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-list-3", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-list-4", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-list-5", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-list-6", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-list-7", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
    ]
  },
  sections: [
    // ===== COVER PAGE =====
    {
      properties: {
        page: { margin: { top: 0, right: 0, bottom: 0, left: 0 } }
      },
      children: [
        new Paragraph({ spacing: { before: 3000 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 1000, after: 400 },
          children: [new TextRun({ text: "RESTAURANT OS", size: 72, bold: true, color: colors.primary, font: "Times New Roman" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "Plateforme SaaS de Gestion Restauratoire", size: 36, color: colors.secondary, font: "Times New Roman" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "Con\u00e7ue pour l'Afrique", size: 32, italics: true, color: colors.accent, font: "Times New Roman" })]
        }),
        new Paragraph({ spacing: { before: 2000 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500", size: 20, color: colors.accent })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 100 },
          children: [new TextRun({ text: "\u00c9TAT DES LIEUX & PLAN DE COMMERCIALISATION", size: 32, bold: true, color: colors.bodyText, font: "Times New Roman" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "Document Strat\u00e9gique", size: 24, color: colors.secondary, font: "Times New Roman" })]
        }),
        new Paragraph({ spacing: { before: 3000 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Version 1.0 - Mars 2026", size: 22, color: colors.accent, font: "Times New Roman" })]
        }),
        new Paragraph({ children: [new PageBreak()] })
      ]
    },
    // ===== MAIN CONTENT =====
    {
      properties: {
        page: { margin: { top: 1800, right: 1440, bottom: 1440, left: 1440 } }
      },
      headers: {
        default: new Header({ children: [new Paragraph({ 
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "Restaurant OS - Document Strat\u00e9gique", size: 18, color: colors.secondary, font: "Times New Roman" })]
        })] })
      },
      footers: {
        default: new Footer({ children: [new Paragraph({ 
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Page ", size: 20, font: "Times New Roman" }), new TextRun({ children: [PageNumber.CURRENT], size: 20, font: "Times New Roman" }), new TextRun({ text: " / ", size: 20, font: "Times New Roman" }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 20, font: "Times New Roman" })]
        })] })
      },
      children: [
        // ===== TABLE OF CONTENTS =====
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: "Table des Mati\u00e8res", font: "Times New Roman" })]
        }),
        new TableOfContents("Table des Mati\u00e8res", { hyperlink: true, headingStyleRange: "1-3" }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200 },
          children: [new TextRun({ text: "Note : Clic droit sur la table \u2192 \u00ab Mettre \u00e0 jour le champ \u00bb pour actualiser les num\u00e9ros de page.", size: 18, color: "999999", font: "Times New Roman", italics: true })]
        }),
        new Paragraph({ children: [new PageBreak()] }),

        // ===== SECTION 1: EXECUTIVE SUMMARY =====
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "1. R\u00e9sum\u00e9 Ex\u00e9cutif", font: "Times New Roman" })] }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "Restaurant OS est une plateforme SaaS (Software as a Service) innovante con\u00e7ue sp\u00e9cifiquement pour r\u00e9pondre aux besoins uniques du march\u00e9 restauratoire africain. Cette solution tout-en-un permet aux restaurants de g\u00e9rer l'ensemble de leurs op\u00e9rations : prises de commandes, gestion des livraisons par motos, paiements Mobile Money, gestion du personnel, et analyse des donn\u00e9es commerciales. D\u00e9velopp\u00e9e avec une architecture multi-tenant moderne, la plateforme offre une flexibilit\u00e9 exceptionnelle permettant \u00e0 chaque organisation de g\u00e9rer plusieurs marques et restaurants depuis une interface centralis\u00e9e.", font: "Times New Roman" })]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "Le projet repr\u00e9sente un investissement technologique significatif avec plus de 50 mod\u00e8les de donn\u00e9es, 20 endpoints API, et une interface utilisateur moderne d\u00e9velopp\u00e9e avec Next.js 16. La diff\u00e9renciation principale r\u00e9side dans l'int\u00e9gration native des modes de paiement africains (Orange Money, MTN MoMo, Wave, M-Pesa) et l'optimisation pour les livraisons par motos, r\u00e9pondant ainsi aux r\u00e9alit\u00e9s logistiques du continent. Ce document pr\u00e9sente un \u00e9tat des lieux complet du projet ainsi qu'un plan strat\u00e9gique de commercialisation pour conqu\u00e9rir le march\u00e9 africain de la restauration.", font: "Times New Roman" })]
        }),

        // ===== SECTION 2: ÉTAT DES LIEUX =====
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "2. \u00c9tat des Lieux du Projet", font: "Times New Roman" })] }),

        // 2.1 Architecture Technique
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "2.1 Architecture Technique", font: "Times New Roman" })] }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "Le projet Restaurant OS repose sur une architecture moderne et \u00e9volutive, con\u00e7ue pour r\u00e9pondre aux exigences d'une plateforme SaaS multi-tenant. L'architecture adopte le pattern monolithique modulaire avec un microservice d\u00e9di\u00e9 pour les fonctionnalit\u00e9s temps r\u00e9el, permettant une scalabilit\u00e9 horizontale des fonctionnalit\u00e9s critiques comme le suivi des livraisons en temps r\u00e9el et les mises \u00e0 jour du kitchen display system. Cette approche hybride offre l'avantage d'un d\u00e9ploiement simplifi\u00e9 tout en conservant la capacit\u00e9 de scaler ind\u00e9pendamment les composants gourmands en ressources.", font: "Times New Roman" })]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "La couche pr\u00e9sentation utilise Next.js 16 avec l'App Router, b\u00e9n\u00e9ficiant du Server-Side Rendering pour des performances optimales et du SEO am\u00e9lior\u00e9. L'interface est divis\u00e9e en plusieurs modules distincts : le tableau de bord principal (/app), l'interface cuisine (/kitchen), l'application livreurs (/driver), et l'interface personnel (/staff). Cette s\u00e9paration permet d'optimiser chaque exp\u00e9rience utilisateur selon le contexte d'utilisation, que ce soit sur un terminal mobile pour les livreurs ou sur un \u00e9cran d\u00e9di\u00e9 pour la cuisine.", font: "Times New Roman" })]
        }),

        // Stack technique table
        new Paragraph({
          spacing: { before: 300, after: 200 },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Tableau 1 : Stack Technique", bold: true, size: 20, color: colors.secondary, font: "Times New Roman" })]
        }),
        new Table({
          columnWidths: [3000, 3000, 3000],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          alignment: AlignmentType.CENTER,
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Couche", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Technologie", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Version", bold: true, size: 22, font: "Times New Roman" })] })] })
              ]
            }),
            ...([
              ["Framework", "Next.js", "16.1.1"],
              ["Langage", "TypeScript", "5.x"],
              ["Styling", "Tailwind CSS", "4.x"],
              ["UI Components", "shadcn/ui (Radix)", "Latest"],
              ["State Management", "Zustand + TanStack Query", "5.x"],
              ["ORM", "Prisma", "6.11.1"],
              ["Database Dev", "SQLite", "-"],
              ["Database Prod", "PostgreSQL", "15"],
              ["Real-time", "Socket.io", "4.8.3"],
              ["Charts", "Recharts", "2.15.4"],
              ["Auth", "NextAuth.js", "4.24.11"],
              ["Testing", "Vitest + Playwright", "4.x / 1.42"]
            ]).map(([couche, tech, version]) => 
              new TableRow({
                children: [
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: couche, size: 22, font: "Times New Roman" })] })] }),
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: tech, size: 22, font: "Times New Roman" })] })] }),
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: version, size: 22, font: "Times New Roman" })] })] })
                ]
              })
            )
          ]
        }),

        // 2.2 Modèles de données
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "2.2 Mod\u00e8les de Donn\u00e9es", font: "Times New Roman" })] }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "Le sch\u00e9ma de base de donn\u00e9es compte plus de 50 mod\u00e8les Prisma, couvrant l'ensemble des domaines fonctionnels d'un restaurant moderne. Cette richesse fonctionnelle t\u00e9moigne de la maturit\u00e9 du projet et de sa capacit\u00e9 \u00e0 r\u00e9pondre aux besoins complexes de la gestion restauratoire. L'architecture multi-tenant permet \u00e0 chaque organisation de g\u00e9rer hi\u00e9rarchiquement ses entit\u00e9s selon le mod\u00e8le : Organisation \u2192 Marque \u2192 Restaurant. Cette structure supporte les plans d'abonnement progressifs (STARTER, PRO, BUSINESS, ENTERPRISE) avec des fonctionnalit\u00e9s d\u00e9bloqu\u00e9es selon le niveau choisi.", font: "Times New Roman" })]
        }),

        // Domaines fonctionnels table
        new Paragraph({
          spacing: { before: 300, after: 200 },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Tableau 2 : Domaines Fonctionnels et Mod\u00e8les", bold: true, size: 20, color: colors.secondary, font: "Times New Roman" })]
        }),
        new Table({
          columnWidths: [3500, 5500],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          alignment: AlignmentType.CENTER,
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Domaine", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Mod\u00e8les Principaux", bold: true, size: 22, font: "Times New Roman" })] })] })
              ]
            }),
            ...([
              ["Auth & Utilisateurs", "User, Session, RefreshToken, OtpCode, AuditLog"],
              ["Organisation", "Organization, OrganizationSettings, Brand"],
              ["Restaurant", "Restaurant, RestaurantSettings, RestaurantHour"],
              ["Menu", "Menu, MenuCategory, MenuItem, MenuItemVariant, Allergen"],
              ["Commandes", "Order, OrderItem, OrderStatusHistory, Cart"],
              ["Livraison", "DeliveryZone, Delivery, DeliveryTrackingEvent"],
              ["Livreurs", "Driver, DriverSession, DriverLocation, DriverWallet"],
              ["CRM & Fid\u00e9lit\u00e9", "CustomerProfile, LoyaltyTransaction, LoyaltyReward"],
              ["Inventaire", "StockMovement, Supplier, PurchaseOrder"],
              ["Localisation", "Country, City, District, Currency, TaxRule"]
            ]).map(([domaine, modeles]) => 
              new TableRow({
                children: [
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: domaine, size: 22, font: "Times New Roman" })] })] }),
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: modeles, size: 20, font: "Times New Roman" })] })] })
                ]
              })
            )
          ]
        }),

        // 2.3 Fonctionnalités Implémentées
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "2.3 Fonctionnalit\u00e9s Impl\u00e9ment\u00e9es", font: "Times New Roman" })] }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "Le tableau de bord principal offre une vue d'ensemble compl\u00e8te avec des cartes KPI affichant les ventes, commandes, et performances. Les graphiques de ventes interactifs permettent d'analyser les tendances sur diff\u00e9rentes p\u00e9riodes. Le module de gestion des commandes pr\u00e9sente une vue Kanban intuitive permettant de suivre le statut des commandes en temps r\u00e9el, avec possibilit\u00e9 de filtrer par type de commande (sur place, \u00e0 emporter, livraison, drive).", font: "Times New Roman" })]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "Le Kitchen Display System (KDS) constitue une innovation majeure, offrant une interface d\u00e9di\u00e9e aux cuisiniers avec affichage des commandes en temps r\u00e9el, gestion des priorit\u00e9s, et chronom\u00e8tre de pr\u00e9paration. L'application livreurs permet le suivi GPS en temps r\u00e9el, la gestion des tourn\u00e9es, et le calcul automatique des gains avec syst\u00e8me de wallet int\u00e9gr\u00e9. Ces interfaces optimis\u00e9es pour mobile r\u00e9pondent aux contraintes terrain des livreurs moto africains.", font: "Times New Roman" })]
        }),

        // Fonctionnalités table
        new Paragraph({
          spacing: { before: 300, after: 200 },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Tableau 3 : Modules Principaux et \u00c9tat d'Avancement", bold: true, size: 20, color: colors.secondary, font: "Times New Roman" })]
        }),
        new Table({
          columnWidths: [2500, 4500, 2000],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          alignment: AlignmentType.CENTER,
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Module", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Description", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 2000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Statut", bold: true, size: 22, font: "Times New Roman" })] })] })
              ]
            }),
            ...([
              ["Dashboard", "KPI, graphiques ventes, statut commandes", "Complet"],
              ["Commandes", "Vue Kanban, filtrage, gestion statuts", "Complet"],
              ["Menu", "Gestion cat\u00e9gories, items, variants", "Impl\u00e9ment\u00e9"],
              ["Livraisons", "Zones, suivi temps r\u00e9el", "Impl\u00e9ment\u00e9"],
              ["Livreurs", "Gestion, wallet, localisation GPS", "Complet"],
              ["KDS (Cuisine)", "Affichage commandes, priorit\u00e9s", "Complet"],
              ["Analytics", "M\u00e9triques, KPI, pr\u00e9dictions", "Impl\u00e9ment\u00e9"],
              ["Inventaire", "Stock, alertes, r\u00e9approvisionnement", "Impl\u00e9ment\u00e9"],
              ["Employ\u00e9s", "R\u00f4les, shifts, payroll", "Impl\u00e9ment\u00e9"],
              ["Fid\u00e9lit\u00e9", "Programme 5 niveaux, r\u00e9compenses", "Impl\u00e9ment\u00e9"],
              ["Paiements Mobile", "Orange, MTN, Wave, M-Pesa", "Int\u00e9gr\u00e9"],
              ["PWA", "Application hors-ligne, notifications", "Configur\u00e9"]
            ]).map(([module, desc, statut]) => 
              new TableRow({
                children: [
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: module, size: 22, font: "Times New Roman" })] })] }),
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: desc, size: 20, font: "Times New Roman" })] })] }),
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: statut, size: 20, color: statut === "Complet" ? "16A34A" : colors.bodyText, font: "Times New Roman" })] })] })
                ]
              })
            )
          ]
        }),

        // 2.4 Intégrations Mobile Money
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "2.4 Int\u00e9grations Mobile Money", font: "Times New Roman" })] }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "L'un des atouts majeurs de Restaurant OS r\u00e9side dans son int\u00e9gration native des principaux services de Mobile Money africains. Contrairement aux solutions occidentales qui n\u00e9gligent ces modes de paiement pourtant pr\u00e9dominants en Afrique, Restaurant OS propose des webhooks d\u00e9di\u00e9s pour Orange Money, MTN Mobile Money, Wave et M-Pesa. Cette couverture couvre les principaux march\u00e9s ouest-africains et est-africains, repr\u00e9sentant un potentiel de plusieurs centaines de millions d'utilisateurs.", font: "Times New Roman" })]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "L'architecture des webhooks assure une s\u00e9curit\u00e9 optimale avec v\u00e9rification des signatures cryptographiques, gestion des idempotences pour \u00e9viter les doubles paiements, et logging d\u00e9taill\u00e9 pour l'audit et le d\u00e9bogage. Le syst\u00e8me supporte \u00e9galement les paiements en esp\u00e8ces, mode de paiement encore tr\u00e8s r\u00e9pandu sur le continent, permettant aux restaurants de servir l'ensemble de leur client\u00e8le quelle que soit sa pr\u00e9f\u00e9rence de paiement.", font: "Times New Roman" })]
        }),

        // 2.5 Infrastructure DevOps
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "2.5 Infrastructure DevOps", font: "Times New Roman" })] }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "Le projet dispose d'une infrastructure DevOps compl\u00e8te et professionnelle, facilitant le d\u00e9ploiement et la maintenance. La conteneurisation Docker est enti\u00e8rement configur\u00e9e avec des Dockerfiles d\u00e9di\u00e9s pour l'application principale, le service temps r\u00e9el, et les environnements de production. Le fichier docker-compose.yml orchestre l'ensemble des services : application Next.js, base de donn\u00e9es PostgreSQL, cache Redis, service Socket.io, et reverse proxy Nginx.", font: "Times New Roman" })]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "Le monitoring production est assur\u00e9 par Sentry avec des configurations d\u00e9di\u00e9es pour le client, le serveur et les edge functions. Cette instrumentation permet le tracking automatique des erreurs, le monitoring des performances avec les transactions distributed tracing, et les alertes proactives. Les tests automatis\u00e9s combinent Vitest pour les tests unitaires et Playwright pour les tests end-to-end, assurant une qualit\u00e9 de code constante.", font: "Times New Roman" })]
        }),

        // ===== SECTION 3: ANALYSE SWOT =====
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "3. Analyse SWOT", font: "Times New Roman" })] }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "L'analyse SWOT permet d'\u00e9valuer la position concurrentielle de Restaurant OS sur le march\u00e9 africain de la restauration. Cette \u00e9tude identifie les forces \u00e0 valoriser, les faiblesses \u00e0 corriger, les opportunit\u00e9s \u00e0 saisir et les menaces \u00e0 anticiper pour \u00e9laborer une strat\u00e9gie de commercialisation efficace et r\u00e9aliste.", font: "Times New Roman" })]
        }),

        // SWOT Table
        new Paragraph({
          spacing: { before: 300, after: 200 },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Tableau 4 : Analyse SWOT", bold: true, size: 20, color: colors.secondary, font: "Times New Roman" })]
        }),
        new Table({
          columnWidths: [4500, 4500],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          alignment: AlignmentType.CENTER,
          rows: [
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: "DCFCE7", type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "FORCES", bold: true, size: 24, color: "166534", font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: "FEE2E2", type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "FAIBLESSES", bold: true, size: 24, color: "991B1B", font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.TOP, width: { size: 4500, type: WidthType.DXA }, children: [
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "\u2022 Mobile Money natif (4 op\u00e9rateurs)", size: 20, font: "Times New Roman" })] }),
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "\u2022 Architecture multi-tenant moderne", size: 20, font: "Times New Roman" })] }),
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "\u2022 KDS et suivi livraison temps r\u00e9el", size: 20, font: "Times New Roman" })] }),
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "\u2022 50+ mod\u00e8les fonctionnels complets", size: 20, font: "Times New Roman" })] }),
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "\u2022 PWA offline-first pour zones rurales", size: 20, font: "Times New Roman" })] }),
                  new Paragraph({ children: [new TextRun({ text: "\u2022 Stack technique moderne (Next.js 16)", size: 20, font: "Times New Roman" })] })
                ] }),
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.TOP, width: { size: 4500, type: WidthType.DXA }, children: [
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "\u2022 Pas de reconnaissance de marque", size: 20, font: "Times New Roman" })] }),
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "\u2022 Documentation utilisateur incompl\u00e8te", size: 20, font: "Times New Roman" })] }),
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "\u2022 Absence d'application mobile native", size: 20, font: "Times New Roman" })] }),
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "\u2022 Tests E2E \u00e0 compl\u00e9ter", size: 20, font: "Times New Roman" })] }),
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "\u2022 Support client non structur\u00e9", size: 20, font: "Times New Roman" })] }),
                  new Paragraph({ children: [new TextRun({ text: "\u2022 Pas de r\u00e9f\u00e9rences clients", size: 20, font: "Times New Roman" })] })
                ] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: "DBEAFE", type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "OPPORTUNIT\u00c9S", bold: true, size: 24, color: "1E40AF", font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: "FEF3C7", type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "MENACES", bold: true, size: 24, color: "92400E", font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.TOP, width: { size: 4500, type: WidthType.DXA }, children: [
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "\u2022 March\u00e9 africain en croissance 15%/an", size: 20, font: "Times New Roman" })] }),
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "\u2022 Digitalisation post-COVID acc\u00e9l\u00e9r\u00e9e", size: 20, font: "Times New Roman" })] }),
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "\u2022 Concurrence internationale inadapt\u00e9e", size: 20, font: "Times New Roman" })] }),
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "\u2022 Partenariats t\u00e9l\u00e9coms possibles", size: 20, font: "Times New Roman" })] }),
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "\u2022 P\u00e9nurie de solutions localis\u00e9es", size: 20, font: "Times New Roman" })] }),
                  new Paragraph({ children: [new TextRun({ text: "\u2022 \u00c9mergence classes moyennes urbaines", size: 20, font: "Times New Roman" })] })
                ] }),
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.TOP, width: { size: 4500, type: WidthType.DXA }, children: [
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "\u2022 Arriv\u00e9e d'acteurs internationaux", size: 20, font: "Times New Roman" })] }),
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "\u2022 Solutions gratuites ou freemium", size: 20, font: "Times New Roman" })] }),
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "\u2022 Instabilit\u00e9 \u00e9conomique locale", size: 20, font: "Times New Roman" })] }),
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "\u2022 Infrastructures internet limit\u00e9es", size: 20, font: "Times New Roman" })] }),
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "\u2022 R\u00e9ticence au changement digital", size: 20, font: "Times New Roman" })] }),
                  new Paragraph({ children: [new TextRun({ text: "\u2022 R\u00e9glementations changeantes", size: 20, font: "Times New Roman" })] })
                ] })
              ]
            })
          ]
        }),

        // ===== SECTION 4: PLAN DE COMMERCIALISATION =====
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "4. Plan de Commercialisation", font: "Times New Roman" })] }),

        // 4.1 Stratégie de Pricing
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "4.1 Strat\u00e9gie de Pricing", font: "Times New Roman" })] }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "La strat\u00e9gie tarifaire adopte une approche de pricing value-based adapt\u00e9e au pouvoir d'achat local. Les prix sont calcul\u00e9s en USD pour la stabilit\u00e9 mais peuvent \u00eatre convertis en devises locales au taux du jour. Cette approche garantit une coh\u00e9rence tarifaire r\u00e9gionale tout en restant accessible aux restaurateurs africains. Le mod\u00e8le freemium permet aux restaurants de tester la plateforme sans engagement financier initial, facilitant l'adoption par des acteurs souvent r\u00e9ticents aux investissements technologiques.", font: "Times New Roman" })]
        }),

        // Pricing table
        new Paragraph({
          spacing: { before: 300, after: 200 },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Tableau 5 : Grille Tarifaire", bold: true, size: 20, color: colors.secondary, font: "Times New Roman" })]
        }),
        new Table({
          columnWidths: [1800, 1800, 1800, 1800, 1800],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          alignment: AlignmentType.CENTER,
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Plan", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Prix/mois", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Restaurants", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Utilisateurs", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Fonctions", bold: true, size: 22, font: "Times New Roman" })] })] })
              ]
            }),
            ...([
              ["FREE", "$0", "1", "2", "Basiques"],
              ["STARTER", "$29", "1", "5", "Standard"],
              ["PRO", "$79", "3", "15", "Avanc\u00e9es"],
              ["BUSINESS", "$199", "10", "50", "Compl\u00e8tes"],
              ["ENTERPRISE", "Sur devis", "Illimit\u00e9", "Illimit\u00e9", "Toutes + Custom"]
            ]).map(([plan, prix, restos, users, foncs]) => 
              new TableRow({
                children: [
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: plan, size: 20, bold: plan === "FREE", font: "Times New Roman" })] })] }),
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: prix, size: 20, font: "Times New Roman" })] })] }),
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: restos, size: 20, font: "Times New Roman" })] })] }),
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: users, size: 20, font: "Times New Roman" })] })] }),
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: foncs, size: 20, font: "Times New Roman" })] })] })
                ]
              })
            )
          ]
        }),
        new Paragraph({
          spacing: { before: 150, after: 200, line: 312 },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Note : Les prix sont indicatifs et ajustables selon les march\u00e9s locaux", size: 18, italics: true, color: colors.secondary, font: "Times New Roman" })]
        }),

        // 4.2 Segmentation Cible
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "4.2 Segmentation Cible", font: "Times New Roman" })] }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "La strat\u00e9gie de segmentation identifie trois cibles principales correspondant \u00e0 des profils d'utilisateurs distincts avec des besoins et des capacit\u00e9s financi\u00e8res diff\u00e9rents. Cette approche permet d'adapter le discours commercial et les fonctionnalit\u00e9s propos\u00e9es \u00e0 chaque segment, maximisant ainsi les taux de conversion et la satisfaction client.", font: "Times New Roman" })]
        }),
        new Paragraph({
          spacing: { after: 100, line: 312 },
          children: [new TextRun({ text: "Segment 1 - Restaurants Ind\u00e9pendants : ", bold: true, font: "Times New Roman" }), new TextRun({ text: "Petits restaurants familiaux, snacks et street food repr\u00e9sentent la majorit\u00e9 du march\u00e9 africain. Ces acteurs recherchent une solution simple, abordable et rapide \u00e0 d\u00e9ployer. Le plan FREE puis STARTER constitue le parcours id\u00e9al, avec un discours ax\u00e9 sur la simplification des op\u00e9rations quotidiennes et l'augmentation du chiffre d'affaires.", font: "Times New Roman" })]
        }),
        new Paragraph({
          spacing: { after: 100, line: 312 },
          children: [new TextRun({ text: "Segment 2 - Cha\u00eenes et Franchises : ", bold: true, font: "Times New Roman" }), new TextRun({ text: "Les cha\u00eenes de fast-food, restaurants de quartier en expansion et franchises internationales repr\u00e9sentent des clients \u00e0 forte valeur. Ces structures n\u00e9cessitent des fonctionnalit\u00e9s avanc\u00e9es : gestion multi-sites, reporting consolid\u00e9, int\u00e9gration comptable. Les plans PRO et BUSINESS r\u00e9pondent \u00e0 leurs besoins avec un accompagnement personnalis\u00e9.", font: "Times New Roman" })]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "Segment 3 - Grands Groupes : ", bold: true, font: "Times New Roman" }), new TextRun({ text: "Les groupes h\u00f4teliers, grandes cha\u00eenes internationales et entreprises de restauration collective n\u00e9cessitent des solutions sur mesure. Le plan ENTERPRISE offre un accompagnement d\u00e9di\u00e9, des d\u00e9veloppements personnalis\u00e9s, un SLA garanti et une int\u00e9gration avec leurs syst\u00e8mes existants (ERP, CRM). Ces contrats repr\u00e9sentent des revenus significatifs et une validation march\u00e9 importante.", font: "Times New Roman" })]
        }),

        // 4.3 Canaux de Distribution
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "4.3 Canaux de Distribution", font: "Times New Roman" })] }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "La strat\u00e9gie de distribution combine canaux digitaux et physiques pour maximiser la couverture du march\u00e9 africain. La diversification des canaux permet de toucher diff\u00e9rents profils de d\u00e9cideurs et de s'adapter aux pratiques commerciales locales o\u00f9 le relationnel reste pr\u00e9pond\u00e9rant.", font: "Times New Roman" })]
        }),

        // Canaux list
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "Canaux Digitaux", font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "numbered-list-1", level: 0 }, spacing: { after: 80, line: 312 }, children: [new TextRun({ text: "Site web optimis\u00e9 SEO avec landing pages par pays et d\u00e9mo interactive permettant aux prospects de tester l'interface avant engagement.", font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "numbered-list-1", level: 0 }, spacing: { after: 80, line: 312 }, children: [new TextRun({ text: "Marketing de contenu avec blog technique, cas clients, et guides pratiques sur la gestion restauratrice africaine pour \u00e9tablir l'autorit\u00e9.", font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "numbered-list-1", level: 0 }, spacing: { after: 80, line: 312 }, children: [new TextRun({ text: "Publicit\u00e9 digitale cibl\u00e9e sur Google Ads et r\u00e9seaux sociaux (Facebook, LinkedIn) avec g\u00e9olocalisation sur les zones urbaines africaines.", font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "numbered-list-1", level: 0 }, spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Marketplaces B2B africaines comme Jiji, Jumia Business, et les annuaires professionnels locaux pour une visibilit\u00e9 accrue.", font: "Times New Roman" })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: "Canaux Physiques", font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "numbered-list-2", level: 0 }, spacing: { after: 80, line: 312 }, children: [new TextRun({ text: "Partenariats avec les op\u00e9rateurs t\u00e9l\u00e9coms (Orange, MTN) pour un co-marketing autour du Mobile Money et de la digitalisation des PME.", font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "numbered-list-2", level: 0 }, spacing: { after: 80, line: 312 }, children: [new TextRun({ text: "R\u00e9seau de revendeurs locaux dans chaque pays cible, offrant formation, installation et support de premi\u00e8re ligne aux clients.", font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "numbered-list-2", level: 0 }, spacing: { after: 80, line: 312 }, children: [new TextRun({ text: "Pr\u00e9sence aux salons professionnels : SIAL Paris, Food Africa Cairo, AFIA Abidjan, et autres \u00e9v\u00e9nements sectoriels majeurs.", font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "numbered-list-2", level: 0 }, spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Programme de parrainage avec commission pour les clients existants qui recommandent la plateforme \u00e0 d'autres restaurateurs.", font: "Times New Roman" })] }),

        // 4.4 Roadmap de Lancement
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "4.4 Roadmap de Lancement", font: "Times New Roman" })] }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "La strat\u00e9gie de lancement suit une approche progressive par march\u00e9 pilote avant expansion r\u00e9gionale. Cette m\u00e9thodologie permet de valider le product-market fit, d'affiner l'offre et de construire des r\u00e9f\u00e9rences clients solides avant d'investir massivement dans l'acquisition.", font: "Times New Roman" })]
        }),

        // Roadmap table
        new Paragraph({
          spacing: { before: 300, after: 200 },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Tableau 6 : Roadmap de Lancement", bold: true, size: 20, color: colors.secondary, font: "Times New Roman" })]
        }),
        new Table({
          columnWidths: [2000, 3000, 4000],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          alignment: AlignmentType.CENTER,
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 2000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Phase", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "P\u00e9riode", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Objectifs", bold: true, size: 22, font: "Times New Roman" })] })] })
              ]
            }),
            ...([
              ["Phase 1", "Avril - Juin 2026", "Lancement C\u00f4te d'Ivoire, 50 clients pilotes"],
              ["Phase 2", "Juillet - Sept 2026", "Expansion S\u00e9n\u00e9gal, Cameroun, 200 clients"],
              ["Phase 3", "Oct - D\u00e9c 2026", "Ghana, Kenya, Nigeria, 500 clients"],
              ["Phase 4", "Jan - Mars 2027", "Application mobile native, 1000 clients"],
              ["Phase 5", "Avril - D\u00e9c 2027", "Expansion panafricaine, 5000+ clients"]
            ]).map(([phase, periode, objectifs]) => 
              new TableRow({
                children: [
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: phase, size: 20, font: "Times New Roman" })] })] }),
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: periode, size: 20, font: "Times New Roman" })] })] }),
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: objectifs, size: 20, font: "Times New Roman" })] })] })
                ]
              })
            )
          ]
        }),

        // 4.5 Budget Marketing
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "4.5 Budget Marketing Pr\u00e9visionnel", font: "Times New Roman" })] }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "Le budget marketing est structur\u00e9 pour optimiser le retour sur investissement avec une priorit\u00e9 donn\u00e9e aux canaux les plus efficaces pour le march\u00e9 africain. L'allocation \u00e9volue au fil des phases avec une augmentation proportionnelle \u00e0 l'expansion g\u00e9ographique et l'acquisition de clients.", font: "Times New Roman" })]
        }),

        // Budget table
        new Paragraph({
          spacing: { before: 300, after: 200 },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Tableau 7 : Budget Marketing Ann\u00e9e 1", bold: true, size: 20, color: colors.secondary, font: "Times New Roman" })]
        }),
        new Table({
          columnWidths: [4500, 2250, 2250],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          alignment: AlignmentType.CENTER,
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Poste", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 2250, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Montant ($)", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 2250, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "% Budget", bold: true, size: 22, font: "Times New Roman" })] })] })
              ]
            }),
            ...([
              ["Publicit\u00e9 digitale (Ads, Social)", "25,000", "33%"],
              ["Partenariats t\u00e9l\u00e9coms", "15,000", "20%"],
              ["Salons et \u00e9v\u00e9nements", "12,000", "16%"],
              ["Marketing de contenu", "8,000", "11%"],
              ["R\u00e9seau de revendeurs", "10,000", "13%"],
              ["Divers et impr\u00e9vus", "5,000", "7%"]
            ]).map(([poste, montant, pourcent]) => 
              new TableRow({
                children: [
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: poste, size: 22, font: "Times New Roman" })] })] }),
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2250, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: montant, size: 22, font: "Times New Roman" })] })] }),
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2250, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: pourcent, size: 22, font: "Times New Roman" })] })] })
                ]
              })
            ),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "TOTAL", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 2250, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "75,000", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 2250, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "100%", bold: true, size: 22, font: "Times New Roman" })] })] })
              ]
            })
          ]
        }),

        // 4.6 Indicateurs de Performance
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "4.6 Indicateurs de Performance (KPIs)", font: "Times New Roman" })] }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "Le suivi des performances repose sur un tableau de bord d'indicateurs cl\u00e9s couvrant l'acquisition, la r\u00e9tention et la satisfaction client. Ces m\u00e9triques permettent d'ajuster la strat\u00e9gie en temps r\u00e9el et de mesurer le succ\u00e8s de la commercialisation.", font: "Times New Roman" })]
        }),

        // KPIs list
        new Paragraph({ numbering: { reference: "numbered-list-3", level: 0 }, spacing: { after: 80, line: 312 }, children: [new TextRun({ text: "Co\u00fbt d'Acquisition Client (CAC) : objectif < $50 par client acquis, avec optimisation continue des canaux.", font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "numbered-list-3", level: 0 }, spacing: { after: 80, line: 312 }, children: [new TextRun({ text: "Valeur Vie Client (LTV) : objectif > $500 sur 24 mois, assurant un ratio LTV/CAC sup\u00e9rieur \u00e0 10.", font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "numbered-list-3", level: 0 }, spacing: { after: 80, line: 312 }, children: [new TextRun({ text: "Taux de Churn mensuel : objectif < 3%, indicateur cl\u00e9 de la satisfaction et de la valeur per\u00e7ue.", font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "numbered-list-3", level: 0 }, spacing: { after: 80, line: 312 }, children: [new TextRun({ text: "Net Promoter Score (NPS) : objectif > 40, mesurant la propension \u00e0 recommander la solution.", font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "numbered-list-3", level: 0 }, spacing: { after: 80, line: 312 }, children: [new TextRun({ text: "Taux de conversion Free \u2192 Payant : objectif > 15% apr\u00e8s 30 jours d'essai.", font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "numbered-list-3", level: 0 }, spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Monthly Recurring Revenue (MRR) : objectif $50,000 \u00e0 la fin de l'ann\u00e9e 1.", font: "Times New Roman" })] }),

        // ===== SECTION 5: ACTIONS PRIORITAIRES =====
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "5. Actions Prioritaires Imm\u00e9diates", font: "Times New Roman" })] }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "Pour pr\u00e9parer le lancement commercial, plusieurs actions techniques et marketing doivent \u00eatre r\u00e9alis\u00e9es en priorit\u00e9. Ces actions sont class\u00e9es par ordre d'importance et d'impact sur la capacit\u00e9 \u00e0 commercialiser le produit.", font: "Times New Roman" })]
        }),

        // Actions table
        new Paragraph({
          spacing: { before: 300, after: 200 },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Tableau 8 : Actions Prioritaires", bold: true, size: 20, color: colors.secondary, font: "Times New Roman" })]
        }),
        new Table({
          columnWidths: [1200, 4500, 1500, 1800],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          alignment: AlignmentType.CENTER,
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Priorit\u00e9", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Action", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "D\u00e9lai", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Impact", bold: true, size: 22, font: "Times New Roman" })] })] })
              ]
            }),
            ...([
              ["\ud83d\udd34 Haute", "Finaliser tests E2E Playwright", "2 semaines", "Critique"],
              ["\ud83d\udd34 Haute", "Documentation API Swagger UI", "1 semaine", "Critique"],
              ["\ud83d\udd34 Haute", "Cr\u00e9er logo et charte graphique", "2 semaines", "Important"],
              ["\ud83d\udd34 Haute", "Site vitrine avec d\u00e9mo interactive", "3 semaines", "Critique"],
              ["\ud83d\udfe1 Moyenne", "Configurer monitoring production", "1 semaine", "Important"],
              ["\ud83d\udfe1 Moyenne", "Setup CI/CD d\u00e9ploiement auto", "2 semaines", "Important"],
              ["\ud83d\udfe1 Moyenne", "Former \u00e9quipe support client", "2 semaines", "Important"],
              ["\ud83d\udfe2 Basse", "D\u00e9velopper app mobile native", "3 mois", "Strat\u00e9gique"]
            ]).map(([prio, action, delai, impact]) => 
              new TableRow({
                children: [
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: prio, size: 20, font: "Times New Roman" })] })] }),
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: action, size: 20, font: "Times New Roman" })] })] }),
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: delai, size: 20, font: "Times New Roman" })] })] }),
                  new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 1800, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: impact, size: 20, font: "Times New Roman" })] })] })
                ]
              })
            )
          ]
        }),

        // ===== SECTION 6: CONCLUSION =====
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "6. Synth\u00e8se et Recommandations", font: "Times New Roman" })] }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "Restaurant OS repr\u00e9sente une opportunit\u00e9 significative sur le march\u00e9 africain de la restauration en pleine digitalisation. Le projet dispose d'atouts majeurs : une architecture technique moderne et \u00e9volutive, une couverture fonctionnelle compl\u00e8te avec plus de 50 mod\u00e8les de donn\u00e9es, et surtout une adaptation native aux sp\u00e9cificit\u00e9s africaines (Mobile Money, livraison moto, offline-first). Ces diff\u00e9renciateurs constituent un avantage concurrentiel d\u00e9cisif face aux solutions internationales souvent inadapt\u00e9es.", font: "Times New Roman" })]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "Le plan de commercialisation propose une approche pragmatique avec un lancement progressif par march\u00e9 pilote, une strat\u00e9gie tarifaire adapt\u00e9e au pouvoir d'achat local, et une combinaison de canaux digitaux et physiques. Les premi\u00e8res actions \u00e0 mener concernent la finalisation des tests automatis\u00e9s, la cr\u00e9ation de la documentation et l'\u00e9tablissement de l'identit\u00e9 visuelle. Le d\u00e9lai estim\u00e9 avant le lancement commercial est de 6 \u00e0 8 semaines.", font: "Times New Roman" })]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "Les facteurs cl\u00e9s de succ\u00e8s identifi\u00e9s sont : la qualit\u00e9 du support client, la capacit\u00e9 \u00e0 obtenir des r\u00e9f\u00e9rences clients rapidement, et le d\u00e9veloppement de partenariats strat\u00e9giques avec les op\u00e9rateurs t\u00e9l\u00e9coms. L'investissement dans une \u00e9quipe commerciale locale dans chaque pays cible sera \u00e9galement d\u00e9terminant pour conqu\u00e9rir le march\u00e9 africain de la restauration num\u00e9rique.", font: "Times New Roman" })]
        })
      ]
    }
  ]
});

// Generate document
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/z/my-project/download/RestaurantOS_Etat_Lieux_Commercialisation.docx", buffer);
  console.log("Document generated successfully!");
});
