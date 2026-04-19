'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, MessageSquare, TrendingUp, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';

interface FeedbackStats {
  total: number;
  avgRating: string;
  ratingDistribution: { rating: number; count: number }[];
  categoryBreakdown: { category: string; label: string; count: number }[];
  responseRate: string;
  newCount: number;
  respondedCount: number;
  reviewedCount: number;
}

interface FeedbackStatsProps {
  refreshKey?: number;
}

export function FeedbackStats({ refreshKey }: FeedbackStatsProps) {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  const fetchStats = async () => {
    try {
      const response = await fetchWithAuth('/api/feedback?stats=true');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const maxRatingCount = Math.max(...stats.ratingDistribution.map(r => r.count), 1);
  const maxCategoryCount = Math.max(...stats.categoryBreakdown.map(c => c.count), 1);

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Note moyenne</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  {stats.avgRating}
                  <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Nouveaux avis</p>
                <p className="text-2xl font-bold text-blue-600">{stats.newCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Répondus</p>
                <p className="text-2xl font-bold text-green-600">{stats.respondedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Taux de réponse</p>
                <p className="text-2xl font-bold text-purple-600">{stats.responseRate}%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Distribution des notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.ratingDistribution.map(r => (
              <div key={r.rating} className="flex items-center gap-3">
                <div className="flex items-center w-12">
                  <span className="font-medium">{r.rating}</span>
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 ml-1" />
                </div>
                <Progress
                  value={(r.count / maxRatingCount) * 100}
                  className="flex-1 h-2"
                />
                <span className="text-sm text-muted-foreground w-8 text-right">{r.count}</span>
              </div>
            )).reverse()}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Répartition par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {stats.categoryBreakdown.map(cat => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{cat.label}</span>
                  <Badge variant="secondary">{cat.count}</Badge>
                </div>
                <Progress
                  value={(cat.count / maxCategoryCount) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Total Feedback */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Total des avis clients</span>
            </div>
            <Badge variant="outline" className="text-lg font-bold">
              {stats.total} avis
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FeedbackStats;
