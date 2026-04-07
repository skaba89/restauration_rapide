'use client';

import { IntegrationsManager } from '@/components/integrations/integrations-manager';
import { Plug } from 'lucide-react';

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Intégrations</h1>
          <p className="text-gray-500">Connectez vos services externes</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Paiements • Messagerie • Cartes • Social</span>
        </div>
      </div>

      <IntegrationsManager />
    </div>
  );
}
