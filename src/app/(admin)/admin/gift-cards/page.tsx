'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Plus, CreditCard, Users } from 'lucide-react';
import { useCurrencySafe } from '@/lib/currency-context';

const giftCards = [
  { id: 1, code: 'KFM-2026-001', value: 50000, balance: 50000, purchaser: 'Amadou Diallo', status: 'active' },
  { id: 2, code: 'KFM-2026-002', value: 100000, balance: 75000, purchaser: 'Fatou Sylla', status: 'active' },
  { id: 3, code: 'KFM-2026-003', value: 25000, balance: 0, purchaser: 'Ibrahim Koné', status: 'used' },
];

export default function GiftCardsPage() {
  const { formatCurrency } = useCurrencySafe();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cartes Cadeaux</h1>
          <p className="text-gray-500">Gérer les cartes cadeaux</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle carte
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Gift className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{giftCards.length}</p>
                <p className="text-xs text-gray-500">Cartes émises</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {giftCards.filter(g => g.status === 'active').length}
                </p>
                <p className="text-xs text-gray-500">Actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(giftCards.reduce((sum, g) => sum + g.balance, 0))}
              </p>
              <p className="text-xs text-gray-500">Solde total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {formatCurrency(giftCards.reduce((sum, g) => sum + g.value, 0))}
              </p>
              <p className="text-xs text-gray-500">Valeur émise</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gift cards list */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Cartes Cadeaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {giftCards.map((card) => (
              <div key={card.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Gift className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-mono font-medium">{card.code}</p>
                    <p className="text-sm text-gray-500">Acheteur: {card.purchaser}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Valeur</p>
                    <p className="font-medium">{formatCurrency(card.value)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Solde</p>
                    <p className="font-bold text-green-600">{formatCurrency(card.balance)}</p>
                  </div>
                  <Badge
                    variant={card.status === 'active' ? 'default' : 'secondary'}
                    className={card.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}
                  >
                    {card.status === 'active' ? 'Active' : 'Utilisée'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
