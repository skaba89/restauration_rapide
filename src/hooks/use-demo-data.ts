// ============================================
// RESTAURANT OS - Demo Data Hook
// Provides consistent demo data when database is empty
// ============================================

import { useMemo } from 'react';

// ============================================
// Types
// ============================================

export interface DemoCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface DemoMenuItem {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discountPrice?: number;
  image?: string;
  prepTime?: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isNew: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isHalal?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  spicyLevel?: number;
  calories?: number;
}

export interface DemoOrder {
  id: string;
  orderNumber: string;
  restaurantId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderType: 'DELIVERY' | 'DINE_IN' | 'TAKEAWAY';
  source: string;
  status: string;
  paymentStatus: string;
  tableNumber?: string;
  subtotal: number;
  discount?: number;
  deliveryFee?: number;
  tax?: number;
  total: number;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryNotes?: string;
  notes?: string;
  createdAt: Date;
  confirmedAt?: Date;
  preparingAt?: Date;
  readyAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  items: Array<{
    id: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    status?: string;
  }>;
  delivery?: {
    id: string;
    status: string;
    driver?: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
      avatar?: string;
      vehicleType?: string;
      rating?: number;
    };
  };
}

export interface DemoDelivery {
  id: string;
  orderId: string;
  organizationId: string;
  pickupAddress: string;
  dropoffAddress: string;
  dropoffNotes?: string;
  status: string;
  deliveryFee: number;
  driverEarning: number;
  tip: number;
  distance?: number;
  estimatedTime?: number;
  assignedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatar?: string;
    vehicleType?: string;
    vehiclePlate?: string;
    currentLat?: number;
    currentLng?: number;
    isAvailable?: boolean;
  };
  order: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    total: number;
    restaurant: {
      name: string;
      address: string;
      phone?: string;
    };
    items: Array<{ itemName: string; quantity: number }>;
  };
  createdAt: Date;
}

export interface DemoRestaurant {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  currency: string;
  currencySymbol: string;
  openingHours: Record<string, { open: string; close: string }>;
  deliveryZones: Array<{
    id: string;
    name: string;
    fee: number;
    minOrder?: number;
  }>;
}

// ============================================
// Demo Data Constants
// ============================================

export const DEMO_RESTAURANT: DemoRestaurant = {
  id: 'kfm-delice-1',
  name: 'KFM DELICE',
  slug: 'kfm-delice',
  address: 'Kaloum, Conakry, Guinée',
  phone: '+224622000001',
  email: 'contact@kfm-delice.com',
  description: 'Restaurant africain authentique - Saveurs de Guinée',
  currency: 'GNF',
  currencySymbol: 'GNF',
  openingHours: {
    monday: { open: '08:00', close: '22:00' },
    tuesday: { open: '08:00', close: '22:00' },
    wednesday: { open: '08:00', close: '22:00' },
    thursday: { open: '08:00', close: '22:00' },
    friday: { open: '08:00', close: '23:00' },
    saturday: { open: '09:00', close: '23:00' },
    sunday: { open: '10:00', close: '21:00' },
  },
  deliveryZones: [
    { id: 'zone-1', name: 'Kaloum', fee: 5000, minOrder: 15000 },
    { id: 'zone-2', name: 'Dixinn', fee: 7000, minOrder: 20000 },
    { id: 'zone-3', name: 'Ratoma', fee: 8000, minOrder: 20000 },
    { id: 'zone-4', name: 'Matam', fee: 8000, minOrder: 20000 },
    { id: 'zone-5', name: 'Matoto', fee: 10000, minOrder: 25000 },
  ],
};

export const DEMO_CATEGORIES: DemoCategory[] = [
  { id: 'cat-1', name: 'Plats Ivoiriens', slug: 'plats-ivoiriens', description: 'Spécialités de Côte d\'Ivoire', icon: '🍽️', isActive: true, sortOrder: 1 },
  { id: 'cat-2', name: 'Plats Sénégalais', slug: 'plats-senegalais', description: 'Cuisine sénégalaise authentique', icon: '🍚', isActive: true, sortOrder: 2 },
  { id: 'cat-3', name: 'Plats Guinéens', slug: 'plats-guineens', description: 'Saveurs traditionnelles de Guinée', icon: '🥘', isActive: true, sortOrder: 3 },
  { id: 'cat-4', name: 'Grillades', slug: 'grillades', description: 'Viandes et poissons grillés', icon: '🍖', isActive: true, sortOrder: 4 },
  { id: 'cat-5', name: 'Fast Food', slug: 'fast-food', description: 'Burgers, tacos et plus', icon: '🍔', isActive: true, sortOrder: 5 },
  { id: 'cat-6', name: 'Accompagnements', slug: 'accompagnements', description: 'Frites, sauces et légumes', icon: '🍟', isActive: true, sortOrder: 6 },
  { id: 'cat-7', name: 'Boissons', slug: 'boissons', description: 'Jus frais et boissons', icon: '🥤', isActive: true, sortOrder: 7 },
  { id: 'cat-8', name: 'Desserts', slug: 'desserts', description: 'Douceurs et desserts', icon: '🍰', isActive: true, sortOrder: 8 },
];

export const DEMO_MENU_ITEMS: DemoMenuItem[] = [
  // Plats Ivoiriens
  { id: 'item-1', categoryId: 'cat-1', name: 'Attieké Poisson Grillé', slug: 'attieke-poisson-grille', price: 15000, description: 'Semoule de manioc avec poisson grillé et sauce tomate', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', prepTime: 20, isAvailable: true, isFeatured: true, isPopular: true, isNew: false },
  { id: 'item-2', categoryId: 'cat-1', name: 'Garba', slug: 'garba', price: 8000, description: 'Attieké au thon frit avec piment', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', prepTime: 15, isAvailable: true, isFeatured: true, isPopular: true, isNew: false, isSpicy: true, spicyLevel: 2 },
  { id: 'item-3', categoryId: 'cat-1', name: 'Kedjenou de Poulet', slug: 'kedjenou-de-poulet', price: 18000, description: 'Poulet braisé aux légumes dans une sauce épaisse', image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400', prepTime: 25, isAvailable: true, isFeatured: true, isPopular: true, isNew: false },
  { id: 'item-4', categoryId: 'cat-1', name: 'Alloco Sauce Graine', slug: 'alloco-sauce-graine', price: 10000, description: 'Bananes plantain frites avec sauce graine', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400', prepTime: 15, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, isVegetarian: true },
  
  // Plats Sénégalais
  { id: 'item-5', categoryId: 'cat-2', name: 'Thiéboudienne', slug: 'thieboudienne', price: 15000, description: 'Riz au poisson et légumes, plat national sénégalais', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400', prepTime: 30, isAvailable: true, isFeatured: true, isPopular: true, isNew: false },
  { id: 'item-6', categoryId: 'cat-2', name: 'Yassa Poulet', slug: 'yassa-poulet', price: 16000, description: 'Poulet mariné au citron et oignons caramélisés', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', prepTime: 25, isAvailable: true, isFeatured: false, isPopular: true, isNew: true },
  { id: 'item-7', categoryId: 'cat-2', name: 'Mafé', slug: 'mafe', price: 14000, description: 'Ragoût de viande à la sauce d\'arachide', image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400', prepTime: 30, isAvailable: true, isFeatured: false, isPopular: false, isNew: false },
  
  // Plats Guinéens
  { id: 'item-8', categoryId: 'cat-3', name: 'Konkoé', slug: 'konkoe', price: 12000, description: 'Ragoût de poisson fumé aux légumes', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', prepTime: 25, isAvailable: true, isFeatured: true, isPopular: true, isNew: false },
  { id: 'item-9', categoryId: 'cat-3', name: 'Fou Fou', slug: 'fou-fou', price: 10000, description: 'Pâte de manioc avec sauce feuilles', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400', prepTime: 20, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: true },
  
  // Grillades
  { id: 'item-10', categoryId: 'cat-4', name: 'Brochettes de Poulet', slug: 'brochettes-poulet', price: 8000, description: 'Brochettes de poulet mariné grillées', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', prepTime: 15, isAvailable: true, isFeatured: true, isPopular: true, isNew: false },
  { id: 'item-11', categoryId: 'cat-4', name: 'Poulet Braisé', slug: 'poulet-braise', price: 15000, description: 'Demi-poulet grillé aux épices', image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400', prepTime: 20, isAvailable: true, isFeatured: false, isPopular: true, isNew: false },
  { id: 'item-12', categoryId: 'cat-4', name: 'Mix Grill', slug: 'mix-grill', price: 25000, description: 'Assortiment de viandes grillées', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', prepTime: 25, isAvailable: true, isFeatured: true, isPopular: false, isNew: true },
  
  // Fast Food
  { id: 'item-13', categoryId: 'cat-5', name: 'Burger Africain', slug: 'burger-africain', price: 12000, description: 'Burger avec sauce attiéké', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', prepTime: 15, isAvailable: true, isFeatured: false, isPopular: true, isNew: true },
  { id: 'item-14', categoryId: 'cat-5', name: 'Chawarma Poulet', slug: 'chawarma-poulet', price: 10000, description: 'Chawarma au poulet épicé', image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400', prepTime: 10, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, isSpicy: true, spicyLevel: 1 },
  
  // Accompagnements
  { id: 'item-15', categoryId: 'cat-6', name: 'Frites', slug: 'frites', price: 5000, description: 'Frites maison croustillantes', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', prepTime: 10, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: true },
  { id: 'item-16', categoryId: 'cat-6', name: 'Attieké', slug: 'attieke', price: 4000, description: 'Semoule de manioc', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', prepTime: 5, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: true, isVegan: true },
  { id: 'item-17', categoryId: 'cat-6', name: 'Riz Blanc', slug: 'riz-blanc', price: 3000, description: 'Riz blanc parfumé', image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400', prepTime: 5, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: true, isVegan: true },
  
  // Boissons
  { id: 'item-18', categoryId: 'cat-7', name: 'Jus de Bissap', slug: 'jus-bissap', price: 3000, description: 'Jus naturel d\'hibiscus', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', prepTime: 3, isAvailable: true, isFeatured: true, isPopular: true, isNew: false, isVegetarian: true, isVegan: true },
  { id: 'item-19', categoryId: 'cat-7', name: 'Jus de Gingembre', slug: 'jus-gingembre', price: 3000, description: 'Jus de gingembre frais', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', prepTime: 3, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, isVegetarian: true, isVegan: true },
  { id: 'item-20', categoryId: 'cat-7', name: 'Café Touba', slug: 'cafe-touba', price: 2000, description: 'Café épicé sénégalais', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', prepTime: 5, isAvailable: true, isFeatured: false, isPopular: false, isNew: true, isVegetarian: true, isVegan: true },
  { id: 'item-21', categoryId: 'cat-7', name: 'Ataya', slug: 'ataya', price: 2500, description: 'Thé vert à la menthe', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', prepTime: 5, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: true, isVegan: true },
  
  // Desserts
  { id: 'item-22', categoryId: 'cat-8', name: 'Thiakry', slug: 'thiakry', price: 5000, description: 'Semoule sucrée au lait', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', prepTime: 5, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, isVegetarian: true },
  { id: 'item-23', categoryId: 'cat-8', name: 'Fruits Frais', slug: 'fruits-frais', price: 6000, description: 'Assortiment de fruits de saison', image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400', prepTime: 5, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: true, isVegan: true },
  { id: 'item-24', categoryId: 'cat-8', name: 'Glaces', slug: 'glaces', price: 4000, description: 'Glaces maison', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400', prepTime: 2, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: true },
];

export const DEMO_ORDERS: DemoOrder[] = [
  {
    id: 'demo-ord-1',
    orderNumber: 'ORD-2024-0145',
    restaurantId: 'kfm-delice-1',
    customerName: 'Kouamé Jean',
    customerPhone: '+224620000001',
    customerEmail: 'kouame@email.com',
    orderType: 'DELIVERY',
    source: 'web',
    status: 'PREPARING',
    paymentStatus: 'PENDING',
    subtotal: 30000,
    total: 35000,
    deliveryFee: 5000,
    deliveryAddress: 'Kaloum, Rue du Commerce',
    deliveryCity: 'Conakry',
    notes: 'Pas trop de piment',
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    items: [
      { id: 'item-ord-1', itemName: 'Attieké Poisson Grillé', quantity: 2, unitPrice: 15000, totalPrice: 30000, status: 'preparing' },
    ],
  },
  {
    id: 'demo-ord-2',
    orderNumber: 'ORD-2024-0144',
    restaurantId: 'kfm-delice-1',
    customerId: 'demo-cust-2',
    customerName: 'Aya Marie',
    customerPhone: '+224620000002',
    customerEmail: 'aya@email.com',
    orderType: 'DINE_IN',
    source: 'pos',
    tableNumber: 'T5',
    status: 'CONFIRMED',
    paymentStatus: 'PENDING',
    subtotal: 26000,
    total: 26000,
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    items: [
      { id: 'item-ord-2', itemName: 'Kedjenou de Poulet', quantity: 1, unitPrice: 18000, totalPrice: 18000, status: 'pending' },
      { id: 'item-ord-3', itemName: 'Jus de Bissap', quantity: 2, unitPrice: 4000, totalPrice: 8000, status: 'pending' },
    ],
  },
  {
    id: 'demo-ord-3',
    orderNumber: 'ORD-2024-0143',
    restaurantId: 'kfm-delice-1',
    customerName: 'Koné Ibrahim',
    customerPhone: '+224620000003',
    orderType: 'TAKEAWAY',
    source: 'app',
    status: 'READY',
    paymentStatus: 'PAID',
    subtotal: 23000,
    total: 23000,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    readyAt: new Date(Date.now() - 5 * 60 * 1000),
    items: [
      { id: 'item-ord-4', itemName: 'Thiéboudienne', quantity: 1, unitPrice: 15000, totalPrice: 15000, status: 'ready' },
      { id: 'item-ord-5', itemName: 'Jus de Gingembre', quantity: 2, unitPrice: 4000, totalPrice: 8000, status: 'ready' },
    ],
  },
  {
    id: 'demo-ord-4',
    orderNumber: 'ORD-2024-0142',
    restaurantId: 'kfm-delice-1',
    customerName: 'Diallo Fatou',
    customerPhone: '+224620000004',
    orderType: 'DELIVERY',
    source: 'web',
    status: 'OUT_FOR_DELIVERY',
    paymentStatus: 'PAID',
    subtotal: 15000,
    total: 20000,
    deliveryFee: 5000,
    deliveryAddress: 'Dixinn, Hamdallaye',
    deliveryCity: 'Conakry',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    pickedUpAt: new Date(Date.now() - 10 * 60 * 1000),
    items: [
      { id: 'item-ord-6', itemName: 'Poulet Braisé', quantity: 1, unitPrice: 15000, totalPrice: 15000, status: 'ready' },
    ],
    delivery: {
      id: 'del-1',
      status: 'PICKED_UP',
      driver: { id: 'driver-1', firstName: 'Amadou', lastName: 'Touré', phone: '+224621000001', vehicleType: 'motorcycle', rating: 4.8 },
    },
  },
  {
    id: 'demo-ord-5',
    orderNumber: 'ORD-2024-0141',
    restaurantId: 'kfm-delice-1',
    customerName: 'Touré Amadou',
    customerPhone: '+224620000005',
    orderType: 'DINE_IN',
    source: 'pos',
    tableNumber: 'T12',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    subtotal: 31000,
    total: 31000,
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
    completedAt: new Date(Date.now() - 30 * 60 * 1000),
    items: [
      { id: 'item-ord-7', itemName: 'Mix Grill', quantity: 1, unitPrice: 25000, totalPrice: 25000, status: 'served' },
      { id: 'item-ord-8', itemName: 'Jus de Bissap', quantity: 2, unitPrice: 3000, totalPrice: 6000, status: 'served' },
    ],
  },
  {
    id: 'demo-ord-6',
    orderNumber: 'ORD-2024-0140',
    restaurantId: 'kfm-delice-1',
    customerName: 'Bamba Ismaël',
    customerPhone: '+224620000006',
    orderType: 'DELIVERY',
    source: 'app',
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    subtotal: 38000,
    total: 45000,
    deliveryFee: 7000,
    deliveryAddress: 'Ratoma, Nongo',
    deliveryCity: 'Conakry',
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    confirmedAt: new Date(Date.now() - 8 * 60 * 1000),
    items: [
      { id: 'item-ord-9', itemName: 'Garba', quantity: 3, unitPrice: 8000, totalPrice: 24000, status: 'pending' },
      { id: 'item-ord-10', itemName: 'Jus de Gingembre', quantity: 3, unitPrice: 3000, totalPrice: 9000, status: 'pending' },
    ],
  },
  {
    id: 'demo-ord-7',
    orderNumber: 'ORD-2024-0139',
    restaurantId: 'kfm-delice-1',
    customerName: 'Koffi Emmanuel',
    customerPhone: '+224620000007',
    orderType: 'TAKEAWAY',
    source: 'web',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    subtotal: 8000,
    total: 8000,
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
    items: [
      { id: 'item-ord-11', itemName: 'Garba', quantity: 1, unitPrice: 8000, totalPrice: 8000, status: 'pending' },
    ],
  },
  {
    id: 'demo-ord-8',
    orderNumber: 'ORD-2024-0138',
    restaurantId: 'kfm-delice-1',
    customerName: 'Adjoua Rose',
    customerPhone: '+224620000008',
    orderType: 'DELIVERY',
    source: 'phone',
    status: 'CANCELLED',
    paymentStatus: 'REFUNDED',
    subtotal: 20000,
    total: 20000,
    cancellationReason: 'Client injoignable',
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    cancelledAt: new Date(Date.now() - 55 * 60 * 1000),
    items: [
      { id: 'item-ord-12', itemName: 'Fou Fou', quantity: 2, unitPrice: 10000, totalPrice: 20000, status: 'cancelled' },
    ],
  },
];

export const DEMO_DELIVERIES: DemoDelivery[] = [
  {
    id: 'demo-del-1',
    orderId: 'demo-ord-4',
    organizationId: 'demo-org-1',
    pickupAddress: 'KFM DELICE, Kaloum, Conakry',
    dropoffAddress: 'Dixinn, Hamdallaye',
    dropoffNotes: 'Près de la pharmacie',
    status: 'PICKED_UP',
    deliveryFee: 7000,
    driverEarning: 4900,
    tip: 0,
    distance: 4.5,
    estimatedTime: 25,
    assignedAt: new Date(Date.now() - 35 * 60 * 1000),
    pickedUpAt: new Date(Date.now() - 10 * 60 * 1000),
    driver: {
      id: 'demo-driver-1',
      firstName: 'Amadou',
      lastName: 'Touré',
      phone: '+224621000001',
      vehicleType: 'motorcycle',
      vehiclePlate: 'GR 1234 AB',
      currentLat: 9.6412,
      currentLng: -13.5784,
      isAvailable: false,
    },
    order: {
      orderNumber: 'ORD-2024-0142',
      customerName: 'Diallo Fatou',
      customerPhone: '+224620000004',
      total: 20000,
      restaurant: { name: 'KFM DELICE', address: 'Kaloum, Conakry', phone: '+224622000001' },
      items: [{ itemName: 'Poulet Braisé', quantity: 1 }],
    },
    createdAt: new Date(Date.now() - 40 * 60 * 1000),
  },
  {
    id: 'demo-del-2',
    orderId: 'demo-ord-new',
    organizationId: 'demo-org-1',
    pickupAddress: 'KFM DELICE, Kaloum, Conakry',
    dropoffAddress: 'Ratoma, Nongo',
    dropoffNotes: 'Maison verte',
    status: 'PENDING',
    deliveryFee: 7000,
    driverEarning: 4900,
    tip: 0,
    distance: 8.2,
    estimatedTime: 35,
    driver: undefined,
    order: {
      orderNumber: 'ORD-2024-0146',
      customerName: 'Bamba Ismaël',
      customerPhone: '+224620000006',
      total: 45000,
      restaurant: { name: 'KFM DELICE', address: 'Kaloum, Conakry', phone: '+224622000001' },
      items: [{ itemName: 'Garba', quantity: 3 }, { itemName: 'Jus de Gingembre', quantity: 3 }],
    },
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: 'demo-del-3',
    orderId: 'demo-ord-completed',
    organizationId: 'demo-org-1',
    pickupAddress: 'KFM DELICE, Kaloum, Conakry',
    dropoffAddress: 'Matoto, Cosa',
    status: 'DELIVERED',
    deliveryFee: 10000,
    driverEarning: 7000,
    tip: 5000,
    distance: 10.5,
    estimatedTime: 40,
    actualTime: 38,
    assignedAt: new Date(Date.now() - 90 * 60 * 1000),
    pickedUpAt: new Date(Date.now() - 85 * 60 * 1000),
    deliveredAt: new Date(Date.now() - 45 * 60 * 1000),
    driver: {
      id: 'demo-driver-2',
      firstName: 'Ibrahim',
      lastName: 'Koné',
      phone: '+224621000002',
      vehicleType: 'motorcycle',
      vehiclePlate: 'GR 5678 CD',
      currentLat: 9.7025,
      currentLng: -13.6875,
      isAvailable: true,
    },
    order: {
      orderNumber: 'ORD-2024-0140',
      customerName: 'Koffi Emmanuel',
      customerPhone: '+224620000007',
      total: 35000,
      restaurant: { name: 'KFM DELICE', address: 'Kaloum, Conakry', phone: '+224622000001' },
      items: [{ itemName: 'Attieké Poisson', quantity: 1 }],
    },
    createdAt: new Date(Date.now() - 95 * 60 * 1000),
  },
  {
    id: 'demo-del-4',
    orderId: 'demo-ord-search',
    organizationId: 'demo-org-1',
    pickupAddress: 'KFM DELICE, Kaloum, Conakry',
    dropoffAddress: 'Matam, Dixinn',
    status: 'SEARCHING_DRIVER',
    deliveryFee: 8000,
    driverEarning: 5600,
    tip: 0,
    distance: 5.5,
    estimatedTime: 28,
    driver: undefined,
    order: {
      orderNumber: 'ORD-2024-0147',
      customerName: 'Adjoua Rose',
      customerPhone: '+224620000008',
      total: 35000,
      restaurant: { name: 'KFM DELICE', address: 'Kaloum, Conakry', phone: '+224622000001' },
      items: [{ itemName: 'Fou Fou', quantity: 2 }],
    },
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
  },
];

// ============================================
// Hook
// ============================================

export function useDemoData() {
  const restaurant = useMemo(() => DEMO_RESTAURANT, []);
  const categories = useMemo(() => DEMO_CATEGORIES, []);
  const menuItems = useMemo(() => DEMO_MENU_ITEMS, []);
  const orders = useMemo(() => DEMO_ORDERS, []);
  const deliveries = useMemo(() => DEMO_DELIVERIES, []);
  
  const getItemsByCategory = useMemo(() => (categoryId: string) => {
    if (categoryId === 'all') return menuItems;
    return menuItems.filter(item => item.categoryId === categoryId);
  }, [menuItems]);
  
  const getPopularItems = useMemo(() => () => {
    return menuItems.filter(item => item.isPopular);
  }, [menuItems]);
  
  const getFeaturedItems = useMemo(() => () => {
    return menuItems.filter(item => item.isFeatured);
  }, [menuItems]);
  
  const getActiveOrders = useMemo(() => () => {
    return orders.filter(order => 
      !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status)
    );
  }, [orders]);
  
  const getPastOrders = useMemo(() => () => {
    return orders.filter(order => 
      ['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status)
    );
  }, [orders]);
  
  const getPendingDeliveries = useMemo(() => () => {
    return deliveries.filter(d => d.status === 'PENDING' || d.status === 'SEARCHING_DRIVER');
  }, [deliveries]);
  
  const getActiveDelivery = useMemo(() => () => {
    return deliveries.find(d => 
      ['DRIVER_ASSIGNED', 'ARRIVED_AT_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_DROPOFF'].includes(d.status)
    ) || null;
  }, [deliveries]);
  
  return {
    restaurant,
    categories,
    menuItems,
    orders,
    deliveries,
    getItemsByCategory,
    getPopularItems,
    getFeaturedItems,
    getActiveOrders,
    getPastOrders,
    getPendingDeliveries,
    getActiveDelivery,
  };
}

// Utility function to merge API data with demo fallback
export function mergeWithDemoData<T>(
  apiData: T[] | undefined | null,
  demoData: T[],
  isEmpty: boolean = !apiData || apiData.length === 0
): T[] {
  return isEmpty ? demoData : apiData;
}
