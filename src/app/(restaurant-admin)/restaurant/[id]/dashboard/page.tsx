'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ShoppingBag,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  CheckCircle,
  XCircle,
  Timer,
  ChefHat,
  Bike,
  Package,
} from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  status: string;
  orderType: string;
  total: number;
  createdAt: string;
  items: { itemName: string; quantity: number }[];
}

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  activeCustomers: number;
  ordersChange: number;
  revenueChange: number;
}

export default function RestaurantDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [popularItems, setPopularItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch restaurant
        const restaurantRes = await fetch(`/api/public/restaurant/${restaurantId}`);
        if (restaurantRes.ok) {
          const data = await restaurantRes.json();
          setRestaurant(data.data);
        }

        // Fetch stats
        const statsRes = await fetch(`/api/dashboard?restaurantId=${restaurantId}`);
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats || data);
        }

        // Fetch recent orders
        const ordersRes = await fetch(`/api/orders?restaurantId=${restaurantId}&limit=10`);
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setRecentOrders(data.data || data.orders || []);
        }

        // Fetch popular items
        const menuRes = await fetch(`/api/menu?restaurantId=${restaurantId}`);
        if (menuRes.ok) {
          const data = await menuRes.json();
          const items = data.data?.flatMap((m: any) =>
            m.categories?.flatMap((c: any) => c.items || [])
          ) || [];
          setPopularItems(
            items
              .filter((i: any) => i.isPopular)
              .slice(0, 5)
          );
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchData();
    }
  }, [restaurantId]);

  const formatCurrency = (amount: number) => {
    return `${amount?.toLocaleString() || 0} ${restaurant?.currency?.code || 'GNF'}`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      PREPARING: 'bg-purple-100 text-purple-700',
      READY: 'bg-green-100 text-green-700',
      DELIVERED: 'bg-gray-100 text-gray-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'DELIVERY':
        return <Bike className="w-4 h-4" />;
      case 'TAKEAWAY':
        return <Package className="w-4 h-4" />;
      default:
        return <ChefHat className="w-4 h-4" />;
    }
  };

  const quickActions = [
    {
      label: 'Nouvelle commande',
      href: `/restaurant/${restaurantId}/orders?action=new`,
      icon: <Plus className="w-5 h-5" />,
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      label: 'Gérer le menu',
      href: `/restaurant/${restaurantId}/menu`,
      icon: <ChefHat className="w-5 h-5" />,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Voir le site',
      href: `/menu/${restaurant?.slug}`,
      icon: <ExternalLink className="w-5 h-5" />,
      color: 'bg-green-500 hover:bg-green-600',
      external: true,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500">
            Bienvenue sur {restaurant?.name || 'votre restaurant'}
          </p>
        </div>

        {/* Restaurant Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              // Toggle restaurant open/closed
              try {
                const res = await fetch('/api/restaurants', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    id: restaurantId,
                    isOpen: !restaurant?.isOpen,
                  }),
                });
                if (res.ok) {
                  setRestaurant((prev: any) => ({
                    ...prev,
                    isOpen: !prev.isOpen,
                  }));
                }
              } catch (error) {
                console.error('Failed to toggle status:', error);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium ${
              restaurant?.isOpen
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {restaurant?.isOpen ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Ouvert
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                Fermé
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Commandes aujourd'hui</p>
                <p className="text-2xl font-bold">{stats?.todayOrders || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              {(stats?.ordersChange || 0) >= 0 ? (
                <>
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">+{stats?.ordersChange || 0}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                  <span className="text-red-500">{stats?.ordersChange || 0}%</span>
                </>
              )}
              <span className="text-gray-400 ml-1">vs hier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenus aujourd'hui</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats?.todayRevenue || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              {(stats?.revenueChange || 0) >= 0 ? (
                <>
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">+{stats?.revenueChange || 0}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                  <span className="text-red-500">{stats?.revenueChange || 0}%</span>
                </>
              )}
              <span className="text-gray-400 ml-1">vs hier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Commandes en attente</p>
                <p className="text-2xl font-bold">{stats?.pendingOrders || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Timer className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2">
              <Link
                href={`/restaurant/${restaurantId}/orders?status=PENDING`}
                className="text-sm text-orange-600 hover:underline"
              >
                Voir les commandes →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Clients actifs</p>
                <p className="text-2xl font-bold">{stats?.activeCustomers || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2">
              <Link
                href={`/restaurant/${restaurantId}/customers`}
                className="text-sm text-orange-600 hover:underline"
              >
                Gérer les clients →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/restaurant/${restaurantId}/orders?action=new`}>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle commande
          </Button>
        </Link>
        <Link href={`/restaurant/${restaurantId}/menu`}>
          <Button variant="outline">
            <ChefHat className="w-5 h-5 mr-2" />
            Gérer le menu
          </Button>
        </Link>
        <Link href={`/menu/${restaurant?.slug}`} target="_blank">
          <Button variant="outline">
            <ExternalLink className="w-5 h-5 mr-2" />
            Voir le site
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Commandes récentes</CardTitle>
            <Link
              href={`/restaurant/${restaurantId}/orders`}
              className="text-sm text-orange-600 hover:underline"
            >
              Voir tout
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucune commande récente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.slice(0, 5).map((order) => (
                  <Link
                    key={order.id}
                    href={`/restaurant/${restaurantId}/orders/${order.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {getOrderTypeIcon(order.orderType)}
                      </div>
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">
                          {order.customerName} • {order.items?.length || 0} article(s)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <p className="text-sm font-medium mt-1">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Plats populaires</CardTitle>
            <Link
              href={`/restaurant/${restaurantId}/menu`}
              className="text-sm text-orange-600 hover:underline"
            >
              Gérer
            </Link>
          </CardHeader>
          <CardContent>
            {popularItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ChefHat className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucun plat populaire</p>
                <Link href={`/restaurant/${restaurantId}/menu`}>
                  <Button variant="outline" className="mt-4">
                    Ajouter des plats
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {popularItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-orange-600">
                      {item.orderCount || 0} commandes
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Opening Hours */}
      {restaurant?.hours && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Horaires d'ouverture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day, index) => {
                const hour = restaurant.hours?.find((h: any) => h.dayOfWeek === index);
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-center ${
                      hour?.isClosed
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-green-50 text-green-700'
                    }`}
                  >
                    <p className="font-medium">{day}</p>
                    {hour?.isClosed ? (
                      <p className="text-xs">Fermé</p>
                    ) : (
                      <p className="text-xs">
                        {hour?.openTime?.slice(0, 5)} - {hour?.closeTime?.slice(0, 5)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Add missing import
function Plus({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
