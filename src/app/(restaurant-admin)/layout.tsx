'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  Store,
  Bell,
  Menu as MenuIcon,
  X,
  ChevronDown,
  LogOut,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/api-client';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  primaryColor: string | null;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export default function RestaurantAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [showRestaurantPicker, setShowRestaurantPicker] = useState(false);

  const restaurantId = params.id as string;

  // Navigation items
  const navItems: NavItem[] = [
    {
      href: `/restaurant/${restaurantId}/dashboard`,
      label: 'Tableau de bord',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      href: `/restaurant/${restaurantId}/orders`,
      label: 'Commandes',
      icon: <ShoppingBag className="w-5 h-5" />,
      badge: pendingOrders,
    },
    {
      href: `/restaurant/${restaurantId}/menu`,
      label: 'Menu',
      icon: <UtensilsCrossed className="w-5 h-5" />,
    },
    {
      href: `/restaurant/${restaurantId}/customers`,
      label: 'Clients',
      icon: <Users className="w-5 h-5" />,
    },
    {
      href: `/restaurant/${restaurantId}/staff`,
      label: 'Personnel',
      icon: <Users className="w-5 h-5" />,
    },
    {
      href: `/restaurant/${restaurantId}/analytics`,
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      href: `/restaurant/${restaurantId}/settings`,
      label: 'Paramètres',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  // Fetch restaurant and pending orders
  useEffect(() => {
    if (!restaurantId) return;

    // Fetch restaurant details
    fetch(`/api/public/restaurant/${restaurantId}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setRestaurant(data.data);
        }
      })
      .catch(console.error);

    // Fetch pending orders count
    fetchWithAuth(`/api/orders?restaurantId=${restaurantId}&status=PENDING`)
      .then(res => res.json())
      .then(data => {
        setPendingOrders(data.total || 0);
      })
      .catch(console.error);

    // Fetch user's restaurants for picker
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data?.user?.restaurants) {
          setRestaurants(Array.isArray(data.user.restaurants) ? data.user.restaurants : []);
        }
      })
      .catch(console.error);
  }, [restaurantId]);

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-accent rounded-lg"
          >
            <MenuIcon className="w-6 h-6" />
          </button>

          {restaurant && (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: restaurant.primaryColor || '#F97316' }}
              >
                {restaurant.name.charAt(0)}
              </div>
              <span className="font-semibold">{restaurant.name}</span>
            </div>
          )}

          <Link href={`/restaurant/${restaurantId}/orders`} className="relative">
            <Bell className="w-6 h-6" />
            {pendingOrders > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {pendingOrders > 9 ? '9+' : pendingOrders}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-sidebar border-r z-50 transform transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <Link href="/my-restaurants" className="flex items-center gap-2">
              <Store className="w-6 h-6 text-orange-500" />
              <span className="font-bold text-lg">Restaurant OS</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-accent rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Restaurant Picker */}
          {restaurant && (
            <div className="relative">
              <button
                onClick={() => setShowRestaurantPicker(!showRestaurantPicker)}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-accent"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: restaurant.primaryColor || '#F97316' }}
                >
                  {restaurant.logo ? (
                    <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    restaurant.name.charAt(0)
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm">{restaurant.name}</p>
                  <p className="text-xs text-gray-500">Changer</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* Dropdown */}
              {showRestaurantPicker && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-10">
                  {restaurants.map((r) => (
                    <Link
                      key={r.id}
                      href={`/restaurant/${r.id}/dashboard`}
                      onClick={() => setShowRestaurantPicker(false)}
                      className={`flex items-center gap-2 p-2 hover:bg-accent/50 ${
                        r.id === restaurantId ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: r.primaryColor || '#F97316' }}
                      >
                        {r.name.charAt(0)}
                      </div>
                      <span className="text-sm">{r.name}</span>
                    </Link>
                  ))}
                  <Link
                    href="/my-restaurants"
                    className="flex items-center gap-2 p-2 border-t text-primary hover:bg-primary/5"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-sm">Nouveau restaurant</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge className="bg-destructive text-destructive-foreground text-xs">
                  {item.badge > 99 ? '99+' : item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3">
            <Link
              href="/my-restaurants"
              className="flex-1 text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Tous mes restaurants
            </Link>
            <button
              onClick={() => {
                // Logout
                document.cookie = 'session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
                router.push('/login');
              }}
              className="p-2 hover:bg-accent rounded-lg text-gray-500"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
