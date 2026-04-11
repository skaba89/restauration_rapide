'use client';

// ============================================
// Restaurant OS - Admin HR (Human Resources)
// Gestion du personnel
// ============================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Users2,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Plus,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  UserCheck,
  UserX,
  Clock,
  Award,
  Briefcase,
  Truck,
} from 'lucide-react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  restaurant?: { name: string };
  status: string;
  salary: number;
  hireDate: string;
  avatar?: string;
  performance: number;
  attendance: number;
}

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  vehicleType: string;
  status: string;
  isActive: boolean;
  totalDeliveries: number;
  totalEarnings: number;
  rating: number;
  createdAt: string;
}

const roleColors: Record<string, string> = {
  MANAGER: 'bg-purple-100 text-purple-700',
  CHEF: 'bg-orange-100 text-orange-700',
  WAITER: 'bg-blue-100 text-blue-700',
  CASHIER: 'bg-green-100 text-green-700',
  KITCHEN: 'bg-yellow-100 text-yellow-700',
  DELIVERY: 'bg-indigo-100 text-indigo-700',
};

const formatCurrency = (amount: number) => `${amount?.toLocaleString('fr-FR') || 0} FCFA`;
const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR');

export default function AdminHRPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | Driver | null>(null);
  const [activeTab, setActiveTab] = useState('employees');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'WAITER',
    department: 'Service',
    salary: '',
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [empRes, driverRes] = await Promise.all([
          fetch('/api/admin/hr/employees'),
          fetch('/api/admin/hr/drivers'),
        ]);
        
        if (empRes.ok && driverRes.ok) {
          const empData = await empRes.json();
          const driverData = await driverRes.json();
          setEmployees(empData.data || []);
          setDrivers(driverData.data || []);
        } else {
          throw new Error('API error');
        }
      } catch (error) {
        console.error('Error fetching HR data:', error);
        // Demo data for employees
        setEmployees([
          {
            id: '1',
            firstName: 'Amadou',
            lastName: 'Diallo',
            email: 'amadou@kfm-delice.com',
            phone: '+224 622 00 00 01',
            role: 'MANAGER',
            department: 'Administration',
            restaurant: { name: 'KFM DELICE' },
            status: 'ACTIVE',
            salary: 1500000,
            hireDate: '2023-01-15',
            performance: 95,
            attendance: 98,
          },
          {
            id: '2',
            firstName: 'Fatou',
            lastName: 'Ndiaye',
            email: 'fatou@kfm-delice.com',
            phone: '+224 622 00 00 02',
            role: 'CHEF',
            department: 'Cuisine',
            restaurant: { name: 'KFM DELICE' },
            status: 'ACTIVE',
            salary: 800000,
            hireDate: '2023-03-20',
            performance: 88,
            attendance: 95,
          },
          {
            id: '3',
            firstName: 'Kofi',
            lastName: 'Mensah',
            email: 'kofi@kfm-delice.com',
            phone: '+224 622 00 00 03',
            role: 'WAITER',
            department: 'Service',
            restaurant: { name: 'KFM DELICE' },
            status: 'ACTIVE',
            salary: 400000,
            hireDate: '2023-06-10',
            performance: 92,
            attendance: 90,
          },
          {
            id: '4',
            firstName: 'Aisha',
            lastName: 'Bamba',
            email: 'aisha@kfm-delice.com',
            phone: '+224 622 00 00 04',
            role: 'CASHIER',
            department: 'Caisse',
            restaurant: { name: 'KFM DELICE' },
            status: 'ACTIVE',
            salary: 450000,
            hireDate: '2023-08-01',
            performance: 85,
            attendance: 100,
          },
          {
            id: '5',
            firstName: 'Moussa',
            lastName: 'Koné',
            email: 'moussa@kfm-delice.com',
            phone: '+224 622 00 00 05',
            role: 'KITCHEN',
            department: 'Cuisine',
            restaurant: { name: 'KFM DELICE' },
            status: 'ON_LEAVE',
            salary: 350000,
            hireDate: '2023-09-15',
            performance: 78,
            attendance: 85,
          },
        ]);
        
        // Demo data for drivers
        setDrivers([
          {
            id: 'd1',
            firstName: 'Ibrahim',
            lastName: 'Touré',
            phone: '+224 622 00 00 10',
            email: 'ibrahim@driver.com',
            vehicleType: 'motorcycle',
            status: 'AVAILABLE',
            isActive: true,
            totalDeliveries: 1250,
            totalEarnings: 2500000,
            rating: 4.8,
            createdAt: '2023-05-01',
          },
          {
            id: 'd2',
            firstName: 'Mariama',
            lastName: 'Diallo',
            phone: '+224 622 00 00 11',
            vehicleType: 'motorcycle',
            status: 'BUSY',
            isActive: true,
            totalDeliveries: 890,
            totalEarnings: 1780000,
            rating: 4.9,
            createdAt: '2023-07-15',
          },
          {
            id: 'd3',
            firstName: 'Seydou',
            lastName: 'Bamba',
            phone: '+224 622 00 00 12',
            vehicleType: 'bicycle',
            status: 'OFFLINE',
            isActive: false,
            totalDeliveries: 450,
            totalEarnings: 900000,
            rating: 4.5,
            createdAt: '2023-10-01',
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.status === 'ACTIVE').length,
    totalDrivers: drivers.length,
    activeDrivers: drivers.filter(d => d.isActive).length,
    totalSalaries: employees.reduce((sum, e) => sum + e.salary, 0),
    avgPerformance: employees.length > 0 ? Math.round(employees.reduce((sum, e) => sum + e.performance, 0) / employees.length) : 0,
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.email) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch('/api/admin/hr/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEmployee,
          salary: parseFloat(newEmployee.salary) || 0,
          restaurantId: 'demo-restaurant-1',
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmployees([data.data || data, ...employees]);
        setShowAddDialog(false);
        setNewEmployee({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          role: 'WAITER',
          department: 'Service',
          salary: '',
        });
      } else {
        // Add locally if API fails
        const emp: Employee = {
          id: Date.now().toString(),
          firstName: newEmployee.firstName,
          lastName: newEmployee.lastName,
          email: newEmployee.email,
          phone: newEmployee.phone,
          role: newEmployee.role,
          department: newEmployee.department,
          status: 'ACTIVE',
          salary: parseFloat(newEmployee.salary) || 0,
          hireDate: new Date().toISOString(),
          performance: 0,
          attendance: 100,
        };
        setEmployees([emp, ...employees]);
        setShowAddDialog(false);
        setNewEmployee({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          role: 'WAITER',
          department: 'Service',
          salary: '',
        });
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      // Add locally on error
      const emp: Employee = {
        id: Date.now().toString(),
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        email: newEmployee.email,
        phone: newEmployee.phone,
        role: newEmployee.role,
        department: newEmployee.department,
        status: 'ACTIVE',
        salary: parseFloat(newEmployee.salary) || 0,
        hireDate: new Date().toISOString(),
        performance: 0,
        attendance: 100,
      };
      setEmployees([emp, ...employees]);
      setShowAddDialog(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestion RH</h1>
          <p className="text-muted-foreground">Personnel et livreurs</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel employé
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users2 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                <p className="text-xs text-muted-foreground">Employés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeEmployees}</p>
                <p className="text-xs text-muted-foreground">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Truck className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalDrivers}</p>
                <p className="text-xs text-muted-foreground">Livreurs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{formatCurrency(stats.totalSalaries)}</p>
                <p className="text-xs text-muted-foreground">Salaires/mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgPerformance}%</p>
                <p className="text-xs text-muted-foreground">Performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">94%</p>
                <p className="text-xs text-muted-foreground">Présence</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="employees" className="gap-2">
            <Users2 className="h-4 w-4" />
            Employés
          </TabsTrigger>
          <TabsTrigger value="drivers" className="gap-2">
            <Truck className="h-4 w-4" />
            Livreurs
          </TabsTrigger>
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un employé..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="CHEF">Chef</SelectItem>
                    <SelectItem value="WAITER">Serveur</SelectItem>
                    <SelectItem value="CASHIER">Caissier</SelectItem>
                    <SelectItem value="KITCHEN">Cuisine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Employees Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employé</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Département</TableHead>
                        <TableHead>Salaire</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Présence</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map((emp) => (
                        <TableRow key={emp.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {emp.firstName[0]}{emp.lastName[0]}
                              </div>
                              <div>
                                <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                                <p className="text-xs text-muted-foreground">{emp.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={roleColors[emp.role] || ''}>{emp.role}</Badge>
                          </TableCell>
                          <TableCell>{emp.department}</TableCell>
                          <TableCell>{formatCurrency(emp.salary)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={emp.performance} className="w-16 h-2" />
                              <span className="text-sm">{emp.performance}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={emp.attendance} className="w-16 h-2" />
                              <span className="text-sm">{emp.attendance}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={emp.status === 'ACTIVE' ? 'default' : 'secondary'}
                              className={emp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : ''}>
                              {emp.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setSelectedEmployee(emp)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir profil
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Paie
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drivers Tab */}
        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Livreur</TableHead>
                        <TableHead>Véhicule</TableHead>
                        <TableHead>Livraisons</TableHead>
                        <TableHead>Gains totaux</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drivers.map((driver) => (
                        <TableRow key={driver.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                {driver.firstName[0]}{driver.lastName[0]}
                              </div>
                              <div>
                                <p className="font-medium">{driver.firstName} {driver.lastName}</p>
                                <p className="text-xs text-muted-foreground">{driver.phone}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{driver.vehicleType}</Badge>
                          </TableCell>
                          <TableCell>{driver.totalDeliveries}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(driver.totalEarnings)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4 text-yellow-500" />
                              <span>{driver.rating}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={driver.isActive ? 'default' : 'secondary'}
                              className={driver.isActive ? 'bg-green-100 text-green-700' : ''}>
                              {driver.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setSelectedEmployee(driver)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir profil
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Paiements
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Employee Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel employé</DialogTitle>
            <DialogDescription>Ajouter un nouvel employé</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom *</Label>
                <Input 
                  placeholder="Prénom" 
                  value={newEmployee.firstName}
                  onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input 
                  placeholder="Nom" 
                  value={newEmployee.lastName}
                  onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input 
                  type="email"
                  placeholder="email@exemple.com" 
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input 
                  placeholder="+224 622 00 00 00" 
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rôle</Label>
                <Select value={newEmployee.role} onValueChange={(v) => setNewEmployee({...newEmployee, role: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="CHEF">Chef</SelectItem>
                    <SelectItem value="WAITER">Serveur</SelectItem>
                    <SelectItem value="CASHIER">Caissier</SelectItem>
                    <SelectItem value="KITCHEN">Cuisine</SelectItem>
                    <SelectItem value="DELIVERY">Livreur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Département</Label>
                <Select value={newEmployee.department} onValueChange={(v) => setNewEmployee({...newEmployee, department: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Cuisine">Cuisine</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                    <SelectItem value="Caisse">Caisse</SelectItem>
                    <SelectItem value="Livraison">Livraison</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Salaire mensuel (FCFA)</Label>
              <Input 
                type="number"
                placeholder="0" 
                value={newEmployee.salary}
                onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
            <Button onClick={handleAddEmployee} disabled={saving}>
              {saving ? 'Création...' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Detail Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedEmployee && 'firstName' in selectedEmployee 
                ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
                : selectedEmployee && 'totalDeliveries' in selectedEmployee
                ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
                : ''}
            </DialogTitle>
            <DialogDescription>
              {'role' in (selectedEmployee || {}) ? 'Employé' : 'Livreur'}
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              {'role' in selectedEmployee ? (
                // Employee details
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedEmployee.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <p className="font-medium">{selectedEmployee.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rôle</p>
                      <Badge className={roleColors[selectedEmployee.role]}>{selectedEmployee.role}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Salaire</p>
                      <p className="font-medium">{formatCurrency(selectedEmployee.salary)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Performance</p>
                    <Progress value={selectedEmployee.performance} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Présence</p>
                    <Progress value={selectedEmployee.attendance} />
                  </div>
                </>
              ) : (
                // Driver details
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <p className="font-medium">{selectedEmployee.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Véhicule</p>
                      <Badge variant="outline">{selectedEmployee.vehicleType}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Livraisons</p>
                      <p className="font-medium">{selectedEmployee.totalDeliveries}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Note</p>
                      <p className="font-medium">{selectedEmployee.rating}/5</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gains totaux</p>
                    <p className="text-2xl font-bold">{formatCurrency(selectedEmployee.totalEarnings)}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
