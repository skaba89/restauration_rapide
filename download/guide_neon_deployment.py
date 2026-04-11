from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Register fonts
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Document setup
doc = SimpleDocTemplate(
    "/home/z/my-project/download/Guide_Deploiement_NEON_Vercel.pdf",
    pagesize=A4,
    rightMargin=2*cm,
    leftMargin=2*cm,
    topMargin=2*cm,
    bottomMargin=2*cm,
    title="Guide_Deploiement_NEON_Vercel",
    author='Z.ai',
    creator='Z.ai',
    subject='Guide de deploiement Restaurant OS avec NEON PostgreSQL'
)

# Styles
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    name='TitleStyle',
    fontName='Times New Roman',
    fontSize=24,
    leading=30,
    alignment=TA_CENTER,
    spaceAfter=20,
    textColor=colors.HexColor('#1F4E79')
)

heading1_style = ParagraphStyle(
    name='Heading1Style',
    fontName='Times New Roman',
    fontSize=18,
    leading=24,
    alignment=TA_LEFT,
    spaceBefore=20,
    spaceAfter=10,
    textColor=colors.HexColor('#1F4E79')
)

heading2_style = ParagraphStyle(
    name='Heading2Style',
    fontName='Times New Roman',
    fontSize=14,
    leading=18,
    alignment=TA_LEFT,
    spaceBefore=15,
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

code_style = ParagraphStyle(
    name='CodeStyle',
    fontName='Times New Roman',
    fontSize=9,
    leading=12,
    alignment=TA_LEFT,
    leftIndent=20,
    spaceAfter=6,
    backColor=colors.HexColor('#F5F5F5')
)

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
    fontSize=10,
    textColor=colors.black,
    alignment=TA_LEFT
)

story = []

# Title Page
story.append(Spacer(1, 60))
story.append(Paragraph("<b>Restaurant OS SaaS</b>", title_style))
story.append(Spacer(1, 20))
story.append(Paragraph("<b>Deploiement Vercel + NEON</b>", ParagraphStyle(
    name='SubTitle',
    fontName='Times New Roman',
    fontSize=18,
    leading=24,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#2E75B6')
)))
story.append(Spacer(1, 20))
story.append(Paragraph("PostgreSQL Serverless 100% Gratuit", ParagraphStyle(
    name='SubTitle2',
    fontName='Times New Roman',
    fontSize=14,
    leading=18,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#666666')
)))
story.append(Spacer(1, 40))

# Architecture Table
arch_data = [
    [Paragraph('<b>Composant</b>', header_style), Paragraph('<b>Service</b>', header_style), Paragraph('<b>Gratuit</b>', header_style), Paragraph('<b>Limite</b>', header_style)],
    [Paragraph('Frontend Next.js', cell_style), Paragraph('Vercel', cell_style), Paragraph('Oui', cell_style), Paragraph('Illimite', cell_style)],
    [Paragraph('Base de donnees', cell_style), Paragraph('NEON PostgreSQL', cell_style), Paragraph('Oui', cell_style), Paragraph('0.5 GB', cell_style)],
    [Paragraph('Temps reel', cell_style), Paragraph('Pusher', cell_style), Paragraph('Oui', cell_style), Paragraph('200k msg/jour', cell_style)],
    [Paragraph('Stockage images', cell_style), Paragraph('Cloudinary', cell_style), Paragraph('Oui', cell_style), Paragraph('25 GB', cell_style)],
    [Paragraph('Emails', cell_style), Paragraph('Resend', cell_style), Paragraph('Oui', cell_style), Paragraph('3000/mois', cell_style)],
]

arch_table = Table(arch_data, colWidths=[3.5*cm, 3.5*cm, 2*cm, 3*cm])
arch_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
]))
story.append(arch_table)

story.append(PageBreak())

# Why NEON
story.append(Paragraph("<b>Pourquoi NEON ?</b>", heading1_style))
story.append(Spacer(1, 10))

story.append(Paragraph("NEON est la meilleure alternative gratuite a Supabase pour PostgreSQL pour les raisons suivantes :", body_style))
story.append(Spacer(1, 10))

reasons_data = [
    [Paragraph('<b>Avantage</b>', header_style), Paragraph('<b>Description</b>', header_style)],
    [Paragraph('Serverless', cell_style), Paragraph('Pas de serveur a gerer, scaling automatique selon la demande', cell_style)],
    [Paragraph('Auto-suspend', cell_style), Paragraph('Suspend automatiquement apres 5 min d\'inactivite pour economiser les ressources', cell_style)],
    [Paragraph('Branches', cell_style), Paragraph('Creer des branches de base de donnees pour les tests (comme Git)', cell_style)],
    [Paragraph('Connection Pooling', cell_style), Paragraph('Inclus nativement avec PgBouncer, ideal pour serverless', cell_style)],
    [Paragraph('PostgreSQL pur', cell_style), Paragraph('100% compatible PostgreSQL standard, pas de lock-in', cell_style)],
    [Paragraph('Pas de limite de temps', cell_style), Paragraph('Contrairement a Render qui expire apres 90 jours', cell_style)],
    [Paragraph('Pas de credit limite', cell_style), Paragraph('Contrairement a Railway qui donne $5/mois seulement', cell_style)],
    [Paragraph('Integration Vercel', cell_style), Paragraph('Integration native dans le dashboard Vercel', cell_style)],
]

reasons_table = Table(reasons_data, colWidths=[4*cm, 9*cm])
reasons_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
]))
story.append(reasons_table)

story.append(PageBreak())

# Step 1: Create NEON Project
story.append(Paragraph("<b>Etape 1 : Creer un projet NEON</b>", heading1_style))
story.append(Spacer(1, 10))

story.append(Paragraph("1. Rendez-vous sur <b>https://console.neon.tech</b>", body_style))
story.append(Paragraph("2. Creez un compte gratuit (GitHub, Google ou email)", body_style))
story.append(Paragraph("3. Cliquez sur <b>Create a project</b>", body_style))
story.append(Paragraph("4. Configurez le projet :", body_style))
story.append(Paragraph("   - <b>Project name</b> : restaurant-os", body_style))
story.append(Paragraph("   - <b>Region</b> : Choisissez AWS eu-central-1 (Frankfurt) pour l'Afrique de l'Ouest", body_style))
story.append(Paragraph("   - <b>PostgreSQL version</b> : 16 (derniere version)", body_style))
story.append(Paragraph("5. Cliquez sur <b>Create project</b>", body_style))
story.append(Spacer(1, 15))

story.append(Paragraph("<b>Recuperer les identifiants</b>", heading2_style))
story.append(Paragraph("Apres la creation, NEON affiche les identifiants de connexion. Notez :", body_style))
story.append(Spacer(1, 6))

story.append(Paragraph("DATABASE_URL (Connection pooling - pour Vercel)", code_style))
story.append(Paragraph("postgresql://[user]:[password]@[endpoint].eu-central-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true", code_style))
story.append(Spacer(1, 6))
story.append(Paragraph("DATABASE_URL_DIRECT (Pour migrations)", code_style))
story.append(Paragraph("postgresql://[user]:[password]@[endpoint].eu-central-1.aws.neon.tech/neondb?sslmode=require", code_style))

story.append(Spacer(1, 20))

# Step 2: Configure Pusher
story.append(Paragraph("<b>Etape 2 : Configurer Pusher (Temps reel)</b>", heading1_style))
story.append(Spacer(1, 10))

story.append(Paragraph("NEON n'a pas de temps reel integre comme Supabase. Utilisez Pusher :", body_style))
story.append(Spacer(1, 10))

story.append(Paragraph("1. Rendez-vous sur <b>https://pusher.com</b>", body_style))
story.append(Paragraph("2. Creez un compte gratuit", body_style))
story.append(Paragraph("3. Creez une nouvelle app Channels", body_style))
story.append(Paragraph("4. Notez les identifiants :", body_style))
story.append(Paragraph("   - <b>App ID</b> : NEXT_PUBLIC_PUSHER_APP_ID", body_style))
story.append(Paragraph("   - <b>Key</b> : NEXT_PUBLIC_PUSHER_KEY", body_style))
story.append(Paragraph("   - <b>Secret</b> : NEXT_PUBLIC_PUSHER_SECRET", body_style))
story.append(Paragraph("   - <b>Cluster</b> : NEXT_PUBLIC_PUSHER_CLUSTER (ex: eu)", body_style))

story.append(PageBreak())

# Step 3: Configure Cloudinary
story.append(Paragraph("<b>Etape 3 : Configurer Cloudinary (Stockage images)</b>", heading1_style))
story.append(Spacer(1, 10))

story.append(Paragraph("1. Rendez-vous sur <b>https://cloudinary.com</b>", body_style))
story.append(Paragraph("2. Creez un compte gratuit", body_style))
story.append(Paragraph("3. Allez dans Dashboard", body_style))
story.append(Paragraph("4. Notez :", body_style))
story.append(Paragraph("   - <b>Cloud name</b> : NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", body_style))
story.append(Paragraph("   - <b>API Key</b> : CLOUDINARY_API_KEY", body_style))
story.append(Paragraph("   - <b>API Secret</b> : CLOUDINARY_API_SECRET", body_style))
story.append(Spacer(1, 20))

# Step 4: Vercel Deployment
story.append(Paragraph("<b>Etape 4 : Deployer sur Vercel</b>", heading1_style))
story.append(Spacer(1, 10))

story.append(Paragraph("1. Rendez-vous sur <b>https://vercel.com</b>", body_style))
story.append(Paragraph("2. Importez votre repository GitHub", body_style))
story.append(Paragraph("3. Configurez les variables d'environnement :", body_style))
story.append(Spacer(1, 10))

env_data = [
    [Paragraph('<b>Variable</b>', header_style), Paragraph('<b>Valeur</b>', header_style)],
    [Paragraph('DATABASE_URL', cell_style), Paragraph('postgresql://...neon.tech/neondb?pgbouncer=true', cell_style)],
    [Paragraph('DATABASE_URL_DIRECT', cell_style), Paragraph('postgresql://...neon.tech/neondb', cell_style)],
    [Paragraph('NEXT_PUBLIC_PUSHER_KEY', cell_style), Paragraph('Votre Pusher key', cell_style)],
    [Paragraph('NEXT_PUBLIC_PUSHER_SECRET', cell_style), Paragraph('Votre Pusher secret', cell_style)],
    [Paragraph('NEXT_PUBLIC_PUSHER_CLUSTER', cell_style), Paragraph('eu', cell_style)],
    [Paragraph('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', cell_style), Paragraph('Votre cloud name', cell_style)],
    [Paragraph('CLOUDINARY_API_KEY', cell_style), Paragraph('Votre API key', cell_style)],
    [Paragraph('CLOUDINARY_API_SECRET', cell_style), Paragraph('Votre API secret', cell_style)],
    [Paragraph('NEXTAUTH_SECRET', cell_style), Paragraph('openssl rand -base64 32', cell_style)],
    [Paragraph('NEXTAUTH_URL', cell_style), Paragraph('https://votre-app.vercel.app', cell_style)],
]

env_table = Table(env_data, colWidths=[5*cm, 7*cm])
env_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
]))
story.append(env_table)

story.append(PageBreak())

# Step 5: Database Migration
story.append(Paragraph("<b>Etape 5 : Migrer la base de donnees</b>", heading1_style))
story.append(Spacer(1, 10))

story.append(Paragraph("Avant le deploiement, appliquez le schema PostgreSQL :", body_style))
story.append(Spacer(1, 10))

migrations = [
    "# 1. Copier le schema PostgreSQL",
    "cp prisma/schema.production.prisma prisma/schema.prisma",
    "",
    "# 2. Configurer .env avec les identifiants NEON",
    "",
    "# 3. Generer le client Prisma",
    "npx prisma generate",
    "",
    "# 4. Pousser le schema vers NEON",
    "npx prisma db push",
    "",
    "# 5. (Optionnel) Seeder les donnees de demo",
    "npx prisma db seed"
]

for cmd in migrations:
    story.append(Paragraph(cmd, code_style))

story.append(Spacer(1, 20))

# Checklist
story.append(Paragraph("<b>Checklist de deploiement</b>", heading1_style))
story.append(Spacer(1, 10))

checklist = [
    "[ ] Compte NEON cree et projet configure",
    "[ ] Connection strings recuperees",
    "[ ] Compte Pusher cree et app configuree",
    "[ ] Compte Cloudinary cree",
    "[ ] Variables d'environnement configurees dans Vercel",
    "[ ] Schema PostgreSQL applique (prisma db push)",
    "[ ] Build Vercel reussi",
    "[ ] Application accessible sur URL Vercel",
    "[ ] Authentification fonctionnelle",
    "[ ] Temps reel (Pusher) fonctionnel",
]

for item in checklist:
    story.append(Paragraph(item, body_style))

# Build
doc.build(story)
print("PDF created successfully!")
