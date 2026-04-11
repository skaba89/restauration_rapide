'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * 404 Not Found page
 * Shown when a route doesn't exist
 */
export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <FileQuestion className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-xl font-semibold mb-4">Page non trouvée</h2>
        <p className="text-muted-foreground mb-6">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <Button asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
