'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// Dialog import removed - not used
import {
  Users,
  Search,
  Plus,
  Star,
  TrendingUp,
  ShoppingBag,
  Phone,
  Mail,
  Calendar,
  Crown,
  Gift,
  Eye,
  Edit,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Demo customers data
const DEMO_CUSTOMERS = [
  {
    id: '1',
    name: 'Kouamé Jean',
    email: 'jean.kouame@email.com',
    phone: '07 08 09 10 11',
    totalOrders: 24,
    totalSpent: 185000,
    loyaltyPoints: 1850,
    lastOrder: new Date(Date.now() - 86400000),
    isVip: true,
    avatar: null,
  },
  {
    id: '2',
    name: 'Aya Marie',
    email: 'aya.marie@email.com',
    phone: '05 04 03 02 01',
    totalOrders: 18,
    totalSpent: 142000,
    loyaltyPoints: 1420,
    lastOrder: new Date(Date.now() - 172800000),
    isVip: true,
    avatar: null,
  },
  {
    id: '3',
    name: 'Koné Ibrahim',
    email: 'ibrahim.kone@email.com',
    phone: '01 02 03 04 05',
    totalOrders: 12,
    totalSpent: 98000,
    loyaltyPoints: 980,
    lastOrder: new Date(Date.now() - 259200000),
    isVip: false,
    avatar: null,
  },
  {
    id: '4',
    name: 'Diallo Fatou',
    email: 'fatou.diallo@email.com',
    phone: '07 12 13 14 15',
    totalOrders: 8,
    totalSpent: 64000,
    loyaltyPoints: 640,
    lastOrder: new Date(Date.now() - 345600000),
    isVip: false,
    avatar: null,
  },
  {
    id: '5',
    name: 'Touré Amadou',
    email: 'amadou.toure@email.com',
    phone: '05 22 23 24 25',
    totalOrders: 15,
    totalSpent: 127000,
    loyaltyPoints: 1270,
    lastOrder: new Date(Date.now() - 432000000),
    isVip: false,
    avatar: null,
  },
];

const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} FCFA`;
const formatDate = (date: Date) => new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVip, setFilterVip] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  const filteredCustomers = useMemo(() => {
    let result = [...DEMO_CUSTOMERS];
    
    if (searchQuery) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
      );
    }
    
    if (filterVip === 'vip') result = result.filter(c => c.isVip);
    if (filterVip === 'regular') result = result.filter(c => !c.isVip);
    
    if (sortBy === 'recent') result.sort((a, b) => b.lastOrder.getTime() - a.lastOrder.getTime());
    if (sortBy === 'spent') result.sort((a, b) => b.totalSpent - a.totalSpent);
    if (sortBy === 'orders') result.sort((a, b) => b.totalOrders - a.totalOrders);
    
    return result;
  }, [searchQuery, filterVip, sortBy]);

  const totalCustomers = DEMO_CUSTOMERS.length;
  const vipCustomers = DEMO_CUSTOMERS.filter(c => c.isVip).length;
  const totalRevenue = DEMO_CUSTOMERS.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = totalRevenue / DEMO_CUSTOMERS.reduce((sum, c) => sum + c.totalOrders, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Gérez votre base de clients</p>
        </div>
        <Button className="bg-gradient-to-r from-orange-500 to-red-600">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCustomers}</p>
                <p className="text-xs text-muted-foreground">Total clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Crown className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vipCustomers}</p>
                <p className="text-xs text-muted-foreground">Clients VIP</p>
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
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">CA total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(Math.round(avgOrderValue))}</p>
                <p className="text-xs text-muted-foreground">Panier moyen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email, téléphone..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterVip} onValueChange={setFilterVip}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
            <SelectItem value="regular">Réguliers</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Plus récents</SelectItem>
            <SelectItem value="spent">Plus dépenseurs</SelectItem>
            <SelectItem value="orders">Plus de commandes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customers List */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="divide-y">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={customer.avatar ?? undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{customer.name}</p>
                        {customer.isVip && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                            <Crown className="h-3 w-3 mr-1" /> VIP
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {customer.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {customer.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-6 text-center">
                    <div>
                      <p className="font-semibold">{customer.totalOrders}</p>
                      <p className="text-xs text-muted-foreground">Commandes</p>
                    </div>
                    <div>
                      <p className="font-semibold text-green-600">{formatCurrency(customer.totalSpent)}</p>
                      <p className="text-xs text-muted-foreground">Total dépensé</p>
                    </div>
                    <div>
                      <p className="font-semibold text-orange-600">{customer.loyaltyPoints}</p>
                      <p className="text-xs text-muted-foreground">Points</p>
                    </div>
                    <div>
                      <p className="text-sm">{formatDate(customer.lastOrder)}</p>
                      <p className="text-xs text-muted-foreground">Dernière cmd.</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> Voir profil</DropdownMenuItem>
                      <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Modifier</DropdownMenuItem>
                      <DropdownMenuItem><Gift className="h-4 w-4 mr-2" /> Ajouter points</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
