'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
  Package,
  Map,
  DollarSign,
  User,
  Menu,
  Bell,
  ChefHat,
  LogOut,
  Settings,
  Moon,
  Sun,
  Power,
  Bike,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLogout, useAuth } from '@/hooks/use-api';
import { useRouter } from 'next/navigation';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const DRIVER_NAV_ITEMS: NavItem[] = [
  { title: 'Commandes', href: '/driver/orders', icon: Package, badge: 3 },
  { title: 'Carte', href: '/driver/map', icon: Map },
  { title: 'Revenus', href: '/driver/earnings', icon: DollarSign },
  { title: 'Profil', href: '/driver/profile', icon: User },
];

function NavContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <Bike className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Driver App</h1>
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-1 text-xs ${isOnline ? 'text-green-600' : 'text-gray-500'}`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {DRIVER_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
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
      </div>

      {/* Online/Offline Toggle */}
      <div className="p-4 border-t">
        <Button 
          className={`w-full ${isOnline ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}`}
          onClick={() => setIsOnline(!isOnline)}
        >
          <Power className="h-4 w-4 mr-2" />
          {isOnline ? 'Mettre hors ligne' : 'Mettre en ligne'}
        </Button>
      </div>
    </div>
  );
}

export function DriverLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.push('/login');
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
          <VisuallyHidden.Root>
            <SheetTitle>Menu Driver</SheetTitle>
          </VisuallyHidden.Root>
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
              {DRIVER_NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.title || 'Commandes'}
            </h1>

            {/* Status Badge - Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">En ligne</span>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  2
                </span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                        {user?.firstName?.[0] || 'D'}
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
                    <Link href="/driver/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Mon Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/driver/earnings" className="cursor-pointer">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Mes Revenus
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
