'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAuth } from '@/lib/api-client';
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Clock,
  Users,
  DollarSign,
  Star,
  Package,
  Truck,
  ChefHat,
  Edit,
  Settings,
  BarChart3,
  Loader2,
  Calendar,
  Navigation,
  ExternalLink,
} from 'lucide-react';

interface BranchStats {
  staffCount: number;
  dailyRevenue: number;
  activeOrders: number;
  rating: number;
}

interface BranchDetail {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  email?: string;
  managerName: string;
  managerPhone: string;
  status: 'active' | 'construction' | 'closed';
  openDate: string;
  operatingHours: {
    open: string;
    close: string;
  };
  stats: BranchStats;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isMain?: boolean;
  isOpen?: boolean;
  isBusy?: boolean;
}

interface BranchDetailProps {
  branchId?: string;
  onEdit?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  construction: 'En construction',
  closed: 'Fermé',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200',
  construction: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200',
  closed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200',
};

// Format GNF currency
const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} GNF`;

export function BranchDetail({ branchId, onEdit }: BranchDetailProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [branch, setBranch] = useState<BranchDetail | null>(null);

  useEffect(() => {
    const fetchBranch = async () => {
      if (!branchId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetchWithAuth('/api/branches');
        const data = await response.json();
        if (data.success) {
          const foundBranch = data.branches.find((b: BranchDetail) => b.id === branchId);
          setBranch(foundBranch || null);
        }
      } catch (error) {
        console.error('Failed to fetch branch:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBranch();
  }, [branchId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
          <p className="mt-2 text-muted-foreground">Chargement des détails...</p>
        </CardContent>
      </Card>
    );
  }

  if (!branch) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Building className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Sélectionnez une succursale pour voir les détails</p>
        </CardContent>
      </Card>
    );
  }

  const kitchenUtilization = Math.min(100, Math.round((branch.stats.activeOrders / 30) * 100));
  const openDate = new Date(branch.openDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-xl ${branch.status === 'active' ? 'bg-gradient-to-br from-orange-500 to-red-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <Building className={`h-8 w-8 ${branch.status === 'active' ? 'text-white' : 'text-slate-500'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>{branch.name}</CardTitle>
                  {branch.isMain && (
                    <Badge className="bg-orange-500 text-white">Principal</Badge>
                  )}
                </div>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <span className="font-mono">{branch.code}</span>
                  <span>•</span>
                  <Badge className={STATUS_COLORS[branch.status]}>
                    {STATUS_LABELS[branch.status]}
                  </Badge>
                  {branch.isOpen && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Ouvert
                    </Badge>
                  )}
                </CardDescription>
              </div>
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contact Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{branch.address}, {branch.city}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${branch.phone}`} className="text-blue-600 hover:underline">
                  {branch.phone}
                </a>
              </div>
              {branch.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${branch.email}`} className="text-blue-600 hover:underline">
                    {branch.email}
                  </a>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{branch.operatingHours.open} - {branch.operatingHours.close}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Ouvert le {openDate}</span>
              </div>
              {branch.coordinates && (
                <div className="flex items-center gap-3 text-sm">
                  <Navigation className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {branch.coordinates.lat.toFixed(4)}, {branch.coordinates.lng.toFixed(4)}
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Manager Info */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div>
              <p className="text-sm text-muted-foreground">Gestionnaire</p>
              <p className="font-medium">{branch.managerName}</p>
            </div>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              {branch.managerPhone}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Personnel</p>
                <p className="text-2xl font-bold">{branch.stats.staffCount}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus du jour</p>
                <p className="text-lg font-bold">{formatCurrency(branch.stats.dailyRevenue)}</p>
              </div>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Commandes actives</p>
                <p className="text-2xl font-bold">{branch.stats.activeOrders}</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Note</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">{branch.stats.rating}</p>
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                </div>
              </div>
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kitchen & Delivery Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              État de la cuisine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Utilisation</span>
                <span className="font-medium">{kitchenUtilization}%</span>
              </div>
              <Progress value={kitchenUtilization} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {kitchenUtilization < 50 ? 'Capacité disponible' : 
                 kitchenUtilization < 80 ? 'Charge normale' : 
                 'Charge élevée'}
              </p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <span className="text-sm">État actuel</span>
              <Badge variant={branch.isBusy ? 'destructive' : 'default'}>
                {branch.isBusy ? 'Très occupé' : 'Normal'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Livraison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(branch.stats.activeOrders * 0.6)}
                </p>
                <p className="text-xs text-muted-foreground">En livraison</p>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(branch.stats.activeOrders * 0.4)}
                </p>
                <p className="text-xs text-muted-foreground">À emporter</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <span className="text-sm">Temps de préparation moyen</span>
              <span className="font-medium">15 min</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Placeholder */}
      {branch.coordinates && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Emplacement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
              <div className="text-center">
                <Navigation className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Carte: {branch.coordinates.lat.toFixed(4)}, {branch.coordinates.lng.toFixed(4)}
                </p>
                <p className="text-xs text-muted-foreground">{branch.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default BranchDetail;
