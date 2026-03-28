'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Search,
  Plus,
  Star,
  TrendingUp,
  ShoppingBag,
  Phone,
  Mail,
  Calendar,
  Crown,
  Gift,
  Eye,
  Edit,
  MoreVertical,
  Trash2,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Demo customers data
const DEMO_CUSTOMERS = [
  {
    id: '1',
    name: 'Kouamé Jean',
    email: 'jean.kouame@email.com',
    phone: '07 08 09 10 11',
    totalOrders: 24,
    totalSpent: 185000,
    loyaltyPoints: 1850,
    lastOrder: new Date(Date.now() - 86400000),
    isVip: true,
    avatar: null,
    address: 'Cocody, Riviera 3',
    notes: 'Client régulier, préfère les plats sans piment',
  },
  {
    id: '2',
    name: 'Aya Marie',
    email: 'aya.marie@email.com',
    phone: '05 04 03 02 01',
    totalOrders: 18,
    totalSpent: 142000,
    loyaltyPoints: 1420,
    lastOrder: new Date(Date.now() - 172800000),
    isVip: true,
    avatar: null,
    address: 'Plateau, Avenue 12',
    notes: '',
  },
  {
    id: '3',
    name: 'Koné Ibrahim',
    email: 'ibrahim.kone@email.com',
    phone: '01 02 03 04 05',
    totalOrders: 12,
    totalSpent: 98000,
    loyaltyPoints: 980,
    lastOrder: new Date(Date.now() - 259200000),
    isVip: false,
    avatar: null,
    address: 'Treichville, Rue 12',
    notes: '',
  },
  {
    id: '4',
    name: 'Diallo Fatou',
    email: 'fatou.diallo@email.com',
    phone: '07 12 13 14 15',
    totalOrders: 8,
    totalSpent: 64000,
    loyaltyPoints: 640,
    lastOrder: new Date(Date.now() - 345600000),
    isVip: false,
    avatar: null,
    address: 'Yopougon, Sicogi',
    notes: 'Allergique aux fruits de mer',
  },
  {
    id: '5',
    name: 'Touré Amadou',
    email: 'amadou.toure@email.com',
    phone: '05 22 23 24 25',
    totalOrders: 15,
    totalSpent: 127000,
    loyaltyPoints: 1270,
    lastOrder: new Date(Date.now() - 432000000),
    isVip: false,
    avatar: null,
    address: 'Marcory, Zone 4',
    notes: '',
  },
];

const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} FCFA`;
const formatDate = (date: Date) => new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState(DEMO_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVip, setFilterVip] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<typeof DEMO_CUSTOMERS[0] | null>(null);
  
  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    isVip: false,
    notes: '',
  });

  // Edit customer form state
  const [editCustomer, setEditCustomer] = useState<typeof DEMO_CUSTOMERS[0] | null>(null);

  const filteredCustomers = useMemo(() => {
    let result = [...customers];
    
    if (searchQuery) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
      );
    }
    
    if (filterVip === 'vip') result = result.filter(c => c.isVip);
    if (filterVip === 'regular') result = result.filter(c => !c.isVip);
    
    if (sortBy === 'recent') result.sort((a, b) => b.lastOrder.getTime() - a.lastOrder.getTime());
    if (sortBy === 'spent') result.sort((a, b) => b.totalSpent - a.totalSpent);
    if (sortBy === 'orders') result.sort((a, b) => b.totalOrders - a.totalOrders);
    
    return result;
  }, [customers, searchQuery, filterVip, sortBy]);

  const totalCustomers = customers.length;
  const vipCustomers = customers.filter(c => c.isVip).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = totalRevenue / customers.reduce((sum, c) => sum + c.totalOrders, 0);

  // Add new customer
  const addCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir le nom et le téléphone',
        variant: 'destructive',
      });
      return;
    }

    const customer = {
      id: String(customers.length + 1),
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      address: newCustomer.address,
      notes: newCustomer.notes,
      isVip: newCustomer.isVip,
      totalOrders: 0,
      totalSpent: 0,
      loyaltyPoints: 0,
      lastOrder: new Date(),
      avatar: null,
    };

    setCustomers([customer, ...customers]);
    
    // Reset form
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      address: '',
      isVip: false,
      notes: '',
    });
    setIsAddDialogOpen(false);

    toast({
      title: 'Client ajouté',
      description: `${customer.name} a été ajouté à la base de clients`,
    });
  };

  // Update customer
  const updateCustomer = () => {
    if (!editCustomer) return;

    setCustomers(prev => prev.map(c => 
      c.id === editCustomer.id ? editCustomer : c
    ));

    setIsEditDialogOpen(false);
    setEditCustomer(null);

    toast({
      title: 'Client mis à jour',
      description: 'Les informations du client ont été modifiées',
    });
  };

  // Delete customer
  const deleteCustomer = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    setCustomers(prev => prev.filter(c => c.id !== customerId));

    toast({
      title: 'Client supprimé',
      description: `${customer.name} a été retiré de la base de clients`,
    });
  };

  // Add loyalty points
  const addLoyaltyPoints = (customerId: string, points: number) => {
    setCustomers(prev => prev.map(c => 
      c.id === customerId ? { ...c, loyaltyPoints: c.loyaltyPoints + points } : c
    ));

    const customer = customers.find(c => c.id === customerId);
    toast({
      title: 'Points ajoutés',
      description: `${points} points de fidélité ajoutés à ${customer?.name}`,
    });
  };

  const openEditDialog = (customer: typeof DEMO_CUSTOMERS[0]) => {
    setEditCustomer({ ...customer });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (customer: typeof DEMO_CUSTOMERS[0]) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Gérez votre base de clients</p>
        </div>
        <Button className="bg-gradient-to-r from-orange-500 to-red-600" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCustomers}</p>
                <p className="text-xs text-muted-foreground">Total clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Crown className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vipCustomers}</p>
                <p className="text-xs text-muted-foreground">Clients VIP</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">CA total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(Math.round(avgOrderValue))}</p>
                <p className="text-xs text-muted-foreground">Panier moyen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email, téléphone..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterVip} onValueChange={setFilterVip}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
            <SelectItem value="regular">Réguliers</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Plus récents</SelectItem>
            <SelectItem value="spent">Plus dépenseurs</SelectItem>
            <SelectItem value="orders">Plus de commandes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customers List */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="divide-y">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={customer.avatar ?? undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{customer.name}</p>
                        {customer.isVip && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                            <Crown className="h-3 w-3 mr-1" /> VIP
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {customer.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {customer.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-6 text-center">
                    <div>
                      <p className="font-semibold">{customer.totalOrders}</p>
                      <p className="text-xs text-muted-foreground">Commandes</p>
                    </div>
                    <div>
                      <p className="font-semibold text-green-600">{formatCurrency(customer.totalSpent)}</p>
                      <p className="text-xs text-muted-foreground">Total dépensé</p>
                    </div>
                    <div>
                      <p className="font-semibold text-orange-600">{customer.loyaltyPoints}</p>
                      <p className="text-xs text-muted-foreground">Points</p>
                    </div>
                    <div>
                      <p className="text-sm">{formatDate(customer.lastOrder)}</p>
                      <p className="text-xs text-muted-foreground">Dernière cmd.</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openViewDialog(customer)}>
                        <Eye className="h-4 w-4 mr-2" /> Voir profil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(customer)}>
                        <Edit className="h-4 w-4 mr-2" /> Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addLoyaltyPoints(customer.id, 100)}>
                        <Gift className="h-4 w-4 mr-2" /> Ajouter 100 points
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => deleteCustomer(customer.id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un client</DialogTitle>
            <DialogDescription>Enregistrez un nouveau client dans votre base</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                placeholder="Kouamé Jean"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                placeholder="07 08 09 10 11"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jean.kouame@email.com"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                placeholder="Cocody, Riviera 3"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Préférences, allergies..."
                value={newCustomer.notes}
                onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="vip"
                checked={newCustomer.isVip}
                onCheckedChange={(v) => setNewCustomer({ ...newCustomer, isVip: v })}
              />
              <Label htmlFor="vip">Client VIP</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600" onClick={addCustomer}>
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
            <DialogDescription>Modifiez les informations du client</DialogDescription>
          </DialogHeader>
          {editCustomer && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom complet *</Label>
                <Input
                  id="edit-name"
                  value={editCustomer.name}
                  onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Téléphone *</Label>
                <Input
                  id="edit-phone"
                  value={editCustomer.phone}
                  onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editCustomer.email}
                  onChange={(e) => setEditCustomer({ ...editCustomer, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Adresse</Label>
                <Input
                  id="edit-address"
                  value={editCustomer.address || ''}
                  onChange={(e) => setEditCustomer({ ...editCustomer, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Input
                  id="edit-notes"
                  value={editCustomer.notes || ''}
                  onChange={(e) => setEditCustomer({ ...editCustomer, notes: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="edit-vip"
                  checked={editCustomer.isVip}
                  onCheckedChange={(v) => setEditCustomer({ ...editCustomer, isVip: v })}
                />
                <Label htmlFor="edit-vip">Client VIP</Label>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600" onClick={updateCustomer}>
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profil client</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-xl">
                    {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{selectedCustomer.name}</h3>
                    {selectedCustomer.isVip && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                        <Crown className="h-3 w-3 mr-1" /> VIP
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Client depuis {formatDate(selectedCustomer.lastOrder)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{selectedCustomer.totalOrders}</p>
                    <p className="text-xs text-muted-foreground">Commandes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedCustomer.totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">Total dépensé</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">{selectedCustomer.loyaltyPoints}</p>
                    <p className="text-xs text-muted-foreground">Points fidélité</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{formatCurrency(Math.round(selectedCustomer.totalSpent / Math.max(selectedCustomer.totalOrders, 1)))}</p>
                    <p className="text-xs text-muted-foreground">Panier moyen</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <p className="text-sm"><strong>Email:</strong> {selectedCustomer.email}</p>
                <p className="text-sm"><strong>Téléphone:</strong> {selectedCustomer.phone}</p>
                {selectedCustomer.address && (
                  <p className="text-sm"><strong>Adresse:</strong> {selectedCustomer.address}</p>
                )}
                {selectedCustomer.notes && (
                  <p className="text-sm"><strong>Notes:</strong> {selectedCustomer.notes}</p>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
            <Button 
              className="bg-gradient-to-r from-orange-500 to-red-600"
              onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedCustomer) openEditDialog(selectedCustomer);
              }}
            >
              Modifier
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
