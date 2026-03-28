'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Global error component
 * Shown when an unhandled error occurs
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to monitoring service
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Une erreur s'est produite</h2>
        <p className="text-muted-foreground mb-6">
          Nous nous excusons pour ce désagrément. Une erreur inattendue s'est produite.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left mb-6 p-4 bg-muted rounded-lg">
            <summary className="cursor-pointer font-medium">
              Détails de l'erreur
            </summary>
            <pre className="mt-2 text-sm text-muted-foreground overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Retour à l'accueil
          </Button>
          <Button onClick={reset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    </div>
  );
}
