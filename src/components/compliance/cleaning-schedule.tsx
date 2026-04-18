'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
import { 
  SprayCan, 
  Plus, 
  Clock, 
  User, 
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ListChecks,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { format, formatDistanceToNow, isPast, addDays, addWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CleaningTask {
  id: string;
  area: string;
  task: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  nextDue: string;
  assignedTo: string;
  lastCompleted?: string;
  status: 'pending' | 'upcoming' | 'overdue' | 'completed';
}

const AREAS = ['Cuisine', 'Salle', 'Toilettes', 'Extérieur', 'Réserve', 'Bureau'];
const FREQUENCIES = [
  { value: 'daily', label: 'Quotidien', days: 1 },
  { value: 'weekly', label: 'Hebdomadaire', days: 7 },
  { value: 'biweekly', label: 'Bi-hebdomadaire', days: 14 },
  { value: 'monthly', label: 'Mensuel', days: 30 },
];
const STAFF_MEMBERS = ['Fatoumata S.', 'Ibrahim K.', 'Aïssata T.', 'Moussa B.', 'Seydou K.'];

export function CleaningSchedule() {
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    area: 'Cuisine',
    task: '',
    frequency: 'daily',
    assignedTo: STAFF_MEMBERS[0],
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'upcoming'>('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/compliance?type=cleaning');
      const result = await response.json();
      if (result.success) {
        setTasks(result.data);
      }
    } catch (error) {
      console.error('Error fetching cleaning tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.task || !newTask.assignedTo) return;

    const freq = FREQUENCIES.find(f => f.value === newTask.frequency);
    const nextDue = addDays(new Date(), freq?.days || 1).toISOString();

    const task: CleaningTask = {
      id: `clean-${Date.now()}`,
      ...newTask,
      nextDue,
      status: 'upcoming',
    };

    try {
      const response = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'cleaning', data: task }),
      });
      
      if (response.ok) {
        setTasks([...tasks, task]);
        setIsAddDialogOpen(false);
        setNewTask({
          area: 'Cuisine',
          task: '',
          frequency: 'daily',
          assignedTo: STAFF_MEMBERS[0],
        });
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleMarkComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const freq = FREQUENCIES.find(f => f.value === task.frequency);
    const nextDue = addDays(new Date(), freq?.days || 1);

    const updatedTask: CleaningTask = {
      ...task,
      lastCompleted: new Date().toISOString(),
      nextDue: nextDue.toISOString(),
      status: 'completed',
    };

    try {
      await fetch('/api/compliance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, type: 'cleaning', data: updatedTask }),
      });
      
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'overdue': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      case 'upcoming': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-700">Complété</Badge>;
      case 'overdue': return <Badge className="bg-red-100 text-red-700">En retard</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-700">À faire</Badge>;
      case 'upcoming': return <Badge className="bg-blue-100 text-blue-700">À venir</Badge>;
      default: return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    return FREQUENCIES.find(f => f.value === frequency)?.label || frequency;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const overdueCount = tasks.filter(t => t.status === 'overdue').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedTodayCount = tasks.filter(t => 
    t.status === 'completed' && 
    t.lastCompleted && 
    new Date(t.lastCompleted).toDateString() === new Date().toDateString()
  ).length;

  const getCompletionRate = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
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
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-muted-foreground">En retard</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">À faire</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Complétés aujourd'hui</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{completedTodayCount}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Taux completion</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{getCompletionRate()}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <SprayCan className="h-5 w-5" />
            Planning de Nettoyage
          </h3>
          <p className="text-sm text-muted-foreground">
            Gérez les tâches de nettoyage et leur fréquence
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="overdue">En retard</SelectItem>
              <SelectItem value="pending">À faire</SelectItem>
              <SelectItem value="upcoming">À venir</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle tâche
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une tâche de nettoyage</DialogTitle>
                <DialogDescription>
                  Définissez une nouvelle tâche récurrente
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Zone</Label>
                  <Select value={newTask.area} onValueChange={(v) => setNewTask({ ...newTask, area: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AREAS.map(area => (
                        <SelectItem key={area} value={area}>{area}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tâche</Label>
                  <Input
                    value={newTask.task}
                    onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                    placeholder="Ex: Nettoyage sol profond"
                  />
                </div>
                <div>
                  <Label>Fréquence</Label>
                  <Select value={newTask.frequency} onValueChange={(v) => setNewTask({ ...newTask, frequency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map(freq => (
                        <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assigné à</Label>
                  <Select value={newTask.assignedTo} onValueChange={(v) => setNewTask({ ...newTask, assignedTo: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAFF_MEMBERS.map(member => (
                        <SelectItem key={member} value={member}>{member}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddTask}>Ajouter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tasks list */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="divide-y">
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <SprayCan className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune tâche trouvée</p>
                </div>
              ) : (
                filteredTasks.map(task => (
                  <div 
                    key={task.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      task.status === 'overdue' ? 'bg-red-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-12 rounded-full mt-1 ${getStatusColor(task.status)}`} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{task.area}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {getFrequencyLabel(task.frequency)}
                            </span>
                          </div>
                          <p className="font-medium">{task.task}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {task.assignedTo}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {isPast(new Date(task.nextDue)) ? (
                                <span className="text-red-600 font-medium">
                                  En retard de {formatDistanceToNow(new Date(task.nextDue), { locale: fr })}
                                </span>
                              ) : (
                                <>
                                  {format(new Date(task.nextDue), 'EEEE d MMMM', { locale: fr })}
                                </>
                              )}
                            </span>
                          </div>
                          {task.lastCompleted && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Dernière fois: {format(new Date(task.lastCompleted), 'd MMMM à HH:mm', { locale: fr })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(task.status)}
                        {(task.status === 'pending' || task.status === 'overdue') && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="gap-1"
                            onClick={() => handleMarkComplete(task.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Marquer fait
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Weekly overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aperçu de la semaine</CardTitle>
          <CardDescription>Tâches planifiées pour les 7 prochains jours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map(dayOffset => {
              const date = addDays(new Date(), dayOffset);
              const dayTasks = tasks.filter(t => {
                const dueDate = new Date(t.nextDue);
                return dueDate.toDateString() === date.toDateString();
              });
              
              return (
                <div 
                  key={dayOffset}
                  className={`p-2 rounded-lg border text-center ${
                    dayOffset === 0 ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200' : ''
                  }`}
                >
                  <p className="text-xs font-medium">
                    {format(date, 'EEE', { locale: fr })}
                  </p>
                  <p className="text-lg font-bold">
                    {format(date, 'd')}
                  </p>
                  <div className="flex justify-center gap-1 mt-1">
                    {dayTasks.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {dayTasks.length}
                      </Badge>
                    )}
                    {dayTasks.some(t => t.status === 'overdue') && (
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CleaningSchedule;
