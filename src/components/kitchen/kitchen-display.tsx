'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  ChefHat,
  CheckCircle,
  AlertTriangle,
  Bell,
  Volume2,
  VolumeX,
  RefreshCw,
  Timer,
  Flame,
  Filter,
  Check,
  X,
  Play,
  Package,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

interface KitchenOrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  isVegan?: boolean;
  isSpicy?: boolean;
  isHalal?: boolean;
  status: string;
}

interface KitchenOrder {
  id: string;
  orderNumber: string;
  tableNumber?: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  items: KitchenOrderItem[];
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED';
  priority: 'normal' | 'high' | 'urgent';
  createdAt: string;
  estimatedTime: number;
  customerName?: string;
  notes?: string;
}

// Sound notification class
class KitchenSoundNotifier {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  playNewOrder() {
    if (!this.enabled || !this.audioContext) return;
    this.playTone(800, 0.1, 0);
    this.playTone(1000, 0.1, 100);
    this.playTone(1200, 0.15, 200);
  }

  playReady() {
    if (!this.enabled || !this.audioContext) return;
    this.playTone(600, 0.15, 0);
    this.playTone(800, 0.15, 150);
    this.playTone(1000, 0.2, 300);
  }

  playUrgent() {
    if (!this.enabled || !this.audioContext) return;
    for (let i = 0; i < 3; i++) {
      this.playTone(1000, 0.1, i * 150);
      this.playTone(1200, 0.1, i * 150 + 75);
    }
  }

  private playTone(frequency: number, duration: number, delay: number) {
    if (!this.audioContext) return;
    
    setTimeout(() => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext!.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + duration);
      
      oscillator.start(this.audioContext!.currentTime);
      oscillator.stop(this.audioContext!.currentTime + duration);
    }, delay);
  }
}

// Demo orders for development
const DEMO_ORDERS: KitchenOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-0145',
    tableNumber: '5',
    orderType: 'DINE_IN',
    items: [
      { id: 'i1', name: 'Thiéboudienne', quantity: 2, notes: 'Sans piment', status: 'pending' },
      { id: 'i2', name: 'Bissap', quantity: 2, status: 'pending' },
    ],
    status: 'PENDING',
    priority: 'normal',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    estimatedTime: 20,
    customerName: 'Amadou Diallo',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-0144',
    orderType: 'TAKEAWAY',
    items: [
      { id: 'i3', name: 'Yassa Poulet', quantity: 1, status: 'pending' },
      { id: 'i4', name: 'Attiéké', quantity: 2, status: 'pending' },
    ],
    status: 'PREPARING',
    priority: 'high',
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    estimatedTime: 15,
    customerName: 'Fatou Sylla',
    notes: 'Client pressé',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-0143',
    tableNumber: '12',
    orderType: 'DINE_IN',
    items: [
      { id: 'i5', name: 'Kedjenou', quantity: 2, isSpicy: true, status: 'preparing' },
      { id: 'i6', name: 'Alloco', quantity: 3, status: 'preparing' },
      { id: 'i7', name: 'Jus de Gingembre', quantity: 2, status: 'preparing' },
    ],
    status: 'PREPARING',
    priority: 'urgent',
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
    estimatedTime: 25,
    customerName: 'Ibrahima Keita',
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-0142',
    orderType: 'DELIVERY',
    items: [
      { id: 'i8', name: 'Riz Gras', quantity: 1, status: 'pending' },
      { id: 'i9', name: 'Poulet Braisé', quantity: 2, status: 'pending' },
    ],
    status: 'PENDING',
    priority: 'high',
    createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
    estimatedTime: 20,
    customerName: 'Mariama Touré',
    notes: 'Sans oignon',
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-0141',
    tableNumber: '8',
    orderType: 'DINE_IN',
    items: [
      { id: 'i10', name: 'Maafe', quantity: 3, isHalal: true, status: 'ready' },
      { id: 'i11', name: 'Foutou', quantity: 3, status: 'ready' },
    ],
    status: 'READY',
    priority: 'normal',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    estimatedTime: 20,
    customerName: 'Seydou Bamba',
  },
];

export function KitchenDisplay() {
  const [orders, setOrders] = useState<KitchenOrder[]>(DEMO_ORDERS);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'normal' | 'high' | 'urgent'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const soundRef = useRef<KitchenSoundNotifier | null>(null);
  const previousOrdersRef = useRef<KitchenOrder[]>([]);

  // Initialize sound notifier
  useEffect(() => {
    soundRef.current = new KitchenSoundNotifier();
    return () => {
      soundRef.current = null;
    };
  }, []);

  // Update sound enabled state
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setEnabled(soundEnabled);
    }
  }, [soundEnabled]);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/orders?demo=true&status=PENDING,CONFIRMED,PREPARING,READY');
      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data.data) && data.data.data.length > 0) {
        const previousIds = previousOrdersRef.current.map(o => o.id);
        const newOrders = data.data.data.filter((o: KitchenOrder) => !previousIds.includes(o.id));
        
        // Play sound for new orders
        if (newOrders.length > 0 && soundRef.current) {
          const hasUrgent = newOrders.some((o: KitchenOrder) => o.priority === 'urgent');
          if (hasUrgent) {
            soundRef.current.playUrgent();
          } else {
            soundRef.current.playNewOrder();
          }
          toast.info(`Nouvelle commande reçue!`, { icon: '🔔' });
        }
        
        // Transform API orders to kitchen format
        const kitchenOrders: KitchenOrder[] = data.data.data.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          tableNumber: order.tableNumber,
          orderType: order.orderType,
          items: order.items?.map((item: any) => ({
            id: item.id,
            name: item.itemName,
            quantity: item.quantity,
            notes: item.notes,
            status: item.status,
          })) || [],
          status: order.status,
          priority: order.priority || 'normal',
          createdAt: order.createdAt,
          estimatedTime: order.estimatedTime || 20,
          customerName: order.customerName,
          notes: order.notes,
        }));
        
        previousOrdersRef.current = kitchenOrders;
        setOrders(kitchenOrders);
      }
      // If API returns no orders or fails, keep using current/demo data
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // Keep using demo data on error
    }
  }, []);

  // Polling for real-time updates
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Update elapsed time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => prev.map(order => ({
        ...order,
      })));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate elapsed minutes
  const getElapsedMinutes = (createdAt: string) => {
    return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  };

  // Update order status via API
  const updateOrderStatus = async (orderId: string, newStatus: KitchenOrder['status']) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      
      if (response.ok) {
        setOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, status: newStatus } : o
        ));
        
        if (soundRef.current && newStatus === 'READY') {
          soundRef.current.playReady();
        }
        
        toast.success(`Commande ${newStatus === 'PREPARING' ? 'en préparation' : newStatus === 'READY' ? 'prête!' : 'mise à jour'}`);
      }
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Complete order (remove from display)
  const completeOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'COMPLETED');
    setOrders(prev => prev.filter(o => o.id !== orderId));
    toast.success('Commande servie');
  };

  // Cancel order
  const cancelOrder = async (orderId: string) => {
    try {
      await fetch(`/api/orders?id=${orderId}&reason=Cancelled from kitchen`, { method: 'DELETE' });
      setOrders(prev => prev.filter(o => o.id !== orderId));
      toast.success('Commande annulée');
    } catch (error) {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  // Get orders by status with priority filter
  const getFilteredOrders = (status: string) => {
    return orders
      .filter(o => o.status === status)
      .filter(o => priorityFilter === 'all' || o.priority === priorityFilter)
      .sort((a, b) => {
        // Sort by priority first, then by creation time
        const priorityOrder = { urgent: 0, high: 1, normal: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  };

  const pendingOrders = getFilteredOrders('PENDING');
  const preparingOrders = getFilteredOrders('PREPARING');
  const readyOrders = getFilteredOrders('READY');

  // Stats
  const totalOrders = orders.length;
  const urgentCount = orders.filter(o => o.priority === 'urgent' && o.status !== 'READY' && o.status !== 'COMPLETED').length;
  const avgWaitTime = orders.length > 0 
    ? Math.round(orders.reduce((sum, o) => sum + getElapsedMinutes(o.createdAt), 0) / orders.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-xl font-bold">Kitchen Display</h1>
              <p className="text-gray-400 text-xs">KFM DELICE - Conakry</p>
            </div>
          </div>
          
          {/* Priority filter */}
          <div className="flex items-center gap-1 ml-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600"
            >
              <option value="all">Toutes priorités</option>
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 Haute</option>
              <option value="normal">🟢 Normale</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm">
            {/* Urgent indicator */}
            {urgentCount > 0 && (
              <div className="flex items-center gap-1 text-red-400 animate-pulse">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-bold">{urgentCount} URGENT</span>
              </div>
            )}
            
            {/* Last update */}
            <div className="flex items-center gap-1 text-gray-400">
              <RefreshCw className="w-4 h-4" />
              <span>{lastUpdate.toLocaleTimeString('fr-FR')}</span>
            </div>
            
            {/* Sound toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`text-white ${soundEnabled ? 'bg-green-600/20' : 'bg-gray-700'}`}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-800/50 px-4 py-2 flex gap-6 items-center border-b border-gray-700">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">{pendingOrders.length}</span>
            <span className="text-gray-400">en attente</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-medium">{preparingOrders.length}</span>
            <span className="text-gray-400">en préparation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="font-medium">{readyOrders.length}</span>
            <span className="text-gray-400">prêtes</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Timer className="w-4 h-4" />
            <span>Attente moy: {avgWaitTime} min</span>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Columns */}
      <div className="grid grid-cols-3 gap-4 p-4 h-[calc(100vh-140px)]">
        {/* Pending Column */}
        <div className="bg-gray-800 rounded-xl overflow-hidden flex flex-col">
          <div className="bg-yellow-500 text-black px-4 py-3 font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>EN ATTENTE</span>
            </div>
            <Badge className="bg-black/20 text-white">{pendingOrders.length}</Badge>
          </div>
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {pendingOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  elapsedMinutes={getElapsedMinutes(order.createdAt)}
                  onAction={() => updateOrderStatus(order.id, 'PREPARING')}
                  onSecondaryAction={() => cancelOrder(order.id)}
                  actionLabel="Commencer"
                  actionIcon={<Play className="w-4 h-4" />}
                  actionColor="bg-orange-500 hover:bg-orange-600"
                  showTimer
                />
              ))}
              {pendingOrders.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  Aucune commande en attente
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Preparing Column */}
        <div className="bg-gray-800 rounded-xl overflow-hidden flex flex-col">
          <div className="bg-orange-500 text-white px-4 py-3 font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5" />
              <span>EN PRÉPARATION</span>
            </div>
            <Badge className="bg-white/20">{preparingOrders.length}</Badge>
          </div>
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {preparingOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  elapsedMinutes={getElapsedMinutes(order.createdAt)}
                  onAction={() => updateOrderStatus(order.id, 'READY')}
                  actionLabel="Prête!"
                  actionIcon={<Check className="w-4 h-4" />}
                  actionColor="bg-green-500 hover:bg-green-600"
                  showTimer
                />
              ))}
              {preparingOrders.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Flame className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  Aucune préparation en cours
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Ready Column */}
        <div className="bg-gray-800 rounded-xl overflow-hidden flex flex-col">
          <div className="bg-green-500 text-white px-4 py-3 font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>PRÊTES</span>
            </div>
            <Badge className="bg-white/20">{readyOrders.length}</Badge>
          </div>
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {readyOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  elapsedMinutes={getElapsedMinutes(order.createdAt)}
                  onAction={() => completeOrder(order.id)}
                  actionLabel="Servie"
                  actionIcon={<Check className="w-4 h-4" />}
                  actionColor="bg-blue-500 hover:bg-blue-600"
                />
              ))}
              {readyOrders.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  Aucune commande prête
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

// Order Card Component
function OrderCard({
  order,
  elapsedMinutes,
  onAction,
  onSecondaryAction,
  actionLabel,
  actionIcon,
  actionColor,
  showTimer = false,
}: {
  order: KitchenOrder;
  elapsedMinutes: number;
  onAction: () => void;
  onSecondaryAction?: () => void;
  actionLabel: string;
  actionIcon?: React.ReactNode;
  actionColor: string;
  showTimer?: boolean;
}) {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-4 border-l-red-500 bg-red-900/20';
      case 'high': return 'border-l-4 border-l-orange-500 bg-orange-900/20';
      default: return 'border-l-4 border-l-gray-600';
    }
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'DINE_IN': return <Users className="w-3 h-3" />;
      case 'TAKEAWAY': return <Package className="w-3 h-3" />;
      case 'DELIVERY': return <Package className="w-3 h-3" />;
      default: return null;
    }
  }
  
  const isOverdue = elapsedMinutes > order.estimatedTime;
  const progress = order.status === 'READY' ? 100 : order.status === 'PREPARING' ? 50 : 0;

  return (
    <Card className={`bg-gray-700 border-0 ${getPriorityStyle(order.priority)}`}>
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{order.orderNumber}</span>
            {order.tableNumber && (
              <Badge variant="outline" className="text-white border-white/30">
                Table {order.tableNumber}
              </Badge>
            )}
            <Badge variant="outline" className="text-white border-white/30 flex items-center gap-1">
              {getOrderTypeIcon(order.orderType)}
              {order.orderType === 'DINE_IN' ? 'Sur place' : order.orderType === 'TAKEAWAY' ? 'À emporter' : 'Livraison'}
            </Badge>
          </div>
          {order.priority === 'urgent' && (
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
          )}
        </div>

        {/* Customer info */}
        {order.customerName && (
          <div className="text-xs text-gray-400 mb-2">
            Client: {order.customerName}
          </div>
        )}

        {/* Items */}
        <div className="space-y-1 mb-3">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {item.quantity}
                </span>
                <span>{item.name}</span>
                {item.isSpicy && <span className="text-red-400">🌶️</span>}
                {item.isVegan && <span className="text-green-400">🌱</span>}
                {item.isHalal && <span className="text-green-400">☪️</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {order.items.some(i => i.notes) && (
          <div className="bg-gray-600 rounded p-2 mb-2 text-xs">
            {order.items.filter(i => i.notes).map(i => (
              <p key={i.id} className="text-yellow-300">📝 {i.name}: {i.notes}</p>
            ))}
          </div>
        )}
        
        {/* Order notes */}
        {order.notes && (
          <div className="bg-yellow-600/20 rounded p-2 mb-2 text-xs text-yellow-200">
            📝 {order.notes}
          </div>
        )}

        {/* Timer & Progress */}
        {showTimer && (
          <div className="mb-3">
            <div className={`flex items-center justify-between text-xs mb-1 ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
              <div className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                <span>{elapsedMinutes} / {order.estimatedTime} min</span>
              </div>
              {isOverdue && <span className="text-red-400 font-bold animate-pulse">EN RETARD!</span>}
            </div>
            <Progress 
              value={Math.min((elapsedMinutes / order.estimatedTime) * 100, 100)} 
              className={`h-1 ${isOverdue ? 'bg-red-900' : ''}`}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            className={`flex-1 ${actionColor}`}
            onClick={onAction}
          >
            {actionIcon}
            <span className="ml-1">{actionLabel}</span>
          </Button>
          {onSecondaryAction && (
            <Button
              variant="destructive"
              size="icon"
              onClick={onSecondaryAction}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
