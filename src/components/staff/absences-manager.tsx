'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  AlertTriangle,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Check,
  X,
  Clock,
  UserX,
  Timer,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

// Types
interface Absence {
  id: string;
  staffId: string;
  staffName: string;
  date: Date | string;
  type: string;
  typeLabel: string;
  reason: string | null;
  durationMinutes: number | null;
  status: string;
  statusLabel: string;
  justification: string | null;
  documentUrl: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | string | null;
  notes: string | null;
  createdAt: Date | string;
}

// Absence type configuration
const ABSENCE_TYPES = [
  { value: 'late', label: 'Retard', icon: Clock, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'early_departure', label: 'Départ anticipé', icon: Timer, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'no_show', label: 'Absence non justifiée', icon: UserX, color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'unjustified', label: 'Absence injustifiée', icon: AlertTriangle, color: 'bg-red-100 text-red-700 border-red-200' },
];

const STATUS_CONFIG = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  justified: { label: 'Justifiée', color: 'bg-green-100 text-green-700' },
  unjustified: { label: 'Non justifiée', color: 'bg-red-100 text-red-700' },
  excused: { label: 'Excusée', color: 'bg-blue-100 text-blue-700' },
};

// Format date
const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR');
};

// Format duration
const formatDuration = (minutes: number | null) => {
  if (!minutes) return '-';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

export function AbsencesManager() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);
  const [reviewStatus, setReviewStatus] = useState('justified');
  const [reviewNotes, setReviewNotes] = useState('');

  // Stats
  const totalAbsences = absences.length;
  const pendingAbsences = absences.filter(a => a.status === 'pending').length;
  const unjustifiedAbsences = absences.filter(a => a.status === 'unjustified').length;
  const lateArrivals = absences.filter(a => a.type === 'late').length;

  // Filter absences
  const filteredAbsences = absences.filter(a => {
    const matchesSearch = a.staffName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || a.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle review
  const handleReview = () => {
    if (!selectedAbsence) return;
    setAbsences(absences.map(a => 
      a.id === selectedAbsence.id 
        ? { 
            ...a, 
            status: reviewStatus, 
            statusLabel: STATUS_CONFIG[reviewStatus as keyof typeof STATUS_CONFIG]?.label || reviewStatus,
            reviewedBy: 'Admin', 
            reviewedAt: new Date(),
            notes: reviewNotes 
          }
        : a
    ));
    setIsReviewDialogOpen(false);
    setSelectedAbsence(null);
    setReviewStatus('justified');
    setReviewNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total absences</p>
                <p className="text-2xl font-bold">{totalAbsences}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingAbsences}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Non justifiées</p>
                <p className="text-2xl font-bold text-red-600">{unjustifiedAbsences}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Retards</p>
                <p className="text-2xl font-bold text-orange-600">{lateArrivals}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Timer className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Absences List Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Gestion des absences</CardTitle>
              <CardDescription>{filteredAbsences.length} absence(s)</CardDescription>
            </div>
            <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Enregistrer absence
            </Button>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un employé..."
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
                {ABSENCE_TYPES.map(t => (
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
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="justified">Justifiée</SelectItem>
                <SelectItem value="unjustified">Non justifiée</SelectItem>
                <SelectItem value="excused">Excusée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employé</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Raison</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAbsences.map(absence => {
                  const typeConfig = ABSENCE_TYPES.find(t => t.value === absence.type) || ABSENCE_TYPES[0];
                  const statusConfig = STATUS_CONFIG[absence.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                  
                  return (
                    <TableRow key={absence.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(absence.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-medium">
                            {absence.staffName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium">{absence.staffName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={typeConfig.color}>{absence.typeLabel}</Badge>
                      </TableCell>
                      <TableCell>{formatDuration(absence.durationMinutes)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{absence.reason || '-'}</TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>{absence.statusLabel}</Badge>
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
                            <DropdownMenuItem onClick={() => { setSelectedAbsence(absence); setIsReviewDialogOpen(true); }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Examiner
                            </DropdownMenuItem>
                            {absence.status === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => { setSelectedAbsence(absence); setReviewStatus('justified'); setIsReviewDialogOpen(true); }}>
                                  <Check className="h-4 w-4 mr-2 text-green-600" />
                                  Justifier
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSelectedAbsence(absence); setReviewStatus('unjustified'); setIsReviewDialogOpen(true); }}>
                                  <X className="h-4 w-4 mr-2 text-red-600" />
                                  Rejeter
                                </DropdownMenuItem>
                              </>
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

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Examiner l'absence</DialogTitle>
          </DialogHeader>
          {selectedAbsence && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Employé</p>
                  <p className="font-medium">{selectedAbsence.staffName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(selectedAbsence.date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{selectedAbsence.typeLabel}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Durée</p>
                  <p className="font-medium">{formatDuration(selectedAbsence.durationMinutes)}</p>
                </div>
              </div>

              {selectedAbsence.reason && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Raison</p>
                  <p className="font-medium">{selectedAbsence.reason}</p>
                </div>
              )}

              {selectedAbsence.justification && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Justification</p>
                  <p className="font-medium">{selectedAbsence.justification}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="status">Décision</Label>
                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="justified">Justifiée</SelectItem>
                    <SelectItem value="unjustified">Non justifiée</SelectItem>
                    <SelectItem value="excused">Excusée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Commentaires..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleReview}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enregistrer une absence</DialogTitle>
            <DialogDescription>
              Enregistrer une nouvelle absence pour un employé
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type d'absence</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  {ABSENCE_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Raison</Label>
              <Textarea placeholder="Raison de l'absence..." />
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

export default AbsencesManager;