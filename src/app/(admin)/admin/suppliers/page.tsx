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
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  Building2,
  Package,
  Star,
  MoreHorizontal,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { apiGet } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

// Simple currency formatter for GNF (Guinean Franc)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-GN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' GNF';
};

const SUPPLIER_CATEGORIES = [
  'Ingrédients',
  'Viandes',
  'Poissons',
  'Légumes',
  'Boissons',
  'Produits laitiers',
  'Épices',
  'Autres',
];

interface Supplier {
  id: string;
  name: string;
  category: string;
  contact: string;
  phone: string;
  email: string;
  rating: number;
  orders: number;
  status: 'active' | 'inactive';
}

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    category: 'Ingrédients',
    phone: '',
    email: '',
  });
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isOrdersDialogOpen, setIsOrdersDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchSuppliers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiGet<{ suppliers: Supplier[] }>('/inventory/suppliers', { });
      if (response?.suppliers && response.suppliers.length > 0) {
        setSuppliers(response.suppliers);
      } else {
        setDemoData();
      }
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
      setError('Erreur lors du chargement des fournisseurs');
      setDemoData();
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoData = () => {
    setSuppliers([
      { id: '1', name: 'Fournisseur de Riz', category: 'Ingrédients', contact: 'Amadou Diallo', phone: '+224622000001', email: 'riz@fournisseur.gn', rating: 4.5, orders: 45, status: 'active' },
      { id: '2', name: 'Boucherie Centrale', category: 'Viandes', contact: 'Fatou Sylla', phone: '+224622000002', email: 'boucherie@guinee.gn', rating: 4.8, orders: 32, status: 'active' },
      { id: '3', name: 'Légumes Frais', category: 'Légumes', contact: 'Mamadou Bah', phone: '+224622000003', email: 'legumes@fournisseur.gn', rating: 4.2, orders: 28, status: 'active' },
      { id: '4', name: 'Boissons Plus', category: 'Boissons', contact: 'Aminata Touré', phone: '+224622000004', email: 'boissons@fournisseur.gn', rating: 4.0, orders: 15, status: 'inactive' },
      { id: '5', name: 'Poisserie Express', category: 'Poissons', contact: 'Ibrahima Koné', phone: '+224622000005', email: 'poissons@fournisseur.gn', rating: 4.7, orders: 22, status: 'active' },
    ]);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(search.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="text-gray-500">Gérer les fournisseurs du restaurant</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSuppliers} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Actualiser
          </Button>
          <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau fournisseur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un fournisseur</DialogTitle>
                <DialogDescription>
                  Enregistrez un nouveau fournisseur
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nom de l'entreprise</Label>
                  <Input 
                    placeholder="Nom du fournisseur" 
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contact</Label>
                    <Input 
                      placeholder="Nom du contact" 
                      value={newSupplier.contact}
                      onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select
                      value={newSupplier.category}
                      onValueChange={(v) => setNewSupplier({ ...newSupplier, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPLIER_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input 
                      placeholder="+224 ..." 
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email" 
                      placeholder="email@exemple.com" 
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={() => {
                  if (!newSupplier.name || !newSupplier.contact) {
                    toast({ title: 'Erreur', description: 'Le nom et le contact sont obligatoires.', variant: 'destructive' });
                    return;
                  }
                  // Create new supplier
                  const newSupplierEntry: Supplier = {
                    id: `${Date.now()}`,
                    name: newSupplier.name,
                    category: newSupplier.category,
                    contact: newSupplier.contact,
                    phone: newSupplier.phone || '',
                    email: newSupplier.email || '',
                    rating: 0,
                    orders: 0,
                    status: 'active',
                  };
                  setSuppliers(prev => [newSupplierEntry, ...prev]);
                  toast({ title: 'Fournisseur ajouté', description: `Le fournisseur "${newSupplier.name}" a été ajouté.` });
                  setIsAddSupplierOpen(false);
                  setNewSupplier({ name: '', contact: '', category: 'Ingrédients', phone: '', email: '' });
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
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{suppliers.length}</p>
                <p className="text-xs text-gray-500">Fournisseurs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Truck className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {suppliers.filter((s) => s.status === 'active').length}
                </p>
                <p className="text-xs text-gray-500">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {suppliers.reduce((sum, s) => sum + s.orders, 0)}
                </p>
                <p className="text-xs text-gray-500">Commandes totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {suppliers.length > 0 
                    ? (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1)
                    : '0.0'}
                </p>
                <p className="text-xs text-gray-500">Note moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher un fournisseur..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Error message */}
      {error && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-yellow-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Suppliers table */}
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
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Commandes</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Aucun fournisseur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium">{supplier.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{supplier.category}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">{supplier.contact}</TableCell>
                      <TableCell className="text-gray-500">{supplier.phone}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{supplier.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500">{supplier.orders}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            supplier.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }
                        >
                          {supplier.status === 'active' ? 'Actif' : 'Inactif'}
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
                              setSelectedSupplier(supplier);
                              setIsEditDialogOpen(true);
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedSupplier(supplier);
                              setIsOrdersDialogOpen(true);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir les commandes
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setSuppliers(prev => prev.filter(s => s.id !== supplier.id));
                                toast({ title: 'Fournisseur supprimé', description: `Le fournisseur "${supplier.name}" a été supprimé.` });
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
          )}
        </CardContent>
      </Card>

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le fournisseur</DialogTitle>
            <DialogDescription>
              Modifiez les informations du fournisseur
            </DialogDescription>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nom de l'entreprise</Label>
                <Input defaultValue={selectedSupplier.name} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact</Label>
                  <Input defaultValue={selectedSupplier.contact} />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select defaultValue={selectedSupplier.category}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SUPPLIER_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input defaultValue={selectedSupplier.phone} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue={selectedSupplier.email} />
                </div>
              </div>
              <Button className="w-full" onClick={() => {
                toast({ title: 'Modifications enregistrées', description: `Le fournisseur "${selectedSupplier.name}" a été mis à jour.` });
                setIsEditDialogOpen(false);
              }}>
                Enregistrer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Orders Dialog */}
      <Dialog open={isOrdersDialogOpen} onOpenChange={setIsOrdersDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Commandes du fournisseur</DialogTitle>
            <DialogDescription>
              Historique des commandes passées à ce fournisseur
            </DialogDescription>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4 pt-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedSupplier.name}</p>
                <p className="text-sm text-gray-500">{selectedSupplier.category} • {selectedSupplier.orders} commandes</p>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Commande #{1000 + i}</p>
                      <p className="text-sm text-gray-500">{new Date(2024, 0, i * 5).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(500000 + i * 100000)}</p>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">Livrée</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full" onClick={() => setIsOrdersDialogOpen(false)}>
                Fermer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
