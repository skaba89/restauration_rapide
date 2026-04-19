'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  UtensilsCrossed, 
  RefreshCcw,
  MapPin,
  User,
  Phone,
  Mail,
  ShoppingBag,
  Loader2
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';
import { toast } from 'sonner';

// Format GNF currency
const formatCurrency = (amount: number) => `${amount?.toLocaleString('fr-FR') || 0} GNF`;

interface PreOrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface PreOrderFormProps {
  preOrder?: any;
  onClose: () => void;
  onSuccess: () => void;
}

// Demo menu items for selection
const MENU_ITEMS = [
  { id: '1', name: 'Attieké Poisson Grillé', price: 15000, category: 'Plats' },
  { id: '2', name: 'Kedjenou de Poulet', price: 12000, category: 'Plats' },
  { id: '3', name: 'Thiéboudienne', price: 16000, category: 'Plats' },
  { id: '4', name: 'Poulet Braisé', price: 18000, category: 'Plats' },
  { id: '5', name: 'Garba', price: 7000, category: 'Plats' },
  { id: '6', name: 'Riz Gras', price: 8000, category: 'Plats' },
  { id: '7', name: 'Foutou Banane', price: 10000, category: 'Plats' },
  { id: '8', name: 'Mafe', price: 12000, category: 'Plats' },
  { id: '9', name: 'Yassa Poisson', price: 14000, category: 'Plats' },
  { id: '10', name: 'Poulet DG', price: 22000, category: 'Plats' },
  { id: '11', name: 'Alloco', price: 3000, category: 'Accompagnements' },
  { id: '12', name: 'Plantain Frit', price: 4000, category: 'Accompagnements' },
  { id: '13', name: 'Brochettes', price: 2500, category: 'Accompagnements' },
  { id: '14', name: 'Jus de Bissap', price: 5000, category: 'Boissons' },
  { id: '15', name: 'Jus de Gingembre', price: 5000, category: 'Boissons' },
];

export function PreOrderForm({ preOrder, onClose, onSuccess }: PreOrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [customerName, setCustomerName] = useState(preOrder?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(preOrder?.customerPhone || '');
  const [customerEmail, setCustomerEmail] = useState(preOrder?.customerEmail || '');
  const [scheduledDate, setScheduledDate] = useState(preOrder?.scheduledDate || '');
  const [scheduledTime, setScheduledTime] = useState(preOrder?.scheduledTime || '12:00');
  const [orderType, setOrderType] = useState(preOrder?.orderType || 'takeaway');
  const [deliveryAddress, setDeliveryAddress] = useState(preOrder?.deliveryAddress || '');
  const [notes, setNotes] = useState(preOrder?.notes || '');
  const [isRecurring, setIsRecurring] = useState(preOrder?.isRecurring || false);
  const [recurringPattern, setRecurringPattern] = useState<'daily' | 'weekly' | 'monthly'>(preOrder?.recurringPattern || 'weekly');
  const [recurringEndDate, setRecurringEndDate] = useState(preOrder?.recurringEndDate || '');
  
  // Items
  const [items, setItems] = useState<PreOrderItem[]>(preOrder?.items || []);
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState('');

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Add item to order
  const handleAddItem = () => {
    if (!selectedMenuItem) return;
    
    const menuItem = MENU_ITEMS.find(m => m.id === selectedMenuItem);
    if (!menuItem) return;

    const newItem: PreOrderItem = {
      id: `${Date.now()}`,
      name: menuItem.name,
      quantity: itemQuantity,
      price: menuItem.price,
      notes: itemNotes || undefined
    };

    setItems([...items, newItem]);
    setSelectedMenuItem('');
    setItemQuantity(1);
    setItemNotes('');
    toast.success('Article ajouté');
  };

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  // Update item quantity
  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setItems(items.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  // Validate form
  const validateForm = () => {
    if (!customerName.trim()) {
      toast.error('Le nom du client est requis');
      return false;
    }
    if (!customerPhone.trim()) {
      toast.error('Le numéro de téléphone est requis');
      return false;
    }
    if (!scheduledDate) {
      toast.error('La date est requise');
      return false;
    }
    if (!scheduledTime) {
      toast.error('L\'heure est requise');
      return false;
    }
    if (items.length === 0) {
      toast.error('Au moins un article est requis');
      return false;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      toast.error('L\'adresse de livraison est requise');
      return false;
    }
    if (isRecurring && !recurringEndDate) {
      toast.error('La date de fin de récurrence est requise');
      return false;
    }

    // Check date is in future
    const scheduled = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduled < new Date()) {
      toast.error('La date doit être dans le futur');
      return false;
    }

    return true;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth('/api/pre-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          scheduledDate,
          scheduledTime,
          items,
          isRecurring,
          recurringPattern: isRecurring ? recurringPattern : undefined,
          recurringEndDate: isRecurring ? recurringEndDate : undefined,
          notes,
          orderType,
          deliveryAddress
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Pré-commande créée avec succès');
        onSuccess();
      } else {
        toast.error(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error creating pre-order:', error);
      toast.error('Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group menu items by category
  const menuCategories = MENU_ITEMS.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof MENU_ITEMS>);

  return (
    <div className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Informations Client
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customerName">Nom du client *</Label>
            <Input
              id="customerName"
              placeholder="Nom complet"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Téléphone *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="customerPhone"
                placeholder="+224 62 XXX XX XX"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="customerEmail">Email (optionnel)</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="customerEmail"
                type="email"
                placeholder="email@exemple.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date et Heure
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Date *</Label>
            <Input
              id="scheduledDate"
              type="date"
              min={getMinDate()}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduledTime">Heure *</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="scheduledTime"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Type */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Type de Commande
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={orderType} onValueChange={setOrderType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="takeaway">À emporter</SelectItem>
              <SelectItem value="dine_in">Sur place</SelectItem>
              <SelectItem value="delivery">Livraison</SelectItem>
            </SelectContent>
          </Select>

          {orderType === 'delivery' && (
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Adresse de livraison *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="deliveryAddress"
                  placeholder="Adresse complète, quartier, landmarks..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="pl-10 min-h-[80px]"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Articles Commandés
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add item form */}
          <div className="grid gap-3 sm:grid-cols-4">
            <Select value={selectedMenuItem} onValueChange={setSelectedMenuItem}>
              <SelectTrigger className="sm:col-span-2">
                <SelectValue placeholder="Sélectionner un article" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(menuCategories).map(([category, menuItems]) => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      {category}
                    </div>
                    {menuItems.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} - {formatCurrency(item.price)}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={1}
              value={itemQuantity}
              onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
              placeholder="Qté"
            />
            <Button onClick={handleAddItem} disabled={!selectedMenuItem}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </div>

          {/* Items list */}
          {items.length > 0 && (
            <div className="space-y-2 mt-4">
              <Separator />
              <div className="font-medium">Articles ajoutés:</div>
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mt-1">Note: {item.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-green-600">{formatCurrency(total)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recurring Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Commande Récurrente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Activer la récurrence</Label>
              <p className="text-sm text-muted-foreground">
                Répéter cette commande automatiquement
              </p>
            </div>
            <Switch
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
          </div>

          {isRecurring && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Fréquence</Label>
                <Select value={recurringPattern} onValueChange={(v: any) => setRecurringPattern(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Tous les jours</SelectItem>
                    <SelectItem value="weekly">Toutes les semaines</SelectItem>
                    <SelectItem value="monthly">Tous les mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Jusqu'au</Label>
                <Input
                  type="date"
                  min={scheduledDate || getMinDate()}
                  value={recurringEndDate}
                  onChange={(e) => setRecurringEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Instructions spéciales, préférences, allergies..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Créer la pré-commande
        </Button>
      </div>
    </div>
  );
}

export default PreOrderForm;
