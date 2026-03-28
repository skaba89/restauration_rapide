'use client';

// ============================================
// Restaurant OS - Admin Settings
// Platform-wide configuration settings
// ============================================

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Globe,
  CreditCard,
  Bell,
  Shield,
  Mail,
  Database,
  Key,
  Save,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Demo settings
const DEMO_SETTINGS = {
  platform: {
    name: 'Restaurant OS',
    supportEmail: 'support@restaurant-os.app',
    defaultCurrency: 'XOF',
    defaultLanguage: 'fr',
    defaultCountry: 'CI',
    maintenanceMode: false,
    registrationEnabled: true,
    driverOnboardingEnabled: true,
  },
  payments: {
    orangeMoneyEnabled: true,
    mtnMoMoEnabled: true,
    waveEnabled: true,
    mpesaEnabled: false,
    cardEnabled: true,
    bankTransferEnabled: true,
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    orderNotifications: true,
    reservationNotifications: true,
    marketingEmails: false,
  },
  security: {
    twoFactorRequired: false,
    sessionTimeout: 30,
    passwordMinLength: 8,
    otpExpiry: 5,
  },
};

// Currency options
const CURRENCIES = [
  { code: 'XOF', name: 'Franc CFA (BCEAO)', symbol: 'FCFA' },
  { code: 'XAF', name: 'Franc CFA (BEAC)', symbol: 'FCFA' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

// Language options
const LANGUAGES = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
];

// Country options
const COUNTRIES = [
  { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'SN', name: 'Sénégal' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' },
  { code: 'CM', name: 'Cameroun' },
  { code: 'KE', name: 'Kenya' },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(DEMO_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast({
      title: 'Paramètres enregistrés',
      description: 'Les modifications ont été sauvegardées avec succès.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">Configuration de la plateforme</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Enregistrer
        </Button>
      </div>

      <Tabs defaultValue="platform" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="platform" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Plateforme</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Paiements</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Sécurité</span>
          </TabsTrigger>
        </TabsList>

        {/* Platform Settings */}
        <TabsContent value="platform">
          <Card>
            <CardHeader>
              <CardTitle>Configuration générale</CardTitle>
              <CardDescription>Paramètres globaux de la plateforme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la plateforme</Label>
                  <Input
                    id="name"
                    value={settings.platform.name}
                    onChange={(e) => setSettings({
                      ...settings,
                      platform: { ...settings.platform, name: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Email support</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.platform.supportEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      platform: { ...settings.platform, supportEmail: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Devise par défaut</Label>
                  <Select
                    value={settings.platform.defaultCurrency}
                    onValueChange={(v) => setSettings({
                      ...settings,
                      platform: { ...settings.platform, defaultCurrency: v }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name} ({c.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Langue par défaut</Label>
                  <Select
                    value={settings.platform.defaultLanguage}
                    onValueChange={(v) => setSettings({
                      ...settings,
                      platform: { ...settings.platform, defaultLanguage: v }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l.code} value={l.code}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pays par défaut</Label>
                  <Select
                    value={settings.platform.defaultCountry}
                    onValueChange={(v) => setSettings({
                      ...settings,
                      platform: { ...settings.platform, defaultCountry: v }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mode maintenance</p>
                    <p className="text-sm text-muted-foreground">
                      Désactiver l'accès à la plateforme pour les utilisateurs
                    </p>
                  </div>
                  <Switch
                    checked={settings.platform.maintenanceMode}
                    onCheckedChange={(v) => setSettings({
                      ...settings,
                      platform: { ...settings.platform, maintenanceMode: v }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Inscriptions ouvertes</p>
                    <p className="text-sm text-muted-foreground">
                      Autoriser les nouvelles inscriptions
                    </p>
                  </div>
                  <Switch
                    checked={settings.platform.registrationEnabled}
                    onCheckedChange={(v) => setSettings({
                      ...settings,
                      platform: { ...settings.platform, registrationEnabled: v }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Inscription drivers</p>
                    <p className="text-sm text-muted-foreground">
                      Autoriser l'inscription de nouveaux livreurs
                    </p>
                  </div>
                  <Switch
                    checked={settings.platform.driverOnboardingEnabled}
                    onCheckedChange={(v) => setSettings({
                      ...settings,
                      platform: { ...settings.platform, driverOnboardingEnabled: v }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Moyens de paiement</CardTitle>
              <CardDescription>Configurer les options de paiement disponibles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'orangeMoneyEnabled', name: 'Orange Money', color: 'bg-orange-500' },
                { key: 'mtnMoMoEnabled', name: 'MTN MoMo', color: 'bg-yellow-500' },
                { key: 'waveEnabled', name: 'Wave', color: 'bg-blue-500' },
                { key: 'mpesaEnabled', name: 'M-Pesa', color: 'bg-green-500' },
                { key: 'cardEnabled', name: 'Carte bancaire', color: 'bg-purple-500' },
                { key: 'bankTransferEnabled', name: 'Virement bancaire', color: 'bg-gray-500' },
              ].map((method) => (
                <div key={method.key} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${method.color} flex items-center justify-center`}>
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {settings.payments[method.key as keyof typeof settings.payments] ? 'Activé' : 'Désactivé'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.payments[method.key as keyof typeof settings.payments] as boolean}
                    onCheckedChange={(v) => setSettings({
                      ...settings,
                      payments: { ...settings.payments, [method.key]: v }
                    })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configurer les canaux de notification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'emailEnabled', name: 'Email', icon: Mail },
                  { key: 'smsEnabled', name: 'SMS', icon: Bell },
                  { key: 'pushEnabled', name: 'Push', icon: Bell },
                ].map((channel) => (
                  <div key={channel.key} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <channel.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{channel.name}</span>
                    </div>
                    <Switch
                      checked={settings.notifications[channel.key as keyof typeof settings.notifications] as boolean}
                      onCheckedChange={(v) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, [channel.key]: v }
                      })}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t">
                {[
                  { key: 'orderNotifications', name: 'Notifications de commandes', desc: 'Alertes pour nouvelles commandes' },
                  { key: 'reservationNotifications', name: 'Notifications de réservations', desc: 'Alertes pour nouvelles réservations' },
                  { key: 'marketingEmails', name: 'Emails marketing', desc: 'Newsletters et promotions' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                      onCheckedChange={(v) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, [item.key]: v }
                      })}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité</CardTitle>
              <CardDescription>Paramètres de sécurité de la plateforme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Authentification à deux facteurs requise</p>
                  <p className="text-sm text-muted-foreground">
                    Exiger le 2FA pour tous les comptes administrateur
                  </p>
                </div>
                <Switch
                  checked={settings.security.twoFactorRequired}
                  onCheckedChange={(v) => setSettings({
                    ...settings,
                    security: { ...settings.security, twoFactorRequired: v }
                  })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Délai d'expiration de session (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Longueur minimale du mot de passe</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, passwordMinLength: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otpExpiry">Expiration OTP (minutes)</Label>
                  <Input
                    id="otpExpiry"
                    type="number"
                    value={settings.security.otpExpiry}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, otpExpiry: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
