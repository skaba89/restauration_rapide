'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Briefcase,
  Plus,
  Search,
  Users,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { apiGet } from '@/lib/api-client';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  hireDate: string;
  salary: number;
}

const DEMO_EMPLOYEES: Employee[] = [
  {
    id: '1',
    firstName: 'Mamadou',
    lastName: 'Diallo',
    email: 'mamadou@kfm-delice.com',
    phone: '+224 620 00 00 01',
    position: 'Chef Cuisinier',
    department: 'Cuisine',
    status: 'ACTIVE',
    hireDate: '2022-03-15',
    salary: 850000,
  },
  {
    id: '2',
    firstName: 'Fatou',
    lastName: 'Bamba',
    email: 'fatou@kfm-delice.com',
    phone: '+224 620 00 00 02',
    position: 'Serveuse',
    department: 'Service',
    status: 'ACTIVE',
    hireDate: '2023-06-01',
    salary: 350000,
  },
  {
    id: '3',
    firstName: 'Ibrahim',
    lastName: 'Koné',
    email: 'ibrahim@kfm-delice.com',
    phone: '+224 620 00 00 03',
    position: 'Commis',
    department: 'Cuisine',
    status: 'ON_LEAVE',
    hireDate: '2023-09-15',
    salary: 280000,
  },
];

export default function RestaurantHRPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const [employees, setEmployees] = useState<Employee[]>(DEMO_EMPLOYEES);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, [restaurantId]);

  const loadEmployees = async () => {
    try {
      const data = await apiGet<any>(`/hr/employees?restaurantId=${restaurantId}`);
      if (data?.employees?.length > 0) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(e =>
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = employees.filter(e => e.status === 'ACTIVE').length;
  const onLeaveCount = employees.filter(e => e.status === 'ON_LEAVE').length;
  const totalSalaries = employees.reduce((sum, e) => sum + e.salary, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-orange-500" />
            Ressources Humaines
          </h1>
          <p className="text-muted-foreground">
            Gérez vos employés et les ressources humaines
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel employé
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
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
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{onLeaveCount}</p>
                <p className="text-sm text-muted-foreground">En congé</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{employees.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(totalSalaries / 1000).toFixed(0)}K</p>
                <p className="text-sm text-muted-foreground">FCFA/mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Employés</CardTitle>
              <CardDescription>Liste de tous les employés</CardDescription>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Nom</th>
                  <th className="text-left py-3 px-2">Poste</th>
                  <th className="text-left py-3 px-2">Département</th>
                  <th className="text-left py-3 px-2">Statut</th>
                  <th className="text-left py-3 px-2">Salaire</th>
                  <th className="text-left py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="border-b">
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                        <p className="text-sm text-muted-foreground">{emp.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2">{emp.position}</td>
                    <td className="py-3 px-2">{emp.department}</td>
                    <td className="py-3 px-2">
                      <Badge className={
                        emp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        emp.status === 'ON_LEAVE' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {emp.status === 'ACTIVE' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {emp.status === 'ON_LEAVE' && <Calendar className="h-3 w-3 mr-1" />}
                        {emp.status === 'INACTIVE' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {emp.status === 'ACTIVE' ? 'Actif' : emp.status === 'ON_LEAVE' ? 'En congé' : 'Inactif'}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">{emp.salary.toLocaleString()} FCFA</td>
                    <td className="py-3 px-2">
                      <Button variant="outline" size="sm">Voir</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
