'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  MapPin,
  Clock,
  Star,
  ChevronRight,
  Bike,
  Package,
  Utensils,
} from 'lucide-react';
import Image from 'next/image';
import { useCurrencySafe } from '@/lib/currency-context';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  phone: string;
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
  hasMenu: boolean;
}

interface ApiResponse {
  data: Restaurant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ITEMS_PER_PAGE = 6;

export default function RestaurantsPage() {
  const router = useRouter();
  const { formatCurrency } = useCurrencySafe();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (city) params.set('city', city);
        params.set('page', currentPage.toString());
        params.set('limit', ITEMS_PER_PAGE.toString());

        const res = await fetch(`/api/public/restaurants?${params}`);
        if (res.ok) {
          const data: ApiResponse = await res.json();
          setRestaurants(data.data || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(fetchRestaurants, 300);
    return () => clearTimeout(timer);
  }, [search, city, currentPage]);

  // Reset page when search or city changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, city]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  const getPageNumbers = useCallback(() => {
    const pages: (number | 'ellipsis')[] = [];
    const showPages = 5;
    
    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  }, [totalPages, currentPage]);



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Trouvez votre restaurant</h1>
          <p className="mt-2 text-white/80">
            Commandez en ligne et faites-vous livrer
          </p>

          {/* Search */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher un restaurant..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 bg-white border-0 rounded-xl"
              />
            </div>
            <div className="relative sm:w-48">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Ville"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="pl-10 h-12 bg-white border-0 rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant list */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Results count */}
        {!loading && restaurants.length > 0 && (
          <div className="text-sm text-gray-500 mb-4">
            {total} restaurant{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
            {totalPages > 1 && ` • Page ${currentPage} sur ${totalPages}`}
          </div>
        )}
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="w-24 h-24 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <Card className="p-12 text-center">
            <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">Aucun restaurant trouvé</h2>
            <p className="text-gray-500 mt-2">
              Essayez de modifier vos critères de recherche
            </p>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {restaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/menu/${restaurant.slug}`)}
                >
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Image */}
                      <div className="w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 relative bg-gradient-to-br from-orange-100 to-amber-100">
                        {restaurant.coverImage ? (
                          <Image
                            src={restaurant.coverImage}
                            alt={restaurant.name}
                            fill
                            className="object-cover"
                          />
                        ) : restaurant.logo ? (
                          <Image
                            src={restaurant.logo}
                            alt={restaurant.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-4xl">
                            🍽️
                          </div>
                        )}
                        {/* Status badge */}
                        <div className="absolute top-2 left-2">
                          {restaurant.isOpen ? (
                            <Badge className="bg-green-500 text-white text-xs">
                              Ouvert
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500 text-white text-xs">
                              Fermé
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {restaurant.name}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {restaurant.city}
                              {restaurant.district && `, ${restaurant.district}`}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>

                        {restaurant.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {restaurant.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 mt-auto pt-2">
                          {restaurant.rating > 0 && (
                            <span className="flex items-center text-sm">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                              {restaurant.rating.toFixed(1)}
                              <span className="text-gray-400 ml-1">
                                ({restaurant.reviewCount})
                              </span>
                            </span>
                          )}
                          <span className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {restaurant.deliveryTime} min
                          </span>
                          {restaurant.acceptsDelivery && (
                            <Badge variant="outline" className="text-xs">
                              <Bike className="w-3 h-3 mr-1" />
                              Livraison
                            </Badge>
                          )}
                          {restaurant.acceptsTakeaway && (
                            <Badge variant="outline" className="text-xs">
                              <Package className="w-3 h-3 mr-1" />
                              Emporté
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
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
          </>
        )}
      </div>
    </div>
  );
}
