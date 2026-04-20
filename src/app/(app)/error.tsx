'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, RefreshCw, Home } from 'lucide-react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
          <UtensilsCrossed className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Erreur Application</h2>
        <p className="text-muted-foreground mb-6">
          Une erreur inattendue est survenue dans votre espace de gestion.
          Veuillez réessayer.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left mb-6 p-4 bg-muted rounded-lg">
            <summary className="cursor-pointer font-medium">Détails</summary>
            <pre className="mt-2 text-sm text-muted-foreground overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/dashboard')}
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
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
