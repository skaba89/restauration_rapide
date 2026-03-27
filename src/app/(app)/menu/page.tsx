'use client';

import { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  Wine,
  Cake,
  Grid3X3,
  List,
  Star,
  TrendingUp,
  Package,
  DollarSign,
  Image as ImageIcon,
} from 'lucide-react';

// Demo menu categories and items
const DEMO_CATEGORIES = [
  { id: '1', name: 'Plats Principaux', icon: UtensilsCrossed, itemCount: 12, active: true },
  { id: '2', name: 'Boissons', icon: Coffee, itemCount: 8, active: true },
  { id: '3', name: 'Desserts', icon: Cake, itemCount: 5, active: true },
  { id: '4', name: 'Vins & Alcools', icon: Wine, itemCount: 6, active: false },
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
];

const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} FCFA`;

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [menuItems, setMenuItems] = useState(DEMO_MENU_ITEMS);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleItemAvailability = (itemId: string) => {
    setMenuItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Menu</h1>
          <p className="text-muted-foreground">Gérez vos plats et boissons</p>
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
            {DEMO_CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Categories Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {DEMO_CATEGORIES.map((category) => (
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
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 flex items-center justify-center">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-orange-300" />
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
                      <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Modifier</DropdownMenuItem>
                      <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Dupliquer</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Supprimer</DropdownMenuItem>
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
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="h-8 w-8 text-orange-300" />
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
                    <Switch
                      checked={item.isAvailable}
                      onCheckedChange={() => toggleItemAvailability(item.id)}
                      className="mt-2"
                    />
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
            <DialogDescription>Ajoutez un nouveau plat ou boisson à votre menu</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Nom de l'article</Label>
              <Input id="name" placeholder="Ex: Attieké Poisson Grillé" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {DEMO_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Prix (FCFA)</Label>
              <Input id="price" type="number" placeholder="3500" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Description courte de l'article" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prepTime">Temps de préparation (min)</Label>
              <Input id="prepTime" type="number" placeholder="20" />
            </div>
            <div className="flex items-end gap-4">
              <div className="flex items-center gap-2">
                <Switch id="popular" />
                <Label htmlFor="popular">Populaire</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="new" />
                <Label htmlFor="new">Nouveau</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600" onClick={() => setIsAddDialogOpen(false)}>
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
