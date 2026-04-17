'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { useCurrencySafe } from '@/lib/currency-context';
import { formatCurrency as formatCurrencyUtil, CURRENCIES } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Clock,
  MapPin,
  Phone,
  Star,
  ChevronRight,
  Leaf,
  Flame,
  AlertCircle,
  Check,
  Utensils,
  Package,
  Bike,
  Store,
  Globe,
  Loader2,
  ChevronLeft,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Types
interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  price: number;
  discountPrice: number | null;
  prepTime: number | null;
  calories: number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isNew: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isHalal: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  spicyLevel: number;
  variants: { id: string; name: string; price: number; isDefault: boolean }[];
  options: {
    id: string;
    name: string;
    required: boolean;
    multiSelect: boolean;
    values: { id: string; name: string; price: number }[];
  }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  items: MenuItem[];
}

interface Menu {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categories: Category[];
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  district: string | null;
  isOpen: boolean;
  isBusy: boolean;
  acceptsDelivery: boolean;
  acceptsTakeaway: boolean;
  acceptsDineIn: boolean;
  deliveryFee: number;
  minOrderAmount: number;
  deliveryTime: number;
  rating: number;
  reviewCount: number;
  currency: { code: string; symbol: string; name: string };
  settings: {
    acceptsCash: boolean;
    acceptsMobileMoney: boolean;
    acceptsCard: boolean;
    deliveryEnabled: boolean;
    minOrderAmount: number;
    defaultDeliveryFee: number;
  } | null;
  hours: { dayOfWeek: number; openTime: string | null; closeTime: string | null; isClosed: boolean }[];
  deliveryZones: { id: string; name: string; baseFee: number; minTime: number; maxTime: number }[];
  menus: Menu[];
  bannerImages?: string[];
}

// Auto-refresh interval: sync with admin and POS (same 30s interval)
const SYNC_INTERVAL_MS = 30_000;

// Items per page for traditional pagination (increased for grid layout)
const ITEMS_PER_PAGE = 12;

// Banner images for carousel (default promotional images)
const DEFAULT_BANNER_IMAGES = [
  '/images/banner-1.jpg',
  '/images/banner-2.jpg',
  '/images/banner-3.jpg',
];

export default function PublicMenuClient({ slug }: { slug: string }) {
  const router = useRouter();
  const params = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway' | 'dine-in'>('delivery');
  
  // Traditional pagination state
  const [currentPage, setCurrentPage] = useState(1);

  const { items, addItem, removeItem, updateQuantity, getTotal, getItemCount, clearCart } = useCartStore();
  
  // Use global currency context
  const { currency, formatCurrency: globalFormatCurrency } = useCurrencySafe();
  
  // Carousel autoplay state
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Item detail modal state
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemNotes, setItemNotes] = useState('');
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const syncPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Banner images computed with useMemo - before any conditional returns
  const bannerImages = useMemo(() => {
    if (!restaurant?.bannerImages || restaurant.bannerImages.length === 0) {
      return DEFAULT_BANNER_IMAGES;
    }
    return restaurant.bannerImages;
  }, [restaurant?.bannerImages]);

  // Auto-slide carousel - MUST be before any conditional returns
  useEffect(() => {
    if (bannerImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  // Fetch restaurant data and menu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch restaurant info
        const resRestaurant = await fetch(`/api/public/restaurant/${slug}`);
        if (!resRestaurant.ok) {
          throw new Error('Restaurant non trouvé');
        }
        const dataRestaurant = await resRestaurant.json();
        setRestaurant(dataRestaurant.data);
        
        // Fetch menu from the unified public menu API (same source as POS)
        // Add cache-busting to prevent stale data
        const cacheBuster = `_t=${Date.now()}`;
        const resMenu = await fetch(`/api/public/menu?restaurantSlug=${slug}&${cacheBuster}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (resMenu.ok) {
          const json = await resMenu.json();
          if (json.success && json.data && json.data.menus && json.data.menus.length > 0) {
            // Replace restaurant menus with data from unified API
            const unifiedMenus = json.data.menus;
            setRestaurant((prev: any) => prev ? {
              ...prev,
              currency: json.data.restaurant?.currency || prev.currency,
              menus: unifiedMenus.map((menu: any) => ({
                id: menu.id || 'default-menu',
                name: menu.name || 'Menu Principal',
                slug: menu.slug || 'menu-principal',
                description: menu.description || '',
                categories: (menu.categories || []).map((cat: any) => ({
                  ...cat,
                  items: (cat.items || []).map((item: any) => ({
                    ...item,
                    imageUrl: item.imageUrl || item.image,
                  })),
                })),
              })),
            } : null);
          }
        }
        
        // Set first menu as default
        if (dataRestaurant.data?.menus?.length > 0) {
          setSelectedMenuId(dataRestaurant.data.menus[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
        setLastSyncAt(new Date());
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  // Auto-refresh polling to stay in sync with admin and POS
  useEffect(() => {
    if (!slug) return;

    syncPollRef.current = setInterval(() => {
      // Silent menu re-fetch (same pattern as POS page)
      fetch(`/api/public/menu?restaurantSlug=${slug}&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })
        .then(res => {
          if (!res.ok) return;
          return res.json();
        })
        .then(json => {
          if (!json?.success || !json?.data?.menus?.length) return;
          const unifiedMenus = json.data.menus;
          setRestaurant((prev: any) => prev ? {
            ...prev,
            currency: json.data.restaurant?.currency || prev.currency,
            menus: unifiedMenus.map((menu: any) => ({
              id: menu.id || 'default-menu',
              name: menu.name || 'Menu Principal',
              slug: menu.slug || 'menu-principal',
              description: menu.description || '',
              categories: (menu.categories || []).map((cat: any) => ({
                ...cat,
                items: (cat.items || []).map((item: any) => ({
                  ...item,
                  imageUrl: item.imageUrl || item.image,
                })),
              })),
            })),
          } : null);
          setLastSyncAt(new Date());
        })
        .catch(() => { /* silent - keep existing data */ });
    }, SYNC_INTERVAL_MS);

    return () => {
      if (syncPollRef.current) clearInterval(syncPollRef.current);
    };
  }, [slug]);

  // Get current menu
  const currentMenu = useMemo(() => {
    if (!restaurant?.menus) return null;
    return restaurant.menus.find(m => m.id === selectedMenuId) || restaurant.menus[0];
  }, [restaurant?.menus, selectedMenuId]);

  // Get all categories from current menu
  const categories = useMemo(() => {
    if (!currentMenu?.categories) return [];
    return [
      { id: 'all', name: 'Tout', icon: '🍽️', items: [] },
      ...currentMenu.categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon || '🍴',
        items: cat.items,
      })),
    ];
  }, [currentMenu]);

  // Get all items for filtering
  const allItems = useMemo(() => {
    if (!currentMenu?.categories) return [];
    return currentMenu.categories.flatMap(cat => cat.items);
  }, [currentMenu]);

  // Filter items
  const filteredItems = useMemo(() => {
    let items = allItems;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      items = items.filter(item => {
        const category = currentMenu?.categories.find(cat =>
          cat.items.some(i => i.id === item.id)
        );
        return category?.id === selectedCategory;
      });
    }

    return items;
  }, [allItems, searchQuery, selectedCategory, currentMenu]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  // Get current page items
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  // Pagination handlers
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    // Scroll to items section
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }, [totalPages]);

  // Generate page numbers to display
  const getPageNumbers = useCallback(() => {
    const pages: (number | 'ellipsis')[] = [];
    const showPages = 5;
    
    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  }, [totalPages, currentPage]);

  // Cart handlers
  const handleAddToCart = useCallback((item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.discountPrice ?? item.price,
      image: item.image || undefined,
      quantity: 1,
    });
    toast.success(`${item.name} ajouté au panier`);
  }, [addItem]);

  const handleIncrease = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      updateQuantity(itemId, item.quantity + 1);
    }
  }, [items, updateQuantity]);

  const handleDecrease = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      if (item.quantity <= 1) {
        removeItem(itemId);
      } else {
        updateQuantity(itemId, item.quantity - 1);
      }
    }
  }, [items, updateQuantity, removeItem]);

  const getItemQuantity = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return item?.quantity || 0;
  }, [items]);

  // Format price using global currency
  const formatPrice = useCallback((price: number) => {
    // If restaurant has a specific currency and it matches the global currency, use it
    if (restaurant?.currency && restaurant.currency.code === currency.code) {
      return globalFormatCurrency(price);
    }
    // Otherwise convert to global currency
    return globalFormatCurrency(price);
  }, [restaurant?.currency, currency.code, globalFormatCurrency]);

  // Cart total
  const cartTotal = getTotal();
  const cartCount = getItemCount();
  const minOrder = restaurant?.minOrderAmount || restaurant?.settings?.minOrderAmount || 0;
  const deliveryFee = restaurant?.deliveryFee || restaurant?.settings?.defaultDeliveryFee || 0;
  const canOrder = cartTotal >= minOrder;

  // Checkout handler
  const handleCheckout = useCallback(() => {
    if (!canOrder) {
      toast.error(`Minimum de commande: ${formatPrice(minOrder)}`);
      return;
    }
    // Navigate to checkout page
    router.push(`/menu/${slug}/checkout`);
  }, [canOrder, minOrder, formatPrice, router, slug]);

  // Open item detail modal
  const handleOpenItemDetail = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setItemNotes('');
    setIsItemModalOpen(true);
  }, []);

  // Add from modal with notes
  const handleAddFromModal = useCallback(() => {
    if (!selectedItem) return;
    addItem({
      id: selectedItem.id,
      name: selectedItem.name,
      price: selectedItem.discountPrice ?? selectedItem.price,
      image: selectedItem.image || undefined,
      quantity: 1,
      notes: itemNotes || undefined,
    });
    toast.success(`${selectedItem.name} ajouté au panier`);
    setIsItemModalOpen(false);
    setSelectedItem(null);
    setItemNotes('');
  }, [selectedItem, itemNotes, addItem]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-48 bg-gray-200 animate-pulse" />
        <div className="max-w-4xl mx-auto px-4 -mt-12">
          <Skeleton className="w-24 h-24 rounded-full bg-white shadow-lg" />
          <Skeleton className="h-8 w-48 mt-4" />
          <Skeleton className="h-4 w-32 mt-2" />
          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-10 w-24 rounded-full" />
            ))}
          </div>
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900">Restaurant non trouvé</h1>
            <p className="text-gray-500 mt-2">{error || 'Ce restaurant n\'existe pas ou n\'est plus disponible.'}</p>
            <Button className="mt-6" onClick={() => window.location.href = '/'}>
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header with image carousel banner */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-orange-400 to-red-500 overflow-hidden">
        {/* Image Carousel */}
        <div className="relative w-full h-full">
          {bannerImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {image && !image.includes('/images/banner') ? (
                <Image
                  src={image}
                  alt={`${restaurant.name} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              ) : (
                <div className={`w-full h-full ${
                  ['bg-gradient-to-br from-orange-400 via-red-500 to-amber-500',
                   'bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500',
                   'bg-gradient-to-br from-amber-500 via-orange-400 to-red-500'][index % 3]
                } flex items-center justify-center`}>
                  <div className="text-center text-white px-4">
                    <Utensils className="w-16 h-16 mx-auto mb-2 opacity-80" />
                    <p className="text-lg font-semibold opacity-90">{restaurant.name}</p>
                    <p className="text-sm opacity-75">
                      {['Cuisine de qualité', 'Saveurs authentiques', 'Livraison rapide'][index % 3]}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Carousel dots indicator */}
        {bannerImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Carousel navigation arrows */}
        {bannerImages.length > 1 && (
          <>
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + bannerImages.length) % bannerImages.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % bannerImages.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Back button - always goes to public home */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-4 left-4 p-2 bg-white/90 rounded-full shadow-lg active:scale-95 transition-transform z-10"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>

        {/* Restaurant info overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
            {restaurant.name}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-white/90 text-sm">
            {restaurant.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {restaurant.rating.toFixed(1)} ({restaurant.reviewCount})
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {restaurant.deliveryTime} min
            </span>
            {restaurant.isOpen ? (
              <Badge className="bg-green-500 text-white">Ouvert</Badge>
            ) : (
              <Badge className="bg-red-500 text-white">Fermé</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Restaurant logo */}
      {restaurant.logo && (
        <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10">
          <div className="w-20 h-20 rounded-xl bg-white shadow-lg overflow-hidden border-4 border-white">
            <Image
              src={restaurant.logo}
              alt={restaurant.name}
              width={80}
              height={80}
              className="object-cover"
            />
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 mt-4">
        {/* Restaurant details */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {restaurant.address}, {restaurant.city}
          </span>
          <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1 text-orange-600">
            <Phone className="w-4 h-4" />
            {restaurant.phone}
          </a>
        </div>

        {/* Order type selector */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {restaurant.acceptsDelivery && (
            <button
              onClick={() => setOrderType('delivery')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap ${
                orderType === 'delivery'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              <Bike className="w-4 h-4" />
              Livraison
              {deliveryFee > 0 && <span className="text-xs">({formatPrice(deliveryFee)})</span>}
            </button>
          )}
          {restaurant.acceptsTakeaway && (
            <button
              onClick={() => setOrderType('takeaway')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap ${
                orderType === 'takeaway'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              <Package className="w-4 h-4" />
              Emporté
            </button>
          )}
          {restaurant.acceptsDineIn && (
            <button
              onClick={() => setOrderType('dine-in')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap ${
                orderType === 'dine-in'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              <Store className="w-4 h-4" />
              Sur place
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Rechercher un plat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Categories horizontal scroll */}
        <ScrollArea className="w-full mb-4">
          <div className="flex gap-2 pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Results count */}
        <div className="text-sm text-gray-500 mb-3">
          {filteredItems.length} article{filteredItems.length > 1 ? 's' : ''} trouvé{filteredItems.length > 1 ? 's' : ''}
          {totalPages > 1 && ` • Page ${currentPage} sur ${totalPages}`}
        </div>

        {/* Menu items - Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentItems.length === 0 ? (
            <Card className="p-8 text-center col-span-full">
              <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Aucun plat trouvé</p>
            </Card>
          ) : (
            currentItems.map((item) => {
              const quantity = getItemQuantity(item.id);
              const price = item.discountPrice ?? item.price;
              const hasDiscount = item.discountPrice && item.discountPrice < item.price;

              return (
                <Card
                  key={item.id}
                  className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                  onClick={() => handleOpenItemDetail(item)}
                >
                  <CardContent className="p-0">
                    {/* Image on top for grid layout */}
                    <div className="w-full h-36 sm:h-40 bg-gradient-to-br from-orange-100 to-amber-100 relative">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-5xl">
                          🍽️
                        </div>
                      )}
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {item.isPopular && (
                          <Badge className="bg-orange-500 text-white text-xs py-0.5">
                            <Flame className="w-3 h-3 mr-0.5" />
                            Populaire
                          </Badge>
                        )}
                        {item.isNew && (
                          <Badge className="bg-green-500 text-white text-xs py-0.5">
                            Nouveau
                          </Badge>
                        )}
                        {!item.isAvailable && (
                          <Badge className="bg-gray-500 text-white text-xs py-0.5">
                            Indisponible
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Content below image */}
                    <div className="p-3 flex flex-col">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      
                      {/* Price and info row */}
                      <div className="flex items-center gap-2 mt-2">
                        {hasDiscount ? (
                          <>
                            <span className="font-bold text-orange-600 text-sm">
                              {formatPrice(item.discountPrice!)}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              {formatPrice(item.price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-orange-600 text-sm">
                            {formatPrice(item.price)}
                          </span>
                        )}
                        {item.prepTime && (
                          <span className="flex items-center text-xs text-gray-500 ml-auto">
                            <Clock className="w-3 h-3 mr-1" />
                            {item.prepTime}min
                          </span>
                        )}
                      </div>
                      
                      {/* Dietary badges */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.isVegetarian && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-300 py-0">
                            <Leaf className="w-2 h-2 mr-0.5" />
                            Végé
                          </Badge>
                        )}
                        {item.isSpicy && (
                          <Badge variant="outline" className="text-xs text-red-600 border-red-300 py-0">
                            🌶️ Épicé
                          </Badge>
                        )}
                      </div>

                      {/* Add to cart button */}
                      <div className="flex items-center justify-end mt-3">
                        {quantity > 0 ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleDecrease(item.id)}
                              className="w-8 h-8 rounded-full border-2 border-orange-500 text-orange-500 flex items-center justify-center hover:bg-orange-50 active:scale-95 transition-all"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-base w-5 text-center">{quantity}</span>
                            <button
                              onClick={() => handleIncrease(item.id)}
                              className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 active:scale-95 transition-all"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(item);
                            }}
                            disabled={!item.isAvailable}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold transition-all active:scale-95 ${
                              item.isAvailable
                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                            Ajouter
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Traditional Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => goToPage(currentPage - 1)}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => goToPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => goToPage(currentPage + 1)}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Minimum order notice */}
        {minOrder > 0 && cartTotal > 0 && cartTotal < minOrder && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-700">
              Minimum de commande: {formatPrice(minOrder)}. Ajoutez encore{' '}
              {formatPrice(minOrder - cartTotal)}.
            </p>
          </div>
        )}
      </div>

      {/* Fixed cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 p-4 safe-area-bottom">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  {cartCount} article{cartCount > 1 ? 's' : ''}
                </span>
                {orderType === 'delivery' && deliveryFee > 0 && (
                  <span className="text-sm text-gray-500">
                    + {formatPrice(deliveryFee)} livraison
                  </span>
                )}
              </div>
              <p className="font-bold text-orange-600 text-lg">
                {formatPrice(cartTotal + (orderType === 'delivery' ? deliveryFee : 0))}
              </p>
            </div>
            <Button
              onClick={handleCheckout}
              disabled={!canOrder || !restaurant.isOpen}
              className={`px-6 py-3 rounded-xl font-semibold ${
                canOrder && restaurant.isOpen
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Commander
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </div>
      )}

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
                <div className="w-full h-48 relative rounded-lg overflow-hidden">
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              {/* Item Info */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {selectedItem.prepTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedItem.prepTime} min
                  </span>
                )}
                {selectedItem.calories && (
                  <span>{selectedItem.calories} cal</span>
                )}
              </div>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {selectedItem.isVegetarian && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Leaf className="w-3 h-3 mr-1" /> Végétarien
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
                    <Flame className="w-3 h-3 mr-1" /> Épicé {selectedItem.spicyLevel > 0 && `(${selectedItem.spicyLevel})`}
                  </Badge>
                )}
              </div>
              
              {/* Variants */}
              {selectedItem.variants && selectedItem.variants.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Options disponibles</h4>
                  <div className="space-y-1">
                    {selectedItem.variants.map((variant) => (
                      <div key={variant.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                        <span>{variant.name}</span>
                        <span className="font-medium text-orange-600">
                          {formatPrice(variant.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Notes */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Instructions spéciales</h4>
                <textarea
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="Allergies, préférences..."
                  className="w-full p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={2}
                />
              </div>
              
              {/* Add to Cart Button */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="flex-1">
                  <span className="font-bold text-lg text-orange-600">
                    {formatPrice(selectedItem.discountPrice ?? selectedItem.price)}
                  </span>
                  {selectedItem.discountPrice && (
                    <span className="text-sm text-gray-400 line-through ml-2">
                      {formatPrice(selectedItem.price)}
                    </span>
                  )}
                </div>
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={handleAddFromModal}
                  disabled={!selectedItem.isAvailable}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter au panier
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
