'use client';

// ============================================
// Restaurant OS - Admin Layout
// Multi-tenant SaaS admin dashboard
// ============================================

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X,
  ChevronRight,
  LogOut,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { AdminSidebarContent } from '@/components/admin/sidebar';

// Mapping for breadcrumb display from category sub-items
const PAGE_NAMES: Record<string, string> = {
  '/admin': 'Tableau de bord',
  '/admin/analytics': 'Analyses',
  '/admin/reports': 'Rapports',
  '/admin/organizations': 'Organisations',
  '/admin/restaurants': 'Restaurants',
  '/admin/users': 'Utilisateurs',
  '/admin/restaurant-users': 'Gestion Equipe',
  '/admin/hr': 'Ressources Humaines',
  '/admin/menus': 'Menus',
  '/admin/inventory': 'Inventaire',
  '/admin/orders': 'Commandes',
  '/admin/reservations': 'Réservations',
  '/admin/deliveries': 'Livraisons',
  '/admin/pos': 'Point de vente',
  '/admin/invoices': 'Factures',
  '/admin/expenses': 'Dépenses',
  '/admin/subscriptions': 'Abonnements',
  '/admin/settings': 'Paramètres',
  '/admin/restaurant': 'Mon Restaurant',
  '/admin/settings/notifications': 'Notifications',
  '/admin/settings/security': 'Sécurité',
  '/admin/settings/audit-logs': 'Logs d\'audit',
  '/admin/drivers': 'Livreurs',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full relative">
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-2 z-10 lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Sidebar content with collapsible categories & sub-items */}
          <AdminSidebarContent
            pathname={pathname}
            onNavigate={() => setSidebarOpen(false)}
          />

          {/* User section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sidebar-accent rounded-full flex items-center justify-center">
                <span className="text-sidebar-foreground font-medium">AD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">Admin</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">admin@restaurant-os.com</p>
              </div>
              <Button variant="ghost" size="icon" className="text-sidebar-foreground/60 hover:text-sidebar-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-background border-b lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/admin" className="hover:text-foreground">
                Admin
              </Link>
              {pathname !== '/admin' && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-foreground font-medium">
                    {PAGE_NAMES[pathname] || PAGE_NAMES[pathname.replace(/\/[^/]+$/, '')] || 'Dashboard'}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
