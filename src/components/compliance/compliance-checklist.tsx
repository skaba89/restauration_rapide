'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
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
import { 
  ClipboardCheck, 
  Plus, 
  Clock, 
  User, 
  FileText, 
  Printer,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sunrise,
  Sunset,
  Sparkles
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: string;
  task: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
}

interface Checklist {
  id: string;
  type: 'checklist';
  checklistType: 'opening' | 'closing' | 'weekly_cleaning';
  date: string;
  data: {
    items: ChecklistItem[];
  };
  completedBy: string;
  signature?: string;
  status: 'pending' | 'completed' | 'failed';
  notes?: string;
}

const CHECKLIST_TEMPLATES = {
  opening: {
    name: "Checklist d'Ouverture",
    icon: Sunrise,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    items: [
      { category: 'Cuisine', task: 'Vérifier température des frigos et congélateurs' },
      { category: 'Cuisine', task: 'Allumer les équipements de cuisson' },
      { category: 'Cuisine', task: 'Vérifier les stocks de produits frais' },
      { category: 'Cuisine', task: 'Préparer les stations de travail' },
      { category: 'Salle', task: 'Nettoyer et préparer les tables' },
      { category: 'Salle', task: 'Vérifier la propreté des sols' },
      { category: 'Salle', task: 'Préparer les couverts et nappes' },
      { category: 'Hygiène', task: 'Vérifier les distributeurs de savon' },
      { category: 'Hygiène', task: 'Remplir les distributeurs d\'essuie-mains' },
      { category: 'Hygiène', task: 'Vérifier le bon fonctionnement des toilettes' },
      { category: 'Sécurité', task: 'Vérifier les issues de secours' },
      { category: 'Sécurité', task: 'Vérifier les extincteurs' },
    ],
  },
  closing: {
    name: 'Checklist de Fermeture',
    icon: Sunset,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    items: [
      { category: 'Cuisine', task: 'Éteindre les équipements de cuisson' },
      { category: 'Cuisine', task: 'Ranger les denrées alimentaires' },
      { category: 'Cuisine', task: 'Nettoyer les plans de travail' },
      { category: 'Cuisine', task: 'Vider et nettoyer les bacs de récupération' },
      { category: 'Salle', task: 'Nettoyer les tables et chaises' },
      { category: 'Salle', task: 'Balayer et laver les sols' },
      { category: 'Salle', task: 'Éteindre les lumières de la salle' },
      { category: 'Caisse', task: 'Fermer la caisse et faire le bilan' },
      { category: 'Caisse', task: 'Préparer la caisse du lendemain' },
      { category: 'Sécurité', task: 'Vérifier les fermetures (portes, fenêtres)' },
      { category: 'Sécurité', task: 'Activer l\'alarme' },
      { category: 'Sécurité', task: 'Vérifier les extincteurs' },
    ],
  },
  weekly_cleaning: {
    name: 'Nettoyage Hebdomadaire',
    icon: Sparkles,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    items: [
      { category: 'Cuisine', task: 'Nettoyage en profondeur des frigos' },
      { category: 'Cuisine', task: 'Nettoyage des hottes et filtres' },
      { category: 'Cuisine', task: 'Détartrer la machine à café' },
      { category: 'Cuisine', task: 'Nettoyage des fours et micro-ondes' },
      { category: 'Salle', task: 'Nettoyage des vitres' },
      { category: 'Salle', task: 'Nettoyage des stores/rideaux' },
      { category: 'Salle', task: 'Nettoyage des décorations' },
      { category: 'Extérieur', task: 'Nettoyage terrasse' },
      { category: 'Extérieur', task: 'Nettoyage des poubelles' },
      { category: 'Extérieur', task: 'Nettoyage entrée principale' },
      { category: 'Réserve', task: 'Réorganisation des stocks' },
      { category: 'Réserve', task: 'Vérification des dates de péremption' },
    ],
  },
};

const STAFF_MEMBERS = ['Fatoumata S.', 'Ibrahim K.', 'Aïssata T.', 'Moussa B.', 'Seydou K.', 'Amadou T.'];

export function ComplianceChecklist() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewChecklistOpen, setIsNewChecklistOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'opening' | 'closing' | 'weekly_cleaning'>('opening');
  const [currentChecklist, setCurrentChecklist] = useState<Checklist | null>(null);
  const [signature, setSignature] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    try {
      const response = await fetch('/api/compliance?type=checklists&demo=true');
      const result = await response.json();
      if (result.success) {
        setChecklists(result.data);
      }
    } catch (error) {
      console.error('Error fetching checklists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChecklist = () => {
    const template = CHECKLIST_TEMPLATES[selectedType];
    const newChecklist: Checklist = {
      id: `temp-${Date.now()}`,
      type: 'checklist',
      checklistType: selectedType,
      date: new Date().toISOString(),
      data: {
        items: template.items.map((item, index) => ({
          id: `item-${index}`,
          ...item,
          completed: false,
        })),
      },
      completedBy: '',
      status: 'pending',
      notes: '',
    };
    setCurrentChecklist(newChecklist);
    setIsNewChecklistOpen(false);
  };

  const toggleItem = (itemId: string) => {
    if (!currentChecklist) return;
    const userName = 'Utilisateur'; // In real app, get from auth context
    
    setCurrentChecklist({
      ...currentChecklist,
      data: {
        items: currentChecklist.data.items.map(item =>
          item.id === itemId
            ? {
                ...item,
                completed: !item.completed,
                completedAt: !item.completed ? new Date().toISOString() : undefined,
                completedBy: !item.completed ? userName : undefined,
              }
            : item
        ),
      },
    });
  };

  const getCompletionPercentage = (checklist: Checklist) => {
    const total = checklist.data.items.length;
    const completed = checklist.data.items.filter(item => item.completed).length;
    return Math.round((completed / total) * 100);
  };

  const handlePrint = (checklist: Checklist) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const template = CHECKLIST_TEMPLATES[checklist.checklistType];
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${template.name} - KFM DELICE</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #f97316; }
            .header { border-bottom: 2px solid #f97316; padding-bottom: 10px; margin-bottom: 20px; }
            .item { padding: 8px 0; border-bottom: 1px solid #eee; }
            .completed { text-decoration: line-through; color: #888; }
            .category { font-weight: bold; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>KFM DELICE</h1>
            <p>${template.name}</p>
            <p>Date: ${new Date(checklist.date).toLocaleDateString('fr-FR')}</p>
          </div>
          ${checklist.data.items.map(item => `
            <div class="item ${item.completed ? 'completed' : ''}">
              <span class="category">[${item.category}]</span> ${item.task}
              ${item.completed ? `<span> ✓ (${item.completedBy}, ${item.completedAt ? new Date(item.completedAt).toLocaleTimeString('fr-FR') : ''})</span>` : ''}
            </div>
          `).join('')}
          ${checklist.notes ? `<p><strong>Notes:</strong> ${checklist.notes}</p>` : ''}
          <p><strong>Complété par:</strong> ${checklist.completedBy}</p>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const saveChecklist = async () => {
    if (!currentChecklist) return;
    
    const completion = getCompletionPercentage(currentChecklist);
    const status = completion === 100 ? 'completed' : completion > 0 ? 'pending' : 'pending';
    
    const savedChecklist: Checklist = {
      ...currentChecklist,
      completedBy: STAFF_MEMBERS[0], // In real app, get from auth
      signature,
      notes,
      status: status as 'pending' | 'completed',
    };

    try {
      const response = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'checklist', data: savedChecklist }),
      });
      
      if (response.ok) {
        setChecklists([savedChecklist, ...checklists]);
        setCurrentChecklist(null);
        setSignature('');
        setNotes('');
      }
    } catch (error) {
      console.error('Error saving checklist:', error);
    }
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

  if (currentChecklist) {
    const template = CHECKLIST_TEMPLATES[currentChecklist.checklistType];
    const completion = getCompletionPercentage(currentChecklist);

    return (
      <Card className={template.bgColor}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <template.icon className={`h-5 w-5 ${template.color}`} />
                {template.name}
              </CardTitle>
              <CardDescription>
                {new Date(currentChecklist.date).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{completion}%</p>
              <Progress value={completion} className="w-32 h-2 mt-1" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-1">
              {currentChecklist.data.items.map(item => (
                <div 
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    item.completed ? 'bg-green-50 dark:bg-green-950/20' : 'hover:bg-muted/50'
                  }`}
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                        {item.task}
                      </span>
                    </div>
                    {item.completed && item.completedAt && (
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(item.completedAt).toLocaleTimeString('fr-FR')}
                        <User className="h-3 w-3 ml-2" />
                        {item.completedBy}
                      </div>
                    )}
                  </div>
                  {item.completed && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t pt-4 space-y-4">
            <div>
              <Label>Notes (optionnel)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observations ou commentaires..."
                rows={2}
              />
            </div>
            <div>
              <Label>Signature</Label>
              <Input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Nom du responsable"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentChecklist(null)}>
                Annuler
              </Button>
              <Button onClick={saveChecklist} className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Enregistrer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Checklists de Conformité
          </h3>
          <p className="text-sm text-muted-foreground">
            Checklists d'ouverture, fermeture et nettoyage
          </p>
        </div>
        <Dialog open={isNewChecklistOpen} onOpenChange={setIsNewChecklistOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle Checklist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle checklist</DialogTitle>
              <DialogDescription>
                Sélectionnez le type de checklist à créer
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {Object.entries(CHECKLIST_TEMPLATES).map(([key, template]) => (
                <div
                  key={key}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedType === key ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedType(key as 'opening' | 'closing' | 'weekly_cleaning')}
                >
                  <div className="flex items-center gap-3">
                    <template.icon className={`h-6 w-6 ${template.color}`} />
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-muted-foreground">{template.items.length} tâches</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewChecklistOpen(false)}>
                Annuler
              </Button>
              <Button onClick={startNewChecklist}>
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Checklists grid */}
      <div className="grid gap-4">
        {checklists.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune checklist enregistrée</p>
              <p className="text-sm">Créez votre première checklist pour commencer</p>
            </CardContent>
          </Card>
        ) : (
          checklists.map(checklist => {
            const template = CHECKLIST_TEMPLATES[checklist.checklistType];
            const completion = getCompletionPercentage(checklist);
            
            return (
              <Card key={checklist.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${template.bgColor}`}>
                        <template.icon className={`h-5 w-5 ${template.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(checklist.date).toLocaleDateString('fr-FR')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={checklist.status === 'completed' ? 'default' : 'secondary'}
                        className={checklist.status === 'completed' ? 'bg-green-500' : ''}
                      >
                        {checklist.status === 'completed' ? 'Complété' : 'En cours'}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => handlePrint(checklist)}>
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Progress value={completion} className="h-2" />
                    </div>
                    <span className="text-sm font-medium">{completion}%</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {checklist.completedBy || 'Non assigné'}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {checklist.data.items.filter(i => i.completed).length}/{checklist.data.items.length} tâches
                    </span>
                    {checklist.notes && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Notes
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ComplianceChecklist;
