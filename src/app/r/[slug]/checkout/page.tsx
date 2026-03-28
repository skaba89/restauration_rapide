'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  User, 
  Mail,
  CreditCard,
  Smartphone,
  Building,
  ChevronRight,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useRestaurantCartStore } from '@/lib/restaurant-cart-store';
import { formatCurrency } from '@/lib/currency';
import { authApi, setAuthToken } from '@/lib/api-client';

interface RestaurantData {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  phone: string;
  address: string;
  city: string;
  deliveryFee: number;
  minOrderAmount: number;
  deliveryTime: number;
  isOpen: boolean;
  acceptsDelivery: boolean;
  acceptsTakeaway: boolean;
  currency: string;
  deliveryZones: Array<{
    id: string;
    name: string;
    baseFee: number;
    minOrder: number;
    minTime: number;
    maxTime: number;
  }>;
  organizationId: string;
}

async function fetchRestaurant(slug: string): Promise<RestaurantData> {
  const response = await fetch(`/api/public/restaurant/${slug}`);
  if (!response.ok) throw new Error('Restaurant non trouvé');
  const data = await response.json();
  return data.data;
}

// Guinean cities for delivery
const GUINEA_CITIES = [
  'Conakry', 'Kamsar', 'Nzérékoré', 'Kankan', 'Kindia', 'Labé', 'Siguiri',
  'Guéckédou', 'Kissidougou', 'Mamou', 'Boké', 'Faranah', 'Dabola', 'Télimélé',
  'Koubia', 'Dinguiraye', 'Mali', 'Pita', 'Lélouma', 'Tougué', 'Gaoual',
  'Koundara', 'Macenta', 'Yomou', 'Nzérékoré', 'Beyla', 'Lola', 'Kérouané',
  'Kouroussa', 'Fria', 'Coyah', 'Dubréka', 'Forécariah', 'Kaloum', 'Dixinn',
  'Matam', 'Ratoma', 'Matoto'
];

const MOBILE_MONEY_PROVIDERS = [
  { id: 'orange', name: 'Orange Money', logo: '🟠', color: 'bg-orange-500' },
  { id: 'mtn', name: 'MTN MoMo', logo: '🟡', color: 'bg-yellow-500' },
];

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const router = useRouter();

  const { data: restaurant } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: () => fetchRestaurant(slug),
  });

  const {
    items: cartItems,
    getSubtotal,
    getTotalItems,
    clearCart,
    restaurantId,
    setRestaurant,
  } = useRestaurantCartStore();

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [registerError, setRegisterError] = useState('');

  // Order form
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState({
    address: '',
    city: 'Conakry',
    district: '',
    landmark: '',
    phone: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('orange');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Check for existing auth
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Validate token with API
          setIsLoggedIn(true);
          // For now, we'll assume the user is set from registration
        } catch {
          localStorage.removeItem('auth_token');
        }
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (restaurant && !restaurantId) {
      setRestaurant(restaurant.id, restaurant.slug);
    }
  }, [restaurant, restaurantId, setRestaurant]);

  const formatPrice = (price: number) => {
    return formatCurrency(price, restaurant?.currency || 'GNF');
  };

  const subtotal = getSubtotal();
  const deliveryFee = orderType === 'delivery' ? (restaurant?.deliveryFee || 0) : 0;
  const total = subtotal + deliveryFee;
  const totalItems = getTotalItems();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async () => {
      return authApi.login({ email: loginEmail, password: loginPassword });
    },
    onSuccess: (data) => {
      setAuthToken(data.token);
      setUser(data.user);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      setLoginError('');
    },
    onError: (error: any) => {
      setLoginError(error.message || 'Erreur de connexion');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      if (registerData.password !== registerData.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return authApi.register({
        email: registerData.email,
        password: registerData.password,
        phone: registerData.phone,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
      });
    },
    onSuccess: (data) => {
      setAuthToken(data.token);
      setUser(data.user);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      setRegisterError('');
    },
    onError: (error: any) => {
      setRegisterError(error.message || 'Erreur lors de l\'inscription');
    },
  });

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const orderData = {
        restaurantId: restaurant?.id,
        orderType: orderType.toUpperCase(),
        items: cartItems.map(item => ({
          menuItemId: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          variantId: item.variantId,
          variantName: item.variantName,
          options: item.options ? JSON.stringify(item.options) : null,
          notes: item.notes,
        })),
        customerName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Client',
        customerPhone: deliveryAddress.phone || user?.phone || '',
        customerEmail: user?.email || '',
        deliveryAddress: orderType === 'delivery' ? deliveryAddress.address : null,
        deliveryCity: orderType === 'delivery' ? deliveryAddress.city : null,
        deliveryDistrict: orderType === 'delivery' ? deliveryAddress.district : null,
        deliveryLandmark: orderType === 'delivery' ? deliveryAddress.landmark : null,
        deliveryNotes: deliveryAddress.notes || null,
        deliveryFee,
        subtotal,
        total,
        currencyId: restaurant?.currency || 'GNF',
        paymentMethod: paymentMethod === 'orange' ? 'ORANGE_MONEY' : 'MTN_MOMO',
        paymentPhone: phoneNumber,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la commande');
      }

      return response.json();
    },
    onSuccess: (data) => {
      clearCart();
      router.push(`/r/${slug}/order-success?orderId=${data.data?.id || data.id}`);
    },
    onError: (error: any) => {
      setOrderError(error.message);
      setIsProcessing(false);
    },
  });

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.address) {
      setOrderError('Veuillez entrer votre adresse de livraison');
      return;
    }

    if (!phoneNumber) {
      setOrderError('Veuillez entrer votre numéro de téléphone Mobile Money');
      return;
    }

    setOrderError('');
    setIsProcessing(true);
    placeOrderMutation.mutate();
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">Votre panier est vide</p>
          <Link href={`/r/${slug}`}>
            <Button className="bg-orange-500 hover:bg-orange-600">
              Voir le menu
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/r/${slug}/cart`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg">Finaliser la commande</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-32 space-y-4">
        {/* User Status */}
        {isLoggedIn && user ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  setIsLoggedIn(false);
                  setUser(null);
                }}
              >
                Déconnexion
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-orange-200 cursor-pointer hover:bg-orange-50" onClick={() => setShowAuthModal(true)}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium">Connectez-vous ou créez un compte</p>
                  <p className="text-sm text-gray-500">Pour suivre votre commande</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>
        )}

        {/* Order Type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Type de commande</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={orderType} 
              onValueChange={(v) => setOrderType(v as 'delivery' | 'takeaway')}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="delivery" id="delivery" className="peer sr-only" />
                <Label
                  htmlFor="delivery"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-orange-500 cursor-pointer"
                >
                  <MapPin className="mb-2 h-5 w-5" />
                  <span className="font-medium">Livraison</span>
                  <span className="text-xs text-gray-500">
                    {deliveryFee > 0 ? formatPrice(deliveryFee) : 'Gratuit'}
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="takeaway" id="takeaway" className="peer sr-only" />
                <Label
                  htmlFor="takeaway"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-orange-500 cursor-pointer"
                >
                  <Building className="mb-2 h-5 w-5" />
                  <span className="font-medium">À emporter</span>
                  <span className="text-xs text-gray-500">Gratuit</span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        {orderType === 'delivery' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Adresse de livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Adresse complète *</Label>
                <Input
                  id="address"
                  placeholder="Ex: Quartier Kaloum, Rue 123"
                  value={deliveryAddress.address}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <select
                    id="city"
                    className="w-full p-2 border rounded-lg text-sm"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                  >
                    {GUINEA_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">Quartier</Label>
                  <Input
                    id="district"
                    placeholder="Ex: Kaloum"
                    value={deliveryAddress.district}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, district: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="landmark">Point de repère</Label>
                <Input
                  id="landmark"
                  placeholder="Ex: Près de la grande mosquée"
                  value={deliveryAddress.landmark}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, landmark: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Ex: 622 00 00 00"
                  value={deliveryAddress.phone}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Instructions de livraison</Label>
                <Textarea
                  id="notes"
                  placeholder="Instructions pour le livreur..."
                  value={deliveryAddress.notes}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pickup Info (for takeaway) */}
        {orderType === 'takeaway' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Retrait au restaurant</p>
                  <p className="text-sm text-gray-500">{restaurant.address}, {restaurant.city}</p>
                  <p className="text-sm text-orange-600 mt-1">
                    Prêt dans environ {restaurant.deliveryTime} minutes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Method */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Mode de paiement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={setPaymentMethod}
              className="space-y-3"
            >
              {MOBILE_MONEY_PROVIDERS.map((provider) => (
                <div key={provider.id}>
                  <RadioGroupItem value={provider.id} id={provider.id} className="peer sr-only" />
                  <Label
                    htmlFor={provider.id}
                    className="flex items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-orange-500 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{provider.logo}</span>
                      <span className="font-medium">{provider.name}</span>
                    </div>
                    <Check className="h-5 w-5 text-orange-500 opacity-0 peer-data-[state=checked]:opacity-100" />
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="paymentPhone">Numéro Mobile Money *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="paymentPhone"
                  type="tel"
                  placeholder="Ex: 622 00 00 00"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">
                Vous recevrez une demande de paiement sur ce numéro
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Résumé de la commande</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.name}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Livraison</span>
              <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : 'Gratuit'}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-orange-600">{formatPrice(total)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {orderError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{orderError}</AlertDescription>
          </Alert>
        )}
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
        <div className="max-w-2xl mx-auto">
          <Button 
            className="w-full bg-orange-500 hover:bg-orange-600 h-14 text-lg"
            onClick={handlePlaceOrder}
            disabled={isProcessing || placeOrderMutation.isPending}
          >
            {isProcessing || placeOrderMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>
                Commander • {formatPrice(total)}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {authTab === 'login' ? 'Connexion' : 'Créer un compte'}
            </DialogTitle>
            <DialogDescription>
              {authTab === 'login' 
                ? 'Connectez-vous pour suivre votre commande'
                : 'Créez un compte pour une expérience personnalisée'}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="loginEmail">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="loginEmail"
                    type="email"
                    placeholder="votre@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loginPassword">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="loginPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {loginError && (
                <p className="text-sm text-red-500">{loginError}</p>
              )}
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={() => loginMutation.mutate()}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Se connecter
              </Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    placeholder="Amadou"
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    placeholder="Diallo"
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="registerEmail">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="registerEmail"
                    type="email"
                    placeholder="votre@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="registerPhone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="registerPhone"
                    type="tel"
                    placeholder="622 00 00 00"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="registerPassword">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="registerPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
              {registerError && (
                <p className="text-sm text-red-500">{registerError}</p>
              )}
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={() => registerMutation.mutate()}
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Créer mon compte
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
