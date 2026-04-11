import { Metadata } from 'next';
import InventoryManager from '@/components/inventory/inventory-manager';

export const metadata: Metadata = {
  title: 'Gestion des Stocks - KFM DELICE',
  description: 'Gérez votre inventaire, suivez les mouvements de stock et les commandes d\'achat',
};

export default function InventoryPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Gestion des Stocks
          </h1>
          <p className="text-muted-foreground">
            Suivez et gérez votre inventaire en temps réel
          </p>
        </div>
      </div>

      {/* Main Content */}
      <InventoryManager />
    </div>
  );
}
