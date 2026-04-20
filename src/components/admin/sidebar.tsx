'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  LayoutDashboard,
  Building2,
  Store,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Shield,
  ChevronDown,
  ChevronRight,
  Database,
  Globe,
  Bell,
  FileText,
  Activity,
  ShoppingCart,
  UtensilsCrossed,
  Receipt,
  UsersRound,
  Wallet,
  Package,
  Truck,
  ClipboardList,
  PieChart,
  CalendarDays,
  ChefHat,
  DollarSign,
  UserCog,
  Crown,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
}

interface NavCategory {
  title: string;
  icon: React.ElementType;
  items: NavItem[];
}

// Navigation organized by categories
const NAV_CATEGORIES: NavCategory[] = [
  {
    title: 'Tableau de bord',
    icon: LayoutDashboard,
    items: [
      { title: 'Vue d\'ensemble', href: '/admin', icon: LayoutDashboard },
      { title: 'Analyses', href: '/admin/analytics', icon: BarChart3 },
      { title: 'Rapports', href: '/admin/reports', icon: PieChart },
    ],
  },
  {
    title: 'Gestion',
    icon: Building2,
    items: [
      { title: 'Organisations', href: '/admin/organizations', icon: Building2 },
      { title: 'Restaurants', href: '/admin/restaurants', icon: Store },
      { title: 'Utilisateurs', href: '/admin/users', icon: UserCog },
    ],
  },
  {
    title: 'Gestion Personnel',
    icon: UsersRound,
    items: [
      { title: 'Tous les utilisateurs', href: '/admin/users', icon: Users },
      { title: 'Cuisiniers', href: '/admin/hr?role=kitchen', icon: ChefHat },
      { title: 'Employés', href: '/admin/hr?role=staff', icon: UsersRound },
      { title: 'Livreurs', href: '/admin/drivers', icon: Truck },
    ],
  },
  {
    title: 'Menu & Produits',
    icon: UtensilsCrossed,
    items: [
      { title: 'Menus', href: '/admin/menus', icon: UtensilsCrossed },
      { title: 'Inventaire', href: '/admin/inventory', icon: Package },
    ],
  },
  {
    title: 'Commandes & Services',
    icon: ShoppingCart,
    items: [
      { title: 'Commandes', href: '/admin/orders', icon: ClipboardList },
      { title: 'Réservations', href: '/admin/reservations', icon: CalendarDays },
      { title: 'Livraisons', href: '/admin/deliveries', icon: Truck },
      { title: 'Point de vente', href: '/admin/pos', icon: ShoppingCart },
    ],
  },
  {
    title: 'Finance',
    icon: DollarSign,
    items: [
      { title: 'Factures', href: '/admin/invoices', icon: Receipt },
      { title: 'Dépenses', href: '/admin/expenses', icon: Wallet },
    ],
  },
  {
    title: 'Abonnements',
    icon: Crown,
    items: [
      { title: 'Abonnements', href: '/admin/subscriptions', icon: CreditCard },
    ],
  },
  {
    title: 'Paramètres',
    icon: Settings,
    items: [
      { title: 'Mon Restaurant', href: '/admin/restaurant', icon: Store },
      { title: 'Général', href: '/admin/settings', icon: Settings },
      { title: 'Notifications', href: '/admin/settings/notifications', icon: Bell },
      { title: 'Sécurité', href: '/admin/settings/security', icon: Shield },
      { title: 'Logs d\'audit', href: '/admin/settings/audit-logs', icon: FileText },
    ],
  },
];

interface SidebarCategoryProps {
  category: NavCategory;
  pathname: string;
  onNavigate?: () => void;
}

function SidebarCategory({ category, pathname, onNavigate }: SidebarCategoryProps) {
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
              {item.badge !== undefined && (
                <Badge
                  variant="secondary"
                  className="ml-auto text-[10px] h-5 px-1.5 bg-sidebar-accent text-sidebar-foreground"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

interface AdminSidebarContentProps {
  pathname: string;
  onNavigate?: () => void;
}

export function AdminSidebarContent({ pathname, onNavigate }: AdminSidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center shadow-sm">
          <Shield className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-[15px] text-sidebar-foreground">Restaurant OS</h1>
          <p className="text-[11px] text-sidebar-primary font-semibold">Admin Panel</p>
        </div>
      </div>

      {/* Platform Status */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2 text-[12px]">
          <Activity className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Plateforme opérationnelle</span>
        </div>
        <p className="text-[11px] text-sidebar-foreground/50 mt-0.5">Tous les systèmes fonctionnent</p>
        <div className="flex items-center gap-1 mt-1.5">
          <Globe className="h-3 w-3 text-sidebar-primary" />
          <span className="text-[11px] text-sidebar-primary font-medium">v2.0.0</span>
        </div>
      </div>

      {/* Navigation with categories */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="space-y-0.5">
          {NAV_CATEGORIES.map((category) => (
            <SidebarCategory
              key={category.title}
              category={category}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Admin Info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="p-3 rounded-lg sidebar-glass-section border border-sidebar-border/30">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-sidebar-primary" />
            <span className="font-semibold text-[12px] text-sidebar-foreground">SaaS Multi-Tenant</span>
          </div>
          <p className="text-[11px] text-sidebar-foreground/50 mt-1">Plateforme Africa-First</p>
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  return <AdminSidebarContent pathname={pathname} />;
}
