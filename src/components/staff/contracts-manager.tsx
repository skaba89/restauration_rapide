'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCurrency } from '@/lib/currency-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  FileX,
  Download,
  Calendar,
  Building2,
  User,
  Clock,
  Ban
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

// Types
interface Contract {
  id: string;
  staffId: string;
  staffName: string;
  contractType: string;
  contractTypeLabel: string;
  contractNumber: string;
  title: string;
  startDate: Date | string;
  endDate: Date | string | null;
  trialPeriodDays: number | null;
  salary: number;
  salaryType: string;
  currency: string;
  workingHoursPerWeek: number | null;
  position: string;
  department: string | null;
  benefits: string | null;
  workingDays: string | null;
  noticePeriodDays: number;
  clauses: string | null;
  documentUrl: string | null;
  status: string;
  terminationReason?: string | null;
  terminationDate?: Date | string | null;
  createdAt: Date | string;
}

// Contract type configuration
const CONTRACT_TYPES = [
  { value: 'CDI', label: 'CDI (Durée indéterminée)', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'CDD', label: 'CDD (Durée déterminée)', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'Seasonal', label: 'Saisonnier', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'Internship', label: 'Stage', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'Trial', label: 'Période d\'essai', color: 'bg-orange-100 text-orange-700 border-orange-200' },
];

const STATUS_CONFIG = {
  active: { label: 'Actif', color: 'bg-green-100 text-green-700' },
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
  terminated: { label: 'Résilié', color: 'bg-red-100 text-red-700' },
  expired: { label: 'Expiré', color: 'bg-yellow-100 text-yellow-700' },
};

// Format date
const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR');
};

// Get contract type config
const getContractTypeConfig = (type: string) => 
  CONTRACT_TYPES.find(t => t.value === type) || CONTRACT_TYPES[0];

export function ContractsManager() {
  const { formatCurrency } = useCurrency();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isTerminateDialogOpen, setIsTerminateDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [terminationReason, setTerminationReason] = useState('');

  // Stats
  const totalContracts = contracts.length;
  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const cdiContracts = contracts.filter(c => c.contractType === 'CDI' && c.status === 'active').length;
  const cddContracts = contracts.filter(c => c.contractType === 'CDD' && c.status === 'active').length;

  // Filter contracts
  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || c.contractType === selectedType;
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle terminate
  const handleTerminate = () => {
    if (!selectedContract) return;
    setContracts(contracts.map(c => 
      c.id === selectedContract.id 
        ? { ...c, status: 'terminated', terminationReason, terminationDate: new Date() }
        : c
    ));
    setIsTerminateDialogOpen(false);
    setSelectedContract(null);
    setTerminationReason('');
  };

  // Export contracts
  const handleExport = () => {
    const csv = [
      ['N°', 'Employé', 'Type', 'Poste', 'Salaire', 'Date début', 'Date fin', 'Statut'].join(','),
      ...filteredContracts.map(c => [
        c.contractNumber,
        c.staffName,
        c.contractType,
        c.position,
        c.salary.toString(),
        formatDate(c.startDate),
        c.endDate ? formatDate(c.endDate) : 'Indéterminée',
        c.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contrats.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total contrats</p>
                <p className="text-2xl font-bold">{totalContracts}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actifs</p>
                <p className="text-2xl font-bold text-green-600">{activeContracts}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CDI</p>
                <p className="text-2xl font-bold text-purple-600">{cdiContracts}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CDD</p>
                <p className="text-2xl font-bold text-amber-600">{cddContracts}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Contrats de travail</CardTitle>
              <CardDescription>{filteredContracts.length} contrat(s)</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                Exporter
              </Button>
              <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Nouveau contrat
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un contrat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {CONTRACT_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="terminated">Résilié</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Contrat</TableHead>
                  <TableHead>Employé</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead className="text-right">Salaire</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map(contract => {
                  const typeConfig = getContractTypeConfig(contract.contractType);
                  const statusConfig = STATUS_CONFIG[contract.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.active;
                  
                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="font-mono text-sm">{contract.contractNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-medium">
                            {contract.staffName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium">{contract.staffName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={typeConfig.color}>{contract.contractType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{contract.position}</p>
                          {contract.department && <p className="text-sm text-muted-foreground">{contract.department}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-medium">{formatCurrency(contract.salary)}</p>
                        <p className="text-sm text-muted-foreground">
                          {contract.salaryType === 'monthly' ? '/mois' : contract.salaryType === 'hourly' ? '/heure' : contract.salaryType === 'daily' ? '/jour' : '/semaine'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">Du {formatDate(contract.startDate)}</p>
                          <p className="text-sm text-muted-foreground">
                            {contract.endDate ? `Au ${formatDate(contract.endDate)}` : 'Indéterminée'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
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
                            <DropdownMenuItem onClick={() => { setSelectedContract(contract); setIsViewDialogOpen(true); }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            {contract.status === 'active' && (
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => { setSelectedContract(contract); setIsTerminateDialogOpen(true); }}
                              >
                                <FileX className="h-4 w-4 mr-2" />
                                Résilier
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du contrat</DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">N° Contrat</p>
                    <p className="font-mono text-lg font-bold">{selectedContract.contractNumber}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge variant="outline" className={getContractTypeConfig(selectedContract.contractType).color}>
                      {selectedContract.contractTypeLabel}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2"><User className="h-4 w-4" /> Employé</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nom</p>
                    <p className="font-medium">{selectedContract.staffName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Poste</p>
                    <p className="font-medium">{selectedContract.position}</p>
                  </div>
                  {selectedContract.department && (
                    <div>
                      <p className="text-muted-foreground">Département</p>
                      <p className="font-medium">{selectedContract.department}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" /> Période</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date de début</p>
                    <p className="font-medium">{formatDate(selectedContract.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date de fin</p>
                    <p className="font-medium">{selectedContract.endDate ? formatDate(selectedContract.endDate) : 'Indéterminée'}</p>
                  </div>
                  {selectedContract.trialPeriodDays && (
                    <div>
                      <p className="text-muted-foreground">Période d'essai</p>
                      <p className="font-medium">{selectedContract.trialPeriodDays} jours</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Préavis</p>
                    <p className="font-medium">{selectedContract.noticePeriodDays} jours</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2"><Building2 className="h-4 w-4" /> Conditions</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Salaire</p>
                    <p className="font-medium text-lg">{formatCurrency(selectedContract.salary)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type de paiement</p>
                    <p className="font-medium">{selectedContract.salaryType === 'monthly' ? 'Mensuel' : selectedContract.salaryType === 'hourly' ? 'Horaire' : selectedContract.salaryType === 'daily' ? 'Journalier' : 'Hebdomadaire'}</p>
                  </div>
                  {selectedContract.workingHoursPerWeek && (
                    <div>
                      <p className="text-muted-foreground">Heures/semaine</p>
                      <p className="font-medium">{selectedContract.workingHoursPerWeek}h</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedContract.terminationReason && (
                <div className="p-4 bg-red-50 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-red-700">Contrat résilié</p>
                  <p className="text-sm text-red-600">Raison: {selectedContract.terminationReason}</p>
                  {selectedContract.terminationDate && (
                    <p className="text-sm text-red-600">Date: {formatDate(selectedContract.terminationDate)}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Terminate Dialog */}
      <Dialog open={isTerminateDialogOpen} onOpenChange={setIsTerminateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Résilier le contrat</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir résilier le contrat de {selectedContract?.staffName} ?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Raison de la résiliation</Label>
              <Textarea
                id="reason"
                value={terminationReason}
                onChange={(e) => setTerminationReason(e.target.value)}
                placeholder="Démission, licenciement, fin de contrat..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleTerminate}>
              Résilier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ContractsManager;