'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  CreditCard,
  Truck,
  Store,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  city: string;
  isOpen: boolean;
  acceptsDelivery: boolean;
  acceptsTakeaway: boolean;
  acceptsDineIn: boolean;
  deliveryFee: number;
  minOrderAmount: number;
  currency: { code: string; symbol: string };
  settings: {
    acceptsCash: boolean;
    acceptsMobileMoney: boolean;
    acceptsCard: boolean;
    deliveryEnabled: boolean;
  } | null;
  deliveryZones: { id: string; name: string; baseFee: number; minTime: number; maxTime: number }[];
}

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Form state
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway' | 'dine-in'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryZoneId, setDeliveryZoneId] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_money'>('cash');
  const [orderNotes, setOrderNotes] = useState('');

  const { items, getTotal, getItemCount, clearCart } = useCartStore();
  const cartTotal = getTotal();
  const cartCount = getItemCount();

  // Fetch restaurant
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await fetch(`/api/public/restaurant/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setRestaurant(data.data);
          // Set default delivery zone
          if (data.data.deliveryZones?.length > 0) {
            setDeliveryZoneId(data.data.deliveryZones[0].id);
            setDeliveryCity(data.data.deliveryZones[0].name);
          }
        }
      } catch {
        toast.error('Erreur lors du chargement du restaurant');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [slug]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && cartCount === 0 && !orderSuccess) {
      router.push(`/menu/${slug}`);
    }
  }, [loading, cartCount, router, slug, orderSuccess]);

  const deliveryFee = useMemo(() => {
    if (orderType !== 'delivery') return 0;
    const zone = restaurant?.deliveryZones?.find(z => z.id === deliveryZoneId);
    return zone?.baseFee ?? restaurant?.deliveryFee ?? 0;
  }, [orderType, deliveryZoneId, restaurant]);

  const total = cartTotal + deliveryFee;

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} ${restaurant?.currency?.code || 'GNF'}`;
  };

  const handleSubmit = async () => {
    // Validation
    if (!customerName.trim()) {
      toast.error('Veuillez entrer votre nom');
      return;
    }
    if (!customerPhone.trim()) {
      toast.error('Veuillez entrer votre numéro de téléphone');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      toast.error('Veuillez entrer votre adresse de livraison');
      return;
    }

    if (!restaurant) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/public/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          orderType: orderType.toUpperCase().replace('-', '_'),
          customerName,
          customerPhone,
          customerEmail: customerEmail || null,
          deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
          deliveryCity: orderType === 'delivery' ? deliveryCity : null,
          deliveryZoneId: orderType === 'delivery' ? deliveryZoneId : null,
          deliveryNotes: deliveryNotes || null,
          paymentMethod: paymentMethod.toUpperCase(),
          notes: orderNotes || null,
          items: items.map(item => ({
            menuItemId: item.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            notes: item.notes,
          })),
          subtotal: cartTotal,
          deliveryFee,
          total,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la commande');
      }

      // Success!
      setOrderId(data.data.id);
      setOrderSuccess(true);
      clearCart();
      toast.success('Commande passée avec succès!');

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la commande');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Success state
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Commande confirmée!</h1>
            <p className="text-gray-500 mt-2">
              Votre commande a été passée avec succès.
            </p>
            {orderId && (
              <Badge className="mt-4 bg-orange-100 text-orange-700 text-base px-4 py-2">
                #{orderId.slice(-6).toUpperCase()}
              </Badge>
            )}
            <p className="text-sm text-gray-500 mt-4">
              Nous vous contacterons au {customerPhone} pour confirmer votre commande.
            </p>
            <div className="space-y-3 mt-6">
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={() => router.push(`/tracking/${orderId}`)}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Suivre ma commande
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/menu/${slug}`)}
              >
                Retour au menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!restaurant || cartCount === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push(`/menu/${slug}`)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Finaliser la commande</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
        {/* Order type */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Type de commande</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {restaurant.acceptsDelivery && (
                <button
                  onClick={() => setOrderType('delivery')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    orderType === 'delivery'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <Truck className="w-5 h-5" />
                  Livraison
                </button>
              )}
              {restaurant.acceptsTakeaway && (
                <button
                  onClick={() => setOrderType('takeaway')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    orderType === 'takeaway'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <Store className="w-5 h-5" />
                  Emporté
                </button>
              )}
              {restaurant.acceptsDineIn && (
                <button
                  onClick={() => setOrderType('dine-in')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    orderType === 'dine-in'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <Store className="w-5 h-5" />
                  Sur place
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-5 h-5" />
              Vos informations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                placeholder="Votre nom"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Votre numéro de téléphone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email (optionnel)</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery address */}
        {orderType === 'delivery' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Adresse de livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {restaurant.deliveryZones?.length > 0 && (
                <div>
                  <Label>Zone de livraison</Label>
                  <Select value={deliveryZoneId} onValueChange={setDeliveryZoneId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionner une zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurant.deliveryZones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name} ({formatPrice(zone.baseFee)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  placeholder="Quartier, rue, numéro"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  placeholder="Ville"
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="deliveryNotes">Instructions de livraison</Label>
                <Input
                  id="deliveryNotes"
                  placeholder="Près de..., maison bleue, etc."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment method */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Mode de paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {restaurant.settings?.acceptsCash !== false && (
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200'
                  }`}
                >
                  <span className="text-2xl">💵</span>
                  <div className="text-left">
                    <p className="font-medium">Espèces</p>
                    <p className="text-sm text-gray-500">Paiement à la livraison</p>
                  </div>
                </button>
              )}
              {restaurant.settings?.acceptsMobileMoney && (
                <button
                  onClick={() => setPaymentMethod('mobile_money')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    paymentMethod === 'mobile_money'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200'
                  }`}
                >
                  <span className="text-2xl">📱</span>
                  <div className="text-left">
                    <p className="font-medium">Mobile Money</p>
                    <p className="text-sm text-gray-500">Orange Money, MTN MoMo</p>
                  </div>
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Récapitulatif ({cartCount} article{cartCount > 1 ? 's' : ''})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-sm">
                  <span>Sous-total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between text-sm mt-1">
                    <span>Livraison</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg mt-2">
                  <span>Total</span>
                  <span className="text-orange-600">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent className="pt-4">
            <Label htmlFor="notes">Notes (allergies, préférences...)</Label>
            <Input
              id="notes"
              placeholder="Ex: Sans oignon, sauce à part..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="mt-1"
            />
          </CardContent>
        </Card>

        {/* Submit button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          onTouchEnd={(e) => {
            if (!submitting) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className={`w-full h-14 text-lg font-semibold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            submitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 text-white active:bg-orange-700'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              Confirmer la commande • {formatPrice(total)}
            </>
          )}
        </button>

        {/* Warning */}
        {!restaurant.isOpen && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">
              Ce restaurant est actuellement fermé. Votre commande sera traitée à l'ouverture.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
