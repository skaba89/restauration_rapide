'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Bike,
  Plus,
  Search,
  Phone,
  Mail,
  Star,
  CheckCircle,
  XCircle,
  Truck,
  DollarSign,
} from 'lucide-react';
import { apiGet } from '@/lib/api-client';

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  rating: number;
  totalDeliveries: number;
  todayDeliveries: number;
  todayEarnings: number;
  vehicleType: string;
}

export default function RestaurantDriversPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrivers();
  }, [restaurantId]);

  const loadDrivers = async () => {
    try {
      const data = await apiGet<any>(`/drivers?restaurantId=${restaurantId}`);
      if (data?.drivers?.length > 0) {
        setDrivers(data.drivers);
      }
    } catch (error) {
      console.error('Failed to load drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = drivers.filter(d =>
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const available = drivers.filter(d => d.status === 'AVAILABLE').length;
  const busy = drivers.filter(d => d.status === 'BUSY').length;
  const offline = drivers.filter(d => d.status === 'OFFLINE').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Disponible</Badge>;
      case 'BUSY':
        return <Badge className="bg-yellow-100 text-yellow-700"><Truck className="h-3 w-3 mr-1" />En livraison</Badge>;
      case 'OFFLINE':
        return <Badge className="bg-gray-100 text-gray-700"><XCircle className="h-3 w-3 mr-1" />Hors ligne</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bike className="h-6 w-6 text-orange-500" />
            Drivers
          </h1>
          <p className="text-muted-foreground">
            Gérez vos livreurs
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau driver
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{available}</p>
                <p className="text-sm text-muted-foreground">Disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Truck className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{busy}</p>
                <p className="text-sm text-muted-foreground">En livraison</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <XCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{offline}</p>
                <p className="text-sm text-muted-foreground">Hors ligne</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bike className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{drivers.length}</p>
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
              <CardTitle>Liste des drivers</CardTitle>
              <CardDescription>Gérez votre équipe de livreurs</CardDescription>
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
            {filteredDrivers.map((driver) => (
              <div key={driver.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                    <span className="font-bold text-orange-600">
                      {driver.firstName[0]}{driver.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{driver.firstName} {driver.lastName}</h4>
                      {getStatusBadge(driver.status)}
                    </div>
                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {driver.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {driver.email}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        {driver.rating}
                      </span>
                      <span className="text-muted-foreground">{driver.totalDeliveries} livraisons</span>
                      <span className="text-muted-foreground">{driver.vehicleType}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600">{driver.todayDeliveries}</p>
                  <p className="text-sm text-muted-foreground">livraisons aujourd'hui</p>
                  <p className="text-sm font-medium mt-1">{driver.todayEarnings.toLocaleString()} FCFA</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-1" />
                    Appeler
                  </Button>
                  <Button variant="outline" size="sm">Voir</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}