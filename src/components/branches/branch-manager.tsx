'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useToast } from '@/hooks/use-toast';
import { BranchAnalytics } from './branch-analytics';
import { BranchDetail } from './branch-detail';
import { 
  Building, 
  MapPin, 
  Users, 
  Phone, 
  Plus, 
  Settings,
  BarChart3,
  Store,
  Mail,
  Clock,
  Star,
  Package,
  DollarSign,
  Loader2,
  ChevronRight,
  Trash2,
  Edit,
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Construction,
  XCircle,
} from 'lucide-react';

// Demo branches
const DEMO_BRANCHES = [
  { 
    id: 'branch-001', 
    name: 'KFM DELICE - Kaloum', 
    code: 'KAL-001',
    address: 'Avenue de la République, Kaloum',
    city: 'Kaloum',
    phone: '+224 62 123 45 67',
    email: 'kaloum@kfm-delice.com',
    managerId: '1',
    managerName: 'Amadou Touré',
    managerPhone: '+224 66 111 22 33',
    status: 'active',
    isOpen: true,
    isBusy: false,
    isMain: true,
    totalStaff: 8,
    dailyRevenue: 2850000,
    dailyOrders: 145,
    activeOrders: 12,
    rating: 4.8,
    operatingHours: { open: '08:00', close: '22:00' },
    openDate: '2023-01-15',
  },
  { 
    id: 'branch-002', 
    name: 'KFM DELICE - Dixinn', 
    code: 'DIX-001',
    address: 'Quartier Dixinn, Route de l\'Aéroport',
    city: 'Dixinn',
    phone: '+224 62 234 56 78',
    email: 'dixinn@kfm-delice.com',
    managerId: '2',
    managerName: 'Fatou Diallo',
    managerPhone: '+224 66 222 33 44',
    status: 'active',
    isOpen: true,
    isBusy: true,
    isMain: false,
    totalStaff: 12,
    dailyRevenue: 4150000,
    dailyOrders: 210,
    activeOrders: 18,
    rating: 4.6,
    operatingHours: { open: '09:00', close: '23:00' },
    openDate: '2023-06-01',
  },
  { 
    id: 'branch-003', 
    name: 'KFM DELICE - Matam', 
    code: 'MAT-001',
    address: 'Marché de Matam, Rue Principale',
    city: 'Matam',
    phone: '+224 62 345 67 89',
    email: 'matam@kfm-delice.com',
    managerId: '3',
    managerName: 'Ibrahim Koné',
    managerPhone: '+224 66 333 44 55',
    status: 'active',
    isOpen: true,
    isBusy: false,
    isMain: false,
    totalStaff: 6,
    dailyRevenue: 1850000,
    dailyOrders: 85,
    activeOrders: 8,
    rating: 4.7,
    operatingHours: { open: '07:00', close: '21:00' },
    openDate: '2023-09-15',
  },
  { 
    id: 'branch-004', 
    name: 'KFM DELICE - Ratoma', 
    code: 'RAT-001',
    address: 'Quartier Ratoma, Centre Commercial',
    city: 'Ratoma',
    phone: '+224 62 456 78 90',
    email: 'ratoma@kfm-delice.com',
    managerId: '4',
    managerName: 'Mariama Sylla',
    managerPhone: '+224 66 444 55 66',
    status: 'construction',
    isOpen: false,
    isBusy: false,
    isMain: false,
    totalStaff: 0,
    dailyRevenue: 0,
    dailyOrders: 0,
    activeOrders: 0,
    rating: 0,
    operatingHours: { open: '08:00', close: '22:00' },
    openDate: '2025-03-01',
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: 'Actif', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2 },
  construction: { label: 'En construction', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: Construction },
  closed: { label: 'Fermé', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: XCircle },
};

// Format GNF currency
const formatCurrency = (amount: number) => `${amount?.toLocaleString('fr-FR') || 0} GNF`;

export function BranchManager() {
  const { toast } = useToast();
  const [branches, setBranches] = useState(DEMO_BRANCHES);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [editBranch, setEditBranch] = useState<any>(null);
  const [newBranch, setNewBranch] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    managerName: '',
    managerPhone: '',
    status: 'construction',
    openHour: '08:00',
    closeHour: '22:00',
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Stats
  const totalBranches = branches.length;
  const activeBranches = branches.filter(b => b.status === 'active').length;
  const totalStaff = branches.reduce((sum, b) => sum + b.totalStaff, 0);
  const totalRevenue = branches.reduce((sum, b) => sum + b.dailyRevenue, 0);
  const totalOrders = branches.reduce((sum, b) => sum + b.dailyOrders, 0);

  const handleCreateBranch = () => {
    const code = newBranch.code || newBranch.city.substring(0, 3).toUpperCase() + '-' + String(branches.length + 1).padStart(3, '0');
    const branch = {
      ...newBranch,
      id: `branch-${Date.now()}`,
      code,
      isOpen: false,
      isBusy: false,
      isMain: false,
      totalStaff: 0,
      dailyRevenue: 0,
      dailyOrders: 0,
      activeOrders: 0,
      rating: 0,
      operatingHours: { open: newBranch.openHour, close: newBranch.closeHour },
    };
    setBranches([...branches, branch]);
    setIsNewDialogOpen(false);
    setNewBranch({
      name: '',
      code: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      managerName: '',
      managerPhone: '',
      status: 'construction',
      openHour: '08:00',
      closeHour: '22:00',
    });
    toast({
      title: 'Succursale créée',
      description: `${branch.name} a été ajoutée avec succès`,
    });
  };

  const handleDeleteBranch = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    if (branch?.isMain) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la succursale principale',
        variant: 'destructive',
      });
      return;
    }
    setBranches(branches.map(b => b.id === branchId ? { ...b, status: 'closed' } : b));
    toast({
      title: 'Succursale archivée',
      description: 'La succursale a été archivée avec succès',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
          <p className="mt-2 text-muted-foreground">Chargement des succursales...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total succursales</p>
            <p className="text-2xl font-bold">{totalBranches}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Actives</p>
            <p className="text-2xl font-bold text-green-600">{activeBranches}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Personnel total</p>
            <p className="text-2xl font-bold text-blue-600">{totalStaff}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Revenus/jour</p>
            <p className="text-lg font-bold text-purple-600">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Commandes/jour</p>
            <p className="text-2xl font-bold text-orange-600">{totalOrders}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="branches" className="space-y-6">
        <TabsList>
          <TabsTrigger value="branches" className="gap-2">
            <Store className="h-4 w-4" />
            Succursales
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analyses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branches" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Branches List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        Gestion des succursales
                      </CardTitle>
                      <CardDescription>Gérez vos emplacements KFM DELICE</CardDescription>
                    </div>
                    <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2 bg-gradient-to-r from-orange-500 to-red-600">
                          <Plus className="h-4 w-4" />
                          Nouvelle succursale
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Nouvelle succursale</DialogTitle>
                          <DialogDescription>Ajouter un nouvel emplacement</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Nom *</Label>
                              <Input 
                                value={newBranch.name}
                                onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                                placeholder="KFM DELICE - [Ville]"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Code</Label>
                              <Input 
                                value={newBranch.code}
                                onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                                placeholder="XXX-001"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Adresse *</Label>
                            <Input 
                              value={newBranch.address}
                              onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Ville *</Label>
                              <Input 
                                value={newBranch.city}
                                onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Téléphone *</Label>
                              <Input 
                                value={newBranch.phone}
                                onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                                placeholder="+224 XX XXX XXX XX"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input 
                              value={newBranch.email}
                              onChange={(e) => setNewBranch({ ...newBranch, email: e.target.value })}
                              type="email"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Gestionnaire</Label>
                              <Input 
                                value={newBranch.managerName}
                                onChange={(e) => setNewBranch({ ...newBranch, managerName: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Tél. gestionnaire</Label>
                              <Input 
                                value={newBranch.managerPhone}
                                onChange={(e) => setNewBranch({ ...newBranch, managerPhone: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Statut</Label>
                              <Select value={newBranch.status} onValueChange={(v) => setNewBranch({ ...newBranch, status: v })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="construction">En construction</SelectItem>
                                  <SelectItem value="active">Actif</SelectItem>
                                  <SelectItem value="closed">Fermé</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Ouverture</Label>
                              <Input 
                                type="time"
                                value={newBranch.openHour}
                                onChange={(e) => setNewBranch({ ...newBranch, openHour: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Fermeture</Label>
                              <Input 
                                type="time"
                                value={newBranch.closeHour}
                                onChange={(e) => setNewBranch({ ...newBranch, closeHour: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>Annuler</Button>
                          <Button onClick={handleCreateBranch} className="bg-gradient-to-r from-orange-500 to-red-600">
                            Créer la succursale
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {branches.map(branch => {
                        const statusConfig = STATUS_CONFIG[branch.status];
                        const StatusIcon = statusConfig.icon;
                        
                        return (
                          <div 
                            key={branch.id}
                            className={`flex flex-col sm:flex-row sm:items-start justify-between p-4 rounded-lg border gap-4 cursor-pointer transition-all hover:shadow-md ${
                              selectedBranch === branch.id ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20' : ''
                            }`}
                            onClick={() => setSelectedBranch(branch.id)}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                branch.status === 'active' ? 'bg-gradient-to-br from-orange-500 to-red-600' : 
                                branch.status === 'construction' ? 'bg-amber-100 dark:bg-amber-900/30' : 
                                'bg-slate-100 dark:bg-slate-800'
                              }`}>
                                <Building className={`h-6 w-6 ${
                                  branch.status === 'active' ? 'text-white' : 
                                  branch.status === 'construction' ? 'text-amber-600' : 
                                  'text-slate-500'
                                }`} />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold">{branch.name}</p>
                                  {branch.isMain && (
                                    <Badge className="bg-orange-500 text-white text-xs">Principal</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3 inline mr-1" />
                                  {branch.address}, {branch.city}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {branch.phone}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {branch.operatingHours.open} - {branch.operatingHours.close}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {branch.totalStaff} pers.
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col sm:items-end gap-2">
                              <div className="flex items-center gap-2">
                                <Badge className={statusConfig.color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusConfig.label}
                                </Badge>
                                {branch.status === 'active' && (
                                  <Badge variant="outline" className={branch.isOpen ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                                    {branch.isOpen ? 'Ouvert' : 'Fermé'}
                                  </Badge>
                                )}
                              </div>
                              {branch.status === 'active' && (
                                <div className="text-right">
                                  <p className="font-bold text-green-600">
                                    {formatCurrency(branch.dailyRevenue)}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>{branch.dailyOrders} commandes</span>
                                    {branch.rating > 0 && (
                                      <span className="flex items-center gap-1">
                                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                        {branch.rating}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBranch(branch.id);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {!branch.isMain && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteBranch(branch.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Branch Detail */}
            <div className="lg:col-span-1">
              <BranchDetail branchId={selectedBranch || undefined} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <BranchAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BranchManager;
