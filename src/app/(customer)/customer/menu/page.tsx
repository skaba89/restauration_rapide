'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Heart,
  Flame,
  Leaf,
  Clock,
  Plus,
  Minus,
  ChevronRight,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/lib/cart-store';
import { useCurrencySafe } from '@/lib/currency-context';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  isAvailable: boolean;
  preparationTime: number;
  isPopular: boolean;
  image?: string | null;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Plats': '🍽️',
  'Boissons': '🥤',
  'Accompagnements': '🥗',
  'Entrées': '🥗',
  'Desserts': '🍰',
};

export default function CustomerMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { items, addItem, increaseQuantity, decreaseQuantity, getItemCount, getTotal } = useCartStore();
  const { toast } = useToast();
  const { formatCurrency } = useCurrencySafe();

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/public/menu?availableOnly=true');
        const result = await response.json();
        
        if (result.success && result.data) {
          setMenuItems(result.data);
          
          // Extract unique categories
          const uniqueCategories = [...new Set(result.data.map((item: MenuItem) => item.category))];
          const categoryList = [
            { id: 'all', name: 'Tout', icon: '🍽️' },
            ...uniqueCategories.map((cat: string) => ({
              id: cat,
              name: cat,
              icon: CATEGORY_ICONS[cat] || '🍽️',
            })),
          ];
          setCategories(categoryList);
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger le menu',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMenu();
  }, [toast]);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getItemQuantity = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image || '🍽️',
      quantity: 1,
    });
    toast({
      title: 'Ajouté au panier',
      description: `${item.name} a été ajouté à votre panier`,
    });
  };

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
    const item = menuItems.find(i => i.id === itemId);
    toast({
      title: favorites.includes(itemId) ? 'Retiré des favoris' : 'Ajouté aux favoris',
      description: favorites.includes(itemId) 
        ? `${item?.name} a été retiré de vos favoris`
        : `${item?.name} a été ajouté à vos favoris`,
    });
  };

  const cartCount = getItemCount();
  const cartTotal = getTotal();

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menu</h1>
        <Link href="/customer/cart">
          <Badge className="bg-orange-500 hover:bg-orange-600 cursor-pointer">
            <ShoppingCart className="h-4 w-4 mr-1" />
            {cartCount} article{cartCount > 1 ? 's' : ''}
          </Badge>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un plat..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories */}
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              className={`flex-shrink-0 ${selectedCategory === cat.id ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.name}
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Aucun article trouvé</p>
          </CardContent>
        </Card>
      ) : (
        /* Menu Items */
        <div className="grid gap-4">
          {filteredItems.map(item => {
            const quantity = getItemQuantity(item.id);
            const isFavorite = favorites.includes(item.id);
            
            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-4xl flex-shrink-0">
                      {item.image || CATEGORY_ICONS[item.category] || '🍽️'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{item.name}</h3>
                            {item.isPopular && (
                              <Badge variant="secondary" className="text-xs">
                                <Flame className="h-3 w-3 mr-1 text-orange-500" />
                                Populaire
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`flex-shrink-0 ${isFavorite ? 'text-red-500' : ''}`}
                          onClick={() => toggleFavorite(item.id)}
                        >
                          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500' : ''}`} />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-orange-600">{formatCurrency(item.price)}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {item.preparationTime} min
                          </div>
                        </div>

                        {/* Add/Remove buttons */}
                        {quantity > 0 ? (
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => decreaseQuantity(item.id)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-bold w-6 text-center">{quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => increaseQuantity(item.id)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            className="bg-orange-500 hover:bg-orange-600" 
                            onClick={() => handleAddToCart(item)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Ajouter
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cart Summary - Fixed at bottom */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white dark:bg-gray-950 border-t p-4 shadow-lg z-50">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div>
              <p className="font-semibold">{cartCount} article{cartCount > 1 ? 's' : ''}</p>
              <p className="text-orange-600 font-bold">{formatCurrency(cartTotal)}</p>
            </div>
            <Link href="/customer/cart">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Voir le panier
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
