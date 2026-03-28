/**
 * Admin Service - Server-side functions for admin dashboard
 * Handles organizations, users, subscriptions, and analytics
 */

import { db } from '@/lib/db';
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
