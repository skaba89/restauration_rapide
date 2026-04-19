'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Star, MessageSquare, CheckCircle, Clock, Loader2, Send, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAuth } from '@/lib/api-client';

interface Feedback {
  id: string;
  tableId: string;
  tableNumber: string;
  rating: number;
  categories: string[];
  comment: string | null;
  customerName: string | null;
  customerPhone: string | null;
  status: 'new' | 'reviewed' | 'responded';
  response: string | null;
  respondedAt: string | null;
  createdAt: string;
}

// Category labels
const CATEGORY_LABELS: Record<string, string> = {
  food: 'Cuisine',
  service: 'Service',
  ambiance: 'Ambiance',
  cleanliness: 'Propreté'
};

export function FeedbackDisplay() {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await fetchWithAuth('/api/feedback');
      const result = await response.json();
      if (result.success) {
        setFeedback(result.data);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedback = feedback.filter(f => {
    if (filter === 'all') return true;
    if (filter === 'issues') return f.rating <= 2;
    if (filter === 'new') return f.status === 'new';
    return f.rating === parseInt(filter);
  });

  const handleMarkAsReviewed = async (id: string) => {
    setFeedback(prev =>
      prev.map(f =>
        f.id === id ? { ...f, status: 'reviewed' } : f
      )
    );
    
    toast({
      title: 'Succès',
      description: 'Avis marqué comme vu'
    });
  };

  const handleOpenResponse = (f: Feedback) => {
    setSelectedFeedback(f);
    setResponseText(f.response || '');
    setResponseDialogOpen(true);
  };

  const handleSendResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) return;

    setFeedback(prev =>
      prev.map(f =>
        f.id === selectedFeedback.id
          ? { ...f, status: 'responded', response: responseText, respondedAt: new Date().toISOString() }
          : f
      )
    );

    toast({
      title: 'Succès',
      description: 'Réponse envoyée avec succès'
    });

    setResponseDialogOpen(false);
    setSelectedFeedback(null);
    setResponseText('');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${diffDays}j`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Nouveau</Badge>;
      case 'reviewed':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Vu</Badge>;
      case 'responded':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Répondu</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all" className="gap-1">
            <MessageSquare className="h-4 w-4" />
            Tous
          </TabsTrigger>
          <TabsTrigger value="new" className="gap-1">
            <Clock className="h-4 w-4" />
            Nouveaux
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-1 text-red-600">
            Problèmes
          </TabsTrigger>
          <TabsTrigger value="5">5 ⭐</TabsTrigger>
          <TabsTrigger value="4">4 ⭐</TabsTrigger>
          <TabsTrigger value="3">3 ⭐</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {filteredFeedback.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <p>Aucun avis à afficher</p>
                  </CardContent>
                </Card>
              ) : (
                filteredFeedback.map(item => (
                  <Card
                    key={item.id}
                    className={`${
                      item.rating <= 2 ? 'border-red-300 bg-red-50/50' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono">
                            {item.tableNumber}
                          </Badge>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i <= item.rating
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(item.status)}
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(item.createdAt)}
                          </span>
                        </div>
                      </div>

                      {item.comment && (
                        <p className="text-sm mb-3">{item.comment}</p>
                      )}

                      {/* Categories */}
                      {item.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.categories.map(cat => (
                            <Badge key={cat} variant="secondary" className="text-xs">
                              {CATEGORY_LABELS[cat] || cat}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Customer Info */}
                      {(item.customerName || item.customerPhone) && (
                        <div className="text-xs text-muted-foreground mb-3">
                          {item.customerName && <span>{item.customerName}</span>}
                          {item.customerName && item.customerPhone && <span> • </span>}
                          {item.customerPhone && <span>{item.customerPhone}</span>}
                        </div>
                      )}

                      {/* Response */}
                      {item.response && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Réponse:</p>
                          <p className="text-sm">{item.response}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        {item.status === 'new' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsReviewed(item.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Marquer comme vu
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenResponse(item)}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Répondre
                            </Button>
                          </>
                        )}
                        {item.status === 'reviewed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenResponse(item)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Répondre
                          </Button>
                        )}
                        {item.status === 'responded' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenResponse(item)}
                          >
                            Modifier la réponse
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Répondre à l'avis</DialogTitle>
            <DialogDescription>
              Table {selectedFeedback?.tableNumber} • {selectedFeedback?.rating} ⭐
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedFeedback?.comment && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{selectedFeedback.comment}</p>
              </div>
            )}
            <Textarea
              placeholder="Votre réponse..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSendResponse} disabled={!responseText.trim()}>
              <Send className="h-4 w-4 mr-1" />
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FeedbackDisplay;
