'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MENU_CATEGORIES = [
  { id: 'all', name: 'Tout' },
  { id: 'plats', name: 'Plats' },
  { id: 'grillades', name: 'Grillades' },
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
  { id: '9', name: 'Bissap', price: 500, category: 'boissons', popular: true },
  { id: '10', name: 'Gingembre', price: 500, category: 'boissons' },
  { id: '11', name: 'Coca-Cola', price: 600, category: 'boissons' },
  { id: '12', name: 'Jus Mangue', price: 1000, category: 'boissons', popular: true },
  { id: '13', name: 'Banane Flamboyante', price: 2000, category: 'desserts' },
  { id: '14', name: 'Fruits de Saison', price: 1500, category: 'desserts' },
  { id: '15', name: 'Glace Vanille', price: 1200, category: 'desserts' },
];

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const PAYMENT_METHODS = [
  { id: 'orange', name: 'Orange Money', color: 'bg-orange-500' },
  { id: 'mtn', name: 'MTN MoMo', color: 'bg-yellow-500' },
  { id: 'wave', name: 'Wave', color: 'bg-cyan-500' },
  { id: 'cash', name: 'Espèces', color: 'bg-green-500' },
  { id: 'card', name: 'Carte', color: 'bg-blue-500' },
];

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
    setSelectedPayment(null);
  };

  const handlePayment = async () => {
    if (!selectedPayment) {
      toast({ title: 'Erreur', description: 'Sélectionnez un mode de paiement', variant: 'destructive' });
      return;
    }
    if (cart.length === 0) {
      toast({ title: 'Erreur', description: 'Le panier est vide', variant: 'destructive' });
      return;
    }
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    toast({ title: 'Paiement réussi !', description: `Commande ${orderNumber} enregistrée` });
    clearCart();
    setIsProcessing(false);
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
              <Button key={cat.id} variant={selectedCategory === cat.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(cat.id)} className="flex-shrink-0">
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

        <div className="p-4 border-b">
          <Input placeholder="Nom client" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
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

          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <Button key={method.id} variant={selectedPayment === method.id ? 'default' : 'outline'} size="sm" className={`flex flex-col h-auto py-2 ${selectedPayment === method.id ? 'bg-orange-500 hover:bg-orange-600' : ''}`} onClick={() => setSelectedPayment(method.id)}>
                <Smartphone className="h-4 w-4 mb-1" />
                <span className="text-xs">{method.name}</span>
              </Button>
            ))}
          </div>

          <Button size="lg" className="w-full bg-orange-500 hover:bg-orange-600" disabled={cart.length === 0 || isProcessing} onClick={handlePayment}>
            {isProcessing ? 'Traitement...' : (<><Check className="h-5 w-5 mr-2" />Payer {total.toLocaleString()} FCFA</>)}
          </Button>
        </div>
      </div>
    </div>
  );
}
