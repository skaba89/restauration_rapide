const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        AlignmentType, LevelFormat, BorderStyle, WidthType, ShadingType, 
        VerticalAlign, HeadingLevel, ExternalHyperlink, Header, Footer, PageNumber } = require('docx');
const fs = require('fs');

// Color scheme - Midnight Code (Technology/AI)
const colors = {
  primary: "#020617",      // Midnight Black
  body: "#1E293B",         // Deep Slate Blue
  secondary: "#64748B",    // Cool Blue-Gray
  accent: "#94A3B8",       // Steady Silver
  tableBg: "#F8FAFC",      // Glacial Blue-White
  tableBorder: "#CBD5E1"
};

const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: colors.tableBorder };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 56, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { before: 0, after: 200 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: colors.body, font: "Times New Roman" },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullet-list",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-steps",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-config",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
    ]
  },
  sections: [{
    properties: {
      page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    headers: {
      default: new Header({ children: [new Paragraph({ 
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "KFM DELICE - Guide de Déploiement", color: colors.secondary, size: 18 })]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ 
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Page ", color: colors.secondary, size: 18 }), 
          new TextRun({ children: [PageNumber.CURRENT], color: colors.secondary, size: 18 }), 
          new TextRun({ text: " / ", color: colors.secondary, size: 18 }), 
          new TextRun({ children: [PageNumber.TOTAL_PAGES], color: colors.secondary, size: 18 })
        ]
      })] })
    },
    children: [
      // Title
      new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("Restaurant OS - KFM DELICE")] }),
      new Paragraph({ 
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: "Guide de Déploiement et d'Utilisation", size: 28, color: colors.secondary })]
      }),
      
      // Section 1: Informations de déploiement
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Informations de Déploiement")] }),
      
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Le projet Restaurant OS a été déployé avec succès pour le restaurant KFM DELICE en Guinée. Cette plateforme SaaS multi-tenant offre une solution complète pour la gestion de restaurant avec support des paiements Mobile Money locaux (Orange Money et MTN MoMo). L'architecture repose sur Next.js 16 avec TypeScript, une base de données PostgreSQL hébergée sur NEON, et des services temps réel via Pusher pour la gestion des commandes en direct.", size: 22, color: colors.body })
      ]}),
      
      // URLs Table
      new Table({
        columnWidths: [3500, 5860],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                borders: cellBorders,
                shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Service", bold: true, size: 22 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "URL / Valeur", bold: true, size: 22 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Application Render", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [
                new ExternalHyperlink({ children: [new TextRun({ text: "https://restauration-rapide.onrender.com", style: "Hyperlink", size: 22 })], link: "https://restauration-rapide.onrender.com" })
              ] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Dépôt GitHub", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [
                new ExternalHyperlink({ children: [new TextRun({ text: "https://github.com/skaba89/restauration_rapide", style: "Hyperlink", size: 22 })], link: "https://github.com/skaba89/restauration_rapide" })
              ] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Menu Public KFM DELICE", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [
                new ExternalHyperlink({ children: [new TextRun({ text: "/menu/kfm-delice", style: "Hyperlink", size: 22 })], link: "https://restauration-rapide.onrender.com/menu/kfm-delice" })
              ] })] })
            ]
          })
        ]
      }),
      new Paragraph({ spacing: { before: 100, after: 300 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tableau 1 : URLs principales du déploiement", size: 18, color: colors.secondary, italics: true })] }),
      
      // Section 2: Identifiants de connexion
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Identifiants de Connexion Administrateur")] }),
      
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Le compte administrateur a été créé pour permettre la gestion complète du restaurant KFM DELICE. Ces identifiants permettent d'accéder au tableau de bord administrateur où vous pouvez gérer les menus, les commandes, les clients, et consulter les analytiques de votre restaurant. Il est fortement recommandé de changer le mot de passe après la première connexion pour des raisons de sécurité.", size: 22, color: colors.body })
      ]}),
      
      // Credentials Table
      new Table({
        columnWidths: [3500, 5860],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                borders: cellBorders,
                shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Champ", bold: true, size: 22 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Valeur", bold: true, size: 22 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Email", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "kfm.delice@guinee.com", size: 22, bold: true })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Mot de passe", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "KfmDelice2024!", size: 22, bold: true })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Page de connexion", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "/login", size: 22 })] })] })
            ]
          })
        ]
      }),
      new Paragraph({ spacing: { before: 100, after: 300 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tableau 2 : Identifiants administrateur KFM DELICE", size: 18, color: colors.secondary, italics: true })] }),
      
      // Section 3: Configuration des variables d'environnement
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Configuration des Variables d'Environnement")] }),
      
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Pour que l'application fonctionne correctement sur Render, les variables d'environnement suivantes doivent être configurées dans le tableau de bord Render. Ces variables sont essentielles pour la connexion à la base de données, les services de messagerie temps réel, le stockage d'images, et l'authentification sécurisée.", size: 22, color: colors.body })
      ]}),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.1 Base de données (NEON PostgreSQL)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "DATABASE_URL : Chaîne de connexion PostgreSQL fournie par NEON", size: 22, color: colors.body })] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.2 Services Temps Réel (Pusher)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "PUSHER_APP_ID : Identifiant de l'application Pusher", size: 22, color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "PUSHER_KEY : Clé publique Pusher", size: 22, color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "PUSHER_SECRET : Clé secrète Pusher", size: 22, color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 200 }, children: [new TextRun({ text: "PUSHER_CLUSTER : Cluster géographique (défaut: eu)", size: 22, color: colors.body })] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.3 Stockage d'Images (Cloudinary)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "CLOUDINARY_CLOUD_NAME : Nom du cloud Cloudinary", size: 22, color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "CLOUDINARY_API_KEY : Clé API Cloudinary", size: 22, color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 200 }, children: [new TextRun({ text: "CLOUDINARY_API_SECRET : Secret API Cloudinary", size: 22, color: colors.body })] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.4 Authentification")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "NEXTAUTH_SECRET : Secret pour les sessions (généré automatiquement par Render)", size: 22, color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 200 }, children: [new TextRun({ text: "NEXTAUTH_URL : https://restauration-rapide.onrender.com", size: 22, color: colors.body })] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.5 Configuration Locale")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "DEFAULT_COUNTRY_CODE : GN (Guinée)", size: 22, color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 300 }, children: [new TextRun({ text: "DEFAULT_CURRENCY_CODE : GNF (Franc Guinéen)", size: 22, color: colors.body })] }),
      
      // Section 4: Étapes post-déploiement
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. Étapes Post-Déploiement")] }),
      
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Une fois le déploiement réussi, vous devez exécuter le script d'initialisation pour créer les données du restaurant KFM DELICE dans la base de données de production. Ce script va créer le restaurant, les catégories de menu, les articles du menu, les zones de livraison, et le compte administrateur.", size: 22, color: colors.body })
      ]}),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.1 Initialisation des données")] }),
      new Paragraph({ spacing: { after: 150 }, children: [
        new TextRun({ text: "Exécutez la commande suivante pour initialiser les données KFM DELICE :", size: 22, color: colors.body })
      ]}),
      
      new Table({
        columnWidths: [9360],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                shading: { fill: "#1E293B", type: ShadingType.CLEAR },
                children: [new Paragraph({ spacing: { before: 100, after: 100 }, children: [new TextRun({ text: "curl -X POST https://restauration-rapide.onrender.com/api/setup/kfm-delice", size: 20, color: "#FFFFFF", font: "Consolas" })] })]
              })
            ]
          })
        ]
      }),
      new Paragraph({ spacing: { before: 100, after: 300 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Commande d'initialisation du restaurant", size: 18, color: colors.secondary, italics: true })] }),
      
      // Section 5: Menu configuré
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. Menu Configuré")] }),
      
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Le script de setup crée automatiquement un menu complet avec 29 articles répartis en 7 catégories. Chaque article inclut une description détaillée et un prix en Franc Guinéen (GNF). Ce menu est optimisé pour le marché guinéen avec des plats locaux populaires et des options de restauration rapide.", size: 22, color: colors.body })
      ]}),
      
      // Categories Table
      new Table({
        columnWidths: [4680, 4680],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                borders: cellBorders,
                shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Catégorie", bold: true, size: 22 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Articles", bold: true, size: 22 })] })]
              })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "🍔 Burgers", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "5 articles", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "🍗 Poulet", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "4 articles", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "🍟 Accompagnements", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "5 articles", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "🥤 Boissons", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "6 articles", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "🥗 Salades", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "3 articles", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "🍦 Desserts", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "3 articles", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "🥘 Plats Guinéens", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "3 articles", size: 22 })] })] })
          ]})
        ]
      }),
      new Paragraph({ spacing: { before: 100, after: 300 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tableau 3 : Catégories du menu KFM DELICE", size: 18, color: colors.secondary, italics: true })] }),
      
      // Section 6: Zones de livraison
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. Zones de Livraison Configurées")] }),
      
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Le système inclut 39 zones de livraison préconfigurées pour la Guinée, couvrant Conakry et ses environs. Chaque zone dispose de frais de livraison personnalisables et d'un temps de livraison estimé. Les clients peuvent sélectionner leur zone lors de la commande pour obtenir automatiquement les frais de livraison correspondants.", size: 22, color: colors.body })
      ]}),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.1 Principales zones couvertes")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Conakry Centre : Kaloum, Dixinn, Ratoma, Matam, Matoto", size: 22, color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Banlieue de Conakry : Coyah, Dubréka, Kindia", size: 22, color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 300 }, children: [new TextRun({ text: "Villes secondaires : Kamsar, Boké, Labé, Nzérékoré, Kankan", size: 22, color: colors.body })] }),
      
      // Section 7: Paiements Mobile Money
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. Paiements Mobile Money")] }),
      
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Le système est configuré pour accepter les paiements via les principaux services Mobile Money disponibles en Guinée. Cette intégration permet aux clients de payer directement avec leur téléphone mobile, ce qui est essentiel pour le marché guinéen où les paiements électroniques sont de plus en plus populaires.", size: 22, color: colors.body })
      ]}),
      
      // Mobile Money Table
      new Table({
        columnWidths: [3120, 3120, 3120],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                borders: cellBorders,
                shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Opérateur", bold: true, size: 22 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Service", bold: true, size: 22 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Préfixes", bold: true, size: 22 })] })]
              })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Orange Guinée", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Orange Money", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "622, 624, 625, 626", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "MTN Guinée", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "MTN MoMo", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "667, 668, 669", size: 22 })] })] })
          ]})
        ]
      }),
      new Paragraph({ spacing: { before: 100, after: 300 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tableau 4 : Opérateurs Mobile Money supportés", size: 18, color: colors.secondary, italics: true })] }),
      
      // Section 8: Architecture technique
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("8. Architecture Technique")] }),
      
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Le système Restaurant OS est construit sur une architecture moderne et évolutive, conçue pour supporter la croissance et offrir des performances optimales. L'utilisation de technologies de pointe garantit la fiabilité et la maintenabilité du système.", size: 22, color: colors.body })
      ]}),
      
      // Tech Stack Table
      new Table({
        columnWidths: [3500, 5860],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                borders: cellBorders,
                shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Composant", bold: true, size: 22 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Technologie", bold: true, size: 22 })] })]
              })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Framework", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Next.js 16 + TypeScript", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Styling", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Tailwind CSS 4 + shadcn/ui", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Base de données", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "PostgreSQL (NEON)", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "ORM", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Prisma 6.x", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Temps réel", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Pusher", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Stockage images", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Cloudinary", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Hébergement", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Render (Free Tier)", size: 22 })] })] })
          ]})
        ]
      }),
      new Paragraph({ spacing: { before: 100, after: 300 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tableau 5 : Stack technique du projet", size: 18, color: colors.secondary, italics: true })] }),
      
      // Section 9: Support
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("9. Support et Maintenance")] }),
      
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Pour toute question technique ou problème avec le déploiement, consultez la documentation du projet dans le dépôt GitHub. Le fichier README.md contient des instructions détaillées pour la configuration et le développement. Les problèmes courants et leurs solutions sont documentés dans la section Issues du dépôt.", size: 22, color: colors.body })
      ]}),
      
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Le plan gratuit de Render a certaines limitations : le service se met en veille après 15 minutes d'inactivité et peut prendre jusqu'à 60 secondes pour redémarrer lors de la première requête. Pour une production à haute disponibilité, envisagez une mise à niveau vers un plan payant.", size: 22, color: colors.body })
      ]})
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/z/my-project/download/Guide_Deploiement_KFM_DELICE.docx", buffer);
  console.log("Document créé: /home/z/my-project/download/Guide_Deploiement_KFM_DELICE.docx");
});
