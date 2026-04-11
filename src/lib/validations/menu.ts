import { z } from 'zod';

// Menu type enum
export const menuTypeSchema = z.enum([
  'main',
  'brunch',
  'happy_hour',
  'special',
  'catering',
]);

// Item type enum
export const itemTypeSchema = z.enum([
  'food',
  'drink',
  'dessert',
  'side',
  'addon',
]);

// Create menu schema
export const createMenuSchema = z.object({
  type: z.literal('menu').optional(),
  restaurantId: z.string().min(1, 'Le restaurant est requis'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres').max(100),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
  availableDays: z.array(z.number().int().min(0).max(6)).optional(), // 0-6 for days of week
  availableStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format d\'heure invalide').optional(),
  availableEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format d\'heure invalide').optional(),
  menuType: menuTypeSchema.default('main'),
  sortOrder: z.number().int().min(0).default(0),
});

// Create category schema
export const createCategorySchema = z.object({
  type: z.literal('category'),
  menuId: z.string().min(1, 'Le menu est requis'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres').max(100),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
  icon: z.string().max(50).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

// Menu item variant schema
export const menuItemVariantSchema = z.object({
  name: z.string().min(1, 'Le nom de la variante est requis'),
  price: z.number().positive('Le prix doit etre positif'),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

// Menu item option value schema
export const menuItemOptionValueSchema = z.object({
  name: z.string().min(1, 'Le nom de l\'option est requis'),
  price: z.number().min(0).default(0),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

// Menu item option schema
export const menuItemOptionSchema = z.object({
  name: z.string().min(1, 'Le nom de l\'option est requis'),
  required: z.boolean().default(false),
  multiSelect: z.boolean().default(false),
  maxSelect: z.number().int().positive().optional(),
  values: z.array(menuItemOptionValueSchema).min(1, 'Au moins une valeur est requise'),
  sortOrder: z.number().int().min(0).default(0),
});

// Create menu item schema
export const createMenuItemSchema = z.object({
  type: z.literal('item'),
  categoryId: z.string().min(1, 'La categorie est requise'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres').max(200),
  description: z.string().max(1000).optional(),
  image: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  price: z.number().positive('Le prix doit etre positif'),
  discountPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  calories: z.number().int().positive().optional(),
  protein: z.number().positive().optional(),
  carbs: z.number().positive().optional(),
  fat: z.number().positive().optional(),
  fiber: z.number().positive().optional(),
  sodium: z.number().positive().optional(),
  prepTime: z.number().int().positive().optional(), // minutes
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isNew: z.boolean().default(false),
  itemType: itemTypeSchema.default('food'),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isHalal: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  isSpicy: z.boolean().default(false),
  spicyLevel: z.number().int().min(0).max(3).default(0),
  trackInventory: z.boolean().default(false),
  quantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().positive().default(5),
  sortOrder: z.number().int().min(0).default(0),
  variants: z.array(menuItemVariantSchema).optional(),
  options: z.array(menuItemOptionSchema).optional(),
});

// Update menu/category/item schema
export const updateMenuSchema = z.object({
  type: z.enum(['menu', 'category', 'item']),
  id: z.string().min(1, 'L\'ID est requis'),
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(1000).optional(),
  image: z.string().url().optional(),
  isActive: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  isNew: z.boolean().optional(),
  price: z.number().positive().optional(),
  prepTime: z.number().int().positive().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// Menu filter schema
export const menuFilterSchema = z.object({
  restaurantId: z.string().optional(),
  menuId: z.string().optional(),
  isActive: z.string().optional(),
  demo: z.string().optional(),
});

export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;
export type MenuFilterInput = z.infer<typeof menuFilterSchema>;
export type MenuItemVariantInput = z.infer<typeof menuItemVariantSchema>;
export type MenuItemOptionInput = z.infer<typeof menuItemOptionSchema>;
export type MenuType = z.infer<typeof menuTypeSchema>;
export type ItemType = z.infer<typeof itemTypeSchema>;
