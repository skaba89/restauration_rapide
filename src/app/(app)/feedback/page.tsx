'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FeedbackDisplay from '@/components/feedback/feedback-display';
import FeedbackStats from '@/components/feedback/feedback-stats';
import { QrCode, BarChart3, MessageSquare, RefreshCw } from 'lucide-react';

export default function FeedbackPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Feedback Clients</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les avis clients via QR code sur les tables
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Statistiques</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Avis</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FeedbackStats refreshKey={refreshKey} />
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    QR Code Tables
                  </CardTitle>
                  <CardDescription>
                    Les clients scannent le QR code sur leur table pour laisser un avis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      URL du formulaire:
                    </p>
                    <code className="text-xs bg-background p-2 rounded block overflow-x-auto">
                      /feedback/table-{`{numero}`}
                    </code>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Exemples:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['T1', 'T5', 'T10'].map(table => (
                        <div key={table} className="p-2 bg-muted rounded text-center">
                          <p className="text-xs font-mono">/feedback/table-{table.toLowerCase().replace('t', '')}</p>
                          <p className="text-xs text-muted-foreground">Table {table}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      💡 Conseil: Placez un QR code sur chaque table avec l'URL personnalisée
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Avis clients</CardTitle>
              <CardDescription>
                Consultez et répondez aux avis de vos clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackDisplay />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
