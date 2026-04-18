'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  cost: number;
  status: string;
  supplier?: string;
}

interface StockMovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
  items?: InventoryItem[];
  onSuccess?: () => void;
}

const MOVEMENT_REASONS = {
  in: [
    { value: 'Livraison fournisseur', label: 'Livraison fournisseur' },
    { value: 'Retour client', label: 'Retour client' },
    { value: 'Transfert entrant', label: 'Transfert entrant' },
    { value: 'Ajustement positif', label: 'Ajustement positif' },
    { value: 'Autre', label: 'Autre' },
  ],
  out: [
    { value: 'Utilisation cuisine', label: 'Utilisation cuisine' },
    { value: 'Perte/Endommagé', label: 'Perte/Endommagé' },
    { value: 'Expiration', label: 'Expiration' },
    { value: 'Transfert sortant', label: 'Transfert sortant' },
    { value: 'Vol', label: 'Vol' },
    { value: 'Autre', label: 'Autre' },
  ],
  adjustment: [
    { value: 'Inventaire', label: 'Inventaire' },
    { value: 'Correction erreur', label: 'Correction erreur' },
    { value: 'Contrôle qualité', label: 'Contrôle qualité' },
    { value: 'Autre', label: 'Autre' },
  ],
};

export function StockMovementModal({
  open,
  onOpenChange,
  item,
  items = [],
  onSuccess,
}: StockMovementModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>(item?.id || '');
  const [movementType, setMovementType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (item) {
      setSelectedItemId(item.id);
    }
  }, [item]);

  const selectedItem = items.find(i => i.id === selectedItemId) || item;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-700';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-700';
      case 'out_of_stock':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'En stock';
      case 'low_stock':
        return 'Stock bas';
      case 'out_of_stock':
        return 'Rupture';
      default:
        return status;
    }
  };

  const calculateNewQuantity = () => {
    const currentQty = selectedItem?.quantity || 0;
    const qty = parseFloat(quantity) || 0;

    if (movementType === 'in') {
      return currentQty + qty;
    } else if (movementType === 'out') {
      return Math.max(0, currentQty - qty);
    } else {
      return qty;
    }
  };

  const handleSubmit = async () => {
    if (!selectedItemId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un article',
        variant: 'destructive',
      });
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer une quantité valide',
        variant: 'destructive',
      });
      return;
    }

    if (!reason) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une raison',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stock_movement',
          itemId: selectedItemId,
          type: movementType,
          quantity: parseFloat(quantity),
          reason,
          notes,
          createdBy: 'Admin',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Succès',
          description: 'Mouvement de stock enregistré',
        });
        onOpenChange(false);
        resetForm();
        onSuccess?.();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le mouvement',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedItemId(item?.id || '');
    setMovementType('in');
    setQuantity('');
    setReason('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Mouvement de Stock
          </DialogTitle>
          <DialogDescription>
            Enregistrez une entrée, sortie ou ajustement de stock
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Item Selection */}
          <div className="space-y-2">
            <Label>Article *</Label>
            {item ? (
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Stock actuel: {item.quantity} {item.unit}
                  </p>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {getStatusLabel(item.status)}
                </Badge>
              </div>
            ) : (
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un article" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      <div className="flex items-center gap-2">
                        <span>{i.name}</span>
                        <span className="text-muted-foreground">
                          ({i.quantity} {i.unit})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Movement Type */}
          <div className="space-y-2">
            <Label>Type de mouvement *</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={movementType === 'in' ? 'default' : 'outline'}
                className={`flex items-center gap-2 ${movementType === 'in' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                onClick={() => {
                  setMovementType('in');
                  setReason('');
                }}
              >
                <ArrowUpRight className="h-4 w-4" />
                Entrée
              </Button>
              <Button
                type="button"
                variant={movementType === 'out' ? 'default' : 'outline'}
                className={`flex items-center gap-2 ${movementType === 'out' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                onClick={() => {
                  setMovementType('out');
                  setReason('');
                }}
              >
                <ArrowDownRight className="h-4 w-4" />
                Sortie
              </Button>
              <Button
                type="button"
                variant={movementType === 'adjustment' ? 'default' : 'outline'}
                className="flex items-center gap-2"
                onClick={() => {
                  setMovementType('adjustment');
                  setReason('');
                }}
              >
                <ArrowRight className="h-4 w-4" />
                Ajustement
              </Button>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              {movementType === 'adjustment' ? 'Nouvelle quantité *' : 'Quantité *'}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-16">
                {selectedItem?.unit || 'unités'}
              </span>
            </div>
            {selectedItem && quantity && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {movementType === 'adjustment' ? 'Stock actuel:' : 'Nouveau stock:'}
                </span>
                <span className={`font-medium ${
                  movementType !== 'adjustment' && calculateNewQuantity() <= selectedItem.minStock
                    ? 'text-yellow-600'
                    : 'text-foreground'
                }`}>
                  {movementType === 'adjustment' ? `${selectedItem.quantity}` : `${calculateNewQuantity()}`} {selectedItem.unit}
                </span>
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Raison *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une raison" />
              </SelectTrigger>
              <SelectContent>
                {MOVEMENT_REASONS[movementType].map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajouter des notes..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StockMovementModal;
