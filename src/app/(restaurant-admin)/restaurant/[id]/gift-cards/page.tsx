'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Gift,
  Plus,
  Search,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { apiGet } from '@/lib/api-client';

interface GiftCard {
  id: string;
  code: string;
  balance: number;
  initialAmount: number;
  status: 'ACTIVE' | 'USED' | 'EXPIRED';
  purchaserName: string;
  recipientName?: string;
  createdAt: string;
  expiresAt: string;
}

export default function RestaurantGiftCardsPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadGiftCards();
  }, [restaurantId]);

  const loadGiftCards = async () => {
    try {
      const data = await apiGet<any>(`/gift-cards?restaurantId=${restaurantId}`);
      if (data?.giftCards?.length > 0) {
        setGiftCards(data.giftCards);
      }
    } catch (error) {
      console.error('Failed to load gift cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = giftCards.filter(gc =>
    gc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gc.purchaserName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCards = giftCards.filter(gc => gc.status === 'ACTIVE');
  const totalBalance = activeCards.reduce((sum, gc) => sum + gc.balance, 0);
  const totalSold = giftCards.reduce((sum, gc) => sum + gc.initialAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6 text-orange-500" />
            Cartes Cadeaux
          </h1>
          <p className="text-muted-foreground">
            Gérez les cartes cadeaux de votre restaurant
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle carte
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCards.length}</p>
                <p className="text-sm text-muted-foreground">Actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalBalance.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">FCFA balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Gift className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSold.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">FCFA vendus</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Gift className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{giftCards.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Cartes cadeaux</CardTitle>
              <CardDescription>Liste de toutes les cartes cadeaux</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCards.map((card) => (
              <div key={card.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
                    <Gift className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-mono font-semibold">{card.code}</h4>
                      <Badge className={
                        card.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        card.status === 'USED' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {card.status === 'ACTIVE' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {card.status === 'USED' && <XCircle className="h-3 w-3 mr-1" />}
                        {card.status === 'EXPIRED' && <Clock className="h-3 w-3 mr-1" />}
                        {card.status}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>Achetée par: {card.purchaserName}</span>
                      {card.recipientName && <span>Pour: {card.recipientName}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-600">{card.balance.toLocaleString()} FCFA</p>
                  <p className="text-sm text-muted-foreground">
                    sur {card.initialAmount.toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}