'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { User, Mail, Phone, Lock, Bell, Shield, Camera, Save, Globe, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: 'Amadou',
    lastName: 'Diallo',
    email: 'admin@restaurant-os.app',
    phone: '+225 07 00 00 00 01',
    language: 'fr',
    timezone: 'Africa/Abidjan',
  });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handleSaveProfile = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast({ title: 'Profil mis à jour', description: 'Vos informations ont été enregistrées.' });
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setPasswords({ current: '', new: '', confirm: '' });
    toast({ title: 'Mot de passe changé', description: 'Votre mot de passe a été mis à jour.' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mon Profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white">
                  {profile.firstName[0]}{profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <Button size="icon" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{profile.firstName} {profile.lastName}</h2>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary">Administrateur</Badge>
                <Badge variant="outline" className="text-green-600">Vérifié</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info"><User className="h-4 w-4 mr-2" />Informations</TabsTrigger>
          <TabsTrigger value="security"><Shield className="h-4 w-4 mr-2" />Sécurité</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-2" />Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Mettez à jour vos informations de profil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="pl-10" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Langue</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <select value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm">
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fuseau horaire</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <select value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm">
                      <option value="Africa/Abidjan">Africa/Abidjan (GMT+0)</option>
                      <option value="Africa/Dakar">Africa/Dakar (GMT+0)</option>
                      <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
                    </select>
                  </div>
                </div>
              </div>
              <Button onClick={handleSaveProfile} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Changer le mot de passe</CardTitle>
              <CardDescription>Mettez à jour votre mot de passe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mot de passe actuel</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nouveau mot de passe</Label>
                <Input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Confirmer le mot de passe</Label>
                <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
              </div>
              <Button onClick={handleChangePassword} disabled={isLoading}>
                <Lock className="h-4 w-4 mr-2" />Changer le mot de passe
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notifications</CardTitle>
              <CardDescription>Configurez vos notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Nouvelles commandes', desc: 'Recevoir une notification pour chaque commande' },
                { label: 'Réservations', desc: 'Notifications pour les nouvelles réservations' },
                { label: 'Alertes stock', desc: 'Alertes quand le stock est bas' },
                { label: 'Rapports quotidiens', desc: 'Résumé quotidien par email' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={i < 2} />
                </div>
              ))}
              <Button onClick={handleSaveProfile} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
