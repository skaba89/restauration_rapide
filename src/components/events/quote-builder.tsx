'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  User,
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Trash2,
  Calculator,
  Send,
  Save,
  FileText,
  Utensils,
  Package,
  UserCheck,
  Percent,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/api-client';

// Format GNF currency
const formatCurrency = (amount: number) => `${amount?.toLocaleString('fr-FR') || 0} GNF`;

// Types
interface QuoteItem {
  id: string;
  category: 'menu' | 'equipment' | 'staff' | 'service';
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Event {
  id: string;
  eventType: 'wedding' | 'birthday' | 'corporate' | 'baptism' | 'other';
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  eventName?: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  guestCount: number;
  notes?: string;
}

// Event type labels (French)
const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Mariage',
  birthday: 'Anniversaire',
  corporate: 'Entreprise',
  baptism: 'Baptême',
  other: 'Autre',
};

// Popular menu items (demo)
const POPULAR_MENU_ITEMS = [
  { name: 'Riz Gras au Poulet', price: 35000 },
  { name: 'Attieké Poisson Grillé', price: 45000 },
  { name: 'Maffé de Bœuf', price: 50000 },
  { name: 'Thiéboudienne', price: 40000 },
  { name: 'Kedjenou de Poulet', price: 35000 },
  { name: 'Sauce Arachide', price: 30000 },
  { name: 'Foutou Banane', price: 25000 },
  { name: 'Alloco Sauce Graine', price: 20000 },
  { name: 'Brochettes de Poulet', price: 15000 },
  { name: 'Poulet Braisé', price: 12000 },
  { name: 'Salade Marocaine', price: 15000 },
  { name: 'Jus de Bissap', price: 5000 },
  { name: 'Jus de Gingembre', price: 5000 },
  { name: 'Cocktail maison', price: 10000 },
  { name: 'Gâteau Mariage (pièce)', price: 1500000 },
  { name: 'Gâteau Anniversaire', price: 300000 },
  { name: 'Gâteau Baptême', price: 250000 },
];

// Equipment items (demo)
const EQUIPMENT_ITEMS = [
  { name: 'Table ronde (10 places)', price: 25000 },
  { name: 'Table rectangulaire', price: 20000 },
  { name: 'Chaise standard', price: 5000 },
  { name: 'Chaise premium', price: 7500 },
  { name: 'Chaise décorée', price: 10000 },
  { name: 'Tente 10x10m', price: 800000 },
  { name: 'Tente 20x30m', price: 2500000 },
  { name: 'Décoration florale', price: 3000000 },
  { name: 'Décoration thématique', price: 400000 },
  { name: 'Sono/Lumière', price: 500000 },
  { name: 'Projecteur & Écran', price: 150000 },
  { name: 'Bar mobile', price: 200000 },
  { name: 'Structure gonflable', price: 300000 },
];

// Staff items (demo)
const STAFF_ITEMS = [
  { name: 'Chef principal', price: 200000 },
  { name: 'Chef', price: 150000 },
  { name: 'Cuisinier', price: 100000 },
  { name: 'Serveur', price: 50000 },
  { name: 'Barman', price: 75000 },
  { name: 'Animateur', price: 200000 },
  { name: 'Décorateur', price: 150000 },
  { name: 'DJ', price: 250000 },
  { name: 'Photographe', price: 300000 },
];

interface QuoteBuilderProps {
  event?: Event | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuoteBuilder({ event, onClose, onSuccess }: QuoteBuilderProps) {
  // Customer info state
  const [customerName, setCustomerName] = useState(event?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(event?.customerPhone || '');
  const [customerEmail, setCustomerEmail] = useState(event?.customerEmail || '');

  // Event info state
  const [eventName, setEventName] = useState(event?.eventName || '');
  const [eventType, setEventType] = useState<Event['eventType']>(event?.eventType || 'birthday');
  const [eventDate, setEventDate] = useState(
    event ? new Date(event.date).toISOString().split('T')[0] : ''
  );
  const [startTime, setStartTime] = useState(event?.startTime || '12:00');
  const [endTime, setEndTime] = useState(event?.endTime || '18:00');
  const [location, setLocation] = useState(event?.location || '');
  const [guestCount, setGuestCount] = useState(event?.guestCount?.toString() || '50');
  const [notes, setNotes] = useState(event?.notes || '');

  // Quote items state
  const [menuItems, setMenuItems] = useState<QuoteItem[]>([]);
  const [equipmentItems, setEquipmentItems] = useState<QuoteItem[]>([]);
  const [staffItems, setStaffItems] = useState<QuoteItem[]>([]);

  // Financial state
  const [discount, setDiscount] = useState('0');
  const [depositPercentage, setDepositPercentage] = useState('30');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('menu');

  // Generate unique ID
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  // Add menu item
  const addMenuItem = (itemName: string, price: number) => {
    const quantity = parseInt(guestCount) || 1;
    const newItem: QuoteItem = {
      id: generateId(),
      category: 'menu',
      name: itemName,
      quantity,
      unitPrice: price,
      totalPrice: quantity * price,
    };
    setMenuItems([...menuItems, newItem]);
  };

  // Add equipment item
  const addEquipmentItem = (itemName: string, price: number) => {
    const newItem: QuoteItem = {
      id: generateId(),
      category: 'equipment',
      name: itemName,
      quantity: 1,
      unitPrice: price,
      totalPrice: price,
    };
    setEquipmentItems([...equipmentItems, newItem]);
  };

  // Add staff item
  const addStaffItem = (itemName: string, price: number) => {
    const newItem: QuoteItem = {
      id: generateId(),
      category: 'staff',
      name: itemName,
      quantity: 1,
      unitPrice: price,
      totalPrice: price,
    };
    setStaffItems([...staffItems, newItem]);
  };

  // Update item quantity
  const updateItemQuantity = (
    items: QuoteItem[],
    setItems: React.Dispatch<React.SetStateAction<QuoteItem[]>>,
    itemId: string,
    quantity: number
  ) => {
    setItems(
      items.map((item) =>
        item.id === itemId
          ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
          : item
      )
    );
  };

  // Remove item
  const removeItem = (
    items: QuoteItem[],
    setItems: React.Dispatch<React.SetStateAction<QuoteItem[]>>,
    itemId: string
  ) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  // Calculate totals
  const allItems = [...menuItems, ...equipmentItems, ...staffItems];
  const subtotal = allItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = parseFloat(discount) || 0;
  const totalAmount = subtotal - discountAmount;
  const depositPercent = parseFloat(depositPercentage) || 30;
  const depositAmount = Math.round(totalAmount * (depositPercent / 100));

  // Submit quote
  const handleSubmit = async (sendNow: boolean) => {
    if (!customerName || !customerPhone || !eventDate) {
      toast.error('Veuillez remplir les informations obligatoires');
      return;
    }

    if (allItems.length === 0) {
      toast.error('Veuillez ajouter au moins un article au devis');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth('/api/events/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event?.id,
          customerName,
          customerPhone,
          customerEmail,
          eventName,
          eventType,
          date: eventDate,
          startTime,
          endTime,
          location,
          guestCount: parseInt(guestCount),
          items: allItems,
          discount: discountAmount,
          depositPercentage: depositPercent,
          notes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // If send now, update status to sent
        if (sendNow) {
          await fetchWithAuth('/api/events/quotes', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: data.quote.id, action: 'send' }),
          });
          toast.success('Devis créé et envoyé au client');
        } else {
          toast.success('Devis créé en brouillon');
        }
        onSuccess();
      } else {
        toast.error(data.error || 'Erreur lors de la création du devis');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Créer un Devis
        </h2>
        <p className="text-muted-foreground">
          {event ? `Devis pour: ${event.eventName || EVENT_TYPE_LABELS[event.eventType]}` : 'Nouveau devis traiteur'}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Customer & Event Info */}
        <div className="space-y-4">
          {/* Customer Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Informations Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="customerName">Nom complet *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nom du client"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Téléphone *</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+224 62 00 00 00"
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="client@email.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Event Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Détails de l'Événement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="eventName">Nom de l'événement</Label>
                <Input
                  id="eventName"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Mariage Koné - Diallo"
                />
              </div>
              <div>
                <Label htmlFor="eventType">Type d'événement *</Label>
                <Select value={eventType} onValueChange={(v) => setEventType(v as Event['eventType'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wedding">Mariage</SelectItem>
                    <SelectItem value="birthday">Anniversaire</SelectItem>
                    <SelectItem value="corporate">Entreprise</SelectItem>
                    <SelectItem value="baptism">Baptême</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="eventDate">Date *</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="guestCount">Convives</Label>
                  <Input
                    id="guestCount"
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="startTime">Début</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">Fin</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Lieu</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Adresse ou nom du lieu"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informations complémentaires..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column: Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Articles du Devis</CardTitle>
            <CardDescription>Ajoutez les éléments menu, équipements et personnel</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="menu" className="flex items-center gap-1">
                  <Utensils className="h-4 w-4" />
                  Menu ({menuItems.length})
                </TabsTrigger>
                <TabsTrigger value="equipment" className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  Équipements ({equipmentItems.length})
                </TabsTrigger>
                <TabsTrigger value="staff" className="flex items-center gap-1">
                  <UserCheck className="h-4 w-4" />
                  Personnel ({staffItems.length})
                </TabsTrigger>
              </TabsList>

              {/* Menu Tab */}
              <TabsContent value="menu" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POPULAR_MENU_ITEMS.slice(0, 12).map((item) => (
                    <Button
                      key={item.name}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2"
                      onClick={() => addMenuItem(item.name, item.price)}
                    >
                      <Plus className="h-3 w-3 mr-1 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Button>
                  ))}
                </div>
                
                {menuItems.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {menuItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(item.unitPrice)}/unité</p>
                        </div>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(menuItems, setMenuItems, item.id, parseInt(e.target.value) || 0)}
                          className="w-20 h-8"
                          min="1"
                        />
                        <span className="font-semibold text-sm w-24 text-right">
                          {formatCurrency(item.totalPrice)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => removeItem(menuItems, setMenuItems, item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Equipment Tab */}
              <TabsContent value="equipment" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EQUIPMENT_ITEMS.map((item) => (
                    <Button
                      key={item.name}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2"
                      onClick={() => addEquipmentItem(item.name, item.price)}
                    >
                      <Plus className="h-3 w-3 mr-1 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Button>
                  ))}
                </div>

                {equipmentItems.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {equipmentItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(item.unitPrice)}/unité</p>
                        </div>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(equipmentItems, setEquipmentItems, item.id, parseInt(e.target.value) || 0)}
                          className="w-20 h-8"
                          min="1"
                        />
                        <span className="font-semibold text-sm w-24 text-right">
                          {formatCurrency(item.totalPrice)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => removeItem(equipmentItems, setEquipmentItems, item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Staff Tab */}
              <TabsContent value="staff" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STAFF_ITEMS.map((item) => (
                    <Button
                      key={item.name}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2"
                      onClick={() => addStaffItem(item.name, item.price)}
                    >
                      <Plus className="h-3 w-3 mr-1 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Button>
                  ))}
                </div>

                {staffItems.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {staffItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(item.unitPrice)}</p>
                        </div>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(staffItems, setStaffItems, item.id, parseInt(e.target.value) || 0)}
                          className="w-20 h-8"
                          min="1"
                        />
                        <span className="font-semibold text-sm w-24 text-right">
                          {formatCurrency(item.totalPrice)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => removeItem(staffItems, setStaffItems, item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>

          {/* Summary */}
          <CardFooter className="flex-col border-t">
            <div className="w-full space-y-3 py-4">
              {/* Discount */}
              <div className="flex items-center gap-4">
                <Label className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Remise
                </Label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-32"
                  min="0"
                />
                <span className="text-muted-foreground">GNF</span>
              </div>

              {/* Deposit */}
              <div className="flex items-center gap-4">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Acompte
                </Label>
                <Select value={depositPercentage} onValueChange={setDepositPercentage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20%</SelectItem>
                    <SelectItem value="30">30%</SelectItem>
                    <SelectItem value="40">40%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sous-total</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Remise</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-amber-600">
                  <span>Acompte ({depositPercent}%)</span>
                  <span>{formatCurrency(depositAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Solde à payer</span>
                  <span>{formatCurrency(totalAmount - depositAmount)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Annuler
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
                <Button
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default QuoteBuilder;
