'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Smartphone,
  Banknote,
  Check,
  UtensilsCrossed,
  Star,
  Printer,
  X,
  DollarSign,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MENU_CATEGORIES = [
  { id: 'all', name: 'Tout' },
  { id: 'plats', name: 'Plats' },
  { id: 'grillades', name: 'Grillades' },
  { id: 'accompagnements', name: 'Accompagnements' },
  { id: 'boissons', name: 'Boissons' },
  { id: 'desserts', name: 'Desserts' },
];

const MENU_ITEMS = [
  { id: '1', name: 'Attiéké Poisson', price: 3500, category: 'plats', popular: true },
  { id: '2', name: 'Alloco Poisson', price: 2500, category: 'plats' },
  { id: '3', name: 'Riz Gras', price: 3000, category: 'plats' },
  { id: '4', name: 'Foutou Banane', price: 4000, category: 'plats', popular: true },
  { id: '5', name: 'Jollof Rice', price: 3500, category: 'plats', popular: true },
  { id: '6', name: 'Poisson Braisé', price: 5000, category: 'grillades', popular: true },
  { id: '7', name: 'Brochette Bœuf', price: 2500, category: 'grillades' },
  { id: '8', name: 'Poulet Braisé', price: 4000, category: 'grillades', popular: true },
  { id: '9', name: 'Attiéké', price: 1000, category: 'accompagnements' },
  { id: '10', name: 'Alloco', price: 1000, category: 'accompagnements' },
  { id: '11', name: 'Riz Blanc', price: 800, category: 'accompagnements' },
  { id: '12', name: 'Bissap', price: 500, category: 'boissons', popular: true },
  { id: '13', name: 'Gingembre', price: 500, category: 'boissons' },
  { id: '14', name: 'Coca-Cola', price: 600, category: 'boissons' },
  { id: '15', name: 'Jus Mangue', price: 1000, category: 'boissons', popular: true },
  { id: '16', name: 'Banane Flamboyante', price: 2000, category: 'desserts' },
  { id: '17', name: 'Fruits de Saison', price: 1500, category: 'desserts' },
  { id: '18', name: 'Glace Vanille', price: 1200, category: 'desserts' },
];

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const PAYMENT_METHODS = [
  { id: 'orange', name: 'Orange Money', icon: Smartphone, color: 'bg-orange-500' },
  { id: 'mtn', name: 'MTN MoMo', icon: Smartphone, color: 'bg-yellow-500' },
  { id: 'wave', name: 'Wave', icon: Smartphone, color: 'bg-cyan-500' },
  { id: 'cash', name: 'Espèces', icon: Banknote, color: 'bg-green-500' },
  { id: 'card', name: 'Carte', icon: CreditCard, color: 'bg-blue-500' },
];

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const { toast } = useToast();

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const total = subtotal;

  const change = useMemo(() => {
    const received = parseFloat(cashReceived) || 0;
    return received - total;
  }, [cashReceived, total]);

  const addToCart = (item: typeof MENU_ITEMS[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
    toast({ title: 'Article ajouté', description: `${item.name} ajouté au panier` });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty <= 0 ? null : { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setSelectedPayment(null);
    setCashReceived('');
    setOrderComplete(false);
    setOrderNumber('');
  };

  const openPaymentModal = () => {
    if (cart.length === 0) {
      toast({ title: 'Erreur', description: 'Le panier est vide', variant: 'destructive' });
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPayment) {
      toast({ title: 'Erreur', description: 'Sélectionnez un mode de paiement', variant: 'destructive' });
      return;
    }

    // For cash payment, check if amount is sufficient
    if (selectedPayment === 'cash') {
      const received = parseFloat(cashReceived) || 0;
      if (received < total) {
        toast({ title: 'Erreur', description: 'Le montant reçu est insuffisant', variant: 'destructive' });
        return;
      }
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newOrderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    setOrderNumber(newOrderNumber);
    setOrderComplete(true);
    setIsProcessing(false);
    
    toast({ title: 'Paiement réussi !', description: `Commande ${newOrderNumber} enregistrée` });
  };

  const printReceipt = () => {
    window.print();
  };

  const closeAndReset = () => {
    setShowPaymentModal(false);
    clearCart();
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col lg:flex-row gap-4">
      {/* Left Panel - Menu */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="space-y-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un article..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {MENU_CATEGORIES.map((cat) => (
              <Button key={cat.id} variant={selectedCategory === cat.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(cat.id)} className={`flex-shrink-0 ${selectedCategory === cat.id ? 'bg-orange-500 hover:bg-orange-600' : ''}`}>
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow active:scale-95" onClick={() => addToCart(item)}>
                <CardContent className="p-3">
                  <div className="aspect-square bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950 dark:to-amber-950 rounded-lg mb-2 flex items-center justify-center">
                    <UtensilsCrossed className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="flex items-start justify-between gap-1">
                    <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                    {item.popular && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                  </div>
                  <p className="text-orange-600 font-semibold mt-1">{item.price.toLocaleString()} FCFA</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-gray-950 rounded-lg border">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <h2 className="font-semibold">Panier</h2>
              {cart.length > 0 && <Badge variant="secondary">{cart.length}</Badge>}
            </div>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart}>Vider</Button>
            )}
          </div>
        </div>

        <div className="p-4 border-b space-y-2">
          <Input placeholder="Nom client" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <Input placeholder="Téléphone (optionnel)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
        </div>

        <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-center">Panier vide</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-sm text-orange-600">{item.price.toLocaleString()} FCFA</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeFromCart(item.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t space-y-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-orange-600">{total.toLocaleString()} FCFA</span>
          </div>

          <Button size="lg" className="w-full bg-orange-500 hover:bg-orange-600" disabled={cart.length === 0} onClick={openPaymentModal}>
            <DollarSign className="h-5 w-5 mr-2" />
            Paiement
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          {!orderComplete ? (
            <>
              <DialogHeader>
                <DialogTitle>Paiement</DialogTitle>
                <DialogDescription>
                  Total à payer: <span className="font-bold text-orange-600">{total.toLocaleString()} FCFA</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Order Summary */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 max-h-40 overflow-auto">
                  <p className="text-sm font-medium mb-2">Récapitulatif</p>
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{(item.price * item.quantity).toLocaleString()} FCFA</span>
                    </div>
                  ))}
                </div>

                {/* Payment Methods */}
                <div>
                  <p className="text-sm font-medium mb-2">Mode de paiement</p>
                  <div className="grid grid-cols-3 gap-2">
                    {PAYMENT_METHODS.map((method) => (
                      <Button
                        key={method.id}
                        variant={selectedPayment === method.id ? 'default' : 'outline'}
                        size="sm"
                        className={`flex flex-col h-auto py-2 ${selectedPayment === method.id ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                        onClick={() => setSelectedPayment(method.id)}
                      >
                        <method.icon className="h-4 w-4 mb-1" />
                        <span className="text-xs">{method.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Cash Payment - Amount Input */}
                {selectedPayment === 'cash' && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Montant reçu (FCFA)</p>
                      <Input
                        type="number"
                        placeholder="Entrez le montant reçu"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className="text-lg"
                      />
                    </div>

                    {/* Quick amounts */}
                    <div className="flex gap-2 flex-wrap">
                      {[total, total + 500, total + 1000, total + 2000, total + 5000].map((amount, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => setCashReceived(amount.toString())}
                        >
                          {Math.ceil(amount / 500) * 500 >= total ? Math.ceil(amount / 500) * 500 : amount + 500} FCFA
                        </Button>
                      ))}
                    </div>

                    {/* Change calculation */}
                    {parseFloat(cashReceived) >= total && (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-green-700 dark:text-green-400 font-medium">Monnaie à rendre</span>
                          <span className="text-2xl font-bold text-green-600">{change.toLocaleString()} FCFA</span>
                        </div>
                      </div>
                    )}

                    {parseFloat(cashReceived) > 0 && parseFloat(cashReceived) < total && (
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-red-700 dark:text-red-400 font-medium">Montant manquant</span>
                          <span className="text-xl font-bold text-red-600">{Math.abs(change).toLocaleString()} FCFA</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile Money - Phone Input */}
                {['orange', 'mtn', 'wave'].includes(selectedPayment || '') && (
                  <div>
                    <p className="text-sm font-medium mb-2">Numéro de téléphone</p>
                    <Input
                      type="tel"
                      placeholder="07 00 00 00 00"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Un code de validation sera envoyé
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPaymentModal(false)}>Annuler</Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={!selectedPayment || isProcessing || (selectedPayment === 'cash' && parseFloat(cashReceived) < total)}
                  onClick={handlePayment}
                >
                  {isProcessing ? 'Traitement...' : 'Confirmer le paiement'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-green-600 flex items-center gap-2">
                  <Check className="h-6 w-6" />
                  Paiement réussi !
                </DialogTitle>
              </DialogHeader>

              {/* Receipt */}
              <div className="border rounded-lg p-4 bg-white dark:bg-gray-900" id="receipt">
                <div className="text-center border-b pb-3 mb-3">
                  <h3 className="font-bold text-lg">Le Petit Maquis</h3>
                  <p className="text-sm text-muted-foreground">Cocody, Abidjan</p>
                  <p className="text-sm text-muted-foreground">Tél: +225 07 00 00 00 00</p>
                </div>

                <div className="text-sm space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span>Commande:</span>
                    <span className="font-bold">{orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date().toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heure:</span>
                    <span>{new Date().toLocaleTimeString('fr-FR')}</span>
                  </div>
                  {customerName && (
                    <div className="flex justify-between">
                      <span>Client:</span>
                      <span>{customerName}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-b py-3 mb-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{total.toLocaleString()} FCFA</span>
                  </div>
                  {selectedPayment === 'cash' && parseFloat(cashReceived) > total && (
                    <>
                      <div className="flex justify-between">
                        <span>Reçu</span>
                        <span>{parseFloat(cashReceived).toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex justify-between text-green-600 font-bold">
                        <span>Monnaie rendue</span>
                        <span>{change.toLocaleString()} FCFA</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="text-center mt-4 pt-3 border-t text-xs text-muted-foreground">
                  <p>Merci de votre visite !</p>
                  <p>À bientôt</p>
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={printReceipt}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={closeAndReset}>
                  Nouvelle commande
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
