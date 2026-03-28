'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  CalendarDays,
  Users,
  Truck,
  Bike,
  BarChart3,
  Settings,
  Menu,
  Bell,
  ChefHat,
  LogOut,
  User,
  CreditCard,
  Globe,
  Moon,
  Sun,
  Calculator,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLogout, useAuth } from '@/hooks/use-api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'POS', href: '/pos', icon: Calculator },
  { title: 'Commandes', href: '/orders', icon: ShoppingCart, badge: 5 },
  { title: 'Menu', href: '/menu', icon: UtensilsCrossed },
  { title: 'Réservations', href: '/reservations', icon: CalendarDays },
  { title: 'Clients', href: '/customers', icon: Users },
  { title: 'Livraisons', href: '/deliveries', icon: Truck },
  { title: 'Drivers', href: '/drivers', icon: Bike },
  { title: 'Analytics', href: '/analytics', icon: BarChart3 },
  { title: 'Paramètres', href: '/settings', icon: Settings },
];

// Demo notifications
const DEMO_NOTIFICATIONS = [
  {
    id: '1',
    type: 'order',
    title: 'Nouvelle commande',
    message: 'Commande ORD-2024-0146 reçue de Kouamé Jean',
    time: 'Il y a 2 min',
    read: false,
    icon: ShoppingCart,
  },
  {
    id: '2',
    type: 'delivery',
    title: 'Livraison en cours',
    message: 'ORD-2024-0144 est en route vers Treichville',
    time: 'Il y a 15 min',
    read: false,
    icon: Truck,
  },
  {
    id: '3',
    type: 'reservation',
    title: 'Nouvelle réservation',
    message: 'Réservation pour 4 personnes ce soir à 20h',
    time: 'Il y a 30 min',
    read: false,
    icon: CalendarDays,
  },
  {
    id: '4',
    type: 'alert',
    title: 'Stock faible',
    message: 'Le stock de poisson est bas (5 unités restantes)',
    time: 'Il y a 1h',
    read: true,
    icon: AlertCircle,
  },
  {
    id: '5',
    type: 'order',
    title: 'Commande terminée',
    message: 'ORD-2024-0142 livrée avec succès',
    time: 'Il y a 2h',
    read: true,
    icon: CheckCircle,
  },
];

// Separate NavContent component
function NavContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
          <ChefHat className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Restaurant OS</h1>
          <p className="text-xs text-muted-foreground">Africa-First</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-foreground'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
                {item.badge && (
                  <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Restaurant Info */}
      <div className="p-4 border-t">
        <div className="p-3 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
          <p className="font-semibold text-sm">Restaurant Le Savana</p>
          <p className="text-xs text-muted-foreground">Cocody, Abidjan</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-600">Ouvert</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const router = useRouter();
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.push('/login');
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({
      title: 'Notifications',
      description: 'Toutes les notifications ont été marquées comme lues',
    });
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return ShoppingCart;
      case 'delivery': return Truck;
      case 'reservation': return CalendarDays;
      case 'alert': return AlertCircle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-orange-100 text-orange-600';
      case 'delivery': return 'bg-purple-100 text-purple-600';
      case 'reservation': return 'bg-blue-100 text-blue-600';
      case 'alert': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r bg-white dark:bg-gray-950">
        <NavContent pathname={pathname} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <VisuallyHidden>
            <SheetTitle>Menu de navigation</SheetTitle>
          </VisuallyHidden>
          <NavContent pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white dark:bg-gray-950 border-b">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            {/* Page Title - Mobile */}
            <h1 className="font-semibold lg:hidden">
              {NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.title || 'Dashboard'}
            </h1>

            {/* Quick Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <Link href="/pos">
                <Button variant="outline" size="sm" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  POS
                </Button>
              </Link>
              <Link href="/" target="_blank">
                <Button variant="outline" size="sm" className="gap-2">
                  <Globe className="h-4 w-4" />
                  Site Web
                </Button>
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Notifications */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" className="text-xs h-auto py-1 px-2" onClick={markAllAsRead}>
                        Tout marquer lu
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucune notification</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notifications.map((notification) => {
                          const Icon = getNotificationIcon(notification.type);
                          const colorClass = getNotificationColor(notification.type);
                          return (
                            <div 
                              key={notification.id} 
                              className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${
                                !notification.read ? 'bg-orange-50/50 dark:bg-orange-950/10' : ''
                              }`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="font-medium text-sm">{notification.title}</p>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 flex-shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        clearNotification(notification.id);
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                  <div className="p-2 border-t">
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                      Voir toutes les notifications
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                        {user?.firstName?.[0] || 'A'}
                        {user?.lastName?.[0] || 'D'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.firstName} {user?.lastName}</span>
                      <span className="font-normal text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Mon Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
