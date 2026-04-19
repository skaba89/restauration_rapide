'use client';

// ============================================
// Restaurant OS - Admin Menus Management
// Gestion des menus, catégories et plats
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Menu,
  Utensils,
  FolderOpen,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronRight,
  Image as ImageIcon,
  DollarSign,
  Clock,
  Save,
  X,
  RefreshCw,
  Store,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { fetchWithAuth } from '@/lib/api-client';

// Types
interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  price: number;
  discountPrice: number | null;
  prepTime: number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isNew: boolean;
  sortOrder: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  items: MenuItem[];
}

interface MenuType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  menuType: string;
  sortOrder: number;
  categories: Category[];
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  menus: MenuType[];
}

// Form states
interface MenuItemForm {
  id?: string;
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  prepTime: string;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isNew: boolean;
}

interface CategoryForm {
  id?: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  isActive: boolean;
}

interface MenuForm {
  id?: string;
  name: string;
  description: string;
  menuType: string;
  isActive: boolean;
}

const DEFAULT_ITEM_FORM: MenuItemForm = {
  name: '',
  description: '',
  price: '',
  discountPrice: '',
  prepTime: '',
  image: '',
  isAvailable: true,
  isFeatured: false,
  isPopular: false,
  isNew: false,
};

const DEFAULT_CATEGORY_FORM: CategoryForm = {
  name: '',
  description: '',
  icon: '🍽️',
  image: '',
  isActive: true,
};

const DEFAULT_MENU_FORM: MenuForm = {
  name: '',
  description: '',
  menuType: 'main',
  isActive: true,
};

export default function AdminMenusPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [showMenuDialog, setShowMenuDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState<'menu' | 'category' | 'item'>('menu');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Form data
  const [menuForm, setMenuForm] = useState<MenuForm>(DEFAULT_MENU_FORM);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(DEFAULT_CATEGORY_FORM);
  const [itemForm, setItemForm] = useState<MenuItemForm>(DEFAULT_ITEM_FORM);

  // Get selected data
  const selectedRestaurant = restaurants.find(r => r.id === selectedRestaurantId);
  const selectedMenu = selectedRestaurant?.menus.find(m => m.id === selectedMenuId);
  const selectedCategory = selectedMenu?.categories.find(c => c.id === selectedCategoryId);

  // Fetch restaurants with menus
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/api/admin/menus');
      if (!response.ok) throw new Error('Failed to fetch menus');
      const data = await response.json();
      setRestaurants(data.restaurants || []);
      
      // Select first restaurant by default
      if (data.restaurants?.length > 0 && !selectedRestaurantId) {
        setSelectedRestaurantId(data.restaurants[0].id);
        if (data.restaurants[0].menus?.length > 0) {
          setSelectedMenuId(data.restaurants[0].menus[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
      toast.error('Erreur lors du chargement des menus');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurantId]);

  useEffect(() => {
    fetchData();
  }, []);

  // Filter items by search
  const filteredItems = selectedCategory?.items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Save handlers
  const handleSaveMenu = async () => {
    if (!menuForm.name.trim()) {
      toast.error('Le nom du menu est requis');
      return;
    }
    
    try {
      setSaving(true);
      const url = menuForm.id ? `/api/admin/menus/${menuForm.id}` : '/api/admin/menus';
      const method = menuForm.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...menuForm,
          restaurantId: selectedRestaurantId,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save menu');
      
      toast.success(menuForm.id ? 'Menu mis à jour' : 'Menu créé');
      setShowMenuDialog(false);
      setMenuForm(DEFAULT_MENU_FORM);
      fetchData();
    } catch (error) {
      console.error('Error saving menu:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error('Le nom de la catégorie est requis');
      return;
    }
    
    try {
      setSaving(true);
      const url = categoryForm.id ? `/api/admin/categories/${categoryForm.id}` : '/api/admin/categories';
      const method = categoryForm.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...categoryForm,
          menuId: selectedMenuId,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save category');
      
      toast.success(categoryForm.id ? 'Catégorie mise à jour' : 'Catégorie créée');
      setShowCategoryDialog(false);
      setCategoryForm(DEFAULT_CATEGORY_FORM);
      fetchData();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveItem = async () => {
    if (!itemForm.name.trim()) {
      toast.error('Le nom du plat est requis');
      return;
    }
    if (!itemForm.price || parseFloat(itemForm.price) <= 0) {
      toast.error('Le prix doit être supérieur à 0');
      return;
    }
    
    try {
      setSaving(true);
      const url = itemForm.id ? `/api/admin/items/${itemForm.id}` : '/api/admin/items';
      const method = itemForm.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...itemForm,
          price: parseFloat(itemForm.price),
          discountPrice: itemForm.discountPrice ? parseFloat(itemForm.discountPrice) : null,
          prepTime: itemForm.prepTime ? parseInt(itemForm.prepTime) : null,
          categoryId: selectedCategoryId,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save item');
      
      toast.success(itemForm.id ? 'Plat mis à jour' : 'Plat créé');
      setShowItemDialog(false);
      setItemForm(DEFAULT_ITEM_FORM);
      fetchData();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setSaving(true);
      const endpoint = deleteType === 'menu' ? 'menus' : deleteType === 'category' ? 'categories' : 'items';
      const response = await fetchWithAuth(`/api/admin/${endpoint}/${deleteId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      
      toast.success('Supprimé avec succès');
      setShowDeleteDialog(false);
      setDeleteId(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setSaving(false);
    }
  };

  // Toggle availability
  const handleToggleItem = async (itemId: string, isAvailable: boolean) => {
    try {
      await fetchWithAuth(`/api/admin/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable }),
      });
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(price) + ' GNF';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Menus</h1>
          <p className="text-muted-foreground">Gérez les menus, catégories et plats de vos restaurants</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button size="sm" onClick={() => { setMenuForm(DEFAULT_MENU_FORM); setShowMenuDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Menu
          </Button>
        </div>
      </div>

      {/* Restaurant & Menu Selection */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Store className="h-4 w-4" />
              Restaurant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedRestaurantId || ''} onValueChange={(id) => {
              setSelectedRestaurantId(id);
              const rest = restaurants.find(r => r.id === id);
              setSelectedMenuId(rest?.menus[0]?.id || null);
              setSelectedCategoryId(null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un restaurant" />
              </SelectTrigger>
              <SelectContent>
                {restaurants.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Menu className="h-4 w-4" />
              Menu
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Select value={selectedMenuId || ''} onValueChange={(id) => {
              setSelectedMenuId(id);
              setSelectedCategoryId(null);
            }}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sélectionner un menu" />
              </SelectTrigger>
              <SelectContent>
                {selectedRestaurant?.menus.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => {
              if (selectedMenu) {
                setMenuForm({
                  id: selectedMenu.id,
                  name: selectedMenu.name,
                  description: selectedMenu.description || '',
                  menuType: selectedMenu.menuType,
                  isActive: selectedMenu.isActive,
                });
                setShowMenuDialog(true);
              }
            }}>
              <Edit className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Categories and Items */}
      {selectedMenu && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedMenu.name}</CardTitle>
                <CardDescription>{selectedMenu.categories.length} catégories</CardDescription>
              </div>
              <Button size="sm" onClick={() => { setCategoryForm(DEFAULT_CATEGORY_FORM); setShowCategoryDialog(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Catégorie
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedMenu.categories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune catégorie dans ce menu</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => { setCategoryForm(DEFAULT_CATEGORY_FORM); setShowCategoryDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une catégorie
                </Button>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {selectedMenu.categories.map((category) => (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon || '🍽️'}</span>
                        <div className="text-left">
                          <span className="font-medium">{category.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({category.items.length} plats)
                          </span>
                        </div>
                        {!category.isActive && (
                          <Badge variant="secondary" className="ml-2">Inactif</Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        {/* Category actions */}
                        <div className="flex items-center justify-between pb-4 border-b">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => {
                              setCategoryForm({
                                id: category.id,
                                name: category.name,
                                description: category.description || '',
                                icon: category.icon || '🍽️',
                                image: category.image || '',
                                isActive: category.isActive,
                              });
                              setShowCategoryDialog(true);
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600" onClick={() => {
                              setDeleteType('category');
                              setDeleteId(category.id);
                              setShowDeleteDialog(true);
                            }}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </Button>
                          </div>
                          <Button size="sm" onClick={() => {
                            setSelectedCategoryId(category.id);
                            setItemForm(DEFAULT_ITEM_FORM);
                            setShowItemDialog(true);
                          }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter un plat
                          </Button>
                        </div>

                        {/* Items list */}
                        {category.items.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">
                            Aucun plat dans cette catégorie
                          </p>
                        ) : (
                          <div className="rounded-md border overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-12"></TableHead>
                                  <TableHead>Plat</TableHead>
                                  <TableHead>Prix</TableHead>
                                  <TableHead>Disponibilité</TableHead>
                                  <TableHead>Badges</TableHead>
                                  <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {category.items.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell>
                                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                                        {item.image ? (
                                          <Image src={item.image} alt={item.name} width={48} height={48} className="object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div>
                                        {item.discountPrice ? (
                                          <>
                                            <p className="font-medium text-orange-600">{formatPrice(item.discountPrice)}</p>
                                            <p className="text-sm text-muted-foreground line-through">{formatPrice(item.price)}</p>
                                          </>
                                        ) : (
                                          <p className="font-medium">{formatPrice(item.price)}</p>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Switch
                                        checked={item.isAvailable}
                                        onCheckedChange={(checked) => handleToggleItem(item.id, checked)}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex flex-wrap gap-1">
                                        {item.isPopular && <Badge variant="secondary" className="text-xs">Populaire</Badge>}
                                        {item.isFeatured && <Badge variant="secondary" className="text-xs">Vedette</Badge>}
                                        {item.isNew && <Badge variant="secondary" className="text-xs">Nouveau</Badge>}
                                      </div>
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
                                          <DropdownMenuItem onClick={() => {
                                            setSelectedCategoryId(category.id);
                                            setItemForm({
                                              id: item.id,
                                              name: item.name,
                                              description: item.description || '',
                                              price: item.price.toString(),
                                              discountPrice: item.discountPrice?.toString() || '',
                                              prepTime: item.prepTime?.toString() || '',
                                              image: item.image || '',
                                              isAvailable: item.isAvailable,
                                              isFeatured: item.isFeatured,
                                              isPopular: item.isPopular,
                                              isNew: item.isNew,
                                            });
                                            setShowItemDialog(true);
                                          }}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Modifier
                                          </DropdownMenuItem>
                                          <DropdownMenuItem className="text-red-600" onClick={() => {
                                            setDeleteType('item');
                                            setDeleteId(item.id);
                                            setShowDeleteDialog(true);
                                          }}>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Supprimer
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      )}

      {/* Menu Dialog */}
      <Dialog open={showMenuDialog} onOpenChange={setShowMenuDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{menuForm.id ? 'Modifier le menu' : 'Nouveau menu'}</DialogTitle>
            <DialogDescription>Configurez les informations du menu</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom *</label>
              <Input
                value={menuForm.name}
                onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                placeholder="Ex: Menu du jour"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={menuForm.description}
                onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                placeholder="Description du menu"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={menuForm.menuType} onValueChange={(v) => setMenuForm({ ...menuForm, menuType: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Principal</SelectItem>
                  <SelectItem value="breakfast">Petit-déjeuner</SelectItem>
                  <SelectItem value="lunch">Déjeuner</SelectItem>
                  <SelectItem value="dinner">Dîner</SelectItem>
                  <SelectItem value="drinks">Boissons</SelectItem>
                  <SelectItem value="special">Spécial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={menuForm.isActive}
                onCheckedChange={(checked) => setMenuForm({ ...menuForm, isActive: checked })}
              />
              <label className="text-sm font-medium">Menu actif</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMenuDialog(false)}>Annuler</Button>
            <Button onClick={handleSaveMenu} disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{categoryForm.id ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
            <DialogDescription>Configurez les informations de la catégorie</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom *</label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Ex: Plats principaux"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Icône</label>
              <Input
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                placeholder="🍽️"
                className="w-20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Description de la catégorie"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={categoryForm.isActive}
                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
              />
              <label className="text-sm font-medium">Catégorie active</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>Annuler</Button>
            <Button onClick={handleSaveCategory} disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{itemForm.id ? 'Modifier le plat' : 'Nouveau plat'}</DialogTitle>
            <DialogDescription>Configurez les informations du plat</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Nom *</label>
                <Input
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="Ex: Riz Gras"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prix (GNF) *</label>
                <Input
                  type="number"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  placeholder="5000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prix promo (GNF)</label>
                <Input
                  type="number"
                  value={itemForm.discountPrice}
                  onChange={(e) => setItemForm({ ...itemForm, discountPrice: e.target.value })}
                  placeholder="4000"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Description du plat"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Temps de préparation (min)</label>
                <Input
                  type="number"
                  value={itemForm.prepTime}
                  onChange={(e) => setItemForm({ ...itemForm, prepTime: e.target.value })}
                  placeholder="15"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  value={itemForm.image}
                  onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium">Options</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={itemForm.isAvailable}
                    onCheckedChange={(checked) => setItemForm({ ...itemForm, isAvailable: checked })}
                  />
                  <label className="text-sm">Disponible</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={itemForm.isFeatured}
                    onCheckedChange={(checked) => setItemForm({ ...itemForm, isFeatured: checked })}
                  />
                  <label className="text-sm">Vedette</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={itemForm.isPopular}
                    onCheckedChange={(checked) => setItemForm({ ...itemForm, isPopular: checked })}
                  />
                  <label className="text-sm">Populaire</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={itemForm.isNew}
                    onCheckedChange={(checked) => setItemForm({ ...itemForm, isNew: checked })}
                  />
                  <label className="text-sm">Nouveau</label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDialog(false)}>Annuler</Button>
            <Button onClick={handleSaveItem} disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}