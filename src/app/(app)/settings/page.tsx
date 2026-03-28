'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useSettings } from '@/hooks/use-settings';
import { CURRENCIES, COUNTRIES, type CurrencyCode, type CountryCode, type RestaurantInfo } from '@/lib/settings-store';
import {
  Settings,
  Store,
  CreditCard,
  Globe,
  Bell,
  Shield,
  Palette,
  ChefHat,
  Truck,
  Users,
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
  Flag,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

// Feature labels
const FEATURE_LABELS: Record<string, { label: string; description: string }> = {
  pos: { label: 'Point de Vente (POS)', description: 'Système de caisse pour les ventes sur place' },
  deliveries: { label: 'Livraison', description: 'Gestion des livraisons et livreurs' },
  reservations: { label: 'Réservations', description: 'Système de réservation de tables' },
  loyalty: { label: 'Programme Fidélité', description: 'Points et récompenses pour les clients' },
  kitchenDisplay: { label: 'Écran Cuisine (KDS)', description: 'Affichage des commandes en cuisine' },
  analytics: { label: 'Analytics', description: 'Statistiques et rapports de ventes' },
  multiRestaurant: { label: 'Multi-Restaurants', description: 'Gérer plusieurs restaurants' },
  messaging: { label: 'Messagerie', description: 'Chat entre clients, drivers et restaurant' },
  onlinePayment: { label: 'Paiement en Ligne', description: 'Paiement par carte et mobile money' },
  cashPayment: { label: 'Paiement Espèces', description: 'Accepter les paiements en espèces' },
  mobileMoney: { label: 'Mobile Money', description: 'Orange Money, MTN MoMo, Wave, etc.' },
  tips: { label: 'Pourboires', description: 'Permettre aux clients de laisser des pourboires' },
  reviews: { label: 'Avis Clients', description: 'Système de notation et commentaires' },
  promotions: { label: 'Promotions', description: 'Bons plans et codes promo' },
  inventory: { label: 'Inventaire', description: 'Gestion des stocks' },
  staffManagement: { label: 'Gestion Personnel', description: 'Gestion des employés et planning' },
};

export default function SettingsPage() {
  const { toast } = useToast();
  const {
    currency,
    country,
    currentRestaurant,
    features,
    setCurrency,
    setCountry,
    setCurrentRestaurant,
    updateFeature,
    formatCurrency,
  } = useSettings();
  
  const [isSaving, setIsSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // Local restaurant form state
  const [restaurantForm, setRestaurantForm] = useState({
    name: currentRestaurant?.name || 'Le Petit Maquis',
    phone: currentRestaurant?.phone || '+225 07 00 00 00 00',
    email: currentRestaurant?.email || 'contact@restaurant.com',
    address: currentRestaurant?.address || 'Cocody, Riviera 2, Abidjan',
    deliveryFee: currentRestaurant?.deliveryFee || 500,
    minOrderAmount: currentRestaurant?.minOrderAmount || 1000,
    deliveryTimeMin: currentRestaurant?.deliveryTime.min || 25,
    deliveryTimeMax: currentRestaurant?.deliveryTime.max || 45,
    logo: null as string | null,
  });

  // Save restaurant settings
  const saveRestaurantSettings = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setCurrentRestaurant({
      id: currentRestaurant?.id || 'default',
      name: restaurantForm.name,
      slug: currentRestaurant?.slug || 'default',
      phone: restaurantForm.phone,
      email: restaurantForm.email,
      address: restaurantForm.address,
      deliveryFee: restaurantForm.deliveryFee,
      minOrderAmount: restaurantForm.minOrderAmount,
      deliveryTime: {
        min: restaurantForm.deliveryTimeMin,
        max: restaurantForm.deliveryTimeMax,
      },
      openingHours: currentRestaurant?.openingHours || {
        open: '11:00',
        close: '23:00',
        days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
      },
    });
    
    setIsSaving(false);
    toast({
      title: 'Paramètres enregistrés',
      description: 'Les informations du restaurant ont été mises à jour',
    });
  };

  // Save currency/country settings
  const saveLocalizationSettings = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
    
    toast({
      title: 'Localisation mise à jour',
      description: `Devise: ${CURRENCIES[currency].symbol} | Pays: ${COUNTRIES[country].name}`,
    });
  };

  // Save features settings
  const saveFeaturesSettings = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
    
    toast({
      title: 'Fonctionnalités mises à jour',
      description: 'Les modules actifs ont été configurés',
    });
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Erreur', description: 'Veuillez sélectionner un fichier image', variant: 'destructive' });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: 'Erreur', description: 'L\'image ne doit pas dépasser 2 Mo', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setRestaurantForm({ ...restaurantForm, logo: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Count enabled features
  const enabledFeaturesCount = Object.values(features).filter(Boolean).length;
  const totalFeaturesCount = Object.keys(features).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">Configurez votre restaurant</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Flag className="h-3 w-3" />
            {COUNTRIES[country].flag} {COUNTRIES[country].name}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <DollarSign className="h-3 w-3" />
            {CURRENCIES[currency].symbol}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="general" className="gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Restaurant</span>
          </TabsTrigger>
          <TabsTrigger value="localization" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Localisation</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <ToggleRight className="h-4 w-4" />
            <span className="hidden sm:inline">Fonctionnalités</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Paiements</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Restaurant Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations du restaurant</CardTitle>
              <CardDescription>Ces informations apparaîtront sur votre menu et vos reçus</CardDescription>
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
                <div className="flex items-center gap-4">
                  {restaurantForm.logo ? (
                    <div className="relative">
                      <img 
                        src={restaurantForm.logo} 
                        alt="Logo" 
                        className="w-20 h-20 rounded-lg object-cover border"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => setRestaurantForm({ ...restaurantForm, logo: null })}
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
                    value={restaurantForm.name}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={restaurantForm.phone}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={restaurantForm.email}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={restaurantForm.address}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Paramètres de livraison</CardTitle>
              <CardDescription>Configurez les frais et délais de livraison</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frais de livraison</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={restaurantForm.deliveryFee}
                      onChange={(e) => setRestaurantForm({ ...restaurantForm, deliveryFee: parseInt(e.target.value) || 0 })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {CURRENCIES[currency].symbol}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Minimum de commande</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={restaurantForm.minOrderAmount}
                      onChange={(e) => setRestaurantForm({ ...restaurantForm, minOrderAmount: parseInt(e.target.value) || 0 })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {CURRENCIES[currency].symbol}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Délai minimum (min)</Label>
                  <Input
                    type="number"
                    value={restaurantForm.deliveryTimeMin}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, deliveryTimeMin: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Délai maximum (min)</Label>
                  <Input
                    type="number"
                    value={restaurantForm.deliveryTimeMax}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, deliveryTimeMax: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Aperçu:</span> Livraison {formatCurrency(restaurantForm.deliveryFee)} • 
                  Min. {formatCurrency(restaurantForm.minOrderAmount)} • 
                  Délai: {restaurantForm.deliveryTimeMin}-{restaurantForm.deliveryTimeMax} min
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              className="bg-gradient-to-r from-orange-500 to-red-600"
              onClick={saveRestaurantSettings}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" /> 
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </TabsContent>

        {/* Localization Settings */}
        <TabsContent value="localization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Pays et Devise
              </CardTitle>
              <CardDescription>Ces paramètres affectent toute l'application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Country Selection */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Pays</Label>
                <Select value={country} onValueChange={(v) => {
                  setCountry(v as CountryCode);
                  // Auto-set currency based on country
                  const countryCurrency = COUNTRIES[v as CountryCode].currency;
                  if (countryCurrency in CURRENCIES) {
                    setCurrency(countryCurrency as CurrencyCode);
                  }
                }}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COUNTRIES).map(([code, info]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{info.flag}</span>
                          <span>{info.name}</span>
                          <span className="text-muted-foreground">({info.phoneCode})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Le pays détermine l'indicatif téléphonique et la devise par défaut
                </p>
              </div>

              {/* Currency Selection */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Devise</Label>
                <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CURRENCIES).map(([code, info]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-orange-600">{info.symbol}</span>
                          <span>{info.name}</span>
                          <span className="text-muted-foreground">({code})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium mb-2">Aperçu du formatage</p>
                <div className="space-y-1 text-sm">
                  <p>1 article: <span className="font-medium">{formatCurrency(1)}</span></p>
                  <p>1 000: <span className="font-medium">{formatCurrency(1000)}</span></p>
                  <p>12 500: <span className="font-medium">{formatCurrency(12500)}</span></p>
                  <p>1 250 000: <span className="font-medium">{formatCurrency(1250000)}</span></p>
                </div>
              </div>

              {/* Current Settings Summary */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-base py-1 px-3 gap-1">
                  {COUNTRIES[country].flag} {COUNTRIES[country].name}
                </Badge>
                <Badge variant="secondary" className="text-base py-1 px-3 gap-1">
                  <DollarSign className="h-4 w-4" />
                  {CURRENCIES[currency].symbol} ({currency})
                </Badge>
                <Badge variant="secondary" className="text-base py-1 px-3 gap-1">
                  <Phone className="h-4 w-4" />
                  {COUNTRIES[country].phoneCode}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              className="bg-gradient-to-r from-orange-500 to-red-600"
              onClick={saveLocalizationSettings}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" /> 
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </TabsContent>

        {/* Features Settings */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ToggleRight className="h-5 w-5" />
                  Modules & Fonctionnalités
                </span>
                <Badge variant="outline">
                  {enabledFeaturesCount}/{totalFeaturesCount} actifs
                </Badge>
              </CardTitle>
              <CardDescription>Activez ou désactivez les modules selon vos besoins</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(features).map(([key, enabled]) => {
                const featureInfo = FEATURE_LABELS[key] || { label: key, description: '' };
                return (
                  <div key={key} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        enabled 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        {enabled ? (
                          <ToggleRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{featureInfo.label}</p>
                        <p className="text-sm text-muted-foreground">{featureInfo.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(v) => updateFeature(key as keyof typeof features, v)}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              className="bg-gradient-to-r from-orange-500 to-red-600"
              onClick={saveFeaturesSettings}
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
              <CardDescription>Configurez les options de paiement acceptées</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  checked={features.cashPayment}
                  onCheckedChange={(v) => updateFeature('cashPayment', v)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Mobile Money</p>
                    <p className="text-sm text-muted-foreground">Orange Money, MTN MoMo, Wave, M-Pesa</p>
                  </div>
                </div>
                <Switch
                  checked={features.mobileMoney}
                  onCheckedChange={(v) => updateFeature('mobileMoney', v)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Paiement en ligne</p>
                    <p className="text-sm text-muted-foreground">Carte bancaire (Visa, Mastercard)</p>
                  </div>
                </div>
                <Switch
                  checked={features.onlinePayment}
                  onCheckedChange={(v) => updateFeature('onlinePayment', v)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Pourboires</p>
                    <p className="text-sm text-muted-foreground">Permettre aux clients de laisser un pourboire</p>
                  </div>
                </div>
                <Switch
                  checked={features.tips}
                  onCheckedChange={(v) => updateFeature('tips', v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notification</CardTitle>
              <CardDescription>Configurez quand et comment vous êtes notifié</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'orders', label: 'Nouvelles commandes', desc: 'Notification à chaque nouvelle commande' },
                { key: 'deliveries', label: 'Livraisons', desc: 'Mises à jour du statut des livraisons' },
                { key: 'reservations', label: 'Réservations', desc: 'Nouvelles réservations de tables' },
                { key: 'reviews', label: 'Avis clients', desc: 'Nouveaux avis et commentaires' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
