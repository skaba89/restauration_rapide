// Plan limits configuration and utilities

export enum Plan {
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export interface PlanLimits {
  maxRestaurants: number;
  maxUsers: number;
  maxMenuItems: number;
  maxOrders: number;
  maxCustomers: number;
  features: string[];
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  [Plan.STARTER]: {
    maxRestaurants: 1,
    maxUsers: 2,
    maxMenuItems: 50,
    maxOrders: 100,
    maxCustomers: 500,
    features: ['basic_menu', 'orders', 'customers'],
  },
  [Plan.PROFESSIONAL]: {
    maxRestaurants: 5,
    maxUsers: 10,
    maxMenuItems: 200,
    maxOrders: 1000,
    maxCustomers: 5000,
    features: ['basic_menu', 'orders', 'customers', 'analytics', 'loyalty', 'reservations'],
  },
  [Plan.ENTERPRISE]: {
    maxRestaurants: -1, // unlimited
    maxUsers: -1,
    maxMenuItems: -1,
    maxOrders: -1,
    maxCustomers: -1,
    features: ['basic_menu', 'orders', 'customers', 'analytics', 'loyalty', 'reservations', 'api', 'custom_domain', 'priority_support'],
  },
};

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS[Plan.STARTER];
}

export function validatePlanLimit(plan: Plan, limitType: keyof PlanLimits, currentValue: number): { valid: boolean; remaining: number } {
  const limits = getPlanLimits(plan);
  const max = limits[limitType] as number;
  
  if (max === -1) {
    return { valid: true, remaining: -1 }; // unlimited
  }
  
  const remaining = max - currentValue;
  return {
    valid: currentValue < max,
    remaining: Math.max(0, remaining),
  };
}

export function getPlanRecommendation(currentUsage: {
  restaurants: number;
  users: number;
  menuItems: number;
  orders: number;
  customers: number;
}): { recommended: Plan; reason: string } {
  const { restaurants, users, menuItems, orders, customers } = currentUsage;
  
  // Check if Enterprise is needed
  if (
    restaurants > 5 ||
    users > 10 ||
    menuItems > 200 ||
    orders > 1000 ||
    customers > 5000
  ) {
    return {
      recommended: Plan.ENTERPRISE,
      reason: 'Votre utilisation nécessite des fonctionnalités illimitées.',
    };
  }
  
  // Check if Professional is needed
  if (
    restaurants > 1 ||
    users > 2 ||
    menuItems > 50 ||
    orders > 100 ||
    customers > 500
  ) {
    return {
      recommended: Plan.PROFESSIONAL,
      reason: 'Vous avez dépassé les limites du plan Starter.',
    };
  }
  
  return {
    recommended: Plan.STARTER,
    reason: 'Le plan Starter correspond à vos besoins actuels.',
  };
}

export async function getOrganizationLimits(organizationId: string) {
  // This would typically query the database
  // For now, return default values
  return {
    plan: Plan.STARTER,
    usage: {
      restaurants: 1,
      users: 1,
      menuItems: 10,
      orders: 50,
      customers: 100,
    },
    limits: PLAN_LIMITS[Plan.STARTER],
  };
}
