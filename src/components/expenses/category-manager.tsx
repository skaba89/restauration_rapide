'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Palette,
  GripVertical,
  CheckCircle,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  type: string;
  budget: number | null;
  color: string;
  icon: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

const CATEGORY_TYPES = [
  { value: 'supplies', label: 'Fournitures' },
  { value: 'utilities', label: 'Factures' },
  { value: 'rent', label: 'Loyer' },
  { value: 'salaries', label: 'Salaires' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'other', label: 'Autres' },
];

const COLOR_OPTIONS = [
  { value: '#3B82F6', label: 'Bleu' },
  { value: '#EAB308', label: 'Jaune' },
  { value: '#8B5CF6', label: 'Violet' },
  { value: '#22C55E', label: 'Vert' },
  { value: '#F97316', label: 'Orange' },
  { value: '#EC4899', label: 'Rose' },
  { value: '#6B7280', label: 'Gris' },
  { value: '#EF4444', label: 'Rouge' },
  { value: '#06B6D4', label: 'Cyan' },
];

const ICON_OPTIONS = [
  { value: 'Package', label: 'Package' },
  { value: 'Zap', label: 'Éclair' },
  { value: 'Home', label: 'Maison' },
  { value: 'Users', label: 'Utilisateurs' },
  { value: 'Wrench', label: 'Clé' },
  { value: 'Megaphone', label: 'Mégaphone' },
  { value: 'MoreHorizontal', label: 'Plus' },
  { value: 'Tag', label: 'Tag' },
  { value: 'Receipt', label: 'Reçu' },
  { value: 'CreditCard', label: 'Carte' },
];

interface CategoryManagerProps {
  onCategoryChange?: () => void;
}

export function CategoryManager({ onCategoryChange }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'supplies',
    budget: '',
    color: '#6B7280',
    icon: 'Tag',
    description: '',
  });

  // Fetch categories
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/expenses/categories?demo=true');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Erreur lors du chargement des catégories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add category
  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast.error('Le nom est requis');
      return;
    }

    try {
      const response = await fetch('/api/expenses/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCategory,
          budget: newCategory.budget ? parseFloat(newCategory.budget) : null,
          demo: true,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Catégorie créée avec succès');
        setIsAddDialogOpen(false);
        setNewCategory({
          name: '',
          type: 'supplies',
          budget: '',
          color: '#6B7280',
          icon: 'Tag',
          description: '',
        });
        fetchCategories();
        onCategoryChange?.();
      } else {
        toast.error(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Update category
  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const response = await fetch('/api/expenses/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCategory.id,
          ...editingCategory,
          demo: true,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Catégorie mise à jour');
        setEditingCategory(null);
        fetchCategories();
        onCategoryChange?.();
      } else {
        toast.error(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Delete category
  const handleDeleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/categories?id=${id}&demo=true`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Catégorie supprimée');
        fetchCategories();
        onCategoryChange?.();
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Toggle category active status
  const handleToggleActive = async (category: Category) => {
    try {
      const response = await fetch('/api/expenses/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: category.id,
          isActive: !category.isActive,
          demo: true,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(category.isActive ? 'Catégorie désactivée' : 'Catégorie activée');
        fetchCategories();
        onCategoryChange?.();
      }
    } catch (error) {
      console.error('Error toggling category:', error);
      toast.error('Erreur de connexion');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Catégories de dépenses</CardTitle>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle catégorie
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nouvelle catégorie</DialogTitle>
                <DialogDescription>
                  Créer une nouvelle catégorie de dépenses
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nom *</Label>
                  <Input 
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Nom de la catégorie"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select 
                    value={newCategory.type} 
                    onValueChange={(v) => setNewCategory({ ...newCategory, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Budget mensuel (GNF)</Label>
                  <Input 
                    type="number"
                    value={newCategory.budget}
                    onChange={(e) => setNewCategory({ ...newCategory, budget: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Couleur</Label>
                    <Select 
                      value={newCategory.color} 
                      onValueChange={(v) => setNewCategory({ ...newCategory, color: v })}
                    >
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded" 
                            style={{ backgroundColor: newCategory.color }}
                          />
                          <span>{COLOR_OPTIONS.find(c => c.value === newCategory.color)?.label || 'Couleur'}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_OPTIONS.map(color => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded" 
                                style={{ backgroundColor: color.value }}
                              />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Icône</Label>
                    <Select 
                      value={newCategory.icon} 
                      onValueChange={(v) => setNewCategory({ ...newCategory, icon: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ICON_OPTIONS.map(icon => (
                          <SelectItem key={icon.value} value={icon.value}>{icon.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea 
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Description optionnelle..."
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button onClick={handleAddCategory} disabled={!newCategory.name}>
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="h-48 bg-muted animate-pulse" />
        ) : (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} className={!category.isActive ? 'opacity-50' : ''}>
                    <TableCell>
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: category.color }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{category.name}</p>
                        {category.description && (
                          <p className="text-xs text-muted-foreground">{category.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CATEGORY_TYPES.find(t => t.value === category.type)?.label || category.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {category.budget ? (
                        <span className="font-medium">
                          {new Intl.NumberFormat('fr-GN').format(category.budget)} GNF
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={category.isActive}
                          onCheckedChange={() => handleToggleActive(category)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {category.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la catégorie</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div>
                <Label>Nom</Label>
                <Input 
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select 
                  value={editingCategory.type} 
                  onValueChange={(v) => setEditingCategory({ ...editingCategory, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Budget mensuel (GNF)</Label>
                <Input 
                  type="number"
                  value={editingCategory.budget || ''}
                  onChange={(e) => setEditingCategory({ 
                    ...editingCategory, 
                    budget: e.target.value ? parseFloat(e.target.value) : null 
                  })}
                />
              </div>
              <div>
                <Label>Couleur</Label>
                <Select 
                  value={editingCategory.color} 
                  onValueChange={(v) => setEditingCategory({ ...editingCategory, color: v })}
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: editingCategory.color }}
                      />
                      <span>{COLOR_OPTIONS.find(c => c.value === editingCategory.color)?.label}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded" 
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateCategory}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default CategoryManager;
