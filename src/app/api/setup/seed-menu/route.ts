// Seed African Menu for KFM DELICE - Compatible with existing DB schema
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const AFRICAN_DISHES = [
  // PLATS IVOIRIENS
  {
    category: { name: 'Plats Ivoiriens', slug: 'plats-ivoiriens', icon: '🇨🇮' },
    items: [
      { name: 'Attiéké Poisson', description: 'Semoule de manioc avec poisson grillé et sauce tomate', price: 15000, isPopular: true },
      { name: 'Alloco', description: 'Bananes plantain frites, accompagnement ou plat principal', price: 5000 },
      { name: 'Foutou Banane', description: 'Pâte de banane plantain avec sauce graine ou arachide', price: 12000 },
      { name: 'Kedjenou', description: 'Ragoût de poulet cuit à l\'étouffée aux épices', price: 18000, isPopular: true },
      { name: 'Garba', description: 'Attiéké avec thon grillé et piment - snack ivoirien par excellence', price: 8000 },
      { name: 'Poulet Bicyclette', description: 'Poulet rôti fermier mariné aux épices locales', price: 20000 },
    ]
  },
  // PLATS SÉNÉGALAIS
  {
    category: { name: 'Plats Sénégalais', slug: 'plats-senegalais', icon: '🇸🇳' },
    items: [
      { name: 'Thiéboudienne', description: 'Riz au poisson et légumes, plat national sénégalais', price: 15000, isPopular: true, isFeatured: true },
      { name: 'Yassa Poulet', description: 'Poulet mariné au citron et oignons caramélisés', price: 18000, isPopular: true },
      { name: 'Mafé', description: 'Ragoût de viande à la sauce d\'arachide', price: 16000 },
      { name: 'Dibi', description: 'Agneau grillé aux épices, servi avec moutarde', price: 22000 },
      { name: 'Thiou', description: 'Ragoût de poisson aux légumes', price: 17000 },
      { name: 'Domoda', description: 'Ragoût de bœuf sauce arachide tomate', price: 16000 },
    ]
  },
  // PLATS GUINÉENS
  {
    category: { name: 'Plats Guinéens', slug: 'plats-guineens', icon: '🇬🇳' },
    items: [
      { name: 'Poulet Moambé', description: 'Poulet à la sauce de palme, spécialité guinéenne', price: 20000, isPopular: true },
      { name: 'Riz Gras', description: 'Riz sauté à la tomate avec viande et légumes', price: 12000 },
      { name: 'Foutou Igname', description: 'Pâte d\'igname avec sauce arachide ou graine', price: 14000 },
      { name: 'Konkoé', description: 'Haricots rouges en sauce, spécialité locale', price: 10000 },
      { name: 'Soupe Kandia', description: 'Soupe de gombo à la viande ou au poisson', price: 15000 },
      { name: 'Tô', description: 'Pâte de mil avec sauce feuille', price: 11000 },
    ]
  },
  // GRILLADES
  {
    category: { name: 'Grillades', slug: 'grillades', icon: '🔥' },
    items: [
      { name: 'Brochettes Bœuf', description: '5 brochettes de bœuf mariné aux épices', price: 12000, isPopular: true },
      { name: 'Brochettes Poulet', description: '5 brochettes de poulet mariné', price: 10000 },
      { name: 'Brochettes Agneau', description: '5 brochettes d\'agneau tendre', price: 15000 },
      { name: 'Poisson Grillé Entier', description: 'Capitaine ou mérou grillé entier', price: 25000, isFeatured: true },
      { name: 'Poulet Grillé Entier', description: 'Demi-poulet grillé mariné', price: 18000 },
    ]
  },
  // ACCOMPAGNEMENTS
  {
    category: { name: 'Accompagnements', slug: 'accompagnements', icon: '🍚' },
    items: [
      { name: 'Riz Blanc', description: 'Riz blanc parfumé', price: 3000 },
      { name: 'Attiéké', description: 'Semoule de manioc fraîche', price: 4000 },
      { name: 'Frites', description: 'Pommes de terre frites maison', price: 5000 },
      { name: 'Salade Simple', description: 'Laitue, tomate, oignon, vinaigrette', price: 4000 },
      { name: 'Légumes Sautés', description: 'Mélange de légumes frais sautés', price: 6000 },
    ]
  },
  // BOISSONS
  {
    category: { name: 'Boissons', slug: 'boissons', icon: '🥤' },
    items: [
      { name: 'Bissap', description: 'Jus d\'hibiscus rafraîchissant', price: 3000, isPopular: true },
      { name: 'Gingembre', description: 'Jus de gingembre épicé', price: 3000 },
      { name: 'Dolo', description: 'Bière de mil traditionnelle', price: 4000 },
      { name: 'Pain de Singe', description: 'Jus de baobab', price: 3500 },
      { name: 'Eau Minérale', description: 'Eau minérale 50cl', price: 2000 },
      { name: 'Coca-Cola', description: 'Coca-Cola 33cl', price: 2500 },
      { name: 'Jus de Fruit Frais', description: 'Orange, ananas ou mangue pressé', price: 5000 },
    ]
  },
  // DESSERTS
  {
    category: { name: 'Desserts', slug: 'desserts', icon: '🍰' },
    items: [
      { name: 'Banane Flambée', description: 'Banane caramélisée flambée', price: 6000 },
      { name: 'Fruits de Saison', description: 'Assortiment de fruits frais locaux', price: 5000 },
      { name: 'Thiakry', description: 'Dessert de mil au lait et sucre', price: 4500 },
      { name: 'Glaces', description: '2 boules au choix', price: 5000 },
    ]
  }
];

export async function GET() {
  try {
    console.log('Seeding KFM DELICE menu with African dishes...');

    // Find the organization first
    const org = await db.organization.findFirst({
      where: { slug: 'kfm-delice-org' },
    });

    if (!org) {
      return NextResponse.json({ 
        success: false, 
        error: 'Organisation KFM DELICE non trouvée. Exécutez d\'abord /api/quick-setup' 
      }, { status: 404 });
    }

    // Find restaurant using raw query to avoid column issues
    const restaurants = await db.$queryRaw<any[]>`
      SELECT id, name, slug FROM "Restaurant" 
      WHERE "organizationId" = ${org.id}
      LIMIT 1
    `;

    if (!restaurants || restaurants.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Restaurant KFM DELICE non trouvé' 
      }, { status: 404 });
    }

    const restaurant = restaurants[0];

    // Get or create main menu
    let menu = await db.menu.findFirst({ 
      where: { restaurantId: restaurant.id } 
    });

    if (!menu) {
      menu = await db.menu.create({
        data: {
          restaurantId: restaurant.id,
          name: 'Menu Principal',
          slug: 'menu-principal',
          isActive: true,
        },
      });
    }

    let categoriesCreated = 0;
    let itemsCreated = 0;

    // Create categories and items
    for (const categoryData of AFRICAN_DISHES) {
      // Create or update category
      let category = await db.menuCategory.findFirst({
        where: { 
          menuId: menu.id, 
          slug: categoryData.category.slug 
        },
      });

      if (!category) {
        category = await db.menuCategory.create({
          data: {
            menuId: menu.id,
            name: categoryData.category.name,
            slug: categoryData.category.slug,
            icon: categoryData.category.icon,
            isActive: true,
          },
        });
        categoriesCreated++;
      }

      // Create items for this category
      for (const item of categoryData.items) {
        const existingItem = await db.menuItem.findFirst({
          where: { 
            categoryId: category.id, 
            slug: item.name.toLowerCase().replace(/\s+/g, '-') 
          },
        });

        if (!existingItem) {
          await db.menuItem.create({
            data: {
              categoryId: category.id,
              name: item.name,
              slug: item.name.toLowerCase().replace(/\s+/g, '-'),
              description: item.description,
              price: item.price,
              isAvailable: true,
              isPopular: item.isPopular || false,
              isFeatured: item.isFeatured || false,
            },
          });
          itemsCreated++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Menu africain créé avec succès!',
      stats: {
        categories: categoriesCreated,
        items: itemsCreated,
        totalCategories: AFRICAN_DISHES.length,
        totalItems: AFRICAN_DISHES.reduce((acc, cat) => acc + cat.items.length, 0),
      },
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
      },
      menuUrl: '/menu/kfm-delice',
    });
  } catch (error: any) {
    console.error('Menu seed error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Erreur lors de la création du menu' 
    }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
