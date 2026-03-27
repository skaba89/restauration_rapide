'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ShoppingCart,
  Search,
  Filter,
  Clock,
  ChefHat,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  Printer,
  RefreshCw,
  Grid3X3,
  List,
  Utensils,
  Phone,
  MapPin,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

// Demo orders data
const DEMO_ORDERS = [
  {
    id: '1',
    orderNumber: 'ORD-2024-0145',
    customerName: 'Kouamé Jean',
    customerPhone: '07 08 09 10 11',
    status: 'PENDING',
    type: 'DELIVERY',
    items: [
      { name: 'Attieké Poisson Grillé', quantity: 2, price: 3500 },
      { name: 'Jus de Bissap', quantity: 2, price: 750 },
    ],
    total: 8500,
    deliveryFee: 1500,
    deliveryAddress: 'Cocody, Riviera 3',
    createdAt: new Date(),
    timer: 5,
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-0144',
    customerName: 'Aya Marie',
    customerPhone: '05 04 03 02 01',
    status: 'PREPARING',
    type: 'DINE_IN',
    items: [
      { name: 'Kedjenou de Poulet', quantity: 1, price: 4500 },
      { name: 'Riz Gras', quantity: 1, price: 2500 },
    ],
    total: 7000,
    tableNumber: 'T-05',
    createdAt: new Date(Date.now() - 600000),
    timer: 10,
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-0143',
    customerName: 'Koné Ibrahim',
    customerPhone: '01 02 03 04 05',
    status: 'READY',
    type: 'TAKEAWAY',
    items: [
      { name: 'Dibi Agneau', quantity: 2, price: 5000 },
      { name: 'Jus de Gingembre', quantity: 2, price: 1000 },
    ],
    total: 12000,
    createdAt: new Date(Date.now() - 1200000),
    timer: 20,
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-0142',
    customerName: 'Diallo Fatou',
    customerPhone: '07 12 13 14 15',
    status: 'OUT_FOR_DELIVERY',
    type: 'DELIVERY',
    items: [
      { name: 'Alloco Sauce Graine', quantity: 2, price: 2500 },
      { name: 'Jus de Bissap', quantity: 2, price: 500 },
    ],
    total: 6000,
    deliveryFee: 1000,
    deliveryAddress: 'Treichville, Rue 12',
    createdAt: new Date(Date.now() - 1800000),
    timer: 30,
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-0141',
    customerName: 'Touré Amadou',
    customerPhone: '05 22 23 24 25',
    status: 'COMPLETED',
    type: 'DELIVERY',
    items: [
      { name: 'Thiéboudienne', quantity: 3, price: 3500 },
    ],
    total: 10500,
    deliveryFee: 1500,
    deliveryAddress: 'Yopougon, Sicogi',
    createdAt: new Date(Date.now() - 3600000),
    timer: 60,
  },
];

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} FCFA`;

const getStatusColor = (status: OrderStatus) => {
  const colors: Record<OrderStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
    PREPARING: 'bg-orange-100 text-orange-700 border-orange-200',
    READY: 'bg-green-100 text-green-700 border-green-200',
    OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700 border-purple-200',
    DELIVERED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  };
  return colors[status];
};

const getStatusLabel = (status: OrderStatus) => {
  const labels: Record<OrderStatus, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    PREPARING: 'En préparation',
    READY: 'Prête',
    OUT_FOR_DELIVERY: 'En livraison',
    DELIVERED: 'Livrée',
    COMPLETED: 'Terminée',
    CANCELLED: 'Annulée',
  };
  return labels[status];
};

const getTypeIcon = (type: OrderType) => {
  switch (type) {
    case 'DELIVERY': return <Truck className="h-4 w-4" />;
    case 'TAKEAWAY': return <Package className="h-4 w-4" />;
    default: return <Utensils className="h-4 w-4" />;
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState(DEMO_ORDERS);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filterStatus !== 'all' && order.status !== filterStatus) return false;
      if (filterType !== 'all' && order.type !== filterType) return false;
      if (searchQuery && !order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [orders, filterStatus, filterType, searchQuery]);

  // Orders by status for kanban
  const ordersByStatus = useMemo(() => {
    return {
      PENDING: filteredOrders.filter(o => o.status === 'PENDING'),
      PREPARING: filteredOrders.filter(o => o.status === 'PREPARING'),
      READY: filteredOrders.filter(o => o.status === 'READY'),
      OUT_FOR_DELIVERY: filteredOrders.filter(o => o.status === 'OUT_FOR_DELIVERY'),
      COMPLETED: filteredOrders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED'),
    };
  }, [filteredOrders]);

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const columns = [
    { status: 'PENDING' as OrderStatus, title: 'En attente', icon: Clock, color: 'yellow' },
    { status: 'PREPARING' as OrderStatus, title: 'En préparation', icon: ChefHat, color: 'orange' },
    { status: 'READY' as OrderStatus, title: 'Prêtes', icon: CheckCircle, color: 'green' },
    { status: 'OUT_FOR_DELIVERY' as OrderStatus, title: 'En livraison', icon: Truck, color: 'purple' },
    { status: 'COMPLETED' as OrderStatus, title: 'Terminées', icon: CheckCircle, color: 'emerald' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Commandes</h1>
          <p className="text-muted-foreground">Gérez les commandes en temps réel</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}>
            {viewMode === 'kanban' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </Button>
          <Button className="bg-gradient-to-r from-orange-500 to-red-600">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Nouvelle commande
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou numéro..."
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
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="PREPARING">En préparation</SelectItem>
            <SelectItem value="READY">Prêtes</SelectItem>
            <SelectItem value="OUT_FOR_DELIVERY">En livraison</SelectItem>
            <SelectItem value="COMPLETED">Terminées</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="DINE_IN">Sur place</SelectItem>
            <SelectItem value="TAKEAWAY">À emporter</SelectItem>
            <SelectItem value="DELIVERY">Livraison</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto">
          {columns.map((column) => (
            <div key={column.status} className="space-y-3">
              <div className={`flex items-center justify-between p-3 rounded-lg bg-${column.color}-100 dark:bg-${column.color}-900/20`}>
                <div className="flex items-center gap-2">
                  <column.icon className={`h-5 w-5 text-${column.color}-600`} />
                  <span className="font-semibold text-sm">{column.title}</span>
                </div>
                <Badge variant="secondary">{ordersByStatus[column.status]?.length || 0}</Badge>
              </div>
              <ScrollArea className="h-[calc(100vh-380px)]">
                <div className="space-y-2 pr-2">
                  {ordersByStatus[column.status]?.map((order) => (
                    <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm">{order.orderNumber}</span>
                          <div className={`p-1.5 rounded-md ${order.type === 'DELIVERY' ? 'bg-purple-100 text-purple-600' :
                            order.type === 'TAKEAWAY' ? 'bg-blue-100 text-blue-600' :
                            'bg-orange-100 text-orange-600'}`}>
                            {getTypeIcon(order.type as OrderType)}
                          </div>
                        </div>
                        <p className="text-sm font-medium">{order.customerName}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{order.timer} min</span>
                          {order.tableNumber && <span>• Table {order.tableNumber}</span>}
                        </div>
                        <div className="mt-2 pt-2 border-t flex items-center justify-between">
                          <span className="font-semibold text-sm">{formatCurrency(order.total)}</span>
                          {column.status === 'PENDING' && (
                            <Button size="sm" onClick={() => updateOrderStatus(order.id, 'PREPARING')}>
                              Commencer
                            </Button>
                          )}
                          {column.status === 'PREPARING' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateOrderStatus(order.id, 'READY')}>
                              Prête
                            </Button>
                          )}
                          {column.status === 'READY' && order.type === 'DELIVERY' && (
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => updateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}>
                              Livrer
                            </Button>
                          )}
                          {column.status === 'READY' && order.type !== 'DELIVERY' && (
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updateOrderStatus(order.id, 'COMPLETED')}>
                              Terminer
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      order.type === 'DELIVERY' ? 'bg-purple-100 text-purple-600' :
                      order.type === 'TAKEAWAY' ? 'bg-blue-100 text-blue-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {getTypeIcon(order.type as OrderType)}
                    </div>
                    <div>
                      <p className="font-semibold">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="hidden md:block text-center">
                    <p className="text-sm font-medium">{order.items.length} articles</p>
                    <p className="text-xs text-muted-foreground">{order.items.map(i => i.name).join(', ').slice(0, 30)}...</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{formatCurrency(order.total)}</p>
                    <Badge variant="outline" className={getStatusColor(order.status as OrderStatus)}>
                      {getStatusLabel(order.status as OrderStatus)}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> Voir détails</DropdownMenuItem>
                      <DropdownMenuItem><Printer className="h-4 w-4 mr-2" /> Imprimer</DropdownMenuItem>
                      <DropdownMenuItem><RefreshCw className="h-4 w-4 mr-2" /> Mettre à jour</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600"><XCircle className="h-4 w-4 mr-2" /> Annuler</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
