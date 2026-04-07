'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Search,
  ChefHat,
  Image as ImageIcon,
  DollarSign,
  Clock,
  Save,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  price: number;
  discountPrice: number | null;
  prepTime: number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isNew: boolean;
  isVegetarian: boolean;
  isSpicy: boolean;
  orderCount: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  items: MenuItem[];
}

interface Menu {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  categories: Category[];
}

export default function MenuManagementPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialogs
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Form state
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemPrepTime, setItemPrepTime] = useState('');
  const [itemIsVegetarian, setItemIsVegetarian] = useState(false);
  const [itemIsSpicy, setItemIsSpicy] = useState(false);

  // Fetch menu data
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/menu?restaurantId=${restaurantId}`);
        if (res.ok) {
          const data = await res.json();
          setMenus(Array.isArray(data) ? data : data.data || []);
          if (data.length > 0 || data.data?.length > 0) {
            const menuList = Array.isArray(data) ? data : data.data;
            setSelectedMenu(menuList[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch menu:', error);
        toast.error('Erreur lors du chargement du menu');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchMenu();
    }
  }, [restaurantId]);

  // Filter items by search
  const filteredCategories = selectedMenu?.categories.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })) || [];

  // Create/Update Category
  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      toast.error('Le nom de la catégorie est requis');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/menu';
      const method = editingCategory ? 'PATCH' : 'POST';
      const body = editingCategory
        ? { type: 'category', id: editingCategory.id, name: categoryName, description: categoryDescription }
        : {
            type: 'category',
            menuId: selectedMenu?.id,
            name: categoryName,
            description: categoryDescription,
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      toast.success(editingCategory ? 'Catégorie mise à jour' : 'Catégorie créée');
      setShowCategoryDialog(false);
      setCategoryName('');
      setCategoryDescription('');
      setEditingCategory(null);

      // Refresh menu
      if (selectedMenu) {
        setSelectedMenu((prev) => {
          if (!prev) return prev;
          if (editingCategory) {
            return {
              ...prev,
              categories: prev.categories.map((c) =>
                c.id === editingCategory.id ? { ...c, name: categoryName, description: categoryDescription } : c
              ),
            };
          }
          return {
            ...prev,
            categories: [...prev.categories, data.data || data],
          };
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Create/Update Item
  const handleSaveItem = async () => {
    if (!itemName.trim() || !itemPrice) {
      toast.error('Le nom et le prix sont requis');
      return;
    }

    if (!selectedCategoryId) {
      toast.error('Sélectionnez une catégorie');
      return;
    }

    setSaving(true);
    try {
      const method = editingItem ? 'PATCH' : 'POST';
      const body = editingItem
        ? {
            type: 'item',
            id: editingItem.id,
            name: itemName,
            description: itemDescription,
            price: parseFloat(itemPrice),
            prepTime: itemPrepTime ? parseInt(itemPrepTime) : null,
            isVegetarian: itemIsVegetarian,
            isSpicy: itemIsSpicy,
          }
        : {
            type: 'item',
            categoryId: selectedCategoryId,
            name: itemName,
            description: itemDescription,
            price: parseFloat(itemPrice),
            prepTime: itemPrepTime ? parseInt(itemPrepTime) : null,
            isVegetarian: itemIsVegetarian,
            isSpicy: itemIsSpicy,
          };

      const res = await fetch('/api/menu', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      toast.success(editingItem ? 'Article mis à jour' : 'Article créé');
      setShowItemDialog(false);
      resetItemForm();

      // Refresh menu
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Toggle item availability
  const toggleItemAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'item',
          id: itemId,
          isAvailable: !currentStatus,
        }),
      });

      if (res.ok) {
        // Update local state
        setSelectedMenu((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            categories: prev.categories.map((cat) => ({
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, isAvailable: !currentStatus } : item
              ),
            })),
          };
        });
        toast.success(currentStatus ? 'Article masqué' : 'Article visible');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Delete item
  const deleteItem = async (itemId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    try {
      const res = await fetch(`/api/menu?type=item&id=${itemId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSelectedMenu((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            categories: prev.categories.map((cat) => ({
              ...cat,
              items: cat.items.filter((item) => item.id !== itemId),
            })),
          };
        });
        toast.success('Article supprimé');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Delete category
  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie et tous ses articles ?')) return;

    try {
      const res = await fetch(`/api/menu?type=category&id=${categoryId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSelectedMenu((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            categories: prev.categories.filter((cat) => cat.id !== categoryId),
          };
        });
        toast.success('Catégorie supprimée');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetItemForm = () => {
    setItemName('');
    setItemDescription('');
    setItemPrice('');
    setItemPrepTime('');
    setItemIsVegetarian(false);
    setItemIsSpicy(false);
    setEditingItem(null);
    setSelectedCategoryId(null);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || '');
    setShowCategoryDialog(true);
  };

  const openEditItem = (item: MenuItem, categoryId: string) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemDescription(item.description || '');
    setItemPrice(item.price.toString());
    setItemPrepTime(item.prepTime?.toString() || '');
    setItemIsVegetarian(item.isVegetarian);
    setItemIsSpicy(item.isSpicy);
    setSelectedCategoryId(categoryId);
    setShowItemDialog(true);
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} GNF`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-32 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion du Menu</h1>
          <p className="text-gray-500">
            Gérez vos catégories et articles
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEditingCategory(null);
              setCategoryName('');
              setCategoryDescription('');
              setShowCategoryDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Catégorie
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => {
              resetItemForm();
              if (selectedMenu?.categories?.length) {
                setSelectedCategoryId(selectedMenu.categories[0].id);
              }
              setShowItemDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Article
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Rechercher un article..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Menu Tabs */}
      {menus.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {menus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => setSelectedMenu(menu)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedMenu?.id === menu.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {menu.name}
            </button>
          ))}
        </div>
      )}

      {/* Categories and Items */}
      {filteredCategories.length === 0 ? (
        <Card className="p-12 text-center">
          <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Aucun article</h2>
          <p className="text-gray-500 mt-2 mb-6">
            Commencez par ajouter une catégorie, puis des articles
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setEditingCategory(null);
                setShowCategoryDialog(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une catégorie
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredCategories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      {category.description && (
                        <p className="text-sm text-gray-500">{category.description}</p>
                      )}
                    </div>
                    <Badge variant="outline">
                      {category.items.length} article{category.items.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditCategory(category)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => deleteCategory(category.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {category.items.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-gray-500 mb-3">Aucun article dans cette catégorie</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetItemForm();
                        setSelectedCategoryId(category.id);
                        setShowItemDialog(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un article
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {category.items.map((item) => (
                      <div
                        key={item.id}
                        className={`relative p-4 rounded-lg border transition-all hover:shadow-md ${
                          !item.isAvailable ? 'opacity-60 bg-gray-50' : ''
                        }`}
                      >
                        {/* Item Image */}
                        <div className="w-full h-32 rounded-lg bg-gray-100 mb-3 flex items-center justify-center overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-12 h-12 text-gray-300" />
                          )}
                        </div>

                        {/* Item Info */}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {item.isVegetarian && (
                                <Badge variant="outline" className="text-xs text-green-600">
                                  Végétarien
                                </Badge>
                              )}
                              {item.isSpicy && (
                                <Badge variant="outline" className="text-xs text-red-600">
                                  🌶️ Épicé
                                </Badge>
                              )}
                              {item.isPopular && (
                                <Badge variant="outline" className="text-xs text-orange-600">
                                  Populaire
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                          {item.description || 'Pas de description'}
                        </p>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-orange-600">
                              {formatPrice(item.price)}
                            </p>
                            {item.prepTime && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.prepTime} min
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => toggleItemAvailability(item.id, item.isAvailable)}
                              className={`p-2 rounded-lg ${
                                item.isAvailable
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-gray-400 hover:bg-gray-100'
                              }`}
                            >
                              {item.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => openEditItem(item, category.id)}
                              className="p-2 rounded-lg hover:bg-gray-100"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="categoryName">Nom *</Label>
              <Input
                id="categoryName"
                placeholder="Ex: Plats principaux"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="categoryDescription">Description</Label>
              <Input
                id="categoryDescription"
                placeholder="Description courte de la catégorie"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              Annuler
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleSaveCategory}
              disabled={saving}
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Modifier l\'article' : 'Nouvel article'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4 max-h-96 overflow-y-auto">
            <div>
              <Label htmlFor="categoryId">Catégorie *</Label>
              <select
                id="categoryId"
                value={selectedCategoryId || ''}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Sélectionner une catégorie</option>
                {selectedMenu?.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="itemName">Nom *</Label>
              <Input
                id="itemName"
                placeholder="Ex: Attieké Poisson Grillé"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="itemDescription">Description</Label>
              <Input
                id="itemDescription"
                placeholder="Description de l'article"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemPrice">Prix (GNF) *</Label>
                <Input
                  id="itemPrice"
                  type="number"
                  placeholder="15000"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="itemPrepTime">Temps de préparation (min)</Label>
                <Input
                  id="itemPrepTime"
                  type="number"
                  placeholder="20"
                  value={itemPrepTime}
                  onChange={(e) => setItemPrepTime(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={itemIsVegetarian}
                  onChange={(e) => setItemIsVegetarian(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Végétarien</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={itemIsSpicy}
                  onChange={(e) => setItemIsSpicy(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Épicé</span>
              </label>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowItemDialog(false)}>
              Annuler
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleSaveItem}
              disabled={saving}
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
