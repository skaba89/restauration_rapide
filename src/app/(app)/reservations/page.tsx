'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  CalendarDays,
  Search,
  Plus,
  Clock,
  Users,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Edit,
  Eye,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Demo reservations
const DEMO_RESERVATIONS = [
  {
    id: '1',
    guestName: 'Bamba Seydou',
    guestPhone: '07 20 21 22 23',
    guestEmail: 'bamba.seydou@email.com',
    partySize: 4,
    date: new Date(),
    time: '19:30',
    status: 'CONFIRMED',
    tableNumbers: ['T-05'],
    occasion: 'Anniversaire',
    notes: 'Allergie aux fruits de mer',
  },
  {
    id: '2',
    guestName: 'Koffi Aya',
    guestPhone: '05 24 25 26 27',
    guestEmail: 'aya.koffi@email.com',
    partySize: 2,
    date: new Date(),
    time: '20:00',
    status: 'PENDING',
    tableNumbers: ['T-09'],
    occasion: null,
    notes: null,
  },
  {
    id: '3',
    guestName: 'Diallo Amadou',
    guestPhone: '01 28 29 30 31',
    guestEmail: 'amadou.diallo@email.com',
    partySize: 6,
    date: new Date(),
    time: '12:30',
    status: 'SEATED',
    tableNumbers: ['T-10', 'T-11'],
    occasion: 'Réunion d\'affaires',
    notes: 'Menu végétarien demandé',
  },
  {
    id: '4',
    guestName: 'Touré Fatoumata',
    guestPhone: '07 32 33 34 35',
    guestEmail: 'fatoumata.toure@email.com',
    partySize: 3,
    date: new Date(Date.now() - 86400000),
    time: '13:00',
    status: 'COMPLETED',
    tableNumbers: ['T-03'],
    occasion: null,
    notes: null,
  },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
    SEATED: 'bg-green-100 text-green-700 border-green-200',
    COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    NO_SHOW: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    SEATED: 'Installée',
    COMPLETED: 'Terminée',
    CANCELLED: 'Annulée',
    NO_SHOW: 'No-show',
  };
  return labels[status] || status;
};

const formatDate = (date: Date) => new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

export default function ReservationsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredReservations = DEMO_RESERVATIONS.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchQuery && !r.guestName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    today: DEMO_RESERVATIONS.filter(r => new Date(r.date).toDateString() === new Date().toDateString()).length,
    pending: DEMO_RESERVATIONS.filter(r => r.status === 'PENDING').length,
    confirmed: DEMO_RESERVATIONS.filter(r => r.status === 'CONFIRMED').length,
    totalGuests: DEMO_RESERVATIONS.reduce((sum, r) => sum + r.partySize, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Réservations</h1>
          <p className="text-muted-foreground">Gérez les réservations de tables</p>
        </div>
        <Button className="bg-gradient-to-r from-orange-500 to-red-600" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle réservation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.today}</p>
                <p className="text-xs text-muted-foreground">Aujourd'hui</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
                <p className="text-xs text-muted-foreground">Confirmées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalGuests}</p>
                <p className="text-xs text-muted-foreground">Couverts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Calendrier</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Reservations List */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmées</SelectItem>
                  <SelectItem value="SEATED">Installées</SelectItem>
                  <SelectItem value="COMPLETED">Terminées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-450px)]">
              <div className="divide-y">
                {filteredReservations.map((reservation) => (
                  <div key={reservation.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{reservation.guestName}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {reservation.partySize} pers.
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {reservation.time}
                          </span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(reservation.status)}>
                        {getStatusLabel(reservation.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{reservation.tableNumbers.join(', ')}</Badge>
                        {reservation.occasion && (
                          <span className="text-xs text-muted-foreground">{reservation.occasion}</span>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> Voir détails</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Modifier</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600"><XCircle className="h-4 w-4 mr-2" /> Annuler</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Add Reservation Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle réservation</DialogTitle>
            <DialogDescription>Créez une nouvelle réservation de table</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="guestName">Nom du client</Label>
              <Input id="guestName" placeholder="Nom complet" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" placeholder="07 00 00 00 00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partySize">Nombre de personnes</Label>
                <Input id="partySize" type="number" min="1" defaultValue="2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Heure</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {['12:00', '12:30', '13:00', '13:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Occasion</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Anniversaire</SelectItem>
                  <SelectItem value="business">Réunion d'affaires</SelectItem>
                  <SelectItem value="romantic">Dîner romantique</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" placeholder="Demandes spéciales..." />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600" onClick={() => setIsAddDialogOpen(false)}>
              Créer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
