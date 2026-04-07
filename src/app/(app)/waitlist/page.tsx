import { Metadata } from 'next';
import WaitlistManager from '@/components/waitlist/waitlist-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Bell } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Liste d\'Attente - KFM DELICE',
  description: 'Gérez la liste d\'attente des clients',
};

export default function WaitlistPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Liste d&apos;Attente</h1>
              <p className="text-muted-foreground">
                Gérez les clients en attente de table
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Mise à jour auto (30s)
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Bell className="h-3 w-3" />
            SMS disponible
          </Badge>
        </div>
      </div>

      {/* Waitlist Manager Component */}
      <WaitlistManager />

      {/* Help Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Guide d&apos;utilisation</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center shrink-0">
              <span className="font-bold text-yellow-600">1</span>
            </div>
            <div>
              <p className="font-medium">Ajouter un client</p>
              <p className="text-muted-foreground">Cliquez sur &quot;Ajouter&quot; pour inscrire un nouveau client</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
              <span className="font-bold text-blue-600">2</span>
            </div>
            <div>
              <p className="font-medium">Notifier</p>
              <p className="text-muted-foreground">Envoyez un SMS quand une table est disponible</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
              <span className="font-bold text-green-600">3</span>
            </div>
            <div>
              <p className="font-medium">Installer</p>
              <p className="text-muted-foreground">Marquez le client comme installé à sa table</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
