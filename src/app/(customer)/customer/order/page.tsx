'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  MapPin,
  Clock,
  CreditCard,
  Minus,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/lib/cart-store';
import { useRouter } from 'next/navigation';

const DELIVERY_FEE = 500;

export default function CustomerOrderPage() {
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway' | 'dinein'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState('orange_money');
  const [address, setAddress] = useState('Cocody, Riviera 2');
  const [phone, setPhone] = useState('+225 07 00 00 01');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { items, increaseQuantity, decreaseQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const { toast } = useToast();
  const router = useRouter();
  
  const subtotal = getTotal();
  const total = orderType === 'delivery' ? subtotal + DELIVERY_FEE : subtotal;

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      toast({
        title: 'Panier vide',
        description: 'Ajoutez des articles avant de commander',
        variant: 'destructive',
      });
      return;
    }

    if (orderType === 'delivery' && !address.trim()) {
      toast({
        title: 'Adresse requise',
        description: 'Veuillez entrer une adresse de livraison',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate order creation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Commande confirmée !',
      description: `Votre commande ORD-2024-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')} a été créée`,
    });
    
    clearCart();
    router.push('/customer/tracking');
  };

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Ma Commande</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Votre panier est vide</p>
            <p className="text-muted-foreground mb-4">
              Ajoutez des plats depuis le menu pour passer commande
            </p>
            <Link href="/customer/menu">
              <Button className="bg-orange-500 hover:bg-orange-600">
                Voir le menu
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ma Commandes</h1>

      {/* Cart Items */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Panier ({items.length} articles)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-2xl">
                {item.image || '🍽️'}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-orange-600">{item.price.toLocaleString()} FCFA</p>
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
                <span className="w-6 text-center font-semibold">{item.quantity}</span>
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
                className="text-red-500"
                onClick={() => {
                  removeItem(item.id);
                  toast({ title: 'Article supprimé', description: item.name });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Order Type */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Type de commande</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={orderType} onValueChange={(v) => setOrderType(v as typeof orderType)}>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <RadioGroupItem value="delivery" id="delivery" className="peer sr-only" />
                <Label
                  htmlFor="delivery"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500 cursor-pointer"
                >
                  <MapPin className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Livraison</span>
                  <span className="text-xs text-muted-foreground">+{DELIVERY_FEE} FCFA</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="takeaway" id="takeaway" className="peer sr-only" />
                <Label
                  htmlFor="takeaway"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500 cursor-pointer"
                >
                  <Clock className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">À emporter</span>
                  <span className="text-xs text-muted-foreground">15-20 min</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="dinein" id="dinein" className="peer sr-only" />
                <Label
                  htmlFor="dinein"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500 cursor-pointer"
                >
                  <span className="text-2xl mb-1">🍽️</span>
                  <span className="text-sm font-medium">Sur place</span>
                  <span className="text-xs text-muted-foreground">Table T5</span>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      {orderType === 'delivery' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Adresse de livraison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="address">Adresse</Label>
              <Input 
                id="address" 
                placeholder="Quartier, Rue, Numéro" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">Ville</Label>
                <Input id="city" defaultValue="Abidjan" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input 
                  id="phone" 
                  placeholder="+225" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Instructions de livraison</Label>
              <Input 
                id="notes" 
                placeholder="Près de la pharmacie, porte verte..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Livraison estimée: 25-35 min</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Mode de paiement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="grid gap-3">
              <div className="flex items-center space-x-3 border rounded-lg p-3 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50 dark:has-[:checked]:bg-orange-950/20">
                <RadioGroupItem value="orange_money" id="orange_money" />
                <Label htmlFor="orange_money" className="flex items-center gap-2 cursor-pointer flex-1">
                  <span className="text-2xl">🟠</span>
                  <div>
                    <p className="font-medium">Orange Money</p>
                    <p className="text-xs text-muted-foreground">Paiement instantané</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 border rounded-lg p-3 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50 dark:has-[:checked]:bg-orange-950/20">
                <RadioGroupItem value="mtn_momo" id="mtn_momo" />
                <Label htmlFor="mtn_momo" className="flex items-center gap-2 cursor-pointer flex-1">
                  <span className="text-2xl">🟡</span>
                  <div>
                    <p className="font-medium">MTN MoMo</p>
                    <p className="text-xs text-muted-foreground">Paiement instantané</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 border rounded-lg p-3 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50 dark:has-[:checked]:bg-orange-950/20">
                <RadioGroupItem value="wave" id="wave" />
                <Label htmlFor="wave" className="flex items-center gap-2 cursor-pointer flex-1">
                  <span className="text-2xl">🔵</span>
                  <div>
                    <p className="font-medium">Wave</p>
                    <p className="text-xs text-muted-foreground">Paiement instantané</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 border rounded-lg p-3 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50 dark:has-[:checked]:bg-orange-950/20">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                  <span className="text-2xl">💵</span>
                  <div>
                    <p className="font-medium">Espèces</p>
                    <p className="text-xs text-muted-foreground">Paiement à la livraison</p>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Récapitulatif</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span>{(item.price * item.quantity).toLocaleString()} FCFA</span>
              </div>
            ))}
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{subtotal.toLocaleString()} FCFA</span>
            </div>
            {orderType === 'delivery' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livraison</span>
                <span>{DELIVERY_FEE.toLocaleString()} FCFA</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-orange-600">{total.toLocaleString()} FCFA</span>
            </div>
          </div>

          <Button 
            className="w-full mt-4 bg-orange-500 hover:bg-orange-600" 
            size="lg"
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Traitement en cours...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmer la commande
              </>
            )}
          </Button>
          
          <Link href="/customer/menu">
            <Button variant="outline" className="w-full mt-2">
              Continuer les achats
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
