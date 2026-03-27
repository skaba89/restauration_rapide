'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Store,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Star,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  ShoppingCart,
} from 'lucide-react';
// Plan type definition (to avoid client-side Prisma import)
type Plan = 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';

// Demo data
const DEMO_RESTAURANTS = [
  {
    id: '1',
    name: 'Le Savana',
    slug: 'le-savana',
    logo: null,
    city: 'Cocody, Abidjan',
    isActive: true,
    isOpen: true,
    rating: 4.8,
    reviewCount: 256,
    createdAt: new Date('2024-01-15'),
    organization: { id: 'org-1', name: 'Le Groupe Savana', plan: 'BUSINESS' as Plan },
    _count: { orders: 1250 },
  },
  {
    id: '2',
    name: 'Saveurs d\'Afrique',
    slug: 'saveurs-afrique',
    logo: null,
    city: 'Plateau, Abidjan',
    isActive: true,
    isOpen: false,
    rating: 4.5,
    reviewCount: 189,
    createdAt: new Date('2024-02-20'),
    organization: { id: 'org-2', name: 'Saveurs d\'Afrique Group', plan: 'PRO' as Plan },
    _count: { orders: 890 },
  },
  {
    id: '3',
    name: 'Le Petit Bistro',
    slug: 'petit-bistro',
    logo: null,
    city: 'Marcory, Abidjan',
    isActive: true,
    isOpen: true,
    rating: 4.6,
    reviewCount: 145,
    createdAt: new Date('2024-03-10'),
    organization: { id: 'org-3', name: 'Restaurant Le Petit Bistro', plan: 'STARTER' as Plan },
    _count: { orders: 456 },
  },
  {
    id: '4',
    name: 'Café du Plateau',
    slug: 'cafe-plateau',
    logo: null,
    city: 'Plateau, Abidjan',
    isActive: false,
    isOpen: false,
    rating: 4.2,
    reviewCount: 78,
    createdAt: new Date('2024-01-05'),
    organization: { id: 'org-4', name: 'Café du Plateau', plan: 'PRO' as Plan },
    _count: { orders: 234 },
  },
  {
    id: '5',
    name: 'Maquis Chez Maman',
    slug: 'maquis-maman',
    logo: null,
    city: 'Bouaké',
    isActive: true,
    isOpen: true,
    rating: 4.9,
    reviewCount: 312,
    createdAt: new Date('2024-04-18'),
    organization: { id: 'org-5', name: 'Maquis Chez Maman', plan: 'STARTER' as Plan },
    _count: { orders: 678 },
  },
  {
    id: '6',
    name: 'La Terrasse Grill',
    slug: 'terrasse-grill',
    logo: null,
    city: 'Riviera, Abidjan',
    isActive: true,
    isOpen: true,
    rating: 4.7,
    reviewCount: 423,
    createdAt: new Date('2023-11-20'),
    organization: { id: 'org-6', name: 'La Terrasse Group', plan: 'ENTERPRISE' as Plan },
    _count: { orders: 1890 },
  },
  {
    id: '7',
    name: 'Sushi House',
    slug: 'sushi-house',
    logo: null,
    city: 'Cocody, Abidjan',
    isActive: true,
    isOpen: true,
    rating: 4.4,
    reviewCount: 167,
    createdAt: new Date('2024-05-01'),
    organization: { id: 'org-1', name: 'Le Groupe Savana', plan: 'BUSINESS' as Plan },
    _count: { orders: 534 },
  },
  {
    id: '8',
    name: 'Pizza Express',
    slug: 'pizza-express',
    logo: null,
    city: 'Treichville, Abidjan',
    isActive: true,
    isOpen: false,
    rating: 4.1,
    reviewCount: 98,
    createdAt: new Date('2024-03-25'),
    organization: { id: 'org-1', name: 'Le Groupe Savana', plan: 'BUSINESS' as Plan },
    _count: { orders: 345 },
  },
];

const getPlanBadgeStyle = (plan: Plan) => {
  const styles: Record<Plan, string> = {
    STARTER: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    PRO: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    BUSINESS: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    ENTERPRISE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  };
  return styles[plan];
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function RestaurantsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [restaurants, setRestaurants] = useState(DEMO_RESTAURANTS);
  const [search, setSearch] = useState('');
  const [orgFilter, setOrgFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Get unique organizations for filter
  const uniqueOrgs = Array.from(new Set(restaurants.map(r => r.organization.id))).map(id => {
    const restaurant = restaurants.find(r => r.organization.id === id);
    return { id, name: restaurant?.organization.name || '' };
  });

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = search === '' || 
      restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
      restaurant.city.toLowerCase().includes(search.toLowerCase());
    
    const matchesOrg = orgFilter === 'all' || restaurant.organization.id === orgFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && restaurant.isActive) ||
      (statusFilter === 'inactive' && !restaurant.isActive) ||
      (statusFilter === 'open' && restaurant.isOpen) ||
      (statusFilter === 'closed' && !restaurant.isOpen);
    
    return matchesSearch && matchesOrg && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
  const paginatedRestaurants = filteredRestaurants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Restaurants</h1>
          <p className="text-muted-foreground">Manage all restaurants on the platform</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Store className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{restaurants.length}</p>
                <p className="text-xs text-muted-foreground">Total Restaurants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{restaurants.filter(r => r.isActive).length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{restaurants.reduce((sum, r) => sum + r._count.orders, 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {(restaurants.reduce((sum, r) => sum + r.rating, 0) / restaurants.length).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search restaurants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={orgFilter} onValueChange={setOrgFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {uniqueOrgs.map(org => (
                  <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Restaurants Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            All Restaurants
            <Badge variant="secondary" className="ml-2">
              {filteredRestaurants.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRestaurants.map((restaurant) => (
                      <TableRow key={restaurant.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">
                              {restaurant.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{restaurant.name}</p>
                              <p className="text-xs text-muted-foreground">{restaurant.slug}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{restaurant.organization.name}</span>
                            <Badge className={`text-xs ${getPlanBadgeStyle(restaurant.organization.plan)}`}>
                              {restaurant.organization.plan}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {restaurant.city}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            <span className="font-medium">{restaurant.rating}</span>
                            <span className="text-xs text-muted-foreground">
                              ({restaurant.reviewCount})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{restaurant._count.orders.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant={restaurant.isActive ? 'default' : 'secondary'}>
                              {restaurant.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {restaurant.isActive && (
                              <Badge variant={restaurant.isOpen ? 'default' : 'outline'} className="text-xs">
                                {restaurant.isOpen ? 'Open' : 'Closed'}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(restaurant.createdAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2">
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Edit className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 text-red-600">
                                <Store className="h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredRestaurants.length)} of{' '}
                    {filteredRestaurants.length} restaurants
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
