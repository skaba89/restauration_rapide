'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { 
  CalendarDays, 
  Plus, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Award,
  Building2,
  XCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { format, isPast, isFuture, isToday, addDays, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Inspection {
  id: string;
  type: 'hygiene' | 'fire_safety' | 'health' | 'environmental';
  scheduledAt: string;
  inspector: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  result?: 'passed' | 'failed' | 'conditional';
  score?: number;
  notes?: string;
}

interface Certificate {
  id: string;
  name: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
}

const INSPECTION_TYPES = [
  { value: 'hygiene', label: 'Hygiène', icon: FileCheck, color: 'text-blue-500' },
  { value: 'fire_safety', label: 'Sécurité Incendie', icon: AlertTriangle, color: 'text-red-500' },
  { value: 'health', label: 'Santé', icon: CheckCircle2, color: 'text-green-500' },
  { value: 'environmental', label: 'Environnement', icon: Building2, color: 'text-emerald-500' },
];

const INSPECTORS = [
  'Direction de l\'Hygiène',
  'Pompiers de Conakry',
  'Services Sanitaires',
  'Inspection du Travail',
  'Agence Environnementale',
];

export function InspectionCalendar() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newInspection, setNewInspection] = useState({
    type: 'hygiene' as 'hygiene' | 'fire_safety' | 'health' | 'environmental',
    scheduledAt: '',
    inspector: INSPECTORS[0],
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [inspectionsRes, certsRes] = await Promise.all([
        fetch('/api/compliance?type=inspections'),
        fetch('/api/compliance?type=certificates'),
      ]);
      
      const inspectionsData = await inspectionsRes.json();
      const certsData = await certsRes.json();
      
      if (inspectionsData.success) setInspections(inspectionsData.data);
      if (certsData.success) setCertificates(certsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddInspection = async () => {
    if (!newInspection.scheduledAt || !newInspection.inspector) return;

    const inspection: Inspection = {
      id: `insp-${Date.now()}`,
      ...newInspection,
      status: 'scheduled',
    };

    try {
      const response = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'inspection', data: inspection }),
      });
      
      if (response.ok) {
        setInspections([...inspections, inspection]);
        setIsAddDialogOpen(false);
        setNewInspection({
          type: 'hygiene',
          scheduledAt: '',
          inspector: INSPECTORS[0],
          notes: '',
        });
      }
    } catch (error) {
      console.error('Error adding inspection:', error);
    }
  };

  const getInspectionTypeLabel = (type: string) => {
    return INSPECTION_TYPES.find(t => t.value === type)?.label || type;
  };

  const getInspectionTypeIcon = (type: string) => {
    const found = INSPECTION_TYPES.find(t => t.value === type);
    return found?.icon || FileCheck;
  };

  const getInspectionTypeColor = (type: string) => {
    return INSPECTION_TYPES.find(t => t.value === type)?.color || 'text-gray-500';
  };

  const getStatusBadge = (status: string, result?: string) => {
    if (status === 'completed') {
      switch (result) {
        case 'passed':
          return <Badge className="bg-green-100 text-green-700">Réussi</Badge>;
        case 'failed':
          return <Badge className="bg-red-100 text-red-700">Échoué</Badge>;
        case 'conditional':
          return <Badge className="bg-yellow-100 text-yellow-700">Conditionnel</Badge>;
        default:
          return <Badge className="bg-blue-100 text-blue-700">Complété</Badge>;
      }
    }
    
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-700">Planifié</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-700">Annulé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getCertificateStatus = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-700">Valide</Badge>;
      case 'expiring_soon':
        return <Badge className="bg-yellow-100 text-yellow-700">Expire bientôt</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-700">Expiré</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const upcomingInspections = inspections
    .filter(i => i.status === 'scheduled' && isFuture(new Date(i.scheduledAt)))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const pastInspections = inspections
    .filter(i => i.status === 'completed')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  // Get dates with inspections for calendar markers
  const inspectionDates = inspections
    .filter(i => i.status === 'scheduled')
    .map(i => new Date(i.scheduledAt));

  // Check if a date has an inspection
  const hasInspectionOnDate = (date: Date) => {
    return inspections.some(i => {
      const inspDate = new Date(i.scheduledAt);
      return inspDate.toDateString() === date.toDateString() && i.status === 'scheduled';
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Inspections prévues</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{upcomingInspections.length}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Réussies</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {inspections.filter(i => i.result === 'passed').length}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Certificats à renouveler</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {certificates.filter(c => c.status !== 'valid').length}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-muted-foreground">Score moyen</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {inspections.filter(i => i.score).length > 0 
                ? Math.round(inspections.filter(i => i.score).reduce((sum, i) => sum + (i.score || 0), 0) / inspections.filter(i => i.score).length)
                : '-'}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Calendrier</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={fr}
              className="rounded-md border"
              modifiers={{
                hasInspection: inspectionDates,
              }}
              modifiersStyles={{
                hasInspection: {
                  backgroundColor: 'rgb(254 243 199)',
                  fontWeight: 'bold',
                },
              }}
            />
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">
                {selectedDate && format(selectedDate, 'd MMMM yyyy', { locale: fr })}
              </p>
              {selectedDate && hasInspectionOnDate(selectedDate) && (
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200">
                  <p className="text-sm">
                    <AlertCircle className="h-4 w-4 inline mr-1 text-amber-500" />
                    Inspection prévue ce jour
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inspections list */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Inspections</CardTitle>
                <CardDescription>Historique et planification</CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Planifier
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Planifier une inspection</DialogTitle>
                    <DialogDescription>
                      Ajoutez une nouvelle inspection au calendrier
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Type d'inspection</Label>
                      <Select value={newInspection.type} onValueChange={(v) => setNewInspection({ ...newInspection, type: v as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {INSPECTION_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Date et heure</Label>
                      <Input
                        type="datetime-local"
                        value={newInspection.scheduledAt}
                        onChange={(e) => setNewInspection({ ...newInspection, scheduledAt: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Inspecteur</Label>
                      <Select value={newInspection.inspector} onValueChange={(v) => setNewInspection({ ...newInspection, inspector: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {INSPECTORS.map(inspector => (
                            <SelectItem key={inspector} value={inspector}>{inspector}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Notes (optionnel)</Label>
                      <Textarea
                        value={newInspection.notes}
                        onChange={(e) => setNewInspection({ ...newInspection, notes: e.target.value })}
                        placeholder="Informations complémentaires..."
                        rows={2}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAddInspection}>Planifier</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">À venir ({upcomingInspections.length})</TabsTrigger>
                <TabsTrigger value="past">Historique</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="mt-4">
                <ScrollArea className="h-[300px]">
                  {upcomingInspections.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune inspection prévue</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingInspections.map(inspection => {
                        const Icon = getInspectionTypeIcon(inspection.type);
                        const daysUntil = differenceInDays(new Date(inspection.scheduledAt), new Date());
                        
                        return (
                          <div 
                            key={inspection.id}
                            className="p-3 rounded-lg border hover:bg-muted/50"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg bg-muted`}>
                                  <Icon className={`h-4 w-4 ${getInspectionTypeColor(inspection.type)}`} />
                                </div>
                                <div>
                                  <p className="font-medium">{getInspectionTypeLabel(inspection.type)}</p>
                                  <p className="text-sm text-muted-foreground">{inspection.inspector}</p>
                                  <div className="flex items-center gap-2 mt-1 text-xs">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {format(new Date(inspection.scheduledAt), 'EEEE d MMMM à HH:mm', { locale: fr })}
                                    </span>
                                    {daysUntil <= 7 && (
                                      <Badge variant="outline" className="text-amber-600 border-amber-300">
                                        Dans {daysUntil} jour{daysUntil > 1 ? 's' : ''}
                                      </Badge>
                                    )}
                                  </div>
                                  {inspection.notes && (
                                    <p className="text-xs text-muted-foreground mt-1">{inspection.notes}</p>
                                  )}
                                </div>
                              </div>
                              {getStatusBadge(inspection.status)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="past" className="mt-4">
                <ScrollArea className="h-[300px]">
                  {pastInspections.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun historique</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pastInspections.map(inspection => {
                        const Icon = getInspectionTypeIcon(inspection.type);
                        
                        return (
                          <div 
                            key={inspection.id}
                            className="p-3 rounded-lg border hover:bg-muted/50"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg bg-muted`}>
                                  <Icon className={`h-4 w-4 ${getInspectionTypeColor(inspection.type)}`} />
                                </div>
                                <div>
                                  <p className="font-medium">{getInspectionTypeLabel(inspection.type)}</p>
                                  <p className="text-sm text-muted-foreground">{inspection.inspector}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {format(new Date(inspection.scheduledAt), 'd MMMM yyyy', { locale: fr })}
                                  </p>
                                  {inspection.score && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className="text-xs">Score:</span>
                                      <Badge variant={inspection.score >= 80 ? 'default' : inspection.score >= 60 ? 'secondary' : 'destructive'}>
                                        {inspection.score}%
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                {getStatusBadge(inspection.status, inspection.result)}
                              </div>
                            </div>
                            {inspection.notes && (
                              <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                                {inspection.notes}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Certificates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificats & Licences
          </CardTitle>
          <CardDescription>Gestion des documents de conformité</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {certificates.map(cert => {
              const daysUntilExpiry = differenceInDays(new Date(cert.expiryDate), new Date());
              
              return (
                <Card key={cert.id} className={`overflow-hidden ${
                  cert.status === 'expired' ? 'border-red-500' :
                  cert.status === 'expiring_soon' ? 'border-yellow-500' : ''
                }`}>
                  <div className={`h-1 ${
                    cert.status === 'valid' ? 'bg-green-500' :
                    cert.status === 'expiring_soon' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <FileCheck className={`h-5 w-5 ${
                        cert.status === 'valid' ? 'text-green-500' :
                        cert.status === 'expiring_soon' ? 'text-yellow-500' : 'text-red-500'
                      }`} />
                      {getCertificateStatus(cert.status)}
                    </div>
                    <p className="font-medium text-sm">{cert.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expire le {format(new Date(cert.expiryDate), 'd MMMM yyyy', { locale: fr })}
                    </p>
                    {cert.status !== 'valid' && (
                      <p className={`text-xs mt-2 ${
                        cert.status === 'expired' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {cert.status === 'expired' 
                          ? `Expiré depuis ${Math.abs(daysUntilExpiry)} jour${Math.abs(daysUntilExpiry) > 1 ? 's' : ''}`
                          : `Expire dans ${daysUntilExpiry} jour${daysUntilExpiry > 1 ? 's' : ''}`
                        }
                      </p>
                    )}
                    {cert.status !== 'valid' && (
                      <Button size="sm" variant="outline" className="w-full mt-3 gap-1">
                        <ExternalLink className="h-3 w-3" />
                        Renouveler
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Need to add Tabs import
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default InspectionCalendar;
