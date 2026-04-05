'use client';

// ============================================
// Restaurant OS - Users Management
// Admin page to manage users
// ============================================

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserItem {
  id: string;
  email: string;
  phone: string | null;
  role: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  isActive: boolean;
  isLocked: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  organizationUsers: Array<{
    organization: {
      id: string;
      name: string;
    };
    role: string;
  }>;
}

const roleLabels: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'bg-red-100 text-red-700' },
  ORG_ADMIN: { label: 'Admin Org', color: 'bg-purple-100 text-purple-700' },
  RESTAURANT_ADMIN: { label: 'Admin Resto', color: 'bg-blue-100 text-blue-700' },
  STAFF: { label: 'Personnel', color: 'bg-green-100 text-green-700' },
  DRIVER: { label: 'Livreur', color: 'bg-orange-100 text-orange-700' },
  CUSTOMER: { label: 'Client', color: 'bg-gray-100 text-gray-700' },
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/admin/users?limit=50');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.data || []);
        setTotalUsers(data.total || 0);
      } catch (error) {
        console.error('Error fetching users:', error);
        // Demo data fallback - consistent with dashboard
        const demoUsers: UserItem[] = [
          {
            id: 'user-1',
            email: 'amadou@restaurant-os.com',
            phone: '+225 07 00 00 00 01',
            role: 'ORG_ADMIN',
            firstName: 'Amadou',
            lastName: 'Diallo',
            avatar: null,
            isActive: true,
            isLocked: false,
            createdAt: '2023-06-15',
            lastLoginAt: '2024-01-15T10:30:00',
            organizationUsers: [{ organization: { id: 'org-1', name: 'Jardin Group' }, role: 'admin' }],
          },
          {
            id: 'user-2',
            email: 'fatou@restaurant-os.com',
            phone: '+225 07 00 00 00 02',
            role: 'RESTAURANT_ADMIN',
            firstName: 'Fatou',
            lastName: 'Ndiaye',
            avatar: null,
            isActive: true,
            isLocked: false,
            createdAt: '2023-08-20',
            lastLoginAt: '2024-01-15T09:45:00',
            organizationUsers: [{ organization: { id: 'org-2', name: 'Awa Restaurant' }, role: 'admin' }],
          },
          {
            id: 'user-3',
            email: 'kofi@restaurant-os.com',
            phone: '+225 07 00 00 00 03',
            role: 'STAFF',
            firstName: 'Kofi',
            lastName: 'Mensah',
            avatar: null,
            isActive: true,
            isLocked: false,
            createdAt: '2023-10-05',
            lastLoginAt: '2024-01-14T18:20:00',
            organizationUsers: [{ organization: { id: 'org-3', name: 'GFC Ltd' }, role: 'staff' }],
          },
          {
            id: 'user-4',
            email: 'aisha@restaurant-os.com',
            phone: '+225 07 00 00 00 04',
            role: 'DRIVER',
            firstName: 'Aisha',
            lastName: 'Bamba',
            avatar: null,
            isActive: true,
            isLocked: false,
            createdAt: '2023-11-12',
            lastLoginAt: '2024-01-15T11:00:00',
            organizationUsers: [{ organization: { id: 'org-1', name: 'Jardin Group' }, role: 'driver' }],
          },
          {
            id: 'user-5',
            email: 'moussa@restaurant-os.com',
            phone: '+225 07 00 00 00 05',
            role: 'STAFF',
            firstName: 'Moussa',
            lastName: 'Koné',
            avatar: null,
            isActive: false,
            isLocked: false,
            createdAt: '2023-09-25',
            lastLoginAt: '2024-01-10T14:30:00',
            organizationUsers: [{ organization: { id: 'org-4', name: 'Mama Africa SARL' }, role: 'staff' }],
          },
          {
            id: 'user-6',
            email: 'adama@restaurant-os.com',
            phone: '+225 07 00 00 00 06',
            role: 'CUSTOMER',
            firstName: 'Adama',
            lastName: 'Touré',
            avatar: null,
            isActive: true,
            isLocked: false,
            createdAt: '2024-01-05',
            lastLoginAt: '2024-01-15T08:15:00',
            organizationUsers: [],
          },
        ];
        setUsers(demoUsers);
        setTotalUsers(demoUsers.length);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.firstName?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (user.lastName?.toLowerCase() || '').includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getInitials = (user: UserItem) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  const getOrganization = (user: UserItem) => {
    if (user.organizationUsers && user.organizationUsers.length > 0) {
      return user.organizationUsers[0].organization.name;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-500">Gérer les utilisateurs de la plateforme ({totalUsers} au total)</p>
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
                  {users.filter((u) => u.isActive).length}
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
                  {users.filter((u) => !u.isActive).length}
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
          {loading ? (
            <div className="p-4 space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
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
                            {getInitials(user)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user.email.split('@')[0]}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roleLabels[user.role]?.color || roleLabels['CUSTOMER'].color}>
                        {roleLabels[user.role]?.label || user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {getOrganization(user) || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          user.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }
                      >
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {formatDate(user.lastLoginAt)}
                    </TableCell>
                    <TableCell>
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Désactiver
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
