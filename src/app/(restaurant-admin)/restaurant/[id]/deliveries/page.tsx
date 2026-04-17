'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Truck,
  Plus,
  Search,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Navigation,
  MessageCircle,
} from 'lucide-react';
import { apiGet } from '@/lib/api-client';

interface Delivery {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  driverName?: string;
  driverPhone?: string;
  estimatedTime?: string;
  createdAt: string;
  total: number;
}

export default function RestaurantDeliveriesPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveries();
  }, [restaurantId]);

  const loadDeliveries = async () => {
    try {
      const data = await apiGet<any>(`/deliveries?restaurantId=${restaurantId}`);
      if (data?.deliveries?.length > 0) {
        setDeliveries(data.deliveries);
      }
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = deliveries.filter(d =>
    d.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pending = deliveries.filter(d => d.status === 'PENDING').length;
  const inTransit = deliveries.filter(d => d.status === 'IN_TRANSIT').length;
  const delivered = deliveries.filter(d => d.status === 'DELIVERED').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
      case 'ASSIGNED':
        return <Badge className="bg-blue-100 text-blue-700"><CheckCircle className="h-3 w-3 mr-1" />Assignée</Badge>;
      case 'IN_TRANSIT':
        return <Badge className="bg-purple-100 text-purple-700"><Navigation className="h-3 w-3 mr-1" />En cours</Badge>;
      case 'DELIVERED':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Livrée</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-700"><AlertCircle className="h-3 w-3 mr-1" />Annulée</Badge>;
      default:
        return null;
    }
  };

  const handleSendWhatsApp = (delivery: Delivery) => {
    const message = `Bonjour ${delivery.customerName}, votre commande ${delivery.orderNumber} est en cours de préparation. Vous serez livré bientôt!`;
    const url = `https://wa.me/${delivery.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="h-6 w-6 text-orange-500" />
            Livraisons
          </h1>
          <p className="text-muted-foreground">
            Gérez les livraisons de commandes
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle livraison
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pending}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Navigation className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inTransit}</p>
                <p className="text-sm text-muted-foreground">En cours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{delivered}</p>
                <p className="text-sm text-muted-foreground">Livrées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{deliveries.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Livraisons actives</CardTitle>
              <CardDescription>Suivez vos livraisons en temps réel</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDeliveries.map((delivery) => (
              <div key={delivery.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
                    <Truck className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{delivery.orderNumber}</h4>
                      {getStatusBadge(delivery.status)}
                    </div>
                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{delivery.customerName}</span>
                      <span className="font-medium text-orange-600">{delivery.total.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {delivery.address}
                    </div>
                    {delivery.driverName && (
                      <div className="flex items-center gap-1 mt-1 text-sm">
                        <span className="text-muted-foreground">Livreur:</span>
                        <span className="font-medium">{delivery.driverName}</span>
                        {delivery.estimatedTime && (
                          <span className="text-purple-600 ml-2">~{delivery.estimatedTime}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-1" />
                    Appeler
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSendWhatsApp(delivery)}>
                    <MessageCircle className="h-4 w-4 mr-1 text-green-600" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" size="sm">
                    Détails
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}