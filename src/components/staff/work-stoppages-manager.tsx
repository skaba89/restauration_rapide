'use client';

import { useState } from 'react';
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
  AlertOctagon,
  Plus,
  MoreHorizontal,
  Eye,
  CalendarPlus,
  UserCheck,
  XCircle,
  Activity,
  HeartPulse,
  Baby,
  Stethoscope,
  Calendar
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

// Types
interface WorkStoppage {
  id: string;
  staffId: string;
  staffName: string;
  type: string;
  typeLabel: string;
  startDate: Date | string;
  endDate: Date | string;
  durationDays: number;
  reason: string | null;
  medicalCertificateUrl: string | null;
  certificateNumber: string | null;
  prescribedBy: string | null;
  hospitalName: string | null;
  status: string;
  statusLabel: string;
  extendedFrom: string | null;
  extensionCount: number;
  socialSecurityNotified: boolean;
  socialSecurityRef: string | null;
  approvedBy: string | null;
  approvedAt: Date | string | null;
  notes: string | null;
  createdAt: Date | string;
}

// Stoppage type configuration
const STOPPAGE_TYPES = [
  { value: 'sick_leave', label: 'Maladie', icon: HeartPulse, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'work_accident', label: 'Accident de travail', icon: AlertOctagon, color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'occupational_disease', label: 'Maladie professionnelle', icon: Stethoscope, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'maternity', label: 'Maternité', icon: Baby, color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { value: 'paternity', label: 'Paternité', icon: Baby, color: 'bg-blue-100 text-blue-700 border-blue-200' },
];

const STATUS_CONFIG = {
  active: { label: 'En cours', color: 'bg-yellow-100 text-yellow-700' },
  extended: { label: 'Prolongé', color: 'bg-orange-100 text-orange-700' },
  returned: { label: 'Revenu', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Annulé', color: 'bg-gray-100 text-gray-700' },
};

// Demo data
const DEMO_STOPPAGES: WorkStoppage[] = [
  { id: '1', staffId: '3', staffName: 'Ibrahim Keita', type: 'sick_leave', typeLabel: 'Maladie', startDate: new Date('2024-05-20'), endDate: new Date('2024-05-23'), durationDays: 4, reason: 'Grippe saisonnière', medicalCertificateUrl: '/documents/cert-maladie-001.pdf', certificateNumber: 'CERT-2024-05-001', prescribedBy: 'Dr. Mamadou Bah', hospitalName: 'Clinique Pasteur', status: 'active', statusLabel: 'En cours', extendedFrom: null, extensionCount: 0, socialSecurityNotified: true, socialSecurityRef: 'SS-2024-05-1234', approvedBy: 'Amadou Diallo', approvedAt: new Date('2024-05-20'), notes: null, createdAt: new Date('2024-05-20') },
  { id: '2', staffId: '4', staffName: 'Marie Koulibaly', type: 'sick_leave', typeLabel: 'Maladie', startDate: new Date('2024-05-10'), endDate: new Date('2024-05-11'), durationDays: 2, reason: 'Consultation médicale', medicalCertificateUrl: '/documents/cert-maladie-002.pdf', certificateNumber: 'CERT-2024-05-002', prescribedBy: 'Dr. Aminata Diallo', hospitalName: 'Centre de Santé Matam', status: 'returned', statusLabel: 'Revenu', extendedFrom: null, extensionCount: 0, socialSecurityNotified: false, socialSecurityRef: null, approvedBy: 'Amadou Diallo', approvedAt: new Date('2024-05-10'), notes: null, createdAt: new Date('2024-05-10') },
  { id: '3', staffId: '5', staffName: 'Moussa Camara', type: 'work_accident', typeLabel: 'Accident de travail', startDate: new Date('2024-04-25'), endDate: new Date('2024-04-30'), durationDays: 6, reason: 'Chute de moto en livraison', medicalCertificateUrl: '/documents/cert-accident-001.pdf', certificateNumber: 'ACC-2024-04-001', prescribedBy: 'Dr. Ibrahima Sylla', hospitalName: 'Hôpital National Ignace Deen', status: 'returned', statusLabel: 'Revenu', extendedFrom: null, extensionCount: 0, socialSecurityNotified: true, socialSecurityRef: 'ACC-TRAV-2024-056', approvedBy: 'Amadou Diallo', approvedAt: new Date('2024-04-25'), notes: 'Accident de travail - Déclaration effectuée', createdAt: new Date('2024-04-25') },
  { id: '4', staffId: '6', staffName: 'Aissatou Traore', type: 'maternity', typeLabel: 'Maternité', startDate: new Date('2024-06-01'), endDate: new Date('2024-08-31'), durationDays: 92, reason: 'Congé de maternité', medicalCertificateUrl: '/documents/cert-maternite-001.pdf', certificateNumber: 'MAT-2024-001', prescribedBy: 'Dr. Fatoumata Keita', hospitalName: 'Clinique Sainte-Marie', status: 'active', statusLabel: 'En cours', extendedFrom: null, extensionCount: 0, socialSecurityNotified: true, socialSecurityRef: 'MAT-SEC-2024-089', approvedBy: 'Admin', approvedAt: new Date('2024-05-15'), notes: 'Accouchement prévu fin juin', createdAt: new Date('2024-05-15') },
  { id: '5', staffId: '7', staffName: 'Sekou Konate', type: 'sick_leave', typeLabel: 'Maladie', startDate: new Date('2024-04-15'), endDate: new Date('2024-04-17'), durationDays: 3, reason: 'Paludisme', medicalCertificateUrl: '/documents/cert-maladie-003.pdf', certificateNumber: 'CERT-2024-04-003', prescribedBy: 'Dr. Moussa Conde', hospitalName: 'Centre de Santé Dixinn', status: 'returned', statusLabel: 'Revenu', extendedFrom: null, extensionCount: 0, socialSecurityNotified: false, socialSecurityRef: null, approvedBy: 'Amadou Diallo', approvedAt: new Date('2024-04-15'), notes: null, createdAt: new Date('2024-04-15') },
];

// Format date
const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR');
};

export function WorkStoppagesManager() {
  const [stoppages, setStoppages] = useState<WorkStoppage[]>(DEMO_STOPPAGES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [selectedStoppage, setSelectedStoppage] = useState<WorkStoppage | null>(null);
  const [extendDate, setExtendDate] = useState('');
  const [extendNotes, setExtendNotes] = useState('');

  // Stats
  const totalStoppages = stoppages.length;
  const activeStoppages = stoppages.filter(s => s.status === 'active').length;
  const currentDays = stoppages
    .filter(s => s.status === 'active')
    .reduce((acc, s) => acc + s.durationDays, 0);
  const accidents = stoppages.filter(s => s.type === 'work_accident').length;

  // Filter stoppages
  const filteredStoppages = stoppages.filter(s => {
    const matchesSearch = s.staffName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || s.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle extend
  const handleExtend = () => {
    if (!selectedStoppage || !extendDate) return;
    const newEndDate = new Date(extendDate);
    const startDate = new Date(selectedStoppage.startDate);
    const newDurationDays = Math.ceil((newEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    setStoppages(stoppages.map(s => 
      s.id === selectedStoppage.id 
        ? { 
            ...s, 
            endDate: newEndDate, 
            durationDays: newDurationDays,
            status: 'extended',
            statusLabel: 'Prolongé',
            extensionCount: s.extensionCount + 1,
            notes: extendNotes || s.notes
          }
        : s
    ));
    setIsExtendDialogOpen(false);
    setSelectedStoppage(null);
    setExtendDate('');
    setExtendNotes('');
  };

  // Handle return
  const handleReturn = (stoppage: WorkStoppage) => {
    setStoppages(stoppages.map(s => 
      s.id === stoppage.id 
        ? { ...s, status: 'returned', statusLabel: 'Revenu' }
        : s
    ));
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total arrêts</p>
                <p className="text-2xl font-bold">{totalStoppages}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold text-yellow-600">{activeStoppages}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <HeartPulse className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jours en cours</p>
                <p className="text-2xl font-bold text-blue-600">{currentDays}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accidents de travail</p>
                <p className="text-2xl font-bold text-red-600">{accidents}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertOctagon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stoppages List Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Arrêts de travail</CardTitle>
              <CardDescription>{filteredStoppages.length} arrêt(s)</CardDescription>
            </div>
            <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Nouvel arrêt
            </Button>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <input
                placeholder="Rechercher un employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {STOPPAGE_TYPES.map(t => (
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
                <SelectItem value="active">En cours</SelectItem>
                <SelectItem value="extended">Prolongé</SelectItem>
                <SelectItem value="returned">Revenu</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Médecin</TableHead>
                  <TableHead>Sécu. sociale</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStoppages.map(stoppage => {
                  const typeConfig = STOPPAGE_TYPES.find(t => t.value === stoppage.type) || STOPPAGE_TYPES[0];
                  const statusConfig = STATUS_CONFIG[stoppage.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.active;
                  
                  return (
                    <TableRow key={stoppage.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-medium">
                            {stoppage.staffName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium">{stoppage.staffName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={typeConfig.color}>{stoppage.typeLabel}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(stoppage.startDate)}</p>
                          <p className="text-muted-foreground">au {formatDate(stoppage.endDate)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{stoppage.durationDays} jours</p>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {stoppage.prescribedBy && <p>{stoppage.prescribedBy}</p>}
                          {stoppage.hospitalName && <p className="text-muted-foreground">{stoppage.hospitalName}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {stoppage.socialSecurityNotified ? (
                          <Badge className="bg-green-100 text-green-700">
                            {stoppage.socialSecurityRef || 'Notifié'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Non notifié</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>{stoppage.statusLabel}</Badge>
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
                            <DropdownMenuItem onClick={() => { setSelectedStoppage(stoppage); setIsViewDialogOpen(true); }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            {stoppage.status === 'active' && (
                              <>
                                <DropdownMenuItem onClick={() => { setSelectedStoppage(stoppage); setIsExtendDialogOpen(true); }}>
                                  <CalendarPlus className="h-4 w-4 mr-2" />
                                  Prolonger
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReturn(stoppage)}>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Marquer revenu
                                </DropdownMenuItem>
                              </>
                            )}
                            {stoppage.status !== 'returned' && stoppage.status !== 'cancelled' && (
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => setStoppages(stoppages.map(s => 
                                  s.id === stoppage.id ? { ...s, status: 'cancelled', statusLabel: 'Annulé' } : s
                                ))}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Annuler
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
            <DialogTitle>Détails de l'arrêt de travail</DialogTitle>
          </DialogHeader>
          {selectedStoppage && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge variant="outline" className={STOPPAGE_TYPES.find(t => t.value === selectedStoppage.type)?.color}>
                      {selectedStoppage.typeLabel}
                    </Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <Badge className={STATUS_CONFIG[selectedStoppage.status as keyof typeof STATUS_CONFIG]?.color}>
                      {selectedStoppage.statusLabel}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Employé</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nom</p>
                    <p className="font-medium">{selectedStoppage.staffName}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Période</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date de début</p>
                    <p className="font-medium">{formatDate(selectedStoppage.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date de fin</p>
                    <p className="font-medium">{formatDate(selectedStoppage.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Durée</p>
                    <p className="font-medium">{selectedStoppage.durationDays} jours</p>
                  </div>
                  {selectedStoppage.extensionCount > 0 && (
                    <div>
                      <p className="text-muted-foreground">Prolongations</p>
                      <p className="font-medium">{selectedStoppage.extensionCount}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedStoppage.prescribedBy && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Informations médicales</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedStoppage.prescribedBy && (
                      <div>
                        <p className="text-muted-foreground">Médecin</p>
                        <p className="font-medium">{selectedStoppage.prescribedBy}</p>
                      </div>
                    )}
                    {selectedStoppage.hospitalName && (
                      <div>
                        <p className="text-muted-foreground">Établissement</p>
                        <p className="font-medium">{selectedStoppage.hospitalName}</p>
                      </div>
                    )}
                    {selectedStoppage.certificateNumber && (
                      <div>
                        <p className="text-muted-foreground">N° Certificat</p>
                        <p className="font-medium">{selectedStoppage.certificateNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedStoppage.reason && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Raison</p>
                  <p className="font-medium">{selectedStoppage.reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Extend Dialog */}
      <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Prolonger l'arrêt</DialogTitle>
            <DialogDescription>
              Définir une nouvelle date de fin pour l'arrêt de travail
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="extendDate">Nouvelle date de fin</Label>
              <Input
                id="extendDate"
                type="date"
                value={extendDate}
                onChange={(e) => setExtendDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="extendNotes">Notes</Label>
              <Textarea
                id="extendNotes"
                value={extendNotes}
                onChange={(e) => setExtendNotes(e.target.value)}
                placeholder="Raison de la prolongation..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleExtend}>Prolonger</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enregistrer un arrêt de travail</DialogTitle>
            <DialogDescription>
              Enregistrer un nouvel arrêt de travail pour un employé
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type d'arrêt</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  {STOPPAGE_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Raison</Label>
              <Textarea placeholder="Raison de l'arrêt..." />
            </div>
            <div className="space-y-2">
              <Label>Médecin prescripteur</Label>
              <Input placeholder="Dr. ..." />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={() => setIsAddDialogOpen(false)}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WorkStoppagesManager;
