'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Store, User } from 'lucide-react';
import { toast } from 'sonner';

interface CreateRestaurantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  _count?: { restaurants: number };
}

export default function CreateRestaurantDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateRestaurantDialogProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState('');

  // Restaurant fields
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantPhone, setRestaurantPhone] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [restaurantCity, setRestaurantCity] = useState('');

  // Admin fields
  const [adminEmail, setAdminEmail] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');

  // Fetch organizations on mount
  useEffect(() => {
    if (!open) return;

    async function fetchOrganizations() {
      setIsLoadingOrgs(true);
      try {
        const response = await fetchWithAuth('/api/organizations?limit=100');
        if (!response.ok) throw new Error('Failed to fetch organizations');
        const data = await response.json();
        const orgs = data.data?.data || data.data || data || [];
        setOrganizations(Array.isArray(orgs) ? orgs : []);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        toast.error('Erreur lors du chargement des organisations');
      } finally {
        setIsLoadingOrgs(false);
      }
    }

    fetchOrganizations();
  }, [open]);

  const resetForm = () => {
    setSelectedOrgId('');
    setRestaurantName('');
    setRestaurantPhone('');
    setRestaurantAddress('');
    setRestaurantCity('');
    setAdminEmail('');
    setAdminFirstName('');
    setAdminLastName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrgId) {
      toast.error('Veuillez sélectionner une organisation');
      return;
    }

    if (!restaurantName || !adminEmail || !adminFirstName || !adminLastName) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetchWithAuth('/api/restaurant-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createRestaurant: true,
          organizationId: selectedOrgId,
          restaurantName,
          restaurantPhone,
          restaurantAddress,
          restaurantCity,
          email: adminEmail.toLowerCase().trim(),
          firstName: adminFirstName,
          lastName: adminLastName,
          role: 'admin',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Erreur lors de la création du restaurant');
        return;
      }

      toast.success('Restaurant créé avec succès !');
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error creating restaurant:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-orange-500" />
            Nouveau Restaurant
          </DialogTitle>
          <DialogDescription>
            Créez un nouveau restaurant et assignez un administrateur en une seule étape.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Select */}
          <div className="space-y-2">
            <Label htmlFor="organization">Organisation *</Label>
            <Select value={selectedOrgId} onValueChange={setSelectedOrgId} disabled={isLoadingOrgs}>
              <SelectTrigger id="organization">
                <SelectValue placeholder={isLoadingOrgs ? 'Chargement...' : 'Sélectionner une organisation'} />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name} ({org._count?.restaurants || 0} rest.)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Détails du restaurant</span>
            </div>
          </div>

          {/* Restaurant fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restaurantName">Nom du restaurant *</Label>
              <Input
                id="restaurantName"
                placeholder="Ex: Le Savana"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="restaurantPhone">Téléphone</Label>
                <Input
                  id="restaurantPhone"
                  type="tel"
                  placeholder="+224 6xx xx xx xx"
                  value={restaurantPhone}
                  onChange={(e) => setRestaurantPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="restaurantCity">Ville</Label>
                <Input
                  id="restaurantCity"
                  placeholder="Conakry"
                  value={restaurantCity}
                  onChange={(e) => setRestaurantCity(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="restaurantAddress">Adresse</Label>
              <Input
                id="restaurantAddress"
                placeholder="Almamya, Rue KE-050"
                value={restaurantAddress}
                onChange={(e) => setRestaurantAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Administrateur du restaurant</span>
            </div>
          </div>

          {/* Admin fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email de l&apos;admin *</Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@restaurant.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="adminFirstName">Prénom *</Label>
                <Input
                  id="adminFirstName"
                  placeholder="Amadou"
                  value={adminFirstName}
                  onChange={(e) => setAdminFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminLastName">Nom *</Label>
                <Input
                  id="adminLastName"
                  placeholder="Diallo"
                  value={adminLastName}
                  onChange={(e) => setAdminLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Si l&apos;utilisateur n&apos;existe pas, un compte sera créé automatiquement avec un mot de passe temporaire.
            </p>
          </div>

          {/* Footer */}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Store className="mr-2 h-4 w-4" />
                  Créer le restaurant
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
