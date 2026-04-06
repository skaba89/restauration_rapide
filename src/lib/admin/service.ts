/**
 * Admin Service - Server-side functions for admin dashboard
 * Handles organizations, users, subscriptions, and analytics
 */

import { db, isDatabaseAvailable } from '@/lib/db';
import { Plan, UserRole } from '@prisma/client';

// ============================================
// Types
// ============================================

export interface AdminStats {
  totalOrganizations: number;
  activeOrganizations: number;
  totalRestaurants: number;
  activeRestaurants: number;
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  monthlyOrders: number;
  newSignupsThisMonth: number;
  activeSubscriptions: number;
}

export interface OrganizationWithDetails {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  email: string;
  phone: string;
  city: string;
  countryId: string;
  plan: Plan;
  planExpiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  _count: {
    restaurants: number;
    users: number;
  };
}

export interface UserWithDetails {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  isActive: boolean;
  isLocked: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  organizationUsers: Array<{
    organization: {
      id: string;
      name: string;
    };
    role: string;
  }>;
}

export interface RestaurantWithDetails {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  city: string;
  isActive: boolean;
  isOpen: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  organization: {
    id: string;
    name: string;
    plan: Plan;
  };
  _count: {
    orders: number;
  };
}

export interface SubscriptionData {
  plan: Plan;
  count: number;
  revenue: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface GeographicData {
  country: string;
  count: number;
  revenue: number;
}

// ============================================
// Admin Stats
// ============================================

export async function fetchAdminStats(): Promise<AdminStats> {
  // Check if database is available
  if (!isDatabaseAvailable() || !db) {
    // Return demo stats if database is not available
    return {
      totalOrganizations: 127,
      activeOrganizations: 118,
      totalRestaurants: 384,
      activeRestaurants: 356,
      totalUsers: 2847,
      activeUsers: 2654,
      totalRevenue: 245000000,
      monthlyRevenue: 12450000,
      totalOrders: 45678,
      monthlyOrders: 3456,
      newSignupsThisMonth: 156,
      activeSubscriptions: 89,
    };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalOrganizations,
    activeOrganizations,
    totalRestaurants,
    activeRestaurants,
    totalUsers,
    activeUsers,
    totalOrders,
    monthlyOrders,
    newSignupsThisMonth,
    activeSubscriptions,
  ] = await Promise.all([
    db.organization.count(),
    db.organization.count({ where: { isActive: true } }),
    db.restaurant.count(),
    db.restaurant.count({ where: { isActive: true } }),
    db.user.count(),
    db.user.count({ where: { isActive: true } }),
    db.order.count(),
    db.order.count({
      where: { createdAt: { gte: startOfMonth } }
    }),
    db.user.count({
      where: { createdAt: { gte: startOfMonth } }
    }),
    db.organization.count({
      where: {
        isActive: true,
        plan: { not: Plan.STARTER }
      }
    }),
  ]);

  // Calculate revenue
  const totalRevenueResult = await db.payment.aggregate({
    where: { status: 'PAID' },
    _sum: { amount: true },
  });

  const monthlyRevenueResult = await db.payment.aggregate({
    where: {
      status: 'PAID',
      createdAt: { gte: startOfMonth }
    },
    _sum: { amount: true },
  });

  return {
    totalOrganizations,
    activeOrganizations,
    totalRestaurants,
    activeRestaurants,
    totalUsers,
    activeUsers,
    totalRevenue: totalRevenueResult._sum.amount || 0,
    monthlyRevenue: monthlyRevenueResult._sum.amount || 0,
    totalOrders,
    monthlyOrders,
    newSignupsThisMonth,
    activeSubscriptions,
  };
}

// ============================================
// Organizations
// ============================================

export async function fetchOrganizations(params?: {
  page?: number;
  limit?: number;
  search?: string;
  plan?: Plan;
  isActive?: boolean;
}): Promise<{ data: OrganizationWithDetails[]; total: number }> {
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params?.search) {
    where.OR = [
      { name: { contains: params.search } },
      { email: { contains: params.search } },
      { slug: { contains: params.search } },
    ];
  }

  if (params?.plan) {
    where.plan = params.plan;
  }

  if (params?.isActive !== undefined) {
    where.isActive = params.isActive;
  }

  const [data, total] = await Promise.all([
    db.organization.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            restaurants: true,
            users: true,
          }
        }
      }
    }),
    db.organization.count({ where }),
  ]);

  return { data: data as OrganizationWithDetails[], total };
}

export async function fetchOrganizationById(id: string) {
  return db.organization.findUnique({
    where: { id },
    include: {
      settings: true,
      users: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          }
        }
      },
      restaurants: {
        select: {
          id: true,
          name: true,
          city: true,
          isActive: true,
          rating: true,
        }
      },
      _count: {
        select: {
          restaurants: true,
          users: true,
        }
      }
    }
  });
}

export async function createOrganization(data: {
  name: string;
  slug: string;
  email: string;
  phone: string;
  city: string;
  countryId: string;
  currencyId: string;
  plan?: Plan;
}) {
  return db.organization.create({
    data: {
      ...data,
      settings: {
        create: {}
      }
    }
  });
}

export async function updateOrganization(id: string, data: Partial<{
  name: string;
  email: string;
  phone: string;
  city: string;
  plan: Plan;
  planExpiresAt: Date;
  isActive: boolean;
}>) {
  return db.organization.update({
    where: { id },
    data
  });
}

// ============================================
// Users
// ============================================

export async function fetchUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  organizationId?: string;
}): Promise<{ data: UserWithDetails[]; total: number }> {
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params?.search) {
    where.OR = [
      { email: { contains: params.search } },
      { firstName: { contains: params.search } },
      { lastName: { contains: params.search } },
      { phone: { contains: params.search } },
    ];
  }

  if (params?.role) {
    where.role = params.role;
  }

  if (params?.isActive !== undefined) {
    where.isActive = params.isActive;
  }

  if (params?.organizationId) {
    where.organizationUsers = {
      some: { organizationId: params.organizationId }
    };
  }

  const [data, total] = await Promise.all([
    db.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        organizationUsers: {
          select: {
            role: true,
            organization: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    }),
    db.user.count({ where }),
  ]);

  return { data: data as UserWithDetails[], total };
}

export async function updateUser(id: string, data: Partial<{
  role: UserRole;
  isActive: boolean;
  isLocked: boolean;
  firstName: string;
  lastName: string;
}>) {
  return db.user.update({
    where: { id },
    data
  });
}

export async function fetchUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    include: {
      organizationUsers: {
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              plan: true,
            }
          }
        }
      },
      customerProfiles: {
        select: {
          id: true,
          organization: {
            select: { name: true }
          },
          totalOrders: true,
          totalSpent: true,
        }
      },
      staffProfiles: {
        select: {
          id: true,
          restaurant: {
            select: { name: true }
          },
          role: true,
        }
      },
      driver: {
        select: {
          id: true,
          totalDeliveries: true,
          totalEarnings: true,
          rating: true,
        }
      }
    }
  });
}

// ============================================
// Restaurants
// ============================================

export async function fetchRestaurants(params?: {
  page?: number;
  limit?: number;
  search?: string;
  organizationId?: string;
  isActive?: boolean;
}): Promise<{ data: RestaurantWithDetails[]; total: number }> {
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params?.search) {
    where.OR = [
      { name: { contains: params.search } },
      { city: { contains: params.search } },
      { slug: { contains: params.search } },
    ];
  }

  if (params?.organizationId) {
    where.organizationId = params.organizationId;
  }

  if (params?.isActive !== undefined) {
    where.isActive = params.isActive;
  }

  const [data, total] = await Promise.all([
    db.restaurant.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            plan: true,
          }
        },
        _count: {
          select: {
            orders: true,
          }
        }
      }
    }),
    db.restaurant.count({ where }),
  ]);

  return { data: data as RestaurantWithDetails[], total };
}

export async function fetchRestaurantStats(restaurantId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [orders, revenue, customers] = await Promise.all([
    db.order.count({
      where: {
        restaurantId,
        createdAt: { gte: startOfMonth }
      }
    }),
    db.order.aggregate({
      where: {
        restaurantId,
        status: 'COMPLETED',
        createdAt: { gte: startOfMonth }
      },
      _sum: { total: true }
    }),
    db.customerProfile.count({
      where: { organizationId: restaurantId }
    }),
  ]);

  return {
    monthlyOrders: orders,
    monthlyRevenue: revenue._sum.total || 0,
    totalCustomers: customers,
  };
}

// ============================================
// Subscriptions
// ============================================

export async function fetchSubscriptionStats(): Promise<SubscriptionData[]> {
  const plans = await db.organization.groupBy({
    by: ['plan'],
    _count: { id: true },
    where: { isActive: true }
  });

  // Plan pricing (example - should come from config)
  const planPricing: Record<Plan, number> = {
    STARTER: 0,
    PRO: 49000,
    BUSINESS: 99000,
    ENTERPRISE: 249000,
  };

  return plans.map(p => ({
    plan: p.plan,
    count: p._count.id,
    revenue: p._count.id * planPricing[p.plan]
  }));
}

export async function fetchRecentPayments(params?: {
  page?: number;
  limit?: number;
}) {
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const skip = (page - 1) * limit;

  return db.payment.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      order: {
        select: {
          orderNumber: true,
          restaurant: {
            select: {
              name: true,
              organization: {
                select: { name: true }
              }
            }
          }
        }
      }
    }
  });
}

export async function updateSubscription(organizationId: string, data: {
  plan: Plan;
  planExpiresAt?: Date;
}) {
  return db.organization.update({
    where: { id: organizationId },
    data
  });
}

// ============================================
// Analytics
// ============================================

export async function fetchRevenueData(days: number = 30): Promise<RevenueData[]> {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const orders = await db.order.findMany({
    where: {
      createdAt: { gte: startDate },
      status: 'COMPLETED'
    },
    select: {
      createdAt: true,
      total: true,
    }
  });

  // Group by date
  const dataByDate = orders.reduce((acc, order) => {
    const date = order.createdAt.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { revenue: 0, orders: 0 };
    }
    acc[date].revenue += order.total;
    acc[date].orders += 1;
    return acc;
  }, {} as Record<string, { revenue: number; orders: number }>);

  return Object.entries(dataByDate).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    orders: data.orders,
  }));
}

export async function fetchGeographicData(): Promise<GeographicData[]> {
  const restaurants = await db.restaurant.findMany({
    where: { isActive: true },
    select: {
      countryId: true,
      orders: {
        where: { status: 'COMPLETED' },
        select: { total: true }
      }
    }
  });

  // Group by country
  const countryData = restaurants.reduce((acc, r) => {
    const country = r.countryId;
    if (!acc[country]) {
      acc[country] = { count: 0, revenue: 0 };
    }
    acc[country].count += 1;
    acc[country].revenue += r.orders.reduce((sum, o) => sum + o.total, 0);
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  return Object.entries(countryData).map(([country, data]) => ({
    country,
    count: data.count,
    revenue: data.revenue,
  }));
}

export async function fetchFeatureUsage() {
  // Get counts for various features
  const [
    reservationsEnabled,
    deliveryEnabled,
    loyaltyEnabled,
    totalMenus,
    totalMenuItems,
    activeDrivers,
  ] = await Promise.all([
    db.organizationSettings.count({ where: { reservationEnabled: true } }),
    db.organizationSettings.count({ where: { deliveryEnabled: true } }),
    db.organizationSettings.count({ where: { loyaltyEnabled: true } }),
    db.menu.count(),
    db.menuItem.count({ where: { isAvailable: true } }),
    db.driver.count({ where: { isActive: true } }),
  ]);

  return {
    reservationsEnabled,
    deliveryEnabled,
    loyaltyEnabled,
    totalMenus,
    totalMenuItems,
    activeDrivers,
  };
}

export async function fetchGrowthData(months: number = 12) {
  const now = new Date();
  const data = [];

  for (let i = months - 1; i >= 0; i--) {
    const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const [organizations, users, orders, revenue] = await Promise.all([
      db.organization.count({
        where: { createdAt: { lte: endDate } }
      }),
      db.user.count({
        where: { createdAt: { lte: endDate } }
      }),
      db.order.count({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      db.order.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'COMPLETED'
        },
        _sum: { total: true }
      })
    ]);

    data.push({
      month: startDate.toISOString().slice(0, 7),
      organizations,
      users,
      orders,
      revenue: revenue._sum.total || 0,
    });
  }

  return data;
}

// ============================================
// Recent Signups
// ============================================

export async function fetchRecentSignups(limit: number = 10) {
  return db.user.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
      organizationUsers: {
        select: {
          organization: {
            select: { name: true }
          }
        }
      }
    }
  });
}

// ============================================
// Expenses
// ============================================

export interface ExpenseData {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: Date;
  status: string;
  paidBy: string;
  approvedBy?: string;
  restaurantId: string;
  notes?: string;
  createdAt: Date;
}

export async function fetchExpenses(params?: {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  restaurantId?: string;
}): Promise<{ data: ExpenseData[]; total: number }> {
  if (!isDatabaseAvailable() || !db) {
    return { data: [], total: 0 };
  }

  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params?.category) {
    where.category = params.category;
  }
  if (params?.status) {
    where.status = params.status;
  }
  if (params?.restaurantId) {
    where.restaurantId = params.restaurantId;
  }

  const [data, total] = await Promise.all([
    db.expense.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        restaurant: {
          select: { name: true },
        },
      },
    }),
    db.expense.count({ where }),
  ]);

  return { data: data as ExpenseData[], total };
}

export async function createExpense(data: {
  description: string;
  category: string;
  amount: number;
  restaurantId: string;
  notes?: string;
  paidBy?: string;
}) {
  if (!isDatabaseAvailable() || !db) {
    throw new Error('Database not available');
  }

  return db.expense.create({
    data: {
      ...data,
      status: 'PENDING',
      date: new Date(),
    },
    include: {
      restaurant: {
        select: { name: true },
      },
    },
  });
}

// ============================================
// Inventory
// ============================================

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  costPerUnit: number;
  totalValue: number;
  status: string;
  lastRestocked: Date;
  supplier?: string;
  organizationId: string;
}

export async function fetchInventory(params?: {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
  organizationId?: string;
}): Promise<{ data: InventoryItem[]; total: number }> {
  if (!isDatabaseAvailable() || !db) {
    return { data: [], total: 0 };
  }

  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params?.category) {
    where.category = params.category;
  }
  if (params?.status) {
    where.status = params.status;
  }
  if (params?.organizationId) {
    where.organizationId = params.organizationId;
  }
  if (params?.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { sku: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    db.ingredient.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    db.ingredient.count({ where }),
  ]);

  const data = items.map(item => ({
    ...item,
    sku: item.id.substring(0, 8).toUpperCase(),
    category: 'INGREDIENTS',
    minStock: item.lowStockThreshold || 0,
    maxStock: (item.lowStockThreshold || 0) * 2,
    totalValue: item.quantity * (item.costPerUnit || 0),
    status: item.quantity === 0 
      ? 'OUT_OF_STOCK' 
      : item.quantity < (item.lowStockThreshold || 0) 
        ? 'LOW_STOCK' 
        : 'IN_STOCK',
    lastRestocked: item.updatedAt,
  }));

  return { data: data as InventoryItem[], total };
}

export async function createInventoryItem(data: {
  name: string;
  unit: string;
  quantity: number;
  costPerUnit: number;
  lowStockThreshold: number;
  organizationId: string;
}) {
  if (!isDatabaseAvailable() || !db) {
    throw new Error('Database not available');
  }

  return db.ingredient.create({
    data,
  });
}

// ============================================
// Reports
// ============================================

export interface ReportKPIs {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customerGrowth: number;
}

export async function fetchReportKPIs(params?: {
  period?: 'week' | 'month' | 'quarter' | 'year';
  restaurantId?: string;
  organizationId?: string;
}): Promise<ReportKPIs> {
  if (!isDatabaseAvailable() || !db) {
    return {
      totalRevenue: 108600000,
      totalOrders: 11570,
      totalCustomers: 3730,
      avgOrderValue: 9400,
      revenueGrowth: 18.5,
      ordersGrowth: 15.2,
      customerGrowth: 22.8,
    };
  }

  const now = new Date();
  let startDate: Date;
  const period = params?.period || 'month';

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'quarter':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const orderWhere: any = { createdAt: { gte: startDate } };
  if (params?.restaurantId) {
    orderWhere.restaurantId = params.restaurantId;
  }
  if (params?.organizationId) {
    orderWhere.restaurant = { organizationId: params.organizationId };
  }

  const [orders, revenue, customers] = await Promise.all([
    db.order.count({ where: orderWhere }),
    db.order.aggregate({
      where: { ...orderWhere, status: 'COMPLETED' },
      _sum: { total: true },
      _avg: { total: true },
    }),
    db.order.findMany({
      where: orderWhere,
      select: { customerId: true },
      distinct: ['customerId'],
    }),
  ]);

  return {
    totalRevenue: revenue._sum.total || 0,
    totalOrders: orders,
    totalCustomers: customers.filter(c => c.customerId).length,
    avgOrderValue: revenue._avg.total || 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    customerGrowth: 0,
  };
}

// ============================================
// Menu Items (for real-time sync)
// ============================================

export async function fetchMenuItemById(id: string) {
  if (!isDatabaseAvailable() || !db) {
    return null;
  }

  return db.menuItem.findUnique({
    where: { id },
    include: {
      category: {
        include: {
          menu: {
            include: {
              restaurant: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      },
      variants: true,
      options: {
        include: {
          values: true,
        },
      },
    },
  });
}

export async function updateMenuItem(id: string, data: Partial<{
  name: string;
  description: string;
  price: number;
  discountPrice: number;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isNew: boolean;
  prepTime: number;
}>) {
  if (!isDatabaseAvailable() || !db) {
    throw new Error('Database not available');
  }

  return db.menuItem.update({
    where: { id },
    data,
    include: {
      category: {
        include: {
          menu: {
            include: {
              restaurant: {
                select: {
                  id: true,
                  slug: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function createMenuItem(data: {
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  image?: string;
  prepTime?: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  categoryId: string;
}) {
  if (!isDatabaseAvailable() || !db) {
    throw new Error('Database not available');
  }

  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const maxSort = await db.menuItem.aggregate({
    where: { categoryId: data.categoryId },
    _max: { sortOrder: true },
  });

  return db.menuItem.create({
    data: {
      ...data,
      slug: `${slug}-${Date.now()}`,
      sortOrder: (maxSort._max.sortOrder || 0) + 1,
    },
  });
}

export async function deleteMenuItem(id: string) {
  if (!isDatabaseAvailable() || !db) {
    throw new Error('Database not available');
  }

  return db.menuItem.delete({
    where: { id },
  });
}
