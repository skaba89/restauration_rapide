'use client';

// ============================================
// Restaurant OS - Admin Inventory Management
// Gestion des stocks et inventaire
// ============================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Box,
  Barcode,
  RefreshCw,
  History,
  DollarSign,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  costPerUnit: number;
  totalValue: number;
  status: string;
  lastRestocked: string;
  supplier?: string;
}

interface StockMovement {
  id: string;
  item: { name: string };
  type: string;
  quantity: number;
  reason: string;
  date: string;
  user: string;
}

const statusColors: Record<string, string> = {
  IN_STOCK: 'bg-green-100 text-green-700',
  LOW_STOCK: 'bg-yellow-100 text-yellow-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-700',
  OVERSTOCKED: 'bg-blue-100 text-blue-700',
};

const formatCurrency = (amount: number) => `${amount?.toLocaleString('fr-FR') || 0} FCFA`;
const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR');

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    category: 'INGREDIENTS',
    quantity: '',
    unit: 'kg',
    minStock: '',
    maxStock: '',
    costPerUnit: '',
    supplier: '',
  });

  const fetchInventory = async () => {
    try {
      const [itemsRes, movementsRes] = await Promise.all([
        fetch('/api/admin/inventory'),
        fetch('/api/admin/inventory/movements'),
      ]);
      
      if (itemsRes.ok) {
        const data = await itemsRes.json();
        setItems(data.data || []);
      }
      if (movementsRes.ok) {
        const data = await movementsRes.json();
        setMovements(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        await fetchInventory();
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleAddItem = async () => {
    if (!newItem.name) {
      alert('Le nom est requis');
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newItem,
          quantity: parseFloat(newItem.quantity) || 0,
          minStock: parseFloat(newItem.minStock) || 0,
          maxStock: parseFloat(newItem.maxStock) || 100,
          costPerUnit: parseFloat(newItem.costPerUnit) || 0,
          organizationId: 'demo-org-1',
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setItems([data.data || data, ...items]);
        setShowAddDialog(false);
        setNewItem({
          name: '',
          sku: '',
          category: 'INGREDIENTS',
          quantity: '',
          unit: 'kg',
          minStock: '',
          maxStock: '',
          costPerUnit: '',
          supplier: '',
        });
      } else {
        alert('Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = search === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    totalItems: items.length,
    inStock: items.filter(i => i.status === 'IN_STOCK').length,
    lowStock: items.filter(i => i.status === 'LOW_STOCK').length,
    outOfStock: items.filter(i => i.status === 'OUT_OF_STOCK').length,
    totalValue: items.reduce((sum, i) => sum + i.totalValue, 0),
  };

  const getStockPercentage = (item: InventoryItem) => {
    return Math.min(100, (item.quantity / item.maxStock) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Stocks</h1>
          <p className="text-muted-foreground">Inventaire et mouvements de stock</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel article
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
                <p className="text-xs text-muted-foreground">Articles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Box className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inStock}</p>
                <p className="text-xs text-muted-foreground">En stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.lowStock}</p>
                <p className="text-xs text-muted-foreground">Stock bas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.outOfStock}</p>
                <p className="text-xs text-muted-foreground">Rupture</p>
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
                <p className="text-lg font-bold">{formatCurrency(stats.totalValue)}</p>
                <p className="text-xs text-muted-foreground">Valeur totale</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory" className="gap-2">
            <Package className="h-4 w-4" />
            Inventaire
          </TabsTrigger>
          <TabsTrigger value="movements" className="gap-2">
            <History className="h-4 w-4" />
            Mouvements
          </TabsTrigger>
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom ou SKU..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes catégories</SelectItem>
                    <SelectItem value="INGREDIENTS">Ingrédients</SelectItem>
                    <SelectItem value="PROTEINS">Protéines</SelectItem>
                    <SelectItem value="VEGETABLES">Légumes</SelectItem>
                    <SelectItem value="BEVERAGES">Boissons</SelectItem>
                    <SelectItem value="SUPPLIES">Fournitures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Article</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Prix unitaire</TableHead>
                        <TableHead>Valeur totale</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.category}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Barcode className="h-3 w-3 text-muted-foreground" />
                              <code className="text-xs">{item.sku}</code>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.quantity} {item.unit}</p>
                              <p className="text-xs text-muted-foreground">Min: {item.minStock} / Max: {item.maxStock}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="w-24">
                              <Progress value={getStockPercentage(item)} className="h-2" />
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(item.costPerUnit)}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(item.totalValue)}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[item.status]}>
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Raison</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((move) => (
                      <TableRow key={move.id}>
                        <TableCell className="font-medium">{move.item.name}</TableCell>
                        <TableCell>
                          <Badge variant={move.type === 'IN' ? 'default' : 'destructive'}
                            className={move.type === 'IN' ? 'bg-green-100 text-green-700' : ''}>
                            {move.type === 'IN' ? 'Entrée' : 'Sortie'}
                          </Badge>
                        </TableCell>
                        <TableCell>{move.type === 'IN' ? '+' : '-'}{move.quantity}</TableCell>
                        <TableCell>{move.reason}</TableCell>
                        <TableCell>{move.user}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(move.date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel article</DialogTitle>
            <DialogDescription>Ajouter un article à l'inventaire</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input 
                  placeholder="Nom de l'article" 
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input 
                  placeholder="ABC-001" 
                  value={newItem.sku}
                  onChange={(e) => setNewItem({...newItem, sku: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={newItem.category} onValueChange={(v) => setNewItem({...newItem, category: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INGREDIENTS">Ingrédients</SelectItem>
                    <SelectItem value="PROTEINS">Protéines</SelectItem>
                    <SelectItem value="VEGETABLES">Légumes</SelectItem>
                    <SelectItem value="BEVERAGES">Boissons</SelectItem>
                    <SelectItem value="SUPPLIES">Fournitures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unité</Label>
                <Select value={newItem.unit} onValueChange={(v) => setNewItem({...newItem, unit: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogrammes (kg)</SelectItem>
                    <SelectItem value="L">Litres (L)</SelectItem>
                    <SelectItem value="pièces">Pièces</SelectItem>
                    <SelectItem value="bouteilles">Bouteilles</SelectItem>
                    <SelectItem value="sachets">Sachets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Quantité initiale</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Stock min</Label>
                <Input 
                  type="number" 
                  placeholder="10" 
                  value={newItem.minStock}
                  onChange={(e) => setNewItem({...newItem, minStock: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Stock max</Label>
                <Input 
                  type="number" 
                  placeholder="100" 
                  value={newItem.maxStock}
                  onChange={(e) => setNewItem({...newItem, maxStock: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prix unitaire (FCFA)</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={newItem.costPerUnit}
                  onChange={(e) => setNewItem({...newItem, costPerUnit: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Fournisseur</Label>
                <Input 
                  placeholder="Nom du fournisseur" 
                  value={newItem.supplier}
                  onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
            <Button onClick={handleAddItem} disabled={saving}>
              {saving ? 'Création...' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
