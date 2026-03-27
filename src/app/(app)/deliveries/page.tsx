'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    driver: { name: 'Kouassi Emmanuel', phone: '07 11 12 13 14' },
    createdAt: new Date(Date.now() - 1200000),
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
    driver: { name: 'Yao Koffi', phone: '05 33 34 35 36' },
    createdAt: new Date(Date.now() - 1800000),
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
    driver: { name: 'Kouassi Emmanuel', phone: '07 11 12 13 14' },
    createdAt: new Date(Date.now() - 3600000),
  },
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredDeliveries = DEMO_DELIVERIES.filter((d) => {
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    if (searchQuery && !d.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !d.customerName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    pending: DEMO_DELIVERIES.filter(d => d.status === 'PENDING').length,
    inProgress: DEMO_DELIVERIES.filter(d => ['DRIVER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status)).length,
    completed: DEMO_DELIVERIES.filter(d => d.status === 'DELIVERED').length,
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
                    </div>
                    
                    {delivery.driver ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                            {delivery.driver.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{delivery.driver.name}</p>
                          <p className="text-xs text-muted-foreground">{delivery.driver.phone}</p>
                        </div>
                      </div>
                    ) : (
                      <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-600">
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
    </div>
  );
}
