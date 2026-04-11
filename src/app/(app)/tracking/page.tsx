'use client';

import { useState } from 'react';
import { OrderTracking } from '@/components/tracking/order-tracking';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Package } from 'lucide-react';

export default function TrackingPage() {
  const [orderId, setOrderId] = useState('demo-ord-2');
  const [searchOrderId, setSearchOrderId] = useState('');

  const handleSearch = () => {
    if (searchOrderId.trim()) {
      setOrderId(searchOrderId.trim());
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Suivi de Commande</h1>
          <p className="text-gray-500">Suivez vos commandes en temps réel</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Entrez le numéro de commande (ex: ORD-2024-0144 ou demo-ord-2)"
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
          <p className="text-sm text-gray-400 mt-2">
            Commandes de test disponibles: demo-ord-1, demo-ord-2, demo-ord-3
          </p>
        </CardContent>
      </Card>

      {/* Tracking */}
      {orderId && <OrderTracking orderId={orderId} />}
    </div>
  );
}
