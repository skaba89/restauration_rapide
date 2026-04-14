'use client';

import { useState } from 'react';
import { DriverTrackingDashboard } from '@/components/tracking/driver-tracking-dashboard';
import { OrderTracking } from '@/components/tracking/order-tracking';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Package, Navigation } from 'lucide-react';
import { useDriverTracking } from '@/hooks/use-driver-tracking';

export default function TrackingPage() {
  const [orderId, setOrderId] = useState('demo-ord-2');
  const [searchOrderId, setSearchOrderId] = useState('');
  const [activeTab, setActiveTab] = useState('drivers');

  const {
    drivers,
    stats,
    isLoading,
    lastUpdate,
    isConnected,
    selectedDriverId,
    setSelectedDriverId,
    refetch,
  } = useDriverTracking({ pollingInterval: 5000 });

  const handleSearch = () => {
    if (searchOrderId.trim()) {
      setOrderId(searchOrderId.trim());
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <div className="flex items-center justify-between flex-shrink-0 mb-4">
          <TabsList>
            <TabsTrigger value="drivers" className="gap-2">
              <Navigation className="w-4 h-4" />
              Suivi Drivers
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="w-4 h-4" />
              Suivi Commande
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Drivers Real-time Tracking Tab */}
        <TabsContent value="drivers" className="flex-1 min-h-0 mt-0">
          <DriverTrackingDashboard
            drivers={drivers}
            stats={stats}
            isLoading={isLoading}
            lastUpdate={lastUpdate}
            isConnected={isConnected}
            selectedDriverId={selectedDriverId}
            onSelectDriver={setSelectedDriverId}
            onRefetch={refetch}
          />
        </TabsContent>

        {/* Order Tracking Tab */}
        <TabsContent value="orders" className="flex-1 min-h-0 mt-0 overflow-auto">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold">Suivi de Commande</h1>
              <p className="text-muted-foreground text-sm">Suivez vos commandes en temps reel</p>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Entrez le numero de commande (ex: ORD-2024-0144 ou demo-ord-2)"
                      value={searchOrderId}
                      onChange={(e) => setSearchOrderId(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600">
                    <Search className="w-4 h-4 mr-2" />
                    Rechercher
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Commandes de test disponibles: demo-ord-1, demo-ord-2, demo-ord-3
                </p>
              </CardContent>
            </Card>

            {orderId && <OrderTracking key={orderId} orderId={orderId} />}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
