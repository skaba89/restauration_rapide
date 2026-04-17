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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Loader2, Calendar, ShoppingCart } from 'lucide-react';
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

interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email?: string;
  address?: string;
}

interface OrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface PurchaseOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItem[];
  onSuccess?: () => void;
}

// Format GNF currency
const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} GNF`;

export function PurchaseOrderModal({
  open,
  onOpenChange,
  items,
  onSuccess,
}: PurchaseOrderModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suppliers] = useState<Supplier[]>([]);
  
  // Form state
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  // Add item state
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
  const selectedItem = items.find(i => i.id === selectedItemId);

  const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

  useEffect(() => {
    // Set default price when item is selected
    if (selectedItem) {
      setItemPrice(selectedItem.cost.toString());
    }
  }, [selectedItem]);

  const handleAddItem = () => {
    if (!selectedItemId || !itemQuantity || !itemPrice) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs pour l\'article',
        variant: 'destructive',
      });
      return;
    }

    const qty = parseFloat(itemQuantity);
    const price = parseFloat(itemPrice);

    if (qty <= 0 || price <= 0) {
      toast({
        title: 'Erreur',
        description: 'La quantité et le prix doivent être supérieurs à 0',
        variant: 'destructive',
      });
      return;
    }

    // Check if item already exists
    const existingIndex = orderItems.findIndex(i => i.itemId === selectedItemId);
    if (existingIndex >= 0) {
      // Update existing item
      const updated = [...orderItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + qty,
        totalPrice: (updated[existingIndex].quantity + qty) * price,
      };
      setOrderItems(updated);
    } else {
      // Add new item
      setOrderItems([
        ...orderItems,
        {
          itemId: selectedItemId,
          itemName: selectedItem?.name || '',
          quantity: qty,
          unitPrice: price,
          totalPrice: qty * price,
        },
      ]);
    }

    // Reset add item form
    setSelectedItemId('');
    setItemQuantity('');
    setItemPrice('');
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedSupplierId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un fournisseur',
        variant: 'destructive',
      });
      return;
    }

    if (orderItems.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez ajouter au moins un article',
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
          action: 'create_purchase_order',
          supplierId: selectedSupplierId,
          supplierName: selectedSupplier?.name,
          items: orderItems,
          totalAmount,
          expectedDelivery,
          notes,
          createdBy: 'Admin',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Succès',
          description: 'Commande créée avec succès',
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
        description: 'Impossible de créer la commande',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedSupplierId('');
    setExpectedDelivery('');
    setNotes('');
    setOrderItems([]);
    setSelectedItemId('');
    setItemQuantity('');
    setItemPrice('');
  };

  // Get low stock items for suggestions
  const lowStockItems = items.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Nouvelle Commande d'Achat
          </DialogTitle>
          <DialogDescription>
            Créez une commande pour réapprovisionner votre stock
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            {/* Supplier Selection */}
            <div className="space-y-2">
              <Label>Fournisseur *</Label>
              <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      <div className="flex flex-col">
                        <span>{supplier.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {supplier.phone}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSupplier && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  <p><span className="font-medium">Contact:</span> {selectedSupplier.contact}</p>
                  <p><span className="font-medium">Téléphone:</span> {selectedSupplier.phone}</p>
                  {selectedSupplier.email && (
                    <p><span className="font-medium">Email:</span> {selectedSupplier.email}</p>
                  )}
                </div>
              )}
            </div>

            {/* Expected Delivery */}
            <div className="space-y-2">
              <Label htmlFor="expectedDelivery" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date de livraison prévue
              </Label>
              <Input
                id="expectedDelivery"
                type="date"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <Separator />

            {/* Add Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Articles à commander</Label>
                {lowStockItems.length > 0 && (
                  <Badge variant="outline" className="text-yellow-600">
                    {lowStockItems.length} article(s) en stock bas
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Article" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <div className="flex items-center gap-2">
                          <span>{item.name}</span>
                          {item.status === 'low_stock' && (
                            <Badge variant="outline" className="text-yellow-600 text-xs">
                              Bas
                            </Badge>
                          )}
                          {item.status === 'out_of_stock' && (
                            <Badge variant="outline" className="text-red-600 text-xs">
                              Rupture
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                  placeholder="Qté"
                />

                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="Prix unit."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={handleAddItem}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Order Items List */}
              {orderItems.length > 0 && (
                <div className="border rounded-lg divide-y">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3">
                      <div>
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {orderItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucun article ajouté</p>
                  <p className="text-sm">Sélectionnez des articles ci-dessus</p>
                </div>
              )}
            </div>

            {/* Total */}
            {orderItems.length > 0 && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <span className="font-medium">Total de la commande</span>
                <span className="text-xl font-bold">{formatCurrency(totalAmount)}</span>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instructions spéciales, conditions de livraison..."
                rows={2}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading || orderItems.length === 0}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer la commande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PurchaseOrderModal;