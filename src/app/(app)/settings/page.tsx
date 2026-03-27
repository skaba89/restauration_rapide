'use client';

import { useState } from 'react';
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
} from 'lucide-react';

// African countries with currencies
const AFRICAN_COUNTRIES = [
  { code: 'CI', name: 'Côte d\'Ivoire', currency: 'XOF', currencyName: 'Franc CFA' },
  { code: 'SN', name: 'Sénégal', currency: 'XOF', currencyName: 'Franc CFA' },
  { code: 'ML', name: 'Mali', currency: 'XOF', currencyName: 'Franc CFA' },
  { code: 'BF', name: 'Burkina Faso', currency: 'XOF', currencyName: 'Franc CFA' },
  { code: 'GN', name: 'Guinée', currency: 'GNF', currencyName: 'Franc Guinéen' },
  { code: 'CM', name: 'Cameroun', currency: 'XAF', currencyName: 'Franc CFA' },
  { code: 'TG', name: 'Togo', currency: 'XOF', currencyName: 'Franc CFA' },
  { code: 'BJ', name: 'Bénin', currency: 'XOF', currencyName: 'Franc CFA' },
  { code: 'NE', name: 'Niger', currency: 'XOF', currencyName: 'Franc CFA' },
  { code: 'CD', name: 'RD Congo', currency: 'CDF', currencyName: 'Franc Congolais' },
  { code: 'MG', name: 'Madagascar', currency: 'MGA', currencyName: 'Ariary' },
  { code: 'KE', name: 'Kenya', currency: 'KES', currencyName: 'Shilling Kényan' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', currencyName: 'Naira' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', currencyName: 'Cedi' },
];

// Mobile money providers by country
const MOBILE_MONEY_PROVIDERS: Record<string, string[]> = {
  CI: ['Orange Money', 'MTN MoMo', 'Wave', 'Moov Money'],
  SN: ['Orange Money', 'Wave', 'Free Money'],
  GN: ['Orange Money', 'MTN MoMo', 'Cellcom'],
  ML: ['Orange Money', 'Moov Money'],
  BF: ['Orange Money', 'Moov Money'],
  CM: ['Orange Money', 'MTN MoMo'],
  KE: ['M-Pesa', 'Airtel Money'],
  GH: ['MTN MoMo', 'Vodafone Cash', 'AirtelTigo Money'],
  NG: ['Paga', 'OPay', 'PalmPay'],
};

export default function SettingsPage() {
  const [selectedCountry, setSelectedCountry] = useState('CI');
  const [restaurantSettings, setRestaurantSettings] = useState({
    name: 'Restaurant Le Savana',
    phone: '07 00 00 00 01',
    email: 'contact@savana.ci',
    address: 'Cocody, Rue des Jardins',
    city: 'Abidjan',
    currency: 'XOF',
  });

  const [orderSettings, setOrderSettings] = useState({
    autoAccept: false,
    prepTime: 20,
    minOrder: 2500,
    deliveryFee: 1000,
    maxRadius: 10,
  });

  const [paymentSettings, setPaymentSettings] = useState({
    acceptsCash: true,
    acceptsOrangeMoney: true,
    acceptsMTN: true,
    acceptsWave: true,
    acceptsCard: false,
  });

  const [deliverySettings, setDeliverySettings] = useState({
    selfDelivery: true,
    thirdParty: false,
    driverCommission: 70,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Configurez votre restaurant</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="general" className="gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Général</span>
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
                <Globe className="h-5 w-5" />
                Localisation & Devise
              </CardTitle>
              <CardDescription>Configurez votre pays et votre devise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pays</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AFRICAN_COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Select
                    value={restaurantSettings.currency}
                    onValueChange={(v) => setRestaurantSettings({ ...restaurantSettings, currency: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(new Set(AFRICAN_COUNTRIES.map(c => c.currency))).map((currency) => {
                        const country = AFRICAN_COUNTRIES.find(c => c.currency === currency);
                        return (
                          <SelectItem key={currency} value={currency}>
                            {currency} - {country?.currencyName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="secondary" className="gap-1">
                  <DollarSign className="h-3 w-3" />
                  Multi-devises supporté
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Globe className="h-3 w-3" />
                  {AFRICAN_COUNTRIES.length} pays africains
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="bg-gradient-to-r from-orange-500 to-red-600">
              <Save className="h-4 w-4 mr-2" /> Enregistrer
            </Button>
          </div>
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
                  <Label>Minimum de commande (FCFA)</Label>
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
            <Button className="bg-gradient-to-r from-orange-500 to-red-600">
              <Save className="h-4 w-4 mr-2" /> Enregistrer
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
                Moyens de paiement disponibles en {AFRICAN_COUNTRIES.find(c => c.code === selectedCountry)?.name}:
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
                
                {(MOBILE_MONEY_PROVIDERS[selectedCountry] || []).map((provider) => (
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
            <Button className="bg-gradient-to-r from-orange-500 to-red-600">
              <Save className="h-4 w-4 mr-2" /> Enregistrer
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
                  <Label>Frais de livraison (FCFA)</Label>
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
            <Button className="bg-gradient-to-r from-orange-500 to-red-600">
              <Save className="h-4 w-4 mr-2" /> Enregistrer
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
              {[
                { title: 'Nouvelles commandes', desc: 'Être notifié des nouvelles commandes' },
                { title: 'Réservations', desc: 'Être notifié des nouvelles réservations' },
                { title: 'Annulations', desc: 'Être notifié des annulations' },
                { title: 'Rapports quotidiens', desc: 'Recevoir un résumé quotidien par email' },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button className="bg-gradient-to-r from-orange-500 to-red-600">
              <Save className="h-4 w-4 mr-2" /> Enregistrer
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
