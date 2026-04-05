// Organization Limits API - Get plan limits and usage
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { getOrganizationLimits, getPlanRecommendation, PLAN_LIMITS, validatePlanLimit } from '@/lib/plan-limits';

// GET /api/organization/limits - Get organization limits and usage
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return apiError('organizationId est requis');
    }

    // Get organization limits and usage
    const limits = await getOrganizationLimits(organizationId);
    
    // Get plan recommendation
    const recommendation = await getPlanRecommendation(organizationId);

    return apiSuccess({
      ...limits,
      recommendation,
    });
  });
}

// POST /api/organization/limits - Check specific limit
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { organizationId, action, feature } = body;

    if (!organizationId || !action) {
      return apiError('organizationId et action sont requis');
    }

    const result = await validatePlanLimit(
      organizationId, 
      action as 'add_restaurant' | 'add_user' | 'use_feature',
      feature
    );

    return apiSuccess(result);
  });
}

// PUT /api/organization/limits - Get all available plans
export async function PUT(request: Request) {
  return withErrorHandler(async () => {
    // Return all available plans with their limits
    const plans = Object.entries(PLAN_LIMITS).map(([key, value]) => ({
      id: key,
      name: value.name,
      slug: key.toLowerCase(),
      maxRestaurants: value.maxRestaurants,
      maxUsers: value.maxUsers,
      features: value.features,
    }));

    return apiSuccess(plans);
  });
}
