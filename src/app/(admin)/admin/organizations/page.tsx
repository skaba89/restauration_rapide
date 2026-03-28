'use client';

// ============================================
// Restaurant OS - Organizations Management
// Admin page to manage organizations
// ============================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  MoreHorizontal,
  Building2,
  Store,
  Users,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

const organizations = [
  {
    id: 'org-1',
    name: 'Jardin Group',
    email: 'contact@jardin-group.ci',
    phone: '+225 07 00 00 00 01',
    country: 'Côte d\'Ivoire',
    plan: 'Business',
    status: 'active',
    restaurants: 5,
    users: 23,
    revenue: 995000,
    createdAt: '2024-01-10',
  },
  {
    id: 'org-2',
    name: 'Awa Restaurant',
    email: 'info@chezawa.sn',
    phone: '+221 77 00 00 01',
    country: 'Sénégal',
    plan: 'Pro',
    status: 'active',
    restaurants: 2,
    users: 8,
    revenue: 158000,
    createdAt: '2024-01-14',
  },
  {
    id: 'org-3',
    name: 'GFC Ltd',
    email: 'admin@gfc.com.gh',
    phone: '+233 20 00 00 001',
    country: 'Ghana',
    plan: 'Business',
    status: 'active',
    restaurants: 8,
    users: 45,
    revenue: 1592000,
    createdAt: '2024-01-13',
  },
  {
    id: 'org-4',
    name: 'Mama Africa SARL',
    email: 'contact@mama-africa.cm',
    phone: '+237 6 00 00 00 01',
    country: 'Cameroun',
    plan: 'Starter',
    status: 'pending',
    restaurants: 1,
    users: 3,
    revenue: 29000,
    createdAt: '2024-01-12',
  },
  {
    id: 'org-5',
    name: 'Café Group',
    email: 'info@cafegroup.ci',
    phone: '+225 07 00 00 00 02',
    country: 'Côte d\'Ivoire',
    plan: 'Pro',
    status: 'active',
    restaurants: 3,
    users: 12,
    revenue: 237000,
    createdAt: '2024-01-11',
  },
];

const planColors: Record<string, string> = {
  Free: 'bg-gray-100 text-gray-700',
  Starter: 'bg-blue-100 text-blue-700',
  Pro: 'bg-orange-100 text-orange-700',
  Business: 'bg-purple-100 text-purple-700',
};

export default function OrganizationsPage() {
  const [search, setSearch] = useState('');

  const filteredOrgs = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organisations</h1>
          <p className="text-gray-500">Gérer les organisations inscrites</p>
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
                    <Badge className={planColors[org.plan]} variant="secondary">
                      {org.plan}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="h-4 w-4" />
                {org.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                {org.country}
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Store className="h-4 w-4 text-orange-500" />
                    <span className="font-semibold">{org.restaurants}</span>
                  </div>
                  <p className="text-xs text-gray-500">Restos</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold">{org.users}</span>
                  </div>
                  <p className="text-xs text-gray-500">Users</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-orange-600">
                    {(org.revenue / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-gray-500">FCFA/m</p>
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
    </div>
  );
}
