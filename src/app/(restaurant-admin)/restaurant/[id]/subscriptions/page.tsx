'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCcw,
  Plus,
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { apiGet } from '@/lib/api-client';

interface Subscription {
  id: string;
  customerName: string;
  customerPhone: string;
  planName: string;
  price: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  visitsUsed: number;
  visitsTotal: number;
}

export default function RestaurantSubscriptionsPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, [restaurantId]);

  const loadSubscriptions = async () => {
    try {
      const data = await apiGet<any>(`/subscriptions?restaurantId=${restaurantId}`);
      if (data?.subscriptions?.length > 0) {
        setSubscriptions(data.subscriptions);
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = subscriptions.filter(s => s.status === 'ACTIVE').length;
  const totalRevenue = subscriptions.reduce((sum, s) => sum + s.price, 0);
  const activeRevenue = subscriptions.filter(s => s.status === 'ACTIVE').reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <RefreshCcw className="h-6 w-6 text-orange-500" />
            Abonnements
          </h1>
          <p className="text-muted-foreground">
            Gérez les abonnements et forfaits de vos clients
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel abonnement
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">FCFA/mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{subscriptions.length}</p>
                <p className="text-sm text-muted-foreground">Total clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">FCFA total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Abonnements actifs</CardTitle>
          <CardDescription>Liste des abonnements clients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscriptions.filter(s => s.status === 'ACTIVE').map((sub) => (
              <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{sub.customerName}</h4>
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Actif
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{sub.customerPhone}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="font-medium">{sub.planName}</span>
                    <span className="text-muted-foreground">
                      {sub.visitsUsed}/{sub.visitsTotal} visites
                    </span>
                  </div>
                  <div className="w-32 h-2 bg-gray-200 rounded-full mt-2">
                    <div
                      className="h-2 bg-orange-500 rounded-full"
                      style={{ width: `${(sub.visitsUsed / sub.visitsTotal) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-600">{sub.price.toLocaleString()} FCFA</p>
                  <p className="text-sm text-muted-foreground">
                    Expire le {new Date(sub.endDate).toLocaleDateString('fr-FR')}
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Voir détails
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}