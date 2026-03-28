from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.units import cm, inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
import os

# Register fonts
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Document setup
doc = SimpleDocTemplate(
    "/home/z/my-project/download/Guide_Deploiement_Vercel_Supabase.pdf",
    pagesize=A4,
    rightMargin=2*cm,
    leftMargin=2*cm,
    topMargin=2*cm,
    bottomMargin=2*cm,
    title="Guide_Deploiement_Vercel_Supabase",
    author='Z.ai',
    creator='Z.ai',
    subject='Guide de déploiement Restaurant OS sur Vercel + Supabase'
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
story.append(Spacer(1, 80))
story.append(Paragraph("<b>Restaurant OS SaaS</b>", title_style))
story.append(Spacer(1, 20))
story.append(Paragraph("<b>Guide de Deploiement</b>", ParagraphStyle(
    name='SubTitle',
    fontName='Times New Roman',
    fontSize=18,
    leading=24,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#2E75B6')
)))
story.append(Spacer(1, 20))
story.append(Paragraph("Vercel + Supabase - 100% Gratuit", ParagraphStyle(
    name='SubTitle2',
    fontName='Times New Roman',
    fontSize=14,
    leading=18,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#666666')
)))
story.append(Spacer(1, 40))

# Architecture overview
arch_data = [
    [Paragraph('<b>Composant</b>', header_style), Paragraph('<b>Service</b>', header_style), Paragraph('<b>Cout</b>', header_style)],
    [Paragraph('Frontend Next.js', cell_style), Paragraph('Vercel', cell_style), Paragraph('Gratuit', cell_style)],
    [Paragraph('Base de donnees', cell_style), Paragraph('Supabase PostgreSQL', cell_style), Paragraph('Gratuit (500MB)', cell_style)],
    [Paragraph('Temps reel', cell_style), Paragraph('Supabase Realtime', cell_style), Paragraph('Inclus', cell_style)],
    [Paragraph('Stockage fichiers', cell_style), Paragraph('Supabase Storage', cell_style), Paragraph('5GB gratuit', cell_style)],
    [Paragraph('HTTPS/SSL', cell_style), Paragraph('Automatique', cell_style), Paragraph('Gratuit', cell_style)],
]

arch_table = Table(arch_data, colWidths=[4*cm, 5*cm, 3*cm])
arch_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(arch_table)

story.append(PageBreak())

# Step 1: Supabase Setup
story.append(Paragraph("<b>Etape 1 : Creer un projet Supabase</b>", heading1_style))
story.append(Spacer(1, 10))

story.append(Paragraph("1. Rendez-vous sur <b>https://supabase.com</b> et creez un compte gratuit", body_style))
story.append(Paragraph("2. Cliquez sur <b>New Project</b> pour creer un nouveau projet", body_style))
story.append(Paragraph("3. Remplissez les informations suivantes :", body_style))
story.append(Paragraph("   - <b>Name</b> : restaurant-os-prod", body_style))
story.append(Paragraph("   - <b>Database Password</b> : Choisissez un mot de passe fort", body_style))
story.append(Paragraph("   - <b>Region</b> : Choisissez la region la plus proche de vos utilisateurs", body_style))
story.append(Paragraph("4. Attendez que le projet soit cree (environ 2 minutes)", body_style))
story.append(Spacer(1, 15))

story.append(Paragraph("<b>Recuperer les identifiants de connexion</b>", heading2_style))
story.append(Paragraph("Allez dans <b>Settings > Database</b> et notez les informations suivantes :", body_style))

cred_data = [
    [Paragraph('<b>Variable</b>', header_style), Paragraph('<b>Description</b>', header_style)],
    [Paragraph('DATABASE_URL', cell_style), Paragraph('Connection string (Transaction mode, port 6543)', cell_style)],
    [Paragraph('DATABASE_URL_DIRECT', cell_style), Paragraph('Connection string (Session mode, port 5432)', cell_style)],
]

cred_table = Table(cred_data, colWidths=[4*cm, 9*cm])
cred_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
]))
story.append(Spacer(1, 10))
story.append(cred_table)
story.append(Spacer(1, 10))

story.append(Paragraph("Allez dans <b>Settings > API</b> et notez :", body_style))
story.append(Paragraph("   - <b>Project URL</b> : NEXT_PUBLIC_SUPABASE_URL", body_style))
story.append(Paragraph("   - <b>anon public</b> : NEXT_PUBLIC_SUPABASE_ANON_KEY", body_style))
story.append(Paragraph("   - <b>service_role</b> : SUPABASE_SERVICE_ROLE_KEY (secret!)", body_style))

# Step 2: Vercel Setup
story.append(Spacer(1, 20))
story.append(Paragraph("<b>Etape 2 : Configurer Vercel</b>", heading1_style))
story.append(Spacer(1, 10))

story.append(Paragraph("1. Rendez-vous sur <b>https://vercel.com</b> et connectez-vous avec GitHub", body_style))
story.append(Paragraph("2. Cliquez sur <b>Add New > Project</b>", body_style))
story.append(Paragraph("3. Importez votre repository GitHub contenant Restaurant OS", body_style))
story.append(Paragraph("4. Configurez les variables d'environnement dans <b>Environment Variables</b>", body_style))

env_data = [
    [Paragraph('<b>Variable</b>', header_style), Paragraph('<b>Valeur</b>', header_style)],
    [Paragraph('DATABASE_URL', cell_style), Paragraph('postgresql://postgres.[REF]:[PWD]@...pooler.supabase.com:6543/postgres?pgbouncer=true', cell_style)],
    [Paragraph('DATABASE_URL_DIRECT', cell_style), Paragraph('postgresql://postgres.[REF]:[PWD]@...pooler.supabase.com:5432/postgres', cell_style)],
    [Paragraph('NEXT_PUBLIC_SUPABASE_URL', cell_style), Paragraph('https://[REF].supabase.co', cell_style)],
    [Paragraph('NEXT_PUBLIC_SUPABASE_ANON_KEY', cell_style), Paragraph('eyJhbGciOiJIUzI1NiIsInR5cCI6...', cell_style)],
    [Paragraph('NEXTAUTH_SECRET', cell_style), Paragraph('Generer avec: openssl rand -base64 32', cell_style)],
    [Paragraph('NEXTAUTH_URL', cell_style), Paragraph('https://votre-app.vercel.app', cell_style)],
]

env_table = Table(env_data, colWidths=[5*cm, 8*cm])
env_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
]))
story.append(Spacer(1, 10))
story.append(env_table)

story.append(PageBreak())

# Step 3: Database Migration
story.append(Paragraph("<b>Etape 3 : Migrer la base de donnees</b>", heading1_style))
story.append(Spacer(1, 10))

story.append(Paragraph("Avant de deployer, il faut migrer le schema SQLite vers PostgreSQL :", body_style))
story.append(Spacer(1, 10))

story.append(Paragraph("<b>3.1 Remplacer le schema Prisma</b>", heading2_style))
story.append(Paragraph("Le fichier <b>prisma/schema.production.prisma</b> contient le schema PostgreSQL.", body_style))
story.append(Paragraph("Copiez ce fichier pour remplacer le schema SQLite :", body_style))
story.append(Spacer(1, 6))

code1 = "cp prisma/schema.production.prisma prisma/schema.prisma"
story.append(Paragraph(code1, code_style))
story.append(Spacer(1, 10))

story.append(Paragraph("<b>3.2 Generer et appliquer les migrations</b>", heading2_style))
story.append(Paragraph("Executez ces commandes localement avec les variables Supabase configurees :", body_style))
story.append(Spacer(1, 6))

commands = [
    "# Installer les dependances",
    "npm install",
    "",
    "# Generer le client Prisma",
    "npx prisma generate",
    "",
    "# Creer les tables dans Supabase",
    "npx prisma db push",
    "",
    "# (Optionnel) Seeder les donnees de demo",
    "npx prisma db seed"
]

for cmd in commands:
    story.append(Paragraph(cmd, code_style))

story.append(Spacer(1, 15))

# Step 4: Deploy
story.append(Paragraph("<b>Etape 4 : Deployer sur Vercel</b>", heading1_style))
story.append(Spacer(1, 10))

story.append(Paragraph("1. Poussez votre code sur GitHub", body_style))
story.append(Paragraph("2. Vercel detectera automatiquement les changements et relancera le build", body_style))
story.append(Paragraph("3. Verifiez les logs de build dans l'onglet <b>Deployments</b>", body_style))
story.append(Paragraph("4. Une fois le build termine, votre app est accessible sur l'URL Vercel", body_style))
story.append(Spacer(1, 15))

story.append(Paragraph("<b>Configuration du build Vercel</b>", heading2_style))
story.append(Paragraph("Le fichier <b>vercel.json</b> configure automatiquement :", body_style))
story.append(Paragraph("- Build command: prisma generate && next build", body_style))
story.append(Paragraph("- Fonctions API avec duree max de 30 secondes", body_style))
story.append(Paragraph("- Headers de securite (CSP, XSS Protection)", body_style))
story.append(Paragraph("- Cache optimise pour les assets statiques", body_style))

story.append(PageBreak())

# Step 5: Post-deployment
story.append(Paragraph("<b>Etape 5 : Configuration post-deploiement</b>", heading1_style))
story.append(Spacer(1, 10))

story.append(Paragraph("<b>5.1 Configurer un domaine personnalise</b>", heading2_style))
story.append(Paragraph("1. Dans Vercel, allez dans <b>Settings > Domains</b>", body_style))
story.append(Paragraph("2. Ajoutez votre domaine (ex: restaurant-monapp.com)", body_style))
story.append(Paragraph("3. Configurez les DNS selon les instructions Vercel", body_style))
story.append(Paragraph("4. Le certificat SSL est genere automatiquement", body_style))
story.append(Spacer(1, 10))

story.append(Paragraph("<b>5.2 Activer les webhooks Supabase (optionnel)</b>", heading2_style))
story.append(Paragraph("Pour synchroniser les evenements temps reel :", body_style))
story.append(Paragraph("1. Dans Supabase, allez dans <b>Database > Webhooks</b>", body_style))
story.append(Paragraph("2. Creez un webhook pour les tables importantes (orders, deliveries)", body_style))
story.append(Paragraph("3. URL: https://votre-app.vercel.app/api/webhooks/supabase", body_style))
story.append(Spacer(1, 10))

story.append(Paragraph("<b>5.3 Configurer les methodes de paiement</b>", heading2_style))
story.append(Paragraph("Pour activer Mobile Money en production :", body_style))

payment_data = [
    [Paragraph('<b>Provider</b>', header_style), Paragraph('<b>Variables requises</b>', header_style)],
    [Paragraph('Orange Money', cell_style), Paragraph('ORANGE_MONEY_API_KEY, ORANGE_MONEY_MERCHANT_ID', cell_style)],
    [Paragraph('MTN MoMo', cell_style), Paragraph('MTN_MOMO_API_KEY, MTN_MOMO_SUBSCRIPTION_KEY', cell_style)],
    [Paragraph('Wave', cell_style), Paragraph('WAVE_API_KEY, WAVE_WEBHOOK_SECRET', cell_style)],
    [Paragraph('M-Pesa', cell_style), Paragraph('MPESA_CONSUMER_KEY, MPESA_PASSKEY', cell_style)],
]

payment_table = Table(payment_data, colWidths=[3*cm, 10*cm])
payment_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
]))
story.append(Spacer(1, 10))
story.append(payment_table)

story.append(PageBreak())

# Troubleshooting
story.append(Paragraph("<b>Resolution des problemes courants</b>", heading1_style))
story.append(Spacer(1, 10))

issues_data = [
    [Paragraph('<b>Probleme</b>', header_style), Paragraph('<b>Solution</b>', header_style)],
    [Paragraph('Erreur de connexion DB', cell_style), Paragraph('Verifier DATABASE_URL et DATABASE_URL_DIRECT dans Vercel', cell_style)],
    [Paragraph('Build qui echoue', cell_style), Paragraph('Verifier que prisma generate est dans buildCommand', cell_style)],
    [Paragraph('PWA ne fonctionne pas', cell_style), Paragraph('Verifier que HTTPS est actif (automatique sur Vercel)', cell_style)],
    [Paragraph('WebSocket deconnecte', cell_style), Paragraph('Utiliser Supabase Realtime comme alternative', cell_style)],
    [Paragraph('Images ne chargent pas', cell_style), Paragraph('Configurer les domaines dans next.config.ts', cell_style)],
]

issues_table = Table(issues_data, colWidths=[4*cm, 9*cm])
issues_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
]))
story.append(issues_table)

story.append(Spacer(1, 20))

# Checklist
story.append(Paragraph("<b>Checklist de deploiement</b>", heading1_style))
story.append(Spacer(1, 10))

checklist = [
    "[ ] Compte Supabase cree et projet configure",
    "[ ] Variables DATABASE_URL configurees dans Vercel",
    "[ ] Schema PostgreSQL applique (prisma db push)",
    "[ ] Donnees de seed importees (optionnel)",
    "[ ] Build Vercel reussi",
    "[ ] Application accessible sur URL Vercel",
    "[ ] Authentification fonctionnelle",
    "[ ] PWA installe sur mobile",
    "[ ] Domaine personnalise configure (optionnel)",
    "[ ] Webhooks Supabase configures (optionnel)",
    "[ ] Methodes de paiement activees (optionnel)",
]

for item in checklist:
    story.append(Paragraph(item, body_style))

# Build
doc.build(story)
print("PDF created successfully!")
