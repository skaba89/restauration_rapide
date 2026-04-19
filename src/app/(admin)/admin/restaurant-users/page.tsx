'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Store,
  Plus,
  Loader2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  city: string;
  isActive: boolean;
  isOpen: boolean;
  role: string;
  isDefault: boolean;
  adminId: string;
  pendingOrders: number;
  adminsCount: number;
}

interface RestaurantUser {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  roleInRestaurant: string;
  linkId: string;
  linkType: 'admin' | 'staff';
  linkedAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ORG_ADMIN: 'Admin Organisation',
  ORG_MANAGER: 'Manager Organisation',
  RESTAURANT_ADMIN: 'Admin Restaurant',
  RESTAURANT_MANAGER: 'Manager Restaurant',
  STAFF: 'Personnel',
  KITCHEN: 'Cuisine',
  DRIVER: 'Livreur',
  CUSTOMER: 'Client',
};

const STAFF_ROLES = ['STAFF', 'KITCHEN', 'DRIVER', 'RESTAURANT_MANAGER'];

const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
  switch (role) {
    case 'RESTAURANT_ADMIN':
    case 'SUPER_ADMIN':
    case 'ORG_ADMIN':
      return 'default';
    case 'RESTAURANT_MANAGER':
    case 'ORG_MANAGER':
      return 'secondary';
    case 'KITCHEN':
      return 'outline';
    case 'DRIVER':
      return 'secondary';
    default:
      return 'outline';
  }
};

export default function RestaurantUsersPage() {
  const { user: currentUser } = useAuth();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [users, setUsers] = useState<RestaurantUser[]>([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Create user dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'STAFF',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<RestaurantUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle active state
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  // Fetch user's restaurants
  const fetchRestaurants = useCallback(async () => {
    if (!currentUser?.id) return;
    setIsLoadingRestaurants(true);
    try {
      const response = await fetchWithAuth(
        `/api/restaurant-admins?userId=${currentUser.id}`
      );
      if (!response.ok) throw new Error('Failed to fetch restaurants');
      const data = await response.json();
      const restaurantList = data.data?.restaurants || data.restaurants || [];
      setRestaurants(restaurantList);

      // Auto-select default restaurant or first one
      if (restaurantList.length > 0 && !selectedRestaurantId) {
        const defaultRest = restaurantList.find((r: Restaurant) => r.isDefault);
        setSelectedRestaurantId(defaultRest?.id || restaurantList[0].id);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Erreur lors du chargement des restaurants');
    } finally {
      setIsLoadingRestaurants(false);
    }
  }, [currentUser?.id, selectedRestaurantId]);

  // Fetch users for selected restaurant
  const fetchUsers = useCallback(async () => {
    if (!selectedRestaurantId) return;
    setIsLoadingUsers(true);
    try {
      const response = await fetchWithAuth(
        `/api/restaurant-users?restaurantId=${selectedRestaurantId}`
      );
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.data?.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [selectedRestaurantId]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Create new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
      toast.error('Tous les champs sont requis');
      return;
    }

    if (newUser.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setIsCreatingUser(true);
    try {
      const response = await fetchWithAuth('/api/restaurant-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: selectedRestaurantId,
          email: newUser.email.toLowerCase().trim(),
          password: newUser.password,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || "Erreur lors de la création de l'utilisateur");
        return;
      }

      toast.success('Utilisateur créé avec succès');
      setNewUser({ email: '', password: '', firstName: '', lastName: '', role: 'STAFF' });
      setCreateDialogOpen(false);
      fetchUsers();
    } catch {
      toast.error('Erreur de connexion au serveur');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Toggle user active state
  const handleToggleActive = async (user: RestaurantUser) => {
    setTogglingUserId(user.id);
    try {
      const response = await fetchWithAuth('/api/restaurant-users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          isActive: !user.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || "Erreur lors de la modification");
        return;
      }

      toast.success(user.isActive ? 'Utilisateur désactivé' : 'Utilisateur activé');
      fetchUsers();
    } catch {
      toast.error('Erreur de connexion au serveur');
    } finally {
      setTogglingUserId(null);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const response = await fetchWithAuth(`/api/restaurant-users?id=${deleteTarget.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || "Erreur lors de la suppression");
        return;
      }

      toast.success('Utilisateur supprimé');
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      toast.error('Erreur de connexion au serveur');
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedRestaurant = restaurants.find((r) => r.id === selectedRestaurantId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestion d&apos;Équipe</h1>
          <p className="text-muted-foreground">
            Gérez les membres de votre restaurant
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
          onClick={() => setCreateDialogOpen(true)}
          disabled={!selectedRestaurantId}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Nouveau Membre
        </Button>
      </div>

      {/* Restaurant Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label className="mb-2 block">Restaurant</Label>
              <Select value={selectedRestaurantId} onValueChange={setSelectedRestaurantId} disabled={isLoadingRestaurants}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={isLoadingRestaurants ? 'Chargement...' : 'Sélectionner un restaurant'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        {restaurant.name} — {restaurant.city}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedRestaurant && (
              <div className="flex items-end gap-4">
                <Badge variant="secondary">
                  {users.length} membre{users.length !== 1 ? 's' : ''}
                </Badge>
                {selectedRestaurant.pendingOrders > 0 && (
                  <Badge className="bg-orange-100 text-orange-700">
                    {selectedRestaurant.pendingOrders} commande{selectedRestaurant.pendingOrders !== 1 ? 's' : ''} en attente
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membres de l&apos;équipe
            <Badge variant="secondary" className="ml-2">
              {users.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedRestaurantId ? (
            <div className="text-center py-8 text-muted-foreground">
              <Store className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Sélectionnez un restaurant pour voir les membres</p>
            </div>
          ) : isLoadingUsers ? (
            <div className="space-y-3">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun membre trouvé pour ce restaurant</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setCreateDialogOpen(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter un membre
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Membre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className={!user.isActive ? 'opacity-60' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">
                              {(user.firstName?.charAt(0) || '')}{(user.lastName?.charAt(0) || '')}
                            </div>
                            <div>
                              <p className="font-medium">
                                {user.firstName} {user.lastName}
                              </p>
                              {user.phone && (
                                <p className="text-xs text-muted-foreground">{user.phone}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{user.email || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {ROLE_LABELS[user.role] || user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'default' : 'outline'}>
                            {user.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground capitalize">
                            {user.linkType === 'admin' ? 'Administrateur' : 'Personnel'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Toggle active */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleToggleActive(user)}
                              disabled={togglingUserId === user.id || user.linkType === 'admin'}
                              title={user.isActive ? 'Désactiver' : 'Activer'}
                            >
                              {togglingUserId === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : user.isActive ? (
                                <ToggleRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>

                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setDeleteTarget(user)}
                              disabled={user.linkType === 'admin' && user.id === currentUser?.id}
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={(open) => {
        if (!open) setNewUser({ email: '', password: '', firstName: '', lastName: '', role: 'STAFF' });
        setCreateDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-orange-500" />
              Ajouter un Membre
            </DialogTitle>
            <DialogDescription>
              Créez un nouveau compte pour un membre de {selectedRestaurant?.name || 'votre restaurant'}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="newFirstName">Prénom *</Label>
                <Input
                  id="newFirstName"
                  placeholder="Amadou"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newLastName">Nom *</Label>
                <Input
                  id="newLastName"
                  placeholder="Diallo"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newEmail">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="membre@restaurant.com"
                  className="pl-10"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Mot de passe * (min. 8 caractères)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Min. 8 caractères"
                  className="pl-10 pr-10"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newRole">Rôle *</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger id="newRole">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {STAFF_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role] || role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={isCreatingUser}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                disabled={isCreatingUser}
              >
                {isCreatingUser ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Ajouter
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  Voulez-vous vraiment <strong>supprimer</strong> {deleteTarget.firstName}{' '}
                  {deleteTarget.lastName} ({deleteTarget.email}) ?
                  {deleteTarget.linkType === 'staff' ? (
                    <span className="block mt-2 text-muted-foreground">
                      Ce compte sera désactivé. Les données seront conservées.
                    </span>
                  ) : (
                    <span className="block mt-2 text-destructive">
                      Ce compte sera supprimé définitivement.
                    </span>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
