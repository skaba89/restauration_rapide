'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Star,
  Gift,
  Trophy,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/lib/cart-store';

const USER_LOYALTY_DATA = {
  points: 350,
  lifetimePoints: 1250,
  level: 'Gold',
  nextLevel: 'Platinum',
  pointsToNextLevel: 150,
  totalOrders: 28,
  totalSpent: 145000,
};

const LEVELS_DATA = [
  { name: 'Bronze', minPoints: 0, color: 'bg-amber-700', perks: ['1 point par 100 FCFA'] },
  { name: 'Silver', minPoints: 500, color: 'bg-gray-400', perks: ['1.5 points par 100 FCFA', 'Anniversaire offert'] },
  { name: 'Gold', minPoints: 1000, color: 'bg-yellow-500', perks: ['2 points par 100 FCFA', 'Anniversaire offert', 'Accès VIP'] },
  { name: 'Platinum', minPoints: 2500, color: 'bg-gradient-to-r from-purple-500 to-pink-500', perks: ['3 points par 100 FCFA', 'Repas mensuel offert', 'Livraison prioritaire', 'Support dédié'] },
];

const REWARDS_DATA = [
  { id: '1', name: 'Boisson gratuite', points: 100, image: '🥤', available: true, type: 'drink' },
  { id: '2', name: 'Dessert gratuit', points: 200, image: '🍰', available: true, type: 'dessert' },
  { id: '3', name: 'Repas simple', points: 300, image: '🍽️', available: true, type: 'meal' },
  { id: '4', name: 'Repas complet', points: 500, image: '🍛', available: false, type: 'full_meal' },
  { id: '5', name: 'Menu du jour', points: 750, image: '🍱', available: false, type: 'menu' },
];

const TRANSACTIONS_DATA = [
  { id: 1, type: 'earn', description: 'Commande ORD-2024-0145', points: 85, date: '15 jan. 2024' },
  { id: 2, type: 'redeem', description: 'Boisson gratuite', points: -100, date: '14 jan. 2024' },
  { id: 3, type: 'earn', description: 'Commande ORD-2024-0144', points: 120, date: '14 jan. 2024' },
  { id: 4, type: 'earn', description: 'Bonus anniversaire', points: 50, date: '10 jan. 2024' },
  { id: 5, type: 'earn', description: 'Commande ORD-2024-0140', points: 75, date: '12 jan. 2024' },
];

export default function CustomerLoyaltyPage() {
  const [userLoyalty, setUserLoyalty] = useState(USER_LOYALTY_DATA);
  const [rewards, setRewards] = useState(REWARDS_DATA);
  const [transactions, setTransactions] = useState(TRANSACTIONS_DATA);
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const currentLevelIndex = LEVELS_DATA.findIndex(l => l.name === userLoyalty.level);
  const progressToNextLevel = ((userLoyalty.points) / 500) * 100;

  const redeemReward = (reward: typeof REWARDS_DATA[0]) => {
    if (!reward.available) {
      toast({
        title: 'Points insuffisants',
        description: `Il vous manque ${reward.points - userLoyalty.points} points pour cette récompense`,
        variant: 'destructive',
      });
      return;
    }

    if (userLoyalty.points < reward.points) {
      toast({
        title: 'Points insuffisants',
        description: `Il vous manque ${reward.points - userLoyalty.points} points pour cette récompense`,
        variant: 'destructive',
      });
      return;
    }

    // Deduct points
    setUserLoyalty(prev => ({
      ...prev,
      points: prev.points - reward.points,
      lifetimePoints: prev.lifetimePoints,
    }));

    // Add transaction
    setTransactions(prev => [
      {
        id: Date.now(),
        type: 'redeem',
        description: reward.name,
        points: -reward.points,
        date: new Date().toLocaleDateString('fr-FR'),
      },
      ...prev,
    ]);

    // Add to cart
    addItem({
      id: `reward-${reward.id}`,
      name: reward.name,
      price: 0,
      image: reward.image,
      quantity: 1,
      notes: 'Récompense fidélité',
    });

    toast({
      title: 'Récompense échangée !',
      description: `${reward.name} a été ajouté à votre panier`,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Programme Fidélité</h1>

      {/* Main Card */}
      <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white overflow-hidden">
        <CardContent className="p-6 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-6 w-6 fill-yellow-300 text-yellow-300" />
              <span className="text-xl font-bold">{userLoyalty.level}</span>
            </div>
            <p className="text-5xl font-bold mb-2">{userLoyalty.points}</p>
            <p className="opacity-90">points disponibles</p>

            {/* Progress to next level */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progression vers {userLoyalty.nextLevel}</span>
                <span>{userLoyalty.pointsToNextLevel} pts restants</span>
              </div>
              <Progress value={progressToNextLevel} className="h-2 bg-white/30" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{userLoyalty.lifetimePoints}</p>
            <p className="text-sm text-muted-foreground">Points gagnés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{userLoyalty.totalOrders}</p>
            <p className="text-sm text-muted-foreground">Commandes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{userLoyalty.totalSpent.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">FCFA dépensés</p>
          </CardContent>
        </Card>
      </div>

      {/* Rewards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Récompenses disponibles</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {rewards.map(reward => {
            const canRedeem = userLoyalty.points >= reward.points;
            
            return (
              <Card key={reward.id} className={!canRedeem ? 'opacity-70' : ''}>
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">{reward.image}</div>
                  <p className="font-medium">{reward.name}</p>
                  <div className="flex items-center justify-center gap-1 text-orange-600 font-bold">
                    <Star className="h-4 w-4" />
                    {reward.points} pts
                  </div>
                  <Button
                    className="w-full mt-3"
                    size="sm"
                    disabled={!canRedeem}
                    variant={canRedeem ? 'default' : 'outline'}
                    onClick={() => redeemReward(reward)}
                  >
                    {canRedeem ? 'Échanger' : 'Points insuffisants'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Levels */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Niveaux</h2>
        <div className="space-y-3">
          {LEVELS_DATA.map((level, idx) => {
            const isCurrentLevel = level.name === userLoyalty.level;
            const isPassed = idx < currentLevelIndex;

            return (
              <Card key={level.name} className={isCurrentLevel ? 'border-2 border-orange-500' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full ${level.color} flex items-center justify-center text-white`}>
                      {isPassed ? <CheckCircle className="h-5 w-5" /> : <Trophy className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{level.name}</p>
                        {isCurrentLevel && (
                          <Badge className="bg-orange-500">Actuel</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{level.minPoints}+ points</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {level.perks.map((perk, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {perk}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historique des points</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'earn' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {tx.type === 'earn' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${tx.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'earn' ? '+' : ''}{tx.points} pts
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
