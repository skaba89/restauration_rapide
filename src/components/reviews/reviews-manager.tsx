'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Filter,
  Search,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

interface Review {
  id: string;
  customerName: string;
  customerPhone: string;
  rating: number;
  comment: string;
  status: 'pending' | 'published' | 'flagged';
  source: string;
  response: string | null;
  respondedAt: string | null;
  respondedBy: string | null;
  createdAt: string;
  items: string[];
}

interface ReviewStats {
  averageRating: string;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  responseRate: number;
}

const SOURCE_ICONS: Record<string, string> = {
  google: '🔵',
  facebook: '📘',
  app: '📱',
  web: '🌐',
};

export function ReviewsManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          demo: 'true',
          ...(filterStatus !== 'all' && { status: filterStatus }),
          ...(filterRating !== 'all' && { rating: filterRating }),
          ...(searchQuery && { search: searchQuery }),
        });
        
        const response = await fetch(`/api/reviews?${params}`);
        const data = await response.json();
        
        if (data.success) {
          setReviews(data.data.data);
          setStats(data.data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [filterStatus, filterRating, searchQuery]);

  // Submit response
  const handleSubmitResponse = async (reviewId: string) => {
    if (!responseText.trim()) {
      toast.error('Veuillez entrer une réponse');
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reviewId,
          response: responseText,
          respondedBy: 'Admin',
        }),
      });

      if (response.ok) {
        setReviews(prev => prev.map(r => 
          r.id === reviewId 
            ? { ...r, response: responseText, respondedAt: new Date().toISOString(), respondedBy: 'Admin' }
            : r
        ));
        setRespondingTo(null);
        setResponseText('');
        toast.success('Réponse envoyée');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    }
  };

  // Update review status
  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: status as any } : r));
      toast.success('Statut mis à jour');
    } catch (error) {
      toast.error('Erreur');
    }
  };

  // Render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'flagged': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publié';
      case 'pending': return 'En attente';
      case 'flagged': return 'Signalé';
      default: return status;
    }
  };

  // Calculate rating bar widths
  const getRatingBarWidth = (rating: number) => {
    if (!stats) return 0;
    const count = stats.ratingDistribution[rating] || 0;
    return (count / stats.totalReviews) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600 fill-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.averageRating || '0'}</p>
                <p className="text-xs text-gray-500">Note moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalReviews || 0}</p>
                <p className="text-xs text-gray-500">Total avis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.responseRate || 0}%</p>
                <p className="text-xs text-gray-500">Taux de réponse</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">+12%</p>
                <p className="text-xs text-gray-500">vs mois dernier</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribution des notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-16">
                  <span>{rating}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 rounded-full h-2 transition-all"
                    style={{ width: `${getRatingBarWidth(rating)}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-8 text-right">
                  {stats?.ratingDistribution[rating] || 0}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Reviews List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Avis clients</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1 border rounded-md text-sm"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border rounded-md px-2 py-1 text-sm"
                >
                  <option value="all">Tous statuts</option>
                  <option value="published">Publié</option>
                  <option value="pending">En attente</option>
                  <option value="flagged">Signalé</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {reviews.map(review => (
                  <Card key={review.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{review.customerName}</span>
                          <span className="text-xs">{SOURCE_ICONS[review.source] || '📱'}</span>
                          {renderStars(review.rating)}
                        </div>
                        <Badge className={getStatusColor(review.status)}>
                          {getStatusLabel(review.status)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                      
                      {review.items.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {review.items.map((item, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        <Clock className="w-3 h-3" />
                        {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>

                      {/* Existing response */}
                      {review.response && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-2">
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <span className="font-medium">Réponse de {review.respondedBy}</span>
                            {review.respondedAt && (
                              <span>• {new Date(review.respondedAt).toLocaleDateString('fr-FR')}</span>
                            )}
                          </div>
                          <p className="text-sm">{review.response}</p>
                        </div>
                      )}

                      {/* Response form */}
                      {respondingTo === review.id ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Votre réponse..."
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSubmitResponse(review.id)} className="bg-orange-500 hover:bg-orange-600">
                              <Send className="w-3 h-3 mr-1" /> Envoyer
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setRespondingTo(null); setResponseText(''); }}>
                              Annuler
                            </Button>
                          </div>
                        </div>
                      ) : !review.response && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setRespondingTo(review.id)}>
                            <MessageSquare className="w-3 h-3 mr-1" /> Répondre
                          </Button>
                          {review.status === 'pending' && (
                            <Button size="sm" onClick={() => updateStatus(review.id, 'published')} className="bg-green-500 hover:bg-green-600">
                              Publier
                            </Button>
                          )}
                          {review.status === 'flagged' && (
                            <Button size="sm" variant="destructive" onClick={() => updateStatus(review.id, 'published')}>
                              Approuver
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {reviews.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Aucun avis trouvé
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
