'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Calendar, Plus, Users, Phone, MapPin, RefreshCw, Check, X, Edit, Trash2, Eye } from 'lucide-react';
import { useCurrencySafe } from '@/lib/currency-context';

interface CateringOrder {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  eventName: string;
  eventType: string;
  date: string;
  time: string;
  guestCount: number;
  location: string;
  menu: string;
  amount: number;
  deposit: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

const EVENT_TYPES = [
  { value: 'wedding', label: 'Mariage' },
  { value: 'birthday', label: 'Anniversaire' },
  { value: 'corporate', label: 'Événement corporate' },
  { value: 'religious', label: 'Événement religieux' },
  { value: 'other', label: 'Autre' },
];

// Extract OrderForm as a separate component to avoid creating components during render
function CateringOrderForm({
  formData,
  setFormData,
}: {
  formData: typeof initialFormData;
  setFormData: React.Dispatch<React.SetStateAction<typeof initialFormData>>;
}) {
  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nom du client *</Label>
          <Input value={formData.clientName} onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Téléphone *</Label>
          <Input value={formData.clientPhone} onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={formData.clientEmail} onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Type d'événement</Label>
          <Select value={formData.eventType} onValueChange={(v) => setFormData(prev => ({ ...prev, eventType: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nom de l'événement *</Label>
          <Input value={formData.eventName} onChange={(e) => setFormData(prev => ({ ...prev, eventName: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Nombre d'invités</Label>
          <Input type="number" value={formData.guestCount} onChange={(e) => setFormData(prev => ({ ...prev, guestCount: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date *</Label>
          <Input type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Heure</Label>
          <Input type="time" value={formData.time} onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Lieu *</Label>
        <Input value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} placeholder="Adresse de l'événement" />
      </div>
      <div className="space-y-2">
        <Label>Menu</Label>
        <Input value={formData.menu} onChange={(e) => setFormData(prev => ({ ...prev, menu: e.target.value }))} placeholder="Description du menu" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Montant total</Label>
          <Input type="number" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Accompte</Label>
          <Input type="number" value={formData.deposit} onChange={(e) => setFormData(prev => ({ ...prev, deposit: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Informations complémentaires..." rows={2} />
      </div>
    </div>
  );
}

const initialFormData = {
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  eventName: '',
  eventType: 'corporate' as const,
  date: '',
  time: '12:00',
  guestCount: '50',
  location: '',
  menu: '',
  amount: '',
  deposit: '0',
  notes: '',
};

export default function CateringPage() {
  const { formatCurrency } = useCurrencySafe();
  const [orders, setOrders] = useState<CateringOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialogs
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Form state
  const [editingOrder, setEditingOrder] = useState<CateringOrder | null>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    eventName: '',
    eventType: 'corporate',
    date: '',
    time: '12:00',
    guestCount: '50',
    location: '',
    menu: '',
    amount: '',
    deposit: '0',
    notes: '',
  });

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o.eventName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-700">En attente</Badge>;
      case 'confirmed': return <Badge className="bg-blue-100 text-blue-700">Confirmée</Badge>;
      case 'in_progress': return <Badge className="bg-orange-100 text-orange-700">En cours</Badge>;
      case 'completed': return <Badge className="bg-green-100 text-green-700">Terminée</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-700">Annulée</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      eventName: '',
      eventType: 'corporate',
      date: '',
      time: '12:00',
      guestCount: '50',
      location: '',
      menu: '',
      amount: '',
      deposit: '0',
      notes: '',
    });
    setEditingOrder(null);
  };

  const openAddDialog = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const openEditDialog = (order: CateringOrder) => {
    setEditingOrder(order);
    setFormData({
      clientName: order.clientName,
      clientPhone: order.clientPhone,
      clientEmail: order.clientEmail || '',
      eventName: order.eventName,
      eventType: order.eventType,
      date: order.date,
      time: order.time,
      guestCount: order.guestCount.toString(),
      location: order.location,
      menu: order.menu,
      amount: order.amount.toString(),
      deposit: order.deposit.toString(),
      notes: order.notes || '',
    });
    setShowEditDialog(true);
  };

  const openViewDialog = (order: CateringOrder) => {
    setEditingOrder(order);
    setShowViewDialog(true);
  };

  const openDeleteDialog = (order: CateringOrder) => {
    setEditingOrder(order);
    setShowDeleteDialog(true);
  };

  const handleAddOrder = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newOrder: CateringOrder = {
        id: Date.now().toString(),
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail || undefined,
        eventName: formData.eventName,
        eventType: formData.eventType,
        date: formData.date,
        time: formData.time,
        guestCount: parseInt(formData.guestCount) || 50,
        location: formData.location,
        menu: formData.menu,
        amount: parseInt(formData.amount) || 0,
        deposit: parseInt(formData.deposit) || 0,
        status: 'pending',
        notes: formData.notes || undefined,
        createdAt: new Date().toISOString(),
      };
      setOrders(prev => [...prev, newOrder]);
      setShowAddDialog(false);
      resetForm();
      setIsLoading(false);
    }, 500);
  };

  const handleEditOrder = () => {
    if (!editingOrder) return;
    setIsLoading(true);
    setTimeout(() => {
      setOrders(prev => prev.map(o => 
        o.id === editingOrder.id
          ? {
              ...o,
              clientName: formData.clientName,
              clientPhone: formData.clientPhone,
              clientEmail: formData.clientEmail || undefined,
              eventName: formData.eventName,
              eventType: formData.eventType,
              date: formData.date,
              time: formData.time,
              guestCount: parseInt(formData.guestCount) || 50,
              location: formData.location,
              menu: formData.menu,
              amount: parseInt(formData.amount) || 0,
              deposit: parseInt(formData.deposit) || 0,
              notes: formData.notes || undefined,
            }
          : o
      ));
      setShowEditDialog(false);
      resetForm();
      setIsLoading(false);
    }, 500);
  };

  const handleDeleteOrder = () => {
    if (!editingOrder) return;
    setIsLoading(true);
    setTimeout(() => {
      setOrders(prev => prev.filter(o => o.id !== editingOrder.id));
      setShowDeleteDialog(false);
      resetForm();
      setIsLoading(false);
    }, 500);
  };

  const updateStatus = (order: CateringOrder, newStatus: CateringOrder['status']) => {
    setOrders(prev => prev.map(o => 
      o.id === order.id ? { ...o, status: newStatus } : o
    ));
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    totalGuests: orders.filter(o => o.status !== 'cancelled' && o.status !== 'completed').reduce((sum, o) => sum + o.guestCount, 0),
    totalRevenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0),
    upcomingRevenue: orders.filter(o => o.status !== 'cancelled' && o.status !== 'completed').reduce((sum, o) => sum + o.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Traiteur</h1>
          <p className="text-gray-500">Gérer les commandes traiteur et événements</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle commande
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-gray-500">Commandes</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p><p className="text-xs text-gray-500">En attente</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p><p className="text-xs text-gray-500">Confirmées</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{stats.totalGuests}</p><p className="text-xs text-gray-500">Invités prévus</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{formatCurrency(stats.upcomingRevenue)}</p><p className="text-xs text-gray-500">CA à venir</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-md" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="confirmed">Confirmées</SelectItem>
            <SelectItem value="in_progress">En cours</SelectItem>
            <SelectItem value="completed">Terminées</SelectItem>
            <SelectItem value="cancelled">Annulées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{order.eventName}</p>
                    <p className="text-sm text-gray-500">{order.clientName} • {order.guestCount} invités</p>
                    <p className="text-xs text-gray-400">{order.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{order.date} à {order.time}</p>
                    <p className="font-bold text-orange-600">{formatCurrency(order.amount)}</p>
                  </div>
                  {getStatusBadge(order.status)}
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openViewDialog(order)}><Eye className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => openEditDialog(order)}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => openDeleteDialog(order)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialogs */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-xl"><DialogHeader><DialogTitle>Nouvelle commande traiteur</DialogTitle></DialogHeader><CateringOrderForm formData={formData} setFormData={setFormData} /><DialogFooter><Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button><Button onClick={handleAddOrder} disabled={isLoading || !formData.clientName || !formData.eventName || !formData.date}>{isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}Créer</Button></DialogFooter></DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-xl"><DialogHeader><DialogTitle>Modifier la commande</DialogTitle></DialogHeader><CateringOrderForm formData={formData} setFormData={setFormData} /><DialogFooter><Button variant="outline" onClick={() => setShowEditDialog(false)}>Annuler</Button><Button onClick={handleEditOrder} disabled={isLoading}>{isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}Enregistrer</Button></DialogFooter></DialogContent>
      </Dialog>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent><DialogHeader><DialogTitle>{editingOrder?.eventName}</DialogTitle></DialogHeader>
          {editingOrder && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">Client:</span><span>{editingOrder.clientName}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">Téléphone:</span><span>{editingOrder.clientPhone}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">Date:</span><span>{editingOrder.date} à {editingOrder.time}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">Invités:</span><span>{editingOrder.guestCount}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">Lieu:</span><span>{editingOrder.location}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">Menu:</span><span>{editingOrder.menu}</span></div>
              <Separator />
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">Montant:</span><span className="font-bold">{formatCurrency(editingOrder.amount)}</span></div>
              <div className="grid grid-cols-2 gap-2"><span className="text-gray-500">Accompte:</span><span>{formatCurrency(editingOrder.deposit)}</span></div>
              {editingOrder.notes && <div><span className="text-gray-500">Notes:</span><p className="mt-1">{editingOrder.notes}</p></div>}
              <Separator />
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant={editingOrder.status === 'confirmed' ? 'default' : 'outline'} onClick={() => { updateStatus(editingOrder, 'confirmed'); setShowViewDialog(false); }}>Confirmer</Button>
                <Button size="sm" variant={editingOrder.status === 'in_progress' ? 'default' : 'outline'} onClick={() => { updateStatus(editingOrder, 'in_progress'); setShowViewDialog(false); }}>En cours</Button>
                <Button size="sm" variant={editingOrder.status === 'completed' ? 'default' : 'outline'} onClick={() => { updateStatus(editingOrder, 'completed'); setShowViewDialog(false); }}>Terminer</Button>
                <Button size="sm" variant="destructive" onClick={() => { updateStatus(editingOrder, 'cancelled'); setShowViewDialog(false); }}>Annuler</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent><DialogHeader><DialogTitle>Supprimer la commande</DialogTitle></DialogHeader><p>Êtes-vous sûr de vouloir supprimer "{editingOrder?.eventName}" ?</p><DialogFooter><Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Annuler</Button><Button variant="destructive" onClick={handleDeleteOrder} disabled={isLoading}>{isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}Supprimer</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}