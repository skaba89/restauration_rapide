'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Star, Users } from 'lucide-react';

interface PopularItem {
  id: string;
  name: string;
  orderCount: number;
  rating: number;
  image?: string;
}

interface PopularItemsProps {
  items: PopularItem[];
  onItemSelected?: (id: string) => void;
}

export function PopularItems({ items, onItemSelected }: PopularItemsProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Les plus populaires
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onItemSelected?.(item.id)}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {item.orderCount} commandes
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {item.rating.toFixed(1)}
                  </span>
                </div>
              </div>
              {index === 0 && (
                <Badge className="bg-orange-500 text-white">
                  <Flame className="h-3 w-3 mr-1" />
                  Top
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
