'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Star, 
  MessageCircle, 
  Reply, 
  Clock, 
  User,
  AlertTriangle,
  ThumbsUp,
  Globe,
  Facebook,
  Filter,
  Search
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Review {
  id: string;
  platform: 'google' | 'facebook';
  author: string;
  rating: number;
  content: string;
  date: string;
  replied: boolean;
  replyContent?: string;
  replyDate?: string;
}

const PLATFORM_CONFIG = {
  google: {
    name: 'Google',
    icon: Globe,
    color: 'text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
};

const STAFF_MEMBERS = ['Fatoumata S.', 'Ibrahim K.', 'Manager'];

export function ReviewMonitor() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'replied'>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | 'positive' | 'negative'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/social?type=reviews');
      const result = await response.json();
      if (result.success) {
        setReviews(result.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async () => {
    if (!selectedReview || !replyContent.trim()) return;

    try {
      const response = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'review_reply',
          data: {
            reviewId: selectedReview.id,
            replyContent: replyContent,
          },
        }),
      });

      if (response.ok) {
        setReviews(reviews.map(r => 
          r.id === selectedReview.id 
            ? { ...r, replied: true, replyContent, replyDate: new Date().toISOString() }
            : r
        ));
        setIsReplyDialogOpen(false);
        setSelectedReview(null);
        setReplyContent('');
      }
    } catch (error) {
      console.error('Error replying to review:', error);
    }
  };

  const openReplyDialog = (review: Review) => {
    setSelectedReview(review);
    setReplyContent('');
    setIsReplyDialogOpen(true);
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'pending' && review.replied) return false;
    if (filter === 'replied' && !review.replied) return false;
    if (ratingFilter === 'positive' && review.rating < 4) return false;
    if (ratingFilter === 'negative' && review.rating >= 4) return false;
    if (searchQuery && !review.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !review.author.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 
      : 0,
  }));

  const pendingCount = reviews.filter(r => !r.replied).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Note moyenne</p>
                <p className="text-2xl font-bold">{averageRating}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <MessageCircle className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total avis</p>
                <p className="text-2xl font-bold">{reviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Reply className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Répondu</p>
                <p className="text-2xl font-bold">{reviews.filter(r => r.replied).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribution des notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-20">
                    {rating}
                    <Star className={`h-4 w-4 ${
                      rating <= 2 ? 'text-red-400' : 
                      rating === 3 ? 'text-yellow-400' : 'text-amber-400'
                    } fill-current`} />
                  </div>
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-muted">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taux de réponse</span>
                <span className="text-sm font-bold">
                  {Math.round((reviews.filter(r => r.replied).length / reviews.length) * 100)}%
                </span>
              </div>
              <Progress 
                value={(reviews.filter(r => r.replied).length / reviews.length) * 100} 
                className="h-2 mt-2" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">Avis récents</CardTitle>
                <CardDescription>Gérez et répondez aux avis clients</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[200px]"
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="border rounded-md px-2 py-1 text-sm"
                >
                  <option value="all">Tous</option>
                  <option value="pending">En attente</option>
                  <option value="replied">Répondu</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun avis trouvé</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map(review => {
                    const platformConfig = PLATFORM_CONFIG[review.platform];
                    const PlatformIcon = platformConfig.icon;

                    return (
                      <div key={review.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${platformConfig.bgColor}`}>
                              <PlatformIcon className={`h-4 w-4 ${platformConfig.color}`} />
                            </div>
                            <div>
                              <p className="font-medium">{review.author}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < review.rating 
                                          ? 'text-amber-400 fill-amber-400' 
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(review.date), { addSuffix: true, locale: fr })}
                                </span>
                              </div>
                            </div>
                          </div>
                          {!review.replied && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="gap-1"
                              onClick={() => openReplyDialog(review)}
                            >
                              <Reply className="h-3 w-3" />
                              Répondre
                            </Button>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{review.content}</p>

                        {review.replied && review.replyContent && (
                          <div className="mt-3 p-3 rounded-lg bg-muted">
                            <div className="flex items-center gap-2 mb-1">
                              <Reply className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-medium">Réponse de KFM DELICE</span>
                              {review.replyDate && (
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(review.replyDate), 'd MMM yyyy', { locale: fr })}
                                </span>
                              )}
                            </div>
                            <p className="text-sm">{review.replyContent}</p>
                          </div>
                        )}

                        {review.rating <= 2 && !review.replied && (
                          <div className="mt-2 flex items-center gap-2 text-amber-600 text-xs">
                            <AlertTriangle className="h-3 w-3" />
                            Avis négatif - Réponse recommandée
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Répondre à l'avis</DialogTitle>
            <DialogDescription>
              Votre réponse sera visible publiquement
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{selectedReview.author}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < selectedReview.rating 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{selectedReview.content}</p>
              </div>

              <div>
                <Label>Votre réponse</Label>
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Merci pour votre avis..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Soyez courtois et professionnel. Une bonne réponse peut convertir un client mécontent.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleReply} disabled={!replyContent.trim()}>
              Publier la réponse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReviewMonitor;
