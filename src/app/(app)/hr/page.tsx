'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/lib/currency-context';
import {
  Briefcase,
  Search,
  Plus,
  Users,
  UserPlus,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Award,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    on_leave: 'bg-yellow-100 text-yellow-700',
    inactive: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: 'Actif',
    on_leave: 'En congé',
    inactive: 'Inactif',
  };
  return labels[status] || status;
};

const getDepartmentColor = (department: string) => {
  const colors: Record<string, string> = {
    Cuisine: 'bg-orange-100 text-orange-700',
    Service: 'bg-blue-100 text-blue-700',
    Livraison: 'bg-purple-100 text-purple-700',
    Administration: 'bg-green-100 text-green-700',
  };
  return colors[department] || 'bg-gray-100 text-gray-700';
};

export default function HRPage() {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<typeof null | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredEmployees = employees.filter((e) => {
    if (filterDepartment !== 'all' && e.department !== filterDepartment) return false;
    if (searchQuery && !`${e.firstName} ${e.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !e.position.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.status === 'active').length,
    onLeave: employees.filter(e => e.status === 'on_leave').length,
    totalSalary: employees.reduce((sum, e) => sum + e.salary, 0),
    avgPerformance: Math.round(employees.reduce((sum, e) => sum + e.performance, 0) / employees.length),
    pendingLeaves: leaveRequests.filter(l => l.status === 'pending').length,
  };

  const handleLeaveAction = (leaveId: string, action: 'approve' | 'reject') => {
    setLeaveRequests(prev => prev.map(l => 
      l.id === leaveId ? { ...l, status: action === 'approve' ? 'approved' : 'rejected' } : l
    ));
    toast({
      title: action === 'approve' ? 'Congé approuvé' : 'Congé rejeté',
      description: `La demande de congé a été ${action === 'approve' ? 'approuvée' : 'rejetée'}`,
    });
  };

  const openViewDialog = (employee: typeof null) => {
    setSelectedEmployee(employee);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-orange-500" />
            Ressources Humaines
          </h1>
          <p className="text-muted-foreground">Gérez vos employés, congés et performances</p>
        </div>
        <Button className="bg-gradient-to-r from-orange-500 to-red-600" onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Nouvel employé
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
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
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
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
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{formatCurrency(stats.totalSalary)}</p>
                <p className="text-xs text-muted-foreground">Masse salariale/mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgPerformance}%</p>
                <p className="text-xs text-muted-foreground">Performance moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employés</TabsTrigger>
          <TabsTrigger value="leaves">
            Congés
            {stats.pendingLeaves > 0 && (
              <Badge className="ml-2 bg-orange-500">{stats.pendingLeaves}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="attendance">Présences</TabsTrigger>
          <TabsTrigger value="performance">Performances</TabsTrigger>
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un employé..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Département" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les départements</SelectItem>
                <SelectItem value="Cuisine">Cuisine</SelectItem>
                <SelectItem value="Service">Service</SelectItem>
                <SelectItem value="Livraison">Livraison</SelectItem>
                <SelectItem value="Administration">Administration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Employees List */}
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-500px)]">
                <div className="divide-y">
                  {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={employee.avatar ?? undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                            {employee.firstName[0]}{employee.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                            <Badge className={getStatusColor(employee.status)}>
                              {getStatusLabel(employee.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{employee.position}</span>
                            <Badge variant="secondary" className={getDepartmentColor(employee.department)}>
                              {employee.department}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-6 text-center">
                        <div>
                          <p className="font-semibold">{formatCurrency(employee.salary)}</p>
                          <p className="text-xs text-muted-foreground">Salaire/mois</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <p className="font-semibold">{employee.performance}%</p>
                          </div>
                          <Progress value={employee.performance} className="h-1 w-16 mt-1" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openViewDialog(employee)}>
                              <Eye className="h-4 w-4 mr-2" /> Voir profil
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaves Tab */}
        <TabsContent value="leaves" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Demandes de congés</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {leaveRequests.map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        leave.status === 'approved' ? 'bg-green-100' :
                        leave.status === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        {leave.status === 'approved' ? <CheckCircle className="h-5 w-5 text-green-600" /> :
                         leave.status === 'rejected' ? <XCircle className="h-5 w-5 text-red-600" /> :
                         <AlertCircle className="h-5 w-5 text-yellow-600" />}
                      </div>
                      <div>
                        <p className="font-medium">{leave.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{leave.type} • {leave.days} jour(s)</p>
                        <p className="text-xs text-muted-foreground">
                          Du {new Date(leave.startDate).toLocaleDateString('fr-FR')} au {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {leave.status === 'pending' ? (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleLeaveAction(leave.id, 'reject')}>
                            <XCircle className="h-4 w-4 mr-1" /> Rejeter
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleLeaveAction(leave.id, 'approve')}>
                            <CheckCircle className="h-4 w-4 mr-1" /> Approuver
                          </Button>
                        </>
                      ) : (
                        <Badge className={leave.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {leave.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Présences cette semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[].map((day: any) => (
                  <div key={day.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div>
                      <p className="font-medium">{new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{day.present}</p>
                        <p className="text-xs text-muted-foreground">Présents</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-red-600">{day.absent}</p>
                        <p className="text-xs text-muted-foreground">Absents</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-orange-600">{day.late}</p>
                        <p className="text-xs text-muted-foreground">Retards</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{day.onLeave}</p>
                        <p className="text-xs text-muted-foreground">En congé</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {employees.map((employee) => (
              <Card key={employee.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                        {employee.firstName[0]}{employee.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                      <p className="text-sm text-muted-foreground">{employee.position}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Performance globale</span>
                      <span className="font-semibold">{employee.performance}%</span>
                    </div>
                    <Progress value={employee.performance} className="h-2" />
                    <div className="flex items-center gap-2 mt-2">
                      {employee.performance >= 90 && (
                        <Badge className="bg-green-100 text-green-700">Excellent</Badge>
                      )}
                      {employee.performance >= 80 && employee.performance < 90 && (
                        <Badge className="bg-blue-100 text-blue-700">Très bien</Badge>
                      )}
                      {employee.performance >= 70 && employee.performance < 80 && (
                        <Badge className="bg-yellow-100 text-yellow-700">Bien</Badge>
                      )}
                      {employee.performance < 70 && (
                        <Badge className="bg-red-100 text-red-700">À améliorer</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* View Employee Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profil employé</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-xl">
                    {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.position}</p>
                  <Badge className={getStatusColor(selectedEmployee.status)}>
                    {getStatusLabel(selectedEmployee.status)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedEmployee.salary)}</p>
                    <p className="text-xs text-muted-foreground">Salaire mensuel</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">{selectedEmployee.performance}%</p>
                    <p className="text-xs text-muted-foreground">Performance</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <p className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" /> {selectedEmployee.email}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" /> {selectedEmployee.phone}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> {selectedEmployee.address}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" /> Depuis le {selectedEmployee.startDate.toLocaleDateString('fr-FR')}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" /> {selectedEmployee.schedule}
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600">
              Modifier
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel employé</DialogTitle>
            <DialogDescription>Ajoutez un nouvel employé à votre équipe</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" placeholder="Prénom" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" placeholder="Nom" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="email@kfm-delice.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" placeholder="+224 ..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Poste</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chef">Chef Cuisinier</SelectItem>
                    <SelectItem value="assistant">Aide-Cuisinier</SelectItem>
                    <SelectItem value="serveur">Serveur/Serveuse</SelectItem>
                    <SelectItem value="livreur">Livreur</SelectItem>
                    <SelectItem value="comptable">Comptable</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Département</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cuisine">Cuisine</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="livraison">Livraison</SelectItem>
                    <SelectItem value="admin">Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Salaire mensuel (GNF)</Label>
              <Input id="salary" type="number" placeholder="1000000" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600" onClick={() => {
              setIsAddDialogOpen(false);
              toast({ title: 'Employé ajouté', description: 'Le nouvel employé a été ajouté avec succès' });
            }}>
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}