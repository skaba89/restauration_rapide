'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  Clock,
  RefreshCcw,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send,
  Package,
  MapPin,
  User,
  Phone,
  ShoppingBag,
  Loader2
} from 'lucide-react';
import { offlineOrders, OfflineOrder } from '@/lib/offline-db';
import { useOfflineStatus, useBackgroundSync } from '@/hooks/use-pwa';
import { useCurrencySafe } from '@/lib/currency-context';

// ============================================
// Order Item Card Component
// ============================================

interface OfflineOrderCardProps {
  order: OfflineOrder;
  onRetry?: (order: OfflineOrder) => void;
  onDelete?: (order: OfflineOrder) => void;
  onView?: (order: OfflineOrder) => void;
}

function OfflineOrderCard({ order, onRetry, onDelete, onView }: OfflineOrderCardProps) {
  const { formatCurrency } = useCurrencySafe();
  const syncStatusColor = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    synced: 'bg-green-100 text-green-700 border-green-300',
    failed: 'bg-red-100 text-red-700 border-red-300',
  };

  const orderTypeIcon = {
    dine_in: <ShoppingBag className="h-4 w-4" />,
    takeaway: <Package className="h-4 w-4" />,
    delivery: <MapPin className="h-4 w-4" />,
  };

  const orderTypeLabel = {
    dine_in: 'Sur place',
    takeaway: 'À emporter',
    delivery: 'Livraison',
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };


  return (
    <Card className={cn(
      'transition-all',
      order.syncStatus === 'failed' && 'border-red-300 dark:border-red-800',
      order.syncStatus === 'pending' && 'border-yellow-300 dark:border-yellow-800'
    )}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold">{order.orderNumber}</span>
            <Badge variant="outline" className="gap-1">
              {orderTypeIcon[order.orderType]}
              {orderTypeLabel[order.orderType]}
            </Badge>
          </div>
          <Badge className={cn('border', syncStatusColor[order.syncStatus])}>
            {order.syncStatus === 'pending' && (
              <>
                <Clock className="h-3 w-3 mr-1" />
                En attente
              </>
            )}
            {order.syncStatus === 'synced' && (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Synchronisé
              </>
            )}
            {order.syncStatus === 'failed' && (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Échec
              </>
            )}
          </Badge>
        </div>

        {/* Customer info */}
        {order.customerName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <User className="h-4 w-4" />
            <span>{order.customerName}</span>
            {order.customerPhone && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <Phone className="h-4 w-4" />
                <span>{order.customerPhone}</span>
              </>
            )}
          </div>
        )}

        {/* Items */}
        <div className="bg-muted/50 rounded-lg p-2 mb-3">
          <p className="text-sm font-medium mb-1">Articles ({order.items.length})</p>
          <div className="space-y-1">
            {order.items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span>{item.quantity}× {item.name}</span>
                <span className="text-muted-foreground">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            {order.items.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{order.items.length - 3} autre(s) article(s)
              </p>
            )}
          </div>
        </div>

        {/* Total & Time */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatTime(order.createdAt)}
          </div>
          <span className="font-bold text-lg">{formatCurrency(order.total)}</span>
        </div>

        {/* Sync attempts */}
        {order.syncAttempts > 0 && (
          <div className="text-xs text-muted-foreground mb-3">
            Tentatives de sync: {order.syncAttempts}
            {order.lastSyncAttempt && (
              <span className="ml-2">
                (dernière: {formatTime(order.lastSyncAttempt)})
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onView && (
            <Button variant="outline" size="sm" onClick={() => onView(order)}>
              <Eye className="h-4 w-4 mr-1" />
              Détails
            </Button>
          )}
          {order.syncStatus !== 'synced' && onRetry && (
            <Button variant="outline" size="sm" onClick={() => onRetry(order)}>
              <RefreshCcw className="h-4 w-4 mr-1" />
              Réessayer
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive ml-auto"
              onClick={() => onDelete(order)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Supprimer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Order Detail Dialog
// ============================================

interface OrderDetailDialogProps {
  order: OfflineOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function OrderDetailDialog({ order, open, onOpenChange }: OrderDetailDialogProps) {
  const { formatCurrency } = useCurrencySafe();
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Commande {order.orderNumber}</DialogTitle>
          <DialogDescription>
            Créée le {new Date(order.createdAt).toLocaleString('fr-FR')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Statut:</span>
            <Badge variant={order.syncStatus === 'synced' ? 'default' : 'outline'}>
              {order.syncStatus}
            </Badge>
          </div>

          {/* Customer */}
          {order.customerName && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Client</p>
              <p className="text-sm">{order.customerName}</p>
              {order.customerPhone && (
                <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
              )}
              {order.deliveryAddress && (
                <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
              )}
            </div>
          )}

          {/* Items */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Articles</p>
            <div className="bg-muted rounded-lg p-3 space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{item.quantity}× {item.name}</span>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground">{item.notes}</p>
                    )}
                  </div>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Notes</p>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="font-bold">Total</span>
            <span className="font-bold text-lg">{formatCurrency(order.total)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Offline Order Queue Component
// ============================================

interface OfflineOrderQueueProps {
  className?: string;
}

export function OfflineOrderQueue({ className }: OfflineOrderQueueProps) {
  const [orders, setOrders] = useState<OfflineOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OfflineOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const { isOnline } = useOfflineStatus();
  const { forceSync } = useBackgroundSync();

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const allOrders = await offlineOrders.getAll();
      // Sort by date descending, pending/failed first
      const sorted = allOrders.sort((a, b) => {
        // Prioritize pending and failed
        if (a.syncStatus === 'pending' && b.syncStatus !== 'pending') return -1;
        if (b.syncStatus === 'pending' && a.syncStatus !== 'pending') return 1;
        if (a.syncStatus === 'failed' && b.syncStatus === 'synced') return -1;
        if (b.syncStatus === 'failed' && a.syncStatus === 'synced') return 1;
        // Then by date
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setOrders(sorted);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleRetry = async (order: OfflineOrder) => {
    if (!isOnline) {
      alert('Vous devez être en ligne pour synchroniser les commandes.');
      return;
    }

    setIsSyncing(true);
    try {
      // Attempt to sync
      await forceSync();
      await loadOrders();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async (order: OfflineOrder) => {
    if (confirm(`Supprimer la commande ${order.orderNumber} ?`)) {
      await offlineOrders.delete(order.id);
      await loadOrders();
    }
  };

  const handleView = (order: OfflineOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleSyncAll = async () => {
    if (!isOnline) {
      alert('Vous devez être en ligne pour synchroniser les commandes.');
      return;
    }

    setIsSyncing(true);
    try {
      await forceSync();
      await loadOrders();
    } catch (error) {
      console.error('Sync all failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const pendingOrders = orders.filter(o => o.syncStatus === 'pending' || o.syncStatus === 'failed');
  const syncedOrders = orders.filter(o => o.syncStatus === 'synced');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Commandes hors ligne</h3>
          <p className="text-sm text-muted-foreground">
            {pendingOrders.length} en attente • {syncedOrders.length} synchronisées
          </p>
        </div>
        {pendingOrders.length > 0 && (
          <Button 
            onClick={handleSyncAll} 
            disabled={!isOnline || isSyncing}
            className="gap-2"
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Synchronisation...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Tout synchroniser
              </>
            )}
          </Button>
        )}
      </div>

      {/* Offline warning */}
      {!isOnline && pendingOrders.length > 0 && (
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950">
          <CardContent className="p-3 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Vous êtes hors ligne. Les commandes seront synchronisées automatiquement lors de la reconnexion.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="font-medium">Aucune commande en attente</p>
            <p className="text-sm text-muted-foreground">
              Toutes les commandes ont été synchronisées
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Pending Orders */}
          {pendingOrders.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                En attente de synchronisation ({pendingOrders.length})
              </h4>
              <ScrollArea className="max-h-96">
                <div className="space-y-3 pr-4">
                  {pendingOrders.map((order) => (
                    <OfflineOrderCard
                      key={order.id}
                      order={order}
                      onRetry={handleRetry}
                      onDelete={handleDelete}
                      onView={handleView}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Synced Orders */}
          {syncedOrders.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Synchronisées ({syncedOrders.length})
              </h4>
              <ScrollArea className="max-h-64">
                <div className="space-y-3 pr-4">
                  {syncedOrders.slice(0, 10).map((order) => (
                    <OfflineOrderCard
                      key={order.id}
                      order={order}
                      onView={handleView}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}

      {/* Order Detail Dialog */}
      <OrderDetailDialog
        order={selectedOrder}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}

export default OfflineOrderQueue;
