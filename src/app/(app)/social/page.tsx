'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Share2, 
  Plus, 
  Send, 
  Image,
  Facebook,
  Instagram,
  Calendar,
  BarChart3,
  MessageCircle,
  Users
} from 'lucide-react';
import { SocialCalendar } from '@/components/social/social-calendar';
import { SocialAnalytics } from '@/components/social/social-analytics';
import { ReviewMonitor } from '@/components/social/review-monitor';

interface SocialPost {
  id: string;
  content: string;
  imageUrl?: string | null;
  platforms: ('facebook' | 'instagram')[];
  scheduledAt?: string | null;
  postedAt?: string | null;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  type: 'daily_special' | 'promotion' | 'event' | 'general';
}

interface SocialStats {
  totalFollowers: number;
  postedCount: number;
  scheduledCount: number;
  draftCount: number;
  totalEngagement: number;
  averageRating: string;
  pendingReviews: number;
}

const POST_TYPES = [
  { value: 'daily_special', label: 'Spécial du jour', emoji: '🍽️' },
  { value: 'promotion', label: 'Promotion', emoji: '🎉' },
  { value: 'event', label: 'Événement', emoji: '🎊' },
  { value: 'general', label: 'Général', emoji: '📝' },
];

export default function SocialPage() {
  const [stats, setStats] = useState<SocialStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    platforms: ['facebook'] as ('facebook' | 'instagram')[],
    scheduledAt: '',
    type: 'daily_special' as 'daily_special' | 'promotion' | 'event' | 'general',
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/social?type=stats&demo=true');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content) return;

    try {
      const response = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'post', data: newPost }),
      });

      if (response.ok) {
        setIsNewPostOpen(false);
        setNewPost({
          content: '',
          platforms: ['facebook'],
          scheduledAt: '',
          type: 'daily_special',
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const togglePlatform = (platform: 'facebook' | 'instagram') => {
    const platforms = newPost.platforms.includes(platform)
      ? newPost.platforms.filter(p => p !== platform)
      : [...newPost.platforms, platform];
    
    if (platforms.length > 0) {
      setNewPost({ ...newPost, platforms: platforms as ('facebook' | 'instagram')[] });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Share2 className="h-6 w-6 text-orange-500" />
            Réseaux Sociaux
          </h1>
          <p className="text-muted-foreground">
            Gérez vos publications et suivez vos performances
          </p>
        </div>
        
        <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle publication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer une publication</DialogTitle>
              <DialogDescription>
                Publiez ou programmez sur Facebook et Instagram
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Type de publication</Label>
                <Select value={newPost.type} onValueChange={(v) => setNewPost({ ...newPost, type: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POST_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.emoji} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Plateformes</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={newPost.platforms.includes('facebook') ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2"
                    onClick={() => togglePlatform('facebook')}
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Button>
                  <Button
                    variant={newPost.platforms.includes('instagram') ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2"
                    onClick={() => togglePlatform('instagram')}
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </Button>
                </div>
              </div>

              <div>
                <Label>Contenu</Label>
                <Textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Écrivez votre message..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {newPost.content.length}/500 caractères
                </p>
              </div>

              <div>
                <Label>Programmer (optionnel)</Label>
                <Input
                  type="datetime-local"
                  value={newPost.scheduledAt}
                  onChange={(e) => setNewPost({ ...newPost, scheduledAt: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Laissez vide pour enregistrer comme brouillon
                </p>
              </div>

              <div>
                <Button variant="outline" className="w-full gap-2">
                  <Image className="h-4 w-4" alt="" />
                  Ajouter une image
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewPostOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreatePost} disabled={!newPost.content}>
                {newPost.scheduledAt ? 'Programmer' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Abonnés</p>
                <p className="text-xl font-bold">{stats?.totalFollowers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Send className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Publiés</p>
                <p className="text-xl font-bold">{stats?.postedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Programmés</p>
                <p className="text-xl font-bold">{stats?.scheduledCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <MessageCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avis en attente</p>
                <p className="text-xl font-bold">{stats?.pendingReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Accounts */}
      <div className="flex items-center gap-4">
        <Badge className="gap-1 bg-blue-100 text-blue-700 hover:bg-blue-100">
          <Facebook className="h-3 w-3" />
          Facebook connecté
        </Badge>
        <Badge className="gap-1 bg-pink-100 text-pink-700 hover:bg-pink-100">
          <Instagram className="h-3 w-3" />
          Instagram connecté
        </Badge>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full max-w-xl grid-cols-4">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendrier</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Avis</span>
          </TabsTrigger>
          <TabsTrigger value="drafts" className="flex items-center gap-2">
            <span className="hidden sm:inline">Brouillons</span>
            {stats?.draftCount && stats.draftCount > 0 && (
              <Badge variant="secondary" className="ml-1">{stats.draftCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <SocialCalendar />
        </TabsContent>

        <TabsContent value="analytics">
          <SocialAnalytics />
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewMonitor />
        </TabsContent>

        <TabsContent value="drafts">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Share2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun brouillon enregistré</p>
              <p className="text-sm mt-1">Créez une publication pour commencer</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
