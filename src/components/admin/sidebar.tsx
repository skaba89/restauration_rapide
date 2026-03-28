'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
  children?: NavItem[];
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Organizations', href: '/admin/organizations', icon: Building2 },
  { title: 'Restaurants', href: '/admin/restaurants', icon: Store },
  { title: 'Users', href: '/admin/users', icon: Users },
  { title: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    children: [
      { title: 'General', href: '/admin/settings', icon: Settings },
      { title: 'Notifications', href: '/admin/settings/notifications', icon: Bell },
      { title: 'Security', href: '/admin/settings/security', icon: Shield },
      { title: 'Audit Logs', href: '/admin/settings/audit-logs', icon: FileText },
    ]
  },
];

interface SidebarNavItemProps {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}

function SidebarNavItem({ item, pathname, onNavigate }: SidebarNavItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    const isChildActive = item.children!.some(child => 
      pathname === child.href || pathname.startsWith(child.href + '/')
    );

    return (
      <Collapsible open={isOpen || isChildActive} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              isChildActive
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-foreground'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium flex-1 text-left">{item.title}</span>
            {isOpen || isChildActive ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 pt-1">
          {item.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                pathname === child.href
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                  : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-foreground'
              }`}
            >
              <child.icon className="h-4 w-4" />
              <span className="text-sm">{child.title}</span>
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
        isActive
          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
          : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-foreground'
      }`}
    >
      <item.icon className="h-5 w-5" />
      <span className="font-medium">{item.title}</span>
      {item.badge !== undefined && (
        <Badge variant="secondary" className="ml-auto text-xs">
          {item.badge}
        </Badge>
      )}
    </Link>
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
      <div className="flex items-center gap-3 px-4 py-6 border-b">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Restaurant OS</h1>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Admin Panel</p>
        </div>
      </div>

      {/* Platform Status */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-green-500" />
          <span className="text-green-600 dark:text-green-400 font-medium">Platform Healthy</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.href}
              item={item}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Admin Info */}
      <div className="p-4 border-t">
        <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-purple-600" />
            <span className="font-semibold text-sm">Multi-Tenant SaaS</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Africa-First Platform</p>
          <div className="flex items-center gap-1 mt-2">
            <Globe className="h-3 w-3 text-purple-500" />
            <span className="text-xs text-purple-600 dark:text-purple-400">v2.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  return <AdminSidebarContent pathname={pathname} />;
}
