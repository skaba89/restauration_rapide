'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Truck,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Star,
  Package,
  FileText,
  Loader2,
  Building2,
  User,
  Calendar,
  DollarSign,
  Eye,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types
interface Supplier {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  paymentTerms: string | null;
  deliveryDays: string | null;
  isActive: boolean;
  rating: number;
  itemCount: number;
  totalOrders: number;
  createdAt: string;
  updatedAt?: string;
}

interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  totalOrders: number;
  totalItems: number;
}

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Payment terms options
const PAYMENT_TERMS_OPTIONS = [
  { value: 'cash', label: 'Paiement à la livraison' },
  { value: 'net15', label: 'Net 15 jours' },
  { value: 'net30', label: 'Net 30 jours' },
  { value: 'net60', label: 'Net 60 jours' },
  { value: 'custom', label: 'Personnalisé' },
];

// Delivery days options
const DELIVERY_DAYS_OPTIONS = [
  { value: 'daily', label: 'Quotidien' },
  { value: 'mon-wed-fri', label: 'Lundi, Mercredi, Vendredi' },
  { value: 'tue-thu-sat', label: 'Mardi, Jeudi, Samedi' },
  { value: 'mon-fri', label: 'Lundi à Vendredi' },
  { value: 'on-demand', label: 'Sur commande' },
];

export default function SuppliersPage() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<SupplierStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    paymentTerms: 'cash',
    deliveryDays: 'on-demand',
    notes: '',
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const suppliersRes = await fetch('/api/inventory/suppliers?demo=true');
      const suppliersData = await suppliersRes.json();

      if (suppliersData.success) {
        setSuppliers(suppliersData.data.suppliers);
        // Calculate stats
        const activeSuppliers = suppliersData.data.suppliers.filter((s: Supplier) => s.isActive).length;
        const totalOrders = suppliersData.data.suppliers.reduce((acc: number, s: Supplier) => acc + s.totalOrders, 0);
        const totalItems = suppliersData.data.suppliers.reduce((acc: number, s: Supplier) => acc + s.itemCount, 0);
        setStats({
          totalSuppliers: suppliersData.data.suppliers.length,
          activeSuppliers,
          totalOrders,
          totalItems,
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter suppliers
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.includes(searchTerm) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && supplier.isActive) ||
      (statusFilter === 'inactive' && !supplier.isActive);
    return matchesSearch && matchesStatus;
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      paymentTerms: 'cash',
      deliveryDays: 'on-demand',
      notes: '',
    });
    setSelectedSupplier(null);
  };

  // Handle add supplier
  const handleAddSupplier = async () => {
    if (!formData.name || !formData.phone) {
      toast({
        title: 'Erreur',
        description: 'Le nom et le téléphone sont obligatoires',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/inventory/suppliers?demo=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: 'Succès', description: 'Fournisseur ajouté avec succès' });
        setIsAddModalOpen(false);
        resetForm();
        fetchData();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible d'ajouter le fournisseur",
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle edit supplier
  const handleEditSupplier = async () => {
    if (!selectedSupplier) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/inventory/suppliers?demo=true', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedSupplier.id,
          ...formData,
          isActive: selectedSupplier.isActive,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: 'Succès', description: 'Fournisseur mis à jour' });
        setIsEditModalOpen(false);
        resetForm();
        fetchData();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le fournisseur',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete supplier
  const handleDeleteSupplier = async () => {
    if (!selectedSupplier) return;

    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/inventory/suppliers?demo=true&id=${selectedSupplier.id}`,
        { method: 'DELETE' }
      );

      const data = await response.json();
      if (data.success) {
        toast({ title: 'Succès', description: 'Fournisseur supprimé' });
        setIsDeleteDialogOpen(false);
        setSelectedSupplier(null);
        fetchData();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le fournisseur',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (supplier: Supplier) => {
    try {
      const response = await fetch('/api/inventory/suppliers?demo=true', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: supplier.id,
          isActive: !supplier.isActive,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Succès',
          description: `Fournisseur ${!supplier.isActive ? 'activé' : 'désactivé'}`,
        });
        fetchData();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut',
        variant: 'destructive',
      });
    }
  };

  // Open edit modal
  const openEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactName: supplier.contactName || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      paymentTerms: supplier.paymentTerms || 'cash',
      deliveryDays: supplier.deliveryDays || 'on-demand',
      notes: '',
    });
    setIsEditModalOpen(true);
  };

  // Open view modal
  const openViewModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsViewModalOpen(true);
  };

  // Render star rating
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Get payment terms label
  const getPaymentTermsLabel = (value: string | null) => {
    if (!value) return '-';
    const option = PAYMENT_TERMS_OPTIONS.find((opt) => opt.value === value);
    return option?.label || value;
  };

  // Get delivery days label
  const getDeliveryDaysLabel = (value: string | null) => {
    if (!value) return '-';
    const option = DELIVERY_DAYS_OPTIONS.find((opt) => opt.value === value);
    return option?.label || value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <Truck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Gestion des Fournisseurs</h1>
              <p className="text-muted-foreground">
                Gérez vos fournisseurs et leurs commandes
              </p>
            </div>
          </div>
        </div>
        <Button
          className="bg-gradient-to-r from-orange-500 to-red-600"
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Fournisseur
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Fournisseurs</p>
                <p className="text-2xl font-bold">{stats?.totalSuppliers || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fournisseurs Actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats?.activeSuppliers || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Commandes</p>
                <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Articles Fournis</p>
                <p className="text-2xl font-bold">{stats?.totalItems || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un fournisseur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as any)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Livraison</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Commandes</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[60px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Aucun fournisseur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                            {supplier.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {supplier.itemCount} articles
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {supplier.contactName && (
                            <p className="text-sm flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {supplier.contactName}
                            </p>
                          )}
                          {supplier.phone && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {supplier.phone}
                            </p>
                          )}
                          {supplier.email && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {supplier.email}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getPaymentTermsLabel(supplier.paymentTerms)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{getDeliveryDaysLabel(supplier.deliveryDays)}</p>
                      </TableCell>
                      <TableCell>{renderRating(supplier.rating)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{supplier.totalOrders}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            supplier.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }
                        >
                          {supplier.isActive ? 'Actif' : 'Inactif'}
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
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openViewModal(supplier)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditModal(supplier)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(supplier)}>
                              {supplier.isActive ? (
                                <>
                                  <span className="h-4 w-4 mr-2">⊘</span>
                                  Désactiver
                                </>
                              ) : (
                                <>
                                  <span className="h-4 w-4 mr-2">✓</span>
                                  Activer
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedSupplier(supplier);
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
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Supplier Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nouveau Fournisseur</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau fournisseur à votre répertoire
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom de l&apos;entreprise *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Marché Central"
                />
              </div>
              <div className="space-y-2">
                <Label>Personne de contact</Label>
                <Input
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="Ex: Mamadou Diallo"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Téléphone *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+224 620 00 00 00"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@fournisseur.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ex: Marché Central, Conakry"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Conditions de paiement</Label>
                <Select
                  value={formData.paymentTerms}
                  onValueChange={(v) => setFormData({ ...formData, paymentTerms: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TERMS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Jours de livraison</Label>
                <Select
                  value={formData.deliveryDays}
                  onValueChange={(v) => setFormData({ ...formData, deliveryDays: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERY_DAYS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes supplémentaires sur ce fournisseur..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Annuler
            </Button>
            <Button
              className="bg-gradient-to-r from-orange-500 to-red-600"
              onClick={handleAddSupplier}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le Fournisseur</DialogTitle>
            <DialogDescription>
              Modifiez les informations du fournisseur
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom de l&apos;entreprise *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Personne de contact</Label>
                <Input
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Téléphone *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Conditions de paiement</Label>
                <Select
                  value={formData.paymentTerms}
                  onValueChange={(v) => setFormData({ ...formData, paymentTerms: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TERMS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Jours de livraison</Label>
                <Select
                  value={formData.deliveryDays}
                  onValueChange={(v) => setFormData({ ...formData, deliveryDays: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERY_DAYS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Annuler
            </Button>
            <Button
              className="bg-gradient-to-r from-orange-500 to-red-600"
              onClick={handleEditSupplier}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Edit className="h-4 w-4 mr-2" />
              )}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Supplier Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails du Fournisseur</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedSupplier.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedSupplier.name}</h3>
                  <Badge
                    className={
                      selectedSupplier.isActive
                        ? 'bg-green-100 text-green-700 mt-1'
                        : 'bg-gray-100 text-gray-700 mt-1'
                    }
                  >
                    {selectedSupplier.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Personne de contact</p>
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {selectedSupplier.contactName || '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {selectedSupplier.phone || '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {selectedSupplier.email || '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedSupplier.address || '-'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Conditions de paiement</p>
                  <Badge variant="outline">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {getPaymentTermsLabel(selectedSupplier.paymentTerms)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Jours de livraison</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {getDeliveryDaysLabel(selectedSupplier.deliveryDays)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-2xl font-bold">{selectedSupplier.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Commandes</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-2xl font-bold">{selectedSupplier.itemCount}</p>
                  <p className="text-xs text-muted-foreground">Articles</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-2xl font-bold">{selectedSupplier.rating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Note</p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Fournisseur depuis le {formatDate(selectedSupplier.createdAt)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Fermer
            </Button>
            <Button
              className="bg-gradient-to-r from-orange-500 to-red-600"
              onClick={() => {
                setIsViewModalOpen(false);
                openEditModal(selectedSupplier!);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le Fournisseur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedSupplier?.name} ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSupplier}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
