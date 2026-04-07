'use client';

import { useState, useEffect } from 'react';
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
  Search,
  Plus,
  MoreHorizontal,
  Bike,
  Phone,
  CheckCircle,
  XCircle,
  Truck,
  DollarSign,
} from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { apiGet } from '@/lib/api-client';
import { useCurrency } from '@/lib/currency-context';

interface Driver {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
}

export default function DriversPage() {
  const { formatCurrency } = useCurrency();
  const [search, setSearch] = useState('');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      const response = await apiGet<{ users: Driver[] }>('/users?role=DRIVER');
      setDrivers(response?.users || []);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
      // Use demo data if API fails
      setDrivers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.email?.toLowerCase().includes(search.toLowerCase()) ||
      driver.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      driver.lastName?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Livreurs</h1>
          <p className="text-gray-500">Gérer les comptes livreurs (drivers)</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau livreur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Nouveau livreur</DialogTitle>
              <DialogDescription>
                Créez un nouveau compte livreur
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driver-firstName">Prénom</Label>
                  <Input
                    id="driver-firstName"
                    value={newDriver.firstName}
                    onChange={(e) => setNewDriver({ ...newDriver, firstName: e.target.value })}
                    placeholder="Prénom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driver-lastName">Nom</Label>
                  <Input
                    id="driver-lastName"
                    value={newDriver.lastName}
                    onChange={(e) => setNewDriver({ ...newDriver, lastName: e.target.value })}
                    placeholder="Nom"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver-email">Email</Label>
                <Input
                  id="driver-email"
                  type="email"
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                  placeholder="email@exemple.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver-phone">Téléphone</Label>
                <Input
                  id="driver-phone"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                  placeholder="+224 ..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => {
                if (!newDriver.email || !newDriver.phone) {
                  toast({
                    title: 'Erreur',
                    description: 'L\'email et le téléphone sont obligatoires.',
                    variant: 'destructive',
                  });
                  return;
                }
                // Create new driver
                const newDriverEntry: Driver = {
                  id: `driver-${Date.now()}`,
                  email: newDriver.email,
                  firstName: newDriver.firstName || undefined,
                  lastName: newDriver.lastName || undefined,
                  phone: newDriver.phone || undefined,
                  role: 'DRIVER',
                  createdAt: new Date().toISOString(),
                  lastLogin: undefined,
                };
                setDrivers(prev => [newDriverEntry, ...prev]);
                toast({
                  title: 'Livreur créé',
                  description: `Le livreur "${newDriver.firstName} ${newDriver.lastName}" a été créé avec succès.`,
                });
                setIsAddDialogOpen(false);
                setNewDriver({ firstName: '', lastName: '', email: '', phone: '' });
              }}>
                Créer le livreur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bike className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{drivers.length}</p>
                <p className="text-xs text-gray-500">Total livreurs</p>
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
                  {drivers.filter((d) => d.lastLogin).length}
                </p>
                <p className="text-xs text-gray-500">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-gray-500">Livraisons aujourd'hui</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(0)}</p>
                <p className="text-xs text-gray-500">Gains du jour</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher un livreur..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Drivers table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              Chargement...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Livreur</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Aucun livreur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <Bike className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {driver.firstName} {driver.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{driver.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {driver.phone || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700"
                        >
                          Disponible
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {formatDate(driver.createdAt)}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {driver.lastLogin ? formatDate(driver.lastLogin) : 'Jamais'}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
