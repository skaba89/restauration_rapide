'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function ProductCard({ product, onAdd }: { product: any; onAdd: (p: any) => void }) {
  const formatPrice = (price: number) => 
    new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF', maximumFractionDigits: 0 }).format(price);

  return (
    <button
      onClick={() => onAdd(product)}
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-green-500 transition-all text-left flex flex-col h-full active:scale-95 group"
    >
      <div className="relative w-full h-32 mb-3 bg-gray-100 rounded-md overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-xs">Pas d'image</div>
        )}
      </div>
      <h3 className="font-bold text-gray-800 line-clamp-2 text-sm md:text-base">{product.name}</h3>
      {product.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2 flex-1">{product.description}</p>}
      <div className="mt-2 font-bold text-green-600 text-base md:text-lg">{formatPrice(product.price)}</div>
    </button>
  );
}

export default function POSPage() {
  const searchParams = useSearchParams();
  const [menuData, setMenuData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const restaurantId = searchParams.get('restaurantId') || localStorage.getItem('currentRestaurantId');

  useEffect(() => {
    if (!restaurantId) {
      setError("Aucun restaurant sélectionné. Connectez-vous ou choisissez un établissement.");
      setLoading(false);
      return;
    }

    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/public/menu?restaurantId=${restaurantId}`);
        if (!res.ok) throw new Error(`Erreur serveur: ${res.status}`);
        const data = await res.json();
        
        if (!data.categories || data.categories.length === 0) {
          setError("Le menu de ce restaurant est vide.");
        } else {
          setMenuData(data);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        setError("Impossible de charger le menu. Vérifiez votre connexion internet.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [restaurantId]);

  const handleAddToCart = (product: any) => {
    console.log("Ajout au panier:", product);
    alert(`✅ ${product.name} ajouté à la commande !`);
  };

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
          <button onClick={() => window.location.reload()} className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium">
            Réessayer
          </button>
          {!restaurantId && (
            <p className="mt-4 text-xs text-gray-400">Astuce: Ajoutez ?restaurantId=VOTRE_ID dans l'URL</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b z-20 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{menuData.restaurant.name}</h1>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Mode Caisse • Synchronisé
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-gray-500">Devise</div>
            <div className="font-bold text-gray-900">{menuData.restaurant.currency || 'GNF'}</div>
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
                {category.products.map((product: any) => (
                  <ProductCard key={product.id} product={product} onAdd={handleAddToCart} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}