'use client';

import { LoadingSpinner } from '@/components/loading-states';

/**
 * Root loading component
 * Shown while navigating between pages
 */
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="xl" />
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}
