'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

// Polling interval: refresh menu data every 30 seconds
const POLL_INTERVAL_MS = 30_000;

function ProductCard({ product, currency, onAdd }: { product: any; currency: any; onAdd: (p: any) => void }) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: currency?.code || 'GNF',
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <button
      onClick={() => onAdd(product)}
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-green-500 transition-all text-left flex flex-col h-full active:scale-95 group"
    >
      <div className="relative w-full h-32 mb-3 bg-gray-100 rounded-md overflow-hidden">
        {product.imageUrl || product.image ? (
          <img
            src={product.imageUrl || product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-xs">Pas d&apos;image</div>
        )}
      </div>
      <h3 className="font-bold text-gray-800 line-clamp-2 text-sm md:text-base">{product.name}</h3>
      {product.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2 flex-1">{product.description}</p>}
      <div className="mt-2 font-bold text-green-600 text-base md:text-lg">{formatPrice(product.price)}</div>
      {product.discountPrice && product.discountPrice < product.price && (
        <div className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</div>
      )}
    </button>
  );
}

export default function POSPage() {
  const searchParams = useSearchParams();
  const [menuData, setMenuData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const restaurantId = searchParams.get('restaurantId') || localStorage.getItem('currentRestaurantId');
  const restaurantSlug = searchParams.get('restaurantSlug') || localStorage.getItem('currentRestaurantSlug') || 'kfm-delice';

  const fetchMenu = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setIsRefreshing(true);
      else if (!menuData) setLoading(true);

      // Add cache-busting timestamp to bypass service worker cache
      const cacheBuster = `_t=${Date.now()}`;
      let url = `/api/public/menu?${cacheBuster}&`;
      if (restaurantId) {
        url += `restaurantId=${restaurantId}`;
      } else {
        url += `restaurantSlug=${restaurantSlug}`;
      }

      const res = await fetch(url, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) throw new Error(`Erreur serveur: ${res.status}`);
      const json = await res.json();

      if (!json.success || !json.data) {
        throw new Error('Format de réponse invalide');
      }

      const data = json.data;

      if (!data.categories || data.categories.length === 0) {
        // If no categories but menus exist, flatten menus into categories
        if (data.menus && data.menus.length > 0) {
          const flatCategories = data.menus.flatMap((menu: any) =>
            (menu.categories || []).map((cat: any) => ({
              ...cat,
              items: (cat.items || []).map((item: any) => ({
                ...item,
                imageUrl: item.imageUrl || item.image,
              })),
            }))
          );
          if (flatCategories.length > 0) {
            setMenuData({ ...data, categories: flatCategories });
            setLastSyncAt(new Date());
            setError(null);
            return;
          }
        }
        if (!menuData) setError("Le menu de ce restaurant est vide.");
      } else {
        // Ensure all items have imageUrl field for ProductCard
        const normalizedCategories = data.categories.map((cat: any) => ({
          ...cat,
          items: (cat.items || []).map((item: any) => ({
            ...item,
            imageUrl: item.imageUrl || item.image,
          })),
        }));
        setMenuData({ ...data, categories: normalizedCategories });
        setLastSyncAt(new Date());
        setError(null);
      }
    } catch (err) {
      console.error('[POS] Menu fetch error:', err);
      if (!menuData) setError("Impossible de charger le menu. Vérifiez votre connexion internet.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [restaurantId, restaurantSlug, menuData]);

  // Initial fetch + polling
  useEffect(() => {
    fetchMenu(true); // Initial load with loader

    // Set up auto-refresh polling
    pollRef.current = setInterval(() => {
      fetchMenu(false); // Silent refresh (no loader)
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, restaurantSlug]);

  const handleManualRefresh = () => {
    fetchMenu(true); // Manual refresh with spinner
  };

  const handleAddToCart = (product: any) => {
    console.log("Ajout au panier:", product);
    alert(`✅ ${product.name} ajouté à la commande !`);
  };

  // Format last sync time
  const formatSyncTime = (date: Date) =>
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Chargement du menu en cours...</p>
      </div>
    );
  }

  if (error || !menuData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4 text-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-2">Oups !</h2>
          <p className="text-gray-600 mb-6">{error || "Données indisponibles"}</p>
          <button onClick={handleManualRefresh} className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium">
            Réessayer
          </button>
          {!restaurantId && !restaurantSlug && (
            <p className="mt-4 text-xs text-gray-400">Astuce: Ajoutez ?restaurantId=VOTRE_ID ou ?restaurantSlug=VOTRE_SLUG dans l&apos;URL</p>
          )}
        </div>
      </div>
    );
  }

  const currency = menuData.restaurant?.currency || { code: 'GNF', symbol: 'GNF' };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b z-20 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{menuData.restaurant.name}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span className={`w-2 h-2 rounded-full ${lastSyncAt ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                Mode Caisse
                {lastSyncAt && (
                  <span className="text-gray-400">• Sync à {formatSyncTime(lastSyncAt)}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-gray-500">Devise</div>
              <div className="font-bold text-gray-900">{currency.code || 'GNF'}</div>
            </div>
            {/* Manual refresh button */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-green-700 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Rafraîchir le menu"
            >
              <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="max-w-7xl mx-auto">
          {menuData.categories.map((category: any) => (
            <div key={category.id} className="mb-8 scroll-mt-24" id={`cat-${category.id}`}>
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 sticky top-0 bg-gray-50/95 backdrop-blur z-10">
                {category.name}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {(category.items || category.products || []).map((product: any) => (
                  <ProductCard key={product.id} product={product} currency={currency} onAdd={handleAddToCart} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
