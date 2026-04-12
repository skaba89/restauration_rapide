'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCurrencySafe } from '@/lib/currency-context';
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  UtensilsCrossed,
  Coffee,
  Salad,
  Cake,
  Grid3X3,
  List,
  Star,
  TrendingUp,
  Package,
  DollarSign,
  Image as ImageIcon,
  Upload,
  X,
  Camera,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  costPrice: number;
  isAvailable: boolean;
  preparationTime: number;
  isPopular: boolean;
  isNew: boolean;
  allergens: string[];
  image?: string | null;
  orderCount?: number;
}

const DEFAULT_CATEGORY_NAMES = ['Plats Ivoiriens', 'Plats Sénégalais', 'Plats Guinéens', 'Grillades', 'Fast Food', 'Boissons', 'Plats', 'Accompagnements', 'Desserts', 'Entrées'];

const CATEGORY_ICONS: Record<string, any> = {
  'Plats Ivoiriens': UtensilsCrossed, 'Plats Sénégalais': UtensilsCrossed, 'Plats Guinéens': UtensilsCrossed,
  'Grillades': UtensilsCrossed, 'Fast Food': UtensilsCrossed, 'Boissons': Coffee,
  'Plats': UtensilsCrossed, 'Accompagnements': Salad, 'Desserts': Cake, 'Entrées': Salad,
};

function getCategoryIcon(name: string) {
  return CATEGORY_ICONS[name] || UtensilsCrossed;
}

const ALLERGENS = ['Gluten', 'Poisson', 'Arachides', 'Lait', 'Œufs', 'Soja', 'Fruits de mer'];

export default function MenuPage() {
  const { toast } = useToast();
  const { formatCurrency } = useCurrencySafe();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // New item form state
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Plats',
    price: '',
    costPrice: '',
    description: '',
    prepTime: '15',
    isPopular: false,
    isNew: false,
    isAvailable: true,
    allergens: [] as string[],
    image: null as string | null,
  });

  // Fetch menu items from API
  const fetchMenuItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/menu');
      const result = await response.json();
      
      if (result.success && result.data) {
        setMenuItems(result.data);
        setIsDemo(result.isDemo || false);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le menu',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Dynamic categories: combine defaults with categories from loaded items
  const allCategoryNames = [...new Set([...DEFAULT_CATEGORY_NAMES, ...menuItems.map(item => item.category)])];
  const categories = allCategoryNames.map((name, index) => ({
    id: String(index + 1),
    name,
    icon: getCategoryIcon(name),
    itemCount: menuItems.filter(item => item.category === name).length,
    active: menuItems.filter(item => item.category === name && item.isAvailable).length > 0,
  }));

  // Flat list of category names for form dropdowns
  const formCategories = allCategoryNames;

  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleItemAvailability = async (itemId: string) => {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    try {
      const response = await fetch('/api/admin/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, isAvailable: !item.isAvailable }),
      });
      const result = await response.json();
      
      if (result.success) {
        setMenuItems(prev => prev.map(i => 
          i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i
        ));
        toast({
          title: 'Disponibilité mise à jour',
          description: 'Le statut de l\'article a été modifié',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Erreur',
          description: 'Veuillez sélectionner un fichier image',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Erreur',
          description: 'L\'image ne doit pas dépasser 5 Mo',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (isEdit && editingItem) {
          setEditingItem({ ...editingItem, image: base64 });
        } else {
          setNewItem({ ...newItem, image: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.price) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItem.name,
          category: newItem.category,
          price: newItem.price,
          costPrice: newItem.costPrice || '0',
          description: newItem.description,
          preparationTime: newItem.prepTime,
          isPopular: newItem.isPopular,
          isNew: newItem.isNew,
          isAvailable: newItem.isAvailable,
          allergens: newItem.allergens,
          image: newItem.image,
        }),
      });
      const result = await response.json();
      
      if (result.success) {
        setMenuItems(prev => [...prev, result.data]);
        
        // Reset form
        setNewItem({
          name: '',
          category: 'Plats',
          price: '',
          costPrice: '',
          description: '',
          prepTime: '15',
          isPopular: false,
          isNew: false,
          isAvailable: true,
          allergens: [],
          image: null,
        });
        setIsAddDialogOpen(false);

        toast({
          title: 'Article ajouté',
          description: `${result.data.name} a été ajouté au menu`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de l\'ajout',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateMenuItem = async () => {
    if (!editingItem) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });
      const result = await response.json();
      
      if (result.success) {
        setMenuItems(prev => prev.map(item => 
          item.id === editingItem.id ? result.data : item
        ));
        setIsEditDialogOpen(false);
        setEditingItem(null);

        toast({
          title: 'Article mis à jour',
          description: 'Les modifications ont été enregistrées',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la mise à jour',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${item.name}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/menu?id=${itemId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (result.success) {
        setMenuItems(prev => prev.filter(i => i.id !== itemId));

        toast({
          title: 'Article supprimé',
          description: `${item.name} a été retiré du menu`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la suppression',
        variant: 'destructive',
      });
    }
  };

  const duplicateMenuItem = async (itemId: string) => {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    try {
      const response = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          name: `${item.name} (copie)`,
          id: undefined,
        }),
      });
      const result = await response.json();
      
      if (result.success) {
        setMenuItems(prev => [...prev, result.data]);

        toast({
          title: 'Article dupliqué',
          description: `Une copie de ${item.name} a été créée`,
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la duplication',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (item: MenuItem) => {
    setEditingItem({ ...item });
    setIsEditDialogOpen(true);
  };

  const toggleAllergen = (allergen: string, isEdit = false) => {
    if (isEdit && editingItem) {
      setEditingItem({
        ...editingItem,
        allergens: editingItem.allergens.includes(allergen)
          ? editingItem.allergens.filter(a => a !== allergen)
          : [...editingItem.allergens, allergen]
      });
    } else {
      setNewItem({
        ...newItem,
        allergens: newItem.allergens.includes(allergen)
          ? newItem.allergens.filter(a => a !== allergen)
          : [...newItem.allergens, allergen]
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Menu</h1>
          <p className="text-muted-foreground">Gérez vos plats et accompagnements</p>
          {isDemo && (
            <div className="flex items-center gap-2 mt-2 text-amber-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              Mode démo - les données ne sont pas sauvegardées
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </Button>
          <Button variant="outline" onClick={fetchMenuItems} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button className="bg-gradient-to-r from-orange-500 to-red-600" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un article
          </Button>
        </div>
      </div>

      {/* Categories & Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un article..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Categories Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Card
            key={category.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedCategory === category.name ? 'ring-2 ring-orange-500' : ''
            }`}
            onClick={() => setSelectedCategory(selectedCategory === category.name ? 'all' : category.name)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <category.icon className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-muted-foreground">{category.itemCount} articles</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement du menu...</p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className={`overflow-hidden ${!item.isAvailable ? 'opacity-60' : ''}`}>
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 flex items-center justify-center relative group">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-orange-300" />
                )}
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-medium">Indisponible</span>
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <CardDescription className="text-xs">{item.category}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(item)}>
                        <Edit className="h-4 w-4 mr-2" /> Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateMenuItem(item.id)}>
                        <Copy className="h-4 w-4 mr-2" /> Dupliquer
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => deleteMenuItem(item.id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                <div className="flex items-center gap-2 mb-3">
                  {item.isPopular && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                      <Star className="h-3 w-3 mr-1" /> Populaire
                    </Badge>
                  )}
                  {item.isNew && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Nouveau
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-600">{formatCurrency(item.price)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{item.orderCount || 0} cmdes</span>
                    <Switch
                      checked={item.isAvailable}
                      onCheckedChange={() => toggleItemAvailability(item.id)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-orange-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.name}</p>
                      {item.isPopular && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                      {item.isNew && <Badge variant="secondary" className="text-xs">Nouveau</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>{item.preparationTime} min</span>
                      <span>•</span>
                      <span>{item.orderCount || 0} commandes</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">{formatCurrency(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(item)}>
                            <Edit className="h-4 w-4 mr-2" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateMenuItem(item.id)}>
                            <Copy className="h-4 w-4 mr-2" /> Dupliquer
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => deleteMenuItem(item.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Switch
                        checked={item.isAvailable}
                        onCheckedChange={() => toggleItemAvailability(item.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un article</DialogTitle>
            <DialogDescription>Ajoutez un nouveau plat ou accompagnement à votre menu</DialogDescription>
          </DialogHeader>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => handleImageUpload(e)}
          />
          
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Image Upload */}
            <div className="col-span-2">
              <Label>Photo de l'article</Label>
              <div 
                className="mt-2 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-orange-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {newItem.image ? (
                  <div className="relative">
                    <img src={newItem.image} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewItem({ ...newItem, image: null });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="py-4">
                    <Camera className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Cliquez pour ajouter une photo</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG jusqu'à 5 Mo</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Nom de l'article *</Label>
              <Input 
                id="name" 
                placeholder="Ex: Attieké Poisson Grillé" 
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Select value={newItem.category} onValueChange={(v) => setNewItem({ ...newItem, category: v })}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {formCategories.map((catName) => (
                    <SelectItem key={catName} value={catName}>{catName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Prix ({formatCurrency(0).replace('0', '').trim()}) *</Label>
              <Input 
                id="price" 
                type="number" 
                placeholder="3500" 
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPrice">Prix de revient ({formatCurrency(0).replace('0', '').trim()})</Label>
              <Input 
                id="costPrice" 
                type="number" 
                placeholder="2000" 
                value={newItem.costPrice}
                onChange={(e) => setNewItem({ ...newItem, costPrice: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prepTime">Temps de préparation (min)</Label>
              <Input 
                id="prepTime" 
                type="number" 
                placeholder="15" 
                value={newItem.prepTime}
                onChange={(e) => setNewItem({ ...newItem, prepTime: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Description courte de l'article" 
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Allergènes</Label>
              <div className="flex flex-wrap gap-2">
                {ALLERGENS.map(allergen => (
                  <Badge
                    key={allergen}
                    variant={newItem.allergens.includes(allergen) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleAllergen(allergen)}
                  >
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="col-span-2 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch 
                  id="isAvailable" 
                  checked={newItem.isAvailable}
                  onCheckedChange={(v) => setNewItem({ ...newItem, isAvailable: v })}
                />
                <Label htmlFor="isAvailable">Disponible</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  id="popular" 
                  checked={newItem.isPopular}
                  onCheckedChange={(v) => setNewItem({ ...newItem, isPopular: v })}
                />
                <Label htmlFor="popular">Populaire</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  id="new" 
                  checked={newItem.isNew}
                  onCheckedChange={(v) => setNewItem({ ...newItem, isNew: v })}
                />
                <Label htmlFor="new">Nouveau</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setNewItem({
                name: '',
                category: 'Plats',
                price: '',
                costPrice: '',
                description: '',
                prepTime: '15',
                isPopular: false,
                isNew: false,
                isAvailable: true,
                allergens: [],
                image: null,
              });
            }}>Annuler</Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600" onClick={addMenuItem} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'article</DialogTitle>
            <DialogDescription>Modifiez les informations de l'article</DialogDescription>
          </DialogHeader>
          
          <input
            type="file"
            ref={editFileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, true)}
          />
          
          {editingItem && (
            <div className="grid grid-cols-2 gap-4 py-4">
              {/* Image Upload */}
              <div className="col-span-2">
                <Label>Photo de l'article</Label>
                <div 
                  className="mt-2 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-orange-500 transition-colors"
                  onClick={() => editFileInputRef.current?.click()}
                >
                  {editingItem.image ? (
                    <div className="relative">
                      <img src={editingItem.image} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem({ ...editingItem, image: null });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Camera className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Cliquez pour ajouter une photo</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG jusqu'à 5 Mo</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-name">Nom de l'article *</Label>
                <Input 
                  id="edit-name" 
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Catégorie *</Label>
                <Select 
                  value={editingItem.category} 
                  onValueChange={(v) => setEditingItem({ ...editingItem, category: v })}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formCategories.map((catName) => (
                      <SelectItem key={catName} value={catName}>{catName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Prix ({formatCurrency(0).replace('0', '').trim()}) *</Label>
                <Input 
                  id="edit-price" 
                  type="number" 
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-costPrice">Prix de revient ({formatCurrency(0).replace('0', '').trim()})</Label>
                <Input 
                  id="edit-costPrice" 
                  type="number" 
                  value={editingItem.costPrice}
                  onChange={(e) => setEditingItem({ ...editingItem, costPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-prepTime">Temps de préparation (min)</Label>
                <Input 
                  id="edit-prepTime" 
                  type="number" 
                  value={editingItem.preparationTime}
                  onChange={(e) => setEditingItem({ ...editingItem, preparationTime: parseInt(e.target.value) || 15 })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Allergènes</Label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGENS.map(allergen => (
                    <Badge
                      key={allergen}
                      variant={editingItem.allergens?.includes(allergen) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleAllergen(allergen, true)}
                    >
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch 
                    id="edit-isAvailable" 
                    checked={editingItem.isAvailable}
                    onCheckedChange={(v) => setEditingItem({ ...editingItem, isAvailable: v })}
                  />
                  <Label htmlFor="edit-isAvailable">Disponible</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    id="edit-popular" 
                    checked={editingItem.isPopular}
                    onCheckedChange={(v) => setEditingItem({ ...editingItem, isPopular: v })}
                  />
                  <Label htmlFor="edit-popular">Populaire</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    id="edit-new" 
                    checked={editingItem.isNew}
                    onCheckedChange={(v) => setEditingItem({ ...editingItem, isNew: v })}
                  />
                  <Label htmlFor="edit-new">Nouveau</Label>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setEditingItem(null);
            }}>Annuler</Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600" onClick={updateMenuItem} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
