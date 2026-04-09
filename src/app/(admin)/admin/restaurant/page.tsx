'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Truck, 
  Save, 
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RestaurantSettings {
  id: string;
  name: string;
  slug: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  isOpen: boolean;
  acceptsDelivery: boolean;
  acceptsTakeaway: boolean;
  acceptsDineIn: boolean;
  deliveryFee: number;
  minOrderAmount: number;
  logo: string | null;
  coverImage: string | null;
  settings?: {
    orderPrepTime: number;
    loyaltyEnabled: boolean;
  };
}

export default function RestaurantSettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    isOpen: true,
    acceptsDelivery: true,
    acceptsTakeaway: true,
    acceptsDineIn: true,
    deliveryFee: '5000',
    minOrderAmount: '10000',
    orderPrepTime: '20',
    loyaltyEnabled: true,
  });

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/restaurant-settings');
      const result = await response.json();
      
      if (result.success && result.data) {
        setSettings(result.data);
        setFormData({
          name: result.data.name || '',
          description: result.data.description || '',
          phone: result.data.phone || '',
          email: result.data.email || '',
          address: result.data.address || '',
          city: result.data.city || '',
          district: result.data.district || '',
          isOpen: result.data.isOpen ?? true,
          acceptsDelivery: result.data.acceptsDelivery ?? true,
          acceptsTakeaway: result.data.acceptsTakeaway ?? true,
          acceptsDineIn: result.data.acceptsDineIn ?? true,
          deliveryFee: result.data.deliveryFee?.toString() || '5000',
          minOrderAmount: result.data.minOrderAmount?.toString() || '10000',
          orderPrepTime: result.data.settings?.orderPrepTime?.toString() || '20',
          loyaltyEnabled: result.data.settings?.loyaltyEnabled ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les paramètres',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/restaurant-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          isOpen: formData.isOpen,
          acceptsDelivery: formData.acceptsDelivery,
          acceptsTakeaway: formData.acceptsTakeaway,
          acceptsDineIn: formData.acceptsDineIn,
          deliveryFee: parseFloat(formData.deliveryFee),
          minOrderAmount: parseFloat(formData.minOrderAmount),
          settings: {
            orderPrepTime: parseInt(formData.orderPrepTime),
            loyaltyEnabled: formData.loyaltyEnabled,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Succès',
          description: 'Paramètres enregistrés avec succès',
        });
        fetchSettings();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de l\'enregistrement',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres du Restaurant</h1>
          <p className="text-gray-500">Gérez les informations de votre restaurant</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/menu/kfm-delice" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir la page publique
            </a>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {formData.isOpen ? (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ouvert
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700">
                  <XCircle className="h-3 w-3 mr-1" />
                  Fermé
                </Badge>
              )}
              <span className="text-sm text-gray-500">
                Ces informations apparaissent sur votre page publique
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isOpen}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isOpen: checked }))}
              />
              <Label>{formData.isOpen ? 'Ouvert' : 'Fermé'}</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du restaurant</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="KFM DELICE"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de votre restaurant"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="h-3 w-3 inline mr-1" />
                Téléphone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+224 623 21 72 40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="h-3 w-3 inline mr-1" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contact@kfm-delice.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Adresse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Nongo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Conakry"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">Quartier</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                  placeholder="Ratoma"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="acceptsDelivery">Livraison</Label>
                <Switch
                  id="acceptsDelivery"
                  checked={formData.acceptsDelivery}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptsDelivery: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="acceptsTakeaway">À emporter</Label>
                <Switch
                  id="acceptsTakeaway"
                  checked={formData.acceptsTakeaway}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptsTakeaway: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="acceptsDineIn">Sur place</Label>
                <Switch
                  id="acceptsDineIn"
                  checked={formData.acceptsDineIn}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptsDineIn: checked }))}
                />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryFee">Frais de livraison (GNF)</Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  value={formData.deliveryFee}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryFee: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minOrderAmount">Minimum commande (GNF)</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Paramètres de commande
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderPrepTime">Temps de préparation moyen (minutes)</Label>
              <Input
                id="orderPrepTime"
                type="number"
                value={formData.orderPrepTime}
                onChange={(e) => setFormData(prev => ({ ...prev, orderPrepTime: e.target.value }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Programme de fidélité</Label>
                <p className="text-sm text-gray-500">Permettre aux clients de cumuler des points</p>
              </div>
              <Switch
                checked={formData.loyaltyEnabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, loyaltyEnabled: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
