'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  Crown, 
  TrendingUp, 
  AlertTriangle,
  Check,
  ArrowRight
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';
import Link from 'next/link';

interface PlanUsageProps {
  organizationId: string;
}

interface LimitsData {
  plan: string;
  planName: string;
  limits: {
    maxRestaurants: number;
    maxUsers: number;
    isUnlimitedRestaurants: boolean;
    isUnlimitedUsers: boolean;
  };
  usage: {
    restaurants: number;
    users: number;
  };
  remaining: {
    restaurants: number;
    users: number;
  };
  features: string[];
  recommendation?: {
    recommendedPlan: string;
    reason: string;
  };
}

const PLAN_NAMES: Record<string, string> = {
  STARTER: 'Starter',
  PRO: 'Pro',
  BUSINESS: 'Business',
  ENTERPRISE: 'Enterprise',
};

const PLAN_COLORS: Record<string, string> = {
  STARTER: 'bg-gray-500',
  PRO: 'bg-blue-500',
  BUSINESS: 'bg-purple-500',
  ENTERPRISE: 'bg-amber-500',
};

const PLAN_PRICES: Record<string, string> = {
  STARTER: '29,99€',
  PRO: '59,99€',
  BUSINESS: '79,99€',
  ENTERPRISE: '199,99€',
};

export function PlanUsage({ organizationId }: PlanUsageProps) {
  const [data, setData] = useState<LimitsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLimits() {
      try {
        const response = await fetchWithAuth(`/api/organization/limits?organizationId=${organizationId}`);
        if (response.ok) {
          const result = await response.json();
          setData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch limits:', error);
      } finally {
        setLoading(false);
      }
    }

    if (organizationId) {
      fetchLimits();
    }
  }, [organizationId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const restaurantPercentage = data.limits.isUnlimitedRestaurants 
    ? 0 
    : Math.min(100, (data.usage.restaurants / data.limits.maxRestaurants) * 100);
  
  const userPercentage = data.limits.isUnlimitedUsers 
    ? 0 
    : Math.min(100, (data.usage.users / data.limits.maxUsers) * 100);

  const isNearLimit = (percentage: number) => percentage >= 80;
  const isAtLimit = (percentage: number) => percentage >= 100;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Plan {data.planName}
            </CardTitle>
            <CardDescription>
              {PLAN_PRICES[data.plan]}/mois
            </CardDescription>
          </div>
          <Badge className={PLAN_COLORS[data.plan]}>
            {PLAN_NAMES[data.plan]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Restaurants Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>Restaurants / Pages publics</span>
            </div>
            <span className={`font-medium ${isAtLimit(restaurantPercentage) ? 'text-red-500' : isNearLimit(restaurantPercentage) ? 'text-amber-500' : ''}`}>
              {data.usage.restaurants} / {data.limits.isUnlimitedRestaurants ? '∞' : data.limits.maxRestaurants}
            </span>
          </div>
          {!data.limits.isUnlimitedRestaurants && (
            <Progress 
              value={restaurantPercentage} 
              className={`h-2 ${isAtLimit(restaurantPercentage) ? '[&>div]:bg-red-500' : isNearLimit(restaurantPercentage) ? '[&>div]:bg-amber-500' : ''}`}
            />
          )}
          {data.limits.isUnlimitedRestaurants && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              Illimité
            </div>
          )}
          {isAtLimit(restaurantPercentage) && !data.limits.isUnlimitedRestaurants && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Limite atteinte - Passez à un plan supérieur
            </p>
          )}
        </div>

        {/* Users Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Comptes utilisateurs</span>
            </div>
            <span className={`font-medium ${isAtLimit(userPercentage) ? 'text-red-500' : isNearLimit(userPercentage) ? 'text-amber-500' : ''}`}>
              {data.usage.users} / {data.limits.isUnlimitedUsers ? '∞' : data.limits.maxUsers}
            </span>
          </div>
          {!data.limits.isUnlimitedUsers && (
            <Progress 
              value={userPercentage} 
              className={`h-2 ${isAtLimit(userPercentage) ? '[&>div]:bg-red-500' : isNearLimit(userPercentage) ? '[&>div]:bg-amber-500' : ''}`}
            />
          )}
          {data.limits.isUnlimitedUsers && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              Illimité
            </div>
          )}
          {isAtLimit(userPercentage) && !data.limits.isUnlimitedUsers && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Limite atteinte - Passez à un plan supérieur
            </p>
          )}
        </div>

        {/* Upgrade Recommendation */}
        {data.recommendation?.recommendedPlan && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Passez au plan {PLAN_NAMES[data.recommendation.recommendedPlan]}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  {data.recommendation.reason}
                </p>
                <Link href="/pricing">
                  <Button size="sm" className="mt-3 bg-amber-500 hover:bg-amber-600">
                    Voir les offres
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div>
          <h4 className="text-sm font-medium mb-2">Fonctionnalités incluses</h4>
          <div className="flex flex-wrap gap-2">
            {data.features.map((feature) => (
              <Badge key={feature} variant="secondary" className="text-xs">
                {feature.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Upgrade Button */}
        {data.plan !== 'ENTERPRISE' && (
          <Link href="/pricing" className="block">
            <Button variant="outline" className="w-full">
              <Crown className="h-4 w-4 mr-2" />
              Modifier mon offre
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
