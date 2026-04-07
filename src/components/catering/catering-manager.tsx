'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  Phone,
  Mail,
  MapPin,
  Clock,
  Package,
  Check,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Star,
  Sparkles,
  FileText,
  Send,
  CreditCard,
  Eye,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCurrency } from '@/lib/currency-context';

// Types
interface CateringPackage {
  id: string;
  name: string;
  description: string;
  pricePerPerson: number;
  minGuests: number;
  maxGuests: number | null;
  menuItems: string[];
  includes: string[];
  imageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

interface CateringOrder {
  id: string;
  orderNumber: string;
  packageId: string | null;
  packageName: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  eventType: string;
  eventName: string | null;
  eventDate: Date;
  eventTime: string;
  endTime: string | null;
  guestCount: number;
  venue: string | null;
  venueAddress: string | null;
  menuCustomizations: string[];
  specialRequests: string | null;
  totalAmount: number;
  depositAmount: number;
  depositPaid: boolean;
  status: string;
  createdAt: Date;
}

interface OrderStats {
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
  totalGuests: number;
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
  in_progress: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

// Status colors
const STATUS_COLORS: Record<string, string> = {
  inquiry: 'bg-slate-100 text-slate-700 border-slate-200',
  quote_sent: 'bg-blue-100 text-blue-700 border-blue-200',
  confirmed: 'bg-amber-100 text-amber-700 border-amber-200',
  deposit_paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  in_progress: 'bg-purple-100 text-purple-700 border-purple-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
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

export function CateringManager() {
  const { formatCurrency } = useCurrency();
  
  // Packages state
  const [packages, setPackages] = useState<CateringPackage[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  
  // Orders state
  const [orders, setOrders] = useState<CateringOrder[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEventType, setSelectedEventType] = useState('all');
  
  // Dialogs
  const [showPackageDetail, setShowPackageDetail] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CateringPackage | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CateringOrder | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    eventType: 'birthday',
    eventName: '',
    eventDate: '',
    eventTime: '12:00',
    endTime: '18:00',
    guestCount: '50',
    venue: '',
    venueAddress: '',
    specialRequests: '',
    dietaryNotes: '',
  });

  // Fetch packages
  const fetchPackages = useCallback(async () => {
    setIsLoadingPackages(true);
    try {
      const response = await fetch('/api/catering/packages?demo=true');
      const data = await response.json();
      if (data.success) {
        setPackages(data.packages);
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    } finally {
      setIsLoadingPackages(false);
    }
  }, []);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const params = new URLSearchParams();
      params.set('demo', 'true');
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedEventType !== 'all') params.set('eventType', selectedEventType);
      if (searchTerm) params.set('search', searchTerm);

      const response = await fetch(`/api/catering/orders?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders.map((o: CateringOrder) => ({ ...o, eventDate: new Date(o.eventDate), createdAt: new Date(o.createdAt) })));
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [selectedStatus, selectedEventType, searchTerm]);

  useEffect(() => {
    fetchPackages();
    fetchOrders();
  }, [fetchPackages, fetchOrders]);

  // Handle status change
  const handleStatusChange = async (orderId: string, action: string) => {
    try {
      const response = await fetch('/api/catering/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, action }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Statut mis à jour');
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(data.order);
        }
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Handle booking submission
  const handleBookingSubmit = async (sendQuote: boolean) => {
    if (!bookingForm.customerName || !bookingForm.customerPhone || !bookingForm.eventDate) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    try {
      // Create order
      const response = await fetch('/api/catering/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingForm,
          packageId: selectedPackage?.id || null,
          packageName: selectedPackage?.name || null,
          guestCount: parseInt(bookingForm.guestCount),
        }),
      });

      const data = await response.json();
      if (data.success) {
        // If send quote, update status
        if (sendQuote) {
          await fetch('/api/catering/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: data.order.id, action: 'send_quote' }),
          });
          toast.success('Devis créé et envoyé au client');
        } else {
          toast.success('Demande de traiteur créée');
        }
        setShowBookingForm(false);
        setSelectedPackage(null);
        setBookingForm({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          eventType: 'birthday',
          eventName: '',
          eventDate: '',
          eventTime: '12:00',
          endTime: '18:00',
          guestCount: '50',
          venue: '',
          venueAddress: '',
          specialRequests: '',
          dietaryNotes: '',
        });
        fetchOrders();
      }
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
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

  const formatShortDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="space-y-6">
      {/* Packages Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Packages Traiteur</h2>
            <p className="text-sm text-muted-foreground">Sélectionnez un package pour créer un devis</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchPackages} disabled={isLoadingPackages}>
            <RefreshCw className={`h-4 w-4 ${isLoadingPackages ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isLoadingPackages ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-6 bg-slate-200 rounded w-2/3" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <ScrollArea className="max-h-[500px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
              {packages.filter(p => p.isActive).map((pkg) => (
                <Card 
                  key={pkg.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    pkg.isFeatured ? 'ring-2 ring-orange-400' : ''
                  }`}
                  onClick={() => {
                    setSelectedPackage(pkg);
                    setShowPackageDetail(true);
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {pkg.name}
                          {pkg.isFeatured && (
                            <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {pkg.description?.substring(0, 80)}...
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-green-600">{formatCurrency(pkg.pricePerPerson)}</span>
                      <span className="text-sm text-muted-foreground">/ personne</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {pkg.minGuests}-{pkg.maxGuests || '∞'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        {pkg.menuItems.length} plats
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button className="w-full" onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPackage(pkg);
                      setShowBookingForm(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer un devis
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <Separator />

      {/* Orders Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Commandes Traiteur</h2>
            <p className="text-sm text-muted-foreground">Gérez les demandes et réservations</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
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
                  <Check className="h-5 w-5 text-white" />
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

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{stats?.totalGuests || 0}</p>
                  <p className="text-xs text-muted-foreground">Convives</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, numéro, lieu..."
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
              <Button variant="outline" size="icon" onClick={fetchOrders} disabled={isLoadingOrders}>
                <RefreshCw className={`h-4 w-4 ${isLoadingOrders ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-3 pr-4">
            {isLoadingOrders ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Chargement des commandes...</p>
                </CardContent>
              </Card>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">Aucune commande trouvée</p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card 
                  key={order.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowOrderDetail(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Order Info */}
                      <div className="flex items-start gap-4">
                        <div className={`w-3 h-16 rounded-full ${EVENT_TYPE_COLORS[order.eventType]}`} />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">
                              {order.eventName || EVENT_TYPE_LABELS[order.eventType]}
                            </h3>
                            <Badge variant="outline" className={STATUS_COLORS[order.status]}>
                              {STATUS_LABELS[order.status]}
                            </Badge>
                            {order.packageName && (
                              <Badge variant="secondary" className="text-xs">
                                {order.packageName}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.orderNumber} • {order.customerName} • {order.guestCount} personnes
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatShortDate(order.eventDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {order.eventTime}
                            </span>
                            {order.venue && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {order.venue.length > 25 ? order.venue.substring(0, 25) + '...' : order.venue}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-600">{formatCurrency(order.finalAmount)}</p>
                          {order.depositAmount > 0 && (
                            <p className={`text-xs ${order.depositPaid ? 'text-green-600' : 'text-amber-600'}`}>
                              Acompte: {formatCurrency(order.depositAmount)} {order.depositPaid ? '✓' : '(en attente)'}
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
        </ScrollArea>
      </div>

      {/* Package Detail Dialog */}
      <Dialog open={showPackageDetail} onOpenChange={setShowPackageDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPackage && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedPackage.name}
                  {selectedPackage.isFeatured && (
                    <Badge className="bg-orange-500">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Populaire
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>{selectedPackage.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-600">{formatCurrency(selectedPackage.pricePerPerson)}</span>
                  <span className="text-muted-foreground">/ personne</span>
                </div>

                {/* Guest Range */}
                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {selectedPackage.minGuests} - {selectedPackage.maxGuests || '∞'} personnes
                  </Badge>
                </div>

                {/* Menu Items */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Menu inclus
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPackage.menuItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* What's Included */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Services inclus
                  </h4>
                  <ul className="space-y-1">
                    {selectedPackage.includes.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowPackageDetail(false)} className="flex-1">
                  Fermer
                </Button>
                <Button 
                  onClick={() => {
                    setShowPackageDetail(false);
                    setShowBookingForm(true);
                  }} 
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un devis
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedOrder.eventName || EVENT_TYPE_LABELS[selectedOrder.eventType]}
                  <Badge variant="outline" className={STATUS_COLORS[selectedOrder.status]}>
                    {STATUS_LABELS[selectedOrder.status]}
                  </Badge>
                </DialogTitle>
                <DialogDescription>{selectedOrder.orderNumber}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Customer Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Client</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-medium">{selectedOrder.customerName}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {selectedOrder.customerPhone}
                      </span>
                      {selectedOrder.customerEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {selectedOrder.customerEmail}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Event Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Événement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-medium">{formatDate(selectedOrder.eventDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Heure</p>
                        <p className="font-medium">{selectedOrder.eventTime} - {selectedOrder.endTime || '?'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-medium">{EVENT_TYPE_LABELS[selectedOrder.eventType]}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Convives</p>
                        <p className="font-medium">{selectedOrder.guestCount} personnes</p>
                      </div>
                    </div>
                    {selectedOrder.venue && (
                      <div className="mt-2">
                        <p className="text-muted-foreground text-sm">Lieu</p>
                        <p className="font-medium">{selectedOrder.venue}</p>
                        {selectedOrder.venueAddress && (
                          <p className="text-sm text-muted-foreground">{selectedOrder.venueAddress}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Tarification</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Total</span>
                        <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                      </div>
                      {selectedOrder.discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-red-600">
                          <span>Remise</span>
                          <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg">
                        <span>Montant final</span>
                        <span className="text-green-600">{formatCurrency(selectedOrder.finalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-amber-600">
                        <span>Acompte (30%)</span>
                        <span>{formatCurrency(selectedOrder.depositAmount)} {selectedOrder.depositPaid ? '✓' : '(en attente)'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Special Requests */}
                {selectedOrder.specialRequests && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Demandes spéciales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedOrder.specialRequests}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedOrder.status === 'inquiry' && (
                  <Button onClick={() => handleStatusChange(selectedOrder.id, 'send_quote')}>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer le devis
                  </Button>
                )}
                {selectedOrder.status === 'quote_sent' && (
                  <Button onClick={() => handleStatusChange(selectedOrder.id, 'confirm')}>
                    <Check className="h-4 w-4 mr-2" />
                    Confirmer
                  </Button>
                )}
                {selectedOrder.status === 'confirmed' && !selectedOrder.depositPaid && (
                  <Button onClick={() => handleStatusChange(selectedOrder.id, 'pay_deposit')}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Enregistrer l'acompte
                  </Button>
                )}
                {selectedOrder.status === 'deposit_paid' && (
                  <Button onClick={() => handleStatusChange(selectedOrder.id, 'complete')}>
                    <Check className="h-4 w-4 mr-2" />
                    Marquer terminé
                  </Button>
                )}
                {!['cancelled', 'completed'].includes(selectedOrder.status) && (
                  <Button variant="destructive" onClick={() => handleStatusChange(selectedOrder.id, 'cancel')}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Form Dialog */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle demande de traiteur</DialogTitle>
            <DialogDescription>
              {selectedPackage ? `Package: ${selectedPackage.name}` : 'Créer une demande personnalisée'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Nom du client *</Label>
                <Input
                  id="customerName"
                  value={bookingForm.customerName}
                  onChange={(e) => setBookingForm({ ...bookingForm, customerName: e.target.value })}
                  placeholder="Nom complet"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Téléphone *</Label>
                <Input
                  id="customerPhone"
                  value={bookingForm.customerPhone}
                  onChange={(e) => setBookingForm({ ...bookingForm, customerPhone: e.target.value })}
                  placeholder="+224 62 00 00 00"
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={bookingForm.customerEmail}
                  onChange={(e) => setBookingForm({ ...bookingForm, customerEmail: e.target.value })}
                  placeholder="client@email.com"
                />
              </div>
              <div>
                <Label htmlFor="eventType">Type d'événement</Label>
                <Select 
                  value={bookingForm.eventType} 
                  onValueChange={(v) => setBookingForm({ ...bookingForm, eventType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wedding">Mariage</SelectItem>
                    <SelectItem value="birthday">Anniversaire</SelectItem>
                    <SelectItem value="corporate">Entreprise</SelectItem>
                    <SelectItem value="baptism">Baptême</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Event Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="eventName">Nom de l'événement</Label>
                <Input
                  id="eventName"
                  value={bookingForm.eventName}
                  onChange={(e) => setBookingForm({ ...bookingForm, eventName: e.target.value })}
                  placeholder="Mariage Koné - Diallo"
                />
              </div>
              <div>
                <Label htmlFor="eventDate">Date *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={bookingForm.eventDate}
                  onChange={(e) => setBookingForm({ ...bookingForm, eventDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="guestCount">Nombre de convives</Label>
                <Input
                  id="guestCount"
                  type="number"
                  value={bookingForm.guestCount}
                  onChange={(e) => setBookingForm({ ...bookingForm, guestCount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="eventTime">Heure de début</Label>
                <Input
                  id="eventTime"
                  type="time"
                  value={bookingForm.eventTime}
                  onChange={(e) => setBookingForm({ ...bookingForm, eventTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endTime">Heure de fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={bookingForm.endTime}
                  onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                />
              </div>
            </div>

            {/* Venue */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="venue">Lieu</Label>
                <Input
                  id="venue"
                  value={bookingForm.venue}
                  onChange={(e) => setBookingForm({ ...bookingForm, venue: e.target.value })}
                  placeholder="Salle des fêtes..."
                />
              </div>
              <div>
                <Label htmlFor="venueAddress">Adresse</Label>
                <Input
                  id="venueAddress"
                  value={bookingForm.venueAddress}
                  onChange={(e) => setBookingForm({ ...bookingForm, venueAddress: e.target.value })}
                  placeholder="Quartier, Ville"
                />
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <Label htmlFor="specialRequests">Demandes spéciales</Label>
              <Textarea
                id="specialRequests"
                value={bookingForm.specialRequests}
                onChange={(e) => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                placeholder="Allergies, préférences, thème..."
                rows={3}
              />
            </div>

            {/* Price Estimate */}
            {selectedPackage && (
              <Card className="bg-slate-50 dark:bg-slate-900">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Prix par personne</span>
                      <span>{formatCurrency(selectedPackage.pricePerPerson)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nombre de convives</span>
                      <span>{bookingForm.guestCount || 0}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total estimé</span>
                      <span className="text-green-600">
                        {formatCurrency(selectedPackage.pricePerPerson * (parseInt(bookingForm.guestCount) || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-amber-600">
                      <span>Acompte (30%)</span>
                      <span>
                        {formatCurrency(selectedPackage.pricePerPerson * (parseInt(bookingForm.guestCount) || 0) * 0.3)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowBookingForm(false)} className="flex-1">
              Annuler
            </Button>
            <Button variant="secondary" onClick={() => handleBookingSubmit(false)} className="flex-1">
              Enregistrer
            </Button>
            <Button onClick={() => handleBookingSubmit(true)} className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              Envoyer le devis
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CateringManager;
