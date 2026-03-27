'use client';

import { useState } from 'react';
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

const CATEGORIES = [
  { id: 'all', name: 'Tout', icon: '🍽️' },
  { id: 'plats', name: 'Plats Principaux', icon: '🍚' },
  { id: 'grillades', name: 'Grillades', icon: '🍖' },
  { id: 'accompagnements', name: 'Accompagnements', icon: '🥗' },
  { id: 'boissons', name: 'Boissons', icon: '🥤' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' },
];

const MENU_ITEMS = [
  { id: '1', name: 'Attieké Poisson Grillé', description: 'Semoule de manioc accompagnée de poisson grillé et sauce tomate', price: 3500, category: 'plats', image: '🐟', popular: true, spicy: false, vegetarian: false, prepTime: 20 },
  { id: '2', name: 'Kedjenou de Poulet', description: 'Poulet braisé aux légumes dans une sauce épaisse', price: 4500, category: 'plats', image: '🍗', popular: true, spicy: false, vegetarian: false, prepTime: 25 },
  { id: '3', name: 'Thiéboudienne', description: 'Riz au poisson et légumes, plat national sénégalais', price: 4000, category: 'plats', image: '🍚', popular: true, spicy: false, vegetarian: false, prepTime: 30 },
  { id: '4', name: 'Garba', description: 'Attieké avec poisson frit et piment', price: 2500, category: 'plats', image: '🐟', popular: true, spicy: true, vegetarian: false, prepTime: 15 },
  { id: '5', name: 'Foutou Banane', description: 'Pâte de banane plantain avec sauce graine', price: 3500, category: 'plats', image: '🍌', popular: false, spicy: false, vegetarian: true, prepTime: 20 },
  { id: '6', name: 'Riz Gras', description: 'Riz à la viande et légumes', price: 3000, category: 'plats', image: '🍚', popular: false, spicy: false, vegetarian: false, prepTime: 15 },
  { id: '7', name: 'Poulet Braisé', description: 'Poulet grillé mariné aux épices', price: 3500, category: 'grillades', image: '🍗', popular: true, spicy: false, vegetarian: false, prepTime: 20 },
  { id: '8', name: 'Suya', description: 'Brochettes de viande épicées grillées', price: 2000, category: 'grillades', image: '🍢', popular: true, spicy: true, vegetarian: false, prepTime: 15 },
  { id: '9', name: 'Brochettes de Poisson', description: 'Poisson grillé en brochettes', price: 3000, category: 'grillades', image: '🐟', popular: false, spicy: false, vegetarian: false, prepTime: 15 },
  { id: '10', name: 'Alloco', description: 'Banane plantain frite', price: 1500, category: 'accompagnements', image: '🍌', popular: true, spicy: false, vegetarian: true, prepTime: 10 },
  { id: '11', name: 'Jus de Bissap', description: 'Jus naturel d\'hibiscus', price: 1000, category: 'boissons', image: '🧃', popular: true, spicy: false, vegetarian: true, prepTime: 5 },
  { id: '12', name: 'Jus de Gingembre', description: 'Jus de gingembre frais', price: 1000, category: 'boissons', image: '🧃', popular: false, spicy: false, vegetarian: true, prepTime: 5 },
  { id: '13', name: 'Café Touba', description: 'Café épicé sénégalais', price: 800, category: 'boissons', image: '☕', popular: false, spicy: false, vegetarian: true, prepTime: 5 },
  { id: '14', name: 'Banane Flambée', description: 'Banane plantain flambée au rhum', price: 2000, category: 'desserts', image: '🍌', popular: false, spicy: false, vegetarian: true, prepTime: 10 },
];

export default function CustomerMenuPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const { items, addItem, increaseQuantity, decreaseQuantity, getItemCount, getTotal } = useCartStore();
  const { toast } = useToast();

  const filteredItems = MENU_ITEMS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getItemQuantity = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (item: typeof MENU_ITEMS[0]) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
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
    const item = MENU_ITEMS.find(i => i.id === itemId);
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
          {CATEGORIES.map(cat => (
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

      {/* Menu Items */}
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
                    {item.image}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{item.name}</h3>
                          {item.popular && (
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
                        <p className="font-bold text-orange-600">{item.price.toLocaleString()} FCFA</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {item.prepTime} min
                        </div>
                        {item.vegetarian && (
                          <Badge variant="outline" className="text-xs">
                            <Leaf className="h-3 w-3 mr-1 text-green-500" />
                            Végétarien
                          </Badge>
                        )}
                        {item.spicy && (
                          <Badge variant="outline" className="text-xs text-red-500">
                            🌶️ Épicé
                          </Badge>
                        )}
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

      {/* Cart Summary - Fixed at bottom */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white dark:bg-gray-950 border-t p-4 shadow-lg z-50">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div>
              <p className="font-semibold">{cartCount} article{cartCount > 1 ? 's' : ''}</p>
              <p className="text-orange-600 font-bold">{cartTotal.toLocaleString()} FCFA</p>
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
