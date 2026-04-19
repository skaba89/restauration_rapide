'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Store,
  Users,
  ShoppingBag,
  Settings,
  ExternalLink,
  ChevronRight,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  city: string;
  isActive: boolean;
  isOpen: boolean;
  domain: string | null;
  subdomain: string | null;
  primaryColor: string | null;
  isMultiLocation: boolean;
  parentRestaurantId: string | null;
  role: string;
  isDefault: boolean;
  adminId: string;
  pendingOrders: number;
  adminsCount: number;
}

export default function MyRestaurantsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('');

  // Get current user ID from session
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch current user
    fetch('/api/auth/me', {
      credentials: 'include', // Include cookies
    })
      .then(res => {
        if (!res.ok) {
          // Redirect to login if not authenticated
          router.push('/login?redirect=/my-restaurants');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data?.user?.id) {
          setUserId(data.user.id);
          // If user has restaurants, pre-populate the list
          const userRestaurants = Array.isArray(data.user.restaurants) ? data.user.restaurants : [];
          if (userRestaurants.length > 0) {
            setRestaurants(userRestaurants.map((r: any) => ({
              ...r,
              pendingOrders: 0, // Will be fetched separately
              adminsCount: 1, // Will be fetched separately
              adminId: 'loaded',
              city: r.city || 'Conakry',
              isActive: true,
              isOpen: true,
              isMultiLocation: false,
              parentRestaurantId: null,
            })));
          }
        }
      })
      .catch(err => {
        console.error('Auth error:', err);
        router.push('/login?redirect=/my-restaurants');
      });
  }, [router]);

  useEffect(() => {
    if (!userId) return;

    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const res = await fetchWithAuth(`/api/restaurant-admins?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setRestaurants(data.restaurants || []);
        }
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
        toast.error('Erreur lors du chargement des restaurants');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [userId]);

  const handleCreateRestaurant = async () => {
    if (!newName.trim()) {
      toast.error('Le nom du restaurant est requis');
      return;
    }
    if (!userId) {
      toast.error('Vous devez être connecté');
      return;
    }

    setCreating(true);

    try {
      const res = await fetchWithAuth('/api/restaurant-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createRestaurant: true,
          restaurantName: newName,
          restaurantPhone: newPhone,
          restaurantAddress: newAddress,
          restaurantCity: newCity || 'Conakry',
          organizationId: 'default', // Will be created or use default
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création');
      }

      toast.success('Restaurant créé avec succès!');
      setShowCreateDialog(false);
      setNewName('');
      setNewPhone('');
      setNewAddress('');
      setNewCity('');

      // Refresh list
      setRestaurants(prev => [...prev, { ...data.restaurant, role: 'admin', isDefault: true, adminId: 'new', pendingOrders: 0, adminsCount: 1 }]);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  const getRestaurantUrl = (restaurant: Restaurant) => {
    if (restaurant.domain) {
      return `https://${restaurant.domain}`;
    }
    if (restaurant.subdomain) {
      return `https://${restaurant.subdomain}.restaurant-os.app`;
    }
    return `/menu/${restaurant.slug}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Mes Restaurants
            </h1>
            <p className="text-gray-500 mt-1">
              Gérez vos restaurants et leurs paramètres
            </p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-5 h-5 mr-2" />
                Nouveau Restaurant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un nouveau restaurant</DialogTitle>
                <DialogDescription className="sr-only">Remplissez les informations pour créer un nouveau restaurant.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Nom du restaurant *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: KFM Delice"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    placeholder="Ex: +224 622 00 00 00"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    placeholder="Ex: Kaloum, Conakry"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    placeholder="Ex: Conakry"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                    onClick={handleCreateRestaurant}
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Création...
                      </>
                    ) : (
                      'Créer'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Restaurant list */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-16 h-16 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <Card className="p-12 text-center">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">
              Aucun restaurant
            </h2>
            <p className="text-gray-500 mt-2 mb-6">
              Créez votre premier restaurant pour commencer
            </p>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer un restaurant
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Logo */}
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                        style={{
                          backgroundColor: restaurant.primaryColor || '#F97316',
                        }}
                      >
                        {restaurant.logo ? (
                          <img
                            src={restaurant.logo}
                            alt={restaurant.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          restaurant.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {restaurant.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {restaurant.isOpen ? (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ouvert
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 text-xs">
                              <XCircle className="w-3 h-3 mr-1" />
                              Fermé
                            </Badge>
                          )}
                          {restaurant.isDefault && (
                            <Badge className="bg-orange-100 text-orange-700 text-xs">
                              Par défaut
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <ShoppingBag className="w-5 h-5 text-orange-500 mx-auto" />
                      <p className="text-lg font-bold text-gray-900">
                        {restaurant.pendingOrders}
                      </p>
                      <p className="text-xs text-gray-500">En attente</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <Users className="w-5 h-5 text-blue-500 mx-auto" />
                      <p className="text-lg font-bold text-gray-900">
                        {restaurant.adminsCount}
                      </p>
                      <p className="text-xs text-gray-500">Admins</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span className="truncate">
                        {restaurant.domain || `${restaurant.subdomain}.restaurant-os.app`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {restaurant.city}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push(`/admin/restaurants/${restaurant.id}`)}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Gérer
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(getRestaurantUrl(restaurant), '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
