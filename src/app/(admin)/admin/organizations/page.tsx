'use client';

// ============================================
// Restaurant OS - Organizations Management
// Admin page to manage organizations
// ============================================

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Plus,
  MoreHorizontal,
  Building2,
  Store,
  Users,
  Mail,
  MapPin,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  email: string;
  phone: string;
  city: string;
  countryId: string;
  plan: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    restaurants: number;
    users: number;
  };
}

const planColors: Record<string, string> = {
  Free: 'bg-gray-100 text-gray-700',
  STARTER: 'bg-blue-100 text-blue-700',
  Starter: 'bg-blue-100 text-blue-700',
  PRO: 'bg-orange-100 text-orange-700',
  Pro: 'bg-orange-100 text-orange-700',
  BUSINESS: 'bg-purple-100 text-purple-700',
  Business: 'bg-purple-100 text-purple-700',
  ENTERPRISE: 'bg-amber-100 text-amber-700',
  Enterprise: 'bg-amber-100 text-amber-700',
};

export default function OrganizationsPage() {
  const [search, setSearch] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await fetchWithAuth('/api/admin/organizations?limit=50');
        if (!response.ok) {
          throw new Error('Failed to fetch organizations');
        }
        const data = await response.json();
        setOrganizations(data.data || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        // Demo data fallback - consistent with dashboard
        const demoOrgs: Organization[] = [
          {
            id: 'org-1',
            name: 'Jardin Group',
            slug: 'jardin-group',
            email: 'contact@jardin-group.ci',
            phone: '+225 07 00 00 00 01',
            city: 'Abidjan',
            countryId: 'CI',
            plan: 'BUSINESS',
            logo: null,
            isActive: true,
            createdAt: '2024-01-10',
            _count: { restaurants: 5, users: 23 },
          },
          {
            id: 'org-2',
            name: 'Awa Restaurant',
            slug: 'awa-restaurant',
            email: 'info@chezawa.sn',
            phone: '+221 77 00 00 01',
            city: 'Dakar',
            countryId: 'SN',
            plan: 'PRO',
            logo: null,
            isActive: true,
            createdAt: '2024-01-14',
            _count: { restaurants: 2, users: 8 },
          },
          {
            id: 'org-3',
            name: 'GFC Ltd',
            slug: 'gfc-ltd',
            email: 'admin@gfc.com.gh',
            phone: '+233 20 00 00 001',
            city: 'Accra',
            countryId: 'GH',
            plan: 'BUSINESS',
            logo: null,
            isActive: true,
            createdAt: '2024-01-13',
            _count: { restaurants: 8, users: 45 },
          },
          {
            id: 'org-4',
            name: 'Mama Africa SARL',
            slug: 'mama-africa',
            email: 'contact@mama-africa.cm',
            phone: '+237 6 00 00 00 01',
            city: 'Douala',
            countryId: 'CM',
            plan: 'STARTER',
            logo: null,
            isActive: true,
            createdAt: '2024-01-12',
            _count: { restaurants: 1, users: 3 },
          },
          {
            id: 'org-5',
            name: 'Café Group',
            slug: 'cafe-group',
            email: 'info@cafegroup.ci',
            phone: '+225 07 00 00 00 02',
            city: 'Abidjan',
            countryId: 'CI',
            plan: 'PRO',
            logo: null,
            isActive: true,
            createdAt: '2024-01-11',
            _count: { restaurants: 3, users: 12 },
          },
        ];
        setOrganizations(demoOrgs);
        setTotal(demoOrgs.length);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrganizations();
  }, []);

  const filteredOrgs = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organisations</h1>
          <p className="text-gray-500">Gérer les organisations inscrites ({total} au total)</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle organisation
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher une organisation..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Organizations grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrgs.map((org) => (
            <Card key={org.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                      <Badge className={planColors[org.plan] || planColors['Starter']} variant="secondary">
                        {org.plan}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Voir détails</DropdownMenuItem>
                      <DropdownMenuItem>Modifier</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Désactiver</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="h-4 w-4" />
                  {org.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  {org.city}, {org.countryId}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Store className="h-4 w-4 text-orange-500" />
                      <span className="font-semibold">{org._count.restaurants}</span>
                    </div>
                    <p className="text-xs text-gray-500">Restos</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold">{org._count.users}</span>
                    </div>
                    <p className="text-xs text-gray-500">Users</p>
                  </div>
                  <div className="text-center">
                    <Badge 
                      variant={org.isActive ? 'default' : 'secondary'}
                      className={org.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}
                    >
                      {org.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Détails
                  </Button>
                  <Button variant="default" size="sm" className="flex-1">
                    Gérer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
