'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Plus,
  MapPin,
  Phone,
  Users,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { apiGet } from '@/lib/api-client';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  managerName?: string;
  staffCount: number;
  openingHours: string;
}

export default function RestaurantBranchesPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBranches();
  }, [restaurantId]);

  const loadBranches = async () => {
    try {
      const data = await apiGet<any>(`/branches?restaurantId=${restaurantId}`);
      if (data?.branches?.length > 0) {
        setBranches(data.branches);
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = branches.filter(b => b.status === 'ACTIVE').length;
  const totalStaff = branches.reduce((sum, b) => sum + b.staffCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-orange-500" />
            Succursales
          </h1>
          <p className="text-muted-foreground">
            Gérez les différentes succursales de votre restaurant
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle succursale
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
                <p className="text-sm text-muted-foreground">Actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{branches.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStaff}</p>
                <p className="text-sm text-muted-foreground">Employés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {branches.map((branch) => (
          <Card key={branch.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{branch.name}</CardTitle>
                <Badge className={
                  branch.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }>
                  {branch.status === 'ACTIVE' ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Actif</>
                  ) : (
                    <><XCircle className="h-3 w-3 mr-1" /> Inactif</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {branch.address}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {branch.phone}
                </div>
                {branch.managerName && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Manager: {branch.managerName}
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">{branch.staffCount} employés</span>
                  <span className="text-muted-foreground">{branch.openingHours}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">Modifier</Button>
                <Button variant="outline" size="sm" className="flex-1">Voir</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}