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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
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
  Plus,
  Minus,
  Trash2,
  User,
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
    notes: '',
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
    notes: 'Sans piment',
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
    notes: '',
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
    notes: '',
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
    notes: '',
  },
];

// Demo menu items for order creation
const MENU_ITEMS = [
  { id: '1', name: 'Attieké Poisson Grillé', price: 3500, category: 'Plats Principaux' },
  { id: '2', name: 'Kedjenou de Poulet', price: 4500, category: 'Plats Principaux' },
  { id: '3', name: 'Thiéboudienne', price: 3500, category: 'Plats Principaux' },
  { id: '4', name: 'Dibi Agneau', price: 5000, category: 'Plats Principaux' },
  { id: '5', name: 'Alloco Sauce Graine', price: 2500, category: 'Plats Principaux' },
  { id: '6', name: 'Riz Gras', price: 2500, category: 'Accompagnements' },
  { id: '7', name: 'Foutou Banane', price: 2000, category: 'Accompagnements' },
  { id: '8', name: 'Jus de Bissap', price: 750, category: 'Boissons' },
  { id: '9', name: 'Jus de Gingembre', price: 1000, category: 'Boissons' },
  { id: '10', name: 'Eau minérale', price: 500, category: 'Boissons' },
];

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

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
  const { toast } = useToast();
  const [orders, setOrders] = useState(DEMO_ORDERS);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  
  // New order dialog state
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
    toast({
      title: 'Statut mis à jour',
      description: `La commande a été marquée comme "${getStatusLabel(newStatus)}"`,
    });
  };

  // Add item to order
  const addItemToOrder = (item: typeof MENU_ITEMS[0]) => {
    const existing = orderItems.find(i => i.id === item.id);
    if (existing) {
      setOrderItems(orderItems.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setOrderItems([...orderItems, { id: item.id, name: item.name, price: item.price, quantity: 1 }]);
    }
  };

  // Remove item from order
  const removeItemFromOrder = (itemId: string) => {
    setOrderItems(orderItems.filter(i => i.id !== itemId));
  };

  // Update item quantity
  const updateItemQuantity = (itemId: string, delta: number) => {
    setOrderItems(orderItems.map(i => {
      if (i.id === itemId) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  // Calculate order total
  const orderTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = orderType === 'DELIVERY' ? 1500 : 0;

  // Create new order
  const createOrder = () => {
    if (!customerName || !customerPhone || orderItems.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires et ajouter au moins un article',
        variant: 'destructive',
      });
      return;
    }

    if (orderType === 'DELIVERY' && !deliveryAddress) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer l\'adresse de livraison',
        variant: 'destructive',
      });
      return;
    }

    const newOrder = {
      id: String(orders.length + 1),
      orderNumber: `ORD-2024-${String(orders.length + 146).padStart(4, '0')}`,
      customerName,
      customerPhone,
      status: 'PENDING' as OrderStatus,
      type: orderType,
      items: orderItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
      total: orderTotal,
      deliveryFee,
      deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress : undefined,
      tableNumber: orderType === 'DINE_IN' ? tableNumber : undefined,
      createdAt: new Date(),
      timer: 0,
      notes: orderNotes,
    };

    setOrders([newOrder, ...orders]);
    
    // Reset form
    setIsNewOrderOpen(false);
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setTableNumber('');
    setOrderNotes('');
    setOrderItems([]);
    setOrderType('DINE_IN');

    toast({
      title: 'Commande créée',
      description: `La commande ${newOrder.orderNumber} a été créée avec succès`,
    });
  };

  const columns = [
    { status: 'PENDING' as OrderStatus, title: 'En attente', icon: Clock, color: 'yellow' },
    { status: 'PREPARING' as OrderStatus, title: 'En préparation', icon: ChefHat, color: 'orange' },
    { status: 'READY' as OrderStatus, title: 'Prêtes', icon: CheckCircle, color: 'green' },
    { status: 'OUT_FOR_DELIVERY' as OrderStatus, title: 'En livraison', icon: Truck, color: 'purple' },
    { status: 'COMPLETED' as OrderStatus, title: 'Terminées', icon: CheckCircle, color: 'emerald' },
  ];

  const categories = ['all', ...new Set(MENU_ITEMS.map(i => i.category))];
  const filteredMenuItems = selectedCategory === 'all' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(i => i.category === selectedCategory);

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
          <Button className="bg-gradient-to-r from-orange-500 to-red-600" onClick={() => setIsNewOrderOpen(true)}>
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

      {/* New Order Dialog */}
      <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle commande</DialogTitle>
            <DialogDescription>Créez une nouvelle commande pour un client</DialogDescription>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Customer Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type de commande</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'DINE_IN', label: 'Sur place', icon: Utensils },
                    { value: 'TAKEAWAY', label: 'À emporter', icon: Package },
                    { value: 'DELIVERY', label: 'Livraison', icon: Truck },
                  ].map((type) => (
                    <Button
                      key={type.value}
                      variant={orderType === type.value ? 'default' : 'outline'}
                      className={`flex flex-col h-auto py-3 ${orderType === type.value ? 'bg-gradient-to-r from-orange-500 to-red-600' : ''}`}
                      onClick={() => setOrderType(type.value as OrderType)}
                    >
                      <type.icon className="h-5 w-5 mb-1" />
                      <span className="text-xs">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nom du client *</Label>
                  <Input
                    id="customerName"
                    placeholder="Kouamé Jean"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Téléphone *</Label>
                  <Input
                    id="customerPhone"
                    placeholder="07 08 09 10 11"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>

              {orderType === 'DINE_IN' && (
                <div className="space-y-2">
                  <Label htmlFor="tableNumber">Numéro de table</Label>
                  <Input
                    id="tableNumber"
                    placeholder="T-01"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                  />
                </div>
              )}

              {orderType === 'DELIVERY' && (
                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">Adresse de livraison *</Label>
                  <Input
                    id="deliveryAddress"
                    placeholder="Cocody, Riviera 3, Avenue 25"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Instructions spéciales..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </div>

              {/* Order Summary */}
              <Card className="bg-orange-50 dark:bg-orange-950/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent>
                  {orderItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun article ajouté</p>
                  ) : (
                    <div className="space-y-2">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2">
                        {orderType === 'DELIVERY' && (
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Livraison</span>
                            <span>{formatCurrency(deliveryFee)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>{formatCurrency(orderTotal + deliveryFee)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Menu Items */}
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className={selectedCategory === cat ? 'bg-orange-500 hover:bg-orange-600' : ''}
                  >
                    {cat === 'all' ? 'Tous' : cat}
                  </Button>
                ))}
              </div>

              <ScrollArea className="h-[400px]">
                <div className="grid gap-2">
                  {filteredMenuItems.map((item) => {
                    const inOrder = orderItems.find(i => i.id === item.id);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                        </div>
                        {inOrder ? (
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateItemQuantity(item.id, -1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm">{inOrder.quantity}</span>
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateItemQuantity(item.id, 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => addItemToOrder(item)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsNewOrderOpen(false)}>Annuler</Button>
            <Button 
              className="bg-gradient-to-r from-orange-500 to-red-600"
              onClick={createOrder}
              disabled={orderItems.length === 0}
            >
              Créer la commande • {formatCurrency(orderTotal + deliveryFee)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
