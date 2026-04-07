'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Plus,
  Users,
  Clock,
  Phone,
  Mail,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { apiGet } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  date: string;
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  tableNumber?: string;
  notes?: string;
  createdAt: string;
}

const DEMO_RESERVATIONS: Reservation[] = [
  {
    id: '1',
    customerName: 'Kouamé Jean',
    customerPhone: '+225 07 00 00 00 01',
    partySize: 4,
    date: new Date().toISOString().split('T')[0],
    time: '19:30',
    status: 'CONFIRMED',
    tableNumber: 'T5',
    notes: 'Anniversaire',
  },
  {
    id: '2',
    customerName: 'Aminata Diallo',
    customerPhone: '+225 07 00 00 00 02',
    partySize: 2,
    date: new Date().toISOString().split('T')[0],
    time: '20:00',
    status: 'PENDING',
  },
  {
    id: '3',
    customerName: 'Mamadou Koné',
    customerPhone: '+225 07 00 00 00 03',
    partySize: 6,
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '12:30',
    status: 'CONFIRMED',
    tableNumber: 'VIP1',
  },
];

export default function RestaurantCateringPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>(DEMO_RESERVATIONS);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'CANCELLED'>('all');

  useEffect(() => {
    loadReservations();
  }, [restaurantId]);

  const loadReservations = async () => {
    try {
      const data = await apiGet<any>(`/catering?restaurantId=${restaurantId}`);
      if (data?.reservations?.length > 0) {
        setReservations(data.reservations);
      }
    } catch (error) {
      console.error('Failed to load catering reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = reservations.filter(r =>
    filter === 'all' || r.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />;
      case 'PENDING': return <AlertCircle className="h-4 w-4" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-orange-500" />
            Traiteur & Événements
          </h1>
          <p className="text-muted-foreground">
            Gérez les réservations pour événements et traiteur
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle réservation
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
                <p className="text-2xl font-bold">{reservations.filter(r => r.status === 'CONFIRMED').length}</p>
                <p className="text-sm text-muted-foreground">Confirmées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reservations.filter(r => r.status === 'PENDING').length}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reservations.reduce((sum, r) => sum + r.partySize, 0)}</p>
                <p className="text-sm text-muted-foreground">Personnes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reservations.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="PENDING">En attente</TabsTrigger>
          <TabsTrigger value="CONFIRMED">Confirmées</TabsTrigger>
          <TabsTrigger value="CANCELLED">Annulées</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{reservation.customerName}</h3>
                        <Badge className={getStatusColor(reservation.status)}>
                          {getStatusIcon(reservation.status)}
                          <span className="ml-1">{reservation.status}</span>
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {reservation.partySize} personnes
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(reservation.date).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {reservation.time}
                        </span>
                        {reservation.tableNumber && (
                          <span className="flex items-center gap-1">
                            Table {reservation.tableNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {reservation.customerPhone}
                        </span>
                      </div>
                      {reservation.notes && (
                        <p className="text-sm text-muted-foreground italic">
                          Note: {reservation.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Appeler</Button>
                      <Button variant="outline" size="sm">WhatsApp</Button>
                      <Button variant="default" size="sm" className="bg-orange-500 hover:bg-orange-600">
                        Détails
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
