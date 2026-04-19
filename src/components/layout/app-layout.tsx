'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  Warehouse,
  Receipt,
  ChefHat as Kitchen,
  DollarSign,
  Gift,
  Percent,
  Heart,
  Star,
  QrCode,
  Printer,
  Building2,
  Calendar,
  Megaphone,
  Puzzle,
  MessageSquare,
  Users as StaffIcon,
  Utensils,
  TrendingUp,
  ChevronDown,
  ChevronRight,
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

interface NavCategory {
  title: string;
  icon: React.ElementType;
  items: NavItem[];
}

// Navigation organized by categories with collapsible sections
const NAV_CATEGORIES: NavCategory[] = [
  {
    title: 'Principal',
    icon: LayoutDashboard,
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'POS', href: '/pos', icon: Calculator },
      { title: 'Commandes', href: '/orders', icon: ShoppingCart, badge: 5 },
      { title: 'Cuisine', href: '/kitchen', icon: ChefHat },
    ],
  },
  {
    title: 'Menu & Produits',
    icon: UtensilsCrossed,
    items: [
      { title: 'Menu', href: '/menu', icon: UtensilsCrossed },
      { title: 'Recettes', href: '/recipes', icon: Utensils },
      { title: 'Nutrition', href: '/nutrition', icon: Heart },
    ],
  },
  {
    title: 'Clients',
    icon: Users,
    items: [
      { title: 'Clients', href: '/customers', icon: Users },
      { title: 'Réservations', href: '/reservations', icon: CalendarDays },
      { title: 'Fidélité', href: '/loyalty', icon: Gift },
      { title: 'Avis', href: '/reviews', icon: Star },
      { title: 'Feedback', href: '/feedback', icon: MessageSquare },
    ],
  },
  {
    title: 'Livraison',
    icon: Truck,
    items: [
      { title: 'Livraisons', href: '/deliveries', icon: Truck },
      { title: 'Drivers', href: '/drivers', icon: Bike },
      { title: 'Suivi', href: '/tracking', icon: TrendingUp },
    ],
  },
  {
    title: 'Opérations',
    icon: Package,
    items: [
      { title: 'Inventaire', href: '/inventory', icon: Package },
      { title: 'Staff', href: '/staff', icon: StaffIcon },
      { title: 'RH', href: '/hr', icon: Users },
      { title: 'Fournisseurs', href: '/suppliers', icon: Truck },
      { title: 'Fil d\'attente', href: '/waitlist', icon: Clock },
      { title: 'Plan de salle', href: '/floor-plan', icon: Building2 },
    ],
  },
  {
    title: 'Finance',
    icon: DollarSign,
    items: [
      { title: 'Comptabilité', href: '/accounting', icon: DollarSign },
      { title: 'Dépenses', href: '/expenses', icon: Receipt },
      { title: 'Factures', href: '/invoices', icon: Receipt },
    ],
  },
  {
    title: 'Marketing',
    icon: Megaphone,
    items: [
      { title: 'Promotions', href: '/promotions', icon: Percent },
      { title: 'Cartes cadeaux', href: '/gift-cards', icon: Gift },
      { title: 'Événements', href: '/events', icon: Calendar },
      { title: 'Traiteur', href: '/catering', icon: UtensilsCrossed },
    ],
  },
  {
    title: 'Administration',
    icon: Building2,
    items: [
      { title: 'Succursales', href: '/branches', icon: Building2 },
      { title: 'Abonnements', href: '/subscriptions', icon: CreditCard },
      { title: 'QR Code', href: '/qrcode', icon: QrCode },
      { title: 'Impression', href: '/printing', icon: Printer },
      { title: 'Intégrations', href: '/integrations', icon: Puzzle },
    ],
  },
  {
    title: 'Analyse',
    icon: BarChart3,
    items: [
      { title: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Paramètres',
    icon: Settings,
    items: [
      { title: 'Paramètres', href: '/settings', icon: Settings },
    ],
  },
];

// Collapsible category component
function NavCategoryItem({
  category,
  pathname,
  onNavigate,
}: {
  category: NavCategory;
  pathname: string;
  onNavigate?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Check if any child is active
  const isChildActive = category.items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  );

  return (
    <Collapsible open={isOpen || isChildActive} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
            isChildActive
              ? 'bg-sidebar-accent text-sidebar-primary font-medium shadow-sm'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
          }`}
        >
          <category.icon className="h-[18px] w-[18px]" />
          <span className="text-[13px] font-medium flex-1 text-left">{category.title}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen || isChildActive ? 'rotate-0' : '-rotate-90'
            }`}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-3 pt-1 pb-1 space-y-0.5">
        {category.items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm'
                  : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-[13px]">{item.title}</span>
              {item.badge && (
                <span className="ml-auto bg-sidebar-primary text-sidebar-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

// Separate NavContent component
function NavContent({ pathname, onNavigate, categories = NAV_CATEGORIES }: { pathname: string; onNavigate?: () => void; categories?: NavCategory[] }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center shadow-sm">
          <ChefHat className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-[15px] text-sidebar-foreground">KFM DELICE</h1>
          <p className="text-[11px] text-sidebar-foreground/50">Africa-First</p>
        </div>
      </div>

      {/* Navigation with collapsible categories */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="space-y-0.5">
          {categories.map((category) => (
            <NavCategoryItem
              key={category.title}
              category={category}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Restaurant Info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="p-3 rounded-lg bg-sidebar-accent/50">
          <p className="font-semibold text-[12px] text-sidebar-foreground">KFM DELICE</p>
          <p className="text-[11px] text-sidebar-foreground/50">Conakry, Guinée</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Ouvert</span>
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
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const router = useRouter();
  const { toast } = useToast();

  // Determine if user is kitchen staff - show limited navigation
  const isKitchenStaff = user?.role === 'KITCHEN';

  // Filter navigation for kitchen staff - only what concerns them
  const kitchenNavCategories: NavCategory[] = [
    {
      title: 'Cuisine',
      icon: ChefHat,
      items: [
        { title: 'Commandes Cuisine', href: '/kitchen', icon: ChefHat },
        { title: 'Menu', href: '/menu', icon: UtensilsCrossed },
        { title: 'Recettes', href: '/recipes', icon: Utensils },
      ],
    },
    {
      title: 'Mon espace',
      icon: User,
      items: [
        { title: 'Mes Conges & Absences', href: '/kitchen/leaves', icon: CalendarDays },
        { title: 'Mon Profil', href: '/profile', icon: User },
      ],
    },
  ];

  const activeNavCategories = isKitchenStaff ? kitchenNavCategories : NAV_CATEGORIES;

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
      case 'order': return 'bg-primary/10 text-primary';
      case 'delivery': return 'bg-primary/10 text-primary';
      case 'reservation': return 'bg-primary/10 text-primary';
      case 'alert': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Find current page title
  const getCurrentPageTitle = () => {
    for (const category of NAV_CATEGORIES) {
      for (const item of category.items) {
        if (pathname === item.href || pathname.startsWith(item.href + '/')) {
          return item.title;
        }
      }
    }
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r bg-sidebar">
        <NavContent pathname={pathname} categories={activeNavCategories} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar">
          <VisuallyHidden>
            <SheetTitle>Menu de navigation</SheetTitle>
          </VisuallyHidden>
          <NavContent pathname={pathname} onNavigate={() => setSidebarOpen(false)} categories={activeNavCategories} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background border-b">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            {/* Page Title - Mobile */}
            <h1 className="font-semibold lg:hidden">
              {getCurrentPageTitle()}
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
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
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
                              className={`p-3 hover:bg-accent/50 cursor-pointer ${
                                !notification.read ? 'bg-primary/5' : ''
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
                      <AvatarFallback className="bg-primary text-primary-foreground">
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
                  <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
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
