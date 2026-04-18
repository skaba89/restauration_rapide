'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Clock,
  ChefHat,
  CheckCircle,
  AlertTriangle,
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
  Loader2,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { useKitchenSync } from '@/hooks/use-order-sync';

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

// Sound notification class - lazy AudioContext to avoid autoplay restrictions
class KitchenSoundNotifier {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (typeof window === 'undefined') return null;
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
      } catch (e) {
        console.warn('AudioContext not available:', e);
        return null;
      }
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  playNewOrder() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.playTone(ctx, 800, 0.1, 0);
    this.playTone(ctx, 1000, 0.1, 100);
    this.playTone(ctx, 1200, 0.15, 200);
  }

  playReady() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.playTone(ctx, 600, 0.15, 0);
    this.playTone(ctx, 800, 0.15, 150);
    this.playTone(ctx, 1000, 0.2, 300);
  }

  playUrgent() {
    const ctx = this.getContext();
    if (!ctx) return;
    for (let i = 0; i < 3; i++) {
      this.playTone(ctx, 1000, 0.1, i * 150);
      this.playTone(ctx, 1200, 0.1, i * 150 + 75);
    }
  }

  private playTone(ctx: AudioContext, frequency: number, duration: number, delay: number) {
    setTimeout(() => {
      try {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
      } catch (e) { /* ignore audio errors */ }
    }, delay);
  }
}

export function KitchenDisplay() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [mounted, setMounted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'normal' | 'high' | 'urgent'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const soundRef = useRef<KitchenSoundNotifier | null>(null);

  // Real-time sync via Pusher
  const { isConnected: isPusherConnected, lastEvent: syncEvent, clearEvent: clearSyncEvent } = useKitchenSync();

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
      const response = await fetch('/api/orders?status=PENDING,CONFIRMED,PREPARING,READY&limit=200');
      const data = await response.json();

      if (data.success && data.data && Array.isArray(data.data.data)) {
        // Always update orders - even if 0 results (BUG FIX: was checking length > 0)
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

        setOrders(kitchenOrders);
      }
      setIsLoading(false);
      setLastUpdate(new Date().toLocaleTimeString('fr-FR'));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setIsLoading(false);
      setLastUpdate(new Date().toLocaleTimeString('fr-FR'));
    }
  }, []);

  // Polling for real-time updates (fallback when Pusher is not configured)
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // React to Pusher sync events
  useEffect(() => {
    if (syncEvent) {
      fetchOrders();
      if (syncEvent.status === 'PENDING' && soundRef.current) {
        soundRef.current.playNewOrder();
        toast.info('Nouvelle commande reçue via temps réel!', { icon: '🔔' });
      } else if (syncEvent.status === 'CANCELLED' && soundRef.current) {
        toast.info(`Commande ${syncEvent.orderNumber} annulée`, { icon: '❌' });
      }
      clearSyncEvent();
    }
  }, [syncEvent, fetchOrders, clearSyncEvent]);

  // Client-only mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update elapsed time every 30s
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setOrders(prev => [...prev]);
    }, 30000);
    return () => clearInterval(interval);
  }, [mounted]);

  // Calculate elapsed minutes
  const getElapsedMinutes = (createdAt: string) => {
    return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  };

  // Status label map
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'en attente',
      CONFIRMED: 'confirmée',
      PREPARING: 'en préparation',
      READY: 'prête',
      COMPLETED: 'servie',
    };
    return labels[status] || status;
  };

  // Update order status via API - FIXED: refetch after update, proper error handling
  const updateOrderStatus = async (orderId: string, newStatus: KitchenOrder['status']) => {
    if (actionInProgress === orderId) return; // Prevent double-click
    setActionInProgress(orderId);

    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });

      if (response.ok) {
        // Optimistic update + immediate refetch for consistency
        setOrders(prev => prev.map(o =>
          o.id === orderId ? { ...o, status: newStatus } : o
        ));

        // Sound feedback
        if (soundRef.current) {
          if (newStatus === 'READY') soundRef.current.playReady();
          else if (newStatus === 'PREPARING') soundRef.current.playNewOrder();
        }

        toast.success(`Commande ${getStatusLabel(newStatus)}`);

        // Immediate refetch to sync with server store (BUG FIX: was relying only on polling)
        setTimeout(() => fetchOrders(), 300);
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.message || `Erreur lors de la mise à jour (${response.status})`);
      }
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Erreur réseau lors de la mise à jour');
    } finally {
      setActionInProgress(null);
    }
  };

  // Complete order - FIXED: await updateOrderStatus to avoid race condition
  const completeOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'COMPLETED');
    // Remove from display after the status update completes
    setOrders(prev => prev.filter(o => o.id !== orderId));
    toast.success('Commande servie');
  };

  // Cancel order
  const cancelOrder = async (orderId: string) => {
    if (actionInProgress === orderId) return;
    setActionInProgress(orderId);
    try {
      const response = await fetch(`/api/orders?id=${orderId}&reason=Cancelled from kitchen`, { method: 'DELETE' });
      if (response.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        toast.success('Commande annulée');
        setTimeout(() => fetchOrders(), 300);
      } else {
        toast.error("Erreur lors de l'annulation");
      }
    } catch (error) {
      toast.error("Erreur réseau lors de l'annulation");
    } finally {
      setActionInProgress(null);
    }
  };

  // Get orders by status with priority filter
  const getFilteredOrders = (status: string) => {
    return orders
      .filter(o => o.status === status)
      .filter(o => priorityFilter === 'all' || o.priority === priorityFilter)
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, normal: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  };

  // Merge PENDING + CONFIRMED for the "En attente" column (CONFIRMED is fetched but has no column)
  const pendingOrders = [
    ...getFilteredOrders('CONFIRMED'),
    ...getFilteredOrders('PENDING'),
  ];
  const preparingOrders = getFilteredOrders('PREPARING');
  const readyOrders = getFilteredOrders('READY');

  // Stats
  const urgentCount = orders.filter(o => o.priority === 'urgent' && o.status !== 'READY' && o.status !== 'COMPLETED').length;
  const avgWaitTime = orders.length > 0
    ? Math.round(orders.reduce((sum, o) => sum + getElapsedMinutes(o.createdAt), 0) / orders.length)
    : 0;

  return (
    <div className="h-[calc(100vh-8rem)] bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700 flex-shrink-0">
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
              name="kitchen-priority-filter"
              id="kitchen-priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600"
            >
              <option value="all">Toutes priorités</option>
              <option value="urgent">Urgent</option>
              <option value="high">Haute</option>
              <option value="normal">Normale</option>
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

            {/* Sync indicator */}
            <div className={`flex items-center gap-1 ${isPusherConnected ? 'text-green-400' : 'text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${isPusherConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
              <span className="text-xs">{isPusherConnected ? 'Sync' : 'Polling'}</span>
            </div>

            {/* Last update */}
            <div className="flex items-center gap-1 text-gray-400">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{mounted ? lastUpdate : '--:--:--'}</span>
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
      <div className="bg-gray-800/50 px-4 py-2 flex gap-6 items-center border-b border-gray-700 flex-shrink-0">
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

      {/* Loading State */}
      {isLoading && !mounted && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          <span className="ml-3 text-gray-400">Chargement des commandes...</span>
        </div>
      )}

      {/* Main Content - 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 flex-1 min-h-0">
        {/* Pending Column (PENDING + CONFIRMED) */}
        <div className="bg-gray-800 rounded-xl overflow-hidden flex flex-col min-h-0">
          <div className="bg-yellow-500 text-black px-4 py-3 font-bold flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>EN ATTENTE</span>
            </div>
            <Badge className="bg-black/20 text-white">{pendingOrders.length}</Badge>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full p-3">
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
                    isProcessing={actionInProgress === order.id}
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
        </div>

        {/* Preparing Column */}
        <div className="bg-gray-800 rounded-xl overflow-hidden flex flex-col min-h-0">
          <div className="bg-orange-500 text-white px-4 py-3 font-bold flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5" />
              <span>EN PREPARATION</span>
            </div>
            <Badge className="bg-white/20">{preparingOrders.length}</Badge>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full p-3">
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
                    isProcessing={actionInProgress === order.id}
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
        </div>

        {/* Ready Column */}
        <div className="bg-gray-800 rounded-xl overflow-hidden flex flex-col min-h-0">
          <div className="bg-green-500 text-white px-4 py-3 font-bold flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>PRETES</span>
            </div>
            <Badge className="bg-white/20">{readyOrders.length}</Badge>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full p-3">
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
                    isProcessing={actionInProgress === order.id}
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
  isProcessing = false,
}: {
  order: KitchenOrder;
  elapsedMinutes: number;
  onAction: () => void;
  onSecondaryAction?: () => void;
  actionLabel: string;
  actionIcon?: React.ReactNode;
  actionColor: string;
  showTimer?: boolean;
  isProcessing?: boolean;
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
              {order.orderType === 'DINE_IN' ? 'Sur place' : order.orderType === 'TAKEAWAY' ? 'A emporter' : 'Livraison'}
            </Badge>
            {order.status === 'CONFIRMED' && (
              <Badge className="bg-blue-500 text-white text-xs">Confirmee</Badge>
            )}
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

        {/* Item-level notes */}
        {order.items.some(i => i.notes) && (
          <div className="bg-gray-600 rounded p-2 mb-2 text-xs">
            {order.items.filter(i => i.notes).map(i => (
              <p key={i.id} className="text-yellow-300">📝 {i.name}: {i.notes}</p>
            ))}
          </div>
        )}

        {/* Order-level notes */}
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
            className={`flex-1 ${actionColor} ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={onAction}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              actionIcon
            )}
            <span className="ml-1">{isProcessing ? 'Traitement...' : actionLabel}</span>
          </Button>
          {onSecondaryAction && (
            <Button
              variant="destructive"
              size="icon"
              onClick={onSecondaryAction}
              disabled={isProcessing}
              className="shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
