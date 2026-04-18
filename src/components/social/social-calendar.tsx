'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Facebook, 
  Instagram, 
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Send,
  Image,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addMonths, 
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO
} from 'date-fns';
import { fr } from 'date-fns/locale';

interface SocialPost {
  id: string;
  content: string;
  imageUrl?: string | null;
  platforms: ('facebook' | 'instagram')[];
  scheduledAt?: string | null;
  postedAt?: string | null;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  type: 'daily_special' | 'promotion' | 'event' | 'general';
  analytics?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  } | null;
}

const PLATFORM_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
};

const PLATFORM_COLORS = {
  facebook: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  instagram: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30',
};

const STATUS_COLORS = {
  scheduled: 'bg-blue-500',
  posted: 'bg-green-500',
  draft: 'bg-gray-400',
  failed: 'bg-red-500',
};

export function SocialCalendar() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/social?type=posts');
      const result = await response.json();
      if (result.success) {
        setPosts(result.data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPostsForDate = (date: Date) => {
    return posts.filter(post => {
      if (post.status === 'scheduled' && post.scheduledAt) {
        return isSameDay(parseISO(post.scheduledAt), date);
      }
      if (post.status === 'posted' && post.postedAt) {
        return isSameDay(parseISO(post.postedAt), date);
      }
      return false;
    });
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <h3 className="text-lg font-semibold capitalize">
        {format(currentMonth, 'MMMM yyyy', { locale: fr })}
      </h3>
      <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderDays = () => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return (
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day, i) => (
          <div key={i} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const postsForDay = getPostsForDate(day);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isTodayDate = isToday(day);

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[80px] p-1 border rounded-lg cursor-pointer transition-colors ${
              isSelected ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' :
              isTodayDate ? 'border-blue-500' : 'border-transparent'
            } ${!isCurrentMonth ? 'opacity-40' : 'hover:bg-muted/50'}`}
            onClick={() => {
              setSelectedDate(day);
              if (postsForDay.length === 1) {
                setSelectedPost(postsForDay[0]);
                setIsPostDetailOpen(true);
              }
            }}
          >
            <div className="flex justify-between items-start">
              <span className={`text-sm ${isTodayDate ? 'font-bold text-blue-600' : ''}`}>
                {format(day, 'd')}
              </span>
              {postsForDay.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {postsForDay.length}
                </Badge>
              )}
            </div>
            <div className="mt-1 space-y-1">
              {postsForDay.slice(0, 2).map(post => (
                <div
                  key={post.id}
                  className={`text-xs px-1 py-0.5 rounded truncate ${STATUS_COLORS[post.status]} text-white`}
                >
                  {post.platforms.map(p => {
                    const Icon = PLATFORM_ICONS[p];
                    return <Icon key={p} className="h-3 w-3 inline mr-1" />;
                  })}
                  {post.type === 'daily_special' ? 'Spécial' : 
                   post.type === 'promotion' ? 'Promo' : 
                   post.type === 'event' ? 'Événement' : 'Post'}
                </div>
              ))}
              {postsForDay.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{postsForDay.length - 2} autres
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="space-y-1">{rows}</div>;
  };

  const getPostsForSelectedDate = () => {
    if (!selectedDate) return [];
    return getPostsForDate(selectedDate);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await fetch(`/api/social?id=${postId}`, { method: 'DELETE' });
      setPosts(posts.filter(p => p.id !== postId));
      setIsPostDetailOpen(false);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

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
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendrier des publications
            </CardTitle>
            <CardDescription>
              Visualisez et gérez vos posts programmés
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderHeader()}
            {renderDays()}
            {renderCells()}
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedDate 
                ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })
                : 'Sélectionnez une date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <ScrollArea className="h-[400px]">
                {getPostsForSelectedDate().length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune publication ce jour</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getPostsForSelectedDate().map(post => (
                      <div
                        key={post.id}
                        className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedPost(post);
                          setIsPostDetailOpen(true);
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {post.platforms.map(p => {
                              const Icon = PLATFORM_ICONS[p];
                              return (
                                <div key={p} className={`p-1 rounded ${PLATFORM_COLORS[p]}`}>
                                  <Icon className="h-3 w-3" />
                                </div>
                              );
                            })}
                          </div>
                          <Badge 
                            variant="outline"
                            className={
                              post.status === 'posted' ? 'border-green-500 text-green-700' :
                              post.status === 'scheduled' ? 'border-blue-500 text-blue-700' :
                              ''
                            }
                          >
                            {post.status === 'posted' ? 'Publié' : 
                             post.status === 'scheduled' ? 'Programmé' : 
                             post.status === 'draft' ? 'Brouillon' : 'Échoué'}
                          </Badge>
                        </div>
                        <p className="text-sm line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {post.scheduledAt 
                            ? format(parseISO(post.scheduledAt), 'HH:mm')
                            : post.postedAt 
                            ? format(parseISO(post.postedAt), 'HH:mm')
                            : 'Non planifié'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Cliquez sur une date pour voir les détails</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Post Detail Dialog */}
      <Dialog open={isPostDetailOpen} onOpenChange={setIsPostDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de la publication</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {selectedPost.platforms.map(p => {
                  const Icon = PLATFORM_ICONS[p];
                  return (
                    <Badge key={p} className={PLATFORM_COLORS[p]}>
                      <Icon className="h-4 w-4 mr-1" />
                      {p === 'facebook' ? 'Facebook' : 'Instagram'}
                    </Badge>
                  );
                })}
                <Badge 
                  variant="outline"
                  className={
                    selectedPost.status === 'posted' ? 'border-green-500 text-green-700' :
                    selectedPost.status === 'scheduled' ? 'border-blue-500 text-blue-700' : ''
                  }
                >
                  {selectedPost.status === 'posted' ? 'Publié' : 
                   selectedPost.status === 'scheduled' ? 'Programmé' : 
                   selectedPost.status === 'draft' ? 'Brouillon' : 'Échoué'}
                </Badge>
              </div>

              <div>
                <p className="text-sm">{selectedPost.content}</p>
              </div>

              {selectedPost.imageUrl && (
                <div className="rounded-lg overflow-hidden border">
                  <img src={selectedPost.imageUrl} alt="Post" className="w-full" />
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {selectedPost.scheduledAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Programmé: {format(parseISO(selectedPost.scheduledAt), 'd MMM yyyy à HH:mm', { locale: fr })}
                  </span>
                )}
                {selectedPost.postedAt && (
                  <span className="flex items-center gap-1">
                    <Send className="h-4 w-4" />
                    Publié: {format(parseISO(selectedPost.postedAt), 'd MMM yyyy à HH:mm', { locale: fr })}
                  </span>
                )}
              </div>

              {selectedPost.analytics && (
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-2 rounded-lg bg-muted">
                    <p className="text-lg font-bold">{selectedPost.analytics.likes}</p>
                    <p className="text-xs text-muted-foreground">J'aime</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted">
                    <p className="text-lg font-bold">{selectedPost.analytics.comments}</p>
                    <p className="text-xs text-muted-foreground">Commentaires</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted">
                    <p className="text-lg font-bold">{selectedPost.analytics.shares}</p>
                    <p className="text-xs text-muted-foreground">Partages</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted">
                    <p className="text-lg font-bold">{selectedPost.analytics.reach}</p>
                    <p className="text-xs text-muted-foreground">Portée</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            {selectedPost?.status === 'draft' && (
              <Button variant="outline" className="gap-2">
                <Edit2 className="h-4 w-4" />
                Modifier
              </Button>
            )}
            {(selectedPost?.status === 'draft' || selectedPost?.status === 'scheduled') && (
              <Button variant="destructive" className="gap-2" onClick={() => handleDeletePost(selectedPost.id)}>
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SocialCalendar;
