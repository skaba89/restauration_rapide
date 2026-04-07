from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Register fonts
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))

registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Create document
doc = SimpleDocTemplate(
    "/home/z/my-project/download/Guide_Societes_Finances_KFM_Delice.pdf",
    pagesize=A4,
    title="Guide Societes et Finances KFM Delice",
    author='Z.ai',
    creator='Z.ai',
    subject='Guide complet de gestion des societes et suivi financier pour KFM DELICE',
    rightMargin=2*cm,
    leftMargin=2*cm,
    topMargin=2*cm,
    bottomMargin=2*cm
)

# Styles
styles = getSampleStyleSheet()

cover_title_style = ParagraphStyle(
    name='CoverTitle',
    fontName='SimHei',
    fontSize=32,
    leading=40,
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
story.append(Paragraph("Guide de Gestion", cover_subtitle_style))
story.append(Paragraph("Societes et Finances", cover_subtitle_style))
story.append(Spacer(1, 60))
story.append(Paragraph("Suivi des Depenses et Recettes", cover_info_style))
story.append(Paragraph("Administration Multi-Tenants", cover_info_style))
story.append(Spacer(1, 40))
story.append(Paragraph("Version 1.0 - Avril 2026", cover_info_style))
story.append(Paragraph("Conakry, Guinee", cover_info_style))
story.append(PageBreak())

# ==================== TABLE OF CONTENTS ====================
story.append(Paragraph("<b>Table des Matieres</b>", h1_style))
story.append(Spacer(1, 20))

toc_items = [
    ("PARTIE 1 : GESTION DES SOCIETES", ""),
    ("1. Presentation du Systeme Multi-Tenants", "Page 3"),
    ("2. Creation d'une Societe", "Page 4"),
    ("3. Configuration des Parametres", "Page 5"),
    ("4. Gestion des Succursales", "Page 6"),
    ("5. Administration des Utilisateurs", "Page 7"),
    ("", ""),
    ("PARTIE 2 : SUIVI DES DEPENSES", ""),
    ("6. Module Depenses", "Page 8"),
    ("7. Categories de Depenses", "Page 9"),
    ("8. Depenses Recurrentes", "Page 10"),
    ("9. Workflow de Validation", "Page 11"),
    ("", ""),
    ("PARTIE 3 : SUIVI DES RECETTES", ""),
    ("10. Tableau de Bord Financier", "Page 12"),
    ("11. Rapports de Ventes", "Page 13"),
    ("12. Analyse des Revenus", "Page 14"),
    ("", ""),
    ("PARTIE 4 : COMPTABILITE", ""),
    ("13. Module Comptabilite", "Page 15"),
    ("14. Plan Comptable", "Page 16"),
    ("15. Exports Fiscaux", "Page 17"),
]

toc_data = []
for item, page in toc_items:
    if item == "":
        toc_data.append([Paragraph("", cell_style), Paragraph("", cell_style)])
    elif page == "":
        toc_data.append([Paragraph(f"<b>{item}</b>", cell_style), Paragraph("", cell_style)])
    else:
        toc_data.append([Paragraph(item, cell_style), Paragraph(page, cell_center_style)])

toc_table = Table(toc_data, colWidths=[14*cm, 3*cm])
toc_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0, colors.white),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 10),
    ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(toc_table)
story.append(PageBreak())

# ==================== PARTIE 1 : GESTION DES SOCIETES ====================
story.append(Paragraph("<b>PARTIE 1 : GESTION DES SOCIETES</b>", h1_style))
story.append(Spacer(1, 20))

# Section 1
story.append(Paragraph("<b>1. Presentation du Systeme Multi-Tenants</b>", h2_style))

story.append(Paragraph("<b>1.1 Architecture du Systeme</b>", h3_style))
story.append(Paragraph("Le systeme KFM DELICE est construit sur une architecture multi-tenants qui permet de gerer plusieurs societes (organisations) independantes depuis une seule plateforme. Chaque societe dispose de ses propres donnees isolees, y compris ses restaurants, son personnel, ses commandes, ses stocks et sa comptabilite. Cette architecture est particulierement adaptee aux chaines de restaurants, aux franchises et aux gestionnaires de multiples etablissements.", body_style))

story.append(Paragraph("<b>1.2 Niveaux d'Organisation</b>", h3_style))
story.append(Paragraph("Le systeme s'organise selon trois niveaux hierarchiques. Au premier niveau, l'Organisation represente la societe mere qui peut regrouper plusieurs marques ou concepts. Au deuxieme niveau, le Restaurant correspond a un etablissement physique avec son propre espace de vente. Au troisieme niveau, la Succursale permet de gerer differents points de vente au sein d'un meme restaurant. Cette structure flexible s'adapte aussi bien aux restaurants independants qu'aux grandes chaines.", body_style))

story.append(Paragraph("<b>1.3 Isolation des Donnees</b>", h3_style))
story.append(Paragraph("Chaque organisation beneficie d'une isolation complete de ses donnees. Les utilisateurs appartenant a une organisation ne peuvent acceder qu'aux donnees de celle-ci, garantissant ainsi la confidentialite et la securite. L'administrateur de la plateforme peut toutefois acceder a toutes les organisations pour des operations de maintenance ou de support technique.", body_style))

story.append(PageBreak())

# Section 2
story.append(Paragraph("<b>2. Creation d'une Societe</b>", h2_style))

story.append(Paragraph("<b>2.1 Acces a la Creation</b>", h3_style))
story.append(Paragraph("La creation d'une nouvelle societe s'effectue depuis l'interface d'administration. Accedez au menu Parametres puis cliquez sur l'onglet Sites ou directement via l'API d'administration. Cette fonctionnalite est reservee aux utilisateurs disposant du role Administrateur ou Super Admin. Un assistant de creation guide l'utilisateur a travers les differentes etapes de configuration.", body_style))

story.append(Paragraph("<b>2.2 Informations Requises</b>", h3_style))
story.append(Paragraph("Pour creer une nouvelle societe, plusieurs informations sont obligatoires. Le nom legal de la societe doit correspondre a l'appellation officielle utilisee dans les documents administratifs. L'URL unique (slug) sera utilisee pour l'acces au restaurant en ligne et doit etre choisie avec soin car elle ne peut etre modifiee ulterieurement. Les coordonnees comprennent le numero de telephone principal et l'adresse email de contact. L'adresse complete inclut le numero, la rue, le quartier, la ville et le pays. Le numero d'identification fiscale est indispensable pour la generation des factures conformes a la legislation guineenne.", body_style))

story.append(Paragraph("<b>2.3 Configuration Initiale</b>", h3_style))

config_data = [
    [Paragraph("<b>Parametre</b>", header_style), Paragraph("<b>Description</b>", header_style), Paragraph("<b>Valeur par Defaut</b>", header_style)],
    [Paragraph("Devise", cell_style), Paragraph("Monnaie principale de la societe", cell_style), Paragraph("GNF (Franc Guineen)", cell_style)],
    [Paragraph("Langue", cell_style), Paragraph("Langue de l'interface", cell_style), Paragraph("Francais", cell_style)],
    [Paragraph("Fuseau horaire", cell_style), Paragraph("Zone horaire pour les horodatages", cell_style), Paragraph("Africa/Conakry", cell_style)],
    [Paragraph("Montant minimum commande", cell_style), Paragraph("Seuil minimal pour les commandes", cell_style), Paragraph("0 GNF", cell_style)],
    [Paragraph("Rayon livraison", cell_style), Paragraph("Distance max de livraison en km", cell_style), Paragraph("10 km", cell_style)],
    [Paragraph("Frais livraison defaut", cell_style), Paragraph("Frais de livraison standards", cell_style), Paragraph("500 GNF", cell_style)],
    [Paragraph("Temps preparation", cell_style), Paragraph("Duree moyenne de preparation", cell_style), Paragraph("15 minutes", cell_style)],
]

config_table = Table(config_data, colWidths=[5*cm, 6.5*cm, 4.5*cm])
config_table.setStyle(TableStyle([
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
story.append(config_table)
story.append(Spacer(1, 10))

story.append(PageBreak())

# Section 3
story.append(Paragraph("<b>3. Configuration des Parametres</b>", h2_style))

story.append(Paragraph("<b>3.1 Parametres Generaux</b>", h3_style))
story.append(Paragraph("L'onglet Parametres Generaux permet de configurer l'identite de votre societe. Telechargez le logo qui apparaitra sur tous les documents (tickets, factures, page de commande). Renseignez les horaires d'ouverture pour chaque jour de la semaine, avec possibilite de definir des fermetures exceptionnelles. Configurez les informations legales incluant le numero de registre du commerce, le numero fiscal et les mentions obligatoires qui apparaitront en bas des factures.", body_style))

story.append(Paragraph("<b>3.2 Moyens de Paiement</b>", h3_style))
story.append(Paragraph("La section Moyens de Paiement vous permet d'activer les methodes de paiement acceptees par votre etablissement. En Guinee, les options disponibles incluent Orange Money, MTN MoMo, Wave, Cellcom Money pour les paiements mobiles, les especes, et les paiements par carte bancaire via terminal de paiement electronique. Pour chaque moyen de paiement mobile, vous pouvez configurer le numero marchand et les parametres specifiques.", body_style))

payment_data = [
    [Paragraph("<b>Moyen</b>", header_style), Paragraph("<b>Configuration Requise</b>", header_style), Paragraph("<b>Frais Standard</b>", header_style)],
    [Paragraph("Orange Money", cell_style), Paragraph("Numero marchand, Code OTP", cell_style), Paragraph("1.5% - 2%", cell_style)],
    [Paragraph("MTN MoMo", cell_style), Paragraph("Compte marchand, API Key", cell_style), Paragraph("1.5% - 2%", cell_style)],
    [Paragraph("Wave", cell_style), Paragraph("Compte Wave Business", cell_style), Paragraph("1%", cell_style)],
    [Paragraph("Especes", cell_style), Paragraph("Aucune", cell_style), Paragraph("Gratuit", cell_style)],
    [Paragraph("Carte Bancaire", cell_style), Paragraph("Terminal TPE, Contrat banque", cell_style), Paragraph("2.5% - 3.5%", cell_style)],
]

payment_table = Table(payment_data, colWidths=[4*cm, 7*cm, 5*cm])
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

story.append(Paragraph("<b>3.3 Parametres de Livraison</b>", h3_style))
story.append(Paragraph("Configurez les options de livraison selon votre modele operationnel. Activez ou desactivez la livraison interne avec vos propres drivers. Definissez le rayon de livraison en kilometres a partir de votre localisation. Configurez les frais de livraison avec possibilite de frais differencies selon les zones geographiques. Parametrez le temps de preparation moyen pour afficher des estimations realistes aux clients lors de leurs commandes.", body_style))

story.append(PageBreak())

# Section 4
story.append(Paragraph("<b>4. Gestion des Succursales</b>", h2_style))

story.append(Paragraph("<b>4.1 Ajout d'une Succursale</b>", h3_style))
story.append(Paragraph("Pour creer une nouvelle succursale, accedez a Parametres puis Sites. Cliquez sur le bouton Ajouter un site et remplissez le formulaire avec les informations de l'etablissement. Chaque succursale dispose de son propre nom commercial, de ses coordonnees, de ses horaires specifiques et de son equipe. Une fois creee, la succursale devient accessible via le selecteur de site en haut de l'interface.", body_style))

story.append(Paragraph("<b>4.2 Transferts Inter-Succursales</b>", h3_style))
story.append(Paragraph("Le systeme permet d'effectuer des transferts de stocks entre les differentes succursales d'une meme organisation. Pour realiser un transfert, accedez au module Stocks puis cliquez sur Transfert. Selectionnez la succursale source et la succursale destination. Choisissez les articles a transferer avec leurs quantites. Le systeme met a jour automatiquement les stocks des deux sites et genere un bon de transfert pour la traabilite.", body_style))

story.append(Paragraph("<b>4.3 Rapports par Succursale</b>", h3_style))
story.append(Paragraph("Les rapports peuvent etre filtres par succursale pour analyser les performances de chaque site individuellement. Le tableau de bord Analytics permet de comparer les chiffre d'affaires, les volumes de commandes et les indicateurs de performance entre les differents sites. Cette vue comparative aide a identifier les sites les plus performants et ceux necessitant des actions correctives.", body_style))

story.append(PageBreak())

# Section 5
story.append(Paragraph("<b>5. Administration des Utilisateurs</b>", h2_style))

story.append(Paragraph("<b>5.1 Roles et Permissions</b>", h3_style))
story.append(Paragraph("Le systeme implemente un modele de roles et permissions granulaire pour controler l'acces aux differentes fonctionnalites. Chaque utilisateur se voit attribuer un role qui definit ses droits d'acces. Les roles disponibles sont hierarchises et leurs permissions peuvent etre personnalisees selon les besoins specifiques de votre organisation.", body_style))

roles_data = [
    [Paragraph("<b>Role</b>", header_style), Paragraph("<b>Acces Principal</b>", header_style), Paragraph("<b>Restrictions</b>", header_style)],
    [Paragraph("Super Admin", cell_style), Paragraph("Plateforme complete, toutes organisations", cell_style), Paragraph("Aucune", cell_style)],
    [Paragraph("Admin Organisation", cell_style), Paragraph("Complete sur son organisation", cell_style), Paragraph("Pas d'acces autres org.", cell_style)],
    [Paragraph("Manager", cell_style), Paragraph("Operations, personnel, rapports", cell_style), Paragraph("Pas de parametres systeme", cell_style)],
    [Paragraph("Caissier", cell_style), Paragraph("POS, encaissement", cell_style), Paragraph("Pas d'acces rapports sensibles", cell_style)],
    [Paragraph("Serveur", cell_style), Paragraph("Prise de commandes, tables", cell_style), Paragraph("Acces limite operations", cell_style)],
    [Paragraph("Cuisinier", cell_style), Paragraph("Ecran cuisine, statuts commandes", cell_style), Paragraph("Pas d'acces financier", cell_style)],
    [Paragraph("Driver", cell_style), Paragraph("Application livraison, ses courses", cell_style), Paragraph("Donnees propres uniquement", cell_style)],
]

roles_table = Table(roles_data, colWidths=[4*cm, 6*cm, 5*cm])
roles_table.setStyle(TableStyle([
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
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 10))
story.append(roles_table)
story.append(Spacer(1, 10))

story.append(Paragraph("<b>5.2 Ajout d'un Utilisateur</b>", h3_style))
story.append(Paragraph("Pour ajouter un nouvel utilisateur, accedez au module Personnel puis cliquez sur Nouvel Employe. Remplissez les informations personnelles, definissez son role et attribuez-lui une succursale principale. L'utilisateur recevra un email d'invitation avec ses identifiants de connexion. Vous pouvez egalement definir des permissions specifiques qui viendront completer ou restreindre celles du role attribue.", body_style))

story.append(PageBreak())

# ==================== PARTIE 2 : SUIVI DES DEPENSES ====================
story.append(Paragraph("<b>PARTIE 2 : SUIVI DES DEPENSES</b>", h1_style))
story.append(Spacer(1, 20))

# Section 6
story.append(Paragraph("<b>6. Module Depenses</b>", h2_style))

story.append(Paragraph("<b>6.1 Acces au Module</b>", h3_style))
story.append(Paragraph("Le module Depenses est accessible depuis le menu lateral en cliquant sur Depenses. L'interface principale affiche la liste de toutes les depenses enregistrees avec possibilite de filtrer par periode, categorie, statut et succursale. En haut de page, vous trouverez les indicateurs cles : total du jour, total de la semaine, total du mois et montant en attente de paiement.", body_style))

story.append(Paragraph("<b>6.2 Enregistrement d'une Depense</b>", h3_style))
story.append(Paragraph("Pour enregistrer une nouvelle depense, cliquez sur le bouton Nouvelle Depense. Un formulaire apparaitra vous permettant de saisir les informations suivantes. La categorie permet de classer la depense parmi les types predefinis (Fournitures, Factures, Loyer, Salaires, Maintenance, Marketing, Autres). La description doit etre suffisamment detaillee pour faciliter les recherches ulterieures. Le montant en GNF est obligatoire. La date de la depense peut etre anterieure si vous effectuez un rattrapage. Le mode de paiement precise comment la depense a ete reglee. Le fournisseur optionnel permet de lier la depense a un tiers. Les notes et justificatifs peuvent etre ajoutes pour completer la documentation.", body_style))

story.append(Paragraph("<b>6.3 Statuts des Depenses</b>", h3_style))

status_data = [
    [Paragraph("<b>Statut</b>", header_style), Paragraph("<b>Description</b>", header_style), Paragraph("<b>Action Suivante</b>", header_style)],
    [Paragraph("En attente", cell_style), Paragraph("Depense enregistree mais non validee", cell_style), Paragraph("Approuver ou rejeter", cell_style)],
    [Paragraph("Approuvee", cell_style), Paragraph("Validee par un responsable", cell_style), Paragraph("Marquer comme payee", cell_style)],
    [Paragraph("Payee", cell_style), Paragraph("Reglement effectue", cell_style), Paragraph("Aucune, archivee", cell_style)],
    [Paragraph("Annulee", cell_style), Paragraph("Depense annulee", cell_style), Paragraph("Aucune, archivee", cell_style)],
]

status_table = Table(status_data, colWidths=[4*cm, 6*cm, 5*cm])
status_table.setStyle(TableStyle([
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
story.append(status_table)
story.append(Spacer(1, 10))

story.append(PageBreak())

# Section 7
story.append(Paragraph("<b>7. Categories de Depenses</b>", h2_style))

story.append(Paragraph("<b>7.1 Categories Predefinies</b>", h3_style))
story.append(Paragraph("Le systeme inclut sept categories predefinies adaptees a la gestion d'un restaurant. La categorie Fournitures regroupe les achats de matieres premieres, ingredients et consommables. Les Factures incluent l'electricite, l'eau, internet et telephone. Le Loyer couvre les frais de location des locaux. Les Salaires comprennent les remunerations du personnel et les charges sociales. La Maintenance regroupe les reparations et entretiens des equipements. Le Marketing inclut les depenses publicitaires et promotionnelles. La categorie Autres accueille les depenses non classees.", body_style))

story.append(Paragraph("<b>7.2 Configuration des Budgets</b>", h3_style))
story.append(Paragraph("Pour chaque categorie, vous pouvez definir un budget mensuel. Ce budget permet de suivre vos depenses par rapport a vos previsions et d'alerter en cas de depassement. Dans l'onglet Categories du module Depenses, cliquez sur le crayon a cote de chaque categorie pour definir son budget mensuel. Le systeme affichera ensuite la progression des depenses par rapport au budget avec une barre visuelle et un pourcentage.", body_style))

cat_data = [
    [Paragraph("<b>Categorie</b>", header_style), Paragraph("<b>Exemples de Depenses</b>", header_style), Paragraph("<b>Budget Mensuel Type</b>", header_style)],
    [Paragraph("Fournitures", cell_style), Paragraph("Ingredients, emballages, produits menagers", cell_style), Paragraph("3,000,000 - 8,000,000 GNF", cell_style)],
    [Paragraph("Factures", cell_style), Paragraph("Electricite (EDG), eau (SEG), internet", cell_style), Paragraph("500,000 - 1,500,000 GNF", cell_style)],
    [Paragraph("Loyer", cell_style), Paragraph("Location locaux, charges copropriete", cell_style), Paragraph("2,000,000 - 10,000,000 GNF", cell_style)],
    [Paragraph("Salaires", cell_style), Paragraph("Remunerations, charges, primes", cell_style), Paragraph("5,000,000 - 15,000,000 GNF", cell_style)],
    [Paragraph("Maintenance", cell_style), Paragraph("Reparations equipements, entretien", cell_style), Paragraph("200,000 - 500,000 GNF", cell_style)],
    [Paragraph("Marketing", cell_style), Paragraph("Publicite, reseaux sociaux, impressions", cell_style), Paragraph("100,000 - 500,000 GNF", cell_style)],
]

cat_table = Table(cat_data, colWidths=[4*cm, 6*cm, 5*cm])
cat_table.setStyle(TableStyle([
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
story.append(cat_table)
story.append(Spacer(1, 10))

story.append(PageBreak())

# Section 8
story.append(Paragraph("<b>8. Depenses Recurrentes</b>", h2_style))

story.append(Paragraph("<b>8.1 Configuration</b>", h3_style))
story.append(Paragraph("Les depenses recurrentes permettent d'automatiser l'enregistrement des charges fixes mensuelles. Accedez a l'onglet Recurrentes du module Depenses pour configurer ces paiements automatiques. Pour chaque depense recurrente, indiquez la categorie, la description, le montant fixe, le jour du mois de prelevement et le mode de paiement. Le systeme generera automatiquement une nouvelle depense a chaque echeance.", body_style))

story.append(Paragraph("<b>8.2 Exemples de Depenses Recurrentes</b>", h3_style))
story.append(Paragraph("Les depenses recurrentes les plus courantes dans un restaurant incluent le loyer mensuel, les abonnements internet et telephone, les assurances, les frais bancaires, les abonnements logiciels et services, et les charges de copropriete. Configurer ces depenses comme recurrentes vous fait gagner du temps et assure qu'aucune charge fixe n'est oubliee dans votre comptabilite.", body_style))

story.append(Paragraph("<b>8.3 Gestion des Modifications</b>", h3_style))
story.append(Paragraph("Si le montant d'une depense recurrente change, vous pouvez modifier la configuration a tout moment. Les nouvelles depenses generees utiliseront le montant mis a jour. Vous pouvez egalement mettre en pause une depense recurrente sans la supprimer, ce qui est utile en cas de changement temporaire de situation.", body_style))

story.append(PageBreak())

# Section 9
story.append(Paragraph("<b>9. Workflow de Validation</b>", h2_style))

story.append(Paragraph("<b>9.1 Processus d'Approbation</b>", h3_style))
story.append(Paragraph("Le systeme implemente un workflow de validation optionnel pour controler les depenses. Lorsqu'il est active, chaque nouvelle depense est creee avec le statut En attente. Un utilisateur avec les droits d'approbateur doit alors valider la depense avant qu'elle ne passe au statut Approuvee. Enfin, le reglement effectif de la depense la fait passer au statut Payee. Ce processus permet un controle rigoureux des debours et evite les paiements non autorises.", body_style))

story.append(Paragraph("<b>9.2 Roles dans le Workflow</b>", h3_style))
story.append(Paragraph("Le workflow de validation implique differents roles. Les employes peuvent creer des depenses avec le statut En attente. Les managers peuvent approuver ou rejeter les depenses de leur equipe. Les administrateurs peuvent valider les depenses depassant certains seuils et acceder a l'historique complet. La separation des taches entre creation, approbation et paiement renforce le controle interne.", body_style))

story.append(Paragraph("<b>9.3 Export des Donnees</b>", h3_style))
story.append(Paragraph("Les donnees de depenses peuvent etre exportees au format CSV pour integration dans votre logiciel comptable. Cliquez sur le bouton Export CSV en haut de la liste des depenses. Vous pouvez filtrer les donnees avant export pour ne telecharger que la periode ou les categories souhaitees. Le fichier CSV genere est compatible avec Excel, QuickBooks, Sage et la plupart des logiciels comptables utilises en Guinee.", body_style))

story.append(PageBreak())

# ==================== PARTIE 3 : SUIVI DES RECETTES ====================
story.append(Paragraph("<b>PARTIE 3 : SUIVI DES RECETTES</b>", h1_style))
story.append(Spacer(1, 20))

# Section 10
story.append(Paragraph("<b>10. Tableau de Bord Financier</b>", h2_style))

story.append(Paragraph("<b>10.1 Indicateurs Cles</b>", h3_style))
story.append(Paragraph("Le tableau de bord principal affiche les indicateurs financiers essentiels en temps reel. Le chiffre d'affaires represente le total des ventes realisees sur la periode selectionnee. Le nombre de commandes indique le volume d'activite. Le nombre de clients mesures l'affluence. Le panier moyen calcule le montant moyen depense par client. Ces indicateurs peuvent etre consultes pour le jour en cours, la semaine ou le mois, permettant un suivi rapproche des performances.", body_style))

story.append(Paragraph("<b>10.2 Graphiques de Ventes</b>", h3_style))
story.append(Paragraph("Les graphiques de ventes visualisent l'evolution de votre chiffre d'affaires dans le temps. Le graphique hebdomadaire montre les ventes par jour de la semaine, permettant d'identifier les jours forts et faibles. Le graphique mensuel affiche la tendance sur plusieurs semaines. Ces visualisations aident a planifier les approvisionnements, le personnel et les promotions en fonction des cycles d'activite.", body_style))

story.append(Paragraph("<b>10.3 Repartition par Moyen de Paiement</b>", h3_style))
story.append(Paragraph("Le tableau de bord affiche egalement la repartition des paiements par methode. Cette information est precieuse pour anticiper vos besoins en liquide, vos flux vers les comptes mobile money, et vos reconciliations bancaires. Vous pouvez voir le pourcentage et le montant total pour chaque moyen de paiement : Orange Money, MTN MoMo, Wave, especes et carte bancaire.", body_style))

story.append(PageBreak())

# Section 11
story.append(Paragraph("<b>11. Rapports de Ventes</b>", h2_style))

story.append(Paragraph("<b>11.1 Rapport Journalier</b>", h3_style))
story.append(Paragraph("Le rapport journalier fournit un resume complet de l'activite du jour. Il comprend le chiffre d'affaires total, le nombre de commandes par type (sur place, a emporter, livraison), le detail des paiements recus, les articles les plus vendus, et les annulations si applicable. Ce rapport peut etre genere automatiquement et envoye par email a la fermeture de chaque journee.", body_style))

story.append(Paragraph("<b>11.2 Rapport Hebdomadaire</b>", h3_style))
story.append(Paragraph("Le rapport hebdomadaire permet une analyse sur une periode plus longue. Il met en evidence les tendances de frequentation, l'evolution du panier moyen, la performance comparée des differents jours, et l'efficacite des operations. Les managers peuvent utiliser ce rapport pour ajuster les horaires du personnel et les stocks en prevision de la semaine suivante.", body_style))

story.append(Paragraph("<b>11.3 Rapport Mensuel</b>", h3_style))
story.append(Paragraph("Le rapport mensuel est destine a la direction et a la comptabilite. Il presente les totaux consolides du mois, la comparaison avec les mois precedents, l'analyse des ecarts par rapport aux objectifs, et les indicateurs de performance cles. Ce rapport sert de base pour les reunions de performance et les decisions strategiques.", body_style))

story.append(PageBreak())

# Section 12
story.append(Paragraph("<b>12. Analyse des Revenus</b>", h2_style))

story.append(Paragraph("<b>12.1 Analyse par Article</b>", h3_style))
story.append(Paragraph("L'analyse par article identifie vos produits les plus performants. Consultez le classement des articles par chiffre d'affaires et par quantite vendue. Identifiez les articles a forte marge et ceux qui generent du volume. Detectez les articles en rotation lente qui peuvent necessiter une action promotionnelle ou un retrait du menu. Cette analyse guide vos decisions d'approvisionnement et de menu engineering.", body_style))

story.append(Paragraph("<b>12.2 Analyse par Creneau Horaire</b>", h3_style))
story.append(Paragraph("L'analyse par creneau horaire revele les periodes de forte et de faible activite dans la journee. Visualisez le nombre de commandes et le chiffre d'affaires par heure. Identifiez les heures de pointe qui necessitent un renforcement du personnel. Detectez les creux ou des promotions pourraient stimuler l'activite. Ces informations sont essentielles pour l'optimisation des plannings.", body_style))

story.append(Paragraph("<b>12.3 Analyse par Client</b>", h3_style))
story.append(Paragraph("L'analyse par client segmente votre clientele selon son comportement d'achat. Identifiez vos clients VIP, ceux qui generent le plus de chiffre d'affaires. Suivez la frequence de visite et le taux de fidelite. Mesurez l'efficacite de votre programme de fidelite. Ces informations permettent de personnaliser vos actions marketing et d'ameliorer la retention client.", body_style))

story.append(PageBreak())

# ==================== PARTIE 4 : COMPTABILITE ====================
story.append(Paragraph("<b>PARTIE 4 : COMPTABILITE</b>", h1_style))
story.append(Spacer(1, 20))

# Section 13
story.append(Paragraph("<b>13. Module Comptabilite</b>", h2_style))

story.append(Paragraph("<b>13.1 Fonctionnalites</b>", h3_style))
story.append(Paragraph("Le module Comptabilite integre les donnees de ventes et de depenses pour fournir une vue financiere complete de votre activite. Il permet de generer automatiquement les principaux etats financiers, de suivre les flux de tresorerie, et de preparer les declarations fiscales. L'interface est concue pour etre accessible aux non-comptables tout en fournissant les informations necessaires aux professionnels.", body_style))

story.append(Paragraph("<b>13.2 Compte de Resultat</b>", h3_style))
story.append(Paragraph("Le compte de resultat presente les produits et les charges sur une periode donnee. Les produits comprennent le chiffre d'affaires des ventes, les pourboires perçus et les autres revenus. Les charges reprennent les depenses categorisees du module Depenses. Le resultat net est calcule automatiquement comme la difference entre les produits et les charges. Ce document peut etre exporte pour votre expert-comptable.", body_style))

story.append(Paragraph("<b>13.3 Bilan Simplifie</b>", h3_style))
story.append(Paragraph("Le bilan simplifie presente la situation patrimoniale de votre entreprise. L'actif comprend la tresorerie disponible, les creances clients et les stocks. Le passif reprend les dettes fournisseurs et les autres engagements. Les capitaux propres representent la valeur nette de l'entreprise. Ce document donne une vue instantanee de la sante financiere de votre restaurant.", body_style))

story.append(PageBreak())

# Section 14
story.append(Paragraph("<b>14. Plan Comptable</b>", h2_style))

story.append(Paragraph("<b>14.1 Structure</b>", h3_style))
story.append(Paragraph("Le systeme intègre un plan comptable adapte au secteur de la restauration et conforme aux normes comptables ouest-africaines. Les comptes sont organises selon les classes traditionnelles. La classe 1 regroupe les comptes de capitaux. La classe 2 contient les comptes d'immobilisations. La classe 3 concerne les stocks. La classe 4 regroupe les comptes de tiers. La classe 5 contient les comptes de tresorerie. Les classes 6 et 7 concernent respectivement les charges et les produits.", body_style))

story.append(Paragraph("<b>14.2 Mapping Automatique</b>", h3_style))
story.append(Paragraph("Le systeme effectue automatiquement le mapping des operations vers les comptes comptables appropries. Les ventes sont ventilees vers les comptes de produits selon leur nature. Les depenses sont classees selon la categorie choisie. Les paiements sont associes aux comptes de tresorerie correspondants. Ce mapping peut etre personnalise selon votre plan comptable specifique.", body_style))

story.append(Paragraph("<b>14.3 Comptes Specifiques Restaurant</b>", h3_style))

compte_data = [
    [Paragraph("<b>Code</b>", header_style), Paragraph("<b>Intitule</b>", header_style), Paragraph("<b>Utilisation</b>", header_style)],
    [Paragraph("701", cell_style), Paragraph("Ventes de produits finis", cell_style), Paragraph("Chiffre d'affaires plats prepares", cell_style)],
    [Paragraph("706", cell_style), Paragraph("Prestations de services", cell_style), Paragraph("Service table, livraison", cell_style)],
    [Paragraph("601", cell_style), Paragraph("Achats stockes", cell_style), Paragraph("Ingredients, matieres premieres", cell_style)],
    [Paragraph("606", cell_style), Paragraph("Achats non stockes", cell_style), Paragraph("Eau, electricite, consommables", cell_style)],
    [Paragraph("641", cell_style), Paragraph("Remuneration du personnel", cell_style), Paragraph("Salaires et charges sociales", cell_style)],
    [Paragraph("613", cell_style), Paragraph("Locations", cell_style), Paragraph("Loyer et charges locatives", cell_style)],
]

compte_table = Table(compte_data, colWidths=[3*cm, 5*cm, 7*cm])
compte_table.setStyle(TableStyle([
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
story.append(compte_table)
story.append(Spacer(1, 10))

story.append(PageBreak())

# Section 15
story.append(Paragraph("<b>15. Exports Fiscaux</b>", h2_style))

story.append(Paragraph("<b>15.1 Synthese TVA</b>", h3_style))
story.append(Paragraph("Le module calcule automatiquement la TVA collectee sur vos ventes et la TVA deduisible sur vos achats. La synthesis TVA mensuelle presente le detail de ces montants et calcule la TVA nette a payer ou le credit de TVA. Ce document facilite grandement la preparation de vos declarations fiscales mensuelles. Les taux de TVA sont configurables selon la legislation guineenne en vigueur.", body_style))

story.append(Paragraph("<b>15.2 Formats d'Export</b>", h3_style))
story.append(Paragraph("Les donnees comptables peuvent etre exportees dans plusieurs formats. Le format CSV est universel et compatible avec tous les tableurs. Le format Excel facilite les analyses complementaires. Le format QuickBooks (.iif) permet l'import direct dans ce logiciel comptable populaire. Le format Sage est adapte aux logiciels comptables de cette gamme largement utilises en Afrique de l'Ouest.", body_style))

story.append(Paragraph("<b>15.3 Archivage</b>", h3_style))
story.append(Paragraph("Toutes les operations sont horodatees et conservees dans le systeme. L'historique complet des ventes et des depenses reste accessible pour les controles et audits. Les exports generes sont egalement archives avec leur date de creation. Cette traçabilité complete facilite les verifications fiscales et les audits internes.", body_style))

story.append(Spacer(1, 30))

# Summary Box
story.append(Paragraph("<b>Resume des Points Cles</b>", h2_style))
story.append(Spacer(1, 10))

summary_data = [
    [Paragraph("<b>Domaine</b>", header_style), Paragraph("<b>Action Principale</b>", header_style)],
    [Paragraph("Societes", cell_style), Paragraph("Configurer dans Parametres > Sites avec toutes les informations legales", cell_style)],
    [Paragraph("Depenses", cell_style), Paragraph("Enregistrer quotidiennement avec categorie et justificatif", cell_style)],
    [Paragraph("Recettes", cell_style), Paragraph("Suivre via Dashboard et Analytics pour piloter l'activite", cell_style)],
    [Paragraph("Comptabilite", cell_style), Paragraph("Exporter mensuellement pour votre expert-comptable", cell_style)],
]

summary_table = Table(summary_data, colWidths=[4*cm, 11*cm])
summary_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E75B6')),
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
story.append(summary_table)

# Build document
doc.build(story)
print("Guide Finance genere avec succes!")
