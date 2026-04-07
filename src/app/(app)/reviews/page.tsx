'use client';

import { ReviewsManager } from '@/components/reviews/reviews-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare } from 'lucide-react';

export default function ReviewsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Avis Clients</h1>
          <p className="text-gray-500">Gérez les avis et réponses clients</p>
        </div>
        <div className="flex items-center gap-2 text-orange-500">
          <Star className="w-6 h-6 fill-orange-500" />
          <span className="text-xl font-bold">4.2</span>
          <span className="text-gray-400">/5</span>
        </div>
      </div>

      <ReviewsManager />
    </div>
  );
}
