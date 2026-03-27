'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  MapPin,
  Clock,
  CreditCard,
  Smartphone,
  Banknote,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/lib/cart-store';
import { useRouter } from 'next/navigation';

const DELIVERY_FEE = 500;

export default function CartPage() {
  const { items, removeItem, increaseQuantity, decreaseQuantity, clearCart, getTotal } = useCartStore();
  const [address, setAddress] = useState('Cocody, Riviera 2');
  const [notes, setNotes] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const subtotal = getTotal();
  const total = subtotal + (subtotal > 0 ? DELIVERY_FEE : 0);

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: 'Panier vide',
        description: 'Ajoutez des articles avant de commander',
        variant: 'destructive',
      });
      return;
    }
    if (!selectedPayment) {
      toast({
        title: 'Mode de paiement requis',
        description: 'Veuillez sélectionner un mode de paiement',
        variant: 'destructive',
      });
      return;
    }
    toast({ 
      title: 'Commande créée !', 
      description: 'Redirection vers le paiement...' 
    });
    router.push('/customer/order');
  };

  const handleClearCart = () => {
    clearCart();
    toast({ title: 'Panier vidé', description: 'Tous les articles ont été supprimés' });
  };

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Mon Panier</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Votre panier est vide</p>
            <p className="text-muted-foreground mb-4">
              Ajoutez des plats délicieux pour commencer
            </p>
            <Link href="/customer/menu">
              <Button className="bg-orange-500 hover:bg-orange-600">
                Voir le menu
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mon Panier</h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleClearCart}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Vider le panier
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Articles ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-3xl">
                      {item.image || '🍽️'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-orange-600 font-semibold">{item.price.toLocaleString()} FCFA</p>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => decreaseQuantity(item.id)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => increaseQuantity(item.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="font-bold w-24 text-right">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-600" 
                      onClick={() => {
                        removeItem(item.id);
                        toast({ title: 'Article supprimé', description: item.name });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adresse de livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Quartier, Rue, Numéro"
              />
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instructions de livraison (optionnel)"
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Livraison estimée: 25-35 min</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{(item.price * item.quantity).toLocaleString()} FCFA</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{subtotal.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Livraison</span>
                  <span>{subtotal > 0 ? DELIVERY_FEE.toLocaleString() : 0} FCFA</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-orange-600">{total.toLocaleString()} FCFA</span>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Mode de paiement</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={selectedPayment === 'orange_money' ? 'default' : 'outline'} 
                    size="sm" 
                    className={`justify-start ${selectedPayment === 'orange_money' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                    onClick={() => setSelectedPayment('orange_money')}
                  >
                    <Smartphone className="h-4 w-4 mr-2 text-orange-500" />
                    Orange Money
                  </Button>
                  <Button 
                    variant={selectedPayment === 'mtn_momo' ? 'default' : 'outline'} 
                    size="sm" 
                    className={`justify-start ${selectedPayment === 'mtn_momo' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                    onClick={() => setSelectedPayment('mtn_momo')}
                  >
                    <Smartphone className="h-4 w-4 mr-2 text-yellow-500" />
                    MTN MoMo
                  </Button>
                  <Button 
                    variant={selectedPayment === 'wave' ? 'default' : 'outline'} 
                    size="sm" 
                    className={`justify-start ${selectedPayment === 'wave' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                    onClick={() => setSelectedPayment('wave')}
                  >
                    <Smartphone className="h-4 w-4 mr-2 text-cyan-500" />
                    Wave
                  </Button>
                  <Button 
                    variant={selectedPayment === 'cash' ? 'default' : 'outline'} 
                    size="sm" 
                    className={`justify-start ${selectedPayment === 'cash' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                    onClick={() => setSelectedPayment('cash')}
                  >
                    <Banknote className="h-4 w-4 mr-2 text-green-500" />
                    Espèces
                  </Button>
                </div>
              </div>

              {!selectedPayment && items.length > 0 && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Sélectionnez un mode de paiement</span>
                </div>
              )}

              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600" 
                size="lg" 
                onClick={handleCheckout}
                disabled={items.length === 0}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Commander {total.toLocaleString()} FCFA
              </Button>

              <Link href="/customer/menu">
                <Button variant="outline" className="w-full">
                  Continuer les achats
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
