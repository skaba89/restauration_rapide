'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Store,
  Globe,
  Clock,
  Truck,
  CreditCard,
  Palette,
  Save,
  Copy,
  ExternalLink,
  CheckCircle,
  Plus,
  Trash2,
  Layout,
} from 'lucide-react';
import { toast } from 'sonner';
import { TemplateSelector } from '@/components/templates';

interface RestaurantSettings {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  phone: string;
  email: string | null;
  website: string | null;
  address: string;
  city: string;
  domain: string | null;
  subdomain: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  templateId: string | null;
  acceptsDelivery: boolean;
  acceptsTakeaway: boolean;
  acceptsDineIn: boolean;
  deliveryFee: number;
  minOrderAmount: number;
  deliveryTime: number;
  isOpen: boolean;
  hours: Array<{
    dayOfWeek: number;
    openTime: string | null;
    closeTime: string | null;
    isClosed: boolean;
  }>;
  deliveryZones: Array<{
    id: string;
    name: string;
    baseFee: number;
    minTime: number;
    maxTime: number;
  }>;
  settings: {
    acceptsCash: boolean;
    acceptsMobileMoney: boolean;
    acceptsCard: boolean;
  } | null;
}

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function RestaurantSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState<RestaurantSettings | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#F97316');
  const [secondaryColor, setSecondaryColor] = useState('#EA580C');
  const [acceptsDelivery, setAcceptsDelivery] = useState(true);
  const [acceptsTakeaway, setAcceptsTakeaway] = useState(true);
  const [acceptsDineIn, setAcceptsDineIn] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState('0');
  const [minOrderAmount, setMinOrderAmount] = useState('0');
  const [deliveryTime, setDeliveryTime] = useState('30');
  const [acceptsCash, setAcceptsCash] = useState(true);
  const [acceptsMobileMoney, setAcceptsMobileMoney] = useState(true);
  const [acceptsCard, setAcceptsCard] = useState(false);
  const [hours, setHours] = useState<Array<{
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>>(DAYS.map(() => ({ openTime: '09:00', closeTime: '22:00', isClosed: false })));
  const [templateId, setTemplateId] = useState<string | null>(null);

  // Fetch restaurant
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await fetch(`/api/public/restaurant/${restaurantId}`);
        if (res.ok) {
          const data = await res.json();
          setRestaurant(data.data);
          // Populate form
          setName(data.data.name || '');
          setDescription(data.data.description || '');
          setPhone(data.data.phone || '');
          setEmail(data.data.email || '');
          setAddress(data.data.address || '');
          setCity(data.data.city || '');
          setSubdomain(data.data.subdomain || '');
          setPrimaryColor(data.data.primaryColor || '#F97316');
          setSecondaryColor(data.data.secondaryColor || '#EA580C');
          setAcceptsDelivery(data.data.acceptsDelivery);
          setAcceptsTakeaway(data.data.acceptsTakeaway);
          setAcceptsDineIn(data.data.acceptsDineIn);
          setDeliveryFee(data.data.deliveryFee?.toString() || '0');
          setMinOrderAmount(data.data.minOrderAmount?.toString() || '0');
          setDeliveryTime(data.data.deliveryTime?.toString() || '30');
          setAcceptsCash(data.data.settings?.acceptsCash ?? true);
          setAcceptsMobileMoney(data.data.settings?.acceptsMobileMoney ?? true);
          setAcceptsCard(data.data.settings?.acceptsCard ?? false);
          setTemplateId(data.data.templateId || null);

          // Hours
          if (data.data.hours?.length) {
            const hoursMap = DAYS.map((_, i) => {
              const h = data.data.hours.find((h: any) => h.dayOfWeek === i);
              return {
                openTime: h?.openTime?.slice(0, 5) || '09:00',
                closeTime: h?.closeTime?.slice(0, 5) || '22:00',
                isClosed: h?.isClosed || false,
              };
            });
            setHours(hoursMap);
          }
        }
      } catch (error) {
        console.error('Failed to fetch restaurant:', error);
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchRestaurant();
    }
  }, [restaurantId]);

  // Save settings
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/restaurants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: restaurantId,
          name,
          description,
          phone,
          email,
          address,
          city,
          subdomain,
          primaryColor,
          secondaryColor,
          acceptsDelivery,
          acceptsTakeaway,
          acceptsDineIn,
          deliveryFee: parseFloat(deliveryFee) || 0,
          minOrderAmount: parseFloat(minOrderAmount) || 0,
          deliveryTime: parseInt(deliveryTime) || 30,
          hours: hours.map((h, i) => ({
            dayOfWeek: i,
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: h.isClosed,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      toast.success('Paramètres sauvegardés');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papiers');
  };

  // Update hour
  const updateHour = (dayIndex: number, field: 'openTime' | 'closeTime' | 'isClosed', value: string | boolean) => {
    setHours((prev) =>
      prev.map((h, i) => (i === dayIndex ? { ...h, [field]: value } : h))
    );
  };

  // Handle template selection
  const handleTemplateSelect = async (newTemplateId: string | null, customColors?: { primary?: string; secondary?: string }) => {
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: newTemplateId,
          customColors,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'assignation du template');
      }

      setTemplateId(newTemplateId);
      if (customColors?.primary) setPrimaryColor(customColors.primary);
      if (customColors?.secondary) setSecondaryColor(customColors.secondary);
      
      toast.success(newTemplateId ? 'Template appliqué avec succès' : 'Template supprimé');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'assignation du template');
      throw error;
    }
  };

  // Handle colors change
  const handleColorsChange = async (colors: { primary: string; secondary: string }) => {
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customColors: colors,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour des couleurs');
      }

      setPrimaryColor(colors.primary);
      setSecondaryColor(colors.secondary);
      toast.success('Couleurs mises à jour');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour des couleurs');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Informations générales', icon: Store },
    { id: 'ordering', label: 'Commandes', icon: Truck },
    { id: 'hours', label: 'Horaires', icon: Clock },
    { id: 'payment', label: 'Paiements', icon: CreditCard },
    { id: 'domain', label: 'Domaine', icon: Globe },
    { id: 'template', label: 'Template', icon: Layout },
    { id: 'theme', label: 'Apparence', icon: Palette },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-500">
            Configurez votre restaurant
          </p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-orange-100 text-orange-700'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>
                Ces informations apparaîtront sur votre page publique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du restaurant *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brève description de votre restaurant"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+224 622 00 00 00"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@restaurant.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adresse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Quartier, Rue, Numéro"
                />
              </div>
              <div>
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Conakry"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ordering Tab */}
      {activeTab === 'ordering' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Types de commande</CardTitle>
              <CardDescription>
                Activez ou désactivez les types de commande
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Livraison</p>
                  <p className="text-sm text-gray-500">
                    Vos clients peuvent se faire livrer
                  </p>
                </div>
                <Switch
                  checked={acceptsDelivery}
                  onCheckedChange={setAcceptsDelivery}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Emporté</p>
                  <p className="text-sm text-gray-500">
                    Vos clients peuvent venir récupérer
                  </p>
                </div>
                <Switch
                  checked={acceptsTakeaway}
                  onCheckedChange={setAcceptsTakeaway}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sur place</p>
                  <p className="text-sm text-gray-500">
                    Vos clients peuvent manger sur place
                  </p>
                </div>
                <Switch
                  checked={acceptsDineIn}
                  onCheckedChange={setAcceptsDineIn}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frais et délais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="deliveryFee">Frais de livraison (GNF)</Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="minOrderAmount">Minimum de commande (GNF)</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="deliveryTime">Temps de livraison estimé (min)</Label>
                <Input
                  id="deliveryTime"
                  type="number"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hours Tab */}
      {activeTab === 'hours' && (
        <Card>
          <CardHeader>
            <CardTitle>Horaires d'ouverture</CardTitle>
            <CardDescription>
              Définissez vos horaires pour chaque jour de la semaine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {DAYS.map((day, i) => (
                <div
                  key={day}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg ${
                    hours[i].isClosed ? 'bg-gray-100' : 'bg-white border'
                  }`}
                >
                  <div className="flex items-center gap-3 w-32">
                    <Switch
                      checked={!hours[i].isClosed}
                      onCheckedChange={(checked) => updateHour(i, 'isClosed', !checked)}
                    />
                    <span className={`font-medium ${hours[i].isClosed ? 'text-gray-400' : ''}`}>
                      {day}
                    </span>
                  </div>
                  {!hours[i].isClosed && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={hours[i].openTime}
                        onChange={(e) => updateHour(i, 'openTime', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-gray-400">à</span>
                      <Input
                        type="time"
                        value={hours[i].closeTime}
                        onChange={(e) => updateHour(i, 'closeTime', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  )}
                  {hours[i].isClosed && (
                    <Badge variant="outline" className="text-gray-400">
                      Fermé
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Tab */}
      {activeTab === 'payment' && (
        <Card>
          <CardHeader>
            <CardTitle>Moyens de paiement</CardTitle>
            <CardDescription>
              Activez les moyens de paiement que vous acceptez
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-medium">Espèces</p>
                  <p className="text-sm text-gray-500">Paiement en espèces à la livraison</p>
                </div>
              </div>
              <Switch
                checked={acceptsCash}
                onCheckedChange={setAcceptsCash}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-medium">Mobile Money</p>
                  <p className="text-sm text-gray-500">Orange Money, MTN MoMo, etc.</p>
                </div>
              </div>
              <Switch
                checked={acceptsMobileMoney}
                onCheckedChange={setAcceptsMobileMoney}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💳</span>
                <div>
                  <p className="font-medium">Carte bancaire</p>
                  <p className="text-sm text-gray-500">Visa, Mastercard, etc.</p>
                </div>
              </div>
              <Switch
                checked={acceptsCard}
                onCheckedChange={setAcceptsCard}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Domain Tab */}
      {activeTab === 'domain' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sous-domaine</CardTitle>
              <CardDescription>
                Votre adresse sur Restaurant OS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subdomain">Sous-domaine</Label>
                <div className="flex">
                  <Input
                    id="subdomain"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="rounded-r-none"
                  />
                  <div className="flex items-center px-3 bg-gray-100 border border-l-0 rounded-r-lg text-gray-500">
                    .restaurant-os.app
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">URL publique</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-white p-2 rounded border">
                    https://{subdomain || 'votre-restaurant'}.restaurant-os.app
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(`https://${subdomain || 'votre-restaurant'}.restaurant-os.app`)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(`https://${subdomain || 'votre-restaurant'}.restaurant-os.app`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Domaine personnalisé</CardTitle>
              <CardDescription>
                Utilisez votre propre nom de domaine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-700">
                  <strong>Fonctionnalité Pro</strong>
                </p>
                <p className="text-sm text-orange-600 mt-1">
                  Connectez votre propre domaine (ex: monrestaurant.com) pour une image professionnelle.
                </p>
                <Button variant="outline" className="mt-3">
                  Configurer un domaine
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Template Tab */}
      {activeTab === 'template' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                Templates de Restaurant
              </CardTitle>
              <CardDescription>
                Choisissez un template pour personnaliser l'apparence de votre restaurant
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templateId && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700">
                    Un template est actuellement appliqué à votre restaurant
                  </span>
                </div>
              )}
              <TemplateSelector
                restaurantId={restaurantId}
                currentTemplateId={templateId}
                currentColors={{
                  primary: primaryColor || '#F97316',
                  secondary: secondaryColor || '#EA580C',
                }}
                onTemplateSelect={handleTemplateSelect}
                onColorsChange={handleColorsChange}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Theme Tab */}
      {activeTab === 'theme' && (
        <Card>
          <CardHeader>
            <CardTitle>Apparence</CardTitle>
            <CardDescription>
              Personnalisez les couleurs de votre page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Couleur principale</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondaryColor">Couleur secondaire</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-500 mb-3">Aperçu</p>
              <div className="flex gap-4 items-center">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                  style={{ backgroundColor: primaryColor }}
                >
                  {name?.charAt(0) || 'R'}
                </div>
                <div>
                  <Button
                    className="text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Commander
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
