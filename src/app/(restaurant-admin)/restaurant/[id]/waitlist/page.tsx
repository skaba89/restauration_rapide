'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UsersRound,
  Clock,
  Phone,
  UserPlus,
  CheckCircle,
  XCircle,
  Bell,
} from 'lucide-react';
import { apiGet } from '@/lib/api-client';

interface WaitlistEntry {
  id: string;
  customerName: string;
  phone: string;
  partySize: number;
  status: 'WAITING' | 'SEATED' | 'CANCELLED';
  estimatedWait: number;
  notes?: string;
  createdAt: string;
}

const DEMO_WAITLIST: WaitlistEntry[] = [
  {
    id: '1',
    customerName: 'Fatou Bamba',
    phone: '+225 07 00 00 01',
    partySize: 3,
    status: 'WAITING',
    estimatedWait: 15,
    notes: 'Préfère terrasse',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: '2',
    customerName: 'Ibrahim Sylla',
    phone: '+225 07 00 00 02',
    partySize: 2,
    status: 'WAITING',
    estimatedWait: 25,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: '3',
    customerName: 'Marie Kouassi',
    phone: '+225 07 00 00 03',
    partySize: 5,
    status: 'WAITING',
    estimatedWait: 35,
    notes: 'Allergie fruits de mer',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
];

export default function RestaurantWaitlistPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(DEMO_WAITLIST);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWaitlist();
  }, [restaurantId]);

  const loadWaitlist = async () => {
    try {
      const data = await apiGet<any>(`/waitlist?restaurantId=${restaurantId}`);
      if (data?.entries?.length > 0) {
        setWaitlist(data.entries);
      }
    } catch (error) {
      console.error('Failed to load waitlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const waitingCount = waitlist.filter(w => w.status === 'WAITING').length;
  const totalGuests = waitlist
    .filter(w => w.status === 'WAITING')
    .reduce((sum, w) => sum + w.partySize, 0);
  const avgWait = Math.round(
    waitlist.filter(w => w.status === 'WAITING').reduce((sum, w) => sum + w.estimatedWait, 0) / waitingCount
  ) || 0;

  const handleSeat = (id: string) => {
    setWaitlist(prev => prev.map(w => w.id === id ? { ...w, status: 'SEATED' as const } : w));
  };

  const handleCancel = (id: string) => {
    setWaitlist(prev => prev.map(w => w.id === id ? { ...w, status: 'CANCELLED' as const } : w));
  };

  const handleNotify = (entry: WaitlistEntry) => {
    // WhatsApp notification
    const message = `Bonjour ${entry.customerName}, votre table est presque prête ! Veuillez vous présenter à l'accueil dans les 5 minutes.`;
    const whatsappUrl = `https://wa.me/${entry.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UsersRound className="h-6 w-6 text-orange-500" />
            Liste d'Attente
          </h1>
          <p className="text-muted-foreground">
            Gérez la file d'attente de votre restaurant
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <UserPlus className="h-4 w-4 mr-2" />
          Ajouter client
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <UsersRound className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{waitingCount}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UsersRound className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalGuests}</p>
                <p className="text-sm text-muted-foreground">Personnes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgWait} min</p>
                <p className="text-sm text-muted-foreground">Attente moy.</p>
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
                <p className="text-2xl font-bold">{waitlist.filter(w => w.status === 'SEATED').length}</p>
                <p className="text-sm text-muted-foreground">Installés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>File d'attente actuelle</CardTitle>
          <CardDescription>
            Clients en attente de table
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {waitlist.filter(w => w.status === 'WAITING').map((entry, index) => (
              <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold">{entry.customerName}</h4>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>{entry.partySize} pers.</span>
                      <span>~{entry.estimatedWait} min</span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {entry.phone}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground italic mt-1">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleNotify(entry)}>
                    <Bell className="h-4 w-4 mr-1" />
                    Notifier
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleCancel(entry.id)}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Annuler
                  </Button>
                  <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleSeat(entry.id)}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Installer
                  </Button>
                </div>
              </div>
            ))}
            {waitlist.filter(w => w.status === 'WAITING').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <UsersRound className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun client en attente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
