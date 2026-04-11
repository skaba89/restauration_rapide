'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Calendar,
  FileText,
  CalendarDays,
  Plus,
  Users,
  TrendingUp,
  DollarSign,
  Send,
} from 'lucide-react';
import EventManager from '@/components/events/event-manager';
import EventCalendar from '@/components/events/event-calendar';
import QuoteBuilder from '@/components/events/quote-builder';
import { toast } from 'sonner';

// Stats Card Component
function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  color = 'blue'
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  trend?: string;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quotes Tab Component
function QuotesTab() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);

  // Fetch quotes
  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/events/quotes?demo=true');
      const data = await response.json();
      if (data.success) {
        setQuotes(data.quotes);
      }
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useState(() => {
    fetchQuotes();
  });

  const formatCurrency = (amount: number) => `${amount?.toLocaleString('fr-FR') || 0} GNF`;

  const STATUS_LABELS: Record<string, string> = {
    draft: 'Brouillon',
    sent: 'Envoyé',
    accepted: 'Accepté',
    rejected: 'Refusé',
    expired: 'Expiré',
  };

  const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    sent: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    expired: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gestion des Devis</h3>
          <p className="text-sm text-muted-foreground">
            Créez et gérez les devis pour vos clients
          </p>
        </div>
        <Button onClick={() => setShowQuoteBuilder(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau devis
        </Button>
      </div>

      {/* Quotes List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto" />
            <p className="mt-2 text-muted-foreground">Chargement des devis...</p>
          </CardContent>
        </Card>
      ) : quotes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Aucun devis</p>
            <Button className="mt-4" onClick={() => setShowQuoteBuilder(true)}>
              Créer un devis
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{quote.quoteNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[quote.status]}`}>
                        {STATUS_LABELS[quote.status]}
                      </span>
                    </div>
                    <p className="text-sm">{quote.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {quote.eventName || 'Événement'} • {new Date(quote.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">
                      {formatCurrency(quote.totalAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Acompte: {formatCurrency(quote.depositAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quote Builder Dialog */}
      <Dialog open={showQuoteBuilder} onOpenChange={setShowQuoteBuilder}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogDescription className="sr-only">Créer un nouveau devis pour un événement.</DialogDescription>
          <QuoteBuilder
            onClose={() => setShowQuoteBuilder(false)}
            onSuccess={() => {
              fetchQuotes();
              setShowQuoteBuilder(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function EventsPage() {
  const [showNewEvent, setShowNewEvent] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            Traiteur & Événements
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos événements, devis et réservations traiteur
          </p>
        </div>
        <Button onClick={() => setShowNewEvent(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel événement
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard
          title="Événements ce mois"
          value="10"
          icon={CalendarDays}
          color="blue"
        />
        <StatsCard
          title="Devis en attente"
          value="3"
          icon={Send}
          color="amber"
        />
        <StatsCard
          title="Convives prévus"
          value="970"
          icon={Users}
          color="purple"
        />
        <StatsCard
          title="Revenus prévus"
          value="67.1M GNF"
          icon={DollarSign}
          trend="+15% vs mois dernier"
          color="green"
        />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Événements
          </TabsTrigger>
          <TabsTrigger value="quotes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Devis
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Calendrier
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <EventManager />
        </TabsContent>

        <TabsContent value="quotes">
          <QuotesTab />
        </TabsContent>

        <TabsContent value="calendar">
          <EventCalendar />
        </TabsContent>
      </Tabs>

      {/* New Event Dialog */}
      <Dialog open={showNewEvent} onOpenChange={setShowNewEvent}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogDescription className="sr-only">Créer un nouvel événement avec les détails de la demande.</DialogDescription>
          <QuoteBuilder
            onClose={() => setShowNewEvent(false)}
            onSuccess={() => {
              setShowNewEvent(false);
              toast.success('Événement créé avec succès');
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
