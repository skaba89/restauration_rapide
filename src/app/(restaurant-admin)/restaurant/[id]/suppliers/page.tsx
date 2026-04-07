'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { apiGet } from '@/lib/api-client';

interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalOrders: number;
  lastOrder?: string;
}

const DEMO_SUPPLIERS: Supplier[] = [
  {
    id: '1',
    name: 'Poisserie du Port',
    contactName: 'Amadou Koné',
    phone: '+224 620 00 00 01',
    email: 'amadou@poisserie-port.com',
    address: 'Port de Conakry',
    category: 'Poisson',
    status: 'ACTIVE',
    totalOrders: 156,
    lastOrder: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: '2',
    name: 'Legumes Frais SARL',
    contactName: 'Fatou Diallo',
    phone: '+224 620 00 00 02',
    email: 'fatou@legumes-frais.com',
    address: 'Marché de Kaloum',
    category: 'Légumes',
    status: 'ACTIVE',
    totalOrders: 89,
    lastOrder: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: '3',
    name: 'Boucherie Centrale',
    contactName: 'Ibrahim Sylla',
    phone: '+224 620 00 00 03',
    email: 'ibrahim@boucherie-centrale.com',
    address: 'Hamdallaye, Conakry',
    category: 'Viande',
    status: 'INACTIVE',
    totalOrders: 45,
  },
];

export default function RestaurantSuppliersPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const [suppliers, setSuppliers] = useState<Supplier[]>(DEMO_SUPPLIERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, [restaurantId]);

  const loadSuppliers = async () => {
    try {
      const data = await apiGet<any>(`/suppliers?restaurantId=${restaurantId}`);
      if (data?.suppliers?.length > 0) {
        setSuppliers(data.suppliers);
      }
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = suppliers.filter(s => s.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="h-6 w-6 text-orange-500" />
            Fournisseurs
          </h1>
          <p className="text-muted-foreground">
            Gérez vos fournisseurs et leurs informations
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau fournisseur
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{suppliers.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{suppliers.reduce((sum, s) => sum + s.totalOrders, 0)}</p>
                <p className="text-sm text-muted-foreground">Commandes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Liste des fournisseurs</CardTitle>
              <CardDescription>Tous vos fournisseurs en un coup d'œil</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
                    <Truck className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{supplier.name}</h4>
                      <Badge className={
                        supplier.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }>
                        {supplier.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{supplier.category}</span>
                      <span>{supplier.totalOrders} commandes</span>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {supplier.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {supplier.email}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Commander</Button>
                  <Button variant="outline" size="sm">WhatsApp</Button>
                  <Button variant="outline" size="sm">Voir</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
