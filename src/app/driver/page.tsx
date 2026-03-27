'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Bike,
  MapPin,
  Phone,
  MessageSquare,
  Star,
  Navigation,
  Clock,
  DollarSign,
  Package,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Wallet,
  TrendingUp,
  Calendar,
  Bell,
  Eye,
  EyeOff,
  Home,
  History,
  Gift,
  Shield,
  Car,
  ArrowRight,
  Utensils,
  Zap,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
type DriverView = 'dashboard' | 'delivery' | 'history' | 'earnings' | 'profile' | 'support';
type DeliveryStatus = 'PENDING' | 'ACCEPTED' | 'ARRIVED_PICKUP' | 'PICKED_UP' | 'IN_TRANSIT' | 'ARRIVED_DROPOFF' | 'DELIVERED';

interface Delivery {
  id: string;
  orderNumber: string;
  status: DeliveryStatus;
  pickupAddress: string;
  pickupName: string;
  pickupPhone: string;
  dropoffAddress: string;
  customerName: string;
  customerPhone: string;
  items: { name: string; quantity: number }[];
  total: number;
  deliveryFee: number;
  distance: string;
  estimatedTime: number;
  otp: string;
  specialInstructions?: string;
  createdAt: Date;
}

interface EarningRecord {
  id: string;
  date: Date;
  deliveries: number;
  earnings: number;
  tips: number;
  bonus: number;
}

interface DeliveryHistory {
  id: string;
  orderNumber: string;
  customerName: string;
  address: string;
  completedAt: Date;
  earnings: number;
  rating?: number;
}

// ============================================
// DEMO DATA
// ============================================
const DEMO_DRIVER = {
  id: '1',
  name: 'Kouassi Emmanuel',
  phone: '07 11 12 13 14',
  email: 'emmanuel.kouassi@email.com',
  avatar: '',
  vehicleType: 'motorcycle' as const,
  vehiclePlate: 'AB-1234-CD',
  rating: 4.8,
  totalDeliveries: 1247,
  completedToday: 12,
  earningsToday: 18500,
  isOnline: true,
  joinedAt: new Date('2023-03-15'),
};

const ACTIVE_DELIVERY: Delivery = {
  id: '1',
  orderNumber: 'ORD-2024-0145',
  status: 'ACCEPTED',
  pickupAddress: 'Restaurant Le Palais, Cocody, Rue des Jardins',
  pickupName: 'Restaurant Le Palais',
  pickupPhone: '07 00 00 00 01',
  dropoffAddress: 'Cocody, Riviera 3, Avenue 25, Villa #42',
  customerName: 'Kouamé Jean',
  customerPhone: '07 08 09 10 11',
  items: [
    { name: 'Attieké Poisson Grillé', quantity: 2 },
    { name: 'Jus de Bissap', quantity: 2 },
  ],
  total: 8500,
  deliveryFee: 1500,
  distance: '3.2 km',
  estimatedTime: 15,
  otp: '4829',
  specialInstructions: 'Sonner 2 fois, laisser devant la porte si pas de réponse',
  createdAt: new Date(),
};

const DEMO_EARNINGS: EarningRecord[] = [
  { id: '1', date: new Date(), deliveries: 12, earnings: 18500, tips: 2500, bonus: 1000 },
  { id: '2', date: new Date(Date.now() - 86400000), deliveries: 15, earnings: 22500, tips: 3000, bonus: 0 },
  { id: '3', date: new Date(Date.now() - 172800000), deliveries: 10, earnings: 15000, tips: 1500, bonus: 500 },
  { id: '4', date: new Date(Date.now() - 259200000), deliveries: 18, earnings: 27000, tips: 4000, bonus: 1500 },
  { id: '5', date: new Date(Date.now() - 345600000), deliveries: 14, earnings: 21000, tips: 2800, bonus: 0 },
  { id: '6', date: new Date(Date.now() - 432000000), deliveries: 16, earnings: 24000, tips: 3200, bonus: 1000 },
  { id: '7', date: new Date(Date.now() - 518400000), deliveries: 11, earnings: 16500, tips: 2000, bonus: 500 },
];

const DEMO_HISTORY: DeliveryHistory[] = [
  { id: '1', orderNumber: 'ORD-2024-0144', customerName: 'Aya Marie', address: 'Plateau, Avenue 12', completedAt: new Date(Date.now() - 3600000), earnings: 1500, rating: 5 },
  { id: '2', orderNumber: 'ORD-2024-0143', customerName: 'Koné Ibrahim', address: 'Marcory, Zone 4', completedAt: new Date(Date.now() - 7200000), earnings: 2000, rating: 4 },
  { id: '3', orderNumber: 'ORD-2024-0142', customerName: 'Diallo Fatou', address: 'Treichville, Rue 12', completedAt: new Date(Date.now() - 10800000), earnings: 1800, rating: 5 },
  { id: '4', orderNumber: 'ORD-2024-0141', customerName: 'Touré Amadou', address: 'Yopougon, Sicogi', completedAt: new Date(Date.now() - 14400000), earnings: 1500 },
  { id: '5', orderNumber: 'ORD-2024-0140', customerName: 'Bamba Seydou', address: 'Abobo, Gare', completedAt: new Date(Date.now() - 18000000), earnings: 2200, rating: 5 },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================
const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} FCFA`;
const formatTime = (date: Date) => new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const formatDate = (date: Date) => new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

const getStatusColor = (status: DeliveryStatus) => {
  const colors: Record<DeliveryStatus, string> = {
    PENDING: 'bg-yellow-500',
    ACCEPTED: 'bg-blue-500',
    ARRIVED_PICKUP: 'bg-indigo-500',
    PICKED_UP: 'bg-cyan-500',
    IN_TRANSIT: 'bg-purple-500',
    ARRIVED_DROPOFF: 'bg-orange-500',
    DELIVERED: 'bg-green-500',
  };
  return colors[status];
};

const getStatusLabel = (status: DeliveryStatus) => {
  const labels: Record<DeliveryStatus, string> = {
    PENDING: 'En attente',
    ACCEPTED: 'Acceptée',
    ARRIVED_PICKUP: 'Arrivé au restaurant',
    PICKED_UP: 'Commande récupérée',
    IN_TRANSIT: 'En livraison',
    ARRIVED_DROPOFF: 'Arrivé chez le client',
    DELIVERED: 'Livrée',
  };
  return labels[status];
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function DriverApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [activeView, setActiveView] = useState<DriverView>('dashboard');
  const [currentDelivery, setCurrentDelivery] = useState<Delivery | null>(ACTIVE_DELIVERY);
  const [otpInput, setOtpInput] = useState('');
  const [showOtpDialog, setShowOtpDialog] = useState(false);

  // Login state
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Weekly stats
  const weeklyEarnings = useMemo(() => {
    return DEMO_EARNINGS.reduce((sum, e) => sum + e.earnings + e.tips + e.bonus, 0);
  }, []);

  const weeklyDeliveries = useMemo(() => {
    return DEMO_EARNINGS.reduce((sum, e) => sum + e.deliveries, 0);
  }, []);

  // Handle login
  const handleLogin = () => {
    if (phone && password) {
      setIsLoggedIn(true);
    }
  };

  // Handle delivery status update
  const updateDeliveryStatus = (newStatus: DeliveryStatus) => {
    if (currentDelivery) {
      setCurrentDelivery({ ...currentDelivery, status: newStatus });
    }
  };

  // Handle OTP verification
  const verifyOtp = () => {
    if (otpInput === currentDelivery?.otp) {
      updateDeliveryStatus('DELIVERED');
      setShowOtpDialog(false);
      setOtpInput('');
    }
  };

  // Get next action for delivery
  const getNextAction = () => {
    if (!currentDelivery) return null;
    const statusFlow: { status: DeliveryStatus; label: string; nextStatus: DeliveryStatus }[] = [
      { status: 'ACCEPTED', label: 'Arrivé au restaurant', nextStatus: 'ARRIVED_PICKUP' },
      { status: 'ARRIVED_PICKUP', label: 'Commande récupérée', nextStatus: 'PICKED_UP' },
      { status: 'PICKED_UP', label: 'Démarrer la livraison', nextStatus: 'IN_TRANSIT' },
      { status: 'IN_TRANSIT', label: 'Arrivé chez le client', nextStatus: 'ARRIVED_DROPOFF' },
      { status: 'ARRIVED_DROPOFF', label: 'Confirmer la livraison', nextStatus: 'DELIVERED' },
    ];
    return statusFlow.find(s => s.status === currentDelivery.status);
  };

  // ============================================
  // LOGIN SCREEN
  // ============================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
              <Bike className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Driver App</CardTitle>
            <CardDescription>AfrikaConnect Livraison</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="07 00 00 00 00"
                  className="pl-10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              onClick={handleLogin}
            >
              Se connecter
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <p>Mot de passe oublié ? <span className="text-orange-600 font-medium cursor-pointer">Réinitialiser</span></p>
            </div>
            <Separator />
            <div className="text-center text-xs text-muted-foreground">
              <p>Démo: Entrez n&apos;importe quel numéro et mot de passe</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                {DEMO_DRIVER.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{DEMO_DRIVER.name}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{DEMO_DRIVER.rating}</span>
                <span>•</span>
                <span>{DEMO_DRIVER.totalDeliveries} livraisons</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-xs font-medium">{isOnline ? 'En ligne' : 'Hors ligne'}</span>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">2</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="space-y-4">
            {/* Status Toggle Card */}
            <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isOnline ? 'bg-white/20' : 'bg-gray-800/20'}`}>
                      {isOnline ? <Zap className="h-6 w-6" /> : <span className="text-2xl">☕</span>}
                    </div>
                    <div>
                      <p className="font-semibold">{isOnline ? 'Vous êtes en ligne' : 'Vous êtes hors ligne'}</p>
                      <p className="text-xs opacity-80">{isOnline ? 'Prêt à recevoir des commandes' : 'Activez pour recevoir des commandes'}</p>
                    </div>
                  </div>
                  <Switch
                    checked={isOnline}
                    onCheckedChange={setIsOnline}
                    className="data-[state=checked]:bg-white data-[state=unchecked]:bg-gray-400"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-xs font-medium">Aujourd&apos;hui</span>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(DEMO_DRIVER.earningsToday)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-600">+12%</span> vs hier
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Package className="h-5 w-5" />
                    <span className="text-xs font-medium">Livraisons</span>
                  </div>
                  <p className="text-2xl font-bold">{DEMO_DRIVER.completedToday}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Objectif: 15 livraisons
                  </p>
                  <Progress value={(DEMO_DRIVER.completedToday / 15) * 100} className="h-1.5 mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Rating Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                      <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{DEMO_DRIVER.rating}</p>
                      <p className="text-xs text-muted-foreground">Note moyenne</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= Math.round(DEMO_DRIVER.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{DEMO_DRIVER.totalDeliveries} évaluations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Delivery */}
            {currentDelivery && currentDelivery.status !== 'DELIVERED' && (
              <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bike className="h-5 w-5 text-orange-600" />
                      Livraison en cours
                    </CardTitle>
                    <Badge className={`${getStatusColor(currentDelivery.status)} text-white`}>
                      {getStatusLabel(currentDelivery.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>ETA: {currentDelivery.estimatedTime} min</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{currentDelivery.distance}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{formatCurrency(currentDelivery.deliveryFee)}</p>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-red-600"
                      onClick={() => setActiveView('delivery')}
                    >
                      Voir détails <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: History, label: 'Historique', view: 'history' as DriverView },
                { icon: Wallet, label: 'Gains', view: 'earnings' as DriverView },
                { icon: User, label: 'Profil', view: 'profile' as DriverView },
                { icon: HelpCircle, label: 'Aide', view: 'support' as DriverView },
              ].map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-3"
                  onClick={() => setActiveView(action.view)}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            {/* Recent History Preview */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Livraisons récentes</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveView('history')}>
                    Voir tout
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {DEMO_HISTORY.slice(0, 3).map((delivery) => (
                    <div key={delivery.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{delivery.customerName}</p>
                        <p className="text-xs text-muted-foreground truncate">{delivery.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatCurrency(delivery.earnings)}</p>
                        {delivery.rating && (
                          <div className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{delivery.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Active Delivery View */}
        {activeView === 'delivery' && currentDelivery && (
          <div className="space-y-4">
            {/* Status Progress */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Progression</h3>
                  <Badge className={`${getStatusColor(currentDelivery.status)} text-white`}>
                    {getStatusLabel(currentDelivery.status)}
                  </Badge>
                </div>
                <div className="relative">
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{
                        width: `${['ACCEPTED', 'ARRIVED_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_DROPOFF', 'DELIVERED'].indexOf(currentDelivery.status) * 20}%`
                      }}
                    />
                  </div>
                  <div className="relative flex justify-between">
                    {['Restaurant', 'Récupéré', 'En route', 'Arrivé', 'Livré'].map((step, idx) => (
                      <div key={step} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx <= ['ACCEPTED', 'ARRIVED_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_DROPOFF', 'DELIVERED'].indexOf(currentDelivery.status)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {idx < 4 ? idx + 1 : <CheckCircle className="h-4 w-4" />}
                        </div>
                        <span className="text-[10px] mt-1 text-muted-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pickup Location */}
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Utensils className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">POINT DE RETRAIT</p>
                    <p className="font-semibold">{currentDelivery.pickupName}</p>
                    <p className="text-sm text-muted-foreground">{currentDelivery.pickupAddress}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-1" /> Appeler
                      </Button>
                      <Button size="sm" variant="outline">
                        <Navigation className="h-4 w-4 mr-1" /> Naviguer
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dropoff Location */}
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">POINT DE LIVRAISON</p>
                    <p className="font-semibold">{currentDelivery.customerName}</p>
                    <p className="text-sm text-muted-foreground">{currentDelivery.dropoffAddress}</p>
                    {currentDelivery.specialInstructions && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded-lg text-xs text-yellow-800">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        {currentDelivery.specialInstructions}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {currentDelivery.customerName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{currentDelivery.customerName}</p>
                      <p className="text-sm text-muted-foreground">{currentDelivery.customerPhone}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Articles ({currentDelivery.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentDelivery.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">x{item.quantity}</Badge>
                        <span className="text-sm">{item.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between text-sm">
                  <span>Total commande</span>
                  <span className="font-semibold">{formatCurrency(currentDelivery.total)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Vos gains</span>
                  <span className="font-semibold">{formatCurrency(currentDelivery.deliveryFee)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {currentDelivery.status !== 'DELIVERED' && getNextAction() && currentDelivery.status !== 'ARRIVED_DROPOFF' && (
                <Button
                  className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-red-600"
                  onClick={() => updateDeliveryStatus(getNextAction()!.nextStatus)}
                >
                  {getNextAction()?.label}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}

              {currentDelivery.status === 'ARRIVED_DROPOFF' && (
                <Button
                  className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-600"
                  onClick={() => setShowOtpDialog(true)}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Confirmer la livraison
                </Button>
              )}

              {currentDelivery.status === 'DELIVERED' && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-green-800">Livraison terminée !</p>
                    <p className="text-sm text-green-600">Vous avez gagné {formatCurrency(currentDelivery.deliveryFee)}</p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-orange-500 to-red-600"
                      onClick={() => setActiveView('dashboard')}
                    >
                      Retour au tableau de bord
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* History View */}
        {activeView === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Historique des livraisons</h2>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-1" /> Filtrer
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-3">
                {DEMO_HISTORY.map((delivery) => (
                  <Card key={delivery.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">{delivery.orderNumber}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(delivery.completedAt)}
                            </span>
                          </div>
                          <p className="text-sm">{delivery.customerName}</p>
                          <p className="text-xs text-muted-foreground truncate">{delivery.address}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-green-600">{formatCurrency(delivery.earnings)}</span>
                              {delivery.rating && (
                                <div className="flex items-center gap-0.5">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs">{delivery.rating}</span>
                                </div>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-green-600 bg-green-50">
                              Terminée
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Earnings View */}
        {activeView === 'earnings' && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <CardContent className="p-4">
                  <p className="text-xs opacity-80 mb-1">Cette semaine</p>
                  <p className="text-2xl font-bold">{formatCurrency(weeklyEarnings)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-xs">+18% vs sem. dernière</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <CardContent className="p-4">
                  <p className="text-xs opacity-80 mb-1">Livraisons</p>
                  <p className="text-2xl font-bold">{weeklyDeliveries}</p>
                  <p className="text-xs opacity-80 mt-1">Moy: {Math.round(weeklyEarnings / weeklyDeliveries)} FCFA/livraison</p>
                </CardContent>
              </Card>
            </div>

            {/* Wallet Balance */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Portefeuille
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">{formatCurrency(weeklyEarnings)}</p>
                    <p className="text-xs text-muted-foreground">Solde disponible</p>
                  </div>
                  <Button className="bg-gradient-to-r from-orange-500 to-red-600">
                    Retirer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Earnings Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Détail des gains</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold">{formatCurrency(weeklyEarnings - DEMO_EARNINGS.reduce((s, e) => s + e.tips + e.bonus, 0))}</p>
                    <p className="text-xs text-muted-foreground">Livraisons</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{formatCurrency(DEMO_EARNINGS.reduce((s, e) => s + e.tips, 0))}</p>
                    <p className="text-xs text-muted-foreground">Pourboires</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{formatCurrency(DEMO_EARNINGS.reduce((s, e) => s + e.bonus, 0))}</p>
                    <p className="text-xs text-muted-foreground">Bonus</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Historique des gains</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[280px]">
                  <div className="space-y-3">
                    {DEMO_EARNINGS.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                          <p className="font-medium text-sm">{formatDate(record.date)}</p>
                          <p className="text-xs text-muted-foreground">{record.deliveries} livraisons</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{formatCurrency(record.earnings + record.tips + record.bonus)}</p>
                          {(record.tips > 0 || record.bonus > 0) && (
                            <p className="text-xs text-muted-foreground">
                              +{formatCurrency(record.tips + record.bonus)} bonus
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile View */}
        {activeView === 'profile' && (
          <div className="space-y-4">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white">
                    {DEMO_DRIVER.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{DEMO_DRIVER.name}</h2>
                <p className="text-muted-foreground">{DEMO_DRIVER.phone}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{DEMO_DRIVER.rating}</span>
                  <span className="text-muted-foreground">({DEMO_DRIVER.totalDeliveries} livraisons)</span>
                </div>
                <Button variant="outline" className="mt-4">
                  Modifier le profil
                </Button>
              </CardContent>
            </Card>

            {/* Vehicle Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bike className="h-5 w-5" />
                  Véhicule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                    {DEMO_DRIVER.vehicleType === 'motorcycle' ? (
                      <Bike className="h-6 w-6" />
                    ) : (
                      <Car className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold capitalize">{DEMO_DRIVER.vehicleType === 'motorcycle' ? 'Moto' : 'Voiture'}</p>
                    <p className="text-sm text-muted-foreground">Plaque: {DEMO_DRIVER.vehiclePlate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Statistiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-gray-50 text-center">
                    <p className="text-2xl font-bold">{DEMO_DRIVER.totalDeliveries}</p>
                    <p className="text-xs text-muted-foreground">Total livraisons</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 text-center">
                    <p className="text-2xl font-bold">{DEMO_DRIVER.rating}</p>
                    <p className="text-xs text-muted-foreground">Note moyenne</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 text-center">
                    <p className="text-2xl font-bold">98%</p>
                    <p className="text-xs text-muted-foreground">Taux de réussite</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 text-center">
                    <p className="text-2xl font-bold">12 min</p>
                    <p className="text-xs text-muted-foreground">Temps moyen</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {[
                    { icon: '🏆', label: 'Top Livreur', earned: true },
                    { icon: '⭐', label: '5 Étoiles', earned: true },
                    { icon: '🎯', label: '1000 Livraisons', earned: true },
                    { icon: '🚀', label: 'Rapide', earned: true },
                    { icon: '💎', label: 'Premium', earned: false },
                  ].map((badge, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl flex-shrink-0 ${
                        badge.earned ? 'bg-yellow-50' : 'bg-gray-50 opacity-50'
                      }`}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <span className="text-xs font-medium">{badge.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-3">
                <Settings className="h-5 w-5" />
                Paramètres
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="h-5 w-5" />
                Déconnexion
              </Button>
            </div>
          </div>
        )}

        {/* Support View */}
        {activeView === 'support' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Besoin d&apos;aide ?</CardTitle>
                <CardDescription>Notre équipe est disponible 24h/24</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start gap-3 h-auto py-4" variant="outline">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Appeler le support</p>
                    <p className="text-xs text-muted-foreground">Disponible 24h/24</p>
                  </div>
                </Button>
                <Button className="w-full justify-start gap-3 h-auto py-4" variant="outline">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Chat en direct</p>
                    <p className="text-xs text-muted-foreground">Réponse en &lt; 5 min</p>
                  </div>
                </Button>
                <Button className="w-full justify-start gap-3 h-auto py-4" variant="outline">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <HelpCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">FAQ</p>
                    <p className="text-xs text-muted-foreground">Réponses aux questions fréquentes</p>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Help Topics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Sujets d&apos;aide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    'Problème avec une livraison',
                    'Problème de paiement',
                    'Signaler un incident',
                    'Questions sur les gains',
                    'Problème technique',
                  ].map((topic, idx) => (
                    <Button key={idx} variant="ghost" className="w-full justify-between">
                      <span className="text-sm">{topic}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-red-800">Urgence</p>
                    <p className="text-sm text-red-600">En cas d&apos;urgence, appelez immédiatement</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Appeler
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex items-center justify-around py-2">
          {[
            { id: 'dashboard' as DriverView, icon: Home, label: 'Accueil' },
            { id: 'delivery' as DriverView, icon: Bike, label: 'Livraison', badge: currentDelivery && currentDelivery.status !== 'DELIVERED' },
            { id: 'history' as DriverView, icon: History, label: 'Historique' },
            { id: 'earnings' as DriverView, icon: Wallet, label: 'Gains' },
            { id: 'profile' as DriverView, icon: User, label: 'Profil' },
          ].map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex flex-col items-center gap-1 px-4 ${
                activeView === item.id ? 'text-orange-600' : 'text-muted-foreground'
              }`}
              onClick={() => setActiveView(item.id)}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                )}
              </div>
              <span className="text-[10px]">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>

      {/* OTP Dialog */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmer la livraison</DialogTitle>
            <DialogDescription>
              Demandez le code OTP au client pour confirmer la livraison
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP maxLength={4} value={otpInput} onChange={setOtpInput}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
              onClick={verifyOtp}
              disabled={otpInput.length !== 4}
            >
              Vérifier et confirmer
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Code de test: <span className="font-mono font-bold">{currentDelivery?.otp}</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Support Button */}
      {activeView !== 'support' && (
        <Button
          className="fixed bottom-24 right-4 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-orange-500 to-red-600"
          onClick={() => setActiveView('support')}
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
