'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  CalendarDays,
  Clock,
  Users,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Bell,
  UserCheck,
  XCircle,
  Plus,
  RefreshCw,
  MessageSquare,
  Send,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  date: string;
  time: string;
  tableNumber?: string;
  status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  occasion?: string;
  specialRequests?: string;
  confirmedAt?: string;
  seatedAt?: string;
  reminderSentAt?: string;
}

const TIME_SLOTS = ['12:00', '12:30', '13:00', '13:30', '14:00', '19:00', '19:30', '20:00', '20:30', '21:00'];
const TABLES = Array.from({ length: 15 }, (_, i) => ({ id: `${i + 1}`, number: `${i + 1}`, capacity: i < 8 ? 4 : 6 }));
const OCCASIONS = ['Anniversaire', 'Réunion d\'affaires', 'Anniversaire de mariage', 'Rendez-vous', 'Autre'];

export function ReservationsManager() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState<string | null>(null);
  const [newRes, setNewRes] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    partySize: 2,
    date: '',
    time: '19:00',
    tableNumber: '',
    occasion: '',
    specialRequests: '',
  });

  // Fetch reservations
  const fetchReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        demo: 'true',
        ...(filterStatus !== 'all' && { status: filterStatus }),
      });
      
      const response = await fetch(`/api/reservations?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setReservations(data.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Create reservation
  const handleCreate = async () => {
    if (!newRes.customerName || !newRes.customerPhone || !newRes.date) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: 'demo-rest-1',
          guestName: newRes.customerName,
          guestPhone: newRes.customerPhone,
          guestEmail: newRes.customerEmail,
          partySize: newRes.partySize,
          date: newRes.date,
          time: newRes.time,
          tableIds: newRes.tableNumber ? [newRes.tableNumber] : [],
          occasion: newRes.occasion,
          specialRequests: newRes.specialRequests,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setReservations(prev => [...prev, {
          id: data.data.id || Date.now().toString(),
          customerName: newRes.customerName,
          customerPhone: newRes.customerPhone,
          customerEmail: newRes.customerEmail,
          partySize: newRes.partySize,
          date: newRes.date,
          time: newRes.time,
          tableNumber: newRes.tableNumber,
          status: 'PENDING',
          occasion: newRes.occasion,
          specialRequests: newRes.specialRequests,
        }]);
        setShowNewReservation(false);
        setNewRes({ customerName: '', customerPhone: '', customerEmail: '', partySize: 2, date: '', time: '19:00', tableNumber: '', occasion: '', specialRequests: '' });
        toast.success('Réservation créée');
      } else {
        toast.error(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  // Update status
  const handleStatusChange = async (id: string, newStatus: Reservation['status']) => {
    try {
      await fetch('/api/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      toast.success(`Réservation ${getStatusLabel(newStatus).toLowerCase()}`);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Send reminder
  const handleSendReminder = async (id: string, channel: 'sms' | 'whatsapp') => {
    const reservation = reservations.find(r => r.id === id);
    if (!reservation) return;

    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'reservation_reminder',
          channel,
          recipient: reservation.customerPhone,
          recipientName: reservation.customerName,
          template: 'reservation_reminder',
          templateData: {
            date: new Date(reservation.date).toLocaleDateString('fr-FR'),
            time: reservation.time,
            guests: reservation.partySize,
          },
        }),
      });
      
      toast.success(`Rappel ${channel === 'sms' ? 'SMS' : 'WhatsApp'} envoyé`);
      setShowReminderDialog(null);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    }
  };

  // Delete reservation
  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment annuler cette réservation?')) return;
    
    try {
      await fetch(`/api/reservations?id=${id}`, { method: 'DELETE' });
      setReservations(prev => prev.filter(r => r.id !== id));
      toast.success('Réservation annulée');
    } catch (error) {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      SEATED: 'bg-green-100 text-green-700',
      COMPLETED: 'bg-gray-100 text-gray-700',
      CANCELLED: 'bg-red-100 text-red-700',
      NO_SHOW: 'bg-purple-100 text-purple-700',
    };
    return colors[status] || 'bg-gray-100';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      SEATED: 'Installée',
      COMPLETED: 'Terminée',
      CANCELLED: 'Annulée',
      NO_SHOW: 'Non présenté',
    };
    return labels[status] || status;
  };

  const filteredReservations = reservations.filter(r => filterStatus === 'all' || r.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center"><CalendarDays className="w-5 h-5 text-orange-600" /></div>
          <div><p className="text-2xl font-bold">{reservations.length}</p><p className="text-xs text-gray-500">Total</p></div>
        </div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-yellow-600" /></div>
          <div><p className="text-2xl font-bold">{reservations.filter(r => r.status === 'PENDING').length}</p><p className="text-xs text-gray-500">En attente</p></div>
        </div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-blue-600" /></div>
          <div><p className="text-2xl font-bold">{reservations.filter(r => r.status === 'CONFIRMED').length}</p><p className="text-xs text-gray-500">Confirmées</p></div>
        </div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center justify-center">
          <Button onClick={() => setShowNewReservation(true)} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" /> Nouvelle
          </Button>
        </CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Calendrier</CardTitle></CardHeader>
          <CardContent>
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border" />
            <Button variant="outline" className="w-full mt-4" onClick={fetchReservations}>
              <RefreshCw className="w-4 h-4 mr-2" /> Actualiser
            </Button>
          </CardContent>
        </Card>

        {/* Reservations List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Réservations</CardTitle>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Filtrer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmées</SelectItem>
                  <SelectItem value="SEATED">Installées</SelectItem>
                  <SelectItem value="COMPLETED">Terminées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {filteredReservations.map(res => (
                  <Card key={res.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{res.guestName || res.customerName}</span>
                            <Badge className={getStatusColor(res.status)}>{getStatusLabel(res.status)}</Badge>
                            {res.tableNumber && <Badge variant="outline">Table {res.tableNumber}</Badge>}
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Users className="w-4 h-4" />{res.partySize} pers.</span>
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{res.time}</span>
                            <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{res.guestPhone || res.customerPhone}</span>
                          </div>
                          {res.occasion && (
                            <p className="text-sm text-gray-500 mt-1">📍 {res.occasion}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {res.status === 'PENDING' && (
                            <>
                              <Button size="sm" onClick={() => handleStatusChange(res.id, 'CONFIRMED')} className="bg-blue-500 hover:bg-blue-600"><UserCheck className="w-4 h-4" /></Button>
                              <Button size="sm" variant="destructive" onClick={() => handleStatusChange(res.id, 'CANCELLED')}><XCircle className="w-4 h-4" /></Button>
                            </>
                          )}
                          {res.status === 'CONFIRMED' && (
                            <>
                              <Button size="sm" onClick={() => handleStatusChange(res.id, 'SEATED')} className="bg-green-500 hover:bg-green-600">Installer</Button>
                              <Button size="sm" variant="outline" onClick={() => setShowReminderDialog(res.id)}><Bell className="w-4 h-4" /></Button>
                            </>
                          )}
                          {res.status === 'SEATED' && (
                            <Button size="sm" onClick={() => handleStatusChange(res.id, 'COMPLETED')} className="bg-gray-500 hover:bg-gray-600">Terminer</Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(res.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* New Reservation Dialog */}
      <Dialog open={showNewReservation} onOpenChange={setShowNewReservation}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nouvelle Réservation</DialogTitle><DialogDescription className="sr-only">Remplissez les informations pour créer une nouvelle réservation.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nom *</Label><Input value={newRes.customerName} onChange={(e) => setNewRes(prev => ({ ...prev, customerName: e.target.value }))} placeholder="Nom du client" /></div>
              <div><Label>Téléphone *</Label><Input value={newRes.customerPhone} onChange={(e) => setNewRes(prev => ({ ...prev, customerPhone: e.target.value }))} placeholder="+224 6XX XXX XXX" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Email</Label><Input type="email" value={newRes.customerEmail} onChange={(e) => setNewRes(prev => ({ ...prev, customerEmail: e.target.value }))} placeholder="email@exemple.com" /></div>
              <div><Label>Personnes</Label><Input type="number" value={newRes.partySize} onChange={(e) => setNewRes(prev => ({ ...prev, partySize: parseInt(e.target.value) }))} min={1} max={20} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Date *</Label><Input type="date" value={newRes.date} onChange={(e) => setNewRes(prev => ({ ...prev, date: e.target.value }))} /></div>
              <div><Label>Heure *</Label>
                <Select value={newRes.time} onValueChange={(v) => setNewRes(prev => ({ ...prev, time: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TIME_SLOTS.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Table</Label>
                <Select value={newRes.tableNumber} onValueChange={(v) => setNewRes(prev => ({ ...prev, tableNumber: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{TABLES.map(t => <SelectItem key={t.id} value={t.number}>Table {t.number} ({t.capacity} places)</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Occasion</Label>
                <Select value={newRes.occasion} onValueChange={(v) => setNewRes(prev => ({ ...prev, occasion: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{OCCASIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Notes</Label><Input value={newRes.specialRequests} onChange={(e) => setNewRes(prev => ({ ...prev, specialRequests: e.target.value }))} placeholder="Demandes spéciales..." /></div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNewReservation(false)}>Annuler</Button>
              <Button onClick={handleCreate} className="bg-orange-500 hover:bg-orange-600">Créer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reminder Dialog */}
      <Dialog open={!!showReminderDialog} onOpenChange={() => setShowReminderDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Envoyer un rappel</DialogTitle><DialogDescription className="sr-only">Choisissez le canal pour envoyer le rappel au client.</DialogDescription></DialogHeader>
          <div className="flex gap-4">
            <Button className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={() => showReminderDialog && handleSendReminder(showReminderDialog, 'sms')}>
              <MessageSquare className="w-4 h-4 mr-2" /> SMS
            </Button>
            <Button className="flex-1 bg-green-500 hover:bg-green-600" onClick={() => showReminderDialog && handleSendReminder(showReminderDialog, 'whatsapp')}>
              <Send className="w-4 h-4 mr-2" /> WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
