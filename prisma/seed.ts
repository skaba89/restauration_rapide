// ============================================
// RESTAURANT OS - Seed Data
// Realistic African Restaurants & Configuration
// ============================================

import { db } from '../src/lib/db';
import bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 12;

// ============================================
// BRAND NAMES & LOGOS FOR AFRICAN RESTAURANTS
// ============================================

const AFRICAN_RESTAURANTS = {
  // Côte d'Ivoire
  CI: [
    {
      name: "Le Palais d'Abidjan",
      slug: "palais-abidjan",
      slogan: "L'art culinaire ivoirien",
      type: "restaurant",
      cuisine: ["Ivoirienne", "Africaine", "Internationale"],
      priceRange: 3,
      color: "#D4AF37", // Gold
      city: "Abidjan",
      district: "Plateau",
    },
    {
      name: "Maquis Chez Koffi",
      slug: "maquis-koffi",
      slogan: "Le vrai goût de l'Afrique",
      type: "restaurant",
      cuisine: ["Ivoirienne", "Maquis"],
      priceRange: 2,
      color: "#8B4513", // Saddle Brown
      city: "Abidjan",
      district: "Treichville",
    },
    {
      name: "Le Jardin Savane",
      slug: "jardin-savane",
      slogan: "Saveurs de la savane",
      type: "restaurant",
      cuisine: ["Africaine", "Grillades"],
      priceRange: 3,
      color: "#228B22", // Forest Green
      city: "Abidjan",
      district: "Cocody",
    },
    {
      name: "Teranga Restaurant",
      slug: "teranga-abidjan",
      slogan: "L'hospitalité sénégalaise à Abidjan",
      type: "restaurant",
      cuisine: ["Sénégalaise", "Africaine"],
      priceRange: 2,
      color: "#FF6347", // Tomato
      city: "Abidjan",
      district: "Marcory",
    },
    {
      name: "Café Cacao",
      slug: "cafe-cacao",
      slogan: "L'or noir de Côte d'Ivoire",
      type: "cafe",
      cuisine: ["Café", "Pâtisserie"],
      priceRange: 2,
      color: "#6F4E37", // Coffee
      city: "Abidjan",
      district: "Riviera",
    },
  ],
  
  // Sénégal
  SN: [
    {
      name: "Le Dakh de Dakar",
      slug: "dakh-dakar",
      slogan: "L'excellence sénégalaise",
      type: "restaurant",
      cuisine: ["Sénégalaise", "Africaine", "Fruits de mer"],
      priceRange: 4,
      color: "#1E90FF", // Dodger Blue
      city: "Dakar",
      district: "Plateau",
    },
    {
      name: "Chez Loutcha",
      slug: "chez-loutcha",
      slogan: "Tradition et saveurs",
      type: "restaurant",
      cuisine: ["Sénégalaise", "Portugaise"],
      priceRange: 2,
      color: "#FF8C00", // Dark Orange
      city: "Dakar",
      district: "Almadies",
    },
    {
      name: "Le Ngor",
      slug: "le-ngor",
      slogan: "Les saveurs de l'île",
      type: "restaurant",
      cuisine: ["Sénégalaise", "Poisson"],
      priceRange: 3,
      color: "#20B2AA", // Light Sea Green
      city: "Dakar",
      district: "Ngor",
    },
  ],
  
  // Nigeria
  NG: [
    {
      name: "The Kitchen Lagos",
      slug: "kitchen-lagos",
      slogan: "Naija flavors, global taste",
      type: "restaurant",
      cuisine: ["Nigériane", "Africaine"],
      priceRange: 3,
      color: "#008000", // Green
      city: "Lagos",
      district: "Victoria Island",
    },
    {
      name: "Mama Cass",
      slug: "mama-cass",
      slogan: "Home of Nigerian cuisine",
      type: "restaurant",
      cuisine: ["Nigériane"],
      priceRange: 2,
      color: "#DC143C", // Crimson
      city: "Lagos",
      district: "Ikeja",
    },
    {
      name: "Yellow Chilli",
      slug: "yellow-chilli",
      slogan: "Contemporary Nigerian cuisine",
      type: "restaurant",
      cuisine: ["Nigériane", "Fusion"],
      priceRange: 4,
      color: "#FFD700", // Gold
      city: "Lagos",
      district: "Ikoyi",
    },
    {
      name: "Nok by Alara",
      slug: "nok-alara",
      slogan: "African culinary excellence",
      type: "restaurant",
      cuisine: ["Africaine", "Contemporaine"],
      priceRange: 4,
      color: "#8B0000", // Dark Red
      city: "Lagos",
      district: "Victoria Island",
    },
  ],
  
  // Ghana
  GH: [
    {
      name: "Buka Restaurant",
      slug: "buka-accra",
      slogan: "Authentic African cuisine",
      type: "restaurant",
      cuisine: ["Ghanéenne", "Africaine"],
      priceRange: 3,
      color: "#FF4500", // Orange Red
      city: "Accra",
      district: "Osu",
    },
    {
      name: "Azmera Restaurant",
      slug: "azmera-accra",
      slogan: "Taste of Ghana",
      type: "restaurant",
      cuisine: ["Ghanéenne", "Internationale"],
      priceRange: 3,
      color: "#4169E1", // Royal Blue
      city: "Accra",
      district: "Airport Residential",
    },
    {
      name: "Papaye",
      slug: "papaye-accra",
      slogan: "Fast food Ghanaian style",
      type: "restaurant",
      cuisine: ["Ghanéenne", "Fast Food"],
      priceRange: 1,
      color: "#32CD32", // Lime Green
      city: "Accra",
      district: "Osu",
    },
  ],
  
  // Kenya
  KE: [
    {
      name: "Carnivore Nairobi",
      slug: "carnivore-nairobi",
      slogan: "Africa's greatest eating experience",
      type: "restaurant",
      cuisine: ["Kenyane", "Grillades", "Game Meat"],
      priceRange: 4,
      color: "#800000", // Maroon
      city: "Nairobi",
      district: "Langata",
    },
    {
      name: "Talisman Restaurant",
      slug: "talisan-nairobi",
      slogan: "European flair, African soul",
      type: "restaurant",
      cuisine: ["Européenne", "Africaine"],
      priceRange: 4,
      color: "#4B0082", // Indigo
      city: "Nairobi",
      district: "Karen",
    },
    {
      name: "Mama Oliech",
      slug: "mama-oliech",
      slogan: "Traditional Kenyan dishes",
      type: "restaurant",
      cuisine: ["Kenyane"],
      priceRange: 2,
      color: "#FF1493", // Deep Pink
      city: "Nairobi",
      district: "Kilimani",
    },
  ],
  
  // Morocco
  MA: [
    {
      name: "La Maison Arabe",
      slug: "maison-arabe",
      slogan: "Legendary Moroccan hospitality",
      type: "restaurant",
      cuisine: ["Marocaine", "Méditerranéenne"],
      priceRange: 4,
      color: "#C71585", // Medium Violet Red
      city: "Marrakech",
      district: "Medina",
    },
    {
      name: "Nomad",
      slug: "nomad-marrakech",
      slogan: "Modern Moroccan cuisine",
      type: "restaurant",
      cuisine: ["Marocaine", "Contemporaine"],
      priceRange: 4,
      color: "#DAA520", // Goldenrod
      city: "Marrakech",
      district: "Medina",
    },
    {
      name: "Le Cabestan",
      slug: "cabestan-casablanca",
      slogan: "Ocean views, exquisite flavors",
      type: "restaurant",
      cuisine: ["Marocaine", "Fruits de mer"],
      priceRange: 4,
      color: "#006400", // Dark Green
      city: "Casablanca",
      district: "Corniche",
    },
  ],
  
  // South Africa
  ZA: [
    {
      name: "The Test Kitchen",
      slug: "test-kitchen",
      slogan: "Cape Town's finest dining",
      type: "restaurant",
      cuisine: ["Contemporaine", "Fusion"],
      priceRange: 4,
      color: "#2F4F4F", // Dark Slate Gray
      city: "Cape Town",
      district: "Woodstock",
    },
    {
      name: "Moyo",
      slug: "moyo-capetown",
      slogan: "Celebrate Africa",
      type: "restaurant",
      cuisine: ["Africaine", "Grillades"],
      priceRange: 3,
      color: "#8B4513", // Saddle Brown
      city: "Cape Town",
      district: "V&A Waterfront",
    },
    {
      name: "The Grillhouse",
      slug: "grillhouse-jhb",
      slogan: "Legendary steaks since 1992",
      type: "restaurant",
      cuisine: ["Grillades", "Steakhouse"],
      priceRange: 4,
      color: "#A0522D", // Sienna
      city: "Johannesburg",
      district: "Rosebank",
    },
  ],
  
  // Tunisia
  TN: [
    {
      name: "Dar El Jeld",
      slug: "dar-el-jeld",
      slogan: "Tunisian gastronomy palace",
      type: "restaurant",
      cuisine: ["Tunisienne", "Méditerranéenne"],
      priceRange: 4,
      color: "#191970", // Midnight Blue
      city: "Tunis",
      district: "Medina",
    },
    {
      name: "Le Petit Nice",
      slug: "petit-nice",
      slogan: "Mediterranean flavors",
      type: "restaurant",
      cuisine: ["Tunisienne", "Fruits de mer"],
      priceRange: 3,
      color: "#4682B4", // Steel Blue
      city: "Tunis",
      district: "La Marsa",
    },
  ],
  
  // Egypt
  EG: [
    {
      name: "Abou El Sid",
      slug: "abou-el-sid",
      slogan: "Authentic Egyptian cuisine",
      type: "restaurant",
      cuisine: ["Égyptienne", "Orientale"],
      priceRange: 3,
      color: "#B8860B", // Dark Goldenrod
      city: "Le Caire",
      district: "Zamalek",
    },
    {
      name: "Sequoia",
      slug: "sequoia-cairo",
      slogan: "Nile dining experience",
      type: "restaurant",
      cuisine: ["Méditerranéenne", "Internationale"],
      priceRange: 4,
      color: "#556B2F", // Dark Olive Green
      city: "Le Caire",
      district: "Zamalek",
    },
  ],
  
  // Guinée
  GN: [
    {
      name: "Le Jardin de Conakry",
      slug: "jardin-conakry",
      slogan: "Saveurs de Guinée",
      type: "restaurant",
      cuisine: ["Guinéenne", "Africaine"],
      priceRange: 3,
      color: "#228B22", // Forest Green
      city: "Conakry",
      district: "Kaloum",
    },
    {
      name: "Maquis du Niger",
      slug: "maquis-niger",
      slogan: "Le vrai goût guinéen",
      type: "restaurant",
      cuisine: ["Guinéenne", "Maquis"],
      priceRange: 2,
      color: "#D2691E", // Chocolate
      city: "Conakry",
      district: "Niger",
    },
    {
      name: "Restaurant Le Wontan",
      slug: "wontan-conakry",
      slogan: "Tradition et modernité",
      type: "restaurant",
      cuisine: ["Guinéenne", "Internationale"],
      priceRange: 3,
      color: "#4169E1", // Royal Blue
      city: "Conakry",
      district: "Dixinn",
    },
    {
      name: "La Paillotte",
      slug: "paillotte-conakry",
      slogan: "Ambiance guinéenne authentique",
      type: "restaurant",
      cuisine: ["Guinéenne", "Grillades"],
      priceRange: 2,
      color: "#CD853F", // Peru
      city: "Conakry",
      district: "Matoto",
    },
  ],
};

// ============================================
// MENU ITEMS BY CUISINE
// ============================================

const MENU_ITEMS = {
  Ivoirienne: [
    { name: "Attieké Poisson Grillé", description: "Semoule de manioc avec poisson grillé et légumes", price: 3500, category: "Plats Principaux", prepTime: 20, isPopular: true },
    { name: "Alloco Sauce Graine", description: "Bananes plantains frites avec sauce graine palmiste", price: 2000, category: "Plats Principaux", prepTime: 15, isPopular: true },
    { name: "Kedjenou de Poulet", description: "Poulet braisé en cocotte avec légumes", price: 4000, category: "Spécialités", prepTime: 30, isNew: true },
    { name: "Foutou Banane", description: "Pâte de banane plantain avec sauce", price: 2500, category: "Plats Traditionnels", prepTime: 20 },
    { name: "Poisson Braisé", description: "Poisson entier grillé aux épices", price: 4500, category: "Grillades", prepTime: 25, isPopular: true },
    { name: "Riz Gras", description: "Riz aux tomates et légumes", price: 2000, category: "Accompagnements", prepTime: 15 },
    { name: "Foutou Ignames", description: "Pâte d'igname avec sauce aubergine", price: 2500, category: "Plats Traditionnels", prepTime: 25 },
    { name: "Gari Foro", description: "Semoule de manioc fermentée", price: 1500, category: "Accompagnements", prepTime: 5 },
  ],
  
  Sénégalaise: [
    { name: "Thiéboudienne", description: "Riz au poisson et légumes, plat national sénégalais", price: 3500, category: "Plats Principaux", prepTime: 45, isPopular: true },
    { name: "Yassa Poulet", description: "Poulet mariné au citron et oignons", price: 3000, category: "Plats Principaux", prepTime: 30, isPopular: true },
    { name: "Mafé", description: "Ragoût à la sauce d'arachide", price: 3000, category: "Plats Principaux", prepTime: 35 },
    { name: "Dibi", description: "Grillades d'agneau aux épices", price: 5000, category: "Grillades", prepTime: 25, isNew: true },
    { name: "Thiou au Poisson", description: "Ragoût de poisson épicé", price: 3500, category: "Plats Principaux", prepTime: 30 },
    { name: "Ceebu Jën", description: "Riz rouge au poisson", price: 3500, category: "Plats Principaux", prepTime: 40 },
    { name: "Pastels", description: "Beignets de poisson", price: 1500, category: "Entrées", prepTime: 20 },
  ],
  
  Nigériane: [
    { name: "Jollof Rice", description: "Riz épicé à la tomate, spécialité nigériane", price: 2500, category: "Plats Principaux", prepTime: 30, isPopular: true },
    { name: "Suya", description: "Brochettes de bœuf épicées", price: 3000, category: "Grillades", prepTime: 20, isPopular: true },
    { name: "Egusi Soup", description: "Soupe aux graines de melon", price: 3000, category: "Soupes", prepTime: 35 },
    { name: "Pounded Yam", description: "Pâte d'igname pilée", price: 1500, category: "Accompagnements", prepTime: 20 },
    { name: "Moi Moi", description: "Pudding de haricots vapeur", price: 1500, category: "Entrées", prepTime: 45 },
    { name: "Pepper Soup", description: "Soupe épicée à la viande ou poisson", price: 2500, category: "Soupes", prepTime: 25 },
    { name: "Fried Rice", description: "Riz sauté aux légumes", price: 2500, category: "Plats Principaux", prepTime: 20 },
    { name: "Akara", description: "Beignets de haricots", price: 1000, category: "Petit Déjeuner", prepTime: 30 },
  ],
  
  Ghanéenne: [
    { name: "Jollof Rice Ghana", description: "Riz épicé ghanéen", price: 2000, category: "Plats Principaux", prepTime: 30, isPopular: true },
    { name: "Waakye", description: "Riz et haricots rouges", price: 2000, category: "Plats Principaux", prepTime: 40, isPopular: true },
    { name: "Fufu with Light Soup", description: "Pâte avec soupe légère", price: 2500, category: "Plats Principaux", prepTime: 30 },
    { name: "Kenkey with Fish", description: "Boulette de maïs fermenté avec poisson", price: 2000, category: "Plats Principaux", prepTime: 35 },
    { name: "Red Red", description: "Haricots noirs en sauce", price: 2000, category: "Plats Principaux", prepTime: 25 },
    { name: "Kelewele", description: "Plantains épicés frits", price: 1500, category: "Snacks", prepTime: 15, isNew: true },
    { name: "Banku with Tilapia", description: "Pâte de maïs avec tilapia grillé", price: 3000, category: "Plats Principaux", prepTime: 30 },
  ],
  
  Kenyane: [
    { name: "Nyama Choma", description: "Viande grillée kenyane", price: 4500, category: "Grillades", prepTime: 45, isPopular: true },
    { name: "Ugali with Sukuma", description: "Polenta de maïs avec épinards", price: 2000, category: "Plats Principaux", prepTime: 25, isPopular: true },
    { name: "Samosas", description: "Beignets farcis épicés", price: 1500, category: "Entrées", prepTime: 20 },
    { name: "Pilau", description: "Riz épicé à la viande", price: 2500, category: "Plats Principaux", prepTime: 35 },
    { name: "Matoke", description: "Bananes plantain en ragoût", price: 2500, category: "Plats Principaux", prepTime: 30 },
    { name: "Chapati", description: "Pain plat indien-kényen", price: 500, category: "Accompagnements", prepTime: 15 },
    { name: "Irio", description: "Purée de maïs, pois et pommes de terre", price: 2000, category: "Accompagnements", prepTime: 20 },
  ],
  
  Marocaine: [
    { name: "Tagine Poulet Citron", description: "Poulet aux olives et citron confit", price: 4500, category: "Plats Principaux", prepTime: 60, isPopular: true },
    { name: "Couscous Royal", description: "Couscous avec légumes et viandes", price: 5000, category: "Plats Principaux", prepTime: 45, isPopular: true },
    { name: "Pastilla", description: "Feuilleté au pigeon et amandes", price: 4000, category: "Entrées", prepTime: 50 },
    { name: "Harira", description: "Soupe marocaine aux lentilles", price: 2000, category: "Soupes", prepTime: 40 },
    { name: "Kefta Tagine", description: "Boulettes de viande en sauce", price: 3500, category: "Plats Principaux", prepTime: 35 },
    { name: "Mechoui", description: "Agneau entier rôti", price: 8000, category: "Grillades", prepTime: 120 },
    { name: "Zaalouk", description: "Caviar d'aubergines", price: 1500, category: "Entrées", prepTime: 25 },
  ],
  
  Tunisienne: [
    { name: "Couscous Tunisien", description: "Couscous aux légumes et viande", price: 4000, category: "Plats Principaux", prepTime: 45, isPopular: true },
    { name: "Brik à l'Œuf", description: "Feuilleté à l'œuf et thon", price: 2500, category: "Entrées", prepTime: 15, isPopular: true },
    { name: "Lablabi", description: "Soupe de pois chiches", price: 1500, category: "Soupes", prepTime: 30 },
    { name: "Mloukhia", description: "Ragoût de corète", price: 3500, category: "Plats Principaux", prepTime: 60 },
    { name: "Tajine Tunisiens", description: "Gratin de viande et légumes", price: 3500, category: "Plats Principaux", prepTime: 45 },
    { name: "Fricassée", description: "Sandwich frit tunisien", price: 2000, category: "Snacks", prepTime: 20 },
  ],
  
  Égyptienne: [
    { name: "Koshari", description: "Mélange de riz, lentilles et pâtes", price: 2000, category: "Plats Principaux", prepTime: 35, isPopular: true },
    { name: "Foul Medames", description: "Fèves mijotées", price: 1500, category: "Petit Déjeuner", prepTime: 30, isPopular: true },
    { name: "Falafel Ta'amiya", description: "Beignets de fèves égyptiens", price: 1500, category: "Entrées", prepTime: 20 },
    { name: "Molokhia", description: "Soupe de corète verte", price: 2500, category: "Plats Principaux", prepTime: 40 },
    { name: "Kebab Halabi", description: "Brochettes de viande", price: 4500, category: "Grillades", prepTime: 25 },
    { name: "Mahshi", description: "Légumes farcis", price: 3000, category: "Plats Principaux", prepTime: 50 },
  ],
  
  Africaine: [
    { name: "Poulet Moambé", description: "Poulet à la sauce en noix de palme", price: 4000, category: "Plats Principaux", prepTime: 45, isPopular: true },
    { name: "Poulet DG", description: "Poulet sauté plantain", price: 4500, category: "Plats Principaux", prepTime: 30, isPopular: true },
    { name: "Riz Sauté Africain", description: "Riz sauté aux légumes et épices", price: 2500, category: "Plats Principaux", prepTime: 20 },
    { name: "Brochettes Africaines", description: "Brochettes de bœuf marinées", price: 3500, category: "Grillades", prepTime: 25 },
    { name: "Bananes Plantain Frites", description: "Alloco / Aloco", price: 1500, category: "Accompagnements", prepTime: 15 },
  ],
  
  Guinéenne: [
    { name: "Poulet Yassa Guinéen", description: "Poulet mariné au citron et oignons caramélisés", price: 45000, category: "Plats Principaux", prepTime: 35, isPopular: true },
    { name: "Fou Fou Guinéen", description: "Ragoût de fonio aux arachides", price: 35000, category: "Plats Traditionnels", prepTime: 40, isPopular: true },
    { name: "Riz Gras Guinéen", description: "Riz aux tomates et légumes", price: 25000, category: "Plats Principaux", prepTime: 25 },
    { name: "Poisson Braisé Guinéen", description: "Poisson entier grillé aux épices locales", price: 50000, category: "Grillades", prepTime: 30 },
    { name: "Konkoé", description: "Pâte de manioc avec sauce aux arachides", price: 30000, category: "Plats Traditionnels", prepTime: 30 },
    { name: "Tô Maïs", description: "Maïs bouilli avec sauce", price: 20000, category: "Accompagnements", prepTime: 20 },
  ],
  
  Grillades: [
    { name: "Mix Grill", description: "Assortiment de grillades", price: 6000, category: "Grillades", prepTime: 30, isPopular: true },
    { name: "Brochettes de Bœuf", description: "Brochettes marinées aux épices", price: 4000, category: "Grillades", prepTime: 20 },
    { name: "Côtes d'Agneau", description: "Côtes grillées aux herbes", price: 5500, category: "Grillades", prepTime: 25 },
    { name: "Poulet Grillé Entier", description: "Poulet entier grillé", price: 5000, category: "Grillades", prepTime: 45 },
  ],
  
  Boissons: [
    { name: "Jus de Bissap", description: "Jus de fleur d'hibiscus", price: 750, category: "Boissons", prepTime: 5, isPopular: true },
    { name: "Jus de Gingembre", description: "Jus de gingembre frais", price: 750, category: "Boissons", prepTime: 5, isPopular: true },
    { name: "Café Touba", description: "Café épicé sénégalais", price: 500, category: "Boissons", prepTime: 5 },
    { name: "Ataya", description: "Thé à la menthe", price: 500, category: "Boissons", prepTime: 10 },
    { name: "Jus de Baobab", description: "Jus de fruit de baobab", price: 1000, category: "Boissons", prepTime: 5, isNew: true },
    { name: "Eau Minérale", description: "Eau minérale naturelle", price: 500, category: "Boissons", prepTime: 0 },
    { name: "Soda Local", description: "Boisson gazeuse locale", price: 750, category: "Boissons", prepTime: 0 },
  ],
  
  Desserts: [
    { name: "Pastèque Fraîche", description: "Tranches de pastèque", price: 1500, category: "Desserts", prepTime: 5 },
    { name: "Banane Flambee", description: "Banane flambée au rhum", price: 2500, category: "Desserts", prepTime: 10 },
    { name: "Fruits de Saison", description: "Assiette de fruits frais", price: 2000, category: "Desserts", prepTime: 10 },
    { name: "Glaces Artisanales", description: "Glaces faites maison", price: 2000, category: "Desserts", prepTime: 5 },
    { name: "Gâteau Africain", description: "Gâteau traditionnel", price: 2000, category: "Desserts", prepTime: 5 },
  ],
};

// ============================================
// COUNTRIES CONFIGURATION
// ============================================

const COUNTRIES = [
  { code: 'CI', name: 'Côte d\'Ivoire', dialCode: '+225', currency: 'XOF', language: 'fr', timezone: 'Africa/Abidjan' },
  { code: 'SN', name: 'Sénégal', dialCode: '+221', currency: 'XOF', language: 'fr', timezone: 'Africa/Dakar' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', currency: 'NGN', language: 'en', timezone: 'Africa/Lagos' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', currency: 'GHS', language: 'en', timezone: 'Africa/Accra' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', currency: 'KES', language: 'en', timezone: 'Africa/Nairobi' },
  { code: 'MA', name: 'Maroc', dialCode: '+212', currency: 'MAD', language: 'fr', timezone: 'Africa/Casablanca' },
  { code: 'TN', name: 'Tunisie', dialCode: '+216', currency: 'TND', language: 'fr', timezone: 'Africa/Tunis' },
  { code: 'EG', name: 'Égypte', dialCode: '+20', currency: 'EGP', language: 'ar', timezone: 'Africa/Cairo' },
  { code: 'ZA', name: 'Afrique du Sud', dialCode: '+27', currency: 'ZAR', language: 'en', timezone: 'Africa/Johannesburg' },
  { code: 'CM', name: 'Cameroun', dialCode: '+237', currency: 'XAF', language: 'fr', timezone: 'Africa/Douala' },
  { code: 'CD', name: 'RD Congo', dialCode: '+243', currency: 'CDF', language: 'fr', timezone: 'Africa/Kinshasa' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', currency: 'RWF', language: 'fr', timezone: 'Africa/Kigali' },
  { code: 'TZ', name: 'Tanzanie', dialCode: '+255', currency: 'TZS', language: 'en', timezone: 'Africa/Dar_es_Salaam' },
  { code: 'UG', name: 'Ouganda', dialCode: '+256', currency: 'UGX', language: 'en', timezone: 'Africa/Kampala' },
  { code: 'GN', name: 'Guinée', dialCode: '+224', currency: 'GNF', language: 'fr', timezone: 'Africa/Conakry' },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', currency: 'XOF', language: 'fr', timezone: 'Africa/Ouagadougou' },
  { code: 'ML', name: 'Mali', dialCode: '+223', currency: 'XOF', language: 'fr', timezone: 'Africa/Bamako' },
  { code: 'BJ', name: 'Bénin', dialCode: '+229', currency: 'XOF', language: 'fr', timezone: 'Africa/Porto-Novo' },
  { code: 'TG', name: 'Togo', dialCode: '+228', currency: 'XOF', language: 'fr', timezone: 'Africa/Lome' },
  { code: 'NE', name: 'Niger', dialCode: '+227', currency: 'XOF', language: 'fr', timezone: 'Africa/Niamey' },
];

// ============================================
// SEED FUNCTION
// ============================================

async function main() {
  console.log('🌱 Seeding Restaurant OS database...\n');

  // 1. Create Currencies
  console.log('💰 Creating currencies...');
  const currencyData = [
    { code: 'XOF', name: 'Franc CFA (BCEAO)', symbol: 'FCFA', decimalPlaces: 0, isActive: true },
    { code: 'XAF', name: 'Franc CFA (BEAC)', symbol: 'FCFA', decimalPlaces: 0, isActive: true },
    { code: 'NGN', name: 'Naira Nigérian', symbol: '₦', decimalPlaces: 2, isActive: true },
    { code: 'GHS', name: 'Cedi Ghanéen', symbol: 'GH₵', decimalPlaces: 2, isActive: true },
    { code: 'KES', name: 'Shilling Kenyan', symbol: 'KSh', decimalPlaces: 2, isActive: true },
    { code: 'MAD', name: 'Dirham Marocain', symbol: 'DH', decimalPlaces: 2, isActive: true },
    { code: 'TND', name: 'Dinar Tunisien', symbol: 'DT', decimalPlaces: 3, isActive: true },
    { code: 'EGP', name: 'Livre Égyptienne', symbol: 'E£', decimalPlaces: 2, isActive: true },
    { code: 'ZAR', name: 'Rand Sud-Africain', symbol: 'R', decimalPlaces: 2, isActive: true },
    { code: 'CDF', name: 'Franc Congolais', symbol: 'FC', decimalPlaces: 2, isActive: true },
    { code: 'RWF', name: 'Franc Rwandais', symbol: 'FRw', decimalPlaces: 0, isActive: true },
    { code: 'TZS', name: 'Shilling Tanzanien', symbol: 'TSh', decimalPlaces: 2, isActive: true },
    { code: 'UGX', name: 'Shilling Ougandais', symbol: 'USh', decimalPlaces: 0, isActive: true },
    { code: 'GNF', name: 'Franc Guinéen', symbol: 'GNF', decimalPlaces: 0, isActive: true },
    { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2, isActive: true },
    { code: 'USD', name: 'Dollar US', symbol: '$', decimalPlaces: 2, isActive: true },
  ];

  for (const currency of currencyData) {
    await db.currency.upsert({
      where: { code: currency.code },
      update: currency,
      create: currency,
    });
  }

  // 2. Create Countries (after currencies exist)
  console.log('🌍 Creating countries...');
  for (const country of COUNTRIES) {
    // Get the currency by code to find its ID
    const currency = await db.currency.findUnique({
      where: { code: country.currency },
    });
    
    if (!currency) {
      console.log(`  ⚠️ Skipping ${country.name} - currency ${country.currency} not found`);
      continue;
    }
    
    await db.country.upsert({
      where: { code: country.code },
      update: {
        name: country.name,
        dialCode: country.dialCode,
        defaultLanguage: country.language,
        timezone: country.timezone,
      },
      create: {
        code: country.code,
        name: country.name,
        dialCode: country.dialCode,
        currencyId: currency.id,
        defaultLanguage: country.language,
        timezone: country.timezone,
        taxIncluded: true,
        mobileMoneyEnabled: true,
      },
    });
  }

  // 3. Create Demo Organization
  console.log('🏢 Creating demo organization...');
  
  // Get country and currency IDs
  const ciCountry = await db.country.findUnique({ where: { code: 'CI' } });
  const xofCurrency = await db.currency.findUnique({ where: { code: 'XOF' } });
  
  if (!ciCountry || !xofCurrency) {
    throw new Error('Côte d\'Ivoire country or XOF currency not found');
  }
  
  const org = await db.organization.upsert({
    where: { slug: 'demo-organization' },
    update: {},
    create: {
      name: 'Africa Restaurant Group',
      slug: 'demo-organization',
      email: 'contact@africa-restaurants.com',
      phone: '+2250700000000',
      city: 'Abidjan',
      countryId: ciCountry.id,
      currencyId: xofCurrency.id,
      plan: 'BUSINESS',
      isActive: true,
    },
  });

  // Create organization settings
  await db.organizationSettings.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      minOrderAmount: 1000,
      maxDeliveryRadius: 15,
      defaultDeliveryFee: 500,
      orderPrepTime: 20,
      reservationEnabled: true,
      autoConfirmReservations: true,
      defaultTableTime: 120,
      noShowFee: 5000,
      acceptsCash: true,
      acceptsMobileMoney: true,
      acceptsCard: true,
      deliveryEnabled: true,
      loyaltyEnabled: true,
      pointsPerAmount: 1,
      pointValue: 10,
    },
  });

  // 4. Create Demo User (Admin)
  console.log('👤 Creating demo user...');
  const demoPassword = 'demo123456'; // Demo password for testing
  const hashedPassword = await bcrypt.hash(demoPassword, BCRYPT_SALT_ROUNDS);
  
  // Check if user exists first (by email or phone)
  let user = await db.user.findUnique({ where: { email: 'admin@demo.com' } });
  
  if (!user) {
    // Also check by phone
    user = await db.user.findUnique({ where: { phone: '+2250700000001' } });
  }
  
  if (!user) {
    user = await db.user.create({
      data: {
        email: 'admin@demo.com',
        phone: '+2250700000001',
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'Demo',
        role: 'ORG_ADMIN',
        isActive: true,
      },
    });
    console.log('  ✓ Demo user created with password: ' + demoPassword);
  } else {
    // Update existing user password to bcrypt hash
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });
    console.log('  ✓ Demo user password updated');
  }

  // Link user to organization
  await db.organizationUser.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
    update: {},
    create: {
      organizationId: org.id,
      userId: user.id,
      role: 'admin',
    },
  });

  // 5. Create Restaurants
  console.log('🍽️ Creating restaurants...');
  
  for (const [countryCode, restaurants] of Object.entries(AFRICAN_RESTAURANTS)) {
    // Get the country by code
    const country = await db.country.findUnique({ where: { code: countryCode } });
    if (!country) {
      console.log(`  ⚠️ Skipping country ${countryCode} - not found`);
      continue;
    }
    
    for (const restaurant of restaurants.slice(0, 2)) { // Limit to 2 per country
      try {
        const existingRestaurant = await db.restaurant.findFirst({
          where: { slug: restaurant.slug },
        });

        if (!existingRestaurant) {
          await db.restaurant.create({
            data: {
              organizationId: org.id,
              name: restaurant.name,
              slug: restaurant.slug,
              description: restaurant.slogan,
              phone: '+2250700000000',
              address: `${restaurant.district}, ${restaurant.city}`,
              city: restaurant.city,
              district: restaurant.district,
              countryId: country.id,
              restaurantType: restaurant.type,
              cuisines: JSON.stringify(restaurant.cuisine),
              priceRange: restaurant.priceRange,
              acceptsReservations: true,
              acceptsDelivery: true,
              acceptsTakeaway: true,
              acceptsDineIn: true,
              deliveryFee: 500,
              minOrderAmount: 1000,
              maxDeliveryRadius: 10,
              isActive: true,
              isOpen: true,
            },
          });
          console.log(`  ✓ Created ${restaurant.name}`);
        }
      } catch (error) {
        console.log(`  ⚠️ Skipping ${restaurant.name} - already exists or error`);
      }
    }
  }

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - ${currencyData.length} currencies`);
  console.log(`  - ${COUNTRIES.length} countries`);
  console.log(`  - Demo organization created`);
  console.log(`  - Demo admin user: admin@demo.com`);
  console.log(`  - Demo password: ${demoPassword}`);
  console.log(`  - Multiple restaurants across Africa`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

export { AFRICAN_RESTAURANTS, MENU_ITEMS, COUNTRIES };
