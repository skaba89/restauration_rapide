'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
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
  Utensils,
  ShoppingCart,
  Package,
  Truck,
  Gift,
  Percent,
  Star,
  Menu,
  Bell,
  ChefHat,
  LogOut,
  User,
  Moon,
  Sun,
  MapPin,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLogout, useAuth } from '@/hooks/use-api';
import { useRouter } from 'next/navigation';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useCartStore } from '@/lib/cart-store';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const CUSTOMER_NAV_ITEMS: NavItem[] = [
  { title: 'Menu', href: '/customer/menu', icon: Utensils },
  { title: 'Commander', href: '/customer/order', icon: ShoppingCart },
  { title: 'Mes Commandes', href: '/customer/orders', icon: Package, badge: 2 },
  { title: 'Suivi Livraison', href: '/customer/tracking', icon: Truck },
  { title: 'Messages', href: '/customer/messages', icon: MessageCircle, badge: 1 },
  { title: 'Bons Plans', href: '/customer/deals', icon: Percent },
  { title: 'Fidélité', href: '/customer/loyalty', icon: Star },
  { title: 'Favoris', href: '/customer/favorites', icon: Heart },
  { title: 'Profil', href: '/customer/profile', icon: User },
];

// Separate NavContent component
function NavContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center shadow-sm">
          <ChefHat className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-[15px] text-sidebar-foreground">Le Petit Maquis</h1>
          <div className="flex items-center gap-1 text-[11px] text-sidebar-foreground/50">
            <MapPin className="h-3 w-3" />
            <span>Cocody, Abidjan</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="space-y-0.5">
          {CUSTOMER_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" />
                <span className="text-[13px] font-medium">{item.title}</span>
                {item.badge && (
                  <span className="ml-auto bg-sidebar-primary text-sidebar-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Loyalty Card */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="p-3 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] opacity-80">Points Fidélité</span>
            <Gift className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold">350 pts</p>
          <p className="text-[11px] opacity-80 mt-1">150 pts = 1 repas gratuit</p>
        </div>
      </div>
    </div>
  );
}

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const router = useRouter();
  const { getItemCount } = useCartStore();
  const cartCount = getItemCount();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role && user.role !== 'CUSTOMER') {
      // Redirect non-customers to their appropriate dashboard
      switch (user.role) {
        case 'DRIVER': router.push('/driver/orders'); break;
        case 'KITCHEN': router.push('/kitchen'); break;
        default: router.push('/dashboard'); break;
      }
    }
  }, [isLoading, isAuthenticated, user?.role, router]);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r bg-sidebar sidebar-glow">
        <NavContent pathname={pathname} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar">
          <VisuallyHidden.Root>
            <SheetTitle>Menu de navigation client</SheetTitle>
          </VisuallyHidden.Root>
          <NavContent pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
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
              {CUSTOMER_NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.title || 'Menu'}
            </h1>

            {/* Restaurant Status - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-green-600">Ouvert maintenant</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">Fermeture: 23:00</span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Cart Button */}
              <Link href="/customer/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.firstName?.[0] || 'C'}
                        {user?.lastName?.[0] || 'L'}
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
                    <Link href="/customer/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Mon Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/customer/orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      Mes Commandes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/customer/loyalty" className="cursor-pointer">
                      <Star className="mr-2 h-4 w-4" />
                      Ma Fidélité
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
