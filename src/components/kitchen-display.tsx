'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ChefHat, 
  Bell, 
  Volume2,
  VolumeX,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/loading-states';

// ============================================
// Kitchen Display Types
// ============================================

interface KitchenOrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  addons?: string[];
}

interface KitchenOrder {
  id: string;
  orderNumber: string;
  orderType: 'DINE_IN' | 'DELIVERY' | 'TAKEAWAY';
  tableNumber?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY';
  items: KitchenOrderItem[];
  createdAt: Date;
  estimatedTime: number; // in minutes
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  customerNote?: string;
}

// ============================================
// Kitchen Display Component
// ============================================

interface KitchenDisplayProps {
  restaurantId: string;
  onOrderStatusChange?: (orderId: string, status: string) => void;
}

export function KitchenDisplay({ restaurantId, onOrderStatusChange }: KitchenDisplayProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'preparing' | 'ready'>('pending');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch orders
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['kitchen-orders', restaurantId],
    queryFn: async () => {
      const response = await fetch(`/api/orders?restaurantId=${restaurantId}&status=PENDING,CONFIRMED,PREPARING,READY`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      onOrderStatusChange?.(variables.orderId, variables.status);
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut de la commande a été modifié.',
      });
    },
  });

  // Play notification sound for new orders
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && typeof window !== 'undefined') {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, [soundEnabled]);

  // Group orders by status
  const pendingOrders = orders?.orders?.filter((o: KitchenOrder) => 
    ['PENDING', 'CONFIRMED'].includes(o.status)
  ) || [];
  
  const preparingOrders = orders?.orders?.filter((o: KitchenOrder) => 
    o.status === 'PREPARING'
  ) || [];
  
  const readyOrders = orders?.orders?.filter((o: KitchenOrder) => 
    o.status === 'READY'
  ) || [];

  // Handle status change
  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  // Calculate time elapsed
  const getTimeElapsed = (date: Date) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins;
  };

  // Get time color based on elapsed time
  const getTimeColor = (minutes: number) => {
    if (minutes < 10) return 'text-green-600';
    if (minutes < 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ChefHat className="w-8 h-8 text-orange-500" />
          <h1 className="text-2xl font-bold">Cuisine - Kitchen Display</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-white"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            className="text-white"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
          
          <div className="text-sm">
            {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-yellow-600 border-0">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{pendingOrders.length}</div>
            <div className="text-sm opacity-80">En attente</div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-600 border-0">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{preparingOrders.length}</div>
            <div className="text-sm opacity-80">En préparation</div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-600 border-0">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{readyOrders.length}</div>
            <div className="text-sm opacity-80">Prêtes</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-600">
            En attente ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="preparing" className="data-[state=active]:bg-blue-600">
            En préparation ({preparingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="ready" className="data-[state=active]:bg-green-600">
            Prêtes ({readyOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <OrderGrid
            orders={pendingOrders}
            getTimeElapsed={getTimeElapsed}
            getTimeColor={getTimeColor}
            onAction={(order) => handleStatusChange(order.id, 'PREPARING')}
            actionLabel="Commencer"
            actionColor="bg-blue-600 hover:bg-blue-700"
          />
        </TabsContent>

        <TabsContent value="preparing" className="mt-4">
          <OrderGrid
            orders={preparingOrders}
            getTimeElapsed={getTimeElapsed}
            getTimeColor={getTimeColor}
            onAction={(order) => handleStatusChange(order.id, 'READY')}
            actionLabel="Terminer"
            actionColor="bg-green-600 hover:bg-green-700"
          />
        </TabsContent>

        <TabsContent value="ready" className="mt-4">
          <OrderGrid
            orders={readyOrders}
            getTimeElapsed={getTimeElapsed}
            getTimeColor={getTimeColor}
            onAction={(order) => handleStatusChange(order.id, 'COMPLETED')}
            actionLabel="Servi / Récupéré"
            actionColor="bg-gray-600 hover:bg-gray-700"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================
// Order Grid Component
// ============================================

interface OrderGridProps {
  orders: KitchenOrder[];
  getTimeElapsed: (date: Date) => number;
  getTimeColor: (minutes: number) => string;
  onAction: (order: KitchenOrder) => void;
  actionLabel: string;
  actionColor: string;
}

function OrderGrid({ orders, getTimeElapsed, getTimeColor, onAction, actionLabel, actionColor }: OrderGridProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>Aucune commande dans cette catégorie</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {orders.map((order) => {
        const elapsed = getTimeElapsed(order.createdAt);
        const timeColor = getTimeColor(elapsed);
        const isUrgent = elapsed >= 15;

        return (
          <Card 
            key={order.id} 
            className={`bg-gray-800 border-0 ${isUrgent ? 'ring-2 ring-red-500' : ''}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  #{order.orderNumber.slice(-4)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {order.priority === 'URGENT' && (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                  <Badge variant="outline" className="text-xs">
                    {order.orderType === 'DINE_IN' 
                      ? `Table ${order.tableNumber}`
                      : order.orderType === 'DELIVERY'
                      ? 'Livraison'
                      : 'À emporter'
                    }
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Time elapsed */}
              <div className={`flex items-center gap-2 ${timeColor}`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono text-lg">{elapsed} min</span>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded font-bold">
                      {item.quantity}x
                    </span>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      {item.notes && (
                        <div className="text-xs text-gray-400 italic">
                          Note: {item.notes}
                        </div>
                      )}
                      {item.addons && item.addons.length > 0 && (
                        <div className="text-xs text-gray-400">
                          + {item.addons.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer note */}
              {order.customerNote && (
                <div className="bg-gray-700 p-2 rounded text-sm">
                  <span className="text-gray-400">Note: </span>
                  {order.customerNote}
                </div>
              )}

              {/* Progress */}
              <div className="pt-2">
                <Progress 
                  value={Math.min((elapsed / order.estimatedTime) * 100, 100)} 
                  className="h-2"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Temps estimé: {order.estimatedTime} min
                </div>
              </div>

              {/* Action button */}
              <Button
                className={`w-full ${actionColor} text-white`}
                onClick={() => onAction(order)}
              >
                {actionLabel}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============================================
// Kitchen Order Item Card
// ============================================

interface KitchenOrderItemCardProps {
  item: KitchenOrderItem;
}

export function KitchenOrderItemCard({ item }: KitchenOrderItemCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
      <span className="bg-orange-500 text-white text-sm px-3 py-1 rounded font-bold">
        {item.quantity}x
      </span>
      <div className="flex-1">
        <div className="font-medium">{item.name}</div>
        {item.notes && (
          <div className="text-sm text-gray-400 italic">{item.notes}</div>
        )}
      </div>
    </div>
  );
}

export default KitchenDisplay;
