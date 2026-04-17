'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Bike,
  Phone,
  Star,
  MapPin,
  Clock,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Navigation,
  Shield,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  avatar?: string;
  vehicleType: 'motorcycle' | 'bicycle' | 'car' | 'scooter';
  vehiclePlate: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  isAvailable: boolean;
  isVerified: boolean;
  status: 'online' | 'offline' | 'busy' | 'suspended';
  totalDeliveries: number;
  totalEarnings: number;
  rating: number;
  currentLat?: number;
  currentLng?: number;
  wallet?: { balance: number; pending: number };
  joinedAt: string;
}

const VEHICLE_ICONS: Record<string, string> = {
  motorcycle: '🏍️',
  bicycle: '🚲',
  car: '🚗',
  scooter: '🛵',
};

export function DriverManager() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [newDriver, setNewDriver] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    vehicleType: 'motorcycle' as const,
    vehiclePlate: '',
    vehicleBrand: '',
    vehicleModel: '',
  });

  // Fetch drivers
  const fetchDrivers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        ...(filterStatus !== 'all' && { status: filterStatus }),
      });
      
      const response = await fetch(`/api/drivers?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setDrivers(data.data.data.map((d: any) => ({
          id: d.id,
          firstName: d.firstName,
          lastName: d.lastName,
          phone: d.phone,
          email: d.email,
          avatar: d.avatar,
          vehicleType: d.vehicleType || 'motorcycle',
          vehiclePlate: d.vehiclePlate || '',
          vehicleBrand: d.vehicleBrand,
          vehicleModel: d.vehicleModel,
          isAvailable: d.isAvailable ?? d.status === 'online',
          isVerified: d.isVerified ?? true,
          status: d.status,
          totalDeliveries: d.totalDeliveries || 0,
          totalEarnings: d.totalEarnings || 0,
          rating: d.rating || 5.0,
          currentLat: d.currentLat,
          currentLng: d.currentLng,
          wallet: d.wallet,
          joinedAt: d.createdAt,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // Add driver
  const handleAddDriver = async () => {
    if (!newDriver.firstName || !newDriver.lastName || !newDriver.phone) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    try {
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: 'demo-org-1',
          ...newDriver,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setDrivers(prev => [...prev, {
          id: data.data.id || Date.now().toString(),
          ...newDriver,
          isAvailable: false,
          isVerified: false,
          status: 'offline',
          totalDeliveries: 0,
          totalEarnings: 0,
          rating: 5.0,
          joinedAt: new Date().toISOString(),
        }]);
        setShowAddModal(false);
        setNewDriver({ firstName: '', lastName: '', phone: '', email: '', vehicleType: 'motorcycle', vehiclePlate: '', vehicleBrand: '', vehicleModel: '' });
        toast.success('Livreur ajouté avec succès');
      } else {
        toast.error(data.error || 'Erreur lors de l\'ajout');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  // Toggle availability
  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      await fetch('/api/drivers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isAvailable: !currentStatus }),
      });
      
      setDrivers(prev => prev.map(d => 
        d.id === id ? { ...d, isAvailable: !currentStatus, status: !currentStatus ? 'online' : 'offline' } : d
      ));
      toast.success(`Livreur ${!currentStatus ? 'en ligne' : 'hors ligne'}`);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Verify driver
  const handleVerify = async (id: string) => {
    try {
      await fetch('/api/drivers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isVerified: true }),
      });
      
      setDrivers(prev => prev.map(d => d.id === id ? { ...d, isVerified: true } : d));
      toast.success('Livreur vérifié');
    } catch (error) {
      toast.error('Erreur lors de la vérification');
    }
  };

  // Delete driver
  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce livreur?')) return;
    
    try {
      await fetch(`/api/drivers?id=${id}`, { method: 'DELETE' });
      setDrivers(prev => prev.filter(d => d.id !== id));
      toast.success('Livreur supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const formatCurrency = (value: number) => `${value.toLocaleString('fr-FR')} GNF`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      case 'offline': return 'bg-gray-400';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online': return 'En ligne';
      case 'busy': return 'En livraison';
      case 'offline': return 'Hors ligne';
      case 'suspended': return 'Suspendu';
      default: return status;
    }
  };

  const onlineCount = drivers.filter(d => d.status === 'online').length;
  const busyCount = drivers.filter(d => d.status === 'busy').length;
  const totalEarnings = drivers.reduce((sum, d) => sum + d.totalEarnings, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{onlineCount}</p>
                <p className="text-xs text-gray-500">En ligne</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{busyCount}</p>
                <p className="text-xs text-gray-500">En livraison</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{formatCurrency(totalEarnings)}</p>
                <p className="text-xs text-gray-500">Total gains</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-center gap-2">
            <Button onClick={() => setShowAddModal(true)} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" /> Ajouter
            </Button>
            <Button variant="outline" onClick={fetchDrivers}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Drivers List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Livreurs ({drivers.length})</CardTitle>
            <div className="flex gap-2">
              {['all', 'online', 'busy', 'offline'].map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className={filterStatus === status ? 'bg-orange-500 hover:bg-orange-600' : ''}
                >
                  {status === 'all' ? 'Tous' : getStatusLabel(status)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {drivers.map(driver => (
                <Card key={driver.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={driver.avatar} />
                            <AvatarFallback className="bg-orange-500 text-white">
                              {driver.firstName[0]}{driver.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(driver.status)}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{driver.firstName} {driver.lastName}</span>
                            {!driver.isVerified && (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-400">
                                Non vérifié
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              {VEHICLE_ICONS[driver.vehicleType]} {driver.vehiclePlate || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {driver.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {driver.rating.toFixed(1)}
                            </span>
                          </div>
                          {driver.currentLat && driver.currentLng && (
                            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                              <Navigation className="w-3 h-3" />
                              Position: {driver.currentLat.toFixed(4)}, {driver.currentLng.toFixed(4)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${getStatusColor(driver.status)} text-white`}>
                            {getStatusLabel(driver.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{driver.totalDeliveries} livraisons</p>
                        <p className="text-sm font-semibold text-green-600">{formatCurrency(driver.totalEarnings)}</p>
                        {driver.wallet && (
                          <p className="text-xs text-gray-400">
                            <Wallet className="w-3 h-3 inline mr-1" />
                            Solde: {formatCurrency(driver.wallet.balance)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {!driver.isVerified && (
                          <Button size="sm" variant="outline" onClick={() => handleVerify(driver.id)} title="Vérifier">
                            <Shield className="w-4 h-4 text-green-500" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setSelectedDriver(driver)} title="Voir">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleToggleAvailability(driver.id, driver.isAvailable)}
                          title={driver.isAvailable ? 'Mettre hors ligne' : 'Mettre en ligne'}
                        >
                          <Clock className={`w-4 h-4 ${driver.isAvailable ? 'text-green-500' : 'text-gray-400'}`} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(driver.id)} title="Supprimer">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Driver Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nouveau Livreur</DialogTitle><DialogDescription className="sr-only">Remplissez les informations pour ajouter un nouveau livreur.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Prénom *</Label><Input value={newDriver.firstName} onChange={(e) => setNewDriver(prev => ({ ...prev, firstName: e.target.value }))} /></div>
              <div><Label>Nom *</Label><Input value={newDriver.lastName} onChange={(e) => setNewDriver(prev => ({ ...prev, lastName: e.target.value }))} /></div>
            </div>
            <div><Label>Téléphone *</Label><Input value={newDriver.phone} onChange={(e) => setNewDriver(prev => ({ ...prev, phone: e.target.value }))} placeholder="+224 6XX XXX XXX" /></div>
            <div><Label>Email</Label><Input type="email" value={newDriver.email} onChange={(e) => setNewDriver(prev => ({ ...prev, email: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Véhicule</Label>
                <select 
                  className="w-full border rounded-md p-2"
                  value={newDriver.vehicleType}
                  onChange={(e) => setNewDriver(prev => ({ ...prev, vehicleType: e.target.value as any }))}
                >
                  <option value="motorcycle">🏍️ Moto</option>
                  <option value="bicycle">🚲 Vélo</option>
                  <option value="scooter">🛵 Scooter</option>
                  <option value="car">🚗 Voiture</option>
                </select>
              </div>
              <div><Label>Plaque</Label><Input value={newDriver.vehiclePlate} onChange={(e) => setNewDriver(prev => ({ ...prev, vehiclePlate: e.target.value }))} /></div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Annuler</Button>
              <Button onClick={handleAddDriver} className="bg-orange-500 hover:bg-orange-600">Ajouter</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Driver Details Modal */}
      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Détails du livreur</DialogTitle><DialogDescription className="sr-only">Informations détaillées sur le livreur sélectionné.</DialogDescription></DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-orange-500 text-white text-xl">
                    {selectedDriver.firstName[0]}{selectedDriver.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xl font-semibold">{selectedDriver.firstName} {selectedDriver.lastName}</p>
                  <p className="text-gray-500">{selectedDriver.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-gray-500">Véhicule</Label><p>{VEHICLE_ICONS[selectedDriver.vehicleType]} {selectedDriver.vehicleBrand} {selectedDriver.vehicleModel}</p></div>
                <div><Label className="text-gray-500">Plaque</Label><p>{selectedDriver.vehiclePlate || 'N/A'}</p></div>
                <div><Label className="text-gray-500">Livraisons</Label><p>{selectedDriver.totalDeliveries}</p></div>
                <div><Label className="text-gray-500">Note</Label><p className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {selectedDriver.rating.toFixed(1)}</p></div>
                <div><Label className="text-gray-500">Gains totaux</Label><p className="font-semibold text-green-600">{formatCurrency(selectedDriver.totalEarnings)}</p></div>
                <div><Label className="text-gray-500">Solde wallet</Label><p>{formatCurrency(selectedDriver.wallet?.balance || 0)}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}