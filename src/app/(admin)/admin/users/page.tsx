'use client';

// ============================================
// Restaurant OS - Users Management
// Admin page to manage users
// ============================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  MoreHorizontal,
  User,
  Shield,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const users = [
  {
    id: 'user-1',
    name: 'Amadou Diallo',
    email: 'amadou@restaurant-os.com',
    role: 'ORG_ADMIN',
    organization: 'Jardin Group',
    status: 'active',
    lastLogin: '2024-01-15T10:30:00',
    createdAt: '2023-06-15',
  },
  {
    id: 'user-2',
    name: 'Fatou Ndiaye',
    email: 'fatou@restaurant-os.com',
    role: 'RESTAURANT_ADMIN',
    organization: 'Awa Restaurant',
    status: 'active',
    lastLogin: '2024-01-15T09:45:00',
    createdAt: '2023-08-20',
  },
  {
    id: 'user-3',
    name: 'Kofi Mensah',
    email: 'kofi@restaurant-os.com',
    role: 'STAFF',
    organization: 'GFC Ltd',
    status: 'active',
    lastLogin: '2024-01-14T18:20:00',
    createdAt: '2023-10-05',
  },
  {
    id: 'user-4',
    name: 'Aisha Bamba',
    email: 'aisha@restaurant-os.com',
    role: 'DRIVER',
    organization: 'Jardin Group',
    status: 'active',
    lastLogin: '2024-01-15T11:00:00',
    createdAt: '2023-11-12',
  },
  {
    id: 'user-5',
    name: 'Moussa Koné',
    email: 'moussa@restaurant-os.com',
    role: 'STAFF',
    organization: 'Mama Africa SARL',
    status: 'inactive',
    lastLogin: '2024-01-10T14:30:00',
    createdAt: '2023-09-25',
  },
  {
    id: 'user-6',
    name: 'Adama Touré',
    email: 'adama@restaurant-os.com',
    role: 'CUSTOMER',
    organization: null,
    status: 'active',
    lastLogin: '2024-01-15T08:15:00',
    createdAt: '2024-01-05',
  },
];

const roleLabels: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'bg-red-100 text-red-700' },
  ORG_ADMIN: { label: 'Admin Org', color: 'bg-purple-100 text-purple-700' },
  RESTAURANT_ADMIN: { label: 'Admin Resto', color: 'bg-blue-100 text-blue-700' },
  STAFF: { label: 'Personnel', color: 'bg-green-100 text-green-700' },
  DRIVER: { label: 'Livreur', color: 'bg-orange-100 text-orange-700' },
  CUSTOMER: { label: 'Client', color: 'bg-gray-100 text-gray-700' },
};

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-500">Gérer les utilisateurs de la plateforme</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un utilisateur..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            <SelectItem value="ORG_ADMIN">Admin Org</SelectItem>
            <SelectItem value="RESTAURANT_ADMIN">Admin Resto</SelectItem>
            <SelectItem value="STAFF">Personnel</SelectItem>
            <SelectItem value="DRIVER">Livreur</SelectItem>
            <SelectItem value="CUSTOMER">Client</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="inactive">Inactif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.status === 'active').length}
                </p>
                <p className="text-xs text-gray-500">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role.includes('ADMIN')).length}
                </p>
                <p className="text-xs text-gray-500">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.status === 'inactive').length}
                </p>
                <p className="text-xs text-gray-500">Inactifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Organisation</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.name.split(' ').map((n) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={roleLabels[user.role].color}>
                      {roleLabels[user.role].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {user.organization || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        user.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }
                    >
                      {user.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {formatDate(user.lastLogin)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
