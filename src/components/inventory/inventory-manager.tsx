'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  History,
  BarChart3,
  Edit,
  Trash2,
  MoreHorizontal,
  Download,
  ShoppingCart,
  RefreshCw,
  MapPin,
  Calendar,
  Truck,
  FileText,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAuth } from '@/lib/api-client';
import { StockMovementModal } from './stock-movement-modal';
import { PurchaseOrderModal } from './purchase-order-modal';
import { useFormatCurrency } from '@/components/ui/currency-display';

// Types
interface InventoryItem {
  id: string;
  name: string;
  category: 'ingredients' | 'packaging' | 'beverages' | 'supplies';
  quantity: number;
  unit: string;
  minStock: number;
  cost: number;
  supplier?: string;
  expiryDate?: string;
  location?: string;
  lastRestocked?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
}

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousQty: number;
  newQty: number;
  reason: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

interface InventoryStats {
  totalValue: number;
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  inStockCount: number;
  categoryStats: Record<string, number>;
}

interface PurchaseOrder {
  id: string;
  supplierName: string;
  items: Array<{
    itemName: string;
    quantity: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  expectedDelivery?: string;
  createdAt: string;
}

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Status badge colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'in_stock':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'low_stock':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'out_of_stock':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'pending':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'ordered':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'received':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'cancelled':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'in_stock':
      return 'En stock';
    case 'low_stock':
      return 'Stock bas';
    case 'out_of_stock':
      return 'Rupture';
    case 'pending':
      return 'En attente';
    case 'ordered':
      return 'Commandée';
    case 'received':
      return 'Reçue';
    case 'cancelled':
      return 'Annulée';
    default:
      return status;
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'ingredients':
      return 'Ingrédients';
    case 'packaging':
      return 'Emballages';
    case 'beverages':
      return 'Boissons';
    case 'supplies':
      return 'Produits Ménagers';
    default:
      return category;
  }
};

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Toutes les catégories' },
  { value: 'ingredients', label: 'Ingrédients' },
  { value: 'packaging', label: 'Emballages' },
  { value: 'beverages', label: 'Boissons' },
  { value: 'supplies', label: 'Produits Ménagers' },
];

export function InventoryManager() {
  const { toast } = useToast();
  const { format: formatCurrency, currencyCode } = useFormatCurrency();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modals
  const [isStockMovementOpen, setIsStockMovementOpen] = useState(false);
  const [isPurchaseOrderOpen, setIsPurchaseOrderOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'ingredients' as InventoryItem['category'],
    quantity: '',
    unit: 'kg',
    minStock: '',
    cost: '',
    supplier: '',
    location: '',
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, movementsRes, ordersRes, statsRes] = await Promise.all([
        fetchWithAuth('/api/inventory'),
        fetchWithAuth('/api/inventory?action=movements'),
        fetchWithAuth('/api/inventory?action=purchase-orders'),
        fetchWithAuth('/api/inventory?action=stats'),
      ]);

      const itemsData = await itemsRes.json();
      const movementsData = await movementsRes.json();
      const ordersData = await ordersRes.json();
      const statsData = await statsRes.json();

      if (itemsData.success) setItems(itemsData.data.items);
      if (movementsData.success) setMovements(movementsData.data.movements);
      if (ordersData.success) setPurchaseOrders(ordersData.data.orders);
      if (statsData.success) setStats(statsData.data);
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

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesLowStock =
      !showLowStockOnly ||
      item.status === 'low_stock' ||
      item.status === 'out_of_stock';
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Nom',
      'Catégorie',
      'Quantité',
      'Unité',
      'Stock Min',
      `Prix Unitaire (${currencyCode})`,
      `Valeur Totale (${currencyCode})`,
      'Statut',
      'Fournisseur',
      'Emplacement',
    ];

    const rows = filteredItems.map((item) => [
      item.name,
      getCategoryLabel(item.category),
      item.quantity,
      item.unit,
      item.minStock,
      item.cost,
      item.quantity * item.cost,
      getStatusLabel(item.status),
      item.supplier || '',
      item.location || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventaire_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'Export réussi',
      description: 'Le fichier CSV a été téléchargé',
    });
  };

  // Handle add item
  const handleAddItem = async () => {
    if (
      !formData.name ||
      !formData.quantity ||
      !formData.minStock ||
      !formData.cost
    ) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetchWithAuth('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_item',
          name: formData.name,
          category: formData.category,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          minStock: parseFloat(formData.minStock),
          cost: parseFloat(formData.cost),
          supplier: formData.supplier,
          location: formData.location,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: 'Succès', description: 'Article ajouté avec succès' });
        setIsAddModalOpen(false);
        resetForm();
        fetchData();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible d'ajouter l'article",
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle edit item
  const handleEditItem = async () => {
    if (!selectedItem) return;

    setActionLoading(true);
    try {
      const response = await fetchWithAuth('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedItem.id,
          name: formData.name,
          category: formData.category,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          minStock: parseFloat(formData.minStock),
          cost: parseFloat(formData.cost),
          supplier: formData.supplier,
          location: formData.location,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: 'Succès', description: 'Article mis à jour' });
        setIsEditModalOpen(false);
        resetForm();
        fetchData();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible de mettre à jour l'article",
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    setActionLoading(true);
    try {
      const response = await fetchWithAuth(
        `/api/inventory?id=${selectedItem.id}`,
        { method: 'DELETE' }
      );

      const data = await response.json();
      if (data.success) {
        toast({ title: 'Succès', description: 'Article supprimé' });
        setIsDeleteDialogOpen(false);
        setSelectedItem(null);
        fetchData();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible de supprimer l'article",
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      category: 'ingredients',
      quantity: '',
      unit: 'kg',
      minStock: '',
      cost: '',
      supplier: '',
      location: '',
    });
    setSelectedItem(null);
  };

  // Open edit modal with item data
  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      minStock: item.minStock.toString(),
      cost: item.cost.toString(),
      supplier: item.supplier || '',
      location: item.location || '',
    });
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valeur totale</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats?.totalValue || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Articles</p>
                <p className="text-2xl font-bold">{stats?.totalItems || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock bas</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats?.lowStockCount || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rupture</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats?.outOfStockCount || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="inventory">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventaire</TabsTrigger>
            <TabsTrigger value="movements">Mouvements</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="alerts">Alertes</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exporter CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPurchaseOrderOpen(true)}
              className="gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Commander
            </Button>
            <Button
              size="sm"
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouvel article
            </Button>
          </div>
        </div>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un article..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant={showLowStockOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                  className="gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Stock bas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Stock Min</TableHead>
                      <TableHead className="text-right">Prix Unitaire</TableHead>
                      <TableHead className="text-right">Valeur</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead>Emplacement</TableHead>
                      <TableHead className="w-[60px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Aucun article trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div>
                              {item.name}
                              {item.lastRestocked && (
                                <p className="text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3 inline mr-1" />
                                  Restocké{' '}
                                  {new Date(
                                    item.lastRestocked
                                  ).toLocaleDateString('fr-FR')}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getCategoryLabel(item.category)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={
                                item.status === 'out_of_stock'
                                  ? 'text-red-600 font-medium'
                                  : ''
                              }
                            >
                              {item.quantity} {item.unit}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {item.minStock} {item.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.cost)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.quantity * item.cost)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item.status)}>
                              {getStatusLabel(item.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.supplier ? (
                              <span className="text-sm">{item.supplier}</span>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                -
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.location ? (
                              <span className="text-sm flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {item.location}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                -
                              </span>
                            )}
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
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setIsStockMovementOpen(true);
                                  }}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Mouvement
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openEditModal(item)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedItem(item);
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
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Historique des mouvements
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedItem(null);
                    setIsStockMovementOpen(true);
                  }}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Nouveau mouvement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Article</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Avant</TableHead>
                      <TableHead className="text-right">Après</TableHead>
                      <TableHead>Raison</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Par</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Aucun mouvement enregistré
                        </TableCell>
                      </TableRow>
                    ) : (
                      movements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell className="text-sm">
                            {formatDate(movement.createdAt)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {movement.itemName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {movement.type === 'in' ? (
                                <ArrowUpRight className="h-4 w-4 text-green-600" />
                              ) : movement.type === 'out' ? (
                                <ArrowDownRight className="h-4 w-4 text-red-600" />
                              ) : (
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                              )}
                              <span
                                className={
                                  movement.type === 'in'
                                    ? 'text-green-600'
                                    : movement.type === 'out'
                                    ? 'text-red-600'
                                    : 'text-blue-600'
                                }
                              >
                                {movement.type === 'in'
                                  ? 'Entrée'
                                  : movement.type === 'out'
                                  ? 'Sortie'
                                  : 'Ajustement'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {movement.quantity}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {movement.previousQty}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {movement.newQty}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{movement.reason}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {movement.notes || '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {movement.createdBy}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Orders Tab */}
        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Commandes d'achat
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setIsPurchaseOrderOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nouvelle commande
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {purchaseOrders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune commande enregistrée</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPurchaseOrderOpen(true)}
                      className="mt-4"
                    >
                      Créer une commande
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchaseOrders.map((order) => (
                      <Card key={order.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{order.supplierName}</p>
                                <Badge className={getStatusColor(order.status)}>
                                  {getStatusLabel(order.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">
                                {formatCurrency(order.totalAmount)}
                              </p>
                              {order.expectedDelivery && (
                                <p className="text-sm text-muted-foreground">
                                  Livraison prévue:{' '}
                                  {new Date(
                                    order.expectedDelivery
                                  ).toLocaleDateString('fr-FR')}
                                </p>
                              )}
                            </div>
                          </div>
                          <Separator className="my-3" />
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="text-sm flex justify-between"
                              >
                                <span className="text-muted-foreground">
                                  {item.itemName} x{item.quantity}
                                </span>
                                <span>{formatCurrency(item.totalPrice)}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Alertes stock
              </CardTitle>
              <CardDescription>
                Articles nécessitant une attention immédiate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items
                  .filter(
                    (i) => i.status === 'low_stock' || i.status === 'out_of_stock'
                  )
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            item.status === 'out_of_stock'
                              ? 'bg-red-100'
                              : 'bg-yellow-100'
                          }`}
                        >
                          <AlertTriangle
                            className={`h-5 w-5 ${
                              item.status === 'out_of_stock'
                                ? 'text-red-600'
                                : 'text-yellow-600'
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.status === 'out_of_stock'
                              ? 'Rupture de stock'
                              : `${item.quantity} ${item.unit} restant (seuil: ${item.minStock})`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsStockMovementOpen(true);
                          }}
                        >
                          Réapprovisionner
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setIsPurchaseOrderOpen(true)}
                        >
                          Commander
                        </Button>
                      </div>
                    </div>
                  ))}
                {items.filter(
                  (i) => i.status === 'low_stock' || i.status === 'out_of_stock'
                ).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune alerte - Tous les stocks sont OK</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stock Movement Modal */}
      <StockMovementModal
        open={isStockMovementOpen}
        onOpenChange={setIsStockMovementOpen}
        item={selectedItem}
        items={items}
        onSuccess={fetchData}
      />

      {/* Purchase Order Modal */}
      <PurchaseOrderModal
        open={isPurchaseOrderOpen}
        onOpenChange={setIsPurchaseOrderOpen}
        items={items}
        onSuccess={fetchData}
      />

      {/* Add Item Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un article</DialogTitle>
            <DialogDescription>
              Créez un nouvel article dans l'inventaire
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nom de l'article"
                />
              </div>
              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) =>
                    setFormData({ ...formData, category: v as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingredients">Ingrédients</SelectItem>
                    <SelectItem value="packaging">Emballages</SelectItem>
                    <SelectItem value="beverages">Boissons</SelectItem>
                    <SelectItem value="supplies">Produits Ménagers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Quantité *</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Unité *</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(v) =>
                    setFormData({ ...formData, unit: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="unités">unités</SelectItem>
                    <SelectItem value="bouteilles">bouteilles</SelectItem>
                    <SelectItem value="paquets">paquets</SelectItem>
                    <SelectItem value="régimes">régimes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stock Min *</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) =>
                    setFormData({ ...formData, minStock: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prix Unitaire (GNF) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Fournisseur</Label>
                <Input
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                  placeholder="Nom du fournisseur"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Emplacement</Label>
              <Input
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Ex: Entrepôt A, Réfrigérateur 1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddItem} disabled={actionLoading}>
              {actionLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier l'article</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'article
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) =>
                    setFormData({ ...formData, category: v as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingredients">Ingrédients</SelectItem>
                    <SelectItem value="packaging">Emballages</SelectItem>
                    <SelectItem value="beverages">Boissons</SelectItem>
                    <SelectItem value="supplies">Produits Ménagers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Quantité *</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Unité *</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(v) =>
                    setFormData({ ...formData, unit: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="unités">unités</SelectItem>
                    <SelectItem value="bouteilles">bouteilles</SelectItem>
                    <SelectItem value="paquets">paquets</SelectItem>
                    <SelectItem value="régimes">régimes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stock Min *</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) =>
                    setFormData({ ...formData, minStock: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prix Unitaire (GNF) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Fournisseur</Label>
                <Input
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Emplacement</Label>
              <Input
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditItem} disabled={actionLoading}>
              {actionLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{selectedItem?.name}" ? Cette
              action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteItem}
              disabled={actionLoading}
            >
              {actionLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InventoryManager;
