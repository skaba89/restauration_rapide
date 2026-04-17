'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  UserPlus, 
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  Eye,
  Phone,
  Mail,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

// Types
interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  role: string;
  roleLabel: string;
  hourlyRate: number;
  salary?: number | null;
  hireDate: Date | string;
  status: 'active' | 'on_leave' | 'inactive';
  avatar?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
}

// Role configuration
const ROLES = [
  { value: 'manager', label: 'Directeur', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'chef', label: 'Chef Cuisinier', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'cook', label: 'Cuisinier', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'waiter', label: 'Serveur/Serveuse', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'cashier', label: 'Caissier(ère)', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'delivery_driver', label: 'Livreur', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'cleaner', label: 'Agent d\'entretien', color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

const STATUS_CONFIG = {
  active: { label: 'Actif', color: 'bg-green-100 text-green-700' },
  on_leave: { label: 'En congé', color: 'bg-yellow-100 text-yellow-700' },
  inactive: { label: 'Inactif', color: 'bg-gray-100 text-gray-700' },
};

// Format GNF currency
const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} GNF`;

// Get initials
const getInitials = (firstName: string, lastName: string) => 
  `${firstName[0]}${lastName[0]}`.toUpperCase();

// Get role config
const getRoleConfig = (role: string) => ROLES.find(r => r.value === role) || ROLES[ROLES.length - 1];

interface StaffManagerProps {
  onScheduleView?: (staffId: string) => void;
  onTimeEntriesView?: (staffId: string) => void;
}

export function StaffManager({ onScheduleView, onTimeEntriesView }: StaffManagerProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    role: 'waiter',
    hourlyRate: 5000,
    salary: 1500000,
    hireDate: new Date().toISOString().split('T')[0],
    address: '',
    emergencyContact: '',
  });

  // Stats
  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.status === 'active').length;
  const onLeaveStaff = staff.filter(s => s.status === 'on_leave').length;

  // Filter staff
  const filteredStaff = staff.filter(s => {
    const matchesSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.phone.includes(searchTerm) ||
                          s.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || s.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      role: 'waiter',
      hourlyRate: 5000,
      salary: 1500000,
      hireDate: new Date().toISOString().split('T')[0],
      address: '',
      emergencyContact: '',
    });
  };

  // Handle add staff
  const handleAddStaff = () => {
    const roleConfig = getRoleConfig(formData.role);
    const newStaff: StaffMember = {
      id: `${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email || null,
      role: formData.role,
      roleLabel: roleConfig.label,
      hourlyRate: formData.hourlyRate,
      salary: formData.salary || null,
      hireDate: new Date(formData.hireDate),
      status: 'active',
      address: formData.address || null,
      emergencyContact: formData.emergencyContact || null,
    };
    setStaff([...staff, newStaff]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  // Handle edit staff
  const handleEditStaff = () => {
    if (!selectedStaff) return;
    const roleConfig = getRoleConfig(formData.role);
    const updatedStaff = staff.map(s => 
      s.id === selectedStaff.id 
        ? {
            ...s,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            email: formData.email || null,
            role: formData.role,
            roleLabel: roleConfig.label,
            hourlyRate: formData.hourlyRate,
            salary: formData.salary || null,
            hireDate: new Date(formData.hireDate),
            address: formData.address || null,
            emergencyContact: formData.emergencyContact || null,
          }
        : s
    );
    setStaff(updatedStaff);
    setIsEditDialogOpen(false);
    resetForm();
    setSelectedStaff(null);
  };

  // Handle delete staff
  const handleDeleteStaff = () => {
    if (!selectedStaff) return;
    setStaff(staff.filter(s => s.id !== selectedStaff.id));
    setIsDeleteDialogOpen(false);
    setSelectedStaff(null);
  };

  // Open edit dialog with staff data
  const openEditDialog = (member: StaffMember) => {
    setSelectedStaff(member);
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone,
      email: member.email || '',
      role: member.role,
      hourlyRate: member.hourlyRate,
      salary: member.salary || 0,
      hireDate: typeof member.hireDate === 'string' ? member.hireDate.split('T')[0] : new Date(member.hireDate).toISOString().split('T')[0],
      address: member.address || '',
      emergencyContact: member.emergencyContact || '',
    });
    setIsEditDialogOpen(true);
  };

  // Open view dialog
  const openViewDialog = (member: StaffMember) => {
    setSelectedStaff(member);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Personnel total</p>
                <p className="text-2xl font-bold">{totalStaff}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actifs</p>
                <p className="text-2xl font-bold text-green-600">{activeStaff}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En congé</p>
                <p className="text-2xl font-bold text-yellow-600">{onLeaveStaff}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff List Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Liste du Personnel</CardTitle>
              <CardDescription>{filteredStaff.length} employé(s)</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={resetForm}>
                  <UserPlus className="h-4 w-4" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Ajouter un employé</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations du nouvel employé
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input id="firstName" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input id="lastName" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+224 XX XXX XX XX" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle *</Label>
                    <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map(r => (
                          <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Taux horaire (GNF) *</Label>
                      <Input id="hourlyRate" type="number" value={formData.hourlyRate} onChange={e => setFormData({...formData, hourlyRate: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary">Salaire mensuel (GNF)</Label>
                      <Input id="salary" type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: parseInt(e.target.value) || 0})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hireDate">Date d'embauche</Label>
                    <Input id="hireDate" type="date" value={formData.hireDate} onChange={e => setFormData({...formData, hireDate: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input id="address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Contact d'urgence</Label>
                    <Input id="emergencyContact" value={formData.emergencyContact} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} placeholder="Nom - Téléphone" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                  <Button onClick={handleAddStaff} disabled={!formData.firstName || !formData.lastName || !formData.phone}>
                    Ajouter
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                {ROLES.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="on_leave">En congé</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Taux horaire</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map(member => {
                  const roleConfig = getRoleConfig(member.role);
                  const statusConfig = STATUS_CONFIG[member.status];
                  
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-orange-100 text-orange-700">{getInitials(member.firstName, member.lastName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.firstName} {member.lastName}</p>
                            <p className="text-sm text-muted-foreground">
                              Depuis {typeof member.hireDate === 'string' 
                                ? new Date(member.hireDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                                : member.hireDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleConfig.color}>{member.roleLabel}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{member.phone}</p>
                        {member.email && <p className="text-sm text-muted-foreground">{member.email}</p>}
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-medium">{formatCurrency(member.hourlyRate)}/h</p>
                        {member.salary && <p className="text-sm text-muted-foreground">{formatCurrency(member.salary)}/mois</p>}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openViewDialog(member)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(member)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            {onScheduleView && (
                              <DropdownMenuItem onClick={() => onScheduleView(member.id)}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Voir planning
                              </DropdownMenuItem>
                            )}
                            {onTimeEntriesView && (
                              <DropdownMenuItem onClick={() => onTimeEntriesView(member.id)}>
                                <Clock className="h-4 w-4 mr-2" />
                                Pointages
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setSelectedStaff(member);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détails de l'employé</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl bg-orange-100 text-orange-700">
                    {getInitials(selectedStaff.firstName, selectedStaff.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedStaff.firstName} {selectedStaff.lastName}</h3>
                  <Badge variant="outline" className={getRoleConfig(selectedStaff.role).color}>
                    {selectedStaff.roleLabel}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedStaff.phone}</span>
                </div>
                {selectedStaff.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedStaff.email}</span>
                  </div>
                )}
                {selectedStaff.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedStaff.address}</span>
                  </div>
                )}
                {selectedStaff.emergencyContact && (
                  <div className="flex items-center gap-3 text-sm">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedStaff.emergencyContact}</span>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taux horaire</span>
                  <span className="font-medium">{formatCurrency(selectedStaff.hourlyRate)}</span>
                </div>
                {selectedStaff.salary && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Salaire mensuel</span>
                    <span className="font-medium">{formatCurrency(selectedStaff.salary)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date d'embauche</span>
                  <span className="font-medium">
                    {typeof selectedStaff.hireDate === 'string' 
                      ? new Date(selectedStaff.hireDate).toLocaleDateString('fr-FR')
                      : selectedStaff.hireDate.toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Statut</span>
                  <Badge className={STATUS_CONFIG[selectedStaff.status].color}>
                    {STATUS_CONFIG[selectedStaff.status].label}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'employé</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">Prénom *</Label>
                <Input id="edit-firstName" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Nom *</Label>
                <Input id="edit-lastName" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Téléphone *</Label>
              <Input id="edit-phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rôle *</Label>
              <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-hourlyRate">Taux horaire (GNF) *</Label>
                <Input id="edit-hourlyRate" type="number" value={formData.hourlyRate} onChange={e => setFormData({...formData, hourlyRate: parseInt(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-salary">Salaire mensuel (GNF)</Label>
                <Input id="edit-salary" type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Adresse</Label>
              <Input id="edit-address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emergencyContact">Contact d'urgence</Label>
              <Input id="edit-emergencyContact" value={formData.emergencyContact} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleEditStaff}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedStaff?.firstName} {selectedStaff?.lastName} ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteStaff}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StaffManager;