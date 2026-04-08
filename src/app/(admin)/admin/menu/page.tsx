'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { UtensilsCrossed, Plus, Search, Edit, Trash2, Eye, EyeOff, RefreshCw, Save, X } from 'lucide-react';

// Simple currency formatter for GNF (Guinean Franc)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-GN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' GNF';
};

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  costPrice: number;
  isAvailable: boolean;
  preparationTime: number;
  image?: string;
  allergens: string[];
}

const DEMO_MENU_ITEMS: MenuItem[] = [
  { id: '1', name: 'Poulet Grillé', description: 'Poulet grillé mariné aux épices', category: 'Plats', price: 25000, costPrice: 15000, isAvailable: true, preparationTime: 25, allergens: [] },
  { id: '2', name: 'Poisson Braisé', description: 'Poisson frais braisé avec sauce', category: 'Plats', price: 30000, costPrice: 18000, isAvailable: true, preparationTime: 20, allergens: ['Poisson'] },
  { id: '3', name: 'Riz Sauce', description: 'Riz accompagné de sauce tomate', category: 'Plats', price: 15000, costPrice: 8000, isAvailable: true, preparationTime: 15, allergens: [] },
  { id: '4', name: 'Attieké Poisson', description: 'Attieké avec poisson grillé', category: 'Plats', price: 20000, costPrice: 12000, isAvailable: false, preparationTime: 20, allergens: ['Poisson'] },
  { id: '5', name: 'Riz Gras', description: 'Riz gras traditionnel', category: 'Plats', price: 18000, costPrice: 10000, isAvailable: true, preparationTime: 30, allergens: [] },
  { id: '6', name: 'Coca-Cola', description: 'Boisson gazeuse', category: 'Boissons', price: 2000, costPrice: 1000, isAvailable: true, preparationTime: 1, allergens: [] },
  { id: '7', name: 'Jus de Bissap', description: 'Jus naturel de bissap', category: 'Boissons', price: 3000, costPrice: 1500, isAvailable: true, preparationTime: 2, allergens: [] },
  { id: '8', name: 'Frites', description: 'Pommes de terre frites', category: 'Accompagnements', price: 5000, costPrice: 2500, isAvailable: true, preparationTime: 10, allergens: [] },
];

const CATEGORIES = ['Plats', 'Boissons', 'Accompagnements', 'Desserts', 'Entrées'];
const ALLERGENS = ['Gluten', 'Poisson', 'Arachides', 'Lait', 'Œufs', 'Soja', 'Fruits de mer'];

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEMO_MENU_ITEMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialogs
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Form state
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Plats',
    price: '',
    costPrice: '',
    preparationTime: '',
    isAvailable: true,
    allergens: [] as string[],
  });

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Plats',
      price: '',
      costPrice: '',
      preparationTime: '',
      isAvailable: true,
      allergens: [],
    });
    setEditingItem(null);
  };

  const openAddDialog = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price.toString(),
      costPrice: item.costPrice.toString(),
      preparationTime: item.preparationTime.toString(),
      isAvailable: item.isAvailable,
      allergens: item.allergens,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (item: MenuItem) => {
    setEditingItem(item);
    setShowDeleteDialog(true);
  };

  const handleAddItem = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newItem: MenuItem = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        costPrice: parseFloat(formData.costPrice) || 0,
        preparationTime: parseInt(formData.preparationTime) || 15,
        isAvailable: formData.isAvailable,
        allergens: formData.allergens,
      };
      setMenuItems(prev => [...prev, newItem]);
      setShowAddDialog(false);
      resetForm();
      setIsLoading(false);
    }, 500);
  };

  const handleEditItem = () => {
    if (!editingItem) return;
    setIsLoading(true);
    setTimeout(() => {
      setMenuItems(prev => prev.map(item => 
        item.id === editingItem.id
          ? {
              ...item,
              name: formData.name,
              description: formData.description,
              category: formData.category,
              price: parseFloat(formData.price) || 0,
              costPrice: parseFloat(formData.costPrice) || 0,
              preparationTime: parseInt(formData.preparationTime) || 15,
              isAvailable: formData.isAvailable,
              allergens: formData.allergens,
            }
          : item
      ));
      setShowEditDialog(false);
      resetForm();
      setIsLoading(false);
    }, 500);
  };

  const handleDeleteItem = () => {
    if (!editingItem) return;
    setIsLoading(true);
    setTimeout(() => {
      setMenuItems(prev => prev.filter(item => item.id !== editingItem.id));
      setShowDeleteDialog(false);
      resetForm();
      setIsLoading(false);
    }, 500);
  };

  const toggleAvailability = (item: MenuItem) => {
    setMenuItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i
    ));
  };

  const toggleAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen],
    }));
  };

  const stats = {
    total: menuItems.length,
    available: menuItems.filter(i => i.isAvailable).length,
    unavailable: menuItems.filter(i => !i.isAvailable).length,
    avgPrice: menuItems.length > 0 
      ? Math.round(menuItems.reduce((sum, i) => sum + i.price, 0) / menuItems.length)
      : 0,
  };

  // Item Form Component
  const ItemForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nom de l'article"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Catégorie *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Description de l'article"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Prix de vente (GNF) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="costPrice">Prix de revient (GNF)</Label>
          <Input
            id="costPrice"
            type="number"
            value={formData.costPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, costPrice: e.target.value }))}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preparationTime">Temps de préparation (min)</Label>
          <Input
            id="preparationTime"
            type="number"
            value={formData.preparationTime}
            onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: e.target.value }))}
            placeholder="15"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Allergènes</Label>
        <div className="flex flex-wrap gap-2">
          {ALLERGENS.map(allergen => (
            <Badge
              key={allergen}
              variant={formData.allergens.includes(allergen) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleAllergen(allergen)}
            >
              {allergen}
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isAvailable"
          checked={formData.isAvailable}
          onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
          className="h-4 w-4"
        />
        <Label htmlFor="isAvailable">Article disponible à la vente</Label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion du Menu</h1>
          <p className="text-gray-500">Gérer les articles du menu</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel article
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-500">Total articles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              <p className="text-sm text-gray-500">Disponibles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.unavailable}</p>
              <p className="text-sm text-gray-500">Indisponibles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.avgPrice)}</p>
              <p className="text-sm text-gray-500">Prix moyen</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un article..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'Tous' : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Menu Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Marge</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Aucun article trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const margin = item.price - item.costPrice;
                  const marginPercent = item.costPrice > 0 ? Math.round((margin / item.costPrice) * 100) : 0;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500 max-w-xs truncate">{item.description}</p>
                          {item.allergens.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {item.allergens.map(a => (
                                <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{formatCurrency(item.price)}</p>
                        <p className="text-xs text-gray-500">Coût: {formatCurrency(item.costPrice)}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-green-600">{formatCurrency(margin)}</p>
                        <p className="text-xs text-gray-500">({marginPercent}%)</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.isAvailable ? 'default' : 'secondary'}
                          className={item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                        >
                          {item.isAvailable ? 'Disponible' : 'Indisponible'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleAvailability(item)}
                            title={item.isAvailable ? 'Rendre indisponible' : 'Rendre disponible'}
                          >
                            {item.isAvailable ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(item)} className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter un article</DialogTitle>
            <DialogDescription>Créez un nouvel article du menu</DialogDescription>
          </DialogHeader>
          <ItemForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleAddItem} disabled={!formData.name || !formData.price || isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier l'article</DialogTitle>
            <DialogDescription>Modifiez les informations de "{editingItem?.name}"</DialogDescription>
          </DialogHeader>
          <ItemForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleEditItem} disabled={!formData.name || !formData.price || isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'article</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{editingItem?.name}" ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
