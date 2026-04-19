'use client';

// ============================================
// Restaurant OS - Admin Deliveries Management
// Gestion des livraisons
// ============================================

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Truck,
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  User,
  Package,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface Delivery {
  id: string;
  order: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    restaurant: { name: string };
  };
  driver?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  status: string;
  pickupAddress: string;
  dropoffAddress: string;
  deliveryFee: number;
  distance?: number;
  estimatedTime?: number;
  createdAt: string;
  deliveredAt?: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  PICKED_UP: 'bg-purple-100 text-purple-700',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

const formatCurrency = (amount: number) => `${amount?.toLocaleString('fr-FR') || 0} FCFA`;
const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  useEffect(() => {
    async function fetchDeliveries() {
      try {
        const response = await fetchWithAuth('/api/admin/deliveries');
        if (response.ok) {
          const data = await response.json();
          setDeliveries(data.data || []);
        } else {
          throw new Error('API error');
        }
      } catch (error) {
        console.error('Error fetching deliveries:', error);
        // Demo data
        setDeliveries([
          {
            id: '1',
            order: {
              orderNumber: 'ORD-001',
              customerName: 'Amadou Diallo',
              customerPhone: '+224 622 00 00 01',
              restaurant: { name: 'KFM DELICE' },
            },
            driver: {
              firstName: 'Ibrahim',
              lastName: 'Touré',
              phone: '+224 622 00 00 10',
            },
            status: 'IN_TRANSIT',
            pickupAddress: 'Kaloum, Conakry',
            dropoffAddress: 'Dixinn, Conakry',
            deliveryFee: 5000,
            distance: 5.2,
            estimatedTime: 25,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            order: {
              orderNumber: 'ORD-002',
              customerName: 'Fatou Ndiaye',
              customerPhone: '+224 622 00 00 02',
              restaurant: { name: 'KFM DELICE' },
            },
            driver: {
              firstName: 'Mariama',
              lastName: 'Diallo',
              phone: '+224 622 00 00 11',
            },
            status: 'PICKED_UP',
            pickupAddress: 'Kaloum, Conakry',
            dropoffAddress: 'Matam, Conakry',
            deliveryFee: 3500,
            distance: 3.8,
            estimatedTime: 18,
            createdAt: new Date(Date.now() - 1800000).toISOString(),
          },
          {
            id: '3',
            order: {
              orderNumber: 'ORD-003',
              customerName: 'Kofi Mensah',
              customerPhone: '+224 622 00 00 03',
              restaurant: { name: 'KFM DELICE' },
            },
            status: 'PENDING',
            pickupAddress: 'Kaloum, Conakry',
            dropoffAddress: 'Ratoma, Conakry',
            deliveryFee: 6000,
            distance: 7.5,
            estimatedTime: 35,
            createdAt: new Date(Date.now() - 600000).toISOString(),
          },
          {
            id: '4',
            order: {
              orderNumber: 'ORD-004',
              customerName: 'Aisha Bamba',
              customerPhone: '+224 622 00 00 04',
              restaurant: { name: 'KFM DELICE' },
            },
            driver: {
              firstName: 'Ibrahim',
              lastName: 'Touré',
              phone: '+224 622 00 00 10',
            },
            status: 'DELIVERED',
            pickupAddress: 'Kaloum, Conakry',
            dropoffAddress: 'Matoto, Conakry',
            deliveryFee: 4500,
            distance: 4.2,
            estimatedTime: 20,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            deliveredAt: new Date(Date.now() - 1800000).toISOString(),
          },
          {
            id: '5',
            order: {
              orderNumber: 'ORD-005',
              customerName: 'Moussa Koné',
              customerPhone: '+224 622 00 00 05',
              restaurant: { name: 'KFM DELICE' },
            },
            driver: {
              firstName: 'Seydou',
              lastName: 'Bamba',
              phone: '+224 622 00 00 12',
            },
            status: 'FAILED',
            pickupAddress: 'Kaloum, Conakry',
            dropoffAddress: 'Coyah',
            deliveryFee: 8000,
            distance: 12,
            estimatedTime: 45,
            createdAt: new Date(Date.now() - 7200000).toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchDeliveries();
  }, []);

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = search === '' ||
      delivery.order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      delivery.order.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === 'PENDING').length,
    inProgress: deliveries.filter(d => ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status)).length,
    completed: deliveries.filter(d => d.status === 'DELIVERED').length,
    failed: deliveries.filter(d => d.status === 'FAILED').length,
    totalFees: deliveries.filter(d => d.status === 'DELIVERED').reduce((sum, d) => sum + d.deliveryFee, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Livraisons</h1>
          <p className="text-muted-foreground">Suivi en temps réel des livraisons</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
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
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Package className="h-4 w-4 text-indigo-600" />
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
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Livrées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{formatCurrency(stats.totalFees)}</p>
                <p className="text-xs text-muted-foreground">Frais</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par commande ou client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="ASSIGNED">Assignée</SelectItem>
                <SelectItem value="PICKED_UP">Récupérée</SelectItem>
                <SelectItem value="IN_TRANSIT">En transit</SelectItem>
                <SelectItem value="DELIVERED">Livrée</SelectItem>
                <SelectItem value="FAILED">Échouée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des livraisons ({filteredDeliveries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commande</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Livreur</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Frais</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">{delivery.order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{delivery.order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{delivery.order.customerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {delivery.driver ? (
                          <div>
                            <p className="font-medium">{delivery.driver.firstName} {delivery.driver.lastName}</p>
                            <p className="text-xs text-muted-foreground">{delivery.driver.phone}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Non assigné</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{delivery.dropoffAddress}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(delivery.deliveryFee)}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[delivery.status]}>
                          {delivery.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(delivery.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedDelivery(delivery)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Detail Dialog */}
      <Dialog open={!!selectedDelivery} onOpenChange={() => setSelectedDelivery(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Livraison - {selectedDelivery?.order.orderNumber}</DialogTitle>
            <DialogDescription>Détails de la livraison</DialogDescription>
          </DialogHeader>
          {selectedDelivery && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium">{selectedDelivery.order.customerName}</p>
                  <p className="text-sm">{selectedDelivery.order.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge className={statusColors[selectedDelivery.status]}>
                    {selectedDelivery.status}
                  </Badge>
                </div>
              </div>
              
              {selectedDelivery.driver && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Livreur</p>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <User className="h-4 w-4" />
                    <span>{selectedDelivery.driver.firstName} {selectedDelivery.driver.lastName}</span>
                    <Phone className="h-4 w-4 ml-auto" />
                    <span className="text-sm">{selectedDelivery.driver.phone}</span>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-1">Itinéraire</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Package className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{selectedDelivery.pickupAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span className="text-sm">{selectedDelivery.dropoffAddress}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="font-semibold">{selectedDelivery.distance || '-'} km</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Temps estimé</p>
                  <p className="font-semibold">{selectedDelivery.estimatedTime || '-'} min</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Frais</p>
                  <p className="font-semibold">{formatCurrency(selectedDelivery.deliveryFee)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
