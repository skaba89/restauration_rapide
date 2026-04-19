'use client';

// ============================================
// Restaurant OS - Users Management (Super Admin)
// Admin page to manage all users
// ============================================

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search,
  Plus,
  MoreHorizontal,
  User,
  Shield,
  CheckCircle,
  XCircle,
  ChefHat,
  Truck,
  Users,
  UserCog,
  Loader2,
  Key,
  Trash2,
  Edit,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

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

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface Restaurant {
  id: string;
  name: string;
  organizationId: string;
  organizationName: string;
}

const roleLabels: Record<string, { label: string; color: string; icon: any }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'bg-red-100 text-red-700', icon: Shield },
  ORG_ADMIN: { label: 'Admin Organisation', color: 'bg-purple-100 text-purple-700', icon: UserCog },
  ORG_MANAGER: { label: 'Manager Org', color: 'bg-indigo-100 text-indigo-700', icon: Users },
  RESTAURANT_ADMIN: { label: 'Admin Restaurant', color: 'bg-blue-100 text-blue-700', icon: UserCog },
  RESTAURANT_MANAGER: { label: 'Manager Resto', color: 'bg-cyan-100 text-cyan-700', icon: Users },
  STAFF: { label: 'Employé', color: 'bg-green-100 text-green-700', icon: User },
  KITCHEN: { label: 'Cuisinier', color: 'bg-amber-100 text-amber-700', icon: ChefHat },
  DRIVER: { label: 'Livreur', color: 'bg-orange-100 text-orange-700', icon: Truck },
  CUSTOMER: { label: 'Client', color: 'bg-gray-100 text-gray-700', icon: User },
  SUPPORT: { label: 'Support', color: 'bg-teal-100 text-teal-700', icon: Users },
};

const roleDescriptions: Record<string, string> = {
  SUPER_ADMIN: 'Accès complet à toute la plateforme',
  ORG_ADMIN: 'Administrateur d\'une organisation',
  ORG_MANAGER: 'Gestionnaire d\'une organisation',
  RESTAURANT_ADMIN: 'Administrateur d\'un restaurant',
  RESTAURANT_MANAGER: 'Gestionnaire d\'un restaurant',
  STAFF: 'Employé du restaurant (serveur, caissier, etc.)',
  KITCHEN: 'Cuisinier / Chef de cuisine',
  DRIVER: 'Livreur de commandes',
  CUSTOMER: 'Client du restaurant',
  SUPPORT: 'Support technique',
};

const vehicleTypes = [
  { value: 'motorcycle', label: 'Moto' },
  { value: 'bicycle', label: 'Vélo' },
  { value: 'car', label: 'Voiture' },
  { value: 'scooter', label: 'Scooter' },
];

const staffRoles = [
  { value: 'server', label: 'Serveur/Serveuse' },
  { value: 'cashier', label: 'Caissier(ère)' },
  { value: 'host', label: 'Hôte/Hôtesse' },
  { value: 'bartender', label: 'Barman/Barmaid' },
  { value: 'manager', label: 'Manager' },
  { value: 'cook', label: 'Cuisinier(ère)' },
  { value: 'chef', label: 'Chef' },
  { value: 'prep', label: 'Préparateur' },
  { value: 'dishwasher', label: 'Plongeur' },
  { value: 'cleaner', label: 'Agent d\'entretien' },
];

const departments = [
  { value: 'kitchen', label: 'Cuisine' },
  { value: 'service', label: 'Service' },
  { value: 'bar', label: 'Bar' },
  { value: 'delivery', label: 'Livraison' },
  { value: 'management', label: 'Direction' },
  { value: 'cleaning', label: 'Entretien' },
];

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'STAFF' as string,
    organizationId: '',
    restaurantId: '',
    vehicleType: 'motorcycle',
    vehiclePlate: '',
    staffRole: 'server',
    department: '',
    hourlyRate: '',
    isActive: true,
  });

  useEffect(() => {
    fetchUsers();
    fetchFormData();
  }, []);

  async function fetchUsers() {
    try {
      const response = await fetchWithAuth('/api/admin/users?limit=100');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.data || []);
      setTotalUsers(data.total || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFormData() {
    try {
      const response = await fetchWithAuth('/api/admin/users/form-data');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
        setRestaurants(data.restaurants || []);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  }

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

  const resetForm = () => {
    setFormData({
      email: '',
      phone: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'STAFF',
      organizationId: '',
      restaurantId: '',
      vehicleType: 'motorcycle',
      vehiclePlate: '',
      staffRole: 'server',
      department: '',
      hourlyRate: '',
      isActive: true,
    });
  };

  const handleCreateUser = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création');
      }

      toast.success('Utilisateur créé avec succès');
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedUser.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          isActive: formData.isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la mise à jour');
      }

      toast.success('Utilisateur mis à jour');
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth(`/api/admin/users?id=${selectedUser.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la suppression');
      }

      toast.success('Utilisateur désactivé');
      setShowDeleteDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !formData.password) return;
    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedUser.id,
          newPassword: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la réinitialisation');
      }

      toast.success('Mot de passe réinitialisé');
      setShowResetDialog(false);
      setSelectedUser(null);
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la réinitialisation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user: UserItem) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      phone: user.phone || '',
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      organizationId: user.organizationUsers[0]?.organization.id || '',
      restaurantId: '',
      vehicleType: 'motorcycle',
      vehiclePlate: '',
      staffRole: 'server',
      department: '',
      hourlyRate: '',
      isActive: user.isActive,
    });
    setShowEditModal(true);
  };

  // Stats calculations
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role.includes('ADMIN')).length,
    staff: users.filter(u => ['STAFF', 'KITCHEN', 'DRIVER'].includes(u.role)).length,
  };

  // Filter restaurants by organization
  const filteredRestaurants = formData.organizationId
    ? restaurants.filter(r => r.organizationId === formData.organizationId)
    : restaurants;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-500">Créer et gérer tous les utilisateurs - Super Admin</p>
        </div>
        <Button onClick={() => { resetForm(); setShowCreateModal(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel utilisateur
        </Button>
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
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-gray-500">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-xs text-gray-500">Administrateurs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Users className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.staff}</p>
                <p className="text-xs text-gray-500">Personnel</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            <SelectItem value="ORG_ADMIN">Admin Organisation</SelectItem>
            <SelectItem value="RESTAURANT_ADMIN">Admin Restaurant</SelectItem>
            <SelectItem value="STAFF">Employés</SelectItem>
            <SelectItem value="KITCHEN">Cuisiniers</SelectItem>
            <SelectItem value="DRIVER">Livreurs</SelectItem>
            <SelectItem value="CUSTOMER">Clients</SelectItem>
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
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const RoleIcon = roleLabels[user.role]?.icon || User;
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
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
                            {user.phone && (
                              <p className="text-xs text-gray-400">{user.phone}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleLabels[user.role]?.color || roleLabels['CUSTOMER'].color}>
                          <RoleIcon className="h-3 w-3 mr-1" />
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
                            <DropdownMenuItem onClick={() => openEditModal(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setShowResetDialog(true); }}>
                              <Key className="h-4 w-4 mr-2" />
                              Réinitialiser mot de passe
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => { setSelectedUser(user); setShowDeleteDialog(true); }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Désactiver
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour créer un nouvel utilisateur
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label>Type d'utilisateur *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="font-medium">Super Admin</p>
                        <p className="text-xs text-gray-500">Accès complet à la plateforme</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="ORG_ADMIN">
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="font-medium">Admin Organisation</p>
                        <p className="text-xs text-gray-500">Gère une organisation</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="RESTAURANT_ADMIN">
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="font-medium">Admin Restaurant</p>
                        <p className="text-xs text-gray-500">Gère un restaurant</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="KITCHEN">
                    <div className="flex items-center gap-2">
                      <ChefHat className="h-4 w-4 text-amber-500" />
                      <div>
                        <p className="font-medium">Cuisinier</p>
                        <p className="text-xs text-gray-500">Personnel de cuisine</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="STAFF">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="font-medium">Employé</p>
                        <p className="text-xs text-gray-500">Serveur, caissier, etc.</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="DRIVER">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="font-medium">Livreur</p>
                        <p className="text-xs text-gray-500">Livraison de commandes</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {formData.role && (
                <p className="text-xs text-gray-500 mt-1">
                  {roleDescriptions[formData.role]}
                </p>
              )}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input 
                  placeholder="Prénom"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input 
                  placeholder="Nom"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input 
                  type="email" 
                  placeholder="email@exemple.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input 
                  placeholder="+224 620 00 00 00"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mot de passe *</Label>
              <Input 
                type="password" 
                placeholder="Mot de passe"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>

            {/* Organization Selection */}
            {formData.role !== 'SUPER_ADMIN' && (
              <div className="space-y-2">
                <Label>Organisation *</Label>
                <Select 
                  value={formData.organizationId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, organizationId: value, restaurantId: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une organisation" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Restaurant Selection (for STAFF, KITCHEN, RESTAURANT_ADMIN) */}
            {['STAFF', 'KITCHEN', 'RESTAURANT_ADMIN', 'RESTAURANT_MANAGER'].includes(formData.role) && formData.organizationId && (
              <div className="space-y-2">
                <Label>Restaurant *</Label>
                <Select 
                  value={formData.restaurantId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, restaurantId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRestaurants.map((rest) => (
                      <SelectItem key={rest.id} value={rest.id}>
                        {rest.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Driver-specific fields */}
            {formData.role === 'DRIVER' && (
              <>
                <div className="border-t pt-4 mt-2">
                  <h4 className="font-medium mb-3">Informations Livreur</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type de véhicule</Label>
                    <Select 
                      value={formData.vehicleType} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type de véhicule" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleTypes.map((vt) => (
                          <SelectItem key={vt.value} value={vt.value}>
                            {vt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Plaque d'immatriculation</Label>
                    <Input 
                      placeholder="Ex: GN-1234-A"
                      value={formData.vehiclePlate}
                      onChange={(e) => setFormData(prev => ({ ...prev, vehiclePlate: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Staff-specific fields */}
            {['STAFF', 'KITCHEN'].includes(formData.role) && (
              <>
                <div className="border-t pt-4 mt-2">
                  <h4 className="font-medium mb-3">Informations Employé</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Poste</Label>
                    <Select 
                      value={formData.staffRole} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, staffRole: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Poste" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffRoles.map((sr) => (
                          <SelectItem key={sr.value} value={sr.value}>
                            {sr.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Département</Label>
                    <Select 
                      value={formData.department} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Département" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dep) => (
                          <SelectItem key={dep.value} value={dep.value}>
                            {dep.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Taux horaire</Label>
                  <Input 
                    type="number" 
                    placeholder="Ex: 5000"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateUser} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Créer l'utilisateur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifier les informations de l'utilisateur
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input 
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input 
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="isActive" 
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="isActive">Utilisateur actif</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateUser} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser le mot de passe</AlertDialogTitle>
            <AlertDialogDescription>
              Entrez un nouveau mot de passe pour <strong>{selectedUser?.email}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input 
              type="password" 
              placeholder="Nouveau mot de passe"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFormData(prev => ({ ...prev, password: '' }))}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Réinitialiser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Désactiver l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir désactiver <strong>{selectedUser?.email}</strong> ? 
              L'utilisateur ne pourra plus se connecter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser} 
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Désactiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}