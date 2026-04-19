'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  Pause, 
  Play, 
  XCircle,
  RefreshCcw,
  UtensilsCrossed,
  CalendarX,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/api-client';
import { useCurrencySafe } from '@/lib/currency-context';

const STATUS_CONFIG = {
  active: { label: 'Actif', color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
  paused: { label: 'En pause', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Pause },
  expired: { label: 'Expiré', color: 'bg-slate-100 text-slate-700 border-slate-300', icon: AlertCircle },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
};

interface Subscription {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  planId: string;
  planName: string;
  mealsPerDay: number;
  daysPerWeek: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'paused' | 'expired' | 'cancelled';
  autoRenew: boolean;
  monthlyPrice: number;
  nextBillingDate: string;
  skippedDays: string[];
  pauseStartDate?: string;
  pauseEndDate?: string;
  totalMealsDelivered: number;
  deliveryAddress?: string;
  deliveryNotes?: string;
  preferredTime: string;
  dietaryNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionDetailProps {
  subscription: Subscription;
  onClose: () => void;
  onUpdate: () => void;
}

export function SubscriptionDetail({ subscription, onClose, onUpdate }: SubscriptionDetailProps) {
  const { formatCurrency } = useCurrencySafe();
  const [isLoading, setIsLoading] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [pauseEndDate, setPauseEndDate] = useState('');
  const [skipDate, setSkipDate] = useState('');
  const [skipReason, setSkipReason] = useState('');

  const statusConfig = STATUS_CONFIG[subscription.status];
  const StatusIcon = statusConfig.icon;

  // Handle pause/resume
  const handlePauseResume = async () => {
    setIsLoading(true);
    try {
      const action = subscription.status === 'active' ? 'pause' : 'resume';
      const body: any = { id: subscription.id, action };
      if (action === 'pause' && pauseEndDate) {
        body.pauseEndDate = pauseEndDate;
      }

      const response = await fetchWithAuth('/api/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (data.success) {
        toast.success(subscription.status === 'active' ? 'Abonnement mis en pause' : 'Abonnement repris');
        onUpdate();
        setShowPauseDialog(false);
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle skip day
  const handleSkipDay = async () => {
    if (!skipDate) {
      toast.error('Veuillez sélectionner une date');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchWithAuth('/api/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: subscription.id,
          action: 'skipDay',
          skipDate
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Jour ajouté aux exceptions');
        onUpdate();
        setShowSkipDialog(false);
        setSkipDate('');
        setSkipReason('');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle unskip day
  const handleUnskipDay = async (date: string) => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth('/api/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: subscription.id,
          action: 'unskipDay',
          skipDate: date
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Jour retiré des exceptions');
        onUpdate();
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth('/api/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: subscription.id,
          action: 'cancel'
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Abonnement annulé');
        onUpdate();
        setShowCancelDialog(false);
      }
    } catch (error) {
      toast.error('Erreur lors de l\'annulation');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle auto-renew toggle
  const handleAutoRenewToggle = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth('/api/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: subscription.id,
          action: 'updateAutoRenew',
          autoRenew: !subscription.autoRenew
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(subscription.autoRenew ? 'Renouvellement automatique désactivé' : 'Renouvellement automatique activé');
        onUpdate();
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date for skip
  const getMinSkipDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
        <div className="flex items-center gap-3">
          <Badge className={statusConfig.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
          <span className="text-sm text-muted-foreground">
            ID: {subscription.id}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          Créé le {new Date(subscription.createdAt).toLocaleDateString('fr-FR')}
        </div>
      </div>

      {/* Customer Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4" />
            Client
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <p className="font-medium">{subscription.customerName}</p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            {subscription.customerPhone}
          </p>
          {subscription.customerEmail && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {subscription.customerEmail}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Plan Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Formule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-medium">{subscription.planName}</p>
              <p className="text-sm text-muted-foreground">
                {subscription.mealsPerDay} repas/jour • {subscription.daysPerWeek} jours/semaine
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(subscription.monthlyPrice)}
              </p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
            <div>
              <p className="text-muted-foreground">Date de début</p>
              <p className="font-medium">
                {new Date(subscription.startDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Prochaine facturation</p>
              <p className="font-medium">
                {new Date(subscription.nextBillingDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Heure préférée</p>
              <p className="font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {subscription.preferredTime}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Repas livrés</p>
              <p className="font-medium">{subscription.totalMealsDelivered}</p>
            </div>
          </div>
          {subscription.endDate && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm text-muted-foreground">
                Date de fin: {new Date(subscription.endDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Info */}
      {subscription.deliveryAddress && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Livraison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{subscription.deliveryAddress}</p>
            {subscription.deliveryNotes && (
              <p className="text-sm text-muted-foreground mt-1">
                Note: {subscription.deliveryNotes}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dietary Notes */}
      {subscription.dietaryNotes && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-sm text-amber-700">
              <strong>Préférences alimentaires:</strong> {subscription.dietaryNotes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pause Info */}
      {subscription.status === 'paused' && subscription.pauseStartDate && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-700 mb-2">
              <Pause className="h-4 w-4" />
              <span className="font-medium">Abonnement en pause</span>
            </div>
            <p className="text-sm text-yellow-600">
              Du {new Date(subscription.pauseStartDate).toLocaleDateString('fr-FR')}
              {subscription.pauseEndDate && (
                <> au {new Date(subscription.pauseEndDate).toLocaleDateString('fr-FR')}</>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Skip Days Management */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarX className="h-4 w-4" />
              Jours sans livraison
            </CardTitle>
            {subscription.status === 'active' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSkipDialog(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {subscription.skippedDays.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun jour sans livraison planifié
            </p>
          ) : (
            <div className="space-y-2">
              {subscription.skippedDays.map((date) => (
                <div key={date} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-sm">
                    {new Date(date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleUnskipDay(date)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto Renew */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Renouvellement automatique</Label>
              <p className="text-sm text-muted-foreground">
                L'abonnement se renouvelle automatiquement chaque mois
              </p>
            </div>
            <Switch
              checked={subscription.autoRenew}
              onCheckedChange={handleAutoRenewToggle}
              disabled={isLoading || subscription.status !== 'active'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-4">
        {subscription.status === 'active' && (
          <>
            <Button variant="outline" onClick={() => setShowPauseDialog(true)}>
              <Pause className="h-4 w-4 mr-2" />
              Mettre en pause
            </Button>
            <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
              <XCircle className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          </>
        )}
        {subscription.status === 'paused' && (
          <Button onClick={handlePauseResume} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Reprendre
          </Button>
        )}
      </div>

      {/* Pause Dialog */}
      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mettre en pause</DialogTitle>
            <DialogDescription>
              Suspendre temporairement l'abonnement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date de reprise (optionnel)</Label>
              <Input
                type="date"
                min={getMinSkipDate()}
                value={pauseEndDate}
                onChange={(e) => setPauseEndDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Laissez vide pour une pause indéterminée
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPauseDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handlePauseResume} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Mettre en pause
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skip Day Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jour sans livraison</DialogTitle>
            <DialogDescription>
              Ajouter un jour où la livraison ne sera pas effectuée
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                min={getMinSkipDate()}
                value={skipDate}
                onChange={(e) => setSkipDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Raison (optionnel)</Label>
              <Textarea
                placeholder="Ex: Voyage, événement..."
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSkipDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSkipDay} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler l'abonnement</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler cet abonnement ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Cette action est irréversible. L'abonnement sera annulé immédiatement et 
              le client ne recevra plus de repas.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Retour
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Annuler l'abonnement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SubscriptionDetail;
