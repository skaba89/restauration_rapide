'use client';

import { useEffect, useState } from 'react';
import { usePWAInstall, useOfflineStatus, useServiceWorker } from '@/hooks/use-pwa';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Wifi, WifiOff, RefreshCw, X } from 'lucide-react';

/**
 * PWA Install Prompt Component
 */
export function PWAInstallPrompt() {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Show prompt after a delay if installable and not dismissed
    if (isInstallable && !isInstalled && !dismissed) {
      const timer = setTimeout(() => setShowPrompt(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, dismissed]);

  if (!showPrompt || isInstalled) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 shadow-lg border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Installer l'application</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Installez Restaurant OS pour un accès rapide et une utilisation hors ligne.
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={install}>
                Installer
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => {
                  setDismissed(true);
                  setShowPrompt(false);
                }}
              >
                Plus tard
              </Button>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="w-6 h-6 flex-shrink-0"
            onClick={() => setShowPrompt(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Offline Status Banner
 */
export function OfflineBanner() {
  const { isOnline, wasOffline } = useOfflineStatus();
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowBackOnline(true);
      const timer = setTimeout(() => setShowBackOnline(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium z-[100] flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        Vous êtes hors ligne. Les modifications seront synchronisées ultérieurement.
      </div>
    );
  }

  if (showBackOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-green-500 text-white px-4 py-2 text-center text-sm font-medium z-[100] flex items-center justify-center gap-2 animate-fade-out">
        <Wifi className="w-4 h-4" />
        Connexion rétablie. Synchronisation en cours...
      </div>
    );
  }

  return null;
}

/**
 * Update Available Banner
 */
export function UpdateBanner() {
  const { isUpdateAvailable, update } = useServiceWorker();

  if (!isUpdateAvailable) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-3">
      <RefreshCw className="w-4 h-4" />
      <span className="text-sm">Une mise à jour est disponible</span>
      <Button
        size="sm"
        variant="secondary"
        onClick={update}
        className="ml-2"
      >
        Mettre à jour
      </Button>
    </div>
  );
}

/**
 * PWA Provider - Wraps all PWA-related components
 */
export function PWAProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PWAInstallPrompt />
      <OfflineBanner />
      <UpdateBanner />
    </>
  );
}

/**
 * Notification Permission Prompt
 */
export function NotificationPermissionPrompt() {
  const [dismissed, setDismissed] = useState(false);
  const { permission, requestPermission, isSupported } = usePushNotifications();

  useEffect(() => {
    // Check if dismissed in localStorage
    const wasDismissed = localStorage.getItem('notification-prompt-dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  if (!isSupported || permission !== 'default' || dismissed) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 shadow-lg border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🔔</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Activer les notifications</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Recevez des alertes pour les nouvelles commandes, livraisons et réservations.
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={requestPermission}>
                Activer
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => {
                  setDismissed(true);
                  localStorage.setItem('notification-prompt-dismissed', 'true');
                }}
              >
                Non merci
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PWAProvider;
