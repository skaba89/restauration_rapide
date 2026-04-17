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
import { useToast } from '@/hooks/use-toast';
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
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [saving, setSaving] = useState(false);
  
  // New reservation form state
  const [newReservation, setNewReservation] = useState({
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    partySize: '2',
    date: new Date().toISOString().split('T')[0],
    time: '',
    occasion: '',
    notes: '',
  });

  const filteredReservations = reservations.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchQuery && !r.guestName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    today: reservations.filter(r => new Date(r.date).toDateString() === new Date().toDateString()).length,
    pending: reservations.filter(r => r.status === 'PENDING').length,
    confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
    totalGuests: reservations.reduce((sum, r) => sum + r.partySize, 0),
  };

  // Create new reservation
  const createReservation = async () => {
    if (!newReservation.guestName || !newReservation.guestPhone || !newReservation.time) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir le nom, le téléphone et l\'heure',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const reservation = {
      id: String(reservations.length + 1),
      guestName: newReservation.guestName,
      guestPhone: newReservation.guestPhone,
      guestEmail: newReservation.guestEmail || null,
      partySize: parseInt(newReservation.partySize) || 2,
      date: new Date(newReservation.date),
      time: newReservation.time,
      status: 'PENDING' as const,
      tableNumbers: [],
      occasion: newReservation.occasion || null,
      notes: newReservation.notes || null,
    };

    setReservations([reservation, ...reservations]);
    
    // Reset form
    setNewReservation({
      guestName: '',
      guestPhone: '',
      guestEmail: '',
      partySize: '2',
      date: new Date().toISOString().split('T')[0],
      time: '',
      occasion: '',
      notes: '',
    });
    setIsAddDialogOpen(false);
    setSaving(false);

    toast({
      title: 'Réservation créée',
      description: `Réservation pour ${reservation.guestName} le ${formatDate(reservation.date)} à ${reservation.time}`,
    });
  };

  // Update reservation status
  const updateReservationStatus = (id: string, status: string) => {
    setReservations(prev => prev.map(r => 
      r.id === id ? { ...r, status } : r
    ));
    toast({
      title: 'Statut mis à jour',
      description: 'Le statut de la réservation a été modifié',
    });
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
              <Label htmlFor="guestName">Nom du client *</Label>
              <Input 
                id="guestName" 
                placeholder="Nom complet" 
                value={newReservation.guestName}
                onChange={(e) => setNewReservation({...newReservation, guestName: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input 
                  id="phone" 
                  placeholder="07 00 00 00 00" 
                  value={newReservation.guestPhone}
                  onChange={(e) => setNewReservation({...newReservation, guestPhone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partySize">Nombre de personnes</Label>
                <Input 
                  id="partySize" 
                  type="number" 
                  min="1" 
                  value={newReservation.partySize}
                  onChange={(e) => setNewReservation({...newReservation, partySize: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input 
                  type="date" 
                  value={newReservation.date}
                  onChange={(e) => setNewReservation({...newReservation, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Heure *</Label>
                <Select 
                  value={newReservation.time} 
                  onValueChange={(v) => setNewReservation({...newReservation, time: v})}
                >
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
              <Select 
                value={newReservation.occasion} 
                onValueChange={(v) => setNewReservation({...newReservation, occasion: v})}
              >
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
              <Input 
                id="notes" 
                placeholder="Demandes spéciales..." 
                value={newReservation.notes}
                onChange={(e) => setNewReservation({...newReservation, notes: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={saving}>Annuler</Button>
            <Button 
              className="bg-gradient-to-r from-orange-500 to-red-600" 
              onClick={createReservation}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}