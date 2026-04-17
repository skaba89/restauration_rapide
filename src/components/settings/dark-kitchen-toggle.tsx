'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  ChefHat,
  Truck,
  Package,
  Timer,
  Users,
  Zap,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Settings2,
} from 'lucide-react';

interface DarkKitchenSettings {
  enabled: boolean;
  deliveryOnly: boolean;
  acceptedOrderTypes: ('delivery' | 'takeaway')[];
  deliveryPartners: string[];
  averagePrepTime: number;
  kitchenCapacity: number;
  maxConcurrentOrders: number;
  autoAssignDrivers: boolean;
  hideDineIn: boolean;
  peakHoursPrepBoost: boolean;
}

const AVAILABLE_PARTNERS = [
  { id: 'orange-money', name: 'Orange Money Delivery' },
  { id: 'jumia-food', name: 'Jumia Food' },
  { id: 'yassir', name: 'Yassir' },
  { id: 'talabat', name: 'Talabat' },
  { id: 'uber-eats', name: 'Uber Eats' },
  { id: 'self', name: 'Livraison propre' },
];

export function DarkKitchenToggle() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<DarkKitchenSettings>({
    enabled: false,
    deliveryOnly: true,
    acceptedOrderTypes: ['delivery', 'takeaway'],
    deliveryPartners: [],
    averagePrepTime: 15,
    kitchenCapacity: 50,
    maxConcurrentOrders: 20,
    autoAssignDrivers: true,
    hideDineIn: true,
    peakHoursPrepBoost: true,
  });

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings/dark-kitchen');
        const data = await response.json();
        if (data.success) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Failed to fetch dark kitchen settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Toggle dark kitchen mode
  const handleToggle = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings/dark-kitchen', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !settings.enabled }),
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
        toast({
          title: data.settings.enabled ? 'Mode Dark Kitchen activé' : 'Mode Dark Kitchen désactivé',
          description: data.message,
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le mode Dark Kitchen',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update specific setting
  const updateSetting = async (key: keyof DarkKitchenSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  // Save all settings
  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings/dark-kitchen', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings }),
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
        toast({
          title: 'Paramètres enregistrés',
          description: 'Les paramètres Dark Kitchen ont été mis à jour',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer les paramètres',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle order type
  const toggleOrderType = (type: 'delivery' | 'takeaway') => {
    const types = settings.acceptedOrderTypes.includes(type)
      ? settings.acceptedOrderTypes.filter(t => t !== type)
      : [...settings.acceptedOrderTypes, type];
    updateSetting('acceptedOrderTypes', types);
  };

  // Toggle delivery partner
  const togglePartner = (partnerName: string) => {
    const partners = settings.deliveryPartners.includes(partnerName)
      ? settings.deliveryPartners.filter(p => p !== partnerName)
      : [...settings.deliveryPartners, partnerName];
    updateSetting('deliveryPartners', partners);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
          <p className="mt-2 text-muted-foreground">Chargement des paramètres...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Toggle Card */}
      <Card className={`border-2 transition-colors ${settings.enabled ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${settings.enabled ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <ChefHat className={`h-6 w-6 ${settings.enabled ? 'text-white' : 'text-slate-500'}`} />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Mode Dark Kitchen
                  {settings.enabled && (
                    <Badge className="bg-orange-500 text-white">
                      Actif
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Activez ce mode pour les cuisines dédiées à la livraison uniquement
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {settings.enabled && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Livraison seule
                </Badge>
              )}
              <Switch
                checked={settings.enabled}
                onCheckedChange={handleToggle}
                disabled={isSaving}
                className="data-[state=checked]:bg-orange-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {settings.enabled && (
            <div className="flex items-center gap-2 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-800 dark:text-orange-200">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">
                Le mode Dark Kitchen est actif. Les commandes sur place sont masquées.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings Configuration */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Types de commandes acceptés
            </CardTitle>
            <CardDescription>
              Sélectionnez les types de commandes à accepter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Livraison</p>
                  <p className="text-sm text-muted-foreground">Commandes livrées au client</p>
                </div>
              </div>
              <Switch
                checked={settings.acceptedOrderTypes.includes('delivery')}
                onCheckedChange={() => toggleOrderType('delivery')}
                disabled={!settings.enabled}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">À emporter</p>
                  <p className="text-sm text-muted-foreground">Retrait par le client</p>
                </div>
              </div>
              <Switch
                checked={settings.acceptedOrderTypes.includes('takeaway')}
                onCheckedChange={() => toggleOrderType('takeaway')}
                disabled={!settings.enabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Kitchen Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Performance cuisine
            </CardTitle>
            <CardDescription>
              Optimisez les temps de préparation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Temps de préparation moyen (min)</Label>
              <Input
                type="number"
                value={settings.averagePrepTime}
                onChange={(e) => updateSetting('averagePrepTime', parseInt(e.target.value) || 15)}
                disabled={!settings.enabled}
              />
            </div>
            <div className="space-y-2">
              <Label>Capacité de la cuisine (commandes/heure)</Label>
              <Input
                type="number"
                value={settings.kitchenCapacity}
                onChange={(e) => updateSetting('kitchenCapacity', parseInt(e.target.value) || 50)}
                disabled={!settings.enabled}
              />
            </div>
            <div className="space-y-2">
              <Label>Commandes simultanées max</Label>
              <Input
                type="number"
                value={settings.maxConcurrentOrders}
                onChange={(e) => updateSetting('maxConcurrentOrders', parseInt(e.target.value) || 20)}
                disabled={!settings.enabled}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium">Boost heures de pointe</p>
                  <p className="text-sm text-muted-foreground">Réduire le temps de prép aux heures de pointe</p>
                </div>
              </div>
              <Switch
                checked={settings.peakHoursPrepBoost}
                onCheckedChange={(v) => updateSetting('peakHoursPrepBoost', v)}
                disabled={!settings.enabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Partners */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Partenaires de livraison
            </CardTitle>
            <CardDescription>
              Sélectionnez vos partenaires de livraison
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {AVAILABLE_PARTNERS.map((partner) => (
                <div key={partner.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="font-medium">{partner.name}</span>
                  <Switch
                    checked={settings.deliveryPartners.includes(partner.name)}
                    onCheckedChange={() => togglePartner(partner.name)}
                    disabled={!settings.enabled}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Driver Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestion des livreurs
            </CardTitle>
            <CardDescription>
              Configurez l'attribution des livreurs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">Attribution automatique</p>
                <p className="text-sm text-muted-foreground">
                  Assigner automatiquement les livreurs aux commandes
                </p>
              </div>
              <Switch
                checked={settings.autoAssignDrivers}
                onCheckedChange={(v) => updateSetting('autoAssignDrivers', v)}
                disabled={!settings.enabled}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">Masquer sur place</p>
                <p className="text-sm text-muted-foreground">
                  Cacher l'option "sur place" dans le menu
                </p>
              </div>
              <Switch
                checked={settings.hideDineIn}
                onCheckedChange={(v) => updateSetting('hideDineIn', v)}
                disabled={!settings.enabled}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          className="bg-gradient-to-r from-orange-500 to-red-600"
          onClick={saveSettings}
          disabled={isSaving || !settings.enabled}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Settings2 className="h-4 w-4 mr-2" />
              Enregistrer les paramètres
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default DarkKitchenToggle;
