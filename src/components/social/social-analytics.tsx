'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Facebook, 
  Instagram, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  BarChart3,
  Clock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AnalyticsData {
  followers: number;
  followersChange: number;
  engagement: number;
  reach: number;
  impressions: number;
  topPost?: {
    id: string;
    likes: number;
    comments: number;
    shares: number;
  };
  bestTimes: string[];
}

const COLORS = ['#f97316', '#3b82f6', '#ec4899', '#22c55e', '#a855f7'];

const ENGAGEMENT_DATA = [
  { day: 'Lun', facebook: 45, instagram: 62 },
  { day: 'Mar', facebook: 52, instagram: 58 },
  { day: 'Mer', facebook: 48, instagram: 72 },
  { day: 'Jeu', facebook: 61, instagram: 85 },
  { day: 'Ven', facebook: 78, instagram: 92 },
  { day: 'Sam', facebook: 95, instagram: 110 },
  { day: 'Dim', facebook: 82, instagram: 98 },
];

const FOLLOWERS_GROWTH = [
  { month: 'Jan', followers: 3200 },
  { month: 'Fév', followers: 3450 },
  { month: 'Mar', followers: 3680 },
  { month: 'Avr', followers: 3900 },
  { month: 'Mai', followers: 4120 },
  { month: 'Juin', followers: 4250 },
];

const REACH_BY_TYPE = [
  { name: 'Photos', value: 45 },
  { name: 'Vidéos', value: 25 },
  { name: 'Stories', value: 20 },
  { name: 'Reels', value: 10 },
];

export function SocialAnalytics() {
  const [analytics, setAnalytics] = useState<Record<string, AnalyticsData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'facebook' | 'instagram'>('all');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/social?type=analytics');
      const result = await response.json();
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
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

  const totalFollowers = analytics 
    ? (analytics.facebook?.followers || 0) + (analytics.instagram?.followers || 0)
    : 0;
  const avgEngagement = analytics 
    ? ((analytics.facebook?.engagement || 0) + (analytics.instagram?.engagement || 0)) / 2
    : 0;

  return (
    <div className="space-y-6">
      {/* Platform Selector */}
      <div className="flex items-center gap-4">
        <Select value={selectedPlatform} onValueChange={(v) => setSelectedPlatform(v as any)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les plateformes</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">Abonnés</span>
            </div>
            <p className="text-2xl font-bold">{totalFollowers.toLocaleString()}</p>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +214 ce mois
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Engagement</span>
            </div>
            <p className="text-2xl font-bold">{avgEngagement.toFixed(1)}%</p>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +0.5% vs mois dernier
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Eye className="h-4 w-4" />
              <span className="text-sm">Portée</span>
            </div>
            <p className="text-2xl font-bold">
              {((analytics?.facebook?.reach || 0) + (analytics?.instagram?.reach || 0)).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">30 derniers jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm">Impressions</span>
            </div>
            <p className="text-2xl font-bold">
              {((analytics?.facebook?.impressions || 0) + (analytics?.instagram?.impressions || 0)).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">30 derniers jours</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Details */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Facebook className="h-5 w-5 text-blue-600" />
                Facebook
              </CardTitle>
              <Badge variant="outline">Connecté</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Abonnés</p>
                <p className="text-xl font-bold">{analytics?.facebook?.followers.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Engagement</p>
                <p className="text-xl font-bold">{analytics?.facebook?.engagement}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Portée</p>
                <p className="text-xl font-bold">{analytics?.facebook?.reach.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Croissance</p>
                <p className="text-xl font-bold text-green-600">+{analytics?.facebook?.followersChange}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5 text-pink-600" />
                Instagram
              </CardTitle>
              <Badge variant="outline">Connecté</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Abonnés</p>
                <p className="text-xl font-bold">{analytics?.instagram?.followers.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Engagement</p>
                <p className="text-xl font-bold">{analytics?.instagram?.engagement}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Portée</p>
                <p className="text-xl font-bold">{analytics?.instagram?.reach.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Croissance</p>
                <p className="text-xl font-bold text-green-600">+{analytics?.instagram?.followersChange}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="growth">Croissance</TabsTrigger>
          <TabsTrigger value="reach">Portée</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Engagement par jour de la semaine</CardTitle>
              <CardDescription>Nombre d'interactions moyennes par jour</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ENGAGEMENT_DATA}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="facebook" fill="#3b82f6" name="Facebook" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="instagram" fill="#ec4899" name="Instagram" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>Croissance des abonnés</CardTitle>
              <CardDescription>Évolution sur les 6 derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={FOLLOWERS_GROWTH}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="followers" 
                      stroke="#f97316" 
                      strokeWidth={3}
                      dot={{ fill: '#f97316', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reach">
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par type de contenu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={REACH_BY_TYPE}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {REACH_BY_TYPE.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {REACH_BY_TYPE.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index] }} 
                      />
                      <span className="text-sm">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meilleurs horaires de publication</CardTitle>
                <CardDescription>Moments avec le plus d'engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Facebook className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Facebook</span>
                    </div>
                    <div className="flex gap-2">
                      {analytics?.facebook?.bestTimes.map((time, i) => (
                        <Badge key={i} variant="secondary">{time}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Instagram className="h-4 w-4 text-pink-600" />
                      <span className="font-medium">Instagram</span>
                    </div>
                    <div className="flex gap-2">
                      {analytics?.instagram?.bestTimes.map((time, i) => (
                        <Badge key={i} variant="secondary">{time}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 rounded-lg bg-muted">
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Conseil</p>
                      <p className="text-sm text-muted-foreground">
                        Publiez vos contenus entre 12h et 13h ou entre 19h et 21h 
                        pour maximiser votre engagement.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SocialAnalytics;
