'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, 
  Thermometer, 
  Spray, 
  ClipboardList, 
  FileCheck, 
  AlertTriangle,
  Plus,
  CheckCircle,
  Clock,
  FileText,
  Download
} from 'lucide-react';

export function ComplianceManager() {
  const [checklists, setChecklists] = useState([]);
  const [temperatures, setTemperatures] = useState([]);
  const [cleaningSchedule, setCleaningSchedule] = useState([]);
  const [isTempDialogOpen, setIsTempDialogOpen] = useState(false);
  const [newTemp, setNewTemp] = useState({ location: '', temperature: 0 });

  // Temperature alert count
  const alertCount = temperatures.filter(t => t.isAlert).length;

  // Checklist completion rate
  const totalItems = checklists.reduce((sum, c) => sum + c.items.length, 0);
  const completedItems = checklists.reduce((sum, c) => sum + c.items.filter(i => i.checked).length, 0);

  const handleToggleItem = (checklistId: string, itemId: string) => {
    setChecklists(checklists.map(c => {
      if (c.id === checklistId) {
        return {
          ...c,
          items: c.items.map(i => 
            i.id === itemId ? { ...i, checked: !i.checked } : i
          ),
        };
      }
      return c;
    }));
  };

  const handleAddTemperature = () => {
    if (newTemp.location && newTemp.temperature) {
      setTemperatures([
        ...temperatures,
        {
          id: Date.now().toString(),
          ...newTemp,
          isAlert: newTemp.temperature > 5 || newTemp.temperature < -15,
          recordedAt: new Date(),
        },
      ]);
      setIsTempDialogOpen(false);
      setNewTemp({ location: '', temperature: 0 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Checklists</p>
            <p className="text-2xl font-bold">{checklists.length}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tâches complétés</p>
            <p className="text-2xl font-bold text-blue-600">
              {totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Alertes température</p>
            <p className="text-2xl font-bold text-yellow-600">{alertCount}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Nettoyages à faire</p>
            <p className="text-2xl font-bold text-purple-600">{cleaningSchedule.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="checklists">
        <TabsList>
          <TabsTrigger value="checklists">Checklists</TabsTrigger>
          <TabsTrigger value="temperatures">Températures</TabsTrigger>
          <TabsTrigger value="cleaning">Nettoyage</TabsTrigger>
        </TabsList>

        <TabsContent value="checklists" className="mt-4">
          <div className="grid gap-4">
            {checklists.map(checklist => (
              <Card key={checklist.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {checklist.type === 'haccp' ? (
                          <Shield className="h-5 w-5 text-blue-600" />
                        ) : (
                          <ClipboardList className="h-5 w-5 text-green-600" />
                        )}
                        {checklist.name}
                      </CardTitle>
                      <CardDescription>
                        {checklist.date.toLocaleDateString('fr-FR')}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {checklist.status === 'pending' ? 'En attente' : 'Complété'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {checklist.items.map(item => (
                      <div 
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() => handleToggleItem(checklist.id, item.id)}
                        />
                        <span className={item.checked ? 'line-through text-muted-foreground' : ''}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="temperatures" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  Relevés de température
                </CardTitle>
                <Dialog open={isTempDialogOpen} onOpenChange={setIsTempDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Nouvelle mesure
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Enregistrer une température</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Emplacement</Label>
                        <Select value={newTemp.location} onValueChange={(v) => setNewTemp({ ...newTemp, location: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Frigo 1">Frigo 1</SelectItem>
                            <SelectItem value="Frigo 2">Frigo 2</SelectItem>
                            <SelectItem value="Congélateur 1">Congélateur 1</SelectItem>
                            <SelectItem value="Congélateur 2">Congélateur 2</SelectItem>
                            <SelectItem value="Réserve froide">Réserve froide</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Température (°C)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={newTemp.temperature}
                          onChange={(e) => setNewTemp({ ...newTemp, temperature: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsTempDialogOpen(false)}>Annuler</Button>
                      <Button onClick={handleAddTemperature}>Enregistrer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {temperatures.map(temp => (
                  <div 
                    key={temp.id}
                    className={`p-4 rounded-lg border ${temp.isAlert ? 'border-red-500 bg-red-50' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{temp.location}</span>
                      {temp.isAlert && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className={`text-2xl font-bold ${temp.isAlert ? 'text-red-600' : ''}`}>
                      {temp.temperature}°C
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {temp.recordedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cleaning" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Spray className="h-5 w-5" />
                Planning de nettoyage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {cleaningSchedule.map(task => (
                    <div 
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-12 rounded-full ${
                          task.frequency === 'daily' ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <p className="font-medium">{task.area}</p>
                          <p className="text-sm text-muted-foreground">{task.task}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {task.frequency === 'daily' ? 'Quotidien' : 'Hebdomadaire'}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {task.assignedTo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ComplianceManager;