'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Star,
  Gift,
  Package,
  Heart,
  Bell,
  Lock,
  LogOut,
  Edit2,
  Save,
  Plus,
  Trash2,
  Globe,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const USER_DATA_DEFAULT = {
  firstName: 'Kouamé',
  lastName: 'Jean',
  email: 'kouame.jean@email.com',
  phone: '+225 07 00 00 01',
  address: 'Cocody, Riviera 2, Abidjan',
  avatar: null,
  memberSince: 'Janvier 2024',
  totalOrders: 28,
  totalSpent: 145000,
  loyaltyPoints: 350,
  favoriteRestaurant: 'Le Petit Maquis',
};

const ADDRESSES_DEFAULT = [
  { id: '1', label: 'Domicile', address: 'Cocody, Riviera 2, Abidjan', isDefault: true },
  { id: '2', label: 'Bureau', address: 'Plateau, Rue du Commerce, Abidjan', isDefault: false },
];

const PREFERENCES_DEFAULT = {
  pushNotifications: true,
  emailPromotions: true,
  smsDelivery: true,
  language: 'Français',
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(USER_DATA_DEFAULT);
  const [addresses, setAddresses] = useState(ADDRESSES_DEFAULT);
  const [preferences, setPreferences] = useState(PREFERENCES_DEFAULT);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isNewAddressDialogOpen, setIsNewAddressDialogOpen] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [newAddress, setNewAddress] = useState({ label: '', address: '' });
  const { toast } = useToast();

  const handleSave = () => {
    setIsEditing(false);
    toast({ title: 'Profil mis à jour', description: 'Vos informations ont été enregistrées' });
  };

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      toast({ 
        title: 'Erreur', 
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive',
      });
      return;
    }
    if (passwords.new.length < 8) {
      toast({ 
        title: 'Erreur', 
        description: 'Le mot de passe doit contenir au moins 8 caractères',
        variant: 'destructive',
      });
      return;
    }
    
    setIsPasswordDialogOpen(false);
    setPasswords({ current: '', new: '', confirm: '' });
    toast({ title: 'Mot de passe modifié', description: 'Votre mot de passe a été mis à jour' });
  };

  const handleAddAddress = () => {
    if (!newAddress.label || !newAddress.address) {
      toast({ 
        title: 'Erreur', 
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      });
      return;
    }
    
    setAddresses(prev => [...prev, { 
      id: Date.now().toString(), 
      ...newAddress, 
      isDefault: false 
    }]);
    setIsNewAddressDialogOpen(false);
    setNewAddress({ label: '', address: '' });
    toast({ title: 'Adresse ajoutée', description: 'La nouvelle adresse a été enregistrée' });
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    toast({ title: 'Adresse supprimée', description: 'L\'adresse a été supprimée' });
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === id,
    })));
    toast({ title: 'Adresse par défaut', description: 'L\'adresse par défaut a été modifiée' });
  };

  const handleTogglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast({ 
      title: 'Préférences mises à jour', 
      description: `${key === 'pushNotifications' ? 'Notifications push' : key === 'emailPromotions' ? 'Emails promotionnels' : 'SMS de livraison'} ${!preferences[key] ? 'activé' : 'désactivé'}` 
    });
  };

  const handleLogoutAll = () => {
    toast({ title: 'Déconnexion', description: 'Vous avez été déconnecté de tous les appareils' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Mon Profil</h1>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 text-2xl">
                <AvatarImage src={userData.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-2xl">
                  {userData.firstName[0]}{userData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-bold">{userData.firstName} {userData.lastName}</h2>
              <p className="text-muted-foreground">{userData.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                <Badge className="bg-yellow-100 text-yellow-700">
                  <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                  Gold Member
                </Badge>
                <Badge variant="outline">Membre depuis {userData.memberSince}</Badge>
              </div>
            </div>
            <Button variant="outline" onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
              {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
              {isEditing ? 'Sauvegarder' : 'Modifier'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold">{userData.totalOrders}</p>
            <p className="text-sm text-muted-foreground">Commandes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{userData.loyaltyPoints}</p>
            <p className="text-sm text-muted-foreground">Points</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 mx-auto text-red-500 mb-2" />
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-muted-foreground">Favoris</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="addresses">Adresses</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="preferences">Préférences</TabsTrigger>
        </TabsList>

        {/* Personal Info */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={userData.firstName}
                    disabled={!isEditing}
                    onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={userData.lastName}
                    disabled={!isEditing}
                    onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={userData.email}
                    disabled={!isEditing}
                    className="pl-10"
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={userData.phone}
                    disabled={!isEditing}
                    className="pl-10"
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse principale</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={userData.address}
                    disabled={!isEditing}
                    className="pl-10"
                    onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                  />
                </div>
              </div>
              {isEditing && (
                <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                  Sauvegarder les modifications
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses */}
        <TabsContent value="addresses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Mes adresses</CardTitle>
              <Dialog open={isNewAddressDialogOpen} onOpenChange={setIsNewAddressDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter une adresse</DialogTitle>
                    <DialogDescription>
                      Entrez les informations de votre nouvelle adresse
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="label">Label</Label>
                      <Input
                        id="label"
                        placeholder="Ex: Domicile, Bureau..."
                        value={newAddress.label}
                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newAddress">Adresse</Label>
                      <Input
                        id="newAddress"
                        placeholder="Quartier, Rue, Numéro"
                        value={newAddress.address}
                        onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewAddressDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleAddAddress}>
                      Ajouter
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{addr.label}</p>
                        {addr.isDefault && <Badge variant="secondary">Par défaut</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{addr.address}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!addr.isDefault && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSetDefaultAddress(addr.id)}
                      >
                        Par défaut
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500"
                      onClick={() => handleDeleteAddress(addr.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sécurité du compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Mot de passe</p>
                    <p className="text-sm text-muted-foreground">Dernière modification: il y a 30 jours</p>
                  </div>
                </div>
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Modifier</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Changer le mot de passe</DialogTitle>
                      <DialogDescription>
                        Entrez votre mot de passe actuel et le nouveau mot de passe
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwords.current}
                          onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwords.new}
                          onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwords.confirm}
                          onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button className="bg-orange-500 hover:bg-orange-600" onClick={handlePasswordChange}>
                        Changer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Vérification téléphonique</p>
                    <p className="text-sm text-green-600">Vérifié</p>
                  </div>
                </div>
                <Button variant="outline">Modifier</Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Vérification email</p>
                    <p className="text-sm text-green-600">Vérifié</p>
                  </div>
                </div>
                <Button variant="outline">Renvoyer</Button>
              </div>
              <Separator />
              <Button variant="destructive" className="w-full" onClick={handleLogoutAll}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion de tous les appareils
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Préférences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Notifications push</p>
                    <p className="text-sm text-muted-foreground">Recevoir les alertes de commande</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.pushNotifications}
                  onCheckedChange={() => handleTogglePreference('pushNotifications')}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Emails promotionnels</p>
                    <p className="text-sm text-muted-foreground">Offres exclusives et bons plans</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.emailPromotions}
                  onCheckedChange={() => handleTogglePreference('emailPromotions')}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">SMS de livraison</p>
                    <p className="text-sm text-muted-foreground">Suivi par SMS des commandes</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.smsDelivery}
                  onCheckedChange={() => handleTogglePreference('smsDelivery')}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Langue</p>
                    <p className="text-sm text-muted-foreground">Langue de l'interface</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {preferences.language}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
