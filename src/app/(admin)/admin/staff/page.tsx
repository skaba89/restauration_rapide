'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UserCog,
  Plus,
  Search,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Edit,
  Eye,
  UserX,
  UserCheck,
} from 'lucide-react';
import { useCurrency } from '@/lib/currency-context';
import { apiGet } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: 'active' | 'on_leave' | 'inactive';
  salary: number;
  joinDate: string;
}

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  'Chef': { label: 'Chef', color: 'bg-purple-100 text-purple-700' },
  'Cuisinier': { label: 'Cuisinier', color: 'bg-blue-100 text-blue-700' },
  'Serveuse': { label: 'Serveuse', color: 'bg-green-100 text-green-700' },
  'Serveur': { label: 'Serveur', color: 'bg-green-100 text-green-700' },
  'Caissière': { label: 'Caissière', color: 'bg-orange-100 text-orange-700' },
};

const STATUS_CONFIG = {
  active: { label: 'Actif', color: 'bg-green-100 text-green-700' },
  on_leave: { label: 'En congé', color: 'bg-yellow-100 text-yellow-700' },
  inactive: { label: 'Inactif', color: 'bg-gray-100 text-gray-500' },
};

export default function StaffPage() {
  const { formatCurrency } = useCurrency();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<StaffMember | null>(null);
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Cuisinier',
    phone: '',
    email: '',
    salary: '',
    joinDate: new Date().toISOString().split('T')[0],
  });
  const { toast } = useToast();

  const fetchStaff = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiGet<{ staff: StaffMember[] }>('/staff');
      if (response?.staff && response.staff.length > 0) {
        setStaff(response.staff);
      } else {
        setDemoData();
      }
    } catch (err) {
      console.error('Failed to fetch staff:', err);
      setError('Erreur lors du chargement du personnel');
      setDemoData();
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoData = () => {
    setStaff([
      { id: '1', name: 'Amadou Diallo', role: 'Cuisinier', phone: '+224622000001', email: 'amadou@kfm-delice.com', status: 'active', salary: 1500000, joinDate: '2023-01-15' },
      { id: '2', name: 'Fatou Sylla', role: 'Serveuse', phone: '+224622000002', email: 'fatou@kfm-delice.com', status: 'active', salary: 800000, joinDate: '2023-03-20' },
      { id: '3', name: 'Mamadou Bah', role: 'Cuisinier', phone: '+224622000003', email: 'mamadou@kfm-delice.com', status: 'active', salary: 1500000, joinDate: '2023-02-10' },
      { id: '4', name: 'Aminata Touré', role: 'Caissière', phone: '+224622000004', email: 'aminata@kfm-delice.com', status: 'on_leave', salary: 900000, joinDate: '2023-04-05' },
      { id: '5', name: 'Ibrahima Koné', role: 'Chef', phone: '+224622000005', email: 'ibrahima@kfm-delice.com', status: 'active', salary: 2500000, joinDate: '2022-11-01' },
      { id: '6', name: 'Mariama Camara', role: 'Serveuse', phone: '+224622000006', email: 'mariama@kfm-delice.com', status: 'active', salary: 800000, joinDate: '2023-05-15' },
    ]);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalSalaries = staff.reduce((sum, s) => sum + s.salary, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personnel</h1>
          <p className="text-gray-500">Gérer les employés du restaurant (RH)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchStaff} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Actualiser
          </Button>
          <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvel employé
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un employé</DialogTitle>
                <DialogDescription>
                  Enregistrez un nouvel employé
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom complet</Label>
                    <Input 
                      placeholder="Nom de l'employé" 
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Poste</Label>
                    <Select
                      value={newStaff.role}
                      onValueChange={(v) => setNewStaff({ ...newStaff, role: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chef">Chef</SelectItem>
                        <SelectItem value="Cuisinier">Cuisinier</SelectItem>
                        <SelectItem value="Serveur">Serveur</SelectItem>
                        <SelectItem value="Serveuse">Serveuse</SelectItem>
                        <SelectItem value="Caissière">Caissière</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input 
                      placeholder="+224 ..." 
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email" 
                      placeholder="email@kfm-delice.com" 
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Salaire</Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={newStaff.salary}
                      onChange={(e) => setNewStaff({ ...newStaff, salary: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date d'embauche</Label>
                    <Input 
                      type="date" 
                      value={newStaff.joinDate}
                      onChange={(e) => setNewStaff({ ...newStaff, joinDate: e.target.value })}
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={() => {
                  if (!newStaff.name || !newStaff.phone) {
                    toast({
                      title: 'Erreur',
                      description: 'Le nom et le téléphone sont obligatoires.',
                      variant: 'destructive',
                    });
                    return;
                  }
                  // Create new staff member
                  const newStaffMember: StaffMember = {
                    id: `${Date.now()}`,
                    name: newStaff.name,
                    role: newStaff.role,
                    phone: newStaff.phone,
                    email: newStaff.email || '',
                    status: 'active',
                    salary: parseInt(newStaff.salary) || 0,
                    joinDate: newStaff.joinDate,
                  };
                  setStaff(prev => [newStaffMember, ...prev]);
                  toast({
                    title: 'Employé ajouté',
                    description: `L'employé "${newStaff.name}" a été ajouté avec succès.`,
                  });
                  setIsAddStaffOpen(false);
                  setNewStaff({ name: '', role: 'Cuisinier', phone: '', email: '', salary: '', joinDate: new Date().toISOString().split('T')[0] });
                }}>
                  Enregistrer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserCog className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{staff.length}</p>
                <p className="text-xs text-gray-500">Employés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {staff.filter((s) => s.status === 'active').length}
                </p>
                <p className="text-xs text-gray-500">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {staff.filter((s) => s.status === 'on_leave').length}
                </p>
                <p className="text-xs text-gray-500">En congé</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalSalaries)}</p>
                <p className="text-xs text-gray-500">Masse salariale/mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un employé..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Poste" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les postes</SelectItem>
            <SelectItem value="Chef">Chef</SelectItem>
            <SelectItem value="Cuisinier">Cuisinier</SelectItem>
            <SelectItem value="Serveur">Serveur</SelectItem>
            <SelectItem value="Serveuse">Serveuse</SelectItem>
            <SelectItem value="Caissière">Caissière</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error message */}
      {error && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-yellow-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Staff table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto" />
              <p className="mt-2 text-gray-500">Chargement...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Salaire</TableHead>
                  <TableHead>Date d'embauche</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Aucun employé trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {member.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={ROLE_CONFIG[member.role]?.color || 'bg-gray-100'}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">{member.phone}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(member.salary)}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {new Date(member.joinDate).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={STATUS_CONFIG[member.status].color}>
                          {STATUS_CONFIG[member.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setEditStaff(member);
                              setIsEditDialogOpen(true);
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedStaff(member);
                              setIsDetailsDialogOpen(true);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            {member.status === 'active' ? (
                              <DropdownMenuItem onClick={() => {
                                setStaff(prev => prev.map(s => s.id === member.id ? { ...s, status: 'on_leave' as const } : s));
                                toast({
                                  title: 'Statut modifié',
                                  description: `${member.name} est maintenant en congé.`,
                                });
                              }}>
                                <UserX className="h-4 w-4 mr-2" />
                                Mettre en congé
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => {
                                setStaff(prev => prev.map(s => s.id === member.id ? { ...s, status: 'active' as const } : s));
                                toast({
                                  title: 'Statut modifié',
                                  description: `${member.name} est maintenant actif.`,
                                });
                              }}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Réactiver
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'employé</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'employé
            </DialogDescription>
          </DialogHeader>
          {editStaff && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom complet</Label>
                  <Input 
                    value={editStaff.name}
                    onChange={(e) => setEditStaff({ ...editStaff, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Poste</Label>
                  <Select
                    value={editStaff.role}
                    onValueChange={(v) => setEditStaff({ ...editStaff, role: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Chef">Chef</SelectItem>
                      <SelectItem value="Cuisinier">Cuisinier</SelectItem>
                      <SelectItem value="Serveur">Serveur</SelectItem>
                      <SelectItem value="Serveuse">Serveuse</SelectItem>
                      <SelectItem value="Caissière">Caissière</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input 
                    value={editStaff.phone}
                    onChange={(e) => setEditStaff({ ...editStaff, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={editStaff.email}
                    onChange={(e) => setEditStaff({ ...editStaff, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Salaire</Label>
                  <Input 
                    type="number"
                    value={editStaff.salary}
                    onChange={(e) => setEditStaff({ ...editStaff, salary: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select
                    value={editStaff.status}
                    onValueChange={(v: 'active' | 'on_leave' | 'inactive') => setEditStaff({ ...editStaff, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="on_leave">En congé</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full" onClick={() => {
                if (editStaff) {
                  setStaff(prev => prev.map(s => s.id === editStaff.id ? editStaff : s));
                  toast({ title: 'Modifications enregistrées', description: `Les informations de ${editStaff.name} ont été mises à jour.` });
                }
                setIsEditDialogOpen(false);
              }}>
                Enregistrer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Staff Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de l'employé</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {selectedStaff.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedStaff.name}</h3>
                  <p className="text-gray-500">{selectedStaff.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{selectedStaff.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Téléphone</p>
                  <p className="font-medium">{selectedStaff.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Salaire</p>
                  <p className="font-medium">{formatCurrency(selectedStaff.salary)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date d'embauche</p>
                  <p className="font-medium">{new Date(selectedStaff.joinDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Statut</p>
                  <Badge variant="secondary" className={STATUS_CONFIG[selectedStaff.status].color}>
                    {STATUS_CONFIG[selectedStaff.status].label}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
