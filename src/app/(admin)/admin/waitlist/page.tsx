'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UsersRound, Plus, Clock, Phone, User, RefreshCw, Trash2, Check, UserPlus, Bell } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface WaitlistEntry {
  id: string;
  name: string;
  phone: string;
  guests: number;
  waitTime: number;
  status: 'waiting' | 'seated' | 'cancelled';
  notes?: string;
}

export default function WaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([
    { id: '1', name: 'Amadou Diallo', phone: '+224 620 00 00 01', guests: 4, waitTime: 15, status: 'waiting' },
    { id: '2', name: 'Fatou Sylla', phone: '+224 620 00 00 02', guests: 2, waitTime: 10, status: 'waiting' },
    { id: '3', name: 'Ibrahim Koné', phone: '+224 620 00 00 03', guests: 6, waitTime: 25, status: 'seated' },
    { id: '4', name: 'Mariama Touré', phone: '+224 620 00 00 04', guests: 3, waitTime: 5, status: 'waiting' },
  ]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', guests: '2', notes: '' });

  const waiting = entries.filter(e => e.status === 'waiting');
  const seated = entries.filter(e => e.status === 'seated');
  const totalGuests = waiting.reduce((sum, e) => sum + e.guests, 0);
  const avgWait = waiting.length > 0 ? Math.round(waiting.reduce((sum, e) => sum + e.waitTime, 0) / waiting.length) : 0;

  const handleAdd = () => {
    if (!formData.name || !formData.phone) return;
    setIsLoading(true);
    setTimeout(() => {
      const newEntry: WaitlistEntry = {
        id: Date.now().toString(),
        name: formData.name,
        phone: formData.phone,
        guests: parseInt(formData.guests) || 2,
        waitTime: 0,
        status: 'waiting',
        notes: formData.notes || undefined,
      };
      setEntries(prev => [newEntry, ...prev]);
      setFormData({ name: '', phone: '', guests: '2', notes: '' });
      setShowAddDialog(false);
      setIsLoading(false);
    }, 300);
  };

  const seatGuest = (entry: WaitlistEntry) => {
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'seated' as const } : e));
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const notifyGuest = (entry: WaitlistEntry) => {
    alert(`Notification envoyée à ${entry.name} (${entry.phone})`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liste d'Attente</h1>
          <p className="text-gray-500">Gérer la file d'attente des clients</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter à la liste
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-orange-600">{waiting.length}</p><p className="text-sm text-gray-500">En attente</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{seated.length}</p><p className="text-sm text-gray-500">Installés</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{totalGuests}</p><p className="text-sm text-gray-500">Personnes en attente</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{avgWait} min</p><p className="text-sm text-gray-500">Temps d'attente moyen</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>File d'attente</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {waiting.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Aucun client en attente</div>
            ) : (
              waiting.map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">#{index + 1}</div>
                    <div>
                      <p className="font-medium">{entry.name}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{entry.phone}</span>
                        <span>{entry.guests} pers.</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm"><Clock className="h-4 w-4 text-gray-400" /><span>~{entry.waitTime} min</span></div>
                    <Badge className="bg-orange-100 text-orange-700">En attente</Badge>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => notifyGuest(entry)} title="Notifier"><Bell className="h-4 w-4" /></Button>
                      <Button size="sm" onClick={() => seatGuest(entry)}><UserPlus className="h-4 w-4 mr-1" />Installer</Button>
                      <Button size="sm" variant="ghost" className="text-red-500" onClick={() => removeEntry(entry.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajouter à la liste d'attente</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nom *</Label><Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Téléphone *</Label><Input value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Nombre de personnes</Label><Input type="number" value={formData.guests} onChange={(e) => setFormData(prev => ({ ...prev, guests: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Notes</Label><Input value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Préférences..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
            <Button onClick={handleAdd} disabled={!formData.name || !formData.phone || isLoading}>{isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
