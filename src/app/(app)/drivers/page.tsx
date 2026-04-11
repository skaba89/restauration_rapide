'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Bike,
  Search,
  Star,
  Phone,
  Navigation,
  DollarSign,
  Package,
  CheckCircle,
  Clock,
  TrendingUp,
  User,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Plus,
  MapPin,
  Car,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Demo drivers
const DEMO_DRIVERS = [
  {
    id: '1',
    name: 'Kouassi Emmanuel',
    phone: '07 11 12 13 14',
    email: 'emmanuel.kouassi@email.com',
    vehicleType: 'motorcycle',
    vehiclePlate: 'AB-1234-CD',
    status: 'online',
    isAvailable: true,
    rating: 4.8,
    totalDeliveries: 247,
    todayDeliveries: 12,
    todayEarnings: 18500,
    currentLocation: 'Cocody',
    joinDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    notes: '',
  },
  {
    id: '2',
    name: 'Yao Koffi',
    phone: '05 33 34 35 36',
    email: 'koffi.yao@email.com',
    vehicleType: 'motorcycle',
    vehiclePlate: 'CD-5678-EF',
    status: 'busy',
    isAvailable: false,
    rating: 4.6,
    totalDeliveries: 189,
    todayDeliveries: 8,
    todayEarnings: 12400,
    currentLocation: 'Plateau',
    joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    notes: 'Driver expérimenté',
  },
  {
    id: '3',
    name: 'Bamba Seydou',
    phone: '01 44 45 46 47',
    email: 'seydou.bamba@email.com',
    vehicleType: 'bicycle',
    vehiclePlate: null,
    status: 'offline',
    isAvailable: false,
    rating: 4.9,
    totalDeliveries: 312,
    todayDeliveries: 0,
    todayEarnings: 0,
    currentLocation: null,
    joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    notes: 'Meilleur driver du mois de janvier',
  },
  {
    id: '4',
    name: 'Traoré Aïssata',
    phone: '07 55 56 57 58',
    email: 'aissata.traore@email.com',
    vehicleType: 'motorcycle',
    vehiclePlate: 'GH-9012-IJ',
    status: 'online',
    isAvailable: true,
    rating: 4.7,
    totalDeliveries: 156,
    todayDeliveries: 6,
    todayEarnings: 9200,
    currentLocation: 'Yopougon',
    joinDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    notes: '',
  },
];

const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} FCFA`;
const formatDate = (date: Date) => new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    online: 'bg-green-100 text-green-700',
    busy: 'bg-orange-100 text-orange-700',
    offline: 'bg-gray-100 text-gray-700',
    suspended: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export default function DriversPage() {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState(DEMO_DRIVERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<typeof DEMO_DRIVERS[0] | null>(null);
  
  // New driver form state
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleType: 'motorcycle',
    vehiclePlate: '',
    notes: '',
  });

  // Edit driver form state
  const [editDriver, setEditDriver] = useState<typeof DEMO_DRIVERS[0] | null>(null);

  const filteredDrivers = drivers.filter((d) => {
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    if (searchQuery && !d.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !d.phone.includes(searchQuery)) return false;
    return true;
  });

  const stats = {
    total: drivers.length,
    online: drivers.filter(d => d.status === 'online').length,
    busy: drivers.filter(d => d.status === 'busy').length,
    offline: drivers.filter(d => d.status === 'offline').length,
  };

  const toggleDriverAvailability = (driverId: string) => {
    setDrivers(prev => prev.map(d => 
      d.id === driverId 
        ? { ...d, status: d.status === 'offline' ? 'online' : 'offline', isAvailable: d.status === 'offline' }
        : d
    ));
    toast({
      title: 'Statut mis à jour',
      description: 'Le statut du driver a été modifié',
    });
  };

  // Add new driver
  const addDriver = () => {
    if (!newDriver.name || !newDriver.phone) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir le nom et le téléphone',
        variant: 'destructive',
      });
      return;
    }

    const driver = {
      id: String(drivers.length + 1),
      name: newDriver.name,
      phone: newDriver.phone,
      email: newDriver.email,
      vehicleType: newDriver.vehicleType,
      vehiclePlate: newDriver.vehiclePlate || null,
      notes: newDriver.notes,
      status: 'offline',
      isAvailable: false,
      rating: 0,
      totalDeliveries: 0,
      todayDeliveries: 0,
      todayEarnings: 0,
      currentLocation: null,
      joinDate: new Date(),
    };

    setDrivers([driver, ...drivers]);
    
    // Reset form
    setNewDriver({
      name: '',
      phone: '',
      email: '',
      vehicleType: 'motorcycle',
      vehiclePlate: '',
      notes: '',
    });
    setIsAddDialogOpen(false);

    toast({
      title: 'Driver ajouté',
      description: `${driver.name} a été ajouté à l'équipe`,
    });
  };

  // Update driver
  const updateDriver = () => {
    if (!editDriver) return;

    setDrivers(prev => prev.map(d => 
      d.id === editDriver.id ? editDriver : d
    ));

    setIsEditDialogOpen(false);
    setEditDriver(null);

    toast({
      title: 'Driver mis à jour',
      description: 'Les informations du driver ont été modifiées',
    });
  };

  // Delete driver
  const deleteDriver = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    setDrivers(prev => prev.filter(d => d.id !== driverId));

    toast({
      title: 'Driver supprimé',
      description: `${driver.name} a été retiré de l'équipe`,
    });
  };

  const openEditDialog = (driver: typeof DEMO_DRIVERS[0]) => {
    setEditDriver({ ...driver });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (driver: typeof DEMO_DRIVERS[0]) => {
    setSelectedDriver(driver);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Drivers</h1>
          <p className="text-muted-foreground">Gérez vos livreurs</p>
        </div>
        <Button className="bg-gradient-to-r from-orange-500 to-red-600" onClick={() => setIsAddDialogOpen(true)}>
          <User className="h-4 w-4 mr-2" />
          Ajouter un driver
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Bike className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total drivers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.online}</p>
                <p className="text-xs text-muted-foreground">En ligne</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.busy}</p>
                <p className="text-xs text-muted-foreground">En livraison</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.offline}</p>
                <p className="text-xs text-muted-foreground">Hors ligne</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un driver..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="online">En ligne</SelectItem>
            <SelectItem value="busy">En livraison</SelectItem>
            <SelectItem value="offline">Hors ligne</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Drivers List */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="divide-y">
              {filteredDrivers.map((driver) => (
                <div key={driver.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                        {driver.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{driver.name}</p>
                        <Badge className={getStatusColor(driver.status)}>
                          {driver.status === 'online' ? 'En ligne' : driver.status === 'busy' ? 'En livraison' : 'Hors ligne'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {driver.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          {driver.vehicleType === 'motorcycle' ? <Bike className="h-3 w-3" /> : <Car className="h-3 w-3" />} 
                          {driver.vehicleType === 'motorcycle' ? 'Moto' : driver.vehicleType === 'car' ? 'Voiture' : 'Vélo'}
                          {driver.vehiclePlate && ` - ${driver.vehiclePlate}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-6 text-center">
                    <div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{driver.rating > 0 ? driver.rating : '-'}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Note</p>
                    </div>
                    <div>
                      <p className="font-semibold">{driver.totalDeliveries}</p>
                      <p className="text-xs text-muted-foreground">Total livraisons</p>
                    </div>
                    <div>
                      <p className="font-semibold">{driver.todayDeliveries}</p>
                      <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                    </div>
                    <div>
                      <p className="font-semibold text-green-600">{formatCurrency(driver.todayEarnings)}</p>
                      <p className="text-xs text-muted-foreground">Gains</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={driver.status !== 'offline'}
                      onCheckedChange={() => toggleDriverAvailability(driver.id)}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openViewDialog(driver)}>
                          <Eye className="h-4 w-4 mr-2" /> Voir profil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(driver)}>
                          <Edit className="h-4 w-4 mr-2" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => deleteDriver(driver.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Driver Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un driver</DialogTitle>
            <DialogDescription>Enregistrez un nouveau livreur dans votre équipe</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                placeholder="Kouassi Emmanuel"
                value={newDriver.name}
                onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  placeholder="07 11 12 13 14"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="emmanuel@email.com"
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Type de véhicule</Label>
                <Select 
                  value={newDriver.vehicleType} 
                  onValueChange={(v) => setNewDriver({ ...newDriver, vehicleType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motorcycle">Moto</SelectItem>
                    <SelectItem value="bicycle">Vélo</SelectItem>
                    <SelectItem value="car">Voiture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehiclePlate">Plaque d'immatriculation</Label>
                <Input
                  id="vehiclePlate"
                  placeholder="AB-1234-CD"
                  value={newDriver.vehiclePlate}
                  onChange={(e) => setNewDriver({ ...newDriver, vehiclePlate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Informations supplémentaires..."
                value={newDriver.notes}
                onChange={(e) => setNewDriver({ ...newDriver, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600" onClick={addDriver}>
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Driver Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le driver</DialogTitle>
            <DialogDescription>Modifiez les informations du driver</DialogDescription>
          </DialogHeader>
          {editDriver && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom complet *</Label>
                <Input
                  id="edit-name"
                  value={editDriver.name}
                  onChange={(e) => setEditDriver({ ...editDriver, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Téléphone *</Label>
                  <Input
                    id="edit-phone"
                    value={editDriver.phone}
                    onChange={(e) => setEditDriver({ ...editDriver, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editDriver.email}
                    onChange={(e) => setEditDriver({ ...editDriver, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-vehicleType">Type de véhicule</Label>
                  <Select 
                    value={editDriver.vehicleType} 
                    onValueChange={(v) => setEditDriver({ ...editDriver, vehicleType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="motorcycle">Moto</SelectItem>
                      <SelectItem value="bicycle">Vélo</SelectItem>
                      <SelectItem value="car">Voiture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-vehiclePlate">Plaque d'immatriculation</Label>
                  <Input
                    id="edit-vehiclePlate"
                    placeholder="AB-1234-CD"
                    value={editDriver.vehiclePlate || ''}
                    onChange={(e) => setEditDriver({ ...editDriver, vehiclePlate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  placeholder="Informations supplémentaires..."
                  value={editDriver.notes || ''}
                  onChange={(e) => setEditDriver({ ...editDriver, notes: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600" onClick={updateDriver}>
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Driver Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profil du driver</DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-xl">
                    {selectedDriver.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{selectedDriver.name}</h3>
                    <Badge className={getStatusColor(selectedDriver.status)}>
                      {selectedDriver.status === 'online' ? 'En ligne' : selectedDriver.status === 'busy' ? 'En livraison' : 'Hors ligne'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Membre depuis {formatDate(selectedDriver.joinDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <p className="text-2xl font-bold">{selectedDriver.rating > 0 ? selectedDriver.rating : '-'}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Note moyenne</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{selectedDriver.totalDeliveries}</p>
                    <p className="text-xs text-muted-foreground">Livraisons totales</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{selectedDriver.todayDeliveries}</p>
                    <p className="text-xs text-muted-foreground">Livraisons aujourd'hui</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedDriver.todayEarnings)}</p>
                    <p className="text-xs text-muted-foreground">Gains aujourd'hui</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <p className="text-sm"><strong>Email:</strong> {selectedDriver.email}</p>
                <p className="text-sm"><strong>Téléphone:</strong> {selectedDriver.phone}</p>
                <p className="text-sm">
                  <strong>Véhicule:</strong> {selectedDriver.vehicleType === 'motorcycle' ? 'Moto' : selectedDriver.vehicleType === 'car' ? 'Voiture' : 'Vélo'}
                  {selectedDriver.vehiclePlate && ` (${selectedDriver.vehiclePlate})`}
                </p>
                {selectedDriver.currentLocation && (
                  <p className="text-sm flex items-center gap-1">
                    <strong>Position:</strong> <MapPin className="h-3 w-3 text-orange-600" /> {selectedDriver.currentLocation}
                  </p>
                )}
                {selectedDriver.notes && (
                  <p className="text-sm"><strong>Notes:</strong> {selectedDriver.notes}</p>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
            <Button 
              className="bg-gradient-to-r from-orange-500 to-red-600"
              onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedDriver) openEditDialog(selectedDriver);
              }}
            >
              Modifier
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
