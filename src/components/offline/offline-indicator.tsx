'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  RefreshCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowUp,
  X
} from 'lucide-react';
import { useOfflineStatus, useBackgroundSync } from '@/hooks/use-pwa';
import { getSyncStatus, SyncStatus } from '@/lib/offline-db';

// ============================================
// Offline Banner Component
// ============================================

interface OfflineBannerProps {
  className?: string;
  onDismiss?: () => void;
}

export function OfflineBanner({ className, onDismiss }: OfflineBannerProps) {
  const { isOnline, wasOffline } = useOfflineStatus();
  const [dismissed, setDismissed] = useState(false);

  // Show banner when offline or when coming back online (but not dismissed)
  const showBanner = useMemo(() => {
    if (dismissed) return false;
    if (!isOnline) return true;
    if (wasOffline) return true;
    return false;
  }, [isOnline, wasOffline, dismissed]);

  // Auto-hide after coming back online
  useEffect(() => {
    if (isOnline && wasOffline && !dismissed) {
      const timer = setTimeout(() => setDismissed(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, dismissed]);

  // Reset dismissed when going offline again
  useEffect(() => {
    if (!isOnline) {
      setDismissed(false);
    }
  }, [isOnline]);

  if (!showBanner) return null;

  return (
    <div className={cn(
      'fixed top-0 left-0 right-0 z-50 p-2',
      className
    )}>
      <Card className={cn(
        'max-w-md mx-auto shadow-lg border-2',
        isOnline ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'
      )}>
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <>
                <Wifi className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-700 dark:text-green-300">
                  Connexion rétablie
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-700 dark:text-red-300">
                  Mode hors ligne actif
                </span>
              </>
            )}
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                setDismissed(true);
                onDismiss();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Sync Status Banner Component
// ============================================

interface SyncStatusBannerProps {
  className?: string;
}

export function SyncStatusBanner({ className }: SyncStatusBannerProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const { isOnline } = useOfflineStatus();
  const { forceSync, syncing } = useBackgroundSync();

  useEffect(() => {
    const loadStatus = async () => {
      const status = await getSyncStatus();
      setSyncStatus(status);
    };
    loadStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalPending = syncStatus 
    ? syncStatus.pendingOrders + syncStatus.pendingCustomers + syncStatus.pendingPayments
    : 0;

  if (!syncStatus || totalPending === 0) return null;

  const handleSync = async () => {
    if (isOnline && !syncing) {
      await forceSync();
      const newStatus = await getSyncStatus();
      setSyncStatus({ ...newStatus, isSyncing: false });
    }
  };

  return (
    <Card className={cn('border-amber-500 bg-amber-50 dark:bg-amber-950', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
              <CloudOff className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                {totalPending} élément{totalPending > 1 ? 's' : ''} en attente de synchronisation
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {syncStatus.pendingOrders > 0 && `${syncStatus.pendingOrders} commande${syncStatus.pendingOrders > 1 ? 's' : ''}`}
                {syncStatus.pendingCustomers > 0 && ` • ${syncStatus.pendingCustomers} client${syncStatus.pendingCustomers > 1 ? 's' : ''}`}
                {syncStatus.pendingPayments > 0 && ` • ${syncStatus.pendingPayments} paiement${syncStatus.pendingPayments > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={!isOnline || syncing}
            className="gap-2"
          >
            {syncing ? (
              <>
                <RefreshCcw className="h-4 w-4 animate-spin" />
                Synchronisation...
              </>
            ) : (
              <>
                <ArrowUp className="h-4 w-4" />
                Synchroniser
              </>
            )}
          </Button>
        </div>

        {syncStatus.errors.length > 0 && (
          <div className="mt-3 p-2 bg-red-100 dark:bg-red-900 rounded text-sm text-red-700 dark:text-red-300">
            {syncStatus.errors.map((error, i) => (
              <p key={i}>{error}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Offline Status Indicator (Compact)
// ============================================

interface OfflineIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export function OfflineIndicator({ className, showLabel = true }: OfflineIndicatorProps) {
  const { isOnline } = useOfflineStatus();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const { syncing } = useBackgroundSync();

  useEffect(() => {
    const loadStatus = async () => {
      const status = await getSyncStatus();
      setSyncStatus(status);
    };
    loadStatus();
  }, []);

  const pendingCount = syncStatus 
    ? syncStatus.pendingOrders + syncStatus.pendingCustomers + syncStatus.pendingPayments
    : 0;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Online/Offline status */}
      <div className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
        isOnline 
          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      )}>
        {isOnline ? (
          <>
            <Wifi className="h-3.5 w-3.5" />
            {showLabel && <span>En ligne</span>}
          </>
        ) : (
          <>
            <WifiOff className="h-3.5 w-3.5" />
            {showLabel && <span>Hors ligne</span>}
          </>
        )}
      </div>

      {/* Pending sync count */}
      {pendingCount > 0 && (
        <Badge 
          variant="outline" 
          className={cn(
            'gap-1 text-xs',
            syncing && 'animate-pulse'
          )}
        >
          {syncing ? (
            <RefreshCcw className="h-3 w-3 animate-spin" />
          ) : (
            <CloudOff className="h-3 w-3" />
          )}
          {pendingCount}
        </Badge>
      )}
    </div>
  );
}

// ============================================
// Sync Progress Component
// ============================================

interface SyncProgressProps {
  total: number;
  completed: number;
  className?: string;
}

export function SyncProgress({ total, completed, className }: SyncProgressProps) {
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          <RefreshCcw className="h-4 w-4 animate-spin" />
          Synchronisation en cours...
        </span>
        <span className="text-muted-foreground">
          {completed}/{total}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

// ============================================
// Last Sync Info Component
// ============================================

interface LastSyncInfoProps {
  lastSync: Date | null;
  className?: string;
}

export function LastSyncInfo({ lastSync, className }: LastSyncInfoProps) {
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`;
    return `Il y a ${Math.floor(seconds / 86400)} j`;
  };

  return (
    <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
      <Clock className="h-4 w-4" />
      {lastSync ? (
        <span>Dernière sync: {formatTimeAgo(lastSync)}</span>
      ) : (
        <span>Jamais synchronisé</span>
      )}
    </div>
  );
}

// ============================================
// Connection Status Card
// ============================================

interface ConnectionStatusCardProps {
  className?: string;
}

export function ConnectionStatusCard({ className }: ConnectionStatusCardProps) {
  const { isOnline, wasOffline } = useOfflineStatus();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const { forceSync, syncing } = useBackgroundSync();

  useEffect(() => {
    const loadStatus = async () => {
      const status = await getSyncStatus();
      setSyncStatus(status);
    };
    loadStatus();
  }, [isOnline]);

  const handleManualSync = async () => {
    if (isOnline && !syncing) {
      await forceSync();
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-full',
              isOnline ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            )}>
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {isOnline ? 'Connecté' : 'Hors ligne'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isOnline 
                  ? 'Toutes les données seront synchronisées automatiquement'
                  : 'Les données seront sauvegardées localement'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {syncStatus?.lastSync && (
              <LastSyncInfo lastSync={syncStatus.lastSync} />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSync}
              disabled={!isOnline || syncing}
              className="gap-2"
            >
              <RefreshCcw className={cn('h-4 w-4', syncing && 'animate-spin')} />
              Sync
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default OfflineBanner;
