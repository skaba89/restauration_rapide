'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Clock, 
  Users, 
  Phone, 
  UserPlus, 
  CheckCircle, 
  Bell,
  CalendarClock,
  Star,
  XCircle,
  RefreshCw,
  MessageSquare,
  MapPin,
  AlertCircle,
  Trash2,
  MoreVertical,
  Timer,
  GripVertical,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Send
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

// Types
interface WaitlistEntry {
  id: string;
  guestName: string;
  guestPhone: string;
  partySize: number;
  preferredArea?: string | null;
  specialRequests?: string | null;
  status: 'WAITING' | 'NOTIFIED' | 'SEATED' | 'CANCELLED' | 'EXPIRED';
  priority: number;
  estimatedWait: number;
  quotedWait: number;
  createdAt: string | Date;
  notifiedAt?: string | Date | null;
  seatedAt?: string | Date | null;
  cancelledAt?: string | Date | null;
}

interface WaitlistStats {
  totalWaiting: number;
  totalNotified: number;
  totalSeated: number;
  totalCancelled: number;
  averageWaitTime: number;
  currentEstimatedWait: number;
}

interface DetailedStats {
  current: {
    waiting: number;
    notified: number;
    averageWaitTime: number;
    longestWait: number;
    shortestWait: number;
    totalParties: number;
    totalGuests: number;
  };
  today: {
    totalEntries: number;
    seated: number;
    cancelled: number;
    noShows: number;
    averageWaitTime: number;
    averageQuotedTime: number;
    accuracyRate: number;
    peakHour: string;
    peakWaitTime: number;
  };
  trends: {
    waitTimeChange: number;
    volumeChange: number;
    seatingRate: number;
  };
  hourlyData: Array<{
    hour: string;
    entries: number;
    avgWait: number;
  }>;
  partySizeDistribution: Array<{
    size: string;
    count: number;
    percentage: number;
  }>;
}

// Status configuration
const STATUS_CONFIG = {
  WAITING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', icon: Clock },
  NOTIFIED: { label: 'Notifié', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: Bell },
  SEATED: { label: 'Installé', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
  CANCELLED: { label: 'Annulé', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', icon: XCircle },
  EXPIRED: { label: 'Expiré', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: Timer },
};

// Priority configuration
const PRIORITY_CONFIG = {
  0: { label: 'Normal', color: 'bg-gray-100 text-gray-700' },
  1: { label: 'VIP', color: 'bg-yellow-100 text-yellow-700' },
  2: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
};

// Area options
const AREA_OPTIONS = [
  { value: 'interieur', label: 'Intérieur' },
  { value: 'terrasse', label: 'Terrasse' },
  { value: 'vip', label: 'Salle VIP' },
  { value: 'any', label: 'Peu importe' },
];

// Average Wait Time Calculator Component
function AverageWaitCalculator({ stats }: { stats: DetailedStats | null }) {
  if (!stats) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Calculateur de Temps Moyen
        </CardTitle>
        <CardDescription>
          Statistiques de temps d&apos;attente pour aujourd&apos;hui
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted">
            <p className="text-2xl font-bold text-primary">{stats.today.averageWaitTime}</p>
            <p className="text-sm text-muted-foreground">Min. moyenne</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted">
            <p className="text-2xl font-bold text-primary">{stats.today.averageQuotedTime}</p>
            <p className="text-sm text-muted-foreground">Temps annoncé moy.</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted">
            <p className="text-2xl font-bold text-green-600">{stats.today.accuracyRate}%</p>
            <p className="text-sm text-muted-foreground">Précision</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted">
            <p className="text-2xl font-bold text-orange-600">{stats.today.seatingRate}%</p>
            <p className="text-sm text-muted-foreground">Taux d&apos;installation</p>
          </div>
        </div>
        
        {/* Trend indicators */}
        <div className="mt-4 flex items-center gap-4 justify-center">
          <div className="flex items-center gap-1">
            {stats.trends.waitTimeChange < 0 ? (
              <TrendingDown className="h-4 w-4 text-green-500" />
            ) : stats.trends.waitTimeChange > 0 ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <Minus className="h-4 w-4 text-gray-500" />
            )}
            <span className="text-sm text-muted-foreground">
              Temps: {Math.abs(stats.trends.waitTimeChange)}% vs hier
            </span>
          </div>
          <div className="flex items-center gap-1">
            {stats.trends.volumeChange > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : stats.trends.volumeChange < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : (
              <Minus className="h-4 w-4 text-gray-500" />
            )}
            <span className="text-sm text-muted-foreground">
              Volume: {Math.abs(stats.trends.volumeChange)}% vs hier
            </span>
          </div>
        </div>

        {/* Party size distribution */}
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Distribution par taille de groupe</p>
          <div className="space-y-2">
            {stats.partySizeDistribution.map(item => (
              <div key={item.size} className="flex items-center gap-2">
                <span className="text-sm w-12">{item.size} pers.</span>
                <Progress value={item.percentage} className="h-2 flex-1" />
                <span className="text-sm text-muted-foreground w-12">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WaitlistManager() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [newGuest, setNewGuest] = useState({
    guestName: '',
    guestPhone: '',
    partySize: 2,
    priority: 0,
    preferredArea: '',
    specialRequests: '',
    quotedWait: 15,
  });

  // Fetch waitlist data
  const fetchWaitlist = useCallback(async () => {
    try {
      const response = await fetch('/api/waitlist');
      const data = await response.json();
      
      if (data.success) {
        setWaitlist(data.data);
        setStats(data.stats);
      } else {
        toast.error('Erreur lors du chargement de la liste d\'attente');
      }
    } catch (error) {
      console.error('Error fetching waitlist:', error);
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch detailed stats
  const fetchDetailedStats = useCallback(async () => {
    try {
      const response = await fetch('/api/waitlist/stats');
      const data = await response.json();
      
      if (data.success) {
        setDetailedStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching detailed stats:', error);
    }
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchWaitlist();
    fetchDetailedStats();
    const interval = setInterval(fetchWaitlist, 30000);
    return () => clearInterval(interval);
  }, [fetchWaitlist, fetchDetailedStats]);

  // Calculate wait time for each entry
  const getWaitTime = (entry: WaitlistEntry): number => {
    if (entry.status !== 'WAITING' && entry.status !== 'NOTIFIED') return 0;
    
    const created = new Date(entry.createdAt);
    const now = new Date();
    const elapsedMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    return Math.max(0, entry.quotedWait - elapsedMinutes + entry.estimatedWait);
  };

  // Format time ago
  const formatTimeAgo = (date: string | Date): string => {
    const now = new Date();
    const past = new Date(date);
    const minutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${Math.floor(hours / 24)}j`;
  };

  // Add guest
  const handleAddGuest = async () => {
    if (!newGuest.guestName || !newGuest.guestPhone) {
      toast.error('Le nom et le téléphone sont requis');
      return;
    }

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newGuest,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Client ajouté à la liste d\'attente');
        setIsAddDialogOpen(false);
        setNewGuest({
          guestName: '',
          guestPhone: '',
          partySize: 2,
          priority: 0,
          preferredArea: '',
          specialRequests: '',
          quotedWait: 15,
        });
        fetchWaitlist();
      } else {
        toast.error(data.error || 'Erreur lors de l\'ajout');
      }
    } catch (error) {
      console.error('Error adding guest:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Update status
  const handleUpdateStatus = async (id: string, status: WaitlistEntry['status']) => {
    try {
      const response = await fetch('/api/waitlist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchWaitlist();
      } else {
        toast.error(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Update priority via drag and drop
  const handlePriorityUpdate = async (id: string, newPriority: number) => {
    try {
      const response = await fetch(`/api/waitlist/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Priorité mise à jour');
        fetchWaitlist();
      } else {
        toast.error(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Delete entry
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/waitlist?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchWaitlist();
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Notify guest (SMS)
  const handleNotify = async (entry: WaitlistEntry) => {
    try {
      const response = await fetch(`/api/waitlist/${entry.id}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`SMS envoyé à ${entry.guestName}`);
        fetchWaitlist();
      } else {
        toast.error(data.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Error notifying:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Seat guest
  const handleSeat = async (entry: WaitlistEntry) => {
    try {
      const response = await fetch(`/api/waitlist/${entry.id}/seat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`${entry.guestName} a été installé`);
        fetchWaitlist();
      } else {
        toast.error(data.error || 'Erreur lors de l\'installation');
      }
    } catch (error) {
      console.error('Error seating:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Cancel entry
  const handleCancel = async (entry: WaitlistEntry) => {
    try {
      const response = await fetch(`/api/waitlist/${entry.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchWaitlist();
      } else {
        toast.error(data.error || 'Erreur lors de l\'annulation');
      }
    } catch (error) {
      console.error('Error cancelling:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Drag handlers
  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;
    
    // Reorder items locally for visual feedback
    const draggedIndex = waitlist.findIndex(item => item.id === draggedItem);
    const targetIndex = waitlist.findIndex(item => item.id === targetId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newList = [...waitlist];
      const [removed] = newList.splice(draggedIndex, 1);
      newList.splice(targetIndex, 0, removed);
      setWaitlist(newList);
    }
  };

  const handleDragEnd = () => {
    if (draggedItem) {
      // Calculate new priority based on position
      const index = waitlist.findIndex(item => item.id === draggedItem);
      if (index !== -1) {
        const newPriority = index < 3 ? 2 : index < 6 ? 1 : 0;
        handlePriorityUpdate(draggedItem, newPriority);
      }
    }
    setDraggedItem(null);
  };

  // Filter active entries
  const activeEntries = waitlist.filter(e => e.status === 'WAITING' || e.status === 'NOTIFIED');
  const completedEntries = waitlist.filter(e => e.status === 'SEATED' || e.status === 'CANCELLED' || e.status === 'EXPIRED');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-64 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.totalWaiting || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Notifiés</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.totalNotified || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Installés</p>
                <p className="text-2xl font-bold text-green-600">{stats?.totalSeated || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attente estimée</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.currentEstimatedWait || 0} min</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <CalendarClock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Average Wait Time Calculator */}
      {showStats && detailedStats && <AverageWaitCalculator stats={detailedStats} />}

      {/* Waitlist */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Liste d&apos;attente
              </CardTitle>
              <CardDescription>
                Gérez les clients en attente de table - Glissez pour réorganiser
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowStats(!showStats)} 
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                {showStats ? 'Masquer stats' : 'Voir stats'}
              </Button>
              <Button variant="outline" size="sm" onClick={fetchWaitlist} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Actualiser
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Ajouter
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Ajouter un client</DialogTitle>
                    <DialogDescription>
                      Ajouter un nouveau client à la liste d&apos;attente
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label>Nom du client *</Label>
                        <Input 
                          value={newGuest.guestName}
                          onChange={(e) => setNewGuest({ ...newGuest, guestName: e.target.value })}
                          placeholder="Nom complet"
                        />
                      </div>
                      <div>
                        <Label>Téléphone *</Label>
                        <Input 
                          value={newGuest.guestPhone}
                          onChange={(e) => setNewGuest({ ...newGuest, guestPhone: e.target.value })}
                          placeholder="+224 XX XXX XX XX"
                        />
                      </div>
                      <div>
                        <Label>Nombre de personnes</Label>
                        <Input 
                          type="number"
                          value={newGuest.partySize}
                          onChange={(e) => setNewGuest({ ...newGuest, partySize: parseInt(e.target.value) || 1 })}
                          min={1}
                          max={20}
                        />
                      </div>
                      <div>
                        <Label>Priorité</Label>
                        <Select 
                          value={newGuest.priority.toString()}
                          onValueChange={(v) => setNewGuest({ ...newGuest, priority: parseInt(v) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Normal</SelectItem>
                            <SelectItem value="1">VIP</SelectItem>
                            <SelectItem value="2">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Zone préférée</Label>
                        <Select 
                          value={newGuest.preferredArea}
                          onValueChange={(v) => setNewGuest({ ...newGuest, preferredArea: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Peu importe" />
                          </SelectTrigger>
                          <SelectContent>
                            {AREA_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Temps estimé (min)</Label>
                        <Input 
                          type="number"
                          value={newGuest.quotedWait}
                          onChange={(e) => setNewGuest({ ...newGuest, quotedWait: parseInt(e.target.value) || 15 })}
                          min={5}
                          max={120}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Demandes spéciales</Label>
                        <Textarea 
                          value={newGuest.specialRequests}
                          onChange={(e) => setNewGuest({ ...newGuest, specialRequests: e.target.value })}
                          placeholder="Allergies, préférences, occasions spéciales..."
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Annuler</Button>
                    </DialogClose>
                    <Button onClick={handleAddGuest} disabled={!newGuest.guestName || !newGuest.guestPhone}>
                      Ajouter
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeEntries.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun client en attente</p>
              <p className="text-sm text-muted-foreground">Ajoutez des clients à la liste d&apos;attente</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {activeEntries.map((entry, index) => {
                  const waitTime = getWaitTime(entry);
                  const isUrgent = waitTime < 0;
                  const StatusIcon = STATUS_CONFIG[entry.status]?.icon || Clock;
                  
                  return (
                    <div 
                      key={entry.id}
                      draggable
                      onDragStart={() => handleDragStart(entry.id)}
                      onDragOver={(e) => handleDragOver(e, entry.id)}
                      onDragEnd={handleDragEnd}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border cursor-move transition-all ${
                        isUrgent ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : ''
                      } ${draggedItem === entry.id ? 'opacity-50 scale-98' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg shrink-0">
                            {index + 1}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-lg">{entry.guestName}</p>
                            {entry.priority > 0 && (
                              <Badge className={PRIORITY_CONFIG[entry.priority as keyof typeof PRIORITY_CONFIG]?.color}>
                                <Star className="h-3 w-3 mr-1 fill-current" />
                                {PRIORITY_CONFIG[entry.priority as keyof typeof PRIORITY_CONFIG]?.label}
                              </Badge>
                            )}
                            <Badge className={STATUS_CONFIG[entry.status]?.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {STATUS_CONFIG[entry.status]?.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {entry.guestPhone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {entry.partySize} pers.
                            </span>
                            {entry.preferredArea && entry.preferredArea !== 'any' && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {AREA_OPTIONS.find(a => a.value === entry.preferredArea)?.label || entry.preferredArea}
                              </span>
                            )}
                          </div>
                          {entry.specialRequests && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {entry.specialRequests}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Arrivé {formatTimeAgo(entry.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3 sm:mt-0">
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${isUrgent ? 'text-red-600' : 'text-primary'}`}>
                            {isUrgent ? (
                              <span className="flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                En retard
                              </span>
                            ) : (
                              `~${waitTime} min`
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Annoncé: {entry.quotedWait} min
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {entry.status === 'WAITING' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleNotify(entry)}
                              title="Notifier par SMS"
                              className="gap-1"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            onClick={() => handleSeat(entry)}
                            title="Marquer comme installé"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedEntry(entry)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleCancel(entry)}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Annuler
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(entry.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Completed Entries */}
      {completedEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Récemment traités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {completedEntries.slice(0, 5).map(entry => {
                  const StatusIcon = STATUS_CONFIG[entry.status]?.icon || Clock;
                  return (
                    <div 
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <StatusIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{entry.guestName}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.partySize} pers. • {formatTimeAgo(entry.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Badge className={STATUS_CONFIG[entry.status]?.color}>
                        {STATUS_CONFIG[entry.status]?.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Entry Details Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails du client</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  {selectedEntry.guestName.charAt(0)}
                </div>
                <div>
                  <p className="text-xl font-semibold">{selectedEntry.guestName}</p>
                  <p className="text-muted-foreground">{selectedEntry.guestPhone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre de personnes</p>
                  <p className="font-medium">{selectedEntry.partySize}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zone préférée</p>
                  <p className="font-medium">
                    {AREA_OPTIONS.find(a => a.value === selectedEntry.preferredArea)?.label || 'Peu importe'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Temps annoncé</p>
                  <p className="font-medium">{selectedEntry.quotedWait} min</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priorité</p>
                  <p className="font-medium">
                    {PRIORITY_CONFIG[selectedEntry.priority as keyof typeof PRIORITY_CONFIG]?.label}
                  </p>
                </div>
              </div>
              {selectedEntry.specialRequests && (
                <div>
                  <p className="text-sm text-muted-foreground">Demandes spéciales</p>
                  <p className="font-medium">{selectedEntry.specialRequests}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WaitlistManager;
