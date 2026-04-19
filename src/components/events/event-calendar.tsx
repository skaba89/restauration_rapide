'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import EventDetail from './event-detail';
import { fetchWithAuth } from '@/lib/api-client';
import { useCurrencySafe } from '@/lib/currency-context';

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

// Event type labels (French)
const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Mariage',
  birthday: 'Anniversaire',
  corporate: 'Entreprise',
  baptism: 'Baptême',
  other: 'Autre',
};

// Status colors
const STATUS_COLORS: Record<string, string> = {
  inquiry: 'bg-slate-500',
  quote_sent: 'bg-blue-500',
  confirmed: 'bg-amber-500',
  deposit_paid: 'bg-emerald-500',
  completed: 'bg-purple-500',
  cancelled: 'bg-red-500',
};

// Event type colors
const EVENT_TYPE_COLORS: Record<string, string> = {
  wedding: 'bg-pink-500',
  birthday: 'bg-purple-500',
  corporate: 'bg-blue-500',
  baptism: 'bg-cyan-500',
  other: 'bg-gray-500',
};

// French month names
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

// French day names
const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const DAY_NAMES_FULL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export function EventCalendar() {
  const { formatCurrency } = useCurrencySafe();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth('/api/events');
      const data = await response.json();
      if (data.success) {
        setEvents(data.events.map((e: Event) => ({ ...e, date: new Date(e.date) })));
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: Date[] = [];
    
    // Add days from previous month to fill first week
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add days from next month to fill last week
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  }, [currentDate]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear() &&
        event.status !== 'cancelled'
      );
    });
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Handle status change
  const handleStatusChange = async (eventId: string, newStatus: Event['status']) => {
    try {
      const response = await fetchWithAuth('/api/events', {
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

  // Handle cancel
  const handleCancel = async (eventId: string) => {
    try {
      const response = await fetchWithAuth(`/api/events?id=${eventId}`, { method: 'DELETE' });
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

  // Create quote
  const handleCreateQuote = (event: Event) => {
    // This would open the quote builder
    toast.info('Ouvrir le créateur de devis');
  };

  // Stats for current month
  const monthStats = useMemo(() => {
    const monthEvents = events.filter((e) => {
      const eventDate = new Date(e.date);
      return (
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear() &&
        e.status !== 'cancelled'
      );
    });

    return {
      total: monthEvents.length,
      revenue: monthEvents.reduce((sum, e) => sum + e.totalAmount, 0),
      guests: monthEvents.reduce((sum, e) => sum + e.guestCount, 0),
    };
  }, [events, currentDate]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <p className="text-muted-foreground">
            {monthStats.total} événements • {monthStats.guests} convives • {formatCurrency(monthStats.revenue)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Aujourd'hui
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-500" />
          <span>Mariage</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span>Anniversaire</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Entreprise</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500" />
          <span>Baptême</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500" />
          <span>Autre</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_NAMES.map((day, index) => (
              <div
                key={day}
                className={`text-center text-sm font-medium py-2 ${
                  index === 0 ? 'text-red-500' : 'text-muted-foreground'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isCurrent = isCurrentMonth(date);
              const isTodayDate = isToday(date);

              return (
                <div
                  key={index}
                  className={`min-h-24 p-1 border rounded-lg transition-colors ${
                    isCurrent
                      ? isTodayDate
                        ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-900'
                  }`}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isCurrent
                        ? isTodayDate
                          ? 'text-orange-600'
                          : 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {date.getDate()}
                  </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <button
                        key={event.id}
                        className={`w-full text-left px-1.5 py-0.5 rounded text-xs truncate text-white ${EVENT_TYPE_COLORS[event.eventType]} hover:opacity-80 transition-opacity`}
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventDetail(true);
                        }}
                      >
                        {event.startTime} {event.eventName || EVENT_TYPE_LABELS[event.eventType]}
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground px-1.5">
                        +{dayEvents.length - 3} autres
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events Sidebar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Événements à venir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-96">
            {events
              .filter((e) => new Date(e.date) >= new Date() && e.status !== 'cancelled')
              .slice(0, 10)
              .map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg cursor-pointer"
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowEventDetail(true);
                  }}
                >
                  <div className={`w-2 h-12 rounded-full ${EVENT_TYPE_COLORS[event.eventType]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {event.eventName || EVENT_TYPE_LABELS[event.eventType]}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.guestCount}
                      </span>
                    </div>
                  </div>
                  <Badge className={STATUS_COLORS[event.status] + ' text-white'}>
                    {event.status === 'confirmed' ? 'Confirmé' : 
                     event.status === 'deposit_paid' ? 'Payé' :
                     event.status === 'quote_sent' ? 'Devis' : 'Demande'}
                  </Badge>
                </div>
              ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Event Detail Dialog */}
      <Dialog open={showEventDetail} onOpenChange={setShowEventDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogDescription className="sr-only">Détails de l'événement sélectionné avec options de gestion.</DialogDescription>
          {selectedEvent && (
            <EventDetail
              event={selectedEvent}
              onStatusChange={handleStatusChange}
              onCancel={handleCancel}
              onCreateQuote={handleCreateQuote}
              onClose={() => setShowEventDetail(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EventCalendar;
