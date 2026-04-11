// ============================================
// KFM DELICE - Complete Database Seed Script
// With real food images from Unsplash
// ============================================

import { config } from 'dotenv';
config();

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const BCRYPT_SALT_ROUNDS = 12;

// KFM DELICE Configuration
const KFM_DELICE = {
  name: 'KFM DELICE',
  slug: 'kfm-delice',
  slogan: 'Les saveurs de l\'Afrique de l\'Ouest',
  description: 'Restaurant fast-food guinéen offrant des plats traditionnels ivoiriens, sénégalais et guinéens avec une qualité exceptionnelle. Découvrez les saveurs authentiques de l\'Afrique de l\'Ouest.',
  phone: '+224622000000',
  email: 'contact@kfm-delice.com',
  address: 'Kaloum, Conakry',
  city: 'Conakry',
  district: 'Kaloum',
  cuisine: ['Guinéenne', 'Ivoirienne', 'Sénégalaise', 'Fast Food', 'Africaine'],
  color: '#FF6B35',
  priceRange: 2,
};

// Admin user for KFM DELICE
const KFM_ADMIN = {
  email: 'kfm.delice@guinee.com',
  password: 'KfmDelice2024!',
  phone: '+224622000001',
  firstName: 'KFM',
  lastName: 'DELICE',
};

// High quality food images from Unsplash for African dishes
const FOOD_IMAGES = {
  // PLATS IVOIRIENS
  'attieke-poisson-grille': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  'garba': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80',
  'kedjenou-poulet': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&q=80',
  'alloco-sauce-graine': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80',
  'foutou-banane': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  'riz-gras-ivoirien': 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800&q=80',
  'poisson-braise-ivoirien': 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=800&q=80',
  
  // PLATS SÉNÉGALAIS
  'thieboudienne': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80',
  'yassa-poulet': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80',
  'mafe': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  'dibi': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
  'thiou-poisson': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
  'pastels': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
  
  // PLATS GUINÉENS
  'konkoe': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
  'poulet-yassa-guineen': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80',
  'fou-fou-guineen': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  'poisson-braise-guineen': 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=800&q=80',
  'sauce-feuilles': 'https://images.unsplash.com/photo-1540914124281-342587941389?w=800&q=80',
  'maffi-guineen': 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80',
  
  // GRILLADES
  'mix-grill': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
  'brochettes-boeuf': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
  'poulet-braise': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80',
  'poisson-grille-entier': 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=800&q=80',
  'cotes-agneau': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&q=80',
  'brochettes-poisson': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
  'chevre-braise': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
  
  // FAST FOOD
  'burger-kfm': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
  'chawarma-poulet': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80',
  'chawarma-viande': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&q=80',
  'sandwich-poulet': 'https://images.unsplash.com/photo-1603064752734-4c48eff53d05?w=800&q=80',
  'tacos-kfm': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
  'wrap-poulet': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80',
  'double-burger': 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=800&q=80',
  'hot-dog-kfm': 'https://images.unsplash.com/photo-1612392062126-2f3db84c77e5?w=800&q=80',
  
  // ACCOMPAGNEMENTS
  'alloco': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80',
  'frites': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80',
  'riz-blanc': 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80',
  'attieke': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
  'salade': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  'fonio': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  'igname-pilee': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  
  // BOISSONS
  'jus-bissap': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80',
  'jus-gingembre': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
  'jus-baobab': 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80',
  'cafe-touba': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
  'ataya': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80',
  'eau-minerale': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80',
  'soda': 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=800&q=80',
  'jus-orange': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800&q=80',
  'bouye': 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80',
  'lait-caille': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80',
  'degue': 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=800&q=80',
  
  // DESSERTS
  'fruits-saison': 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800&q=80',
  'banane-caramel': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
  'gateau-maison': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
  'pasteque-fraiche': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80',
  'thiakry': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
  'glaces-artisanales': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80',
  'beignets': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
};

// Menu items with images
const MENU_ITEMS = [
  // PLATS IVOIRIENS
  { name: 'Attieké Poisson Grillé', slug: 'attieke-poisson-grille', description: 'Semoule de manioc avec poisson grillé, sauce tomate et légumes frais', price: 45000, category: 'Plats Ivoiriens', prepTime: 20, isPopular: true },
  { name: 'Alloco Sauce Graine', slug: 'alloco-sauce-graine', description: 'Bananes plantains frites avec sauce graine de palme et poisson fumé', price: 25000, category: 'Plats Ivoiriens', prepTime: 15, isPopular: true },
  { name: 'Kedjenou de Poulet', slug: 'kedjenou-poulet', description: 'Poulet braisé en cocotte fermée avec légumes et épices', price: 50000, category: 'Plats Ivoiriens', prepTime: 30, isNew: true },
  { name: 'Foutou Banane', slug: 'foutou-banane', description: 'Pâte de banane plantain avec sauce aubergine ou arachide', price: 30000, category: 'Plats Ivoiriens', prepTime: 25 },
  { name: 'Garba', slug: 'garba', description: 'Attieké avec poisson frit, oignons et piment', price: 30000, category: 'Plats Ivoiriens', prepTime: 15, isPopular: true },
  { name: 'Riz Gras Ivoirien', slug: 'riz-gras-ivoirien', description: 'Riz aux tomates fraîches, légumes et viande ou poisson', price: 25000, category: 'Plats Ivoiriens', prepTime: 20 },
  { name: 'Foutou Ignames', slug: 'foutou-ignames', description: 'Pâte d\'igname avec sauce graine ou arachide', price: 30000, category: 'Plats Ivoiriens', prepTime: 25 },
  { name: 'Poisson Braisé Ivoirien', slug: 'poisson-braise-ivoirien', description: 'Poisson entier grillé aux épices ivoiriennes', price: 55000, category: 'Plats Ivoiriens', prepTime: 25, isPopular: true },
  { name: 'Gari Foro', slug: 'gari-foro', description: 'Semoule de manioc fermentée avec sauce', price: 20000, category: 'Plats Ivoiriens', prepTime: 10 },
  
  // PLATS SÉNÉGALAIS
  { name: 'Thiéboudienne', slug: 'thieboudienne', description: 'Riz au poisson et légumes, plat national sénégalais', price: 45000, category: 'Plats Sénégalais', prepTime: 45, isPopular: true },
  { name: 'Yassa Poulet', slug: 'yassa-poulet', description: 'Poulet mariné au citron et oignons caramélisés', price: 40000, category: 'Plats Sénégalais', prepTime: 30, isPopular: true },
  { name: 'Mafé', slug: 'mafe', description: 'Ragoût de viande à la sauce d\'arachide crémeuse', price: 40000, category: 'Plats Sénégalais', prepTime: 35, isPopular: true },
  { name: 'Dibi', slug: 'dibi', description: 'Grillades d\'agneau aux épices sénégalaises', price: 60000, category: 'Plats Sénégalais', prepTime: 25, isNew: true },
  { name: 'Thiou au Poisson', slug: 'thiou-poisson', description: 'Ragoût de poisson épicé aux légumes', price: 45000, category: 'Plats Sénégalais', prepTime: 30 },
  { name: 'Ceebu Jën', slug: 'ceebu-jen', description: 'Riz rouge au poisson et légumes', price: 45000, category: 'Plats Sénégalais', prepTime: 40 },
  { name: 'Pastels', slug: 'pastels', description: 'Beignets de poisson croustillants', price: 20000, category: 'Plats Sénégalais', prepTime: 20 },
  { name: 'Thiébou Yapp', slug: 'thiebou-yapp', description: 'Riz à la viande et légumes', price: 40000, category: 'Plats Sénégalais', prepTime: 35 },
  { name: 'Domoda', slug: 'domoda', description: 'Ragoût de viande à la sauce arachide avec riz', price: 40000, category: 'Plats Sénégalais', prepTime: 35 },
  
  // PLATS GUINÉENS
  { name: 'Poulet Yassa Guinéen', slug: 'poulet-yassa-guineen', description: 'Poulet mariné au citron et oignons, style guinéen', price: 45000, category: 'Plats Guinéens', prepTime: 35, isPopular: true },
  { name: 'Fou Fou Guinéen', slug: 'fou-fou-guineen', description: 'Ragoût de fonio aux arachides et légumes', price: 35000, category: 'Plats Guinéens', prepTime: 40, isPopular: true },
  { name: 'Riz Gras Guinéen', slug: 'riz-gras-guineen', description: 'Riz aux tomates fraîches, légumes et viande', price: 25000, category: 'Plats Guinéens', prepTime: 25 },
  { name: 'Konkoé', slug: 'konkoe', description: 'Pâte de manioc avec sauce aux arachides', price: 30000, category: 'Plats Guinéens', prepTime: 30, isPopular: true },
  { name: 'Tô Maïs', slug: 'to-mais', description: 'Boule de maïs avec sauce tomate et viande', price: 20000, category: 'Plats Guinéens', prepTime: 20 },
  { name: 'Poisson Braisé Guinéen', slug: 'poisson-braise-guineen', description: 'Poisson entier grillé aux épices locales', price: 50000, category: 'Plats Guinéens', prepTime: 30, isPopular: true },
  { name: 'Sauce Feuilles', slug: 'sauce-feuilles', description: 'Feuilles de patate douce avec viande fumée', price: 35000, category: 'Plats Guinéens', prepTime: 35 },
  { name: 'Maffi Guinéen', slug: 'maffi-guineen', description: 'Viande en sauce arachide épicée', price: 40000, category: 'Plats Guinéens', prepTime: 40 },
  { name: 'Soupe Kansi', slug: 'soupe-kansi', description: 'Soupe traditionnelle guinéenne', price: 25000, category: 'Plats Guinéens', prepTime: 30, isNew: true },
  
  // GRILLADES
  { name: 'Mix Grill', slug: 'mix-grill', description: 'Assortiment de grillades (poulet, bœuf, agneau)', price: 65000, category: 'Grillades', prepTime: 30, isPopular: true },
  { name: 'Brochettes de Bœuf', slug: 'brochettes-boeuf', description: '5 brochettes de bœuf marinées aux épices', price: 30000, category: 'Grillades', prepTime: 20 },
  { name: 'Poulet Braisé', slug: 'poulet-braise', description: 'Demi-poulet grillé aux épices africaines', price: 35000, category: 'Grillades', prepTime: 30, isPopular: true },
  { name: 'Poisson Grillé Entier', slug: 'poisson-grille-entier', description: 'Poisson entier grillé au feu de bois', price: 50000, category: 'Grillades', prepTime: 25 },
  { name: 'Côtes d\'Agneau', slug: 'cotes-agneau', description: 'Côtes d\'agneau grillées aux herbes', price: 55000, category: 'Grillades', prepTime: 25 },
  { name: 'Brochettes de Poisson', slug: 'brochettes-poisson', description: 'Brochettes de poisson mariné', price: 35000, category: 'Grillades', prepTime: 20 },
  { name: 'Chèvre Braisé', slug: 'chevre-braise', description: 'Viande de chèvre grillée aux épices', price: 45000, category: 'Grillades', prepTime: 35, isNew: true },
  
  // FAST FOOD
  { name: 'Burger KFM', slug: 'burger-kfm', description: 'Burger maison avec viande fraîche et sauce spéciale', price: 25000, category: 'Fast Food', prepTime: 15, isPopular: true },
  { name: 'Chawarma Poulet', slug: 'chawarma-poulet', description: 'Chawarma au poulet grillé avec sauce blanche', price: 20000, category: 'Fast Food', prepTime: 10, isPopular: true },
  { name: 'Chawarma Viande', slug: 'chawarma-viande', description: 'Chawarma à la viande épicée', price: 22000, category: 'Fast Food', prepTime: 10 },
  { name: 'Sandwich Poulet', slug: 'sandwich-poulet', description: 'Sandwich au poulet pané avec frites', price: 18000, category: 'Fast Food', prepTime: 12 },
  { name: 'Tacos KFM', slug: 'tacos-kfm', description: 'Tacos garnis au choix (poulet, viande, mixte)', price: 22000, category: 'Fast Food', prepTime: 15, isNew: true },
  { name: 'Wrap Poulet', slug: 'wrap-poulet', description: 'Wrap au poulet grillé et légumes frais', price: 18000, category: 'Fast Food', prepTime: 10 },
  { name: 'Double Burger', slug: 'double-burger', description: 'Double burger avec fromage et bacon', price: 35000, category: 'Fast Food', prepTime: 18, isNew: true },
  { name: 'Hot Dog KFM', slug: 'hot-dog-kfm', description: 'Hot dog garni maison', price: 15000, category: 'Fast Food', prepTime: 8 },
  
  // ACCOMPAGNEMENTS
  { name: 'Alloco', slug: 'alloco', description: 'Bananes plantain frites croustillantes', price: 7000, category: 'Accompagnements', prepTime: 10, isPopular: true },
  { name: 'Frites', slug: 'frites', description: 'Frites de pommes de terre maison', price: 6000, category: 'Accompagnements', prepTime: 10 },
  { name: 'Riz Blanc', slug: 'riz-blanc', description: 'Riz blanc parfumé', price: 5000, category: 'Accompagnements', prepTime: 15 },
  { name: 'Attieké', slug: 'attieke', description: 'Semoule de manioc fermentée', price: 8000, category: 'Accompagnements', prepTime: 5 },
  { name: 'Salade', slug: 'salade', description: 'Salade fraîche de saison', price: 6000, category: 'Accompagnements', prepTime: 5 },
  { name: 'Fonio', slug: 'fonio', description: 'Fonio traditionnel guinéen', price: 8000, category: 'Accompagnements', prepTime: 20 },
  { name: 'Igname Pilée', slug: 'igname-pilee', description: 'Pâte d\'igname traditionnelle', price: 7000, category: 'Accompagnements', prepTime: 15 },
  
  // BOISSONS
  { name: 'Jus de Bissap', slug: 'jus-bissap', description: 'Jus naturel de fleur d\'hibiscus', price: 4000, category: 'Boissons', prepTime: 3, isPopular: true },
  { name: 'Jus de Gingembre', slug: 'jus-gingembre', description: 'Jus de gingembre frais et épicé', price: 4000, category: 'Boissons', prepTime: 3, isPopular: true },
  { name: 'Jus de Baobab', slug: 'jus-baobab', description: 'Jus de fruit de baobab', price: 5000, category: 'Boissons', prepTime: 3, isNew: true },
  { name: 'Café Touba', slug: 'cafe-touba', description: 'Café épicé sénégalais traditionnel', price: 3000, category: 'Boissons', prepTime: 5 },
  { name: 'Ataya', slug: 'ataya', description: 'Thé à la menthe guinéen', price: 3000, category: 'Boissons', prepTime: 10 },
  { name: 'Eau Minérale', slug: 'eau-minerale', description: 'Eau minérale naturelle', price: 2000, category: 'Boissons', prepTime: 0 },
  { name: 'Soda', slug: 'soda', description: 'Boisson gazeuse (Coca, Fanta, Sprite)', price: 3000, category: 'Boissons', prepTime: 0 },
  { name: 'Jus d\'Orange', slug: 'jus-orange', description: 'Jus d\'orange frais pressé', price: 5000, category: 'Boissons', prepTime: 5 },
  { name: 'Bouye', slug: 'bouye', description: 'Jus de fruit de baobab traditionnel', price: 5000, category: 'Boissons', prepTime: 5, isNew: true },
  { name: 'Lait Caillé', slug: 'lait-caille', description: 'Lait caillé traditionnel', price: 4000, category: 'Boissons', prepTime: 3 },
  { name: 'Dèguè', slug: 'deguè', description: 'Boisson à base de mil et lait', price: 4500, category: 'Boissons', prepTime: 5 },
  
  // DESSERTS
  { name: 'Fruits de Saison', slug: 'fruits-saison', description: 'Assiette de fruits frais de saison', price: 6000, category: 'Desserts', prepTime: 5 },
  { name: 'Banane Caramel', slug: 'banane-caramel', description: 'Bananes flambées au caramel', price: 8000, category: 'Desserts', prepTime: 10, isNew: true },
  { name: 'Gâteau Maison', slug: 'gateau-maison', description: 'Gâteau fait maison du jour', price: 7000, category: 'Desserts', prepTime: 5 },
  { name: 'Pastèque Fraîche', slug: 'pasteque-fraiche', description: 'Tranches de pastèque fraîche', price: 4000, category: 'Desserts', prepTime: 5 },
  { name: 'Thiakry', slug: 'thiakry', description: 'Dessert sénégalais au mil et lait', price: 6000, category: 'Desserts', prepTime: 5, isNew: true },
  { name: 'Glaces Artisanales', slug: 'glaces-artisanales', description: 'Glaces faites maison', price: 6000, category: 'Desserts', prepTime: 5 },
  { name: 'Beignets', slug: 'beignets', description: 'Beignets africains sucrés', price: 5000, category: 'Desserts', prepTime: 10 },
];

// Menu Categories
const MENU_CATEGORIES = [
  { name: 'Plats Ivoiriens', slug: 'plats-ivoiriens', description: 'Saveurs authentiques de Côte d\'Ivoire', order: 1, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80' },
  { name: 'Plats Sénégalais', slug: 'plats-senegalais', description: 'Tradition culinaire sénégalaise', order: 2, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80' },
  { name: 'Plats Guinéens', slug: 'plats-guineens', description: 'Spécialités traditionnelles de Guinée', order: 3, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80' },
  { name: 'Grillades', slug: 'grillades', description: 'Viandes et poissons grillés', order: 4, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80' },
  { name: 'Fast Food', slug: 'fast-food', description: 'Burgers, chawarma et sandwiches', order: 5, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },
  { name: 'Accompagnements', slug: 'accompagnements', description: 'Frites, alloco, riz et plus', order: 6, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80' },
  { name: 'Boissons', slug: 'boissons', description: 'Jus naturels et boissons fraîches', order: 7, image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80' },
  { name: 'Desserts', slug: 'desserts', description: 'Douceurs et fruits', order: 8, image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800&q=80' },
];

// KFM DELICE Exclusive Template
const KFM_TEMPLATE = {
  name: 'KFM DELICE - African Elegance',
  slug: 'kfm-delice-african-elegance',
  description: 'Template exclusif pour KFM DELICE avec design africain moderne',
  themeConfig: JSON.stringify({
    colors: {
      primary: '#FF6B35',
      secondary: '#2E7D32',
      accent: '#FFC107',
      background: '#FFF8E1',
      text: '#1F2937',
      textMuted: '#6B7280',
    },
    fonts: {
      heading: 'Poppins',
      body: 'Inter',
    },
    layout: {
      headerStyle: 'fixed',
      footerStyle: 'full',
      heroStyle: 'full',
      cardStyle: 'rounded',
    },
    patterns: {
      borders: true,
      backgrounds: true,
      pattern: 'kente',
    },
  }),
  components: JSON.stringify({
    hero: true,
    featured: true,
    menu: true,
    gallery: true,
    reviews: true,
    contact: true,
    social: true,
    newsletter: true,
    reservations: true,
    delivery: true,
  }),
  images: JSON.stringify({
    logo: '/images/kfm-delice-logo.png',
    banner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80',
    backgrounds: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80',
    ],
  }),
  customCss: `
    .kente-border {
      background: repeating-linear-gradient(
        45deg,
        #FF6B35,
        #FF6B35 10px,
        #FFC107 10px,
        #FFC107 20px,
        #2E7D32 20px,
        #2E7D32 30px
      );
      height: 8px;
    }
    .hero-overlay {
      background: linear-gradient(135deg, rgba(255, 107, 53, 0.9) 0%, rgba(46, 125, 50, 0.8) 100%);
    }
    .card-hover:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(255, 107, 53, 0.2);
    }
    .btn-primary {
      background: linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%);
      transition: all 0.3s ease;
    }
    .btn-primary:hover {
      background: linear-gradient(135deg, #FF8C5A 0%, #FF6B35 100%);
      box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
    }
  `,
  isPremium: true,
  isExclusive: true,
};

async function main() {
  console.log('🍽️ KFM DELICE - Configuration complète\n');
  console.log('='.repeat(60));

  try {
    // 1. Get Guinea country and GNF currency
    console.log('\n📍 Étape 1: Configuration pays et devise...');
    let guinea = await prisma.country.findUnique({ where: { code: 'GN' } });
    let gnf = await prisma.currency.findUnique({ where: { code: 'GNF' } });

    if (!gnf) {
      gnf = await prisma.currency.create({
        data: {
          code: 'GNF',
          name: 'Franc Guinéen',
          symbol: 'GNF',
          decimalPlaces: 0,
          isActive: true,
        },
      });
      console.log('  ✓ Devise GNF créée');
    }

    if (!guinea) {
      guinea = await prisma.country.create({
        data: {
          code: 'GN',
          name: 'Guinée',
          dialCode: '+224',
          currencyId: gnf.id,
          defaultLanguage: 'fr',
          timezone: 'Africa/Conakry',
          taxIncluded: true,
          defaultTaxRate: 18,
          mobileMoneyEnabled: true,
          isActive: true,
        },
      });
      console.log('  ✓ Pays Guinée créé');
    }

    // 2. Create Organization
    console.log('\n🏢 Étape 2: Création de l\'organisation...');
    const org = await prisma.organization.upsert({
      where: { slug: 'kfm-delice-org' },
      update: {
        name: KFM_DELICE.name,
        email: KFM_DELICE.email,
        phone: KFM_DELICE.phone,
        city: KFM_DELICE.city,
        countryId: guinea.id,
        currencyId: gnf.id,
        plan: 'BUSINESS',
        isActive: true,
      },
      create: {
        name: KFM_DELICE.name,
        slug: 'kfm-delice-org',
        email: KFM_DELICE.email,
        phone: KFM_DELICE.phone,
        city: KFM_DELICE.city,
        countryId: guinea.id,
        currencyId: gnf.id,
        plan: 'BUSINESS',
        isActive: true,
      },
    });
    console.log(`  ✓ Organisation: ${org.name}`);

    // Create organization settings
    await prisma.organizationSettings.upsert({
      where: { organizationId: org.id },
      update: {},
      create: {
        organizationId: org.id,
        minOrderAmount: 10000,
        maxDeliveryRadius: 15,
        defaultDeliveryFee: 5000,
        orderPrepTime: 20,
        reservationEnabled: true,
        autoConfirmReservations: false,
        defaultTableTime: 90,
        noShowFee: 25000,
        acceptsCash: true,
        acceptsMobileMoney: true,
        acceptsCard: false,
        deliveryEnabled: true,
        loyaltyEnabled: true,
        pointsPerAmount: 100,
        pointValue: 500,
      },
    });
    console.log('  ✓ Paramètres organisation créés');

    // 3. Create Admin User
    console.log('\n👤 Étape 3: Création de l\'administrateur...');
    const hashedPassword = await bcrypt.hash(KFM_ADMIN.password, BCRYPT_SALT_ROUNDS);
    
    let user = await prisma.user.findUnique({ where: { email: KFM_ADMIN.email } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: KFM_ADMIN.email,
          phone: KFM_ADMIN.phone,
          passwordHash: hashedPassword,
          firstName: KFM_ADMIN.firstName,
          lastName: KFM_ADMIN.lastName,
          role: 'ORG_ADMIN',
          language: 'fr',
          timezone: 'Africa/Conakry',
          isActive: true,
        },
      });
      console.log('  ✓ Utilisateur créé');
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword },
      });
      console.log('  ✓ Mot de passe mis à jour');
    }

    // Link user to organization
    await prisma.organizationUser.upsert({
      where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
      update: { role: 'admin' },
      create: {
        organizationId: org.id,
        userId: user.id,
        role: 'admin',
      },
    });

    // 4. Create Exclusive Template
    console.log('\n🎨 Étape 4: Création du template exclusif KFM DELICE...');
    const template = await prisma.restaurantTemplate.upsert({
      where: { slug: KFM_TEMPLATE.slug },
      update: KFM_TEMPLATE,
      create: KFM_TEMPLATE,
    });
    console.log(`  ✓ Template: ${template.name}`);

    // 5. Create Restaurant
    console.log('\n🍽️ Étape 5: Création du restaurant...');
    const restaurant = await prisma.restaurant.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: KFM_DELICE.slug } },
      update: {
        organizationId: org.id,
        name: KFM_DELICE.name,
        description: KFM_DELICE.description,
        phone: KFM_DELICE.phone,
        address: KFM_DELICE.address,
        city: KFM_DELICE.city,
        district: KFM_DELICE.district,
        countryId: guinea.id,
        templateId: template.id,
        restaurantType: 'restaurant',
        cuisines: JSON.stringify(KFM_DELICE.cuisine),
        priceRange: KFM_DELICE.priceRange,
        primaryColor: KFM_DELICE.color,
        acceptsReservations: true,
        acceptsDelivery: true,
        acceptsTakeaway: true,
        acceptsDineIn: true,
        deliveryFee: 5000,
        minOrderAmount: 10000,
        maxDeliveryRadius: 15,
        isActive: true,
        isOpen: true,
      },
      create: {
        organizationId: org.id,
        name: KFM_DELICE.name,
        slug: KFM_DELICE.slug,
        description: KFM_DELICE.description,
        phone: KFM_DELICE.phone,
        address: KFM_DELICE.address,
        city: KFM_DELICE.city,
        district: KFM_DELICE.district,
        countryId: guinea.id,
        templateId: template.id,
        restaurantType: 'restaurant',
        cuisines: JSON.stringify(KFM_DELICE.cuisine),
        priceRange: KFM_DELICE.priceRange,
        primaryColor: KFM_DELICE.color,
        acceptsReservations: true,
        acceptsDelivery: true,
        acceptsTakeaway: true,
        acceptsDineIn: true,
        deliveryFee: 5000,
        minOrderAmount: 10000,
        maxDeliveryRadius: 15,
        isActive: true,
        isOpen: true,
      },
    });
    console.log(`  ✓ Restaurant: ${restaurant.name}`);

    // Mark template as exclusive to this restaurant
    await prisma.restaurantTemplate.update({
      where: { id: template.id },
      data: { exclusiveRestaurantId: restaurant.id },
    });

    // Create restaurant admin
    await prisma.restaurantAdmin.upsert({
      where: { restaurantId_userId: { restaurantId: restaurant.id, userId: user.id } },
      update: { role: 'admin', isActive: true },
      create: {
        restaurantId: restaurant.id,
        userId: user.id,
        role: 'admin',
        isDefault: true,
        isActive: true,
      },
    });

    // 6. Create Menu
    console.log('\n📋 Étape 6: Création du menu...');
    const menu = await prisma.menu.upsert({
      where: { restaurantId_slug: { restaurantId: restaurant.id, slug: 'menu-principal' } },
      update: {
        name: 'Menu Principal',
        description: 'Menu complet de KFM DELICE - Saveurs de Guinée, Côte d\'Ivoire et Sénégal',
        isActive: true,
      },
      create: {
        restaurantId: restaurant.id,
        name: 'Menu Principal',
        slug: 'menu-principal',
        description: 'Menu complet de KFM DELICE - Saveurs de Guinée, Côte d\'Ivoire et Sénégal',
        isActive: true,
        sortOrder: 1,
      },
    });
    console.log(`  ✓ Menu: ${menu.name}`);

    // 7. Create Menu Categories
    console.log('\n📂 Étape 7: Création des catégories...');
    const categoryMap: Record<string, string> = {};
    
    for (const cat of MENU_CATEGORIES) {
      const category = await prisma.menuCategory.upsert({
        where: { menuId_slug: { menuId: menu.id, slug: cat.slug } },
        update: {
          name: cat.name,
          description: cat.description,
          image: cat.image,
          sortOrder: cat.order,
          isActive: true,
        },
        create: {
          menuId: menu.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: cat.image,
          sortOrder: cat.order,
          isActive: true,
        },
      });
      categoryMap[cat.name] = category.id;
      console.log(`  ✓ ${cat.name}`);
    }

    // 8. Create Menu Items with Images
    console.log('\n🍕 Étape 8: Création des articles du menu...');
    let itemCount = 0;
    
    for (const item of MENU_ITEMS) {
      const categoryId = categoryMap[item.category];
      if (!categoryId) continue;

      const imageKey = item.slug;
      const imageUrl = FOOD_IMAGES[imageKey as keyof typeof FOOD_IMAGES] || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';

      await prisma.menuItem.upsert({
        where: { categoryId_slug: { categoryId: categoryId, slug: item.slug } },
        update: {
          name: item.name,
          description: item.description,
          image: imageUrl,
          price: item.price,
          prepTime: item.prepTime,
          isAvailable: true,
          isPopular: item.isPopular || false,
          isNew: item.isNew || false,
        },
        create: {
          categoryId: categoryId,
          name: item.name,
          slug: item.slug,
          description: item.description,
          image: imageUrl,
          price: item.price,
          prepTime: item.prepTime,
          isAvailable: true,
          isPopular: item.isPopular || false,
          isNew: item.isNew || false,
        },
      });
      itemCount++;
    }
    console.log(`  ✓ ${itemCount} articles créés/mis à jour`);

    // 9. Create Delivery Zones
    console.log('\n🚚 Étape 9: Création des zones de livraison...');
    const deliveryZones = [
      { name: 'Kaloum', description: 'Commune de Kaloum, centre-ville', fee: 5000, minOrder: 10000, minTime: 20, maxTime: 45 },
      { name: 'Dixinn', description: 'Commune de Dixinn', fee: 5000, minOrder: 10000, minTime: 25, maxTime: 50 },
      { name: 'Ratoma', description: 'Commune de Ratoma', fee: 5000, minOrder: 10000, minTime: 25, maxTime: 50 },
      { name: 'Matam', description: 'Commune de Matam', fee: 6000, minOrder: 10000, minTime: 30, maxTime: 55 },
      { name: 'Matoto', description: 'Commune de Matoto', fee: 6000, minOrder: 10000, minTime: 30, maxTime: 55 },
      { name: 'Kamsar', description: 'Ville de Kamsar, Boké', fee: 50000, minOrder: 50000, minTime: 180, maxTime: 300 },
      { name: 'Kindia', description: 'Ville de Kindia', fee: 30000, minOrder: 30000, minTime: 120, maxTime: 180 },
    ];

    let zoneCount = 0;
    for (const zone of deliveryZones) {
      await prisma.deliveryZone.upsert({
        where: { restaurantId_name: { restaurantId: restaurant.id, name: zone.name } },
        update: {
          description: zone.description,
          baseFee: zone.fee,
          minOrder: zone.minOrder,
          minTime: zone.minTime,
          maxTime: zone.maxTime,
          isActive: true,
        },
        create: {
          restaurantId: restaurant.id,
          name: zone.name,
          description: zone.description,
          baseFee: zone.fee,
          minOrder: zone.minOrder,
          minTime: zone.minTime,
          maxTime: zone.maxTime,
          isActive: true,
        },
      });
      zoneCount++;
    }
    console.log(`  ✓ ${zoneCount} zones créées`);

    // 10. Create Restaurant Hours
    console.log('\n🕐 Étape 10: Configuration des horaires...');
    const hours = [
      { day: 0, open: '10:00', close: '21:00', isClosed: false }, // Sunday
      { day: 1, open: '08:00', close: '22:00', isClosed: false }, // Monday
      { day: 2, open: '08:00', close: '22:00', isClosed: false }, // Tuesday
      { day: 3, open: '08:00', close: '22:00', isClosed: false }, // Wednesday
      { day: 4, open: '08:00', close: '22:00', isClosed: false }, // Thursday
      { day: 5, open: '08:00', close: '23:00', isClosed: false }, // Friday
      { day: 6, open: '09:00', close: '23:00', isClosed: false }, // Saturday
    ];

    for (const hour of hours) {
      await prisma.restaurantHour.upsert({
        where: { restaurantId_dayOfWeek: { restaurantId: restaurant.id, dayOfWeek: hour.day } },
        update: {
          openTime: hour.open,
          closeTime: hour.close,
          isClosed: hour.isClosed,
        },
        create: {
          restaurantId: restaurant.id,
          dayOfWeek: hour.day,
          openTime: hour.open,
          closeTime: hour.close,
          isClosed: hour.isClosed,
        },
      });
    }
    console.log('  ✓ Horaires configurés');

    // Final Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ CONFIGURATION TERMINÉE AVEC SUCCÈS !');
    console.log('='.repeat(60));
    console.log('\n🔐 IDENTIFIANTS DE CONNEXION:');
    console.log('─'.repeat(40));
    console.log(`  📧 Email:      ${KFM_ADMIN.email}`);
    console.log(`  🔑 Mot de passe: ${KFM_ADMIN.password}`);
    console.log(`  📱 Téléphone:  ${KFM_ADMIN.phone}`);
    console.log('\n📊 STATISTIQUES:');
    console.log('─'.repeat(40));
    console.log(`  🍕 Articles du menu:    ${itemCount}`);
    console.log(`  📂 Catégories:          ${MENU_CATEGORIES.length}`);
    console.log(`  🚚 Zones de livraison:  ${zoneCount}`);
    console.log(`  🎨 Template exclusif:   ${template.name}`);
    console.log('\n🌐 URLs:');
    console.log('─'.repeat(40));
    console.log(`  📱 Menu public:  /menu/${KFM_DELICE.slug}`);
    console.log(`  🔐 Admin:        /login`);
    console.log('\n🍽️ CUISINES PROPOSÉES:');
    console.log('─'.repeat(40));
    console.log('  🇨🇮 Plats Ivoiriens    - Attieké, Kedjenou, Alloco, Garba');
    console.log('  🇸🇳 Plats Sénégalais   - Thiéboudienne, Yassa, Mafé, Dibi');
    console.log('  🇬🇳 Plats Guinéens     - Fou Fou, Konkoé, Tô Maïs');
    console.log('  🍔 Fast Food          - Burgers, Chawarma, Tacos');
    console.log('  🔥 Grillades          - Poulet Braisé, Brochettes');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur fatale:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
