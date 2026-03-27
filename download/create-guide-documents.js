const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer, 
        AlignmentType, PageOrientation, LevelFormat, ExternalHyperlink, TableOfContents, 
        HeadingLevel, BorderStyle, WidthType, PageNumber, ShadingType, VerticalAlign, PageBreak } = require('docx');
const fs = require('fs');

// Color palette - Midnight Code
const colors = {
  primary: "020617",
  body: "1E293B",
  secondary: "64748B",
  accent: "94A3B8",
  tableBg: "F8FAFC",
  highlight: "F97316"
};

const tableBorder = { style: BorderStyle.SINGLE, size: 12, color: colors.accent };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } };

// ========== DOCUMENT 1: GitHub Configuration Guide ==========
const githubGuideDoc = new Document({
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
        run: { size: 28, bold: true, color: colors.body, font: "Times New Roman" },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: colors.secondary, font: "Times New Roman" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } }
    ]
  },
  numbering: {
    config: [
      { reference: "bullet-list",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-list-1",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-list-2",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-list-3",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-list-4",
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
        children: [new TextRun({ text: "Restaurant OS - Guide de Configuration", color: colors.secondary, size: 20 })]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ 
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Page ", color: colors.secondary }), new TextRun({ children: [PageNumber.CURRENT], color: colors.secondary }), new TextRun({ text: " / ", color: colors.secondary }), new TextRun({ children: [PageNumber.TOTAL_PAGES], color: colors.secondary })]
      })] })
    },
    children: [
      // Title
      new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("Guide de Configuration GitHub")] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 },
        children: [new TextRun({ text: "Configuration des Secrets et CI/CD pour Restaurant OS", color: colors.secondary, size: 22 })] }),
      
      // Section 1: Prerequisites
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Prérequis")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Avant de configurer les secrets GitHub, assurez-vous d'avoir accès aux services suivants. Ces prérequis sont essentiels pour le bon fonctionnement du pipeline CI/CD et du monitoring de l'application en production.", color: colors.body })] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.1 Comptes requis")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "GitHub : ", bold: true }), new TextRun("Accès administrateur au repository github.com/skaba89/restauration_rapide")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Sentry : ", bold: true }), new TextRun("Compte sur sentry.io pour le monitoring des erreurs")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Docker Hub : ", bold: true }), new TextRun("Compte pour stocker les images Docker")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Hébergeur VPS/Cloud : ", bold: true }), new TextRun("Serveur de production (DigitalOcean, AWS, ou autre)")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.2 Outils à installer localement")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Git configuré avec vos identifiants")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("OpenSSL pour générer les secrets sécurisés")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Accès SSH à votre serveur de production")] }),
      
      // Section 2: GitHub Secrets
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Configuration des GitHub Secrets")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Les GitHub Secrets sont des variables d'environnement chiffrées stockées au niveau du repository. Ils sont utilisés par les workflows GitHub Actions pour déployer l'application sans exposer les informations sensibles dans le code source.", color: colors.body })] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 Accès aux Secrets")] }),
      new Paragraph({ numbering: { reference: "numbered-list-1", level: 0 }, children: [new TextRun("Accédez à votre repository GitHub : github.com/skaba89/restauration_rapide")] }),
      new Paragraph({ numbering: { reference: "numbered-list-1", level: 0 }, children: [new TextRun("Cliquez sur l'onglet \"Settings\" (Paramètres)")] }),
      new Paragraph({ numbering: { reference: "numbered-list-1", level: 0 }, children: [new TextRun("Dans le menu latéral, sélectionnez \"Secrets and variables\" → \"Actions\"")] }),
      new Paragraph({ numbering: { reference: "numbered-list-1", level: 0 }, children: [new TextRun("Cliquez sur \"New repository secret\" pour ajouter chaque secret")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.2 Liste des Secrets Obligatoires")] }),
      
      // Table of secrets
      new Table({
        columnWidths: [2800, 3200, 3360],
        margins: { top: 100, bottom: 100, left: 150, right: 150 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 2800, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Nom du Secret", bold: true })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 3200, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Description", bold: true })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 3360, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Comment l'obtenir", bold: true })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "NEXTAUTH_SECRET", bold: true, color: colors.highlight })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Clé secrète pour NextAuth.js")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3360, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("openssl rand -base64 32")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "DATABASE_URL", bold: true, color: colors.highlight })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("URL de connexion PostgreSQL")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3360, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("postgresql://user:pass@host:5432/db")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "SENTRY_DSN", bold: true, color: colors.highlight })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Clé DSN pour Sentry")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3360, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Copier depuis sentry.io → Projet → Settings")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "DOCKERHUB_USERNAME", bold: true, color: colors.highlight })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Nom d'utilisateur Docker Hub")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3360, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Votre username Docker Hub")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "DOCKERHUB_TOKEN", bold: true, color: colors.highlight })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Token d'accès Docker Hub")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3360, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Docker Hub → Account Settings → Security")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "SERVER_HOST", bold: true, color: colors.highlight })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Adresse IP ou domaine du serveur")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3360, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Ex: 123.45.67.89 ou restaurant-os.app")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "SERVER_SSH_KEY", bold: true, color: colors.highlight })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Clé SSH privée pour le serveur")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3360, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("cat ~/.ssh/id_rsa (clé privée)")] })] })
          ]})
        ]
      }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 300 },
        children: [new TextRun({ text: "Tableau 1 : Liste des secrets GitHub obligatoires", italics: true, size: 20, color: colors.secondary })] }),
      
      // Section 3: Generating Secrets
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Génération des Secrets")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Cette section détaille comment générer chaque secret de manière sécurisée. Il est crucial de suivre ces instructions précisément pour garantir la sécurité de votre application en production.", color: colors.body })] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.1 Générer NEXTAUTH_SECRET")] }),
      new Paragraph({ spacing: { after: 150 }, children: [new TextRun({ text: "Le secret NextAuth est utilisé pour chiffrer les tokens JWT et les sessions. Il doit être une chaîne aléatoire d'au moins 32 caractères. Exécutez cette commande dans votre terminal :", color: colors.body })] }),
      new Paragraph({ shading: { fill: "1E293B", type: ShadingType.CLEAR }, spacing: { after: 200 },
        children: [new TextRun({ text: "openssl rand -base64 32", font: "Courier New", color: "FFFFFF" })] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.2 Configurer Sentry")] }),
      new Paragraph({ numbering: { reference: "numbered-list-2", level: 0 }, children: [new TextRun("Créez un compte sur sentry.io (gratuit pour les petits projets)")] }),
      new Paragraph({ numbering: { reference: "numbered-list-2", level: 0 }, children: [new TextRun("Créez un nouveau projet \"Restaurant OS\"")] }),
      new Paragraph({ numbering: { reference: "numbered-list-2", level: 0 }, children: [new TextRun("Sélectionnez \"Next.js\" comme plateforme")] }),
      new Paragraph({ numbering: { reference: "numbered-list-2", level: 0 }, children: [new TextRun("Copiez le DSN fourni (format: https://xxx@xxx.ingest.sentry.io/xxx)")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.3 Configurer Docker Hub")] }),
      new Paragraph({ numbering: { reference: "numbered-list-3", level: 0 }, children: [new TextRun("Connectez-vous à hub.docker.com")] }),
      new Paragraph({ numbering: { reference: "numbered-list-3", level: 0 }, children: [new TextRun("Allez dans Account Settings → Security")] }),
      new Paragraph({ numbering: { reference: "numbered-list-3", level: 0 }, children: [new TextRun("Cliquez sur \"New Access Token\"")] }),
      new Paragraph({ numbering: { reference: "numbered-list-3", level: 0 }, children: [new TextRun("Nommez-le \"github-actions\" avec permissions Read/Write")] }),
      new Paragraph({ numbering: { reference: "numbered-list-3", level: 0 }, children: [new TextRun("Copiez le token généré (il ne sera plus affiché ensuite)")] }),
      
      // Section 4: Push to GitHub
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. Pousser le Code vers GitHub")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Une fois les secrets configurés, vous pouvez pousser votre code vers GitHub. Le workflow CI/CD se déclenchera automatiquement pour construire et tester l'application.", color: colors.body })] }),
      
      new Paragraph({ shading: { fill: "1E293B", type: ShadingType.CLEAR }, spacing: { after: 200 },
        children: [new TextRun({ text: "cd /home/z/my-project\ngit add .\ngit commit -m \"Configuration CI/CD complete\"\ngit push -u origin master", font: "Courier New", color: "FFFFFF" })] }),
      
      // Section 5: Deploy Workflow
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. Déploiement en Production")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Le déploiement se fait via GitHub Actions avec le workflow deploy.yml. Ce workflow est déclenché manuellement et supporte les environnements staging et production.", color: colors.body })] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.1 Déclencher un déploiement")] }),
      new Paragraph({ numbering: { reference: "numbered-list-4", level: 0 }, children: [new TextRun("Allez dans l'onglet \"Actions\" de votre repository GitHub")] }),
      new Paragraph({ numbering: { reference: "numbered-list-4", level: 0 }, children: [new TextRun("Sélectionnez le workflow \"Deploy\" dans la liste")] }),
      new Paragraph({ numbering: { reference: "numbered-list-4", level: 0 }, children: [new TextRun("Cliquez sur \"Run workflow\"")] }),
      new Paragraph({ numbering: { reference: "numbered-list-4", level: 0 }, children: [new TextRun("Sélectionnez l'environnement (staging ou production)")] }),
      new Paragraph({ numbering: { reference: "numbered-list-4", level: 0 }, children: [new TextRun("Cliquez sur \"Run workflow\" pour confirmer")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.2 Surveillance du déploiement")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Pendant le déploiement, vous pouvez suivre les logs en temps réel dans l'onglet Actions. En cas d'erreur, le workflow offre une option de rollback automatique vers la version précédente stable.", color: colors.body })] }),
      
      // Section 6: Verification
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. Vérification Post-Déploiement")] }),
      new Paragraph({ spacing: { after: 150 }, children: [new TextRun({ text: "Après un déploiement réussi, vérifiez les éléments suivants pour vous assurer que tout fonctionne correctement :", color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Landing page : ", bold: true }), new TextRun("https://votre-domaine.com affiche la page d'accueil")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "API Docs : ", bold: true }), new TextRun("https://votre-domaine.com/api/docs accessible")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Sentry : ", bold: true }), new TextRun("Aucune erreur critique dans le dashboard")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Base de données : ", bold: true }), new TextRun("Connexion PostgreSQL fonctionnelle")] }),
      
      // Support
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. Support et Dépannage")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "En cas de problème lors de la configuration ou du déploiement, consultez les logs GitHub Actions pour identifier l'erreur. Les problèmes courants incluent des secrets mal configurés, des permissions insuffisantes sur le serveur, ou des problèmes de connectivité réseau. Pour une assistance supplémentaire, contactez l'équipe technique Restaurant OS.", color: colors.body })] })
    ]
  }]
});

// ========== DOCUMENT 2: Commercial Launch Guide ==========
const launchGuideDoc = new Document({
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
        run: { size: 28, bold: true, color: colors.body, font: "Times New Roman" },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: colors.secondary, font: "Times New Roman" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } }
    ]
  },
  numbering: {
    config: [
      { reference: "bullet-list",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "phase-list",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "checklist",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "☐", alignment: AlignmentType.LEFT,
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
        children: [new TextRun({ text: "Restaurant OS - Guide de Lancement Commercial", color: colors.secondary, size: 20 })]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ 
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Page ", color: colors.secondary }), new TextRun({ children: [PageNumber.CURRENT], color: colors.secondary }), new TextRun({ text: " / ", color: colors.secondary }), new TextRun({ children: [PageNumber.TOTAL_PAGES], color: colors.secondary })]
      })] })
    },
    children: [
      // Title
      new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("Guide de Lancement Commercial")] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
        children: [new TextRun({ text: "Restaurant OS - Stratégie Go-to-Market Afrique", color: colors.secondary, size: 22 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 },
        children: [new TextRun({ text: "Version 1.0 - Mars 2026", color: colors.accent, size: 20 })] }),
      
      // Executive Summary
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Résumé Exécutif")] }),
      new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: "Restaurant OS est une plateforme SaaS de gestion de restaurants conçue spécifiquement pour le marché africain. Avec son intégration native des Mobile Money (Orange Money, MTN MoMo, Wave, M-Pesa), son système de livraison moto optimisé et son support offline-first, Restaurant OS répond aux défis uniques du secteur de la restauration en Afrique. Ce guide présente la stratégie de lancement commercial avec un focus initial sur la Côte d'Ivoire, suivie d'une expansion au Sénégal, Cameroun et Kenya.", color: colors.body })] }),
      
      // Phase 1
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Phase 1 : Préparation (Semaines 1-4)")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.1 Checklist Technique")] }),
      new Paragraph({ numbering: { reference: "checklist", level: 0 }, children: [new TextRun("Configurer les secrets GitHub et CI/CD (voir guide séparé)")] }),
      new Paragraph({ numbering: { reference: "checklist", level: 0 }, children: [new TextRun("Déployer en production sur un VPS (DigitalOcean, AWS, ou local)")] }),
      new Paragraph({ numbering: { reference: "checklist", level: 0 }, children: [new TextRun("Configurer le domaine personnalisé (restaurant-os.app)")] }),
      new Paragraph({ numbering: { reference: "checklist", level: 0 }, children: [new TextRun("Activer HTTPS avec certificat SSL (Let's Encrypt)")] }),
      new Paragraph({ numbering: { reference: "checklist", level: 0 }, children: [new TextRun("Vérifier Sentry pour le monitoring des erreurs")] }),
      new Paragraph({ numbering: { reference: "checklist", level: 0 }, children: [new TextRun("Tester les intégrations Mobile Money en sandbox")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.2 Préparation Marketing")] }),
      new Paragraph({ numbering: { reference: "checklist", level: 0 }, children: [new TextRun("Finaliser le logo et la charte graphique")] }),
      new Paragraph({ numbering: { reference: "checklist", level: 0 }, children: [new TextRun("Créer les comptes réseaux sociaux (LinkedIn, Facebook, Twitter/X)")] }),
      new Paragraph({ numbering: { reference: "checklist", level: 0 }, children: [new TextRun("Préparer la brochure commerciale et la présentation PowerPoint")] }),
      new Paragraph({ numbering: { reference: "checklist", level: 0 }, children: [new TextRun("Rédiger le pitch commercial (30 secondes, 3 minutes, 10 minutes)")] }),
      new Paragraph({ numbering: { reference: "checklist", level: 0 }, children: [new TextRun("Créer une vidéo de démonstration (2-3 minutes)")] }),
      
      // Phase 2
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Phase 2 : Lancement Beta (Semaines 5-8)")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 Recrutement Beta-Testeurs")] }),
      new Paragraph({ spacing: { after: 150 }, children: [new TextRun({ text: "L'objectif est de recruter 10 restaurants partenaires pour une phase de test en conditions réelles. Ces restaurants bénéficieront d'un accès gratuit pendant 6 mois en échange de retours réguliers.", color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Contacter les restaurants de son réseau personnel")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Publier sur les groupes Facebook restaurateurs d'Abidjan")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Contacter les associations de restaurateurs")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Participer aux événements food-tech locaux")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.2 Support et Itération")] }),
      new Paragraph({ spacing: { after: 150 }, children: [new TextRun({ text: "Pendant la phase beta, il est essentiel d'offrir un support réactif et de collecter systématiquement les retours utilisateurs pour améliorer le produit.", color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Mettre en place un canal WhatsApp dédié au support")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Organiser des appels hebdomadaires avec les beta-testeurs")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Corriger les bugs critiques en moins de 24h")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Documenter les demandes de fonctionnalités")] }),
      
      // Phase 3
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Phase 3 : Lancement Commercial (Semaines 9-12)")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.1 Stratégie de Tarification")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "La tarification est conçue pour être accessible aux restaurants africains tout en garantissant la viabilité économique de la plateforme. Les prix sont en USD mais l'affichage local se fait en FCFA pour plus de clarté.", color: colors.body })] }),
      
      // Pricing table
      new Table({
        columnWidths: [2340, 2340, 2340, 2340],
        margins: { top: 100, bottom: 100, left: 150, right: 150 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Plan", bold: true })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Prix/mois", bold: true })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Restaurants", bold: true })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Cible", bold: true })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Free", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$0")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("1")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("Découverte")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Starter", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$29 (~18,000 FCFA)")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("1")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("Petits restaurants")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: { fill: "FFF7ED", type: ShadingType.CLEAR }, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Pro", bold: true, color: colors.highlight })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: "FFF7ED", type: ShadingType.CLEAR }, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$79 (~49,000 FCFA)", bold: true, color: colors.highlight })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: "FFF7ED", type: ShadingType.CLEAR }, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("3")] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: "FFF7ED", type: ShadingType.CLEAR }, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("Croissance")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Business", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$199 (~123,000 FCFA)")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("10")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("Chaînes")] })] })
          ]})
        ]
      }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 300 },
        children: [new TextRun({ text: "Tableau 1 : Grille tarifaire Restaurant OS", italics: true, size: 20, color: colors.secondary })] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.2 Canaux d'Acquisition")] }),
      new Paragraph({ spacing: { after: 150 }, children: [new TextRun({ text: "L'acquisition client sera multi-canal avec un focus sur les canaux les plus efficaces pour le marché africain. L'approche recommandée combine marketing digital et terrain pour maximiser la conversion.", color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Marketing Digital : ", bold: true }), new TextRun("Facebook Ads ciblant les restaurateurs, Google Ads sur mots-clés locaux, SEO sur \"logiciel restaurant Abidjan\"")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Partenariats : ", bold: true }), new TextRun("Accords avec les fournisseurs d'équipements restaurant, partenaires Mobile Money")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Événements : ", bold: true }), new TextRun("Salons food-tech, conférences entrepreneurs, meetups tech")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Référence : ", bold: true }), new TextRun("Programme parrainage avec 1 mois gratuit pour le parrain et le filleul")] }),
      
      // Phase 4
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Phase 4 : Expansion (Mois 4-12)")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.1 Objectifs 2026")] }),
      new Paragraph({ spacing: { after: 150 }, children: [new TextRun({ text: "Les objectifs pour la première année sont ambitieux mais réalistes, basés sur l'analyse du marché africain de la restauration et les tendances de digitalisation accélérées post-COVID.", color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Trimestre 2 : ", bold: true }), new TextRun("100 restaurants actifs, 3 pays (CI, SN, CM)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Trimestre 3 : ", bold: true }), new TextRun("300 restaurants, intégration M-Pesa pour le Kenya")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Trimestre 4 : ", bold: true }), new TextRun("500 restaurants, 5 pays, $25K MRR")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.2 Roadmap Produit")] }),
      new Paragraph({ spacing: { after: 150 }, children: [new TextRun({ text: "L'évolution du produit suivra les retours utilisateurs et les opportunités de marché. Les fonctionnalités prioritaires pour 2026 incluent l'application mobile native, l'intégration avec les plateformes de livraison, et les fonctionnalités de fidélité client.", color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Q2 2026 : ", bold: true }), new TextRun("Application mobile iOS/Android, Intégration Jumia Food")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Q3 2026 : ", bold: true }), new TextRun("Programme de fidélité client, Module comptable")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Q4 2026 : ", bold: true }), new TextRun("Marketplace fournisseurs, IA prédictive des stocks")] }),
      
      // Budget
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Budget Marketing Annuel")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Le budget total pour le lancement et la première année d'exploitation est estimé à $75,000. Cette enveloppe couvre l'ensemble des actions marketing, les coûts d'infrastructure et les ressources humaines essentielles.", color: colors.body })] }),
      
      // Budget table
      new Table({
        columnWidths: [4680, 2340, 2340],
        margins: { top: 100, bottom: 100, left: 150, right: 150 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 4680, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Catégorie", bold: true })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Budget", bold: true })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "% Total", bold: true })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Marketing Digital (Ads, SEO)")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$25,000")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("33%")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Événements et Relations Publiques")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$15,000")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("20%")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Infrastructure et Hébergement")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$12,000")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("16%")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Équipe Support et Vente")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$18,000")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("24%")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Réserve et Imprévus")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("$5,000")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("7%")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "TOTAL", bold: true })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$75,000", bold: true })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "100%", bold: true })] })] })
          ]})
        ]
      }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 300 },
        children: [new TextRun({ text: "Tableau 2 : Répartition du budget marketing 2026", italics: true, size: 20, color: colors.secondary })] }),
      
      // Contact
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Contact et Ressources")] }),
      new Paragraph({ spacing: { after: 150 }, children: [new TextRun({ text: "Pour toute question ou assistance lors du lancement commercial, les ressources suivantes sont disponibles pour l'équipe Restaurant OS.", color: colors.body })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Repository GitHub : ", bold: true }), new TextRun("github.com/skaba89/restauration_rapide")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Documentation API : ", bold: true }), new TextRun("restaurant-os.app/api/docs")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Dashboard Sentry : ", bold: true }), new TextRun("sentry.io (projet restaurant-os)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Site commercial : ", bold: true }), new TextRun("restaurant-os.app")] })
    ]
  }]
});

// Save both documents
async function saveDocuments() {
  const githubBuffer = await Packer.toBuffer(githubGuideDoc);
  fs.writeFileSync('/home/z/my-project/download/Guide_Configuration_GitHub.docx', githubBuffer);
  
  const launchBuffer = await Packer.toBuffer(launchGuideDoc);
  fs.writeFileSync('/home/z/my-project/download/Guide_Lancement_Commercial.docx', launchBuffer);
  
  console.log('Documents créés avec succès !');
}

saveDocuments();
