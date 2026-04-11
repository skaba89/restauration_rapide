'use client';

import { useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  MapPin, 
  Clock,
  Utensils,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useRestaurantCartStore } from '@/lib/restaurant-cart-store';
import { formatCurrency } from '@/lib/currency';

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
}

async function fetchRestaurant(slug: string): Promise<RestaurantData> {
  const response = await fetch(`/api/public/restaurant/${slug}`);
  if (!response.ok) throw new Error('Restaurant non trouvé');
  const data = await response.json();
  return data.data;
}

export default function CartPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const router = useRouter();

  const { data: restaurant } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: () => fetchRestaurant(slug),
  });

  const {
    items: cartItems,
    restaurantId,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getTotalItems,
    setRestaurant,
  } = useRestaurantCartStore();

  useEffect(() => {
    if (restaurant && !restaurantId) {
      setRestaurant(restaurant.id, restaurant.slug);
    }
  }, [restaurant, restaurantId, setRestaurant]);

  const formatPrice = (price: number) => {
    return formatCurrency(price, restaurant?.currency || 'GNF');
  };

  const subtotal = getSubtotal();
  const deliveryFee = restaurant?.deliveryFee || 0;
  const total = subtotal + deliveryFee;
  const minOrderMet = subtotal >= (restaurant?.minOrderAmount || 0);
  const totalItems = getTotalItems();

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href={`/r/${slug}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-bold text-lg">Mon Panier</h1>
          </div>
        </header>
        
        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center">
            <ShoppingBag className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Votre panier est vide</h2>
            <p className="text-gray-500 mb-8">
              Ajoutez des délicieux plats pour commencer votre commande
            </p>
            <Link href={`/r/${slug}`}>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Utensils className="h-5 w-5 mr-2" />
                Voir le menu
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/r/${slug}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-lg">Mon Panier</h1>
              <p className="text-sm text-gray-500">{totalItems} article{totalItems > 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-600"
            onClick={clearCart}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Vider
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-32 space-y-4">
        {/* Restaurant Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {restaurant.logo ? (
                <img 
                  src={restaurant.logo} 
                  alt={restaurant.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                  {restaurant.name.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="font-semibold">{restaurant.name}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span>{restaurant.address}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cart Items */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Articles commandés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map((item, index) => (
              <div key={`${item.id}-${item.variantId || ''}-${index}`}>
                <div className="flex gap-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Utensils className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium">{item.name}</h3>
                    </div>
                    {item.variantName && (
                      <p className="text-sm text-gray-500">{item.variantName}</p>
                    )}
                    {item.options && item.options.length > 0 && (
                      <div className="text-sm text-gray-500">
                        {item.options.map((opt, idx) => (
                          <span key={opt.valueId}>
                            {opt.valueName}{idx < item.options!.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-xs text-gray-400 italic mt-1">
                        "{item.notes}"
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-semibold text-orange-600">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-gray-100 rounded-full">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 rounded-full p-0"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 rounded-full p-0"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                {index < cartItems.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Add More Items */}
        <Link href={`/r/${slug}`}>
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter d'autres articles
          </Button>
        </Link>

        {/* Delivery Info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Temps de livraison estimé</span>
              </div>
              <span className="font-medium">{restaurant.deliveryTime} min</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Frais de livraison</span>
              </div>
              <span className="font-medium">
                {deliveryFee > 0 ? formatPrice(deliveryFee) : 'Gratuit'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Résumé de la commande</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
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
            {!minOrderMet && (
              <div className="bg-orange-50 text-orange-700 text-sm p-3 rounded-lg mt-2">
                Minimum de commande: {formatPrice(restaurant.minOrderAmount)}. 
                Ajoutez {formatPrice(restaurant.minOrderAmount - subtotal)} de plus.
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
        <div className="max-w-2xl mx-auto">
          <Link href={`/r/${slug}/checkout`}>
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 h-14 text-lg"
              disabled={!minOrderMet}
            >
              Continuer • {formatPrice(total)}
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
