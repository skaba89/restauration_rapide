'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Store,
  CreditCard,
  Bell,
  ChefHat,
  Truck,
  DollarSign,
  Save,
  Camera,
  X,
  Plus,
  Building2,
  MapPin,
  Phone,
  Mail,
  Trash2,
  Edit,
  Check,
  Loader2,
} from 'lucide-react';

// Mobile money providers for Guinea
const MOBILE_MONEY_PROVIDERS = ['Orange Money', 'MTN MoMo', 'Cellcom'];

// Demo sites data
const DEMO_SITES = [
  {
    id: '1',
    name: 'Restaurant Le Savana - Cocody',
    address: 'Cocody, Rue des Jardins',
    city: 'Abidjan',
    phone: '07 00 00 00 01',
    email: 'contact@savana-ci.com',
    isMain: true,
    status: 'active',
  },
  {
    id: '2',
    name: 'Restaurant Le Savana - Plateau',
    address: 'Plateau, Avenue 12',
    city: 'Abidjan',
    phone: '07 00 00 00 02',
    email: 'plateau@savana-ci.com',
    isMain: false,
    status: 'active',
  },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // Restaurant settings - fixed to GNF currency
  const [restaurantSettings, setRestaurantSettings] = useState({
    name: 'KFM DELICE',
    phone: '+224 62 00 00 00',
    email: 'contact@kfm-delice.com',
    address: 'Kaloum, Conakry',
    city: 'Conakry',
    currency: 'GNF',
    country: 'GN',
    logo: null as string | null,
  });

  // Load settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Use public settings API which doesn't require parameters
        const response = await fetch('/api/public/settings');
        if (response.ok) {
          const result = await response.json();
          if (result?.success && result?.data) {
            const data = result.data;
            setRestaurantSettings(prev => ({
              ...prev,
              name: data.name || prev.name,
              phone: data.phone || prev.phone,
              email: data.email || prev.email,
              address: data.address || prev.address,
              city: data.city || prev.city,
              logo: data.logo || prev.logo,
            }));
          }
        }
      } catch (error) {
        console.log('Could not load settings from API');
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Order settings
  const [orderSettings, setOrderSettings] = useState({
    autoAccept: false,
    prepTime: 20,
    minOrder: 2500,
    deliveryFee: 1000,
    maxRadius: 10,
  });

  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    acceptsCash: true,
    acceptsOrangeMoney: true,
    acceptsMTN: true,
    acceptsWave: true,
    acceptsCard: false,
  });

  // Delivery settings
  const [deliverySettings, setDeliverySettings] = useState({
    selfDelivery: true,
    thirdParty: false,
    driverCommission: 70,
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    newOrders: true,
    reservations: true,
    cancellations: true,
    dailyReports: true,
  });

  // Sites management
  const [sites, setSites] = useState(DEMO_SITES);
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
  const [newSite, setNewSite] = useState({
    name: '',
    address: '',
    city: 'Abidjan',
    phone: '',
    email: '',
  });

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'Erreur',
          description: 'L\'image ne doit pas dépasser 2 Mo',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setRestaurantSettings({ ...restaurantSettings, logo: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  // Save general settings
  const saveGeneralSettings = async () => {
    setIsSaving(true);
    try {
      // Get organization ID from public settings
      let organizationId = null;
      try {
        const settingsRes = await fetch('/api/public/settings');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          organizationId = settingsData?.data?.id;
        }
      } catch (e) {
        console.log('Could not get organization ID');
      }

      // Save settings to API
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'organization',
          organizationId,
          settings: {
            organization: {
              name: restaurantSettings.name,
              email: restaurantSettings.email,
              phone: restaurantSettings.phone,
              address: restaurantSettings.address,
              city: restaurantSettings.city,
            },
          }
        }),
      });

      if (response.ok) {
        toast({
          title: 'Paramètres enregistrés',
          description: 'Les informations du restaurant ont été mises à jour avec succès.',
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les paramètres',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save order settings
  const saveOrderSettings = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
    
    toast({
      title: 'Paramètres enregistrés',
      description: 'Les paramètres des commandes ont été mis à jour',
    });
  };

  // Save payment settings
  const savePaymentSettings = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
    
    toast({
      title: 'Paramètres enregistrés',
      description: 'Les moyens de paiement ont été mis à jour',
    });
  };

  // Save delivery settings
  const saveDeliverySettings = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
    
    toast({
      title: 'Paramètres enregistrés',
      description: 'Les paramètres de livraison ont été mis à jour',
    });
  };

  // Save notification settings
  const saveNotificationSettings = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
    
    toast({
      title: 'Paramètres enregistrés',
      description: 'Les préférences de notification ont été mises à jour',
    });
  };

  // Add new site
  const addSite = () => {
    if (!newSite.name || !newSite.address || !newSite.phone) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    const site = {
      id: String(sites.length + 1),
      ...newSite,
      isMain: false,
      status: 'active',
    };

    setSites([...sites, site]);
    setNewSite({ name: '', address: '', city: 'Abidjan', phone: '', email: '' });
    setIsAddSiteOpen(false);

    toast({
      title: 'Site ajouté',
      description: `${site.name} a été ajouté à vos établissements`,
    });
  };

  // Delete site
  const deleteSite = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    if (site?.isMain) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le site principal',
        variant: 'destructive',
      });
      return;
    }

    setSites(sites.filter(s => s.id !== siteId));
    toast({
      title: 'Site supprimé',
      description: 'Le site a été retiré de vos établissements',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Configurez votre restaurant</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="general" className="gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Général</span>
          </TabsTrigger>
          <TabsTrigger value="sites" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Sites</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <ChefHat className="h-4 w-4" />
            <span className="hidden sm:inline">Commandes</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Paiements</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Livraison</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations du restaurant</CardTitle>
              <CardDescription>Informations de base de votre établissement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Logo du restaurant</Label>
                <input
                  type="file"
                  ref={logoInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                <div 
                  className="flex items-center gap-4"
                >
                  {restaurantSettings.logo ? (
                    <div className="relative">
                      <img 
                        src={restaurantSettings.logo} 
                        alt="Logo" 
                        className="w-20 h-20 rounded-lg object-cover border"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => setRestaurantSettings({ ...restaurantSettings, logo: null })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <Button variant="outline" onClick={() => logoInputRef.current?.click()}>
                      <Camera className="h-4 w-4 mr-2" /> Changer le logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG jusqu'à 2 Mo</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du restaurant</Label>
                  <Input
                    id="name"
                    value={restaurantSettings.name}
                    onChange={(e) => setRestaurantSettings({ ...restaurantSettings, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={restaurantSettings.phone}
                    onChange={(e) => setRestaurantSettings({ ...restaurantSettings, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={restaurantSettings.email}
                    onChange={(e) => setRestaurantSettings({ ...restaurantSettings, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={restaurantSettings.city}
                    onChange={(e) => setRestaurantSettings({ ...restaurantSettings, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={restaurantSettings.address}
                    onChange={(e) => setRestaurantSettings({ ...restaurantSettings, address: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Devise
              </CardTitle>
              <CardDescription>Devise utilisée pour les transactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg border bg-orange-50 dark:bg-orange-950/20">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium text-lg">GNF - Franc Guinéen</p>
                  <p className="text-sm text-muted-foreground">Guinée (GN)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              className="bg-gradient-to-r from-orange-500 to-red-600"
              onClick={saveGeneralSettings}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" /> 
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </TabsContent>

        {/* Sites Management */}
        <TabsContent value="sites" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestion des sites</CardTitle>
                  <CardDescription>Gérez vos différents établissements</CardDescription>
                </div>
                <Button 
                  className="bg-gradient-to-r from-orange-500 to-red-600"
                  onClick={() => setIsAddSiteOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Ajouter un site
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sites.map((site) => (
                  <div key={site.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{site.name}</p>
                          {site.isMain && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                              Principal
                            </Badge>
                          )}
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <Check className="h-3 w-3 mr-1" /> Actif
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {site.address}, {site.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {site.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" /> Modifier
                      </Button>
                      {!site.isMain && (
                        <Button variant="outline" size="sm" className="text-red-600" onClick={() => deleteSite(site.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Settings */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres des commandes</CardTitle>
              <CardDescription>Configurez le workflow des commandes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Acceptation automatique</p>
                  <p className="text-sm text-muted-foreground">Accepter automatiquement les nouvelles commandes</p>
                </div>
                <Switch
                  checked={orderSettings.autoAccept}
                  onCheckedChange={(v) => setOrderSettings({ ...orderSettings, autoAccept: v })}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Temps de préparation (min)</Label>
                  <Input
                    type="number"
                    value={orderSettings.prepTime}
                    onChange={(e) => setOrderSettings({ ...orderSettings, prepTime: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Minimum de commande (GNF)</Label>
                  <Input
                    type="number"
                    value={orderSettings.minOrder}
                    onChange={(e) => setOrderSettings({ ...orderSettings, minOrder: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button 
              className="bg-gradient-to-r from-orange-500 to-red-600"
              onClick={saveOrderSettings}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" /> 
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </TabsContent>

        {/* Payments Settings */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Moyens de paiement</CardTitle>
              <CardDescription>Activez les moyens de paiement acceptés</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Moyens de paiement disponibles en Guinée:
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Espèces</p>
                      <p className="text-sm text-muted-foreground">Paiement en cash à la livraison</p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentSettings.acceptsCash}
                    onCheckedChange={(v) => setPaymentSettings({ ...paymentSettings, acceptsCash: v })}
                  />
                </div>
                
                {MOBILE_MONEY_PROVIDERS.map((provider) => (
                  <div key={provider} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{provider}</p>
                        <p className="text-sm text-muted-foreground">Paiement mobile money</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
                
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Carte bancaire</p>
                      <p className="text-sm text-muted-foreground">Visa, Mastercard</p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentSettings.acceptsCard}
                    onCheckedChange={(v) => setPaymentSettings({ ...paymentSettings, acceptsCard: v })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button 
              className="bg-gradient-to-r from-orange-500 to-red-600"
              onClick={savePaymentSettings}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" /> 
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </TabsContent>

        {/* Delivery Settings */}
        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de livraison</CardTitle>
              <CardDescription>Configurez vos options de livraison</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frais de livraison (GNF)</Label>
                  <Input
                    type="number"
                    value={orderSettings.deliveryFee}
                    onChange={(e) => setOrderSettings({ ...orderSettings, deliveryFee: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rayon maximum (km)</Label>
                  <Input
                    type="number"
                    value={orderSettings.maxRadius}
                    onChange={(e) => setOrderSettings({ ...orderSettings, maxRadius: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Livraison propre</p>
                  <p className="text-sm text-muted-foreground">Utiliser vos propres drivers</p>
                </div>
                <Switch
                  checked={deliverySettings.selfDelivery}
                  onCheckedChange={(v) => setDeliverySettings({ ...deliverySettings, selfDelivery: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>Commission driver (%)</Label>
                <Input
                  type="number"
                  value={deliverySettings.driverCommission}
                  onChange={(e) => setDeliverySettings({ ...deliverySettings, driverCommission: parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">Pourcentage des frais de livraison reversé au driver</p>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button 
              className="bg-gradient-to-r from-orange-500 to-red-600"
              onClick={saveDeliverySettings}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" /> 
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configurez vos préférences de notification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Nouvelles commandes</p>
                  <p className="text-sm text-muted-foreground">Être notifié des nouvelles commandes</p>
                </div>
                <Switch
                  checked={notificationSettings.newOrders}
                  onCheckedChange={(v) => setNotificationSettings({ ...notificationSettings, newOrders: v })}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Réservations</p>
                  <p className="text-sm text-muted-foreground">Être notifié des nouvelles réservations</p>
                </div>
                <Switch
                  checked={notificationSettings.reservations}
                  onCheckedChange={(v) => setNotificationSettings({ ...notificationSettings, reservations: v })}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Annulations</p>
                  <p className="text-sm text-muted-foreground">Être notifié des annulations</p>
                </div>
                <Switch
                  checked={notificationSettings.cancellations}
                  onCheckedChange={(v) => setNotificationSettings({ ...notificationSettings, cancellations: v })}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Rapports quotidiens</p>
                  <p className="text-sm text-muted-foreground">Recevoir un résumé quotidien par email</p>
                </div>
                <Switch
                  checked={notificationSettings.dailyReports}
                  onCheckedChange={(v) => setNotificationSettings({ ...notificationSettings, dailyReports: v })}
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button 
              className="bg-gradient-to-r from-orange-500 to-red-600"
              onClick={saveNotificationSettings}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" /> 
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Site Dialog */}
      <Dialog open={isAddSiteOpen} onOpenChange={setIsAddSiteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un site</DialogTitle>
            <DialogDescription>Ajoutez un nouvel établissement à votre restaurant</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Nom du site *</Label>
              <Input
                id="site-name"
                placeholder="Restaurant Le Savana - Plateau"
                value={newSite.name}
                onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-address">Adresse *</Label>
              <Input
                id="site-address"
                placeholder="Plateau, Avenue 12"
                value={newSite.address}
                onChange={(e) => setNewSite({ ...newSite, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site-city">Ville</Label>
                <Input
                  id="site-city"
                  value={newSite.city}
                  onChange={(e) => setNewSite({ ...newSite, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-phone">Téléphone *</Label>
                <Input
                  id="site-phone"
                  placeholder="07 00 00 00 00"
                  value={newSite.phone}
                  onChange={(e) => setNewSite({ ...newSite, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-email">Email</Label>
              <Input
                id="site-email"
                type="email"
                placeholder="contact@site.com"
                value={newSite.email}
                onChange={(e) => setNewSite({ ...newSite, email: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddSiteOpen(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600" onClick={addSite}>
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
