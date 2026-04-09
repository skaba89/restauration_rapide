'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Clock,
  ChefHat,
  Package,
  Users,
  Bell,
  Eye,
  EyeOff,
  Home,
  Grid3X3,
  List,
  Plus,
  CheckCircle,
  AlertCircle,
  Timer,
  Utensils,
  Coffee,
  Wine,
  ShoppingCart,
  Truck,
  RefreshCw,
  Settings,
  LogOut,
  MoreVertical,
  Phone,
  MessageSquare,
  Printer,
  Volume2,
  VolumeX,
  Filter,
  Calendar,
  User,
  TableProperties,
  LayoutGrid,
  Check,
  X,
  ArrowRight,
  Zap,
  AlertTriangle,
  CheckCheck,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
type StaffView = 'orders' | 'kds' | 'tables' | 'quick';
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  status: 'PENDING' | 'PREPARING' | 'READY';
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  type: OrderType;
  items: OrderItem[];
  total: number;
  createdAt: Date;
  estimatedTime: number;
  tableNumber?: string;
  deliveryAddress?: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  notes?: string;
  timer: number; // minutes elapsed
}

interface Table {
  id: string;
  number: string;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  guests?: number;
  reservedFor?: string;
  reservedTime?: string;
}

// ============================================
// DEMO DATA
// ============================================
const DEMO_STAFF = {
  id: '1',
  name: 'Amadou Diallo',
  role: 'Chef Cuisinier',
  avatar: '',
  restaurant: 'Restaurant Le Palais',
};

const DEMO_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-0145',
    customerName: 'Kouamé Jean',
    customerPhone: '07 08 09 10 11',
    status: 'PENDING',
    type: 'DELIVERY',
    items: [
      { id: '1', name: 'Attieké Poisson Grillé', quantity: 2, status: 'PENDING' },
      { id: '2', name: 'Jus de Bissap', quantity: 2, status: 'PENDING' },
    ],
    total: 8500,
    createdAt: new Date(),
    estimatedTime: 20,
    deliveryAddress: 'Cocody, Riviera 3',
    priority: 'HIGH',
    timer: 3,
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-0144',
    customerName: 'Aya Marie',
    customerPhone: '05 04 03 02 01',
    status: 'PREPARING',
    type: 'DINE_IN',
    items: [
      { id: '1', name: 'Kedjenou de Poulet', quantity: 1, status: 'PREPARING', notes: 'Sans piment' },
      { id: '2', name: 'Riz Gras', quantity: 1, status: 'PENDING' },
    ],
    total: 4500,
    createdAt: new Date(Date.now() - 600000),
    estimatedTime: 25,
    tableNumber: 'T-05',
    priority: 'NORMAL',
    timer: 10,
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-0143',
    customerName: 'Koné Ibrahim',
    customerPhone: '01 02 03 04 05',
    status: 'PREPARING',
    type: 'TAKEAWAY',
    items: [
      { id: '1', name: 'Dibi Agneau', quantity: 2, status: 'PREPARING' },
      { id: '2', name: 'Jus de Gingembre', quantity: 2, status: 'READY' },
    ],
    total: 12000,
    createdAt: new Date(Date.now() - 1200000),
    estimatedTime: 30,
    priority: 'URGENT',
    notes: 'Client pressé - rendez-vous dans 15 min',
    timer: 20,
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-0142',
    customerName: 'Diallo Fatou',
    customerPhone: '07 12 13 14 15',
    status: 'READY',
    type: 'DELIVERY',
    items: [
      { id: '1', name: 'Alloco Sauce Graine', quantity: 2, status: 'READY' },
      { id: '2', name: 'Jus de Bissap', quantity: 2, status: 'READY' },
    ],
    total: 6000,
    createdAt: new Date(Date.now() - 1800000),
    estimatedTime: 15,
    deliveryAddress: 'Treichville, Rue 12',
    priority: 'NORMAL',
    timer: 30,
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-0141',
    customerName: 'Table 12',
    customerPhone: '',
    status: 'PREPARING',
    type: 'DINE_IN',
    items: [
      { id: '1', name: 'Poulet Moambé', quantity: 2, status: 'PREPARING' },
      { id: '2', name: 'Foutou Banane', quantity: 2, status: 'READY' },
      { id: '3', name: 'Pastèque Fraîche', quantity: 1, status: 'READY' },
    ],
    total: 14000,
    createdAt: new Date(Date.now() - 2400000),
    estimatedTime: 35,
    tableNumber: 'T-12',
    priority: 'NORMAL',
    timer: 40,
  },
  {
    id: '6',
    orderNumber: 'ORD-2024-0140',
    customerName: 'Touré Amadou',
    customerPhone: '05 22 23 24 25',
    status: 'PENDING',
    type: 'TAKEAWAY',
    items: [
      { id: '1', name: 'Thiéboudienne', quantity: 3, status: 'PENDING' },
    ],
    total: 10500,
    createdAt: new Date(Date.now() - 300000),
    estimatedTime: 30,
    priority: 'HIGH',
    timer: 5,
  },
];

const DEMO_TABLES: Table[] = [
  { id: '1', number: 'T-01', capacity: 4, status: 'OCCUPIED', currentOrderId: '5', guests: 4 },
  { id: '2', number: 'T-02', capacity: 2, status: 'AVAILABLE' },
  { id: '3', number: 'T-03', capacity: 6, status: 'RESERVED', reservedFor: 'Bamba Seydou', reservedTime: '19:30' },
  { id: '4', number: 'T-04', capacity: 4, status: 'CLEANING' },
  { id: '5', number: 'T-05', capacity: 4, status: 'OCCUPIED', currentOrderId: '2', guests: 2 },
  { id: '6', number: 'T-06', capacity: 8, status: 'AVAILABLE' },
  { id: '7', number: 'T-07', capacity: 2, status: 'AVAILABLE' },
  { id: '8', number: 'T-08', capacity: 4, status: 'OCCUPIED', guests: 3 },
  { id: '9', number: 'T-09', capacity: 4, status: 'RESERVED', reservedFor: 'Koffi Aya', reservedTime: '20:00' },
  { id: '10', number: 'T-10', capacity: 6, status: 'AVAILABLE' },
  { id: '11', number: 'T-11', capacity: 4, status: 'OCCUPIED', guests: 4 },
  { id: '12', number: 'T-12', capacity: 4, status: 'OCCUPIED', currentOrderId: '5', guests: 4 },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================
const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} FCFA`;
const formatTime = (date: Date) => new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const getStatusColor = (status: OrderStatus) => {
  const colors: Record<OrderStatus, string> = {
    PENDING: 'bg-yellow-500',
    CONFIRMED: 'bg-blue-500',
    PREPARING: 'bg-orange-500',
    READY: 'bg-green-500',
    OUT_FOR_DELIVERY: 'bg-purple-500',
    DELIVERED: 'bg-green-600',
    COMPLETED: 'bg-emerald-600',
    CANCELLED: 'bg-red-500',
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

const getTableStatusColor = (status: TableStatus) => {
  const colors: Record<TableStatus, string> = {
    AVAILABLE: 'bg-green-100 border-green-300 text-green-700',
    OCCUPIED: 'bg-red-100 border-red-300 text-red-700',
    RESERVED: 'bg-blue-100 border-blue-300 text-blue-700',
    CLEANING: 'bg-yellow-100 border-yellow-300 text-yellow-700',
  };
  return colors[status];
};

const getPriorityColor = (priority: Order['priority']) => {
  const colors: Record<Order['priority'], string> = {
    NORMAL: 'bg-gray-100 text-gray-700',
    HIGH: 'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-700 animate-pulse',
  };
  return colors[priority];
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function StaffApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<StaffView>('kds');
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS);
  const [tables, setTables] = useState<Table[]>(DEMO_TABLES);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | OrderStatus>('all');

  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Computed values
  const pendingOrders = useMemo(() => orders.filter(o => o.status === 'PENDING'), [orders]);
  const preparingOrders = useMemo(() => orders.filter(o => o.status === 'PREPARING'), [orders]);
  const readyOrders = useMemo(() => orders.filter(o => o.status === 'READY'), [orders]);

  const filteredOrders = useMemo(() => {
    if (filterStatus === 'all') return orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
    return orders.filter(o => o.status === filterStatus);
  }, [orders, filterStatus]);

  const availableTables = useMemo(() => tables.filter(t => t.status === 'AVAILABLE').length, [tables]);
  const occupiedTables = useMemo(() => tables.filter(t => t.status === 'OCCUPIED').length, [tables]);

  // Handle login
  const handleLogin = () => {
    if (username && password) {
      setIsLoggedIn(true);
    }
  };

  // Update order status
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  // Update item status
  const updateItemStatus = (orderId: string, itemId: string, newStatus: OrderItem['status']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          items: o.items.map(i => i.id === itemId ? { ...i, status: newStatus } : i),
        };
      }
      return o;
    }));
  };

  // Update table status
  const updateTableStatus = (tableId: string, newStatus: TableStatus) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: newStatus } : t));
  };

  // ============================================
  // LOGIN SCREEN
  // ============================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Staff Portal</CardTitle>
            <CardDescription>{DEMO_STAFF.restaurant}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d&apos;utilisateur</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Votre identifiant"
                  className="pl-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Settings className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              onClick={handleLogin}
            >
              Se connecter
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              <p>Démo: Entrez n&apos;importe quel identifiant et mot de passe</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">{DEMO_STAFF.restaurant}</p>
              <p className="text-xs text-muted-foreground">{DEMO_STAFF.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Stats */}
            <div className="hidden md:flex items-center gap-4 mr-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">En attente</p>
                  <p className="text-sm font-bold">{pendingOrders.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Utensils className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">En préparation</p>
                  <p className="text-sm font-bold">{preparingOrders.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Prêtes</p>
                  <p className="text-sm font-bold">{readyOrders.length}</p>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}>
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{pendingOrders.length}</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-xs">
                      {DEMO_STAFF.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{DEMO_STAFF.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" /> Paramètres
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* View Tabs */}
      <div className="bg-white border-b px-4 py-2">
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as StaffView)}>
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="kds" className="flex items-center gap-1">
              <ChefHat className="h-4 w-4" /> KDS
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-1">
              <Package className="h-4 w-4" /> Commandes
            </TabsTrigger>
            <TabsTrigger value="tables" className="flex items-center gap-1">
              <Grid3X3 className="h-4 w-4" /> Tables
            </TabsTrigger>
            <TabsTrigger value="quick" className="flex items-center gap-1">
              <Zap className="h-4 w-4" /> Actions
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      <main className="p-4">
        {/* KDS View - Kitchen Display System */}
        {activeView === 'kds' && (
          <div className="space-y-4">
            {/* Order Queue by Status */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Pending Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-yellow-100 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-700">En attente</span>
                  </div>
                  <Badge className="bg-yellow-500 text-white">{pendingOrders.length}</Badge>
                </div>
                <ScrollArea className="h-[calc(100vh-320px)]">
                  <div className="space-y-3 pr-2">
                    {pendingOrders.map((order) => (
                      <Card key={order.id} className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-lg">{order.orderNumber}</span>
                            <Badge className={getPriorityColor(order.priority)}>
                              {order.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Timer className="h-4 w-4" />
                            <span>{order.timer} min</span>
                            {order.tableNumber && (
                              <>
                                <span>•</span>
                                <span>Table {order.tableNumber}</span>
                              </>
                            )}
                            {order.type === 'DELIVERY' && (
                              <>
                                <span>•</span>
                                <Truck className="h-4 w-4" />
                              </>
                            )}
                          </div>
                          <div className="space-y-1 mb-3">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-2 text-sm">
                                <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                                  {item.quantity}
                                </Badge>
                                <span>{item.name}</span>
                              </div>
                            ))}
                          </div>
                          {order.notes && (
                            <div className="p-2 bg-yellow-50 rounded text-xs text-yellow-800 mb-3">
                              <AlertCircle className="h-3 w-3 inline mr-1" />
                              {order.notes}
                            </div>
                          )}
                          <Button
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                          >
                            <Utensils className="h-4 w-4 mr-2" /> Commencer
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Preparing Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-orange-100 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold text-orange-700">En préparation</span>
                  </div>
                  <Badge className="bg-orange-500 text-white">{preparingOrders.length}</Badge>
                </div>
                <ScrollArea className="h-[calc(100vh-320px)]">
                  <div className="space-y-3 pr-2">
                    {preparingOrders.map((order) => (
                      <Card key={order.id} className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-lg">{order.orderNumber}</span>
                            <Badge className={getPriorityColor(order.priority)}>
                              {order.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Timer className="h-4 w-4 text-orange-500" />
                            <span className="text-orange-500 font-medium">{order.timer} min</span>
                            {order.tableNumber && (
                              <>
                                <span>•</span>
                                <span>Table {order.tableNumber}</span>
                              </>
                            )}
                          </div>
                          <div className="space-y-2 mb-3">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                                    {item.quantity}
                                  </Badge>
                                  <span>{item.name}</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant={item.status === 'READY' ? 'default' : 'outline'}
                                  className={item.status === 'READY' ? 'bg-green-500 hover:bg-green-600' : ''}
                                  onClick={() => updateItemStatus(order.id, item.id, item.status === 'READY' ? 'PREPARING' : 'READY')}
                                >
                                  {item.status === 'READY' ? <Check className="h-4 w-4" /> : <Utensils className="h-4 w-4" />}
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Progress 
                            value={(order.items.filter(i => i.status === 'READY').length / order.items.length) * 100} 
                            className="h-2 mb-3"
                          />
                          <Button
                            className="w-full bg-green-500 hover:bg-green-600"
                            disabled={order.items.some(i => i.status !== 'READY')}
                            onClick={() => updateOrderStatus(order.id, 'READY')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" /> Marquer prête
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Ready Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-green-100 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-700">Prêtes</span>
                  </div>
                  <Badge className="bg-green-500 text-white">{readyOrders.length}</Badge>
                </div>
                <ScrollArea className="h-[calc(100vh-320px)]">
                  <div className="space-y-3 pr-2">
                    {readyOrders.map((order) => (
                      <Card key={order.id} className="border-l-4 border-l-green-500 bg-green-50 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-lg">{order.orderNumber}</span>
                            <Badge className="bg-green-500 text-white">PRÊTE</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            {order.type === 'DELIVERY' ? (
                              <>
                                <Truck className="h-4 w-4 text-green-600" />
                                <span>Livraison</span>
                              </>
                            ) : order.type === 'TAKEAWAY' ? (
                              <>
                                <Package className="h-4 w-4 text-green-600" />
                                <span>À emporter</span>
                              </>
                            ) : (
                              <>
                                <Grid3X3 className="h-4 w-4 text-green-600" />
                                <span>Table {order.tableNumber}</span>
                              </>
                            )}
                          </div>
                          <div className="p-2 bg-white rounded mb-3">
                            <p className="text-sm font-medium">{order.customerName}</p>
                            {order.customerPhone && (
                              <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Printer className="h-4 w-4 mr-1" /> Imprimer
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                            >
                              <CheckCheck className="h-4 w-4 mr-1" /> Terminer
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        )}

        {/* Orders View */}
        {activeView === 'orders' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" /> Filtrer
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-1" /> Aujourd&apos;hui
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant={layoutMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setLayoutMode('grid')}>
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant={layoutMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setLayoutMode('list')}>
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Order List */}
            <ScrollArea className="h-[calc(100vh-280px)]">
              {layoutMode === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="font-bold">{order.orderNumber}</span>
                            <Badge className={`ml-2 ${getStatusColor(order.status)} text-white`}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" /> Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Printer className="h-4 w-4 mr-2" /> Imprimer
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <X className="h-4 w-4 mr-2" /> Annuler
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{order.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatTime(order.createdAt)}</span>
                            <span className="text-muted-foreground">•</span>
                            <span>{order.timer} min</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {order.type === 'DELIVERY' ? <Truck className="h-4 w-4 text-muted-foreground" /> :
                             order.type === 'TAKEAWAY' ? <Package className="h-4 w-4 text-muted-foreground" /> :
                             <Grid3X3 className="h-4 w-4 text-muted-foreground" />}
                            <span>{order.type === 'DINE_IN' ? `Table ${order.tableNumber}` : order.type === 'DELIVERY' ? 'Livraison' : 'À emporter'}</span>
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{formatCurrency(order.total)}</span>
                          <div className="flex gap-1">
                            {order.status === 'PENDING' && (
                              <Button size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={() => updateOrderStatus(order.id, 'PREPARING')}>
                                Commencer
                              </Button>
                            )}
                            {order.status === 'PREPARING' && (
                              <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => updateOrderStatus(order.id, 'READY')}>
                                Prête
                              </Button>
                            )}
                            {order.status === 'READY' && (
                              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => updateOrderStatus(order.id, 'COMPLETED')}>
                                Terminer
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                              {order.type === 'DELIVERY' ? <Truck className="h-6 w-6" /> :
                               order.type === 'TAKEAWAY' ? <Package className="h-6 w-6" /> :
                               <Grid3X3 className="h-6 w-6" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{order.orderNumber}</span>
                                <Badge className={`${getStatusColor(order.status)} text-white`}>
                                  {getStatusLabel(order.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{order.customerName} • {order.items.length} articles</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(order.total)}</p>
                              <p className="text-xs text-muted-foreground">{formatTime(order.createdAt)}</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        {/* Tables View */}
        {activeView === 'tables' && (
          <div className="space-y-4">
            {/* Table Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{availableTables}</p>
                  <p className="text-xs text-muted-foreground">Disponibles</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{occupiedTables}</p>
                  <p className="text-xs text-muted-foreground">Occupées</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{tables.filter(t => t.status === 'RESERVED').length}</p>
                  <p className="text-xs text-muted-foreground">Réservées</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{tables.filter(t => t.status === 'CLEANING').length}</p>
                  <p className="text-xs text-muted-foreground">En nettoyage</p>
                </CardContent>
              </Card>
            </div>

            {/* Table Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tables.map((table) => (
                <Card
                  key={table.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${getTableStatusColor(table.status)} border-2`}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TableProperties className="h-8 w-8" />
                    </div>
                    <p className="font-bold text-lg">{table.number}</p>
                    <p className="text-xs opacity-70">{table.capacity} places</p>
                    
                    {table.status === 'OCCUPIED' && table.guests && (
                      <div className="mt-2 flex items-center justify-center gap-1">
                        <Users className="h-3 w-3" />
                        <span className="text-xs">{table.guests} pers.</span>
                      </div>
                    )}
                    
                    {table.status === 'RESERVED' && table.reservedFor && (
                      <div className="mt-2">
                        <p className="text-xs font-medium truncate">{table.reservedFor}</p>
                        <p className="text-xs opacity-70">{table.reservedTime}</p>
                      </div>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="mt-2 w-full">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {table.status === 'AVAILABLE' && (
                          <>
                            <DropdownMenuItem onClick={() => updateTableStatus(table.id, 'OCCUPIED')}>
                              <Users className="h-4 w-4 mr-2" /> Marquer occupée
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="h-4 w-4 mr-2" /> Réserver
                            </DropdownMenuItem>
                          </>
                        )}
                        {table.status === 'OCCUPIED' && (
                          <>
                            <DropdownMenuItem>
                              <ShoppingCart className="h-4 w-4 mr-2" /> Nouvelle commande
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateTableStatus(table.id, 'CLEANING')}>
                              <CheckCircle className="h-4 w-4 mr-2" /> Libérer
                            </DropdownMenuItem>
                          </>
                        )}
                        {table.status === 'CLEANING' && (
                          <DropdownMenuItem onClick={() => updateTableStatus(table.id, 'AVAILABLE')}>
                            <CheckCircle className="h-4 w-4 mr-2" /> Nettoyage terminé
                          </DropdownMenuItem>
                        )}
                        {table.status === 'RESERVED' && (
                          <>
                            <DropdownMenuItem onClick={() => updateTableStatus(table.id, 'OCCUPIED')}>
                              <Users className="h-4 w-4 mr-2" /> Client arrivé
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => updateTableStatus(table.id, 'AVAILABLE')}>
                              <X className="h-4 w-4 mr-2" /> Annuler réservation
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Legend */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4 justify-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-100 border border-red-300" />
                    <span>Occupée</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300" />
                    <span>Réservée</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300" />
                    <span>Nettoyage</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions View */}
        {activeView === 'quick' && (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-80">Commandes actives</p>
                      <p className="text-3xl font-bold">{orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length}</p>
                    </div>
                    <Package className="h-8 w-8 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-80">Temps moyen</p>
                      <p className="text-3xl font-bold">18 min</p>
                    </div>
                    <Timer className="h-8 w-8 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Action Buttons */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                    <Plus className="h-6 w-6" />
                    <span className="text-sm">Nouvelle commande</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                    <RefreshCw className="h-6 w-6" />
                    <span className="text-sm">Rafraîchir</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                    <Printer className="h-6 w-6" />
                    <span className="text-sm">Imprimer tout</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                    <AlertTriangle className="h-6 w-6" />
                    <span className="text-sm">Signaler problème</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {[
                      { time: '14:32', action: 'Commande ORD-2024-0145 reçue', type: 'new' },
                      { time: '14:28', action: 'Commande ORD-2024-0144 en préparation', type: 'progress' },
                      { time: '14:15', action: 'Table T-12 occupée', type: 'table' },
                      { time: '14:10', action: 'Commande ORD-2024-0143 prête', type: 'ready' },
                      { time: '14:05', action: 'Commande ORD-2024-0142 livrée', type: 'complete' },
                      { time: '13:55', action: 'Table T-05 libérée', type: 'table' },
                      { time: '13:50', action: 'Nouvelle réservation - T-03', type: 'reservation' },
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'new' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'progress' ? 'bg-orange-100 text-orange-600' :
                          activity.type === 'ready' ? 'bg-green-100 text-green-600' :
                          activity.type === 'complete' ? 'bg-emerald-100 text-emerald-600' :
                          activity.type === 'table' ? 'bg-purple-100 text-purple-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {activity.type === 'new' ? <Plus className="h-4 w-4" /> :
                           activity.type === 'progress' ? <Utensils className="h-4 w-4" /> :
                           activity.type === 'ready' ? <CheckCircle className="h-4 w-4" /> :
                           activity.type === 'complete' ? <CheckCheck className="h-4 w-4" /> :
                           activity.type === 'table' ? <Grid3X3 className="h-4 w-4" /> :
                           <Calendar className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Kitchen Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">État de la cuisine</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-green-50">
                    <p className="text-2xl font-bold text-green-600">98%</p>
                    <p className="text-xs text-muted-foreground">Performance</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-50">
                    <p className="text-2xl font-bold text-blue-600">12 min</p>
                    <p className="text-xs text-muted-foreground">Temps attente</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-orange-50">
                    <p className="text-2xl font-bold text-orange-600">3</p>
                    <p className="text-xs text-muted-foreground">Cuisiniers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex items-center justify-around py-2">
          {[
            { id: 'kds' as StaffView, icon: ChefHat, label: 'KDS', badge: pendingOrders.length },
            { id: 'orders' as StaffView, icon: Package, label: 'Commandes' },
            { id: 'tables' as StaffView, icon: Grid3X3, label: 'Tables' },
            { id: 'quick' as StaffView, icon: Zap, label: 'Actions' },
          ].map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex flex-col items-center gap-1 px-4 ${
                activeView === item.id ? 'text-orange-600' : 'text-muted-foreground'
              }`}
              onClick={() => setActiveView(item.id)}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px]">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
}
