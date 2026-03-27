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
import {
  User,
  Mail,
  Phone,
  Camera,
  Car,
  Bike,
  Truck,
  Star,
  Package,
  DollarSign,
  Clock,
  FileText,
  Edit2,
  Save,
  Shield,
  Settings,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DRIVER_DATA = {
  firstName: 'Amadou',
  lastName: 'Touré',
  email: 'amadou.toure@driver.com',
  phone: '+2250700000100',
  vehicleType: 'motorcycle',
  plateNumber: 'AB-123-CD',
  rating: 4.8,
  deliveries: 234,
  hoursOnline: 156,
  earnings: 245000,
};

const DOCUMENTS = [
  { id: '1', type: 'Permis de conduire', status: 'valid', expiryDate: '2025-06-15' },
  { id: '2', type: 'Carte d\'identité', status: 'valid', expiryDate: '2028-01-20' },
  { id: '3', type: 'Assurance moto', status: 'expiring', expiryDate: '2024-03-15' },
];

export default function DriverProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [driverData, setDriverData] = useState(DRIVER_DATA);
  const { toast } = useToast();

  const handleSave = () => {
    setIsEditing(false);
    toast({ title: 'Profil mis à jour', description: 'Vos informations ont été enregistrées' });
  };

  const vehicleIcons: Record<string, React.ElementType> = {
    motorcycle: Bike,
    bicycle: Bike,
    car: Car,
    truck: Truck,
  };

  const VehicleIcon = vehicleIcons[driverData.vehicleType] || Bike;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Mon Profil</h1>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 text-2xl">
                <AvatarImage src={driverData.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-2xl">
                  {driverData.firstName[0]}{driverData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-bold">{driverData.firstName} {driverData.lastName}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{driverData.rating}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{driverData.deliveries} livraisons</span>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                <Badge className="bg-yellow-100 text-yellow-700">⭐ Gold Driver</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <VehicleIcon className="h-3 w-3" />
                  {driverData.vehicleType === 'motorcycle' ? 'Moto' : driverData.vehicleType === 'car' ? 'Voiture' : 'Vélo'}
                </Badge>
              </div>
            </div>
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
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
            <Package className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{driverData.deliveries}</p>
            <p className="text-sm text-muted-foreground">Livraisons</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{driverData.hoursOnline}h</p>
            <p className="text-sm text-muted-foreground">En ligne</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{(driverData.earnings / 1000).toFixed(0)}k</p>
            <p className="text-sm text-muted-foreground">FCFA gagnés</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="vehicle">Véhicule</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input
                    value={driverData.firstName}
                    disabled={!isEditing}
                    onChange={(e) => setDriverData({ ...driverData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input
                    value={driverData.lastName}
                    disabled={!isEditing}
                    onChange={(e) => setDriverData({ ...driverData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={driverData.email}
                  disabled={!isEditing}
                  onChange={(e) => setDriverData({ ...driverData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  type="tel"
                  value={driverData.phone}
                  disabled={!isEditing}
                  onChange={(e) => setDriverData({ ...driverData, phone: e.target.value })}
                />
              </div>
              {isEditing && (
                <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600">
                  Sauvegarder
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicle">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations du véhicule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type de véhicule</Label>
                  <div className="flex gap-2">
                    {['motorcycle', 'bicycle', 'car'].map((type) => {
                      const Icon = vehicleIcons[type];
                      return (
                        <Button
                          key={type}
                          variant={driverData.vehicleType === type ? 'default' : 'outline'}
                          className={`flex-1 ${driverData.vehicleType === type ? 'bg-green-500 hover:bg-green-600' : ''}`}
                          disabled={!isEditing}
                          onClick={() => setDriverData({ ...driverData, vehicleType: type })}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {type === 'motorcycle' ? 'Moto' : type === 'car' ? 'Voiture' : 'Vélo'}
                        </Button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Numéro de plaque</Label>
                  <Input
                    value={driverData.plateNumber}
                    disabled={!isEditing}
                    onChange={(e) => setDriverData({ ...driverData, plateNumber: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {DOCUMENTS.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">{doc.type}</p>
                      <p className="text-sm text-muted-foreground">
                        Expire le {new Date(doc.expiryDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <Badge className={
                    doc.status === 'valid' ? 'bg-green-100 text-green-700' :
                    doc.status === 'expiring' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }>
                    {doc.status === 'valid' ? 'Valide' :
                     doc.status === 'expiring' ? 'Expire bientôt' : 'Expiré'}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                Ajouter un document
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
