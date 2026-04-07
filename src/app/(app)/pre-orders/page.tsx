import { Metadata } from 'next';
import PreOrderManager from '@/components/pre-orders/pre-order-manager';

export const metadata: Metadata = {
  title: 'Pré-commandes - KFM DELICE',
  description: 'Gérez les pré-commandes et commandes planifiées',
};

export default function PreOrdersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">KFM DELICE</h1>
              <p className="text-xs text-muted-foreground">Pré-commandes</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 lg:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Gestion des Pré-commandes</h2>
          <p className="text-muted-foreground">
            Planifiez et gérez les commandes à l'avance
          </p>
        </div>

        <PreOrderManager />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>KFM DELICE • Pré-commandes</p>
          <p className="flex items-center justify-center gap-2 mt-1">
            📍 Conakry, Guinée • 📞 +224 62 00 00 00
          </p>
        </div>
      </footer>
    </div>
  );
}
