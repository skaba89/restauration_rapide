'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Share2, 
  Instagram, 
  Facebook, 
  Calendar, 
  Plus, 
  Image,
  Send,
  Clock,
  ThumbsUp,
  MessageCircle,
  TrendingUp
} from 'lucide-react';

// Demo social posts
const DEMO_POSTS = [
  {
    id: '1',
    platform: 'facebook',
    type: 'daily_special',
    content: '🍽️ Spécial du jour: Attieké Poisson Grillé avec sauce tomamarinade! Seulement 15 000 GNF au lieu de 20 000 GNF. Disponible à midi et soir.',
    status: 'published',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    engagementStats: { likes: 45, shares: 12, comments: 8 },
  },
  {
    id: '2',
    platform: 'instagram',
    type: 'promotion',
    content: '🎉 CE WEEKEND! 20% de réduction sur toutes les commandes de livraison ce samedi et dimanche. Code promo: WEEKEND20',
    status: 'published',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    engagementStats: { likes: 128, shares: 34, comments: 22 },
  },
  {
    id: '3',
    platform: 'facebook',
    type: 'event',
    content: '🎊 Grand Opening de notre nouvelle terrasse! Rejoignez-nous ce vendredi pour découvrir notre tout nouvel espace avec vue panoramique.',
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    platform: 'instagram',
    type: 'daily_special',
    content: '🍹 Nouveau: Jus de Gingembre frais maison! Énergisant et délicieux. Essayez-le aujourd!',
    status: 'draft',
  },
];

// Platform config
const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
];

export function SocialMediaManager() {
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    platform: 'facebook',
    type: 'daily_special',
    content: '',
    scheduledAt: '',
  });

  // Stats
  const publishedCount = posts.filter(p => p.status === 'published').length;
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const totalEngagement = posts.reduce((sum, p) => {
    const stats = p.engagementStats as any;
    return sum + (stats?.likes || 0) + (stats?.shares || 0) + (stats?.comments || 0);
  }, 0);

  const handleCreatePost = () => {
    const newPostData = {
      id: Date.now().toString(),
      ...newPost,
      status: newPost.scheduledAt ? 'scheduled' : 'draft',
      publishedAt: newPost.scheduledAt ? null : new Date(),
    };
    setPosts([newPostData as any, ...posts]);
    setIsComposeOpen(false);
    setNewPost({ platform: 'facebook', type: 'daily_special', content: '', scheduledAt: '' });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      default: return <Share2 className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publié';
      case 'scheduled': return 'Programmé';
      case 'draft': return 'Brouillon';
      case 'failed': return 'Échoué';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Publications</p>
                <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
              </div>
              <Send className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Programmés</p>
                <p className="text-2xl font-bold text-blue-600">{scheduledCount}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engagement total</p>
                <p className="text-2xl font-bold text-purple-600">{totalEngagement}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Posts List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Publications</CardTitle>
                <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Nouvelle publication
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nouvelle publication</DialogTitle>
                      <DialogDescription>
                        Créez une publication pour les réseaux sociaux
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Plateforme</Label>
                          <Select value={newPost.platform} onValueChange={(v) => setNewPost({ ...newPost, platform: v })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="instagram">Instagram</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select value={newPost.type} onValueChange={(v) => setNewPost({ ...newPost, type: v })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily_special">Spécial du jour</SelectItem>
                              <SelectItem value="promotion">Promotion</SelectItem>
                              <SelectItem value="event">Événement</SelectItem>
                              <SelectItem value="general">Général</SelectItem>
                            </SelectContent>
                          </Select>
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
                      </div>
                      <div>
                        <Label>Programmer (optionnel)</Label>
                        <Input
                          type="datetime-local"
                          value={newPost.scheduledAt}
                          onChange={(e) => setNewPost({ ...newPost, scheduledAt: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsComposeOpen(false)}>Annuler</Button>
                      <Button onClick={handleCreatePost}>Créer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {posts.map(post => (
                    <div 
                      key={post.id}
                      className="p-4 rounded-lg border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(post.platform)}
                          <Badge variant="outline">{post.platform}</Badge>
                          <Badge className={getStatusColor(post.status)}>
                            {getStatusLabel(post.status)}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {post.publishedAt?.toLocaleDateString('fr-FR') || 
                           post.scheduledAt && `Programmé: ${new Date(post.scheduledAt).toLocaleDateString('fr-FR')}`}
                        </span>
                      </div>
                      <p className="text-sm">{post.content}</p>
                      {post.engagementStats && (
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" /> {(post.engagementStats as any).likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="h-3 w-3" /> {(post.engagementStats as any).shares}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" /> {(post.engagementStats as any).comments}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start gap-2">
                <Image className="h-4 w-4" />
                Publier spécial du jour
              </Button>
              <Button className="w-full justify-start gap-2">
                <Calendar className="h-4 w-4" />
                Programmer la semaine
              </Button>
              <Button className="w-full justify-start gap-2">
                <TrendingUp className="h-4 w-4" />
                Voir les performances
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comptes connectés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {PLATFORMS.map(platform => (
                <div key={platform.id} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <platform.icon className={`h-4 w-4 ${platform.color}`} />
                    <span>{platform.name}</span>
                  </div>
                  <Badge>Connecté</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SocialMediaManager;
