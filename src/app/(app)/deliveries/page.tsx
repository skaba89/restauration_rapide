'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import {
  Truck,
  Search,
  MapPin,
  Clock,
  Phone,
  Navigation,
  CheckCircle,
  AlertCircle,
  Package,
  User,
  Bike,
  Star,
  X,
} from 'lucide-react';

// Demo deliveries
const DEMO_DELIVERIES = [
  {
    id: '1',
    orderNumber: 'ORD-2024-0145',
    customerName: 'Kouamé Jean',
    customerPhone: '07 08 09 10 11',
    status: 'PENDING',
    pickupAddress: 'Restaurant Le Savana, Cocody',
    dropoffAddress: 'Cocody, Riviera 3, Avenue 25',
    distance: '3.2 km',
    fee: 1500,
    driver: null,
    createdAt: new Date(),
    estimatedTime: 25,
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-0144',
    customerName: 'Diallo Fatou',
    customerPhone: '07 12 13 14 15',
    status: 'DRIVER_ASSIGNED',
    pickupAddress: 'Restaurant Le Savana, Cocody',
    dropoffAddress: 'Treichville, Rue 12',
    distance: '4.5 km',
    fee: 1800,
    driver: { id: '1', name: 'Kouassi Emmanuel', phone: '07 11 12 13 14', rating: 4.8 },
    createdAt: new Date(Date.now() - 1200000),
    estimatedTime: 30,
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-0143',
    customerName: 'Koné Ibrahim',
    customerPhone: '01 02 03 04 05',
    status: 'IN_TRANSIT',
    pickupAddress: 'Restaurant Le Savana, Cocody',
    dropoffAddress: 'Plateau, Avenue 12',
    distance: '2.8 km',
    fee: 1200,
    driver: { id: '2', name: 'Yao Koffi', phone: '05 33 34 35 36', rating: 4.6 },
    createdAt: new Date(Date.now() - 1800000),
    estimatedTime: 15,
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-0142',
    customerName: 'Touré Amadou',
    customerPhone: '05 22 23 24 25',
    status: 'DELIVERED',
    pickupAddress: 'Restaurant Le Savana, Cocody',
    dropoffAddress: 'Yopougon, Sicogi',
    distance: '5.1 km',
    fee: 2000,
    driver: { id: '1', name: 'Kouassi Emmanuel', phone: '07 11 12 13 14', rating: 4.8 },
    createdAt: new Date(Date.now() - 3600000),
    estimatedTime: 0,
  },
];

// Demo available drivers
const AVAILABLE_DRIVERS = [
  { id: '1', name: 'Kouassi Emmanuel', phone: '07 11 12 13 14', rating: 4.8, status: 'online', currentLocation: 'Cocody', vehicleType: 'motorcycle' },
  { id: '2', name: 'Yao Koffi', phone: '05 33 34 35 36', rating: 4.6, status: 'online', currentLocation: 'Plateau', vehicleType: 'motorcycle' },
  { id: '3', name: 'Bamba Seydou', phone: '01 44 45 46 47', rating: 4.9, status: 'online', currentLocation: 'Treichville', vehicleType: 'bicycle' },
  { id: '4', name: 'Traoré Aïssata', phone: '07 55 56 57 58', rating: 4.7, status: 'online', currentLocation: 'Yopougon', vehicleType: 'motorcycle' },
];

const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} FCFA`;

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    SEARCHING_DRIVER: 'bg-orange-100 text-orange-700',
    DRIVER_ASSIGNED: 'bg-blue-100 text-blue-700',
    PICKED_UP: 'bg-cyan-100 text-cyan-700',
    IN_TRANSIT: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    SEARCHING_DRIVER: 'Recherche driver',
    DRIVER_ASSIGNED: 'Driver assigné',
    PICKED_UP: 'Récupérée',
    IN_TRANSIT: 'En livraison',
    DELIVERED: 'Livrée',
    FAILED: 'Échec',
  };
  return labels[status] || status;
};

export default function DeliveriesPage() {
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState(DEMO_DELIVERIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<typeof DEMO_DELIVERIES[0] | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');

  const filteredDeliveries = deliveries.filter((d) => {
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    if (searchQuery && !d.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !d.customerName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    pending: deliveries.filter(d => d.status === 'PENDING').length,
    inProgress: deliveries.filter(d => ['DRIVER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status)).length,
    completed: deliveries.filter(d => d.status === 'DELIVERED').length,
  };

  // Open driver assignment dialog
  const openAssignDialog = (delivery: typeof DEMO_DELIVERIES[0]) => {
    setSelectedDelivery(delivery);
    setSelectedDriverId('');
    setIsAssignDialogOpen(true);
  };

  // Assign driver to delivery
  const assignDriver = () => {
    if (!selectedDelivery || !selectedDriverId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un driver',
        variant: 'destructive',
      });
      return;
    }

    const driver = AVAILABLE_DRIVERS.find(d => d.id === selectedDriverId);
    if (!driver) return;

    setDeliveries(prev => prev.map(d => 
      d.id === selectedDelivery.id 
        ? { 
            ...d, 
            status: 'DRIVER_ASSIGNED', 
            driver: { id: driver.id, name: driver.name, phone: driver.phone, rating: driver.rating }
          } 
        : d
    ));

    setIsAssignDialogOpen(false);
    setSelectedDelivery(null);
    setSelectedDriverId('');

    toast({
      title: 'Driver assigné',
      description: `${driver.name} a été assigné à la livraison ${selectedDelivery.orderNumber}`,
    });
  };

  // Update delivery status
  const updateDeliveryStatus = (deliveryId: string, newStatus: string) => {
    setDeliveries(prev => prev.map(d => 
      d.id === deliveryId ? { ...d, status: newStatus } : d
    ));

    const delivery = deliveries.find(d => d.id === deliveryId);
    toast({
      title: 'Statut mis à jour',
      description: `La livraison a été marquée comme "${getStatusLabel(newStatus)}"`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Livraisons</h1>
          <p className="text-muted-foreground">Gérez les livraisons en temps réel</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">En cours</p>
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
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Terminées</p>
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
            placeholder="Rechercher par numéro ou client..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="DRIVER_ASSIGNED">Driver assigné</SelectItem>
            <SelectItem value="IN_TRANSIT">En livraison</SelectItem>
            <SelectItem value="DELIVERED">Livrée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deliveries List */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="divide-y">
              {filteredDeliveries.map((delivery) => (
                <div key={delivery.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{delivery.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">{delivery.customerName}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(delivery.status)}>
                      {getStatusLabel(delivery.status)}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    {/* Pickup */}
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <MapPin className="h-4 w-4 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">RETRAIT</p>
                        <p className="text-sm">{delivery.pickupAddress}</p>
                      </div>
                    </div>
                    {/* Dropoff */}
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">LIVRAISON</p>
                        <p className="text-sm">{delivery.dropoffAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Navigation className="h-3 w-3" /> {delivery.distance}
                      </span>
                      <span className="font-semibold text-green-600">{formatCurrency(delivery.fee)}</span>
                      {delivery.estimatedTime > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> ~{delivery.estimatedTime} min
                        </span>
                      )}
                    </div>
                    
                    {delivery.driver ? (
                      <div className="flex items-center gap-3">
                        {delivery.status === 'DRIVER_ASSIGNED' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateDeliveryStatus(delivery.id, 'IN_TRANSIT')}
                          >
                            <Truck className="h-4 w-4 mr-1" /> En transit
                          </Button>
                        )}
                        {delivery.status === 'IN_TRANSIT' && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateDeliveryStatus(delivery.id, 'DELIVERED')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Livrée
                          </Button>
                        )}
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                            {delivery.driver.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{delivery.driver.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> {delivery.driver.rating}
                            </span>
                            <span>{delivery.driver.phone}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-orange-500 to-red-600"
                        onClick={() => openAssignDialog(delivery)}
                      >
                        <Bike className="h-4 w-4 mr-1" /> Assigner driver
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Driver Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assigner un driver</DialogTitle>
            <DialogDescription>
              Sélectionnez un driver disponible pour la livraison {selectedDelivery?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedDelivery && (
              <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span>{selectedDelivery.dropoffAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="h-4 w-4 text-orange-600" />
                  <span>{selectedDelivery.distance}</span>
                  <span>•</span>
                  <span className="font-semibold">{formatCurrency(selectedDelivery.fee)}</span>
                </div>
              </div>
            )}

            <Label className="text-sm font-medium mb-2 block">Drivers disponibles</Label>
            <RadioGroup value={selectedDriverId} onValueChange={setSelectedDriverId}>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {AVAILABLE_DRIVERS.map((driver) => (
                  <label
                    key={driver.id}
                    htmlFor={`driver-${driver.id}`}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedDriverId === driver.id 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <RadioGroupItem value={driver.id} id={`driver-${driver.id}`} />
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                        {driver.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{driver.name}</p>
                        <span className={`w-2 h-2 rounded-full ${driver.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> {driver.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {driver.currentLocation}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bike className="h-3 w-3" /> {driver.vehicleType === 'motorcycle' ? 'Moto' : 'Vélo'}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              className="bg-gradient-to-r from-orange-500 to-red-600"
              onClick={assignDriver}
              disabled={!selectedDriverId}
            >
              Assigner le driver
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
