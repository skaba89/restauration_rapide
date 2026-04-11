'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Trash2, Star, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/lib/cart-store';

const FAVORITES_DATA = [
  { id: '1', name: 'Attieké Poisson Grillé', price: 3500, image: '🐟', rating: 4.8, orders: 156, description: 'Semoule de manioc avec poisson grillé' },
  { id: '2', name: 'Kedjenou de Poulet', price: 4500, image: '🍗', rating: 4.9, orders: 142, description: 'Poulet braisé aux légumes' },
  { id: '3', name: 'Jus de Bissap', price: 1000, image: '🧃', rating: 4.7, orders: 89, description: 'Jus naturel d\'hibiscus' },
  { id: '4', name: 'Poulet Braisé', price: 3500, image: '🍗', rating: 4.8, orders: 120, description: 'Poulet grillé mariné aux épices' },
  { id: '5', name: 'Alloco', price: 1500, image: '🍌', rating: 4.6, orders: 95, description: 'Banane plantain frite' },
];

export default function CustomerFavoritesPage() {
  const [favorites, setFavorites] = useState(FAVORITES_DATA);
  const [cartItems, setCartItems] = useState<{ [key: string]: number }>({});
  const { addItem, increaseQuantity, decreaseQuantity, items } = useCartStore();
  const { toast } = useToast();

  const removeFavorite = (id: string) => {
    const item = favorites.find(f => f.id === id);
    setFavorites(prev => prev.filter(f => f.id !== id));
    toast({ 
      title: 'Retiré des favoris', 
      description: `${item?.name} a été retiré de vos favoris` 
    });
  };

  const addToCart = (item: typeof FAVORITES_DATA[0]) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
    setCartItems(prev => ({ ...prev, [item.id]: 1 }));
    toast({ 
      title: 'Ajouté au panier', 
      description: `${item.name} a été ajouté à votre panier` 
    });
  };

  const getItemQuantity = (id: string) => {
    const cartItem = items.find(i => i.id === id);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleIncrease = (item: typeof FAVORITES_DATA[0]) => {
    const qty = getItemQuantity(item.id);
    if (qty === 0) {
      addToCart(item);
    } else {
      increaseQuantity(item.id);
    }
  };

  const handleDecrease = (id: string) => {
    decreaseQuantity(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes Favoris</h1>
        <Badge variant="outline">{favorites.length} article{favorites.length > 1 ? 's' : ''}</Badge>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun favori pour le moment</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ajoutez des plats à vos favoris pour les retrouver facilement
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {favorites.map(item => {
            const quantity = getItemQuantity(item.id);
            
            return (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-4xl">
                      {item.image}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                              {item.rating}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{item.orders} commandes</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeFavorite(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="font-bold text-orange-600">{item.price.toLocaleString()} FCFA</p>
                        {quantity > 0 ? (
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleDecrease(item.id)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-bold w-6 text-center">{quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleIncrease(item)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            className="bg-orange-500 hover:bg-orange-600"
                            onClick={() => addToCart(item)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Commander
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
    </div>
  );
}
