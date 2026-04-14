'use client';

import { useSyncExternalStore, ReactNode } from 'react';

const emptySubscribe = () => () => {};

function getIsHydrated() {
  return true;
}

function getServerSnapshot() {
  return false;
}

/**
 * Component that only renders its children after hydration is complete.
 * This prevents hydration mismatches when server and client render different content.
 */
export function HydrationGuard({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
}) {
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    getIsHydrated,
    getServerSnapshot
  );

  if (!isHydrated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook to check if the component is hydrated
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    getIsHydrated,
    getServerSnapshot
  );
}

/**
 * Component that suppresses hydration warnings for its children.
 * Use sparingly - only when you know the content will differ between server and client.
 */
export function SuppressHydration({ children }: { children: ReactNode }) {
  return (
    <span suppressHydrationWarning>
      {children}
    </span>
  );
}

export default HydrationGuard;
