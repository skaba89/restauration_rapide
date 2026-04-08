'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Building2, Plus, MapPin, Users, Phone, Mail, Star, RefreshCw, TrendingUp, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiGet } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

// Simple currency formatter for GNF (Guinean Franc)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-GN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' GNF';
};

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  managerName: string;
  managerPhone: string;
  status: 'active' | 'construction' | 'closed';
  openDate: string;
  operatingHours: {
    open: string;
    close: string;
  };
  stats: {
    staffCount: number;
    dailyRevenue: number;
    activeOrders: number;
    rating: number;
  };
  isMain: boolean;
  isOpen: boolean;
  isBusy: boolean;
}

export default function AdminBranchesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isNewBranchOpen, setIsNewBranchOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    managerName: '',
    managerPhone: '',
    openTime: '08:00',
    closeTime: '22:00',
  });
  const { toast } = useToast();

  const fetchBranches = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiGet<{ branches: Branch[] }>('/branches', { demo: true, includeStats: true });
      if (response?.branches && response.branches.length > 0) {
        setBranches(response.branches);
      } else {
        setDemoData();
      }
    } catch (err) {
      console.error('Failed to fetch branches:', err);
      setError('Erreur lors du chargement des succursales');
      setDemoData();
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoData = () => {
    setBranches([
      {
        id: 'branch-001',
        name: 'KFM DELICE - Kaloum',
        code: 'KAL-001',
        address: 'Avenue de la République, Kaloum',
        city: 'Kaloum',
        phone: '+224 62 123 45 67',
        email: 'kaloum@kfm-delice.com',
        managerName: 'Amadou Touré',
        managerPhone: '+224 66 111 22 33',
        status: 'active',
        openDate: '2023-01-15T00:00:00.000Z',
        operatingHours: { open: '08:00', close: '22:00' },
        stats: { staffCount: 8, dailyRevenue: 2850000, activeOrders: 12, rating: 4.8 },
        isMain: true,
        isOpen: true,
        isBusy: false,
      },
      {
        id: 'branch-002',
        name: 'KFM DELICE - Dixinn',
        code: 'DIX-001',
        address: 'Quartier Dixinn, Route de l\'Aéroport',
        city: 'Dixinn',
        phone: '+224 62 234 56 78',
        email: 'dixinn@kfm-delice.com',
        managerName: 'Fatou Diallo',
        managerPhone: '+224 66 222 33 44',
        status: 'active',
        openDate: '2023-06-01T00:00:00.000Z',
        operatingHours: { open: '09:00', close: '23:00' },
        stats: { staffCount: 12, dailyRevenue: 4150000, activeOrders: 18, rating: 4.6 },
        isMain: false,
        isOpen: true,
        isBusy: true,
      },
      {
        id: 'branch-003',
        name: 'KFM DELICE - Matam',
        code: 'MAT-001',
        address: 'Marché de Matam, Rue Principale',
        city: 'Matam',
        phone: '+224 62 345 67 89',
        email: 'matam@kfm-delice.com',
        managerName: 'Ibrahim Koné',
        managerPhone: '+224 66 333 44 55',
        status: 'active',
        openDate: '2023-09-15T00:00:00.000Z',
        operatingHours: { open: '07:00', close: '21:00' },
        stats: { staffCount: 6, dailyRevenue: 1850000, activeOrders: 8, rating: 4.7 },
        isMain: false,
        isOpen: true,
        isBusy: false,
      },
      {
        id: 'branch-004',
        name: 'KFM DELICE - Ratoma',
        code: 'RAT-001',
        address: 'Quartier Ratoma, Centre Commercial',
        city: 'Ratoma',
        phone: '+224 62 456 78 90',
        email: 'ratoma@kfm-delice.com',
        managerName: 'Mariama Sylla',
        managerPhone: '+224 66 444 55 66',
        status: 'construction',
        openDate: '2025-03-01T00:00:00.000Z',
        operatingHours: { open: '08:00', close: '22:00' },
        stats: { staffCount: 0, dailyRevenue: 0, activeOrders: 0, rating: 0 },
        isMain: false,
        isOpen: false,
        isBusy: false,
      },
    ]);
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const activeBranches = branches.filter(b => b.status === 'active');
  const totalStaff = branches.reduce((sum, b) => sum + b.stats.staffCount, 0);
  const totalRevenue = branches.reduce((sum, b) => sum + b.stats.dailyRevenue, 0);
  const avgRating = activeBranches.length > 0 
    ? (activeBranches.reduce((sum, b) => sum + b.stats.rating, 0) / activeBranches.length).toFixed(1)
    : '0.0';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'construction':
        return <Badge className="bg-yellow-100 text-yellow-700">En construction</Badge>;
      case 'closed':
        return <Badge className="bg-red-100 text-red-700">Fermée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Succursales</h1>
          <p className="text-gray-500">Gérer les points de vente</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchBranches} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Actualiser
          </Button>
          <Dialog open={isNewBranchOpen} onOpenChange={setIsNewBranchOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle succursale
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Nouvelle succursale</DialogTitle>
                <DialogDescription>
                  Créez un nouveau point de vente
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch-name">Nom</Label>
                    <Input
                      id="branch-name"
                      value={newBranch.name}
                      onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                      placeholder="KFM DELICE - Quartier"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch-code">Code</Label>
                    <Input
                      id="branch-code"
                      value={newBranch.code}
                      onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                      placeholder="KAL-001"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-address">Adresse</Label>
                  <Input
                    id="branch-address"
                    value={newBranch.address}
                    onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                    placeholder="Quartier, Rue, Numéro"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch-city">Ville</Label>
                    <Input
                      id="branch-city"
                      value={newBranch.city}
                      onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
                      placeholder="Conakry"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch-phone">Téléphone</Label>
                    <Input
                      id="branch-phone"
                      value={newBranch.phone}
                      onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                      placeholder="+224 ..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-email">Email</Label>
                  <Input
                    id="branch-email"
                    type="email"
                    value={newBranch.email}
                    onChange={(e) => setNewBranch({ ...newBranch, email: e.target.value })}
                    placeholder="succursale@kfm-delice.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch-manager">Nom du gérant</Label>
                    <Input
                      id="branch-manager"
                      value={newBranch.managerName}
                      onChange={(e) => setNewBranch({ ...newBranch, managerName: e.target.value })}
                      placeholder="Nom du gérant"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch-manager-phone">Tél. gérant</Label>
                    <Input
                      id="branch-manager-phone"
                      value={newBranch.managerPhone}
                      onChange={(e) => setNewBranch({ ...newBranch, managerPhone: e.target.value })}
                      placeholder="+224 ..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch-open">Heure d'ouverture</Label>
                    <Input
                      id="branch-open"
                      type="time"
                      value={newBranch.openTime}
                      onChange={(e) => setNewBranch({ ...newBranch, openTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch-close">Heure de fermeture</Label>
                    <Input
                      id="branch-close"
                      type="time"
                      value={newBranch.closeTime}
                      onChange={(e) => setNewBranch({ ...newBranch, closeTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewBranchOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={() => {
                  if (!newBranch.name || !newBranch.code || !newBranch.address) {
                    toast({ title: 'Erreur', description: 'Veuillez remplir les champs obligatoires.', variant: 'destructive' });
                    return;
                  }
                  // Create new branch
                  const newBranchEntry: Branch = {
                    id: `branch-${Date.now()}`,
                    name: newBranch.name,
                    code: newBranch.code,
                    address: newBranch.address,
                    city: newBranch.city || '',
                    phone: newBranch.phone || '',
                    email: newBranch.email || '',
                    managerName: newBranch.managerName || '',
                    managerPhone: newBranch.managerPhone || '',
                    status: 'active',
                    openDate: new Date().toISOString(),
                    operatingHours: { open: newBranch.openTime, close: newBranch.closeTime },
                    stats: { staffCount: 0, dailyRevenue: 0, activeOrders: 0, rating: 0 },
                    isMain: false,
                    isOpen: true,
                    isBusy: false,
                  };
                  setBranches(prev => [newBranchEntry, ...prev]);
                  toast({ title: 'Succursale créée', description: `La succursale "${newBranch.name}" a été créée avec succès.` });
                  setIsNewBranchOpen(false);
                  setNewBranch({ name: '', code: '', address: '', city: '', phone: '', email: '', managerName: '', managerPhone: '', openTime: '08:00', closeTime: '22:00' });
                }}>
                  Créer la succursale
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{branches.length}</p>
                <p className="text-xs text-gray-500">Succursales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeBranches.length}</p>
                <p className="text-xs text-gray-500">Actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStaff}</p>
                <p className="text-xs text-gray-500">Employés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-gray-500">Revenu journalier</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error message */}
      {error && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-yellow-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Branches List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto" />
            <p className="mt-2 text-gray-500">Chargement...</p>
          </CardContent>
        </Card>
      ) : branches.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Liste des Succursales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune succursale</h3>
              <p className="text-gray-500 mb-6">
                Ajoutez des points de vente pour gérer vos restaurants
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une succursale
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {branches.map((branch) => (
            <Card key={branch.id} className={branch.isMain ? 'border-orange-200' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      branch.status === 'active' ? 'bg-green-100' : 
                      branch.status === 'construction' ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <Building2 className={`h-6 w-6 ${
                        branch.status === 'active' ? 'text-green-600' : 
                        branch.status === 'construction' ? 'text-yellow-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{branch.name}</h3>
                        {branch.isMain && (
                          <Badge className="bg-orange-100 text-orange-700">Principal</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{branch.code}</p>
                    </div>
                  </div>
                  {getStatusBadge(branch.status)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{branch.email}</span>
                  </div>
                </div>

                {branch.status === 'active' && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-lg font-semibold">{branch.stats.staffCount}</p>
                      <p className="text-xs text-gray-500">Employés</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{branch.stats.activeOrders}</p>
                      <p className="text-xs text-gray-500">Commandes</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{formatCurrency(branch.stats.dailyRevenue)}</p>
                      <p className="text-xs text-gray-500">Revenu/jour</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-lg font-semibold">{branch.stats.rating}</span>
                      </div>
                      <p className="text-xs text-gray-500">Note</p>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Gérant:</span> {branch.managerName}
                  </div>
                  <Button variant="outline" size="sm">
                    Détails
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
