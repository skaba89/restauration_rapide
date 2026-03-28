'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  ShoppingCart, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  ChevronDown, 
  Plus, 
  Minus,
  Leaf,
  Flame,
  Check,
  Search,
  X,
  Utensils,
  Package,
  Bike,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useRestaurantCartStore, CartMenuItem } from '@/lib/restaurant-cart-store';
import { formatCurrency, CURRENCIES } from '@/lib/currency';

// Types
interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  price: number;
  discountPrice?: number;
  isFeatured: boolean;
  isPopular: boolean;
  isNew: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isHalal: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  spicyLevel: number;
  prepTime?: number;
  calories?: number;
  rating: number;
  reviewCount: number;
  variants?: Array<{
    id: string;
    name: string;
    price: number;
    isDefault: boolean;
  }>;
  options?: Array<{
    id: string;
    name: string;
    required: boolean;
    multiSelect: boolean;
    maxSelect?: number;
    values: Array<{
      id: string;
      name: string;
      price: number;
      isDefault: boolean;
    }>;
  }>;
}

interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  items: MenuItem[];
}

interface Menu {
  id: string;
  name: string;
  slug: string;
  description?: string;
  menuType: string;
  categories: MenuCategory[];
}

interface RestaurantData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  district?: string;
  deliveryFee: number;
  minOrderAmount: number;
  deliveryTime: number;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  acceptsDelivery: boolean;
  acceptsTakeaway: boolean;
  acceptsDineIn: boolean;
  currency: string;
  menus: Menu[];
  hours: Array<{
    dayOfWeek: number;
    openTime?: string;
    closeTime?: string;
    isClosed: boolean;
  }>;
}

// Fetch restaurant data
async function fetchRestaurant(slug: string): Promise<RestaurantData> {
  const response = await fetch(`/api/public/restaurant/${slug}`);
  if (!response.ok) {
    throw new Error('Restaurant non trouvé');
  }
  const data = await response.json();
  return data.data;
}

export default function RestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [itemNotes, setItemNotes] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  
  // Cart store
  const { 
    items: cartItems, 
    addItem, 
    removeItem, 
    updateQuantity, 
    clearCart,
    getSubtotal,
    getTotalItems,
    setRestaurant
  } = useRestaurantCartStore();

  // Fetch restaurant data
  const { data: restaurant, isLoading, error } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: () => fetchRestaurant(slug),
  });

  // Set restaurant in cart store
  useEffect(() => {
    if (restaurant) {
      setRestaurant(restaurant.id, restaurant.slug);
    }
  }, [restaurant, setRestaurant]);

  // Get all categories from all menus
  const allCategories = restaurant?.menus.flatMap(menu => menu.categories) || [];
  
  // Filter items by search
  const filteredCategories = allCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.items.length > 0);

  // Currency formatting
  const formatPrice = (price: number) => {
    return formatCurrency(price, restaurant?.currency || 'GNF');
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!selectedItem) return;
    
    const variant = selectedItem.variants?.find(v => v.id === selectedVariant);
    const optionsList = Object.entries(selectedOptions).flatMap(([optionId, valueIds]) =>
      valueIds.map(valueId => {
        const option = selectedItem.options?.find(o => o.id === optionId);
        const value = option?.values.find(v => v.id === valueId);
        return value ? {
          optionId,
          optionName: option.name,
          valueId,
          valueName: value.name,
          price: value.price,
        } : null;
      }).filter(Boolean)
    ).filter(Boolean) as CartMenuItem['options'];

    const cartItem: CartMenuItem = {
      id: selectedItem.id,
      name: selectedItem.name,
      price: variant?.price ?? selectedItem.price,
      image: selectedItem.image,
      quantity: itemQuantity,
      notes: itemNotes || undefined,
      variantId: selectedVariant || undefined,
      variantName: variant?.name,
      options: optionsList,
    };

    addItem(cartItem, restaurant!.id, restaurant!.slug);
    
    // Reset and close
    setSelectedItem(null);
    setSelectedVariant('');
    setSelectedOptions({});
    setItemNotes('');
    setItemQuantity(1);
    setIsItemModalOpen(false);
  };

  // Calculate option price
  const getOptionsPrice = () => {
    if (!selectedItem) return 0;
    return Object.entries(selectedOptions).flatMap(([optionId, valueIds]) =>
      valueIds.map(valueId => {
        const option = selectedItem.options?.find(o => o.id === optionId);
        const value = option?.values.find(v => v.id === valueId);
        return value?.price || 0;
      })
    ).reduce((sum, price) => sum + price, 0);
  };

  // Get variant price
  const getVariantPrice = () => {
    if (!selectedItem) return selectedItem?.price || 0;
    const variant = selectedItem.variants?.find(v => v.id === selectedVariant);
    return variant?.price ?? selectedItem.price;
  };

  // Calculate item total
  const calculateItemTotal = () => {
    return (getVariantPrice() + getOptionsPrice()) * itemQuantity;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du menu...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-red-500 mb-4">Restaurant non trouvé</p>
          <Link href="/">
            <Button>Retour à l'accueil</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {restaurant.logo ? (
              <img 
                src={restaurant.logo} 
                alt={restaurant.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                {restaurant.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="font-bold text-lg text-gray-900">{restaurant.name}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Badge variant={restaurant.isOpen ? "default" : "secondary"} className="text-xs">
                  {restaurant.isOpen ? 'Ouvert' : 'Fermé'}
                </Badge>
                {restaurant.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {restaurant.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            {/* Cart Button */}
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button className="relative bg-orange-500 hover:bg-orange-600">
                  <ShoppingCart className="h-5 w-5" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Votre Panier</SheetTitle>
                </SheetHeader>
                <CartContent
                  cartItems={cartItems}
                  formatPrice={formatPrice}
                  updateQuantity={updateQuantity}
                  removeItem={removeItem}
                  clearCart={clearCart}
                  getSubtotal={getSubtotal}
                  restaurant={restaurant}
                  slug={slug}
                  onClose={() => setIsCartOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className="sm:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {restaurant.coverImage && (
        <div className="relative h-48 sm:h-64 bg-gray-200">
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Restaurant Info */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{restaurant.address}, {restaurant.city}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              <span>{restaurant.phone}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{restaurant.deliveryTime} min</span>
            </div>
            {restaurant.acceptsDelivery && (
              <div className="flex items-center gap-1 text-green-600">
                <Bike className="h-4 w-4" />
                <span>Livraison</span>
              </div>
            )}
            {restaurant.acceptsTakeaway && (
              <div className="flex items-center gap-1 text-blue-600">
                <Package className="h-4 w-4" />
                <span>À emporter</span>
              </div>
            )}
          </div>
          {restaurant.description && (
            <p className="mt-2 text-gray-600">{restaurant.description}</p>
          )}
          {restaurant.minOrderAmount > 0 && (
            <p className="mt-2 text-sm text-orange-600">
              Minimum de commande: {formatPrice(restaurant.minOrderAmount)}
            </p>
          )}
        </div>
      </div>

      {/* Category Navigation */}
      <div className="sticky top-[60px] sm:top-[57px] z-30 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
            <Button
              variant={!activeCategory ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(null)}
              className="whitespace-nowrap"
            >
              Tout
            </Button>
            {allCategories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className="whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {searchQuery && filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun résultat pour "{searchQuery}"</p>
          </div>
        ) : (
          <div className="space-y-8">
            {(activeCategory ? filteredCategories.filter(c => c.id === activeCategory) : filteredCategories).map((category) => (
              <section key={category.id} id={category.slug}>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                  {category.description && (
                    <span className="text-sm text-gray-500">• {category.description}</span>
                  )}
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((item) => (
                    <Card 
                      key={item.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group clickable"
                      onClick={() => {
                        setSelectedItem(item);
                        setSelectedVariant(item.variants?.find(v => v.isDefault)?.id || '');
                        setSelectedOptions(
                          item.options?.reduce((acc, opt) => {
                            const defaults = opt.values.filter(v => v.isDefault).map(v => v.id);
                            if (defaults.length > 0) acc[opt.id] = defaults;
                            return acc;
                          }, {} as Record<string, string[]>) || {}
                        );
                        setIsItemModalOpen(true);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedItem(item);
                          setSelectedVariant(item.variants?.find(v => v.isDefault)?.id || '');
                          setSelectedOptions(
                            item.options?.reduce((acc, opt) => {
                              const defaults = opt.values.filter(v => v.isDefault).map(v => v.id);
                              if (defaults.length > 0) acc[opt.id] = defaults;
                              return acc;
                            }, {} as Record<string, string[]>) || {}
                          );
                          setIsItemModalOpen(true);
                        }
                      }}
                    >
                      <div className="flex gap-3 p-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center flex-shrink-0">
                            <Utensils className="h-8 w-8 text-orange-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                            <div className="flex gap-1 flex-shrink-0">
                              {item.isPopular && (
                                <Badge variant="secondary" className="text-xs py-0 px-1">
                                  Populaire
                                </Badge>
                              )}
                              {item.isNew && (
                                <Badge className="text-xs py-0 px-1 bg-green-500">
                                  Nouveau
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {item.description && (
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                              {item.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 mt-2">
                            {item.isVegetarian && (
                              <Leaf className="h-4 w-4 text-green-500" title="Végétarien" />
                            )}
                            {item.isSpicy && (
                              <Flame className="h-4 w-4 text-red-500" title="Épicé" />
                            )}
                            {item.rating > 0 && (
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {item.rating.toFixed(1)} ({item.reviewCount})
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-baseline gap-1">
                              {item.discountPrice ? (
                                <>
                                  <span className="font-bold text-orange-600">
                                    {formatPrice(item.discountPrice)}
                                  </span>
                                  <span className="text-sm text-gray-400 line-through">
                                    {formatPrice(item.price)}
                                  </span>
                                </>
                              ) : (
                                <span className="font-bold text-orange-600">
                                  {formatPrice(item.price)}
                                </span>
                              )}
                            </div>
                            <Button 
                              size="sm" 
                              className="bg-orange-500 hover:bg-orange-600 h-8 w-8 rounded-full p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(item);
                                setSelectedVariant(item.variants?.find(v => v.isDefault)?.id || '');
                                setSelectedOptions({});
                                setItemQuantity(1);
                                setIsItemModalOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Item Detail Modal */}
      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.name}</DialogTitle>
                {selectedItem.description && (
                  <DialogDescription>{selectedItem.description}</DialogDescription>
                )}
              </DialogHeader>
              
              {/* Item Image */}
              {selectedItem.image && (
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              {/* Item Info */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {selectedItem.prepTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedItem.prepTime} min
                  </span>
                )}
                {selectedItem.calories && (
                  <span>{selectedItem.calories} cal</span>
                )}
                {selectedItem.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {selectedItem.rating.toFixed(1)} ({selectedItem.reviewCount})
                  </span>
                )}
              </div>
              
              {/* Badges */}
              <div className="flex gap-2">
                {selectedItem.isVegetarian && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Leaf className="h-3 w-3 mr-1" /> Végétarien
                  </Badge>
                )}
                {selectedItem.isVegan && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Végan
                  </Badge>
                )}
                {selectedItem.isHalal && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    Halal
                  </Badge>
                )}
                {selectedItem.isSpicy && (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    <Flame className="h-3 w-3 mr-1" /> Épicé {selectedItem.spicyLevel > 0 && `(${selectedItem.spicyLevel})`}
                  </Badge>
                )}
              </div>
              
              {/* Variants */}
              {selectedItem.variants && selectedItem.variants.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Choisir une option</h4>
                  <div className="space-y-2">
                    {selectedItem.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors clickable ${
                          selectedVariant === variant.id ? 'border-orange-500 bg-orange-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedVariant(variant.id)}
                        role="radio"
                        aria-checked={selectedVariant === variant.id}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedVariant(variant.id);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="variant"
                            id={`variant-${variant.id}`}
                            value={variant.id}
                            checked={selectedVariant === variant.id}
                            onChange={(e) => setSelectedVariant(e.target.value)}
                            className="text-orange-500 pointer-events-none"
                          />
                          <span>{variant.name}</span>
                        </div>
                        <span className="font-medium">
                          {variant.price > selectedItem.price && '+'}
                          {formatPrice(variant.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Options */}
              {selectedItem.options?.map((option) => (
                <div key={option.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{option.name}</h4>
                    {option.required && (
                      <Badge variant="secondary" className="text-xs">Obligatoire</Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    {option.values.map((value) => {
                      const isSelected = selectedOptions[option.id]?.includes(value.id);
                      return (
                        <div
                          key={value.id}
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors clickable ${
                            isSelected ? 'border-orange-500 bg-orange-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            if (option.multiSelect) {
                              setSelectedOptions(prev => {
                                const current = prev[option.id] || [];
                                const updated = isSelected
                                  ? current.filter(id => id !== value.id)
                                  : [...current, value.id];
                                return { ...prev, [option.id]: updated };
                              });
                            } else {
                              setSelectedOptions(prev => ({
                                ...prev,
                                [option.id]: [value.id],
                              }));
                            }
                          }}
                          role={option.multiSelect ? 'checkbox' : 'radio'}
                          aria-checked={isSelected}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              if (option.multiSelect) {
                                setSelectedOptions(prev => {
                                  const current = prev[option.id] || [];
                                  const updated = isSelected
                                    ? current.filter(id => id !== value.id)
                                    : [...current, value.id];
                                  return { ...prev, [option.id]: updated };
                                });
                              } else {
                                setSelectedOptions(prev => ({
                                  ...prev,
                                  [option.id]: [value.id],
                                }));
                              }
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type={option.multiSelect ? 'checkbox' : 'radio'}
                              name={option.id}
                              id={`option-${option.id}-${value.id}`}
                              value={value.id}
                              checked={isSelected}
                              onChange={() => {}} // Handled by parent div onClick
                              className="text-orange-500 pointer-events-none"
                            />
                            <span>{value.name}</span>
                          </div>
                          {value.price > 0 && (
                            <span className="text-sm text-gray-500">
                              +{formatPrice(value.price)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {/* Notes */}
              <div className="space-y-2">
                <h4 className="font-medium">Instructions spéciales</h4>
                <textarea
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="Allergies, préférences..."
                  className="w-full p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={2}
                />
              </div>
              
              {/* Quantity and Add to Cart */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                    disabled={itemQuantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{itemQuantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setItemQuantity(itemQuantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  onClick={handleAddToCart}
                >
                  Ajouter • {formatPrice(calculateItemTotal())}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Floating Cart Button (Mobile) */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-white border-t shadow-lg sm:hidden z-50 safe-area-bottom">
          <Link href={`/r/${slug}/cart`}>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 h-14 text-lg active:bg-orange-700">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Voir le panier • {getTotalItems()} articles • {formatPrice(getSubtotal())}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

// Cart Content Component
function CartContent({
  cartItems,
  formatPrice,
  updateQuantity,
  removeItem,
  clearCart,
  getSubtotal,
  restaurant,
  slug,
  onClose,
}: {
  cartItems: any[];
  formatPrice: (price: number) => string;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  restaurant: RestaurantData;
  slug: string;
  onClose: () => void;
}) {
  const subtotal = getSubtotal();
  const deliveryFee = restaurant.deliveryFee;
  const total = subtotal + deliveryFee;
  const minOrderMet = subtotal >= restaurant.minOrderAmount;

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">Votre panier est vide</p>
        <p className="text-sm text-gray-400">Ajoutez des articles pour commencer</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="space-y-4 py-4">
          {cartItems.map((item) => (
            <div key={`${item.id}-${item.variantId || ''}`} className="flex gap-3">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Utensils className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-medium">{item.name}</h4>
                {item.variantName && (
                  <p className="text-sm text-gray-500">{item.variantName}</p>
                )}
                {item.options?.map((opt: any) => (
                  <p key={opt.valueId} className="text-sm text-gray-500">
                    {opt.valueName}
                  </p>
                ))}
                {item.notes && (
                  <p className="text-xs text-gray-400 italic">{item.notes}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="font-medium text-orange-600">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Separator className="my-4" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Sous-total</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Livraison</span>
          <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : 'Gratuit'}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        {!minOrderMet && (
          <p className="text-orange-600 text-xs">
            Minimum de commande: {formatPrice(restaurant.minOrderAmount)}
          </p>
        )}
      </div>

      <div className="space-y-2 mt-4">
        <Link href={`/r/${slug}/checkout`} onClick={onClose}>
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={!minOrderMet}
          >
            Commander • {formatPrice(total)}
          </Button>
        </Link>
        <Button variant="outline" className="w-full" onClick={clearCart}>
          Vider le panier
        </Button>
      </div>
    </div>
  );
}
