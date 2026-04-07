'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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
} from '@/components/ui/dialog';
import {
  Calendar,
  Users,
  CreditCard,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Send,
  Eye,
  Printer,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import EventDetail from './event-detail';
import QuoteBuilder from './quote-builder';

// Format GNF currency
const formatCurrency = (amount: number) => `${amount?.toLocaleString('fr-FR') || 0} GNF`;

// Types
interface EventMenuItem {
  id: string;
  menuItemId?: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
}

interface EventEquipment {
  id: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
}

interface Event {
  id: string;
  eventType: 'wedding' | 'birthday' | 'corporate' | 'baptism' | 'other';
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  eventName?: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  guestCount: number;
  menu: EventMenuItem[];
  equipment: EventEquipment[];
  staffRequired: string[];
  status: 'inquiry' | 'quote_sent' | 'confirmed' | 'deposit_paid' | 'completed' | 'cancelled';
  totalAmount: number;
  depositAmount: number;
  depositPaid: boolean;
  notes?: string;
  createdAt: Date;
}

interface EventStats {
  total: number;
  inquiry: number;
  quoteSent: number;
  confirmed: number;
  depositPaid: number;
  completed: number;
  cancelled: number;
  upcoming: number;
  totalRevenue: number;
  pendingDeposits: number;
}

// Event type labels (French)
const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Mariage',
  birthday: 'Anniversaire',
  corporate: 'Entreprise',
  baptism: 'Baptême',
  other: 'Autre',
};

// Status labels (French)
const STATUS_LABELS: Record<string, string> = {
  inquiry: 'Demande',
  quote_sent: 'Devis envoyé',
  confirmed: 'Confirmé',
  deposit_paid: 'Acompte versé',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

// Status colors
const STATUS_COLORS: Record<string, string> = {
  inquiry: 'bg-slate-100 text-slate-700 border-slate-200',
  quote_sent: 'bg-blue-100 text-blue-700 border-blue-200',
  confirmed: 'bg-amber-100 text-amber-700 border-amber-200',
  deposit_paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  completed: 'bg-purple-100 text-purple-700 border-purple-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

// Event type colors
const EVENT_TYPE_COLORS: Record<string, string> = {
  wedding: 'bg-pink-500',
  birthday: 'bg-purple-500',
  corporate: 'bg-blue-500',
  baptism: 'bg-cyan-500',
  other: 'bg-gray-500',
};

export function EventManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);
  const [quoteBuilderEvent, setQuoteBuilderEvent] = useState<Event | null>(null);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('demo', 'true');
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedEventType !== 'all') params.set('eventType', selectedEventType);
      if (searchTerm) params.set('search', searchTerm);

      const response = await fetch(`/api/events?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.events.map((e: Event) => ({ ...e, date: new Date(e.date) })));
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, selectedEventType, searchTerm]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle event status change
  const handleStatusChange = async (eventId: string, newStatus: Event['status']) => {
    try {
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventId, status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Statut mis à jour');
        fetchEvents();
        if (selectedEvent?.id === eventId) {
          setSelectedEvent(data.event);
        }
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Handle cancel event
  const handleCancelEvent = async (eventId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cet événement ?')) return;

    try {
      const response = await fetch(`/api/events?id=${eventId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success('Événement annulé');
        fetchEvents();
        setShowEventDetail(false);
      }
    } catch (error) {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  // Open quote builder for event
  const handleCreateQuote = (event: Event) => {
    setQuoteBuilderEvent(event);
    setShowEventDetail(false);
    setShowQuoteBuilder(true);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format short date
  const formatShortDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats?.upcoming || 0}</p>
                <p className="text-xs text-muted-foreground">À venir</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-500 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.inquiry || 0}</p>
                <p className="text-xs text-muted-foreground">Demandes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Send className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.quoteSent || 0}</p>
                <p className="text-xs text-muted-foreground">Devis envoyés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats?.confirmed || 0}</p>
                <p className="text-xs text-muted-foreground">Confirmés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-700 dark:text-green-400">{formatCurrency(stats?.totalRevenue || 0)}</p>
                <p className="text-xs text-muted-foreground">Revenus</p>
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
                placeholder="Rechercher par nom, client, lieu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="inquiry">Demandes</SelectItem>
                <SelectItem value="quote_sent">Devis envoyés</SelectItem>
                <SelectItem value="confirmed">Confirmés</SelectItem>
                <SelectItem value="deposit_paid">Acomptes versés</SelectItem>
                <SelectItem value="completed">Terminés</SelectItem>
                <SelectItem value="cancelled">Annulés</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedEventType} onValueChange={setSelectedEventType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Type d'événement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="wedding">Mariage</SelectItem>
                <SelectItem value="birthday">Anniversaire</SelectItem>
                <SelectItem value="corporate">Entreprise</SelectItem>
                <SelectItem value="baptism">Baptême</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchEvents} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Chargement des événements...</p>
            </CardContent>
          </Card>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Aucun événement trouvé</p>
              <Button className="mt-4" onClick={() => setShowQuoteBuilder(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un événement
              </Button>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card 
              key={event.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setSelectedEvent(event);
                setShowEventDetail(true);
              }}
            >
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Event Info */}
                  <div className="flex items-start gap-4">
                    <div className={`w-3 h-16 rounded-full ${EVENT_TYPE_COLORS[event.eventType]}`} />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">
                          {event.eventName || EVENT_TYPE_LABELS[event.eventType]}
                        </h3>
                        <Badge variant="outline" className={STATUS_COLORS[event.status]}>
                          {STATUS_LABELS[event.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.customerName} • {event.guestCount} personnes
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatShortDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.startTime} - {event.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location.length > 30 ? event.location.substring(0, 30) + '...' : event.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600">{formatCurrency(event.totalAmount)}</p>
                      {event.depositAmount > 0 && (
                        <p className={`text-xs ${event.depositPaid ? 'text-green-600' : 'text-amber-600'}`}>
                          Acompte: {formatCurrency(event.depositAmount)} {event.depositPaid ? '✓' : '(en attente)'}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Event Detail Dialog */}
      <Dialog open={showEventDetail} onOpenChange={setShowEventDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <EventDetail
              event={selectedEvent}
              onStatusChange={handleStatusChange}
              onCancel={handleCancelEvent}
              onCreateQuote={handleCreateQuote}
              onClose={() => setShowEventDetail(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Quote Builder Dialog */}
      <Dialog open={showQuoteBuilder} onOpenChange={setShowQuoteBuilder}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <QuoteBuilder
            event={quoteBuilderEvent}
            onClose={() => {
              setShowQuoteBuilder(false);
              setQuoteBuilderEvent(null);
            }}
            onSuccess={() => {
              fetchEvents();
              setShowQuoteBuilder(false);
              setQuoteBuilderEvent(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EventManager;
