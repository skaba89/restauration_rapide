'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Gift,
  Percent,
  Tag,
  Clock,
  CalendarDays,
  TrendingUp,
  Zap,
  Copy,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/api-client';
import { useCurrencySafe } from '@/lib/currency-context';

interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'discount' | 'free_item' | 'buy_x_get_y' | 'happy_hour' | 'free_delivery';
  value: number;
  code?: string;
  minOrder?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
}

const PROMO_TYPES = [
  { value: 'discount', label: 'Réduction %', icon: Percent, color: 'text-orange-500' },
  { value: 'free_item', label: 'Article gratuit', icon: Gift, color: 'text-green-500' },
  { value: 'buy_x_get_y', label: 'Achetez X, Recevez Y', icon: TrendingUp, color: 'text-blue-500' },
  { value: 'happy_hour', label: 'Happy Hour', icon: Clock, color: 'text-purple-500' },
  { value: 'free_delivery', label: 'Livraison gratuite', icon: Tag, color: 'text-teal-500' },
];

export function PromotionsManager() {
  const { formatCurrency } = useCurrencySafe();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [newPromo, setNewPromo] = useState({
    name: '',
    description: '',
    type: 'discount' as const,
    value: 10,
    code: '',
    minOrder: 0,
    validFrom: '',
    validTo: '',
    maxUsage: undefined as number | undefined,
  });

  // Fetch promotions
  const fetchPromotions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchWithAuth('/api/promotions');
      const data = await response.json();
      
      if (data.success) {
        setPromotions(data.data.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          type: p.type,
          value: p.value,
          code: p.code,
          minOrder: p.minOrder,
          validFrom: p.validFrom,
          validTo: p.validTo,
          isActive: p.isActive,
          usageCount: p.usageCount || 0,
          maxUsage: p.maxUsage,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Toggle active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetchWithAuth('/api/promotions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      
      setPromotions(prev => prev.map(p => 
        p.id === id ? { ...p, isActive: !currentStatus } : p
      ));
      toast.success(`Promotion ${!currentStatus ? 'activée' : 'désactivée'}`);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Delete promotion
  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette promotion?')) return;
    
    try {
      await fetchWithAuth(`/api/promotions?id=${id}`, { method: 'DELETE' });
      setPromotions(prev => prev.filter(p => p.id !== id));
      toast.success('Promotion supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Create promotion
  const handleCreate = async () => {
    if (!newPromo.name || !newPromo.validFrom || !newPromo.validTo) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    try {
      const response = await fetchWithAuth('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: 'demo-org-1',
          ...newPromo,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPromotions(prev => [...prev, {
          id: data.data.id || Date.now().toString(),
          name: newPromo.name,
          description: newPromo.description,
          type: newPromo.type,
          value: newPromo.value,
          code: newPromo.code,
          minOrder: newPromo.minOrder,
          validFrom: newPromo.validFrom,
          validTo: newPromo.validTo,
          isActive: true,
          usageCount: 0,
          maxUsage: newPromo.maxUsage,
        }]);
        setShowAddModal(false);
        resetForm();
        toast.success('Promotion créée');
      }
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  // Update promotion
  const handleUpdate = async () => {
    if (!editingPromo) return;
    
    try {
      await fetchWithAuth('/api/promotions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingPromo.id, ...newPromo }),
      });
      
      setPromotions(prev => prev.map(p => 
        p.id === editingPromo.id ? { ...p, ...newPromo } : p
      ));
      setEditingPromo(null);
      resetForm();
      toast.success('Promotion mise à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Copy code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copié!');
  };

  const resetForm = () => {
    setNewPromo({
      name: '',
      description: '',
      type: 'discount',
      value: 10,
      code: '',
      minOrder: 0,
      validFrom: '',
      validTo: '',
      maxUsage: undefined,
    });
  };

  const getTypeConfig = (type: string) => {
    return PROMO_TYPES.find(t => t.value === type) || PROMO_TYPES[0];
  };

  const activePromos = promotions.filter(p => p.isActive);
  const totalUsage = promotions.reduce((sum, p) => sum + p.usageCount, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Gift className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{promotions.length}</p>
                <p className="text-xs text-gray-500">Promotions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activePromos.length}</p>
                <p className="text-xs text-gray-500">Actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsage}</p>
                <p className="text-xs text-gray-500">Utilisations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promotions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Promotions</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchPromotions}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button onClick={() => { resetForm(); setShowAddModal(true); }} className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" /> Nouvelle
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {promotions.map(promo => {
                const typeConfig = getTypeConfig(promo.type);
                const TypeIcon = typeConfig.icon;
                
                return (
                  <Card key={promo.id} className={`border-l-4 ${promo.isActive ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center ${typeConfig.color}`}>
                            <TypeIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{promo.name}</span>
                              <Badge variant="outline">{typeConfig.label}</Badge>
                              {promo.isActive && (
                                <Badge className="bg-green-100 text-green-700">Active</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{promo.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                {new Date(promo.validFrom).toLocaleDateString('fr-FR')} - {new Date(promo.validTo).toLocaleDateString('fr-FR')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                {promo.usageCount} utilisations
                              </span>
                              {promo.code && (
                                <span className="flex items-center gap-1">
                                  <Tag className="w-3 h-3" />
                                  Code: <code className="bg-gray-100 px-1 rounded">{promo.code}</code>
                                  <button onClick={() => handleCopyCode(promo.code!)} className="ml-1 hover:text-orange-500">
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </span>
                              )}
                              {promo.minOrder && promo.minOrder > 0 && (
                                <span>Min: {formatCurrency(promo.minOrder)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={promo.isActive}
                            onCheckedChange={() => handleToggleActive(promo.id, promo.isActive)}
                          />
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              setEditingPromo(promo);
                              setNewPromo({
                                name: promo.name,
                                description: promo.description,
                                type: promo.type,
                                value: promo.value,
                                code: promo.code || '',
                                minOrder: promo.minOrder || 0,
                                validFrom: promo.validFrom,
                                validTo: promo.validTo,
                                maxUsage: promo.maxUsage,
                              });
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(promo.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal || !!editingPromo} onOpenChange={() => { setShowAddModal(false); setEditingPromo(null); resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPromo ? 'Modifier la promotion' : 'Nouvelle Promotion'}</DialogTitle>
            <DialogDescription className="sr-only">{editingPromo ? 'Modifier les détails de la promotion existante.' : 'Remplissez les informations pour créer une nouvelle promotion.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Nom *</Label><Input value={newPromo.name} onChange={(e) => setNewPromo(prev => ({ ...prev, name: e.target.value }))} /></div>
            <div><Label>Description</Label><Input value={newPromo.description} onChange={(e) => setNewPromo(prev => ({ ...prev, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <select 
                  className="w-full border rounded-md p-2"
                  value={newPromo.type}
                  onChange={(e) => setNewPromo(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  {PROMO_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div><Label>Valeur (%)</Label><Input type="number" value={newPromo.value} onChange={(e) => setNewPromo(prev => ({ ...prev, value: parseInt(e.target.value) }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Code promo</Label><Input value={newPromo.code} onChange={(e) => setNewPromo(prev => ({ ...prev, code: e.target.value }))} placeholder="Ex: BIENVENUE" /></div>
              <div><Label>Min. commande</Label><Input type="number" value={newPromo.minOrder} onChange={(e) => setNewPromo(prev => ({ ...prev, minOrder: parseInt(e.target.value) }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Date début *</Label><Input type="date" value={newPromo.validFrom} onChange={(e) => setNewPromo(prev => ({ ...prev, validFrom: e.target.value }))} /></div>
              <div><Label>Date fin *</Label><Input type="date" value={newPromo.validTo} onChange={(e) => setNewPromo(prev => ({ ...prev, validTo: e.target.value }))} /></div>
            </div>
            <div><Label>Max utilisations</Label><Input type="number" value={newPromo.maxUsage || ''} onChange={(e) => setNewPromo(prev => ({ ...prev, maxUsage: e.target.value ? parseInt(e.target.value) : undefined }))} placeholder="Illimité" /></div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setShowAddModal(false); setEditingPromo(null); resetForm(); }}>Annuler</Button>
              <Button onClick={editingPromo ? handleUpdate : handleCreate} className="bg-orange-500 hover:bg-orange-600">
                {editingPromo ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
