'use client';

import { useState } from 'react';
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
  Utensils,
  MapPin,
} from 'lucide-react';
import CateringManager from '@/components/catering/catering-manager';
import EventCalendar from '@/components/events/event-calendar';
import QuoteBuilder from '@/components/events/quote-builder';
import { toast } from 'sonner';
import { useCurrencySafe } from '@/lib/currency-context';

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

// Availability Tab Component
function AvailabilityTab() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Disponibilité</h3>
          <p className="text-sm text-muted-foreground">
            Consultez les dates disponibles pour vos événements
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Calendrier</CardTitle>
            <CardDescription>Sélectionnez une date pour vérifier la disponibilité</CardDescription>
          </CardHeader>
          <CardContent>
            <EventCalendar />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Date sélectionnée</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDate && (
              <>
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="font-medium text-green-700 dark:text-green-400">
                    {selectedDate.toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                    ✓ Cette date est disponible
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Informations</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacité maximale</span>
                      <span>500 personnes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Événements ce jour</span>
                      <span>0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Week-end</span>
                      <span>{[0, 6].includes(selectedDate.getDay()) ? 'Oui (+15%)' : 'Non'}</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Réserver cette date
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">24</p>
            <p className="text-xs text-muted-foreground">Dates disponibles ce mois</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">6</p>
            <p className="text-xs text-muted-foreground">Dates réservées ce mois</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">89%</p>
            <p className="text-xs text-muted-foreground">Taux de disponibilité</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">12</p>
            <p className="text-xs text-muted-foreground">Week-ends disponibles</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Customer Portal Tab
function CustomerPortalTab() {
  const [showBookingForm, setShowBookingForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Portail Client</h3>
          <p className="text-sm text-muted-foreground">
            Interface de réservation pour vos clients
          </p>
        </div>
        <Button onClick={() => setShowBookingForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle réservation
        </Button>
      </div>

      {/* Service Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Utensils className="h-5 w-5 text-orange-500" />
              Traiteur
            </CardTitle>
            <CardDescription>Service de restauration pour vos événements</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Mariages et fiançailles
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Anniversaires
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Événements corporate
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Baptêmes
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Sur Place
            </CardTitle>
            <CardDescription>Nos salles et espaces événementiels</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Salle VIP (50 personnes)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Terrasse couverte (100 personnes)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Jardin (200 personnes)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Espace privatif
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Services
            </CardTitle>
            <CardDescription>Services inclus et optionnels</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Service traiteur complet
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Décoration sur mesure
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Animation & DJ
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Photographie
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact & Réservation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Téléphone</p>
              <p className="font-medium">+224 62 00 00 00</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">traiteur@kfm-delice.com</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Horaires</p>
              <p className="font-medium">Lun - Dim: 8h - 22h</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Form Dialog */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogDescription className="sr-only">Formulaire de réservation pour un événement traiteur.</DialogDescription>
          <QuoteBuilder
            onClose={() => setShowBookingForm(false)}
            onSuccess={() => {
              setShowBookingForm(false);
              toast.success('Demande envoyée avec succès');
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CateringPage() {
  const { formatCurrency } = useCurrencySafe();
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
            Gérez vos services traiteur, packages et réservations d'événements
          </p>
        </div>
        <Button onClick={() => setShowNewEvent(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle réservation
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
          value={formatCurrency(67100000)}
          icon={DollarSign}
          trend="+15% vs mois dernier"
          color="green"
        />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="packages" className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="packages" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            <span className="hidden sm:inline">Packages</span>
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Disponibilité</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Calendrier</span>
          </TabsTrigger>
          <TabsTrigger value="portal" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Portail</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="packages">
          <CateringManager />
        </TabsContent>

        <TabsContent value="availability">
          <AvailabilityTab />
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendrier des événements</CardTitle>
              <CardDescription>Vue d'ensemble de tous vos événements</CardDescription>
            </CardHeader>
            <CardContent>
              <EventCalendar />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portal">
          <CustomerPortalTab />
        </TabsContent>
      </Tabs>

      {/* New Event Dialog */}
      <Dialog open={showNewEvent} onOpenChange={setShowNewEvent}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogDescription className="sr-only">Créer une nouvelle réservation d'événement traiteur.</DialogDescription>
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
