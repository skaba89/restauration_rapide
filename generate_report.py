from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.lib.units import inch, cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Register fonts
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Create document
doc = SimpleDocTemplate(
    "/home/z/my-project/download/restaurant_os_analysis_report.pdf",
    pagesize=A4,
    title="Restaurant OS - Rapport d'Analyse",
    author='Z.ai',
    creator='Z.ai',
    subject='Analyse complete du projet Restaurant OS SaaS'
)

# Styles
styles = getSampleStyleSheet()

# French styles
title_style = ParagraphStyle(
    name='TitleStyle',
    fontName='Times New Roman',
    fontSize=28,
    leading=34,
    alignment=TA_CENTER,
    spaceAfter=24
)

subtitle_style = ParagraphStyle(
    name='SubtitleStyle',
    fontName='Times New Roman',
    fontSize=16,
    leading=20,
    alignment=TA_CENTER,
    textColor=colors.grey
)

h1_style = ParagraphStyle(
    name='H1Style',
    fontName='Times New Roman',
    fontSize=18,
    leading=24,
    spaceBefore=18,
    spaceAfter=12,
    textColor=colors.HexColor('#1F4E79')
)

h2_style = ParagraphStyle(
    name='H2Style',
    fontName='Times New Roman',
    fontSize=14,
    leading=18,
    spaceBefore=12,
    spaceAfter=8,
    textColor=colors.HexColor('#2E75B6')
)

body_style = ParagraphStyle(
    name='BodyStyle',
    fontName='Times New Roman',
    fontSize=11,
    leading=16,
    alignment=TA_JUSTIFY,
    spaceAfter=8
)

# Table styles
header_style = ParagraphStyle(
    name='TableHeader',
    fontName='Times New Roman',
    fontSize=10,
    textColor=colors.white,
    alignment=TA_CENTER
)

cell_style = ParagraphStyle(
    name='TableCell',
    fontName='Times New Roman',
    fontSize=9,
    alignment=TA_LEFT,
    leading=12
)

story = []

# Cover page
story.append(Spacer(1, 120))
story.append(Paragraph('<b>Restaurant OS SaaS</b>', title_style))
story.append(Spacer(1, 24))
story.append(Paragraph('Rapport d\'Analyse et Recommandations', subtitle_style))
story.append(Spacer(1, 48))
story.append(Paragraph('Africa-First, Global-Ready', subtitle_style))
story.append(Spacer(1, 100))
story.append(Paragraph('Version 1.0 - Mars 2024', ParagraphStyle(
    name='DateStyle',
    fontName='Times New Roman',
    fontSize=12,
    alignment=TA_CENTER
)))
story.append(PageBreak())

# Executive Summary
story.append(Paragraph('<b>Resume Executif</b>', h1_style))
story.append(Paragraph(
    'Restaurant OS est une plateforme SaaS complete de gestion de restaurant, concue avec une approche "Africa-First" '
    'tout en etant prete pour une expansion mondiale. Le projet presente une architecture robuste avec un schema de base '
    'de donnees Prisma comprenant plus de 50 modeles, 16 routes API REST et 11 pages frontend. Cette analyse detaillee '
    'identifie les forces du projet, les zones d\'amelioration et les fonctionnalites a ajouter pour une mise en production '
    'reussie.',
    body_style
))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>Points Cles</b>', h2_style))
story.append(Paragraph(
    'Le projet dispose d\'une base technique solide avec un schema de base de donnees complet, des routes API bien structurees '
    'et une interface utilisateur moderne. Cependant, certaines fonctionnalites necessitent une implementation supplementaire, '
    'notamment les notifications en temps reel, les webhooks de paiement et l\'integration complete des tests. L\'architecture '
    'multi-tenant est en place mais necessite une validation en conditions reelles.',
    body_style
))
story.append(Spacer(1, 18))

# Section 1: Project Overview
story.append(Paragraph('<b>1. Vue d\'Ensemble du Projet</b>', h1_style))

story.append(Paragraph('<b>1.1 Architecture Technique</b>', h2_style))
story.append(Paragraph(
    'Le projet Restaurant OS est construit sur une stack technologique moderne et eprouvee. L\'architecture suit les meilleures '
    'pratiques de developpement web avec une separation claire entre le frontend et le backend. Le framework Next.js 14 avec '
    'App Router offre un rendu cote serveur optimise et une excellente experience developpeur. TypeScript assure la surete du '
    'typage tout au long du codebase, reduisant les erreurs potentielles et ameliorant la maintenabilite.',
    body_style
))
story.append(Spacer(1, 8))

# Tech stack table
tech_data = [
    [Paragraph('<b>Couche</b>', header_style), Paragraph('<b>Technologie</b>', header_style), Paragraph('<b>Version</b>', header_style), Paragraph('<b>Purpose</b>', header_style)],
    [Paragraph('Frontend', cell_style), Paragraph('Next.js + React', cell_style), Paragraph('14.x', cell_style), Paragraph('UI/UX Framework', cell_style)],
    [Paragraph('Styling', cell_style), Paragraph('Tailwind CSS', cell_style), Paragraph('3.x', cell_style), Paragraph('CSS Utility-First', cell_style)],
    [Paragraph('Components', cell_style), Paragraph('shadcn/ui', cell_style), Paragraph('Latest', cell_style), Paragraph('UI Component Library', cell_style)],
    [Paragraph('Backend', cell_style), Paragraph('Next.js API Routes', cell_style), Paragraph('14.x', cell_style), Paragraph('REST API', cell_style)],
    [Paragraph('Database', cell_style), Paragraph('Prisma + SQLite', cell_style), Paragraph('5.x', cell_style), Paragraph('ORM & Database', cell_style)],
    [Paragraph('Charts', cell_style), Paragraph('Recharts', cell_style), Paragraph('2.x', cell_style), Paragraph('Data Visualization', cell_style)],
    [Paragraph('Icons', cell_style), Paragraph('Lucide React', cell_style), Paragraph('Latest', cell_style), Paragraph('Icon Library', cell_style)],
]

tech_table = Table(tech_data, colWidths=[2.5*cm, 4*cm, 2.5*cm, 5*cm])
tech_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 7), (-1, 7), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(tech_table)
story.append(Spacer(1, 6))
story.append(Paragraph('<i>Tableau 1: Stack technologique du projet Restaurant OS</i>', ParagraphStyle(
    name='Caption',
    fontName='Times New Roman',
    fontSize=9,
    alignment=TA_CENTER,
    textColor=colors.grey
)))
story.append(Spacer(1, 18))

# Section 2: Database Analysis
story.append(Paragraph('<b>2. Analyse du Schema de Base de Donnees</b>', h1_style))

story.append(Paragraph('<b>2.1 Modeles Implementes</b>', h2_style))
story.append(Paragraph(
    'Le schema Prisma comprend plus de 50 modeles couvrant tous les aspects de la gestion d\'un restaurant. L\'architecture '
    'multi-tenant est au coeur du systeme avec les modeles Organization et OrganizationUser permettant une isolation complete '
    'des donnees entre les differents clients de la plateforme SaaS. Les modeles couvrent la gestion des utilisateurs, des '
    'restaurants, des menus, des commandes, des reservations, des livraisons, des paiements et des programmes de fidelite.',
    body_style
))
story.append(Spacer(1, 8))

# Models summary table
models_data = [
    [Paragraph('<b>Categorie</b>', header_style), Paragraph('<b>Modeles Principaux</b>', header_style), Paragraph('<b>Statut</b>', header_style)],
    [Paragraph('Authentification', cell_style), Paragraph('User, Session, RefreshToken, OtpCode', cell_style), Paragraph('Implemente', cell_style)],
    [Paragraph('Multi-tenant', cell_style), Paragraph('Organization, OrganizationUser, Brand', cell_style), Paragraph('Implemente', cell_style)],
    [Paragraph('Restaurant', cell_style), Paragraph('Restaurant, RestaurantSettings, RestaurantHour', cell_style), Paragraph('Implemente', cell_style)],
    [Paragraph('Menu', cell_style), Paragraph('Menu, MenuCategory, MenuItem, MenuItemVariant', cell_style), Paragraph('Implemente', cell_style)],
    [Paragraph('Commandes', cell_style), Paragraph('Order, OrderItem, Cart, CartItem', cell_style), Paragraph('Implemente', cell_style)],
    [Paragraph('Reservations', cell_style), Paragraph('Reservation, ReservationTable, WaitlistEntry', cell_style), Paragraph('Implemente', cell_style)],
    [Paragraph('Livraison', cell_style), Paragraph('Delivery, DeliveryZone, DeliveryTrackingEvent', cell_style), Paragraph('Implemente', cell_style)],
    [Paragraph('Drivers', cell_style), Paragraph('Driver, DriverSession, DriverWallet', cell_style), Paragraph('Implemente', cell_style)],
    [Paragraph('Paiements', cell_style), Paragraph('Payment, Currency, Country', cell_style), Paragraph('Partiel', cell_style)],
    [Paragraph('Fidelite', cell_style), Paragraph('CustomerProfile, LoyaltyTransaction', cell_style), Paragraph('Implemente', cell_style)],
    [Paragraph('Tables', cell_style), Paragraph('Table, DiningRoom, QrSession', cell_style), Paragraph('Implemente', cell_style)],
]

models_table = Table(models_data, colWidths=[3.5*cm, 8*cm, 2.5*cm])
models_table.setStyle(TableStyle([
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
    ('BACKGROUND', (0, 9), (-1, 9), colors.white),
    ('BACKGROUND', (0, 10), (-1, 10), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 11), (-1, 11), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(models_table)
story.append(Spacer(1, 6))
story.append(Paragraph('<i>Tableau 2: Categories de modeles Prisma et leur statut d\'implementation</i>', ParagraphStyle(
    name='Caption',
    fontName='Times New Roman',
    fontSize=9,
    alignment=TA_CENTER,
    textColor=colors.grey
)))
story.append(Spacer(1, 18))

# Section 3: API Analysis
story.append(Paragraph('<b>3. Analyse des Routes API</b>', h1_style))

story.append(Paragraph('<b>3.1 Routes Implementees</b>', h2_style))
story.append(Paragraph(
    'L\'API REST compte 16 endpoints couvrant les fonctionnalites essentielles. Chaque route suit les conventions REST avec '
    'les methodes GET, POST, PATCH et DELETE appropriees. Les routes sont bien structurees avec une gestion d\'erreurs '
    'coherente utilisant des helper functions. Un systeme de donnees de demo est integre pour permettre les tests sans '
    'connexion base de donnees, ce qui facilite le developpement et les demonstrations.',
    body_style
))
story.append(Spacer(1, 8))

# API routes table
api_data = [
    [Paragraph('<b>Endpoint</b>', header_style), Paragraph('<b>Methode</b>', header_style), Paragraph('<b>Fonctionnalite</b>', header_style), Paragraph('<b>Statut</b>', header_style)],
    [Paragraph('/api/auth', cell_style), Paragraph('GET/POST/DELETE/PATCH', cell_style), Paragraph('Authentification, Login, Register, OTP', cell_style), Paragraph('Complet', cell_style)],
    [Paragraph('/api/orders', cell_style), Paragraph('GET/POST/PATCH/DELETE', cell_style), Paragraph('CRUD Commandes, workflow statut', cell_style), Paragraph('Complet', cell_style)],
    [Paragraph('/api/menu', cell_style), Paragraph('GET/POST/PATCH/DELETE', cell_style), Paragraph('CRUD Menus, Categories, Articles', cell_style), Paragraph('Complet', cell_style)],
    [Paragraph('/api/reservations', cell_style), Paragraph('GET/POST/PATCH/DELETE', cell_style), Paragraph('CRUD Reservations, disponibilite', cell_style), Paragraph('Complet', cell_style)],
    [Paragraph('/api/deliveries', cell_style), Paragraph('GET/POST/PATCH', cell_style), Paragraph('Livraisons, auto-assign drivers', cell_style), Paragraph('Complet', cell_style)],
    [Paragraph('/api/drivers', cell_style), Paragraph('GET/POST/PATCH/DELETE', cell_style), Paragraph('CRUD Drivers, geolocalisation', cell_style), Paragraph('Complet', cell_style)],
    [Paragraph('/api/payments', cell_style), Paragraph('GET/POST/PATCH', cell_style), Paragraph('Paiements, Mobile Money', cell_style), Paragraph('Mock', cell_style)],
    [Paragraph('/api/customers', cell_style), Paragraph('GET/POST/PATCH', cell_style), Paragraph('Gestion clients, fidelite', cell_style), Paragraph('Complet', cell_style)],
    [Paragraph('/api/analytics', cell_style), Paragraph('GET', cell_style), Paragraph('Tableaux de bord, KPIs', cell_style), Paragraph('Complet', cell_style)],
    [Paragraph('/api/restaurants', cell_style), Paragraph('GET/POST/PATCH/DELETE', cell_style), Paragraph('CRUD Restaurants, horaires', cell_style), Paragraph('Complet', cell_style)],
]

api_table = Table(api_data, colWidths=[3*cm, 3.5*cm, 5.5*cm, 2*cm])
api_table.setStyle(TableStyle([
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
    ('BACKGROUND', (0, 9), (-1, 9), colors.white),
    ('BACKGROUND', (0, 10), (-1, 10), colors.HexColor('#F5F5F5')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))
story.append(api_table)
story.append(Spacer(1, 6))
story.append(Paragraph('<i>Tableau 3: Endpoints API et leur niveau d\'implementation</i>', ParagraphStyle(
    name='Caption',
    fontName='Times New Roman',
    fontSize=9,
    alignment=TA_CENTER,
    textColor=colors.grey
)))
story.append(Spacer(1, 18))

# Section 4: Frontend Analysis
story.append(Paragraph('<b>4. Analyse du Frontend</b>', h1_style))

story.append(Paragraph('<b>4.1 Pages Implementees</b>', h2_style))
story.append(Paragraph(
    'L\'interface utilisateur comprend 11 pages avec un design moderne et responsive utilisant shadcn/ui. Les pages sont '
    'construites avec une approche "mobile-first" et incluent des graphiques interactifs avec Recharts pour la visualisation '
    'des donnees. Le dashboard offre une vue complete des KPIs avec des filtres temporels et des graphiques de ventes. '
    'La page de commandes presente une vue Kanban innovante pour le suivi en temps reel.',
    body_style
))
story.append(Spacer(1, 8))

# Frontend pages table
frontend_data = [
    [Paragraph('<b>Page</b>', header_style), Paragraph('<b>Composants</b>', header_style), Paragraph('<b>Fonctionnalites</b>', header_style), Paragraph('<b>Statut</b>', header_style)],
    [Paragraph('Dashboard', cell_style), Paragraph('KPIs, Charts, Lists', cell_style), Paragraph('Vue temps reel, filtres, top produits', cell_style), Paragraph('Complet', cell_style)],
    [Paragraph('Orders', cell_style), Paragraph('Kanban, List View', cell_style), Paragraph('Workflow statuts, filtres, recherche', cell_style), Paragraph('Complet', cell_style)],
    [Paragraph('Menu', cell_style), Paragraph('Grid, Cards, Dialogs', cell_style), Paragraph('CRUD categories/articles, toggle dispo', cell_style), Paragraph('Complet', cell_style)],
    [Paragraph('Reservations', cell_style), Paragraph('Calendar, Cards, Form', cell_style), Paragraph('Planning, statuts, details', cell_style), Paragraph('Complet', cell_style)],
    [Paragraph('Customers', cell_style), Paragraph('Table, Cards, Dialogs', cell_style), Paragraph('Liste, profil, points fidelite', cell_style), Paragraph('Complet', cell_style)],
    [Paragraph('Drivers', cell_style), Paragraph('Cards, Table, Map', cell_style), Paragraph('Liste, statut, localisation', cell_style), Paragraph('Complet', cell_style)],
    [Paragraph('Deliveries', cell_style), Paragraph('Table, Cards, Tracking', cell_style), Paragraph('Suivi, assignation, statuts', cell_style), Paragraph('Complet', cell_style)],
    [Paragraph('Analytics', cell_style), Paragraph('Charts, KPIs', cell_style), Paragraph('Graphiques ventes, moyens paiement', cell_style), Paragraph('Complet', cell_style)],
    [Paragraph('Settings', cell_style), Paragraph('Forms, Tabs, Switches', cell_style), Paragraph('Config restaurant, paiements', cell_style), Paragraph('UI Only', cell_style)],
]

frontend_table = Table(frontend_data, colWidths=[2.5*cm, 3.5*cm, 5.5*cm, 2.5*cm])
frontend_table.setStyle(TableStyle([
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
    ('BACKGROUND', (0, 9), (-1, 9), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))
story.append(frontend_table)
story.append(Spacer(1, 6))
story.append(Paragraph('<i>Tableau 4: Pages frontend et leur niveau d\'implementation</i>', ParagraphStyle(
    name='Caption',
    fontName='Times New Roman',
    fontSize=9,
    alignment=TA_CENTER,
    textColor=colors.grey
)))
story.append(Spacer(1, 18))

# Section 5: Areas for Improvement
story.append(Paragraph('<b>5. Zones d\'Amelioration</b>', h1_style))

story.append(Paragraph('<b>5.1 Fonctionnalites Critiques Manquantes</b>', h2_style))
story.append(Paragraph(
    'Plusieurs fonctionnalites critiques necessitent une implementation ou une amelioration pour permettre une mise en '
    'production reussie. Ces elements sont classes par ordre de priorite en fonction de leur impact sur les operations '
    'quotidiennes d\'un restaurant. L\'integration des webhooks de paiement et des notifications en temps reel sont '
    'particulierement importantes pour l\'experience utilisateur.',
    body_style
))
story.append(Spacer(1, 8))

# Missing features table
missing_data = [
    [Paragraph('<b>Priorite</b>', header_style), Paragraph('<b>Fonctionnalite</b>', header_style), Paragraph('<b>Description</b>', header_style)],
    [Paragraph('Critique', cell_style), Paragraph('Webhooks Paiement', cell_style), Paragraph('Integration reelle avec Orange Money, MTN, Wave', cell_style)],
    [Paragraph('Critique', cell_style), Paragraph('Notifications Temps Reel', cell_style), Paragraph('WebSockets pour nouvelles commandes, livraisons', cell_style)],
    [Paragraph('Haute', cell_style), Paragraph('Authentification Production', cell_style), Paragraph('Remplacer demo mode par vraie auth', cell_style)],
    [Paragraph('Haute', cell_style), Paragraph('Tests Unitaires', cell_style), Paragraph('Couverture tests API et composants', cell_style)],
    [Paragraph('Haute', cell_style), Paragraph('Validation Donnees', cell_style), Paragraph('Zod schemas pour validation cote serveur', cell_style)],
    [Paragraph('Moyenne', cell_style), Paragraph('Internationalisation', cell_style), Paragraph('i18n pour FR/EN/PT complet', cell_style)],
    [Paragraph('Moyenne', cell_style), Paragraph('Logs et Monitoring', cell_style), Paragraph('Integration Sentry/DataDog', cell_style)],
    [Paragraph('Moyenne', cell_style), Paragraph('Email/SMS Templates', cell_style), Paragraph('Notifications clients automatiques', cell_style)],
]

missing_table = Table(missing_data, colWidths=[2.5*cm, 4*cm, 7.5*cm])
missing_table.setStyle(TableStyle([
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
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))
story.append(missing_table)
story.append(Spacer(1, 6))
story.append(Paragraph('<i>Tableau 5: Fonctionnalites manquantes classees par priorite</i>', ParagraphStyle(
    name='Caption',
    fontName='Times New Roman',
    fontSize=9,
    alignment=TA_CENTER,
    textColor=colors.grey
)))
story.append(Spacer(1, 18))

# Section 6: Features to Add
story.append(Paragraph('<b>6. Fonctionnalites a Ajouter</b>', h1_style))

story.append(Paragraph('<b>6.1 Fonctionnalites Recommandees</b>', h2_style))
story.append(Paragraph(
    'Au-dela des corrections et ameliorations necessaires, plusieurs fonctionnalites pourraient considerablement ameliorer '
    'la valeur du produit. Ces additions sont proposees en tenant compte des specificites du marche africain et des '
    'besoins des restaurateurs. L\'implementation de ces fonctionnalites pourrait etre planifiee sur plusieurs sprints.',
    body_style
))
story.append(Spacer(1, 8))

# Recommended features table
features_data = [
    [Paragraph('<b>Fonctionnalite</b>', header_style), Paragraph('<b>Valeur</b>', header_style), Paragraph('<b>Complexite</b>', header_style)],
    [Paragraph('Application Mobile (PWA)', cell_style), Paragraph('Haute - Accessibilite clients', cell_style), Paragraph('Moyenne', cell_style)],
    [Paragraph('Systeme POS Tablet', cell_style), Paragraph('Haute - Operations restaurant', cell_style), Paragraph('Haute', cell_style)],
    [Paragraph('QR Code Menu Digital', cell_style), Paragraph('Moyenne - Experience client', cell_style), Paragraph('Basse', cell_style)],
    [Paragraph('Gestion Inventaire', cell_style), Paragraph('Haute - Controle couts', cell_style), Paragraph('Moyenne', cell_style)],
    [Paragraph('Comptabilite Integree', cell_style), Paragraph('Moyenne - Gestion financiere', cell_style), Paragraph('Haute', cell_style)],
    [Paragraph('Multi-langues Admin', cell_style), Paragraph('Moyenne - Internationalisation', cell_style), Paragraph('Basse', cell_style)],
    [Paragraph('API Publique', cell_style), Paragraph('Moyenne - Integrations tierces', cell_style), Paragraph('Moyenne', cell_style)],
    [Paragraph('Dashboard Super Admin', cell_style), Paragraph('Haute - Gestion SaaS', cell_style), Paragraph('Moyenne', cell_style)],
    [Paragraph('Mode Hors Ligne', cell_style), Paragraph('Haute - Zones faible connexion', cell_style), Paragraph('Haute', cell_style)],
]

features_table = Table(features_data, colWidths=[4.5*cm, 5.5*cm, 4*cm])
features_table.setStyle(TableStyle([
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
    ('BACKGROUND', (0, 9), (-1, 9), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))
story.append(features_table)
story.append(Spacer(1, 6))
story.append(Paragraph('<i>Tableau 6: Fonctionnalites recommandees pour enrichir le produit</i>', ParagraphStyle(
    name='Caption',
    fontName='Times New Roman',
    fontSize=9,
    alignment=TA_CENTER,
    textColor=colors.grey
)))
story.append(Spacer(1, 18))

# Section 7: Africa-Specific Features
story.append(Paragraph('<b>7. Fonctionnalites Africa-First</b>', h1_style))
story.append(Paragraph(
    'Le projet integre deja plusieurs fonctionnalites specifiques au marche africain qui le differencient des solutions '
    'internationales. Ces elements constituent un avantage competitif important et meritent d\'etre renforces. L\'integration '
    'des moyens de paiement Mobile Money et le support multilingue avec le francais comme langue principale sont particulierement '
    'pertinents pour le marche cible.',
    body_style
))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>7.1 Moyens de Paiement Supportes</b>', h2_style))
story.append(Paragraph(
    'Le systeme supporte les principaux fournisseurs Mobile Money africains: Orange Money (Cote d\'Ivoire, Senegal, Mali, '
    'Burkina Faso), MTN MoMo (Cote d\'Ivoire, Benin, Togo, Guinee), Wave (Cote d\'Ivoire, Senegal), M-Pesa (Kenya, RDC, '
    'Congo, Mozambique). Cette couverture permet de servir efficacement la majorite des marches ouest et centre-africains. '
    'L\'integration avec Moov Money complete l\'offre pour les pays comme le Benin, le Togo et le Niger.',
    body_style
))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>7.2 Pays et Devises Supportes</b>', h2_style))
story.append(Paragraph(
    'Le projet supporte 20 pays africains avec leurs devises locales: XOF (Franc CFA UEMOA), XAF (Franc CFA CEMAC), '
    'GNF (Franc Guineen), KES (Shilling Kenyan), NGN (Naira Nigerian), GHS (Cedi Ghanen). Le support de ces devises '
    'permet une facturation adaptee a chaque marche sans conversion fastidieuse. Les taux de change peuvent etre '
    'configures dynamiquement pour s\'adapter aux fluctuations.',
    body_style
))
story.append(Spacer(1, 18))

# Section 8: Technical Debt
story.append(Paragraph('<b>8. Dette Technique</b>', h1_style))
story.append(Paragraph(
    'L\'analyse du code revele plusieurs zones de dette technique qui devraient etre adressees avant la mise en production. '
    'Ces elements ne bloquent pas le fonctionnement mais peuvent impacter la maintenabilite et la performance a long terme. '
    'Un plan de remediation progressif est recommande pour les traiter sans interrompre le developpement de nouvelles '
    'fonctionnalites.',
    body_style
))
story.append(Spacer(1, 12))

# Technical debt items
story.append(Paragraph('<b>8.1 Points Identifies</b>', h2_style))
debt_items = [
    'Donnees de demo en dur dans les routes API - A remplacer par une vraie connexion DB',
    'Mode demo actif par defaut - Necessite une configuration production',
    'Absence de tests unitaires et d\'integration - Couverture 0%',
    'Validation cote client uniquement - Ajouter validation serveur avec Zod',
    'Erreur TypeScript ignorees dans certains fichiers - Strict mode recommande',
    'Composants UI non connectes aux API dans Settings - Implementation partielle',
    'Gestion d\'erreurs basique - Ameliorer avec logging structure',
]
for item in debt_items:
    story.append(Paragraph(f'- {item}', body_style))
story.append(Spacer(1, 18))

# Section 9: Recommendations
story.append(Paragraph('<b>9. Recommandations</b>', h1_style))
story.append(Paragraph(
    'Sur la base de cette analyse, les recommandations suivantes sont formulees pour permettre une mise en production '
    'reussie du projet Restaurant OS. Ces recommandations sont classees par phase pour faciliter la planification '
    'et permettre une progression iterative vers un produit complet et robuste.',
    body_style
))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>Phase 1 - Fondations (2-4 semaines)</b>', h2_style))
story.append(Paragraph(
    'La premiere phase doit se concentrer sur les elements critiques de production. Il est essentiel de configurer '
    'une base de donnees PostgreSQL pour remplacer SQLite, implementer l\'authentification NextAuth ou equivalente, '
    'et ajouter les tests unitaires de base. La validation des donnees cote serveur avec Zod est egalement prioritaire '
    'pour securiser les endpoints API.',
    body_style
))
story.append(Spacer(1, 8))

story.append(Paragraph('<b>Phase 2 - Fonctionnalites (4-6 semaines)</b>', h2_style))
story.append(Paragraph(
    'La seconde phase vise a completer les fonctionnalites principales. L\'integration des webhooks de paiement avec '
    'les providers Mobile Money est essentielle. Les notifications temps reel via WebSockets permettront une experience '
    'utilisateur fluide. L\'implementation du systeme de roles et permissions completera l\'architecture multi-tenant.',
    body_style
))
story.append(Spacer(1, 8))

story.append(Paragraph('<b>Phase 3 - Production (2-3 semaines)</b>', h2_style))
story.append(Paragraph(
    'La phase finale prepare le deploiement en production. La configuration CI/CD avec GitHub Actions, l\'integration '
    'd\'un systeme de monitoring comme Sentry, et la mise en place de la documentation API avec Swagger permettront '
    'une maintenance efficace. Les tests end-to-end avec Playwright completeront la couverture de tests.',
    body_style
))
story.append(Spacer(1, 18))

# Section 10: Conclusion
story.append(Paragraph('<b>10. Conclusion</b>', h1_style))
story.append(Paragraph(
    'Restaurant OS est un projet prometteur avec une architecture solide et une vision claire du marche africain. '
    'Le schema de base de donnees complet, les API bien structurees et l\'interface utilisateur moderne constituent '
    'une excellente fondation. Cependant, plusieurs elements doivent etre adresses avant une mise en production, '
    'notamment l\'integration des paiements reels, les notifications temps reel et les tests.',
    body_style
))
story.append(Spacer(1, 8))
story.append(Paragraph(
    'L\'approche "Africa-First" avec le support des moyens de paiement Mobile Money, les devises locales et les '
    '20 pays africains represente un avantage competitif significatif. En suivant les recommandations formulees, '
    'le projet peut evoluer vers une solution SaaS competitive et adaptee aux besoins specifiques du marche '
    'africain de la restauration.',
    body_style
))
story.append(Spacer(1, 24))

# Summary stats
story.append(Paragraph('<b>Statistiques du Projet</b>', h2_style))
stats_data = [
    [Paragraph('<b>Metric</b>', header_style), Paragraph('<b>Valeur</b>', header_style)],
    [Paragraph('Modeles Prisma', cell_style), Paragraph('50+ modeles', cell_style)],
    [Paragraph('Routes API', cell_style), Paragraph('16 endpoints', cell_style)],
    [Paragraph('Pages Frontend', cell_style), Paragraph('11 pages', cell_style)],
    [Paragraph('Pays Africains', cell_style), Paragraph('20 pays', cell_style)],
    [Paragraph('Devises', cell_style), Paragraph('6 devises', cell_style)],
    [Paragraph('Mobile Money Providers', cell_style), Paragraph('5+ providers', cell_style)],
    [Paragraph('Couverture Tests', cell_style), Paragraph('0% (a implementer)', cell_style)],
    [Paragraph('Statut Global', cell_style), Paragraph('MVP - Pret pour demo', cell_style)],
]

stats_table = Table(stats_data, colWidths=[5*cm, 5*cm])
stats_table.setStyle(TableStyle([
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
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(stats_table)
story.append(Spacer(1, 6))
story.append(Paragraph('<i>Tableau 7: Resume des statistiques du projet</i>', ParagraphStyle(
    name='Caption',
    fontName='Times New Roman',
    fontSize=9,
    alignment=TA_CENTER,
    textColor=colors.grey
)))

# Build PDF
doc.build(story)
print("PDF generated successfully!")
