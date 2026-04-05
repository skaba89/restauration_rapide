'use client';

import { useState, useCallback } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { useCurrencySafe } from '@/lib/currency-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  ArrowRight,
  ChefHat,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CartDrawerProps {
  restaurantSlug: string;
  minOrder?: number;
  deliveryFee?: number;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function CartDrawer({
  restaurantSlug,
  minOrder = 0,
  deliveryFee = 0,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
  trigger,
}: CartDrawerProps) {
  const router = useRouter();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnOpenChange || setInternalIsOpen;

  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  } = useCartStore();

  const { formatCurrency } = useCurrencySafe();

  const total = getTotal();
  const count = getItemCount();
  const canOrder = total >= minOrder;

  const handleQuantityChange = useCallback((id: string, delta: number) => {
    const item = items.find(i => i.id === id);
    if (item) {
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        removeItem(id);
        toast.info('Article retiré du panier');
      } else {
        updateQuantity(id, newQty);
      }
    }
  }, [items, removeItem, updateQuantity]);

  const handleRemove = useCallback((id: string, name: string) => {
    removeItem(id);
    toast.success(`${name} retiré du panier`);
  }, [removeItem]);

  const handleClearCart = useCallback(() => {
    clearCart();
    toast.success('Panier vidé');
  }, [clearCart]);

  const handleCheckout = useCallback(() => {
    if (!canOrder) {
      toast.error(`Minimum de commande: ${formatCurrency(minOrder)}`);
      return;
    }
    setIsOpen(false);
    router.push(`/menu/${restaurantSlug}/checkout`);
  }, [canOrder, minOrder, formatCurrency, setIsOpen, router, restaurantSlug]);

  const triggerElement = trigger || (
    <Button
      variant="outline"
      size="icon"
      className="relative h-10 w-10 rounded-full"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-orange-500 text-white text-xs">
          {count}
        </Badge>
      )}
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {triggerElement}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="p-4 border-b bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <ShoppingCart className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <SheetTitle className="text-lg">Votre Panier</SheetTitle>
                <SheetDescription>
                  {count} article{count > 1 ? 's' : ''} • {formatCurrency(total)}
                </SheetDescription>
              </div>
            </div>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCart}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Vider
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ChefHat className="h-12 w-12 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Panier vide</h3>
              <p className="text-gray-500 mt-1">
                Ajoutez des articles pour commencer
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsOpen(false)}
              >
                Voir le menu
              </Button>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              <div className="divide-y">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-4"
                  >
                    <div className="flex gap-3">
                      {/* Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🍽️
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(item.price)} / unité
                        </p>

                        {/* Notes */}
                        <Input
                          placeholder="Note (optionnel)"
                          value={notes[item.id] || item.notes || ''}
                          onChange={(e) => setNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="mt-2 h-8 text-sm"
                        />
                      </div>

                      {/* Quantity & Remove */}
                      <div className="flex flex-col items-end justify-between">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-500"
                          onClick={() => handleRemove(item.id, item.name)}
                        >
                          <X className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => handleQuantityChange(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center font-medium text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full bg-orange-500 text-white hover:bg-orange-600"
                            onClick={() => handleQuantityChange(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className="text-gray-500">Sous-total</span>
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 bg-white">
            {/* Summary */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Livraison estimée</span>
                  <span>{formatCurrency(deliveryFee)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total estimé</span>
                <span className="text-orange-600">
                  {formatCurrency(total + deliveryFee)}
                </span>
              </div>
            </div>

            {/* Min order warning */}
            {!canOrder && (
              <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                <Clock className="h-4 w-4 text-amber-600" />
                <p className="text-sm text-amber-700">
                  Minimum: {formatCurrency(minOrder)} (reste {formatCurrency(minOrder - total)})
                </p>
              </div>
            )}

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={!canOrder}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold"
            >
              Commander • {formatCurrency(total + deliveryFee)}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Floating Cart Button Component
export function FloatingCartButton({
  restaurantSlug,
  minOrder = 0,
  deliveryFee = 0,
}: Omit<CartDrawerProps, 'isOpen' | 'onOpenChange' | 'trigger'>) {
  const [isOpen, setIsOpen] = useState(false);
  const { getItemCount, getTotal } = useCartStore();
  const { formatCurrency } = useCurrencySafe();

  const count = getItemCount();
  const total = getTotal();

  if (count === 0) return null;

  return (
    <>
      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:hidden bg-white border-t shadow-lg">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Voir le panier • {count} article{count > 1 ? 's' : ''}
          <span className="ml-auto">{formatCurrency(total + deliveryFee)}</span>
        </Button>
      </div>

      {/* Desktop Floating Button */}
      <div className="hidden sm:block fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-16 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-xl rounded-full"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          <span className="mr-3">Panier ({count})</span>
          <Badge className="bg-white/20 text-white px-2 py-1">
            {formatCurrency(total + deliveryFee)}
          </Badge>
        </Button>
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        restaurantSlug={restaurantSlug}
        minOrder={minOrder}
        deliveryFee={deliveryFee}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
}
