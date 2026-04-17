'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Gift,
  Star,
  Crown,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  Sparkles,
  Zap,
} from 'lucide-react';

interface LoyaltyData {
  points: number;
  level: number;
  levelName: string;
  pointsToNextLevel: number;
  totalEarned: number;
  totalRedeemed: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  icon: string;
  isAvailable: boolean;
}

interface Transaction {
  id: string;
  type: 'earn' | 'redeem';
  points: number;
  description: string;
  date: string;
}

const TIERS = [
  { name: 'Bronze', minPoints: 0, color: 'from-amber-600 to-amber-800', icon: '🥉' },
  { name: 'Argent', minPoints: 500, color: 'from-gray-400 to-gray-600', icon: '🥈' },
  { name: 'Or', minPoints: 1500, color: 'from-yellow-400 to-yellow-600', icon: '🥇' },
  { name: 'Platine', minPoints: 3000, color: 'from-purple-400 to-purple-600', icon: '💎' },
];

export function LoyaltyProgram() {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData>({
    points: 750,
    level: 2,
    levelName: 'Argent',
    pointsToNextLevel: 750,
    totalEarned: 2500,
    totalRedeemed: 1750,
    tier: 'silver',
  });
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const getCurrentTier = () => {
    for (let i = TIERS.length - 1; i >= 0; i--) {
      if (loyaltyData.points >= TIERS[i].minPoints) {
        return TIERS[i];
      }
    }
    return TIERS[0];
  };

  const getNextTier = () => {
    const currentTierIndex = TIERS.findIndex(t => t.minPoints > loyaltyData.points);
    return currentTierIndex !== -1 ? TIERS[currentTierIndex] : null;
  };

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const progress = nextTier 
    ? ((loyaltyData.points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  const handleRedeem = (reward: Reward) => {
    if (loyaltyData.points >= reward.pointsRequired) {
      setLoyaltyData(prev => ({
        ...prev,
        points: prev.points - reward.pointsRequired,
        totalRedeemed: prev.totalRedeemed + reward.pointsRequired,
      }));
      // In production, call API to redeem
    }
  };

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">Vos points fidélité</p>
              <p className="text-4xl font-bold">{loyaltyData.points.toLocaleString()}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
              {currentTier.icon}
            </div>
          </div>
          
          {/* Tier Progress */}
          {nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentTier.name}</span>
                <span>{nextTier.name}</span>
              </div>
              <Progress value={progress} className="h-2 bg-white/20" />
              <p className="text-sm text-white/80">
                Plus que {(nextTier.minPoints - loyaltyData.points).toLocaleString()} points pour atteindre {nextTier.name}!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tier Cards */}
      <div className="grid grid-cols-4 gap-2">
        {TIERS.map((tier, index) => (
          <Card 
            key={tier.name}
            className={`relative overflow-hidden ${
              loyaltyData.points >= tier.minPoints ? 'ring-2 ring-orange-500' : 'opacity-60'
            }`}
          >
            <CardContent className="p-3 text-center">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center mx-auto mb-1 text-white text-lg`}>
                {tier.icon}
              </div>
              <p className="text-xs font-semibold">{tier.name}</p>
              <p className="text-[10px] text-gray-500">{tier.minPoints}+ pts</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loyaltyData.totalEarned.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Points gagnés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Gift className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loyaltyData.totalRedeemed.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Points utilisés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rewards">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rewards">Récompenses</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="mt-4">
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {rewards.map((reward) => (
                <Card key={reward.id} className={loyaltyData.points >= reward.pointsRequired ? '' : 'opacity-60'}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-2xl">
                          {reward.icon}
                        </div>
                        <div>
                          <p className="font-semibold">{reward.name}</p>
                          <p className="text-sm text-gray-500">{reward.description}</p>
                          <Badge variant="outline" className="mt-1">
                            <Star className="w-3 h-3 mr-1" />
                            {reward.pointsRequired} points
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        disabled={loyaltyData.points < reward.pointsRequired}
                        onClick={() => handleRedeem(reward)}
                        className={loyaltyData.points >= reward.pointsRequired ? 'bg-orange-500 hover:bg-orange-600' : ''}
                      >
                        Obtenir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'earn' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {tx.type === 'earn' ? <TrendingUp className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.description}</p>
                      <p className="text-xs text-gray-500">{tx.date}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${tx.type === 'earn' ? 'text-green-600' : 'text-purple-600'}`}>
                    {tx.type === 'earn' ? '+' : ''}{tx.points}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* How it works */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Comment ça marche?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">1</div>
            <p>Commandez chez KFM DELICE et gagnez 1 point pour chaque 1 000 GNF dépensé</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">2</div>
            <p>Accumulez des points et passez aux niveaux supérieurs</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">3</div>
            <p>Échangez vos points contre des récompenses exclusives</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}