'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Thermometer, 
  Plus, 
  AlertTriangle, 
  Clock, 
  User,
  TrendingUp,
  TrendingDown,
  Activity,
  Snowflake,
  Refrigerator
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';

interface TemperatureLog {
  id: string;
  equipmentId: string;
  equipmentName: string;
  temperature: number;
  recordedAt: string;
  recordedBy: string;
  status: 'normal' | 'warning' | 'critical';
}

const EQUIPMENT_OPTIONS = [
  { id: 'fridge-1', name: 'Frigo Principal', type: 'fridge', minTemp: 0, maxTemp: 5 },
  { id: 'fridge-2', name: 'Frigo Boissons', type: 'fridge', minTemp: 0, maxTemp: 5 },
  { id: 'fridge-3', name: 'Frigo Légumes', type: 'fridge', minTemp: 0, maxTemp: 5 },
  { id: 'freezer-1', name: 'Congélateur Principal', type: 'freezer', minTemp: -25, maxTemp: -18 },
  { id: 'freezer-2', name: 'Congélateur Glaces', type: 'freezer', minTemp: -25, maxTemp: -18 },
];

const STAFF_MEMBERS = ['Fatoumata S.', 'Ibrahim K.', 'Aïssata T.', 'Moussa B.'];

export function TemperatureLogs() {
  const [logs, setLogs] = useState<TemperatureLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState('fridge-1');
  const [newTemp, setNewTemp] = useState('');
  const [recordedBy, setRecordedBy] = useState(STAFF_MEMBERS[0]);
  const [activeView, setActiveView] = useState<'grid' | 'chart'>('grid');
  const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/compliance?type=temperatures&demo=true');
      const result = await response.json();
      if (result.success) {
        setLogs(result.data);
      }
    } catch (error) {
      console.error('Error fetching temperature logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTemperatureStatus = (temp: number, equipmentId: string): 'normal' | 'warning' | 'critical' => {
    const equipment = EQUIPMENT_OPTIONS.find(e => e.id === equipmentId);
    if (!equipment) return 'normal';
    
    if (equipment.type === 'fridge') {
      if (temp >= 0 && temp <= 4) return 'normal';
      if (temp > 4 && temp <= 5) return 'warning';
      return 'critical';
    } else {
      // Freezer
      if (temp <= -18) return 'normal';
      if (temp > -18 && temp <= -15) return 'warning';
      return 'critical';
    }
  };

  const handleAddLog = async () => {
    if (!newTemp || !selectedEquipment) return;

    const equipment = EQUIPMENT_OPTIONS.find(e => e.id === selectedEquipment);
    const temperature = parseFloat(newTemp);
    const status = getTemperatureStatus(temperature, selectedEquipment);

    const newLog: TemperatureLog = {
      id: `temp-${Date.now()}`,
      equipmentId: selectedEquipment,
      equipmentName: equipment?.name || selectedEquipment,
      temperature,
      recordedAt: new Date().toISOString(),
      recordedBy,
      status,
    };

    try {
      const response = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'temperature', data: newLog }),
      });
      
      if (response.ok) {
        setLogs([newLog, ...logs]);
        setIsAddDialogOpen(false);
        setNewTemp('');
      }
    } catch (error) {
      console.error('Error adding temperature log:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal': return <Badge className="bg-green-100 text-green-700 border-green-200">Normal</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Attention</Badge>;
      case 'critical': return <Badge className="bg-red-100 text-red-700 border-red-200">Critique</Badge>;
      default: return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // Group logs by equipment for chart
  const getChartData = () => {
    const filteredLogs = selectedEquipmentFilter === 'all' 
      ? logs 
      : logs.filter(l => l.equipmentId === selectedEquipmentFilter);
    
    // Sort by date
    const sorted = [...filteredLogs].sort((a, b) => 
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );
    
    // Take last 20 readings
    return sorted.slice(-20).map(log => ({
      time: new Date(log.recordedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      date: new Date(log.recordedAt).toLocaleDateString('fr-FR'),
      temperature: log.temperature,
      equipment: log.equipmentName,
      status: log.status,
    }));
  };

  // Get latest readings per equipment
  const getLatestReadings = () => {
    const latest = new Map<string, TemperatureLog>();
    
    logs.forEach(log => {
      const existing = latest.get(log.equipmentId);
      if (!existing || new Date(log.recordedAt) > new Date(existing.recordedAt)) {
        latest.set(log.equipmentId, log);
      }
    });
    
    return Array.from(latest.values());
  };

  const alertCount = logs.filter(l => l.status !== 'normal').length;
  const latestReadings = getLatestReadings();

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
              <Refrigerator className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Équipements</span>
            </div>
            <p className="text-2xl font-bold">{EQUIPMENT_OPTIONS.length}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Normaux</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {latestReadings.filter(l => l.status === 'normal').length}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Alertes</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {latestReadings.filter(l => l.status === 'warning').length}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-500" />
              <span className="text-sm text-muted-foreground">Critiques</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {latestReadings.filter(l => l.status === 'critical').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Relevés de Température
          </h3>
          <p className="text-sm text-muted-foreground">
            Surveillance continue des frigos et congélateurs
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau relevé
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enregistrer un relevé</DialogTitle>
              <DialogDescription>
                Entrez la température mesurée
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Équipement</Label>
                <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPMENT_OPTIONS.map(eq => (
                      <SelectItem key={eq.id} value={eq.id}>
                        <div className="flex items-center gap-2">
                          {eq.type === 'fridge' ? (
                            <Refrigerator className="h-4 w-4" />
                          ) : (
                            <Snowflake className="h-4 w-4" />
                          )}
                          {eq.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Température (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newTemp}
                  onChange={(e) => setNewTemp(e.target.value)}
                  placeholder={selectedEquipment.includes('freezer') ? '-18' : '4'}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedEquipment.includes('freezer') 
                    ? 'Plage normale: -25°C à -18°C' 
                    : 'Plage normale: 0°C à 5°C'}
                </p>
              </div>
              <div>
                <Label>Enregistré par</Label>
                <Select value={recordedBy} onValueChange={setRecordedBy}>
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
              <Button onClick={handleAddLog}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'grid' | 'chart')}>
        <TabsList>
          <TabsTrigger value="grid">Vue équipements</TabsTrigger>
          <TabsTrigger value="chart">Graphique</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {latestReadings.map(reading => (
              <Card 
                key={reading.equipmentId}
                className={`overflow-hidden ${
                  reading.status === 'critical' ? 'border-red-500 border-2' :
                  reading.status === 'warning' ? 'border-yellow-500 border-2' : ''
                }`}
              >
                <div className={`h-1 ${getStatusColor(reading.status)}`} />
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {reading.equipmentId.includes('freezer') ? (
                        <Snowflake className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Refrigerator className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-xs font-medium truncate">{reading.equipmentName}</span>
                    </div>
                    {reading.status !== 'normal' && (
                      <AlertTriangle className={`h-4 w-4 ${
                        reading.status === 'critical' ? 'text-red-500' : 'text-yellow-500'
                      }`} />
                    )}
                  </div>
                  <p className={`text-2xl font-bold ${
                    reading.status === 'critical' ? 'text-red-600' :
                    reading.status === 'warning' ? 'text-yellow-600' : ''
                  }`}>
                    {reading.temperature}°C
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(reading.recordedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {reading.recordedBy.split(' ')[0]}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chart" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Historique des températures</CardTitle>
                  <CardDescription>Évolution sur les derniers relevés</CardDescription>
                </div>
                <Select value={selectedEquipmentFilter} onValueChange={setSelectedEquipmentFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Tous les équipements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les équipements</SelectItem>
                    {EQUIPMENT_OPTIONS.map(eq => (
                      <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(label, payload) => {
                        const data = payload[0]?.payload;
                        return data ? `${label} - ${data.date}` : label;
                      }}
                      formatter={(value: number, name: string, props: any) => [
                        `${value}°C`,
                        props.payload.equipment
                      ]}
                    />
                    <Legend />
                    <ReferenceLine 
                      y={5} 
                      stroke="#ef4444" 
                      strokeDasharray="3 3" 
                      label={{ value: 'Limite frigo', position: 'right', fontSize: 10 }} 
                    />
                    <ReferenceLine 
                      y={-18} 
                      stroke="#3b82f6" 
                      strokeDasharray="3 3" 
                      label={{ value: 'Limite congélateur', position: 'right', fontSize: 10 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      dot={{ fill: '#f97316', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Derniers relevés</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {logs.slice(0, 15).map(log => (
                <div 
                  key={log.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${getStatusColor(log.status)}`} />
                    <div>
                      <p className="font-medium text-sm">{log.equipmentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.recordedAt).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })} • {log.recordedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${
                      log.status === 'critical' ? 'text-red-600' :
                      log.status === 'warning' ? 'text-yellow-600' : ''
                    }`}>
                      {log.temperature}°C
                    </span>
                    {getStatusBadge(log.status)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default TemperatureLogs;
