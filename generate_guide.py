from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Register fonts
pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))

registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Create document
doc = SimpleDocTemplate(
    "/home/z/my-project/download/Guide_Utilisation_KFM_Delice.pdf",
    pagesize=A4,
    title="Guide Utilisation KFM Delice",
    author='Z.ai',
    creator='Z.ai',
    subject='Guide complet d\'utilisation du système Restaurant OS pour KFM DELICE',
    rightMargin=2*cm,
    leftMargin=2*cm,
    topMargin=2*cm,
    bottomMargin=2*cm
)

# Styles
styles = getSampleStyleSheet()

# Cover styles
cover_title_style = ParagraphStyle(
    name='CoverTitle',
    fontName='SimHei',
    fontSize=36,
    leading=44,
    alignment=TA_CENTER,
    spaceAfter=20
)

cover_subtitle_style = ParagraphStyle(
    name='CoverSubtitle',
    fontName='SimHei',
    fontSize=18,
    leading=24,
    alignment=TA_CENTER,
    spaceAfter=30
)

cover_info_style = ParagraphStyle(
    name='CoverInfo',
    fontName='SimHei',
    fontSize=14,
    leading=20,
    alignment=TA_CENTER,
    spaceAfter=10
)

# Body styles
h1_style = ParagraphStyle(
    name='H1Style',
    fontName='SimHei',
    fontSize=20,
    leading=28,
    alignment=TA_LEFT,
    spaceBefore=24,
    spaceAfter=12,
    textColor=colors.HexColor('#1F4E79')
)

h2_style = ParagraphStyle(
    name='H2Style',
    fontName='SimHei',
    fontSize=16,
    leading=22,
    alignment=TA_LEFT,
    spaceBefore=18,
    spaceAfter=10,
    textColor=colors.HexColor('#2E75B6')
)

h3_style = ParagraphStyle(
    name='H3Style',
    fontName='SimHei',
    fontSize=13,
    leading=18,
    alignment=TA_LEFT,
    spaceBefore=12,
    spaceAfter=8,
    textColor=colors.HexColor('#5B9BD5')
)

body_style = ParagraphStyle(
    name='BodyStyle',
    fontName='SimHei',
    fontSize=11,
    leading=18,
    alignment=TA_LEFT,
    spaceAfter=8,
    wordWrap='CJK'
)

bullet_style = ParagraphStyle(
    name='BulletStyle',
    fontName='SimHei',
    fontSize=11,
    leading=16,
    alignment=TA_LEFT,
    leftIndent=20,
    spaceAfter=4,
    wordWrap='CJK'
)

# Table styles
header_style = ParagraphStyle(
    name='TableHeader',
    fontName='SimHei',
    fontSize=10,
    textColor=colors.white,
    alignment=TA_CENTER,
    wordWrap='CJK'
)

cell_style = ParagraphStyle(
    name='TableCell',
    fontName='SimHei',
    fontSize=9,
    textColor=colors.black,
    alignment=TA_LEFT,
    wordWrap='CJK'
)

cell_center_style = ParagraphStyle(
    name='TableCellCenter',
    fontName='SimHei',
    fontSize=9,
    textColor=colors.black,
    alignment=TA_CENTER,
    wordWrap='CJK'
)

story = []

# ==================== COVER PAGE ====================
story.append(Spacer(1, 100))
story.append(Paragraph("<b>KFM DELICE</b>", cover_title_style))
story.append(Spacer(1, 20))
story.append(Paragraph("Guide d'Utilisation Complet", cover_subtitle_style))
story.append(Paragraph("Système de Gestion Restaurant OS", cover_subtitle_style))
story.append(Spacer(1, 60))
story.append(Paragraph("Version 1.0 - Avril 2026", cover_info_style))
story.append(Paragraph("Conakry, Guinée", cover_info_style))
story.append(Spacer(1, 40))
story.append(Paragraph("Plateforme SaaS Multi-Tenants", cover_info_style))
story.append(Paragraph("www.kfm-delice.com", cover_info_style))
story.append(PageBreak())

# ==================== TABLE OF CONTENTS ====================
story.append(Paragraph("<b>Table des Matières</b>", h1_style))
story.append(Spacer(1, 20))

toc_items = [
    ("1. Tableau de Bord (Dashboard)", "Page 3"),
    ("2. Point de Vente (POS)", "Page 4"),
    ("3. Gestion des Commandes", "Page 5"),
    ("4. Gestion du Menu", "Page 6"),
    ("5. Plan de Salle", "Page 7"),
    ("6. Réservations", "Page 8"),
    ("7. Service Traiteur", "Page 9"),
    ("8. Liste d'Attente", "Page 10"),
    ("9. Gestion des Clients", "Page 11"),
    ("10. Cartes Cadeaux", "Page 12"),
    ("11. Abonnements Repas", "Page 13"),
    ("12. Gestion des Succursales", "Page 14"),
    ("13. Gestion du Personnel", "Page 15"),
    ("14. Gestion des Stocks", "Page 16"),
    ("15. Gestion des Dépenses", "Page 17"),
    ("16. Allergènes et Nutrition", "Page 18"),
    ("17. Comptabilité", "Page 19"),
    ("18. Gestion des Livraisons", "Page 20"),
    ("19. Gestion des Drivers", "Page 21"),
    ("20. Analytics et Rapports", "Page 22"),
]

toc_data = [[Paragraph("<b>Module</b>", header_style), Paragraph("<b>Page</b>", header_style)]]
for item, page in toc_items:
    toc_data.append([Paragraph(item, cell_style), Paragraph(page, cell_center_style)])

toc_table = Table(toc_data, colWidths=[14*cm, 3*cm])
toc_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 10),
    ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(toc_table)
story.append(PageBreak())

# ==================== MODULE 1: DASHBOARD ====================
story.append(Paragraph("<b>1. Tableau de Bord (Dashboard)</b>", h1_style))

story.append(Paragraph("<b>1.1 Accès au Module</b>", h2_style))
story.append(Paragraph("Le tableau de bord est la page d'accueil principale du système. Pour y accéder, connectez-vous avec vos identifiants et cliquez sur \"Dashboard\" dans le menu latéral gauche. Cette page vous donne une vue d'ensemble instantanée de toutes les activités de votre restaurant, vous permettant de prendre des décisions rapides et éclairées.", body_style))

story.append(Paragraph("<b>1.2 Indicateurs Clés de Performance (KPIs)</b>", h2_style))
story.append(Paragraph("Le dashboard affiche quatre indicateurs principaux en haut de page qui constituent le pouls de votre activité :", body_style))

kpi_data = [
    [Paragraph("<b>Indicateur</b>", header_style), Paragraph("<b>Description</b>", header_style), Paragraph("<b>Utilité</b>", header_style)],
    [Paragraph("Chiffre d'Affaires", cell_style), Paragraph("Total des ventes de la journée", cell_style), Paragraph("Suivi financier quotidien", cell_style)],
    [Paragraph("Commandes", cell_style), Paragraph("Nombre total de commandes", cell_style), Paragraph("Volume d'activité", cell_style)],
    [Paragraph("Clients", cell_style), Paragraph("Nombre de clients servis", cell_style), Paragraph("Fréquentation", cell_style)],
    [Paragraph("Panier Moyen", cell_style), Paragraph("Montant moyen par commande", cell_style), Paragraph("Performance commerciale", cell_style)],
]

kpi_table = Table(kpi_data, colWidths=[4*cm, 6*cm, 5*cm])
kpi_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 10))
story.append(kpi_table)
story.append(Spacer(1, 10))

story.append(Paragraph("<b>1.3 Cartes de Statut des Commandes</b>", h2_style))
story.append(Paragraph("Ces cartes vous permettent de visualiser en temps réel l'état de vos commandes actives. Quatre statuts sont surveillés : les commandes en attente qui nécessitent une action immédiate, les commandes en préparation en cuisine, les commandes prêtes à être servies ou récupérées, et le nombre de drivers actuellement actifs pour les livraisons. Chaque carte affiche un compteur avec le nombre d'éléments dans chaque catégorie, vous permettant de gérer efficacement le flux de travail.", body_style))

story.append(Paragraph("<b>1.4 Graphiques de Ventes</b>", h2_style))
story.append(Paragraph("Le graphique de ventes hebdomadaires affiche l'évolution de votre chiffre d'affaires sur les sept derniers jours. Ce graphique interactif vous permet d'identifier les tendances, les jours les plus performants et les périodes creuses. Utilisez ces données pour optimiser vos horaires, votre personnel et vos stocks.", body_style))

story.append(Paragraph("<b>1.5 Statut des Tables</b>", h2_style))
story.append(Paragraph("Cette section affiche la cartographie en temps réel de l'occupation de vos tables. Chaque table est représentée par une icône avec un code couleur : vert pour les tables libres, rouge pour les tables occupées, et jaune pour les tables réservées. Cliquez sur une table pour accéder directement à sa gestion ou créer une nouvelle commande associée.", body_style))

story.append(PageBreak())

# ==================== MODULE 2: POS ====================
story.append(Paragraph("<b>2. Point de Vente (POS)</b>", h1_style))

story.append(Paragraph("<b>2.1 Présentation du Module</b>", h2_style))
story.append(Paragraph("Le Point de Vente (POS) est le cœur opérationnel de votre restaurant. Cette interface intuitive permet de prendre les commandes rapidement et efficacement, que ce soit pour les clients sur place, à emporter ou en livraison. Le système est optimisé pour une utilisation sur écran tactile et s'adapte parfaitement aux tablettes et terminaux de caisse modernes.", body_style))

story.append(Paragraph("<b>2.2 Interface de Prise de Commande</b>", h2_style))
story.append(Paragraph("L'interface se divise en trois zones principales pour une navigation fluide :", body_style))

story.append(Paragraph("• Zone gauche : Liste des catégories de menu avec icônes visuelles. Cliquez sur une catégorie pour afficher ses articles. Les catégories peuvent être personnalisées selon votre menu.", bullet_style))
story.append(Paragraph("• Zone centrale : Affichage des articles de la catégorie sélectionnée. Chaque article montre son nom, son prix et sa disponibilité. Cliquez sur un article pour l'ajouter au panier.", bullet_style))
story.append(Paragraph("• Zone droite : Panier de commande avec la liste des articles sélectionnés, les quantités modifiables et le total à payer.", bullet_style))

story.append(Paragraph("<b>2.3 Gestion du Panier</b>", h2_style))
story.append(Paragraph("Pour chaque article ajouté au panier, vous pouvez ajuster la quantité avec les boutons + et -, supprimer l'article avec l'icône de corbeille, ou ajouter des notes spéciales (ex: \"sans oignons\", \"bien cuit\"). Le système calcule automatiquement les sous-totaux et le total général, incluant les taxes applicables selon votre configuration.", body_style))

story.append(Paragraph("<b>2.4 Options de Paiement</b>", h2_style))
story.append(Paragraph("Le système supporte plusieurs méthodes de paiement adaptées au marché guinéen :", body_style))

payment_data = [
    [Paragraph("<b>Méthode</b>", header_style), Paragraph("<b>Utilisation</b>", header_style), Paragraph("<b>Configuration Requise</b>", header_style)],
    [Paragraph("Orange Money", cell_style), Paragraph("Paiement mobile via numéro Orange", cell_style), Paragraph("Numéro marchand configuré", cell_style)],
    [Paragraph("MTN MoMo", cell_style), Paragraph("Paiement mobile via numéro MTN", cell_style), Paragraph("Numéro marchand configuré", cell_style)],
    [Paragraph("Wave", cell_style), Paragraph("Paiement mobile Wave", cell_style), Paragraph("Compte Wave Business", cell_style)],
    [Paragraph("Espèces", cell_style), Paragraph("Paiement en liquide", cell_style), Paragraph("Aucune configuration", cell_style)],
    [Paragraph("Carte Bancaire", cell_style), Paragraph("Terminal de paiement", cell_style), Paragraph("Intégration TPE", cell_style)],
]

payment_table = Table(payment_data, colWidths=[4*cm, 6*cm, 5*cm])
payment_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 10))
story.append(payment_table)
story.append(Spacer(1, 10))

story.append(Paragraph("<b>2.5 Informations Client et Livraison</b>", h2_style))
story.append(Paragraph("Avant de finaliser la commande, vous pouvez enregistrer les informations du client : nom et prénom pour un service personnalisé, numéro de téléphone pour le suivi et la livraison, et type de commande (sur place, à emporter, ou livraison). Pour les livraisons, une adresse de livraison est obligatoire et sera transmise au driver assigné.", body_style))

story.append(Paragraph("<b>2.6 Impression du Ticket</b>", h2_style))
story.append(Paragraph("Après validation du paiement, le système génère automatiquement un ticket de caisse. Vous pouvez imprimer ce ticket si une imprimante thermique est connectée, l'envoyer par SMS au client, ou l'envoyer par email si l'adresse est disponible. Le ticket comprend le détail des articles, les prix, les taxes, le mode de paiement et un numéro de commande unique pour le suivi.", body_style))

story.append(PageBreak())

# ==================== MODULE 3: COMMANDES ====================
story.append(Paragraph("<b>3. Gestion des Commandes</b>", h1_style))

story.append(Paragraph("<b>3.1 Vue d'Ensemble</b>", h2_style))
story.append(Paragraph("Le module de gestion des commandes centralise toutes les commandes du restaurant, qu'elles proviennent du POS, de la page publique en ligne, ou des applications de livraison partenaires. Cette interface permet de suivre le cycle de vie complet de chaque commande, de sa création à sa livraison ou son retrait.", body_style))

story.append(Paragraph("<b>3.2 Modes d'Affichage</b>", h2_style))
story.append(Paragraph("Deux modes d'affichage sont disponibles pour s'adapter à votre façon de travailler :", body_style))

story.append(Paragraph("• Mode Kanban : Les commandes sont organisées en colonnes selon leur statut (En attente, En préparation, Prête, Terminée). Glissez-déposez les commandes entre les colonnes pour mettre à jour leur statut. Idéal pour une vue rapide de l'état général.", bullet_style))
story.append(Paragraph("• Mode Liste : Toutes les commandes affichées dans un tableau avec filtres et tri. Permet de voir plus de détails et d'effectuer des recherches avancées. Idéal pour les gestions détaillées et les rapports.", bullet_style))

story.append(Paragraph("<b>3.3 Workflow des Statuts</b>", h2_style))
story.append(Paragraph("Chaque commande suit un workflow précis avec des statuts bien définis :", body_style))

status_data = [
    [Paragraph("<b>Statut</b>", header_style), Paragraph("<b>Signification</b>", header_style), Paragraph("<b>Action Suivante</b>", header_style)],
    [Paragraph("En Attente", cell_style), Paragraph("Commande reçue, non traitée", cell_style), Paragraph("Confirmer ou rejeter", cell_style)],
    [Paragraph("Confirmée", cell_style), Paragraph("Commande validée par le restaurant", cell_style), Paragraph("Commencer préparation", cell_style)],
    [Paragraph("En Préparation", cell_style), Paragraph("Cuisine en cours de préparation", cell_style), Paragraph("Marquer comme prête", cell_style)],
    [Paragraph("Prête", cell_style), Paragraph("Commande prête à servir/récupérer", cell_style), Paragraph("Servir ou livrer", cell_style)],
    [Paragraph("En Livraison", cell_style), Paragraph("Driver en route (livraisons)", cell_style), Paragraph("Confirmer livraison", cell_style)],
    [Paragraph("Livrée/Terminée", cell_style), Paragraph("Commande finalisée", cell_style), Paragraph("Archiver", cell_style)],
]

status_table = Table(status_data, colWidths=[4*cm, 5.5*cm, 5.5*cm])
status_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#F5F5F5')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 10))
story.append(status_table)
story.append(Spacer(1, 10))

story.append(Paragraph("<b>3.4 Filtres et Recherche</b>", h2_style))
story.append(Paragraph("Utilisez les filtres pour retrouver rapidement les commandes souhaitées : filtrer par statut pour voir uniquement certains types de commandes, filtrer par type (sur place, à emporter, livraison), filtrer par date pour consulter l'historique, et rechercher par numéro de commande ou nom de client. Ces filtres peuvent être combinés pour des recherches précises.", body_style))

story.append(Paragraph("<b>3.5 Détails d'une Commande</b>", h2_style))
story.append(Paragraph("Cliquez sur une commande pour voir tous ses détails : informations client complètes, liste des articles avec personnalisations, historique des statuts avec horodatage, informations de paiement, et pour les livraisons, l'adresse et le driver assigné. Vous pouvez également ajouter des notes internes visibles uniquement par le personnel.", body_style))

story.append(PageBreak())

# ==================== MODULE 4: MENU ====================
story.append(Paragraph("<b>4. Gestion du Menu</b>", h1_style))

story.append(Paragraph("<b>4.1 Organisation du Menu</b>", h2_style))
story.append(Paragraph("Le module Menu vous permet de gérer l'ensemble de votre carte de restaurant. Les articles sont organisés par catégories pour faciliter la navigation, tant pour votre personnel que pour vos clients sur la page de commande en ligne. Une bonne organisation du menu améliore l'expérience client et accélère la prise de commande.", body_style))

story.append(Paragraph("<b>4.2 Création de Catégories</b>", h2_style))
story.append(Paragraph("Les catégories permettent de structurer votre menu logiquement. Pour créer une catégorie, cliquez sur \"Nouvelle Catégorie\", entrez un nom descriptif (ex: Entrées, Plats Principaux, Boissons, Desserts), ajoutez une image représentative si disponible, et définissez l'ordre d'affichage. Vous pouvez créer jusqu'à 20 catégories actives simultanément.", body_style))

story.append(Paragraph("<b>4.3 Ajout d'Articles</b>", h2_style))
story.append(Paragraph("Pour chaque article du menu, vous pouvez configurer les éléments suivants :", body_style))

menu_data = [
    [Paragraph("<b>Champ</b>", header_style), Paragraph("<b>Description</b>", header_style), Paragraph("<b>Obligatoire</b>", header_style)],
    [Paragraph("Nom de l'article", cell_style), Paragraph("Nom affiché aux clients", cell_style), Paragraph("Oui", cell_center_style)],
    [Paragraph("Description", cell_style), Paragraph("Description détaillée et appétissante", cell_style), Paragraph("Recommandé", cell_center_style)],
    [Paragraph("Prix", cell_style), Paragraph("Prix en GNF ou devise configurée", cell_style), Paragraph("Oui", cell_center_style)],
    [Paragraph("Catégorie", cell_style), Paragraph("Catégorie parente", cell_style), Paragraph("Oui", cell_center_style)],
    [Paragraph("Image", cell_style), Paragraph("Photo de l'article (recommandé)", cell_style), Paragraph("Non", cell_center_style)],
    [Paragraph("Temps de préparation", cell_style), Paragraph("Durée estimée en minutes", cell_style), Paragraph("Recommandé", cell_center_style)],
    [Paragraph("Disponibilité", cell_style), Paragraph("Article disponible ou non", cell_style), Paragraph("Oui", cell_center_style)],
    [Paragraph("Badge", cell_style), Paragraph("Populaire, Nouveau, Épicé, etc.", cell_style), Paragraph("Non", cell_center_style)],
]

menu_table = Table(menu_data, colWidths=[5*cm, 7*cm, 3*cm])
menu_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 7), (-1, 7), colors.white),
    ('BACKGROUND', (0, 8), (-1, 8), colors.HexColor('#F5F5F5')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 10))
story.append(menu_table)
story.append(Spacer(1, 10))

story.append(Paragraph("<b>4.4 Gestion des Variantes et Options</b>", h2_style))
story.append(Paragraph("Pour les articles avec des options (tailles, suppléments, etc.), utilisez le système de variantes. Par exemple, une pizza peut avoir des tailles (Petite, Moyenne, Grande) avec des prix différents, et des suppléments (Fromage supplémentaire, Champignons) avec leurs propres prix additionnels. Ces options s'afficheront lors de la prise de commande.", body_style))

story.append(Paragraph("<b>4.5 Mode Grille et Liste</b>", h2_style))
story.append(Paragraph("Le mode Grille affiche les articles avec leurs images en vignettes, idéal pour une visualisation visuelle. Le mode Liste présente les articles dans un tableau compact avec plus d'informations, idéal pour la gestion rapide. Basculez entre les modes avec les icônes en haut à droite de l'interface.", body_style))

story.append(Paragraph("<b>4.6 Disponibilité Rapide</b>", h2_style))
story.append(Paragraph("Utilisez le toggle de disponibilité pour rapidement activer ou désactiver un article. Ceci est particulièrement utile en cas de rupture de stock temporaire ou pour les plats saisonniers. Un article non disponible n'apparaîtra pas sur la page publique de commande.", body_style))

story.append(PageBreak())

# ==================== MODULE 5: PLAN DE SALLE ====================
story.append(Paragraph("<b>5. Plan de Salle</b>", h1_style))

story.append(Paragraph("<b>5.1 Concept du Plan de Salle</b>", h2_style))
story.append(Paragraph("Le plan de salle est une représentation visuelle de votre restaurant avec toutes vos tables. Cet outil vous permet de gérer l'occupation en temps réel, d'assigner des serveurs aux tables, et d'optimiser le flux de service. Le système supporte plusieurs sections ou zones pour les restaurants avec différents espaces.", body_style))

story.append(Paragraph("<b>5.2 Configuration des Sections</b>", h2_style))
story.append(Paragraph("Avant d'utiliser le plan de salle, configurez vos différentes zones. Les sections typiques incluent la Salle Principale avec la majorité des tables, la Terrasse pour les espaces extérieurs, les Salons VIP pour les espaces premium, et les Coins Intimes pour les espaces privés. Pour chaque section, définissez un nom et une couleur d'identification.", body_style))

story.append(Paragraph("<b>5.3 Ajout et Positionnement des Tables</b>", h2_style))
story.append(Paragraph("En mode Édition, vous pouvez ajouter des tables en cliquant sur \"Ajouter une Table\". Configurez ensuite les paramètres de chaque table :", body_style))

table_data = [
    [Paragraph("<b>Paramètre</b>", header_style), Paragraph("<b>Options</b>", header_style), Paragraph("<b>Impact</b>", header_style)],
    [Paragraph("Numéro/Nom", cell_style), Paragraph("Identifiant unique (Table 1, VIP A, etc.)", cell_style), Paragraph("Repérage rapide", cell_style)],
    [Paragraph("Forme", cell_style), Paragraph("Ronde, Carrée, Rectangulaire", cell_style), Paragraph("Représentation visuelle", cell_style)],
    [Paragraph("Capacité", cell_style), Paragraph("Nombre de places assises", cell_style), Paragraph("Gestion des groupes", cell_style)],
    [Paragraph("Section", cell_style), Paragraph("Zone du restaurant", cell_style), Paragraph("Organisation spatiale", cell_style)],
    [Paragraph("Serveur assigné", cell_style), Paragraph("Membre du personnel", cell_style), Paragraph("Responsabilité de service", cell_style)],
]

table_config = Table(table_data, colWidths=[4*cm, 6*cm, 5*cm])
table_config.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 10))
story.append(table_config)
story.append(Spacer(1, 10))

story.append(Paragraph("<b>5.4 Gestion des Statuts de Tables</b>", h2_style))
story.append(Paragraph("Chaque table affiche un code couleur indiquant son statut actuel :", body_style))
story.append(Paragraph("• Vert : Table libre, disponible pour de nouveaux clients", bullet_style))
story.append(Paragraph("• Rouge : Table occupée, clients en cours de service", bullet_style))
story.append(Paragraph("• Jaune : Table réservée pour une arrivée prochaine", bullet_style))
story.append(Paragraph("• Gris : Table en nettoyage ou maintenance", bullet_style))

story.append(Paragraph("<b>5.5 Actions sur les Tables</b>", h2_style))
story.append(Paragraph("Cliquez sur une table pour accéder aux actions rapides : ouvrir une nouvelle commande pour cette table, voir la commande en cours, libérer la table après départ des clients, ou assigner un serveur spécifique. Pour les tables réservées, le système affiche automatiquement les informations de réservation associées.", body_style))

story.append(PageBreak())

# ==================== MODULE 6: RÉSERVATIONS ====================
story.append(Paragraph("<b>6. Gestion des Réservations</b>", h1_style))

story.append(Paragraph("<b>6.1 Présentation</b>", h2_style))
story.append(Paragraph("Le module de réservations vous permet de gérer efficacement les réservations de vos clients. Il centralise toutes les demandes, qu'elles proviennent du site web, du téléphone, ou d'applications tierces. Une gestion proactive des réservations améliore l'expérience client et optimise le remplissage de votre restaurant.", body_style))

story.append(Paragraph("<b>6.2 Création d'une Réservation</b>", h2_style))
story.append(Paragraph("Pour créer une nouvelle réservation, cliquez sur \"Nouvelle Réservation\" et remplissez les informations suivantes :", body_style))
story.append(Paragraph("• Informations client : nom, prénom, téléphone, email (optionnel)", bullet_style))
story.append(Paragraph("• Détails de la réservation : date, heure, nombre de personnes", bullet_style))
story.append(Paragraph("• Préférences : section préférée, occasion spéciale (anniversaire, etc.), demandes particulières", bullet_style))
story.append(Paragraph("• Assignation : table(s) à réserver, serveur préféré si applicable", bullet_style))

story.append(Paragraph("<b>6.3 Workflow des Réservations</b>", h2_style))

reserv_data = [
    [Paragraph("<b>Statut</b>", header_style), Paragraph("<b>Description</b>", header_style), Paragraph("<b>Action</b>", header_style)],
    [Paragraph("En Attente", cell_style), Paragraph("Demande reçue, non confirmée", cell_style), Paragraph("Confirmer ou annuler", cell_style)],
    [Paragraph("Confirmée", cell_style), Paragraph("Réservation validée", cell_style), Paragraph("Préparer l'arrivée", cell_style)],
    [Paragraph("Arrivée", cell_style), Paragraph("Clients installés à table", cell_style), Paragraph("Commencer le service", cell_style)],
    [Paragraph("Terminée", cell_style), Paragraph("Service terminé", cell_style), Paragraph("Libérer la table", cell_style)],
    [Paragraph("Annulée", cell_style), Paragraph("Réservation annulée", cell_style), Paragraph("Archiver", cell_style)],
    [Paragraph("No-Show", cell_style), Paragraph("Clients ne se sont pas présentés", cell_style), Paragraph("Notifier et archiver", cell_style)],
]

reserv_table = Table(reserv_data, colWidths=[3.5*cm, 6*cm, 5.5*cm])
reserv_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#F5F5F5')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 10))
story.append(reserv_table)
story.append(Spacer(1, 10))

story.append(Paragraph("<b>6.4 Vérification de Disponibilité</b>", h2_style))
story.append(Paragraph("Le système vérifie automatiquement la disponibilité lors de la création d'une réservation. Si les tables demandées ne sont pas disponibles, le système propose des alternatives proches. Vous pouvez également consulter le calendrier de réservations pour visualiser les créneaux disponibles et planifier en conséquence.", body_style))

story.append(Paragraph("<b>6.5 Notifications Automatiques</b>", h2_style))
story.append(Paragraph("Configurez les notifications automatiques pour améliorer la communication avec vos clients : confirmation de réservation par SMS ou email, rappel 24h avant l'arrivée, et notification d'annulation avec possibilité de reprogrammation. Ces notifications réduisent les no-shows et améliorent la satisfaction client.", body_style))

story.append(PageBreak())

# ==================== MODULE 7: TRAITEUR ====================
story.append(Paragraph("<b>7. Service Traiteur (Catering)</b>", h1_style))

story.append(Paragraph("<b>7.1 Concept du Service Traiteur</b>", h2_style))
story.append(Paragraph("Le module Traiteur vous permet de gérer un service de restauration évènementielle en parallèle de votre activité restaurant classique. Vous pouvez créer des packages de services, gérer les demandes de devis, planifier les événements, et suivre les commandes traiteur de la demande à la réalisation.", body_style))

story.append(Paragraph("<b>7.2 Création de Packages</b>", h2_style))
story.append(Paragraph("Les packages définissent vos offres de service traiteur avec leurs tarifs. Pour chaque package, configurez un nom descriptif et une description détaillée, le type de service (livraison simple, service avec personnel, sur site), le menu proposé avec les articles inclus, le prix par personne ou prix forfaitaire, les conditions (minimum de personnes, disponibilité), et les suppléments optionnels disponibles.", body_style))

story.append(Paragraph("<b>7.3 Gestion des Demandes</b>", h2_style))
story.append(Paragraph("Les demandes de service traiteur arrivent dans le système avec les informations suivantes : coordonnées du client, type d'événement (mariage, anniversaire, entreprise, etc.), date et heure souhaitées, nombre estimé de convives, lieu de l'événement, et demandes spécifiques. Traitez chaque demande en créant un devis personnalisé ou en proposant un package existant.", body_style))

story.append(Paragraph("<b>7.4 Calendrier des Événements</b>", h2_style))
story.append(Paragraph("Le calendrier traiteur affiche tous vos événements planifiés. Utilisez-le pour éviter les conflits de dates, planifier vos ressources (personnel, équipement), et visualiser votre charge de travail. Chaque événement affiche son statut de préparation et les tâches à accomplir.", body_style))

story.append(Paragraph("<b>7.5 Workflow des Commandes Traiteur</b>", h2_style))
story.append(Paragraph("Le workflow typique d'une commande traiteur comprend les étapes suivantes : réception de la demande, envoi d'un devis au client, validation du devis par le client avec acompte, confirmation et planification logistique, préparation le jour J, réalisation du service, et facturation finale avec le solde. Chaque étape génère des notifications automatiques aux parties concernées.", body_style))

story.append(PageBreak())

# ==================== MODULE 8: LISTE D'ATTENTE ====================
story.append(Paragraph("<b>8. Liste d'Attente</b>", h1_style))

story.append(Paragraph("<b>8.1 Utilité de la Liste d'Attente</b>", h2_style))
story.append(Paragraph("La liste d'attente est essentielle pour les restaurants très fréquentés. Elle permet de gérer les clients qui arrivent sans réservation lorsque le restaurant est complet. Le système enregistre les clients en attente, estime le temps d'attente, et notifie automatiquement lorsqu'une table se libère.", body_style))

story.append(Paragraph("<b>8.2 Ajout d'un Client en Attente</b>", h2_style))
story.append(Paragraph("Pour ajouter un client à la liste d'attente, cliquez sur \"Ajouter\" et saisissez les informations suivantes : nom du client, nombre de personnes dans le groupe, numéro de téléphone pour la notification, préférences éventuelles (intérieur/terrasse, table haute/basse), et toute demande spéciale. Le système enregistre automatiquement l'heure d'arrivée et calcule le temps d'attente estimé.", body_style))

story.append(Paragraph("<b>8.3 Gestion de la File d'Attente</b>", h2_style))
story.append(Paragraph("La liste affiche tous les clients en attente avec leur position dans la file. Pour chaque entrée, vous pouvez voir le temps d'attente écoulé, modifier les informations, notifier le client manuellement, marquer comme installé lorsque la table est prête, ou annuler si le client part. Le système rafraîchit automatiquement la liste toutes les 30 secondes.", body_style))

story.append(Paragraph("<b>8.4 Notifications SMS</b>", h2_style))
story.append(Paragraph("Lorsqu'une table se libère et correspond aux besoins du client suivant, le système peut envoyer automatiquement un SMS de notification. Le client reçoit un message l'informant que sa table est prête et a un délai configurable pour se présenter. Configurez le message et le délai dans les paramètres du module.", body_style))

story.append(PageBreak())

# ==================== MODULE 9: CLIENTS ====================
story.append(Paragraph("<b>9. Gestion des Clients</b>", h1_style))

story.append(Paragraph("<b>9.1 Base de Données Clients</b>", h2_style))
story.append(Paragraph("Le module Clients centralise toutes les informations sur vos clients. Cette base de données enrichie vous permet d'offrir un service personnalisé, de fidéliser votre clientèle, et d'analyser vos segments de marché. Les données clients sont alimentées automatiquement par les commandes, réservations, et inscriptions.", body_style))

story.append(Paragraph("<b>9.2 Informations Client</b>", h2_style))
story.append(Paragraph("Chaque fiche client contient les informations suivantes :", body_style))
story.append(Paragraph("• Informations personnelles : nom, prénom, téléphone, email, date de naissance", bullet_style))
story.append(Paragraph("• Adresse de livraison par défaut si applicable", bullet_style))
story.append(Paragraph("• Historique des commandes avec montants totaux", bullet_style))
story.append(Paragraph("• Statut VIP et points de fidélité", bullet_style))
story.append(Paragraph("• Préférences alimentaires et allergènes à éviter", bullet_style))
story.append(Paragraph("• Notes internes pour le service personnalisé", bullet_style))

story.append(Paragraph("<b>9.3 Programme VIP</b>", h2_style))
story.append(Paragraph("Marquez vos meilleurs clients comme VIP pour leur offrir des avantages spéciaux. Les clients VIP bénéficient de priorité sur les réservations, d'offres exclusives, et d'une attention particulière du personnel. Le système peut automatiquement suggérer des clients à passer VIP basé sur leur fréquence et leurs dépenses.", body_style))

story.append(Paragraph("<b>9.4 Statistiques Client</b>", h2_style))
story.append(Paragraph("Consultez les statistiques d'un client pour mieux le connaître : nombre total de commandes, montant total dépensé, panier moyen, fréquence de visite, articles préférés, et dernière visite. Ces informations aident votre équipe à offrir un service personnalisé et à anticiper les besoins des clients réguliers.", body_style))

story.append(PageBreak())

# ==================== MODULE 10: CARTES CADEAUX ====================
story.append(Paragraph("<b>10. Cartes Cadeaux</b>", h1_style))

story.append(Paragraph("<b>10.1 Système de Cartes Cadeaux</b>", h2_style))
story.append(Paragraph("Le module Cartes Cadeaux vous permet de créer et gérer un programme de cartes cadeaux. Les clients peuvent acheter des cartes pour offrir à leurs proches, qui pourront ensuite les utiliser pour régler leurs commandes. C'est un excellent moyen d'attirer de nouveaux clients et de générer des ventes anticipées.", body_style))

story.append(Paragraph("<b>10.2 Création d'une Carte Cadeau</b>", h2_style))
story.append(Paragraph("Pour créer une carte cadeau, indiquez le montant initial de la carte, le nom de l'acheteur et du bénéficiaire, un message personnel si souhaité, et la date d'expiration (optionnelle). Le système génère automatiquement un code unique qui servira à utiliser la carte. Vous pouvez imprimer un support physique ou envoyer le code par email/SMS.", body_style))

story.append(Paragraph("<b>10.3 Utilisation d'une Carte</b>", h2_style))
story.append(Paragraph("Pour utiliser une carte cadeau lors d'un paiement, saisissez le code de la carte dans le champ prévu à cet effet. Le système vérifie le solde disponible et déduit le montant de la commande. Si le montant dépasse le solde, le complément peut être réglé par un autre moyen de paiement. Le solde restant reste disponible pour une utilisation future.", body_style))

story.append(Paragraph("<b>10.4 Gestion des Cartes</b>", h2_style))
story.append(Paragraph("Le tableau de bord des cartes cadeaux affiche toutes les cartes avec leur statut. Vous pouvez consulter le solde d'une carte, voir l'historique des transactions, rembourser une carte si nécessaire, et désactiver une carte en cas de perte ou de fraude suspectée.", body_style))

story.append(PageBreak())

# ==================== MODULE 11: ABONNEMENTS ====================
story.append(Paragraph("<b>11. Abonnements Repas</b>", h1_style))

story.append(Paragraph("<b>11.1 Concept des Abonnements</b>", h2_style))
story.append(Paragraph("Le module Abonnements permet de proposer des formules de repas récurrents à vos clients. Par exemple, un client peut s'abonner pour recevoir son déjeuner chaque jour de la semaine. Cette fonctionnalité est particulièrement adaptée aux zones de bureaux et aux clients réguliers qui apprécient la commodité.", body_style))

story.append(Paragraph("<b>11.2 Création de Plans d'Abonnement</b>", h2_style))
story.append(Paragraph("Définissez vos plans d'abonnement avec les paramètres suivants : nom du plan (ex: Déjeuner Semaine, Formule Mensuelle), nombre de repas inclus, période de validité (semaine, mois), prix de l'abonnement, menus disponibles pour chaque repas, et restrictions éventuelles (jours exclus, horaires).", body_style))

story.append(Paragraph("<b>11.3 Gestion des Abonnés</b>", h2_style))
story.append(Paragraph("Pour chaque abonné, vous pouvez voir le plan souscrit, les repas déjà utilisés, les repas restants, la date de renouvellement, et l'historique des consommations. Le système envoie automatiquement des rappels de renouvellement avant l'expiration de l'abonnement.", body_style))

story.append(Paragraph("<b>11.4 Calendrier des Repas</b>", h2_style))
story.append(Paragraph("Le calendrier des abonnements affiche les repas planifiés pour chaque abonné. Utilisez-le pour anticiper la préparation et ajuster les stocks. Les abonnés peuvent personnaliser leurs repas à l'avance via leur espace client s'ils ont un compte.", body_style))

story.append(PageBreak())

# ==================== MODULE 12: SUCCURSALES ====================
story.append(Paragraph("<b>12. Gestion des Succursales</b>", h1_style))

story.append(Paragraph("<b>12.1 Architecture Multi-Sites</b>", h2_style))
story.append(Paragraph("Le système est conçu pour gérer plusieurs succursales depuis une interface centralisée. Chaque succursale dispose de ses propres données (commandes, stocks, personnel) tout en permettant une vue consolidée au niveau de l'organisation. Cette architecture est idéale pour les chaînes de restaurants ou les franchisés.", body_style))

story.append(Paragraph("<b>12.2 Ajout d'une Succursale</b>", h2_style))
story.append(Paragraph("Pour ajouter une nouvelle succursale, accédez au module Succursales et cliquez sur \"Nouvelle Succursale\". Renseignez le nom de l'établissement, l'adresse complète, les coordonnées GPS pour la livraison, les horaires d'ouverture par jour de la semaine, et le responsable du site. Le système créera automatiquement l'environnement dédié à cette succursale.", body_style))

story.append(Paragraph("<b>12.3 Sélecteur de Succursale</b>", h2_style))
story.append(Paragraph("En haut de l'interface, un sélecteur permet de basculer entre les différentes succursales. Les données affichées (commandes, stocks, statistiques) correspondent à la succursale sélectionnée. Certains utilisateurs avec les permissions appropriées peuvent voir une vue consolidée de toutes les succursales.", body_style))

story.append(Paragraph("<b>12.4 Transferts Inter-Succursales</b>", h2_style))
story.append(Paragraph("Le système permet d'effectuer des transferts de stocks entre succursales. Créez un transfert en indiquant la succursale source, la succursale destination, les articles à transférer avec leurs quantités. Le système met à jour les stocks des deux succursales et génère un document de transfert pour la traçabilité.", body_style))

story.append(Paragraph("<b>12.5 Comparaison de Performance</b>", h2_style))
story.append(Paragraph("Comparez les performances de vos différentes succursales avec les rapports comparatifs. Analysez le chiffre d'affaires par site, le nombre de commandes, le panier moyen, et d'autres KPIs pour identifier les succursales performantes et celles nécessitant une attention particulière.", body_style))

story.append(PageBreak())

# ==================== MODULE 13: PERSONNEL ====================
story.append(Paragraph("<b>13. Gestion du Personnel</b>", h1_style))

story.append(Paragraph("<b>13.1 Base de Données Employés</b>", h2_style))
story.append(Paragraph("Le module Personnel centralise la gestion de tous vos employés. Il permet de gérer les informations personnelles, les contrats, les planning, les heures de travail, et les paies. Une gestion efficace du personnel améliore la productivité et réduit les erreurs administratives.", body_style))

story.append(Paragraph("<b>13.2 Fiche Employé</b>", h2_style))
story.append(Paragraph("Chaque employé dispose d'une fiche complète contenant les informations personnelles, les coordonnées, le poste et les responsabilités, les horaires de travail habituels, le salaire et les avantages, les dates importantes (embauche, fin de contrat), et les permissions d'accès au système.", body_style))

story.append(Paragraph("<b>13.3 Planification des Horaires</b>", h2_style))
story.append(Paragraph("Le calendrier de planification permet d'assigner les équipes aux différents créneaux horaires. Créez des shifts (matin, midi, soir), assignez les employés à chaque shift, et publiez le planning. Les employés peuvent consulter leur planning depuis leur espace personnel et poser des demandes de congés.", body_style))

story.append(Paragraph("<b>13.4 Pointage et Heures Travaillées</b>", h2_style))
story.append(Paragraph("Le système de pointage permet aux employés d'enregistrer leurs arrivées et départs. En fin de période, consultez le récapitulatif des heures travaillées par employé, identifiez les heures supplémentaires, et exportez les données pour la paie.", body_style))

story.append(Paragraph("<b>13.5 Gestion des Rôles</b>", h2_style))

roles_data = [
    [Paragraph("<b>Rôle</b>", header_style), Paragraph("<b>Permissions</b>", header_style)],
    [Paragraph("Admin", cell_style), Paragraph("Accès complet à toutes les fonctionnalités et paramètres", cell_style)],
    [Paragraph("Manager", cell_style), Paragraph("Gestion des opérations, personnel, rapports (pas de paramètres)", cell_style)],
    [Paragraph("Serveur", cell_style), Paragraph("Prise de commandes, gestion des tables, réservations", cell_style)],
    [Paragraph("Cuisinier", cell_style), Paragraph("Vue cuisine, mise à jour des statuts de commandes", cell_style)],
    [Paragraph("Caissier", cell_style), Paragraph("POS, encaissement, fermeture de caisse", cell_style)],
]

roles_table = Table(roles_data, colWidths=[4*cm, 11*cm])
roles_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 10))
story.append(roles_table)
story.append(Spacer(1, 10))

story.append(PageBreak())

# ==================== MODULE 14: STOCKS ====================
story.append(Paragraph("<b>14. Gestion des Stocks</b>", h1_style))

story.append(Paragraph("<b>14.1 Importance de la Gestion des Stocks</b>", h2_style))
story.append(Paragraph("Une gestion rigoureuse des stocks est cruciale pour éviter les ruptures qui entraînent des ventes perdues et les surstocks qui immobilisent du capital. Le module Stocks vous permet de suivre vos inventaires en temps réel, de gérer vos fournisseurs, et d'optimiser vos commandes d'approvisionnement.", body_style))

story.append(Paragraph("<b>14.2 Catalogue des Articles</b>", h2_style))
story.append(Paragraph("Commencez par créer votre catalogue d'articles en stock. Pour chaque article, définissez le nom et la description, l'unité de mesure (kg, litre, pièce, etc.), la quantité actuelle en stock, le seuil d'alerte (stock minimum), le prix unitaire, et le fournisseur principal. Vous pouvez organiser les articles par catégories pour faciliter la navigation.", body_style))

story.append(Paragraph("<b>14.3 Mouvements de Stock</b>", h2_style))
story.append(Paragraph("Chaque mouvement de stock est enregistré avec sa date, son type (entrée, sortie, transfert, ajustement), la quantité concernée, et l'utilisateur responsable. Les entrées peuvent être liées à des bons de réception fournisseur, et les sorties peuvent être automatiques (liées aux ventes) ou manuelles (pertes, casse, consommation interne).", body_style))

story.append(Paragraph("<b>14.4 Alertes de Stock Bas</b>", h2_style))
story.append(Paragraph("Le système surveille automatiquement les niveaux de stock et génère des alertes lorsqu'un article descend sous son seuil d'alerte. Consultez la liste des articles à réapprovisionner dans le tableau de bord Stocks et générez des commandes fournisseur en quelques clics.", body_style))

story.append(Paragraph("<b>14.5 Gestion des Fournisseurs</b>", h2_style))
story.append(Paragraph("Le module intègre une gestion complète des fournisseurs. Pour chaque fournisseur, enregistrez ses coordonnées, les articles qu'il fournit avec leurs tarifs, les conditions de paiement, et l'historique des commandes. Cette centralisation facilite la comparaison des offres et la négociation.", body_style))

story.append(Paragraph("<b>14.6 Inventaires Physiques</b>", h2_style))
story.append(Paragraph("Régulièrement, effectuez un inventaire physique pour vérifier la concordance entre le stock théorique et le stock réel. Créez une session d'inventaire, saisissez les quantités comptées, et le système calculera les écarts et proposera les ajustements nécessaires.", body_style))

story.append(PageBreak())

# ==================== MODULE 15: DÉPENSES ====================
story.append(Paragraph("<b>15. Gestion des Dépenses</b>", h1_style))

story.append(Paragraph("<b>15.1 Suivi des Dépenses</b>", h2_style))
story.append(Paragraph("Le module Dépenses vous permet de suivre et catégoriser toutes les dépenses de votre restaurant. Une vision claire de vos coûts est essentielle pour contrôler votre rentabilité et identifier les postes d'économie potentielles. Les dépenses peuvent être saisies manuellement ou importées depuis des relevés bancaires.", body_style))

story.append(Paragraph("<b>15.2 Catégories de Dépenses</b>", h2_style))
story.append(Paragraph("Organisez vos dépenses en catégories pertinentes pour l'analyse. Les catégories typiques incluent les achats alimentaires, les boissons, le personnel (salaires, charges), le loyer et charges, l'énergie, le marketing, la maintenance, et les fournitures. Pour chaque catégorie, vous pouvez définir un budget mensuel et suivre les écarts.", body_style))

story.append(Paragraph("<b>15.3 Saisie d'une Dépense</b>", h2_style))
story.append(Paragraph("Pour enregistrer une dépense, indiquez le montant, la date, la catégorie, une description, le mode de paiement, et joignez éventuellement le justificatif (facture, ticket). Le système conserve une trace de tous les justificatifs pour faciliter la comptabilité et les contrôles.", body_style))

story.append(Paragraph("<b>15.4 Dépenses Récurrentes</b>", h2_style))
story.append(Paragraph("Configurez les dépenses fixes récurrentes (loyer, abonnements, etc.) pour qu'elles soient automatiquement enregistrées chaque mois. Cela garantit que toutes vos charges fixes sont bien prises en compte dans vos analyses de rentabilité.", body_style))

story.append(Paragraph("<b>15.5 Rapports de Dépenses</b>", h2_style))
story.append(Paragraph("Consultez les rapports de dépenses par période, par catégorie, ou par succursale. Les graphiques vous permettent de visualiser l'évolution des dépenses dans le temps et d'identifier les anomalies. Exportez les données au format CSV ou Excel pour une analyse approfondie dans votre outil comptable.", body_style))

story.append(PageBreak())

# ==================== MODULE 16: ALLERGÈNES ====================
story.append(Paragraph("<b>16. Allergènes et Nutrition</b>", h1_style))

story.append(Paragraph("<b>16.1 Enjeu de la Gestion des Allergènes</b>", h2_style))
story.append(Paragraph("La gestion des allergènes est une responsabilité majeure pour tout restaurant. Ce module vous permet de documenter les allergènes présents dans chaque plat, d'informer vos clients en toute transparence, et d'assurer la sécurité des personnes allergiques. En Guinée comme ailleurs, cette fonctionnalité renforce la confiance de votre clientèle.", body_style))

story.append(Paragraph("<b>16.2 Configuration des Allergènes</b>", h2_style))
story.append(Paragraph("Le système inclut une liste prédéfinie des 14 allergènes majeurs : gluten, crustacés, œufs, poissons, arachides, soja, lait, fruits à coque, céleri, moutarde, sésame, sulfites, lupin, et mollusques. Vous pouvez ajouter d'autres allergènes spécifiques si nécessaire. Pour chaque article de votre menu, cochez les allergènes qu'il contient.", body_style))

story.append(Paragraph("<b>16.3 Informations Nutritionnelles</b>", h2_style))
story.append(Paragraph("Complétez les informations nutritionnelles de vos articles : calories, protéines, glucides, lipides, fibres, et sel. Ces données sont affichées sur la page de commande publique et permettent à vos clients de faire des choix éclairés. Des calculatrices automatiques peuvent estimer ces valeurs à partir des ingrédients.", body_style))

story.append(Paragraph("<b>16.4 Profils Allergènes Clients</b>", h2_style))
story.append(Paragraph("Enregistrez les allergies de vos clients réguliers dans leur profil. Lors d'une commande, le système avertit automatiquement si un article commandé contient un allergène à éviter pour ce client. Cette fonctionnalité est particulièrement appréciée des familles et des personnes ayant des restrictions alimentaires.", body_style))

story.append(Paragraph("<b>16.5 Avertissements Automatiques</b>", h2_style))
story.append(Paragraph("Le système affiche automatiquement les allergènes sur la page de commande publique et sur les tickets de cuisine. Configurez des avertissements visuels supplémentaires pour les allergies graves, et formez votre personnel à prendre ces informations en compte lors de la préparation.", body_style))

story.append(PageBreak())

# ==================== MODULE 17: COMPTABILITÉ ====================
story.append(Paragraph("<b>17. Comptabilité</b>", h1_style))

story.append(Paragraph("<b>17.1 Fonctionnalités Comptables</b>", h2_style))
story.append(Paragraph("Le module Comptabilité fournit les outils essentiels pour la gestion financière de votre restaurant. Il intègre automatiquement les données des ventes et des dépenses, permet la saisie d'écritures manuelles, et génère les états financiers nécessaires au pilotage de votre activité.", body_style))

story.append(Paragraph("<b>17.2 Plan Comptable</b>", h2_style))
story.append(Paragraph("Le système intègre un plan comptable adapté aux restaurants. Les comptes sont organisés par classes : comptes de produits (ventes, autres revenus), comptes de charges (achats, personnel, services extérieurs), comptes de trésorerie (caisse, banques), et comptes de tiers (fournisseurs, clients). Personnalisez ce plan selon vos besoins spécifiques.", body_style))

story.append(Paragraph("<b>17.3 Saisie des Écritures</b>", h2_style))
story.append(Paragraph("Les écritures comptables peuvent être générées automatiquement (ventes depuis le POS, dépenses enregistrées) ou saisies manuellement pour les opérations diverses. Chaque écriture comprend un numéro de compte, un libellé, un montant au débit ou au crédit, une date, et une pièce justificative.", body_style))

story.append(Paragraph("<b>17.4 États Financiers</b>", h2_style))
story.append(Paragraph("Générez les états financiers standards : le Compte de Résultat montrant vos produits et charges sur une période, le Bilan présentant votre patrimoine à un instant donné, et la Balance Générale listant les soldes de tous les comptes. Ces documents peuvent être exportés en PDF pour votre comptable ou votre banque.", body_style))

story.append(Paragraph("<b>17.5 Synthèse Fiscale</b>", h2_style))
story.append(Paragraph("Le module calcule automatiquement la TVA collectée sur vos ventes et la TVA déductible sur vos achats. Consultez la synthèse fiscale mensuelle ou trimestrielle pour préparer vos déclarations. Adaptez les taux de TVA selon la réglementation guinéenne en vigueur dans les paramètres du module.", body_style))

story.append(PageBreak())

# ==================== MODULE 18: LIVRAISONS ====================
story.append(Paragraph("<b>18. Gestion des Livraisons</b>", h1_style))

story.append(Paragraph("<b>18.1 Module de Livraison</b>", h2_style))
story.append(Paragraph("Le module Livraisons gère l'ensemble du processus de livraison, de la réception de la commande à sa remise au client. Il coordonne les différents acteurs (préparateurs, drivers) et assure le suivi en temps réel pour une expérience client optimale.", body_style))

story.append(Paragraph("<b>18.2 Création d'une Livraison</b>", h2_style))
story.append(Paragraph("Une livraison est automatiquement créée lorsqu'une commande de type \"livraison\" est validée. Les informations nécessaires sont l'adresse de livraison complète, le nom et téléphone du destinataire, les instructions particulières (étage, code d'entrée, etc.), et le créneau horaire souhaité.", body_style))

story.append(Paragraph("<b>18.3 Assignation des Drivers</b>", h2_style))
story.append(Paragraph("Assignez un driver à chaque livraison en fonction de sa disponibilité et de sa localisation. Le système affiche la liste des drivers disponibles avec leur statut (en ligne, en livraison, en pause). Vous pouvez également activer l'assignation automatique qui attribue les livraisons au driver le plus proche et le plus disponible.", body_style))

story.append(Paragraph("<b>18.4 Suivi des Livraisons</b>", h2_style))

livraison_data = [
    [Paragraph("<b>Statut</b>", header_style), Paragraph("<b>Description</b>", header_style)],
    [Paragraph("En attente", cell_style), Paragraph("Commande reçue, en attente de préparation", cell_style)],
    [Paragraph("En préparation", cell_style), Paragraph("Cuisine prépare la commande", cell_style)],
    [Paragraph("Prête", cell_style), Paragraph("Commande emballée, prête à récupérer", cell_style)],
    [Paragraph("Driver assigné", cell_style), Paragraph("Driver désigné pour la livraison", cell_style)],
    [Paragraph("En transit", cell_style), Paragraph("Driver en route vers le client", cell_style)],
    [Paragraph("Livrée", cell_style), Paragraph("Commande remise au client", cell_style)],
]

livraison_table = Table(livraison_data, colWidths=[4*cm, 11*cm])
livraison_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#F5F5F5')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 10))
story.append(livraison_table)
story.append(Spacer(1, 10))

story.append(Paragraph("<b>18.5 Notifications Client</b>", h2_style))
story.append(Paragraph("Le client reçoit automatiquement des notifications à chaque étape importante : confirmation de commande, début de préparation, driver en route avec lien de suivi en temps réel, et confirmation de livraison. Ces notifications peuvent être envoyées par SMS, WhatsApp, ou email selon les préférences du client.", body_style))

story.append(PageBreak())

# ==================== MODULE 19: DRIVERS ====================
story.append(Paragraph("<b>19. Gestion des Drivers</b>", h1_style))

story.append(Paragraph("<b>19.1 Gestion de l'Équipe de Livraison</b>", h2_style))
story.append(Paragraph("Le module Drivers vous permet de gérer votre flotte de livreurs, qu'ils soient employés ou indépendants. Suivez leur disponibilité, leurs performances, et leurs gains. Une gestion efficace des drivers améliore la qualité de service et optimise vos coûts de livraison.", body_style))

story.append(Paragraph("<b>19.2 Fiche Driver</b>", h2_style))
story.append(Paragraph("Chaque driver dispose d'une fiche avec ses informations personnelles et de contact, son véhicule (moto, vélo, scooter), son statut actuel (disponible, en livraison, hors ligne), sa note moyenne basée sur les évaluations clients, son historique de livraisons, et ses gains cumulés.", body_style))

story.append(Paragraph("<b>19.3 Disponibilité et Planning</b>", h2_style))
story.append(Paragraph("Les drivers peuvent indiquer leur disponibilité via leur application mobile. En tant que gestionnaire, vous pouvez voir quels drivers sont en ligne et prêts à accepter des livraisons. Planifiez les créneaux de présence pour couvrir vos heures de pointe et ajustez en fonction de la demande prévue.", body_style))

story.append(Paragraph("<b>19.4 Performances et Évaluations</b>", h2_style))
story.append(Paragraph("Après chaque livraison, les clients peuvent évaluer le driver sur cinq étoiles et laisser un commentaire. Consultez les statistiques de performance de chaque driver : temps moyen de livraison, taux de réussite, note moyenne, et nombre de réclamations. Utilisez ces données pour identifier les drivers nécessitant un accompagnement ou récompenser les meilleurs performeurs.", body_style))

story.append(Paragraph("<b>19.5 Calcul des Gains</b>", h2_style))
story.append(Paragraph("Le système calcule automatiquement les gains de chaque driver basés sur les paramètres définis : frais de livraison fixes ou pourcentage, primes (heures de pointe, mauvais temps, distance), et pourboires clients. Consultez le récapitulatif des gains par période pour faciliter les règlements.", body_style))

story.append(PageBreak())

# ==================== MODULE 20: ANALYTICS ====================
story.append(Paragraph("<b>20. Analytics et Rapports</b>", h1_style))

story.append(Paragraph("<b>20.1 Module Analytics</b>", h2_style))
story.append(Paragraph("Le module Analytics offre une vue approfondie de vos performances commerciales. Il agrège les données de tous les modules pour fournir des insights actionnables. Utilisez ces analyses pour prendre des décisions stratégiques éclairées et optimiser votre rentabilité.", body_style))

story.append(Paragraph("<b>20.2 Tableaux de Bord Analytiques</b>", h2_style))
story.append(Paragraph("Plusieurs tableaux de bord thématiques sont disponibles. Le tableau de bord des ventes présente l'évolution du chiffre d'affaires par jour, semaine, mois, et les comparaisons avec les périodes précédentes. Le tableau de bord des commandes affiche le volume de commandes, les types de service, et les heures de pointe. Le tableau de bord clientèle analyse l'acquisition et la fidélisation des clients. Enfin, le tableau de bord produits identifie les articles les plus vendus et les moins performants.", body_style))

story.append(Paragraph("<b>20.3 Rapports Personnalisables</b>", h2_style))
story.append(Paragraph("Créez des rapports personnalisés en sélectionnant les métriques souhaitées, la période d'analyse, et les filtres (succursale, catégorie, etc.). Sauvegardez vos configurations de rapport pour les réutiliser facilement. Les rapports peuvent être exportés en PDF, Excel, ou CSV.", body_style))

story.append(Paragraph("<b>20.4 Indicateurs Clés Suivis</b>", h2_style))

analytics_data = [
    [Paragraph("<b>Catégorie</b>", header_style), Paragraph("<b>Indicateurs</b>", header_style)],
    [Paragraph("Ventes", cell_style), Paragraph("CA total, CA par service, CA par jour, évolution", cell_style)],
    [Paragraph("Commandes", cell_style), Paragraph("Nombre, moyenne, taux d'annulation, temps de préparation", cell_style)],
    [Paragraph("Clients", cell_style), Paragraph("Nouveaux clients, clients réguliers, taux de retour, panier moyen", cell_style)],
    [Paragraph("Produits", cell_style), Paragraph("Top ventes, produits à rotation lente, marge par produit", cell_style)],
    [Paragraph("Service", cell_style), Paragraph("Temps d'attente, satisfaction client, réclamations", cell_style)],
    [Paragraph("Livraison", cell_style), Paragraph("Temps de livraison moyen, taux de retard, zone de chalandise", cell_style)],
]

analytics_table = Table(analytics_data, colWidths=[4*cm, 11*cm])
analytics_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#F5F5F5')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 10))
story.append(analytics_table)
story.append(Spacer(1, 10))

story.append(Paragraph("<b>20.5 Planification des Rapports</b>", h2_style))
story.append(Paragraph("Programmez l'envoi automatique de rapports par email à vous-même ou à votre équipe. Par exemple, recevez chaque lundi matin le rapport de la semaine précédente, ou chaque premier du mois le bilan mensuel. Cette automatisation vous fait gagner du temps et assure un suivi régulier des performances.", body_style))

# Build document
doc.build(story)
print("PDF généré avec succès!")
