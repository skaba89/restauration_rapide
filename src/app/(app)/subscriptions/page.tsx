import { Metadata } from 'next';
import SubscriptionManager from '@/components/subscriptions/subscription-manager';

export const metadata: Metadata = {
  title: 'Abonnements Repas - KFM DELICE',
  description: 'Gérez les abonnements repas des clients',
};

export default function SubscriptionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">KFM DELICE</h1>
              <p className="text-xs text-muted-foreground">Abonnements Repas</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 lg:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Gestion des Abonnements</h2>
          <p className="text-muted-foreground">
            Gérez les abonnements repas récurrents des clients
          </p>
        </div>

        <SubscriptionManager />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>KFM DELICE • Abonnements Repas</p>
          <p className="flex items-center justify-center gap-2 mt-1">
            📍 Conakry, Guinée • 📞 +224 62 00 00 00
          </p>
        </div>
      </footer>
    </div>
  );
}
