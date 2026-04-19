'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Users,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  Printer,
  Send,
  Edit,
  Trash2,
  Utensils,
  Package,
  UserCheck,
  MessageSquare,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCurrencySafe } from '@/lib/currency-context';

// Types
interface EventMenuItem {
  id: string;
  menuItemId?: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
}

interface EventEquipment {
  id: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
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
  menu: EventMenuItem[];
  equipment: EventEquipment[];
  staffRequired: string[];
  status: 'inquiry' | 'quote_sent' | 'confirmed' | 'deposit_paid' | 'completed' | 'cancelled';
  totalAmount: number;
  depositAmount: number;
  depositPaid: boolean;
  notes?: string;
  createdAt: Date;
}

// Event type labels (French)
const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Mariage',
  birthday: 'Anniversaire',
  corporate: 'Entreprise',
  baptism: 'Baptême',
  other: 'Autre',
};

// Status labels (French)
const STATUS_LABELS: Record<string, string> = {
  inquiry: 'Demande',
  quote_sent: 'Devis envoyé',
  confirmed: 'Confirmé',
  deposit_paid: 'Acompte versé',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

// Status colors
const STATUS_COLORS: Record<string, string> = {
  inquiry: 'bg-slate-100 text-slate-700 border-slate-200',
  quote_sent: 'bg-blue-100 text-blue-700 border-blue-200',
  confirmed: 'bg-amber-100 text-amber-700 border-amber-200',
  deposit_paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  completed: 'bg-purple-100 text-purple-700 border-purple-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

interface EventDetailProps {
  event: Event;
  onStatusChange: (eventId: string, status: Event['status']) => void;
  onCancel: (eventId: string) => void;
  onCreateQuote: (event: Event) => void;
  onClose: () => void;
}

export function EventDetail({
  event,
  onStatusChange,
  onCancel,
  onCreateQuote,
  onClose,
}: EventDetailProps) {
  const { formatCurrency } = useCurrencySafe();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Handle print contract
  const handlePrintContract = async () => {
    setIsPrinting(true);
    try {
      // Generate printable contract
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Veuillez autoriser les popups pour imprimer');
        return;
      }

      const contractHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Contrat - ${event.eventName || EVENT_TYPE_LABELS[event.eventType]}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #f97316; border-bottom: 2px solid #f97316; padding-bottom: 10px; }
            h2 { color: #333; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total { font-size: 18px; font-weight: bold; color: #16a34a; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
            .signature { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature-box { width: 45%; text-align: center; }
            .signature-line { border-top: 1px solid #000; margin-top: 60px; padding-top: 5px; }
          </style>
        </head>
        <body>
          <h1>KFM DELICE - Contrat de Traiteur</h1>
          
          <h2>Informations de l'Événement</h2>
          <table>
            <tr><th>Type</th><td>${EVENT_TYPE_LABELS[event.eventType]}</td></tr>
            <tr><th>Nom de l'événement</th><td>${event.eventName || '-'}</td></tr>
            <tr><th>Date</th><td>${formatDate(event.date)}</td></tr>
            <tr><th>Heure</th><td>${event.startTime} - ${event.endTime}</td></tr>
            <tr><th>Lieu</th><td>${event.location}</td></tr>
            <tr><th>Nombre de convives</th><td>${event.guestCount} personnes</td></tr>
          </table>
          
          <h2>Client</h2>
          <table>
            <tr><th>Nom</th><td>${event.customerName}</td></tr>
            <tr><th>Téléphone</th><td>${event.customerPhone}</td></tr>
            ${event.customerEmail ? `<tr><th>Email</th><td>${event.customerEmail}</td></tr>` : ''}
          </table>
          
          ${event.menu.length > 0 ? `
            <h2>Menu</h2>
            <table>
              <tr><th>Article</th><th>Quantité</th><th>Prix unitaire</th><th>Total</th></tr>
              ${event.menu.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.pricePerUnit)}</td>
                  <td>${formatCurrency(item.quantity * item.pricePerUnit)}</td>
                </tr>
              `).join('')}
            </table>
          ` : ''}
          
          ${event.equipment.length > 0 ? `
            <h2>Équipements</h2>
            <table>
              <tr><th>Équipement</th><th>Quantité</th><th>Prix unitaire</th><th>Total</th></tr>
              ${event.equipment.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.pricePerUnit)}</td>
                  <td>${formatCurrency(item.quantity * item.pricePerUnit)}</td>
                </tr>
              `).join('')}
            </table>
          ` : ''}
          
          ${event.staffRequired.length > 0 ? `
            <h2>Personnel requis</h2>
            <ul>
              ${event.staffRequired.map(s => `<li>${s}</li>`).join('')}
            </ul>
          ` : ''}
          
          <h2>Conditions financières</h2>
          <table>
            <tr><th>Montant total</th><td class="total">${formatCurrency(event.totalAmount)}</td></tr>
            <tr><th>Acompte (${event.depositAmount ? Math.round((event.depositAmount / event.totalAmount) * 100) : 30}%)</th><td>${formatCurrency(event.depositAmount)}</td></tr>
            <tr><th>Solde à payer</th><td>${formatCurrency(event.totalAmount - event.depositAmount)}</td></tr>
          </table>
          
          ${event.notes ? `
            <h2>Notes</h2>
            <p>${event.notes}</p>
          ` : ''}
          
          <div class="signature">
            <div class="signature-box">
              <p><strong>KFM DELICE</strong></p>
              <div class="signature-line">Signature et cachet</div>
            </div>
            <div class="signature-box">
              <p><strong>Le Client</strong></p>
              <div class="signature-line">Signature</div>
            </div>
          </div>
          
          <div class="footer">
            <p>KFM DELICE - Traiteur & Événements</p>
            <p>Conakry, Guinée • Tél: +224 62 00 00 00</p>
            <p>Document généré le ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(contractHtml);
      printWindow.document.close();
      printWindow.print();
      
      toast.success('Contrat généré');
    } catch (error) {
      toast.error('Erreur lors de la génération du contrat');
    } finally {
      setIsPrinting(false);
    }
  };

  // Calculate menu total
  const menuTotal = event.menu.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);
  const equipmentTotal = event.equipment.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">{event.eventName || EVENT_TYPE_LABELS[event.eventType]}</h2>
            <Badge className={STATUS_COLORS[event.status]}>
              {STATUS_LABELS[event.status]}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {EVENT_TYPE_LABELS[event.eventType]} • #{event.id}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {event.status === 'inquiry' && (
          <Button onClick={() => onCreateQuote(event)}>
            <FileText className="h-4 w-4 mr-2" />
            Créer un devis
          </Button>
        )}
        {event.status === 'quote_sent' && (
          <>
            <Button onClick={() => onStatusChange(event.id, 'confirmed')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Marquer confirmé
            </Button>
            <Button variant="outline" onClick={() => onCreateQuote(event)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier le devis
            </Button>
          </>
        )}
        {event.status === 'confirmed' && (
          <Button onClick={() => onStatusChange(event.id, 'deposit_paid')}>
            <CreditCard className="h-4 w-4 mr-2" />
            Acompte reçu
          </Button>
        )}
        {event.status === 'deposit_paid' && (
          <Button onClick={() => onStatusChange(event.id, 'completed')}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Marquer terminé
          </Button>
        )}
        <Button variant="outline" onClick={handlePrintContract} disabled={isPrinting}>
          <Printer className="h-4 w-4 mr-2" />
          Imprimer contrat
        </Button>
        {!['cancelled', 'completed'].includes(event.status) && (
          <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
            <XCircle className="h-4 w-4 mr-2" />
            Annuler
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Informations Client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold">
                {event.customerName.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{event.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${event.customerPhone}`} className="text-blue-600 hover:underline">
                {event.customerPhone}
              </a>
            </div>
            {event.customerEmail && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${event.customerEmail}`} className="text-blue-600 hover:underline">
                  {event.customerEmail}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Détails de l'Événement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{formatDate(event.date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Heure</p>
                <p className="font-medium">{event.startTime} - {event.endTime}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Convives</p>
                <p className="font-medium">{event.guestCount} personnes</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lieu</p>
                <p className="font-medium">{event.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Selection */}
      {event.menu.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Menu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-64">
              <div className="space-y-2">
                {event.menu.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.pricePerUnit)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.quantity * item.pricePerUnit)}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator className="my-4" />
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Menu</span>
              <span className="font-bold text-lg">{formatCurrency(menuTotal)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Equipment */}
      {event.equipment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Équipements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {event.equipment.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.pricePerUnit)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.quantity * item.pricePerUnit)}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator className="my-4" />
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Équipements</span>
              <span className="font-bold text-lg">{formatCurrency(equipmentTotal)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff Required */}
      {event.staffRequired.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Personnel Requis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {event.staffRequired.map((staff, index) => (
                <Badge key={index} variant="outline" className="text-sm py-1 px-3">
                  {staff}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Paiement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Montant Total</span>
              <span className="text-xl font-bold text-green-600">{formatCurrency(event.totalAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>Acompte ({event.depositAmount && event.totalAmount ? Math.round((event.depositAmount / event.totalAmount) * 100) : 30}%)</span>
                {event.depositPaid ? (
                  <Badge className="bg-green-100 text-green-700">Payé</Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-300">En attente</Badge>
                )}
              </div>
              <span className="font-medium">{formatCurrency(event.depositAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Solde à payer</span>
              <span className="font-medium">{formatCurrency(event.totalAmount - event.depositAmount)}</span>
            </div>
            
            {!event.depositPaid && ['confirmed', 'quote_sent'].includes(event.status) && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Acompte en attente de paiement</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {event.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{event.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler l'événement</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler "{event.eventName || EVENT_TYPE_LABELS[event.eventType]}" ? 
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Non, garder
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                onCancel(event.id);
                setShowCancelDialog(false);
              }}
            >
              Oui, annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EventDetail;
