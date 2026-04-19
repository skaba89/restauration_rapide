'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrencySafe } from '@/lib/currency-context';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  mealsPerDay: number;
  daysPerWeek: number;
  pricePerMonth: number;
  features: string[];
  popular?: boolean;
}

interface SubscriptionPlansProps {
  onSelectPlan: (plan: SubscriptionPlan) => void;
  selectedPlanId?: string;
}

export function SubscriptionPlans({ onSelectPlan, selectedPlanId }: SubscriptionPlansProps) {
  const { formatCurrency } = useCurrencySafe();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/subscriptions?plans=true');
        const data = await response.json();
        if (data.success) {
          setPlans(data.plans);
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => (
        <Card 
          key={plan.id}
          className={`relative overflow-hidden transition-all hover:shadow-lg cursor-pointer ${
            selectedPlanId === plan.id 
              ? 'ring-2 ring-orange-500 shadow-lg' 
              : 'hover:border-orange-200'
          } ${plan.popular ? 'border-orange-200' : ''}`}
          onClick={() => onSelectPlan(plan)}
        >
          {plan.popular && (
            <div className="absolute top-0 right-0">
              <Badge className="rounded-none rounded-bl-lg bg-gradient-to-r from-orange-500 to-amber-500">
                <Star className="h-3 w-3 mr-1" />
                Populaire
              </Badge>
            </div>
          )}
          
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <span className="text-2xl font-bold text-orange-600">
                {plan.pricePerMonth === 0 ? 'Sur devis' : `${formatCurrency(plan.pricePerMonth)}/mois`}
              </span>
            </div>

            {plan.mealsPerDay > 0 && (
              <div className="text-sm text-muted-foreground">
                {plan.mealsPerDay} repas/jour • {plan.daysPerWeek} jours/semaine
              </div>
            )}

            <div className="space-y-2">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button 
              className="w-full"
              variant={selectedPlanId === plan.id ? 'default' : 'outline'}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlan(plan);
              }}
            >
              {selectedPlanId === plan.id ? 'Sélectionné' : 'Choisir'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default SubscriptionPlans;
