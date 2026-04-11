import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Demo menu items with full nutrition and allergen info
const DEMO_MENU_ITEMS = [
  {
    id: '1',
    name: 'Attieké Poisson Grillé',
    categoryId: 'main',
    categoryName: 'Plats Principaux',
    price: 3500,
    calories: 450,
    protein: 32,
    carbs: 45,
    fat: 18,
    fiber: 3,
    sodium: 680,
    sugar: 5,
    servingSize: '350g',
    allergens: ['fish', 'gluten'],
    allergenDetails: [
      { id: 'fish', name: 'Poisson', icon: '🐟', severity: 'CONTAINS' },
      { id: 'gluten', name: 'Gluten', icon: '🌾', severity: 'CONTAINS' }
    ],
    dietaryLabels: ['halal'],
    isVegetarian: false,
    isVegan: false,
    isHalal: true,
    isGlutenFree: false,
    isSpicy: false,
    spicyLevel: 0,
    image: null
  },
  {
    id: '2',
    name: 'Kedjenou de Poulet',
    categoryId: 'main',
    categoryName: 'Plats Principaux',
    price: 3200,
    calories: 380,
    protein: 28,
    carbs: 35,
    fat: 15,
    fiber: 2,
    sodium: 520,
    sugar: 3,
    servingSize: '300g',
    allergens: [],
    allergenDetails: [],
    dietaryLabels: ['halal', 'gluten-free'],
    isVegetarian: false,
    isVegan: false,
    isHalal: true,
    isGlutenFree: true,
    isSpicy: false,
    spicyLevel: 0,
    image: null
  },
  {
    id: '3',
    name: 'Thiéboudienne',
    categoryId: 'main',
    categoryName: 'Plats Principaux',
    price: 3000,
    calories: 520,
    protein: 25,
    carbs: 65,
    fat: 12,
    fiber: 4,
    sodium: 890,
    sugar: 4,
    servingSize: '400g',
    allergens: ['fish'],
    allergenDetails: [
      { id: 'fish', name: 'Poisson', icon: '🐟', severity: 'CONTAINS' }
    ],
    dietaryLabels: ['halal'],
    isVegetarian: false,
    isVegan: false,
    isHalal: true,
    isGlutenFree: false,
    isSpicy: true,
    spicyLevel: 2,
    image: null
  },
  {
    id: '4',
    name: 'Alloco Sauce Graine',
    categoryId: 'main',
    categoryName: 'Plats Principaux',
    price: 1500,
    calories: 420,
    protein: 8,
    carbs: 52,
    fat: 22,
    fiber: 5,
    sodium: 450,
    sugar: 8,
    servingSize: '250g',
    allergens: [],
    allergenDetails: [],
    dietaryLabels: ['vegetarian', 'vegan', 'halal', 'gluten-free'],
    isVegetarian: true,
    isVegan: true,
    isHalal: true,
    isGlutenFree: true,
    isSpicy: true,
    spicyLevel: 1,
    image: null
  },
  {
    id: '5',
    name: 'Riz Gras',
    categoryId: 'sides',
    categoryName: 'Accompagnements',
    price: 1200,
    calories: 380,
    protein: 6,
    carbs: 68,
    fat: 10,
    fiber: 1,
    sodium: 320,
    sugar: 2,
    servingSize: '200g',
    allergens: [],
    allergenDetails: [],
    dietaryLabels: ['vegetarian', 'vegan', 'halal', 'gluten-free'],
    isVegetarian: true,
    isVegan: true,
    isHalal: true,
    isGlutenFree: true,
    isSpicy: false,
    spicyLevel: 0,
    image: null
  },
  {
    id: '6',
    name: 'Garba',
    categoryId: 'main',
    categoryName: 'Plats Principaux',
    price: 2000,
    calories: 350,
    protein: 18,
    carbs: 42,
    fat: 12,
    fiber: 2,
    sodium: 750,
    sugar: 3,
    servingSize: '280g',
    allergens: ['fish'],
    allergenDetails: [
      { id: 'fish', name: 'Poisson', icon: '🐟', severity: 'CONTAINS' }
    ],
    dietaryLabels: ['halal', 'gluten-free'],
    isVegetarian: false,
    isVegan: false,
    isHalal: true,
    isGlutenFree: true,
    isSpicy: true,
    spicyLevel: 3,
    image: null
  },
  {
    id: '7',
    name: 'Foutou Banane',
    categoryId: 'sides',
    categoryName: 'Accompagnements',
    price: 1000,
    calories: 320,
    protein: 4,
    carbs: 72,
    fat: 2,
    fiber: 6,
    sodium: 180,
    sugar: 15,
    servingSize: '200g',
    allergens: [],
    allergenDetails: [],
    dietaryLabels: ['vegetarian', 'vegan', 'halal', 'gluten-free'],
    isVegetarian: true,
    isVegan: true,
    isHalal: true,
    isGlutenFree: true,
    isSpicy: false,
    spicyLevel: 0,
    image: null
  },
  {
    id: '8',
    name: 'Jus de Bissap',
    categoryId: 'drinks',
    categoryName: 'Boissons',
    price: 500,
    calories: 120,
    protein: 1,
    carbs: 28,
    fat: 0,
    fiber: 0,
    sodium: 15,
    sugar: 25,
    servingSize: '300ml',
    allergens: [],
    allergenDetails: [],
    dietaryLabels: ['vegetarian', 'vegan', 'halal', 'gluten-free'],
    isVegetarian: true,
    isVegan: true,
    isHalal: true,
    isGlutenFree: true,
    isSpicy: false,
    spicyLevel: 0,
    image: null
  },
  {
    id: '9',
    name: 'Jus de Gingembre',
    categoryId: 'drinks',
    categoryName: 'Boissons',
    price: 500,
    calories: 95,
    protein: 1,
    carbs: 22,
    fat: 0,
    fiber: 0,
    sodium: 10,
    sugar: 20,
    servingSize: '300ml',
    allergens: [],
    allergenDetails: [],
    dietaryLabels: ['vegetarian', 'vegan', 'halal', 'gluten-free'],
    isVegetarian: true,
    isVegan: true,
    isHalal: true,
    isGlutenFree: true,
    isSpicy: true,
    spicyLevel: 1,
    image: null
  },
  {
    id: '10',
    name: 'Banane Plantain Frite',
    categoryId: 'sides',
    categoryName: 'Accompagnements',
    price: 800,
    calories: 280,
    protein: 2,
    carbs: 45,
    fat: 12,
    fiber: 3,
    sodium: 120,
    sugar: 12,
    servingSize: '150g',
    allergens: [],
    allergenDetails: [],
    dietaryLabels: ['vegetarian', 'vegan', 'halal', 'gluten-free'],
    isVegetarian: true,
    isVegan: true,
    isHalal: true,
    isGlutenFree: true,
    isSpicy: false,
    spicyLevel: 0,
    image: null
  },
  {
    id: '11',
    name: 'Poulet Braisé',
    categoryId: 'main',
    categoryName: 'Plats Principaux',
    price: 4000,
    calories: 420,
    protein: 35,
    carbs: 8,
    fat: 28,
    fiber: 0,
    sodium: 650,
    sugar: 2,
    servingSize: '300g',
    allergens: [],
    allergenDetails: [],
    dietaryLabels: ['halal', 'gluten-free'],
    isVegetarian: false,
    isVegan: false,
    isHalal: true,
    isGlutenFree: true,
    isSpicy: true,
    spicyLevel: 2,
    image: null
  },
  {
    id: '12',
    name: 'Soupe de Poisson',
    categoryId: 'main',
    categoryName: 'Plats Principaux',
    price: 3500,
    calories: 280,
    protein: 24,
    carbs: 12,
    fat: 15,
    fiber: 2,
    sodium: 820,
    sugar: 3,
    servingSize: '350ml',
    allergens: ['fish', 'shellfish'],
    allergenDetails: [
      { id: 'fish', name: 'Poisson', icon: '🐟', severity: 'CONTAINS' },
      { id: 'shellfish', name: 'Crustacés', icon: '🦐', severity: 'TRACES' }
    ],
    dietaryLabels: ['halal', 'gluten-free'],
    isVegetarian: false,
    isVegan: false,
    isHalal: true,
    isGlutenFree: true,
    isSpicy: true,
    spicyLevel: 2,
    image: null
  },
];

// GET - Filter menu items by various criteria
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const allergens = searchParams.get('allergens')?.split(',').filter(Boolean) || [];
  const dietaryLabels = searchParams.get('dietaryLabels')?.split(',').filter(Boolean) || [];
  const excludeAllergens = searchParams.get('excludeAllergens') === 'true';
  const search = searchParams.get('search')?.toLowerCase() || '';
  const category = searchParams.get('category');
  const maxCalories = searchParams.get('maxCalories') ? parseInt(searchParams.get('maxCalories')!) : null;
  const minProtein = searchParams.get('minProtein') ? parseInt(searchParams.get('minProtein')!) : null;
  const demo = searchParams.get('demo') === 'true';

  try {
    // Demo mode - filter demo data
    if (demo || true) { // Using demo data for now
      let filteredItems = [...DEMO_MENU_ITEMS];

      // Filter by search term
      if (search) {
        filteredItems = filteredItems.filter(item =>
          item.name.toLowerCase().includes(search)
        );
      }

      // Filter by category
      if (category && category !== 'all') {
        filteredItems = filteredItems.filter(item =>
          item.categoryId === category || item.categoryName === category
        );
      }

      // Filter by max calories
      if (maxCalories) {
        filteredItems = filteredItems.filter(item =>
          (item.calories || 0) <= maxCalories
        );
      }

      // Filter by min protein
      if (minProtein) {
        filteredItems = filteredItems.filter(item =>
          (item.protein || 0) >= minProtein
        );
      }

      // Filter by dietary labels
      if (dietaryLabels.length > 0) {
        filteredItems = filteredItems.filter(item => {
          // Check boolean flags
          if (dietaryLabels.includes('vegetarian') && !item.isVegetarian) return false;
          if (dietaryLabels.includes('vegan') && !item.isVegan) return false;
          if (dietaryLabels.includes('halal') && !item.isHalal) return false;
          if (dietaryLabels.includes('gluten-free') && !item.isGlutenFree) return false;
          return true;
        });
      }

      // Filter by allergens
      if (allergens.length > 0) {
        if (excludeAllergens) {
          // Exclude items containing any of the specified allergens
          filteredItems = filteredItems.filter(item =>
            !item.allergens.some(a => allergens.includes(a))
          );
        } else {
          // Include items containing any of the specified allergens
          filteredItems = filteredItems.filter(item =>
            item.allergens.some(a => allergens.includes(a))
          );
        }
      }

      // Calculate summary stats
      const stats = {
        totalItems: filteredItems.length,
        avgCalories: filteredItems.length > 0
          ? Math.round(filteredItems.reduce((sum, item) => sum + (item.calories || 0), 0) / filteredItems.length)
          : 0,
        avgProtein: filteredItems.length > 0
          ? Math.round(filteredItems.reduce((sum, item) => sum + (item.protein || 0), 0) / filteredItems.length)
          : 0,
        vegetarianCount: filteredItems.filter(i => i.isVegetarian).length,
        veganCount: filteredItems.filter(i => i.isVegan).length,
        halalCount: filteredItems.filter(i => i.isHalal).length,
        glutenFreeCount: filteredItems.filter(i => i.isGlutenFree).length,
      };

      return NextResponse.json({
        success: true,
        data: filteredItems,
        stats,
        filters: {
          allergens,
          dietaryLabels,
          excludeAllergens,
          search,
          category,
          maxCalories,
          minProtein
        }
      });
    }

    // Real database query (for future use when schema is properly set up)
    return NextResponse.json({
      success: true,
      data: DEMO_MENU_ITEMS,
      stats: {}
    });
  } catch (error) {
    console.error('Error filtering menu items:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du filtrage'
    }, { status: 500 });
  }
}
