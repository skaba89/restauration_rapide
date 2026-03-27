'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bike,
  Search,
  Star,
  Phone,
  Navigation,
  DollarSign,
  Package,
  CheckCircle,
  Clock,
  TrendingUp,
  User,
  MoreVertical,
  Edit,
  Eye,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Demo drivers
const DEMO_DRIVERS = [
  {
    id: '1',
    name: 'Kouassi Emmanuel',
    phone: '07 11 12 13 14',
    vehicleType: 'motorcycle',
    vehiclePlate: 'AB-1234-CD',
    status: 'online',
    isAvailable: true,
    rating: 4.8,
    totalDeliveries: 247,
    todayDeliveries: 12,
    todayEarnings: 18500,
    currentLocation: 'Cocody',
  },
  {
    id: '2',
    name: 'Yao Koffi',
    phone: '05 33 34 35 36',
    vehicleType: 'motorcycle',
    vehiclePlate: 'CD-5678-EF',
    status: 'busy',
    isAvailable: false,
    rating: 4.6,
    totalDeliveries: 189,
    todayDeliveries: 8,
    todayEarnings: 12400,
    currentLocation: 'Plateau',
  },
  {
    id: '3',
    name: 'Bamba Seydou',
    phone: '01 44 45 46 47',
    vehicleType: 'bicycle',
    vehiclePlate: null,
    status: 'offline',
    isAvailable: false,
    rating: 4.9,
    totalDeliveries: 312,
    todayDeliveries: 0,
    todayEarnings: 0,
    currentLocation: null,
  },
];

const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} FCFA`;

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    online: 'bg-green-100 text-green-700',
    busy: 'bg-orange-100 text-orange-700',
    offline: 'bg-gray-100 text-gray-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState(DEMO_DRIVERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredDrivers = drivers.filter((d) => {
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    if (searchQuery && !d.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: drivers.length,
    online: drivers.filter(d => d.status === 'online').length,
    busy: drivers.filter(d => d.status === 'busy').length,
    offline: drivers.filter(d => d.status === 'offline').length,
  };

  const toggleDriverAvailability = (driverId: string) => {
    setDrivers(prev => prev.map(d => 
      d.id === driverId 
        ? { ...d, status: d.status === 'offline' ? 'online' : 'offline', isAvailable: d.status === 'offline' }
        : d
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Drivers</h1>
          <p className="text-muted-foreground">Gérez vos livreurs</p>
        </div>
        <Button className="bg-gradient-to-r from-orange-500 to-red-600">
          <User className="h-4 w-4 mr-2" />
          Ajouter un driver
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Bike className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total drivers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.online}</p>
                <p className="text-xs text-muted-foreground">En ligne</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.busy}</p>
                <p className="text-xs text-muted-foreground">En livraison</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.offline}</p>
                <p className="text-xs text-muted-foreground">Hors ligne</p>
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
            placeholder="Rechercher un driver..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="online">En ligne</SelectItem>
            <SelectItem value="busy">En livraison</SelectItem>
            <SelectItem value="offline">Hors ligne</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Drivers List */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="divide-y">
              {filteredDrivers.map((driver) => (
                <div key={driver.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                        {driver.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{driver.name}</p>
                        <Badge className={getStatusColor(driver.status)}>
                          {driver.status === 'online' ? 'En ligne' : driver.status === 'busy' ? 'En livraison' : 'Hors ligne'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {driver.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bike className="h-3 w-3" /> {driver.vehicleType === 'motorcycle' ? 'Moto' : 'Vélo'}
                          {driver.vehiclePlate && ` - ${driver.vehiclePlate}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-6 text-center">
                    <div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{driver.rating}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Note</p>
                    </div>
                    <div>
                      <p className="font-semibold">{driver.totalDeliveries}</p>
                      <p className="text-xs text-muted-foreground">Total livraisons</p>
                    </div>
                    <div>
                      <p className="font-semibold">{driver.todayDeliveries}</p>
                      <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                    </div>
                    <div>
                      <p className="font-semibold text-green-600">{formatCurrency(driver.todayEarnings)}</p>
                      <p className="text-xs text-muted-foreground">Gains</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={driver.status !== 'offline'}
                      onCheckedChange={() => toggleDriverAvailability(driver.id)}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> Voir profil</DropdownMenuItem>
                        <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Modifier</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
