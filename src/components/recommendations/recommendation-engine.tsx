'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Star, TrendingUp } from 'lucide-react';

interface RecommendationItem {
  id: string;
  name: string;
  score: number;
  reason: string;
}

interface RecommendationEngineProps {
  recommendations: RecommendationItem[];
  onItemSelected?: (id: string) => void;
}

export function RecommendationEngine({ recommendations, onItemSelected }: RecommendationEngineProps) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Aucune recommandation disponible pour le moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Recommandations pour vous
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onItemSelected?.(item.id)}
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">{item.reason}</p>
              </div>
              <div className="flex items-center gap-2">
                {item.score >= 80 && (
                  <Badge className="bg-orange-500 text-white">
                    <Flame className="h-3 w-3 mr-1" />
                    Top
                  </Badge>
                )}
                <div className="flex items-center text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm ml-1">{Math.round(item.score)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
