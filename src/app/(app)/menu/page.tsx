'use client';

import { useState, useRef } from 'react';
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
} from 'lucide-react';

// Demo menu categories - replaced Vins & Alcools with Accompagnements
const DEMO_CATEGORIES = [
  { id: '1', name: 'Plats Principaux', icon: UtensilsCrossed, itemCount: 12, active: true },
  { id: '2', name: 'Accompagnements', icon: Salad, itemCount: 6, active: true },
  { id: '3', name: 'Boissons', icon: Coffee, itemCount: 8, active: true },
  { id: '4', name: 'Desserts', icon: Cake, itemCount: 5, active: true },
];

const DEMO_MENU_ITEMS = [
  {
    id: '1',
    name: 'Attieké Poisson Grillé',
    category: 'Plats Principaux',
    price: 3500,
    description: 'Attieké traditionnel avec poisson grillé et sauce tomate',
    image: null,
    isAvailable: true,
    isPopular: true,
    isNew: false,
    prepTime: 20,
    orders: 156,
  },
  {
    id: '2',
    name: 'Kedjenou de Poulet',
    category: 'Plats Principaux',
    price: 4500,
    description: 'Poulet braisé aux légumes, cuit à l\'étouffée',
    image: null,
    isAvailable: true,
    isPopular: true,
    isNew: false,
    prepTime: 25,
    orders: 142,
  },
  {
    id: '3',
    name: 'Thiéboudienne',
    category: 'Plats Principaux',
    price: 3500,
    description: 'Riz rouge au poisson et légumes, spécialité sénégalaise',
    image: null,
    isAvailable: true,
    isPopular: false,
    isNew: true,
    prepTime: 30,
    orders: 128,
  },
  {
    id: '4',
    name: 'Jus de Bissap',
    category: 'Boissons',
    price: 750,
    description: 'Jus naturel de fleur d\'hibiscus rafraîchissant',
    image: null,
    isAvailable: true,
    isPopular: true,
    isNew: false,
    prepTime: 5,
    orders: 98,
  },
  {
    id: '5',
    name: 'Alloco Sauce Graine',
    category: 'Plats Principaux',
    price: 2500,
    description: 'Bananes plantain frites avec sauce graine aux légumes',
    image: null,
    isAvailable: false,
    isPopular: false,
    isNew: false,
    prepTime: 15,
    orders: 115,
  },
  {
    id: '6',
    name: 'Riz Gras',
    category: 'Accompagnements',
    price: 1500,
    description: 'Riz aux tomates et épices parfumé',
    image: null,
    isAvailable: true,
    isPopular: true,
    isNew: false,
    prepTime: 10,
    orders: 180,
  },
  {
    id: '7',
    name: 'Foutou Banane',
    category: 'Accompagnements',
    price: 1200,
    description: 'Pâte de banane plantain traditionnelle',
    image: null,
    isAvailable: true,
    isPopular: false,
    isNew: false,
    prepTime: 15,
    orders: 95,
  },
  {
    id: '8',
    name: 'Ignan Pimenté',
    category: 'Accompagnements',
    price: 500,
    description: 'Sauce pimentée maison',
    image: null,
    isAvailable: true,
    isPopular: true,
    isNew: false,
    prepTime: 5,
    orders: 200,
  },
];

const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} FCFA`;

export default function MenuPage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [menuItems, setMenuItems] = useState(DEMO_MENU_ITEMS);
  const [categories, setCategories] = useState(DEMO_CATEGORIES);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<typeof DEMO_MENU_ITEMS[0] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // New item form state
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    prepTime: '',
    isPopular: false,
    isNew: false,
    image: null as string | null,
  });

  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleItemAvailability = (itemId: string) => {
    setMenuItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
    ));
    toast({
      title: 'Disponibilité mise à jour',
      description: 'Le statut de l\'article a été modifié',
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Erreur',
          description: 'Veuillez sélectionner un fichier image',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 5MB)
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

  const addMenuItem = () => {
    if (!newItem.name || !newItem.category || !newItem.price) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    const newMenuItem = {
      id: String(menuItems.length + 1),
      name: newItem.name,
      category: newItem.category,
      price: parseInt(newItem.price),
      description: newItem.description,
      image: newItem.image,
      isAvailable: true,
      isPopular: newItem.isPopular,
      isNew: newItem.isNew,
      prepTime: parseInt(newItem.prepTime) || 15,
      orders: 0,
    };

    setMenuItems([...menuItems, newMenuItem]);
    
    // Update category item count
    setCategories(prev => prev.map(cat => 
      cat.name === newItem.category ? { ...cat, itemCount: cat.itemCount + 1 } : cat
    ));

    // Reset form
    setNewItem({
      name: '',
      category: '',
      price: '',
      description: '',
      prepTime: '',
      isPopular: false,
      isNew: false,
      image: null,
    });
    setIsAddDialogOpen(false);

    toast({
      title: 'Article ajouté',
      description: `${newMenuItem.name} a été ajouté au menu`,
    });
  };

  const updateMenuItem = () => {
    if (!editingItem) return;

    setMenuItems(prev => prev.map(item => 
      item.id === editingItem.id ? editingItem : item
    ));

    setIsEditDialogOpen(false);
    setEditingItem(null);

    toast({
      title: 'Article mis à jour',
      description: 'Les modifications ont été enregistrées',
    });
  };

  const deleteMenuItem = (itemId: string) => {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    setMenuItems(prev => prev.filter(i => i.id !== itemId));
    
    // Update category item count
    setCategories(prev => prev.map(cat => 
      cat.name === item.category ? { ...cat, itemCount: Math.max(0, cat.itemCount - 1) } : cat
    ));

    toast({
      title: 'Article supprimé',
      description: `${item.name} a été retiré du menu`,
    });
  };

  const duplicateMenuItem = (itemId: string) => {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    const newItem = {
      ...item,
      id: String(menuItems.length + 1),
      name: `${item.name} (copie)`,
      orders: 0,
    };

    setMenuItems([...menuItems, newItem]);
    
    // Update category item count
    setCategories(prev => prev.map(cat => 
      cat.name === item.category ? { ...cat, itemCount: cat.itemCount + 1 } : cat
    ));

    toast({
      title: 'Article dupliqué',
      description: `Une copie de ${item.name} a été créée`,
    });
  };

  const openEditDialog = (item: typeof DEMO_MENU_ITEMS[0]) => {
    setEditingItem({ ...item });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Menu</h1>
          <p className="text-muted-foreground">Gérez vos plats et accompagnements</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

      {/* Menu Items */}
      {viewMode === 'grid' ? (
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
                    <span className="text-xs text-muted-foreground">{item.orders} cmdes</span>
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
                      <span>{item.prepTime} min</span>
                      <span>•</span>
                      <span>{item.orders} commandes</span>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un article</DialogTitle>
            <DialogDescription>Ajoutez un nouveau plat ou accompagnement à votre menu</DialogDescription>
          </DialogHeader>
          
          {/* Hidden file input */}
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
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Prix (FCFA) *</Label>
              <Input 
                id="price" 
                type="number" 
                placeholder="3500" 
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
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
            <div className="space-y-2">
              <Label htmlFor="prepTime">Temps de préparation (min)</Label>
              <Input 
                id="prepTime" 
                type="number" 
                placeholder="20" 
                value={newItem.prepTime}
                onChange={(e) => setNewItem({ ...newItem, prepTime: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-4">
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
                category: '',
                price: '',
                description: '',
                prepTime: '',
                isPopular: false,
                isNew: false,
                image: null,
              });
            }}>Annuler</Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600" onClick={addMenuItem}>
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l'article</DialogTitle>
            <DialogDescription>Modifiez les informations de l'article</DialogDescription>
          </DialogHeader>
          
          {/* Hidden file input for edit */}
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Prix (FCFA) *</Label>
                <Input 
                  id="edit-price" 
                  type="number" 
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: parseInt(e.target.value) || 0 })}
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
              <div className="space-y-2">
                <Label htmlFor="edit-prepTime">Temps de préparation (min)</Label>
                <Input 
                  id="edit-prepTime" 
                  type="number" 
                  value={editingItem.prepTime}
                  onChange={(e) => setEditingItem({ ...editingItem, prepTime: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-end gap-4">
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
            <Button className="bg-gradient-to-r from-orange-500 to-red-600" onClick={updateMenuItem}>
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
