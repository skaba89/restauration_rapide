// ============================================
// RESTAURANT OS - Mobile Bottom Navigation
// Native-like mobile navigation bar
// ============================================

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  User, 
  Gift,
  Map,
  Truck,
  Wallet,
  ChefHat,
  Utensils,
  ClipboardList,
  Settings,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
}

interface MobileNavProps {
  variant?: 'customer' | 'driver' | 'admin';
}

export function MobileNav({ variant = 'customer' }: MobileNavProps) {
  const pathname = usePathname();
  const cartItemCount = useCartStore(state => state.getItemCount());
  
  const customerNavItems: NavItem[] = [
    { href: '/customer', label: 'Accueil', icon: Home },
    { href: '/customer/menu', label: 'Menu', icon: Utensils },
    { 
      href: '/customer/cart', 
      label: 'Panier', 
      icon: ShoppingCart,
      badge: cartItemCount > 0 ? cartItemCount : undefined
    },
    { href: '/customer/orders', label: 'Commandes', icon: Package },
    { href: '/customer/profile', label: 'Profil', icon: User },
  ];

  const driverNavItems: NavItem[] = [
    { href: '/driver', label: 'Accueil', icon: Home },
    { href: '/driver/orders', label: 'Commandes', icon: ClipboardList },
    { href: '/driver/map', label: 'Carte', icon: Map },
    { href: '/driver/earnings', label: 'Revenus', icon: Wallet },
    { href: '/driver/profile', label: 'Profil', icon: User },
  ];

  const adminNavItems: NavItem[] = [
    { href: '/dashboard', label: 'Tableau', icon: ChefHat },
    { href: '/orders', label: 'Commandes', icon: Package },
    { href: '/menu', label: 'Menu', icon: Utensils },
    { href: '/customers', label: 'Clients', icon: User },
    { href: '/settings', label: 'Reglages', icon: Settings },
  ];

  const navItems = variant === 'customer' 
    ? customerNavItems 
    : variant === 'driver' 
    ? driverNavItems 
    : adminNavItems;

  const isActive = (href: string) => {
    if (href === `/${variant}` || href === '/dashboard') {
      return pathname === href || pathname === `${href}/`;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Safe area for iOS */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[60px] py-1.5 px-2 rounded-xl transition-all duration-200",
                  "active:scale-95 active:bg-gray-100 dark:active:bg-gray-800",
                  active 
                    ? "text-orange-500" 
                    : "text-gray-500 dark:text-gray-400"
                )}
              >
                <div className="relative">
                  <Icon className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    active && "scale-110"
                  )} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-orange-500 rounded-full">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] mt-0.5 font-medium transition-all duration-200",
                  active && "text-orange-500"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// Mobile Header Component
interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}

export function MobileHeader({ title, subtitle, showBack, actions }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {showBack && (
            <button 
              onClick={() => window.history.back()}
              className="p-1 -ml-1 text-gray-600 dark:text-gray-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

// Haptic feedback utility
export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    };
    navigator.vibrate(patterns[type]);
  }
}

export default MobileNav;
