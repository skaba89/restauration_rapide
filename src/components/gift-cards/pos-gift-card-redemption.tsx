'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Gift,
  CreditCard,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';

// Format GNF currency
const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} GNF`;

// Status config
const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string; icon: React.ElementType }> = {
  active: { color: 'text-green-700', bgColor: 'bg-green-100', label: 'Actif', icon: CheckCircle },
  used: { color: 'text-gray-700', bgColor: 'bg-gray-100', label: 'Utilisé', icon: XCircle },
  expired: { color: 'text-red-700', bgColor: 'bg-red-100', label: 'Expiré', icon: AlertCircle },
  cancelled: { color: 'text-red-600', bgColor: 'bg-red-50', label: 'Annulé', icon: XCircle },
};

interface GiftCardBalance {
  code: string;
  balance: number;
  initialBalance: number;
  status: string;
  isUsable: boolean;
  expiresAt: string;
  purchasedAt: string;
  recipientName?: string;
  formattedBalance: string;
  formattedExpiry: string;
}

interface PosGiftCardRedemptionProps {
  orderId?: string;
  orderTotal?: number;
  onRedeem?: (amount: number, code: string) => void;
  processedBy?: string;
}

export function PosGiftCardRedemption({
  orderId,
  orderTotal = 0,
  onRedeem,
  processedBy
}: PosGiftCardRedemptionProps) {
  const [code, setCode] = useState('');
  const [balanceInfo, setBalanceInfo] = useState<GiftCardBalance | null>(null);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [lastRedemption, setLastRedemption] = useState<{
    amount: number;
    code: string;
    remainingBalance: number;
  } | null>(null);

  // Check gift card balance
  const checkBalance = async () => {
    if (!code.trim()) {
      toast.error('Veuillez entrer un code de carte cadeau');
      return;
    }

    setChecking(true);
    setBalanceInfo(null);

    try {
      const response = await fetch(`/api/gift-cards/${code}/balance`);
      const data = await response.json();

      if (data.success) {
        setBalanceInfo(data.data);
        // Auto-fill redeem amount with order total or balance, whichever is smaller
        const maxAmount = Math.min(orderTotal, data.data.balance);
        setRedeemAmount(maxAmount > 0 ? maxAmount.toString() : '');
      } else {
        toast.error(data.error || 'Carte non trouvée');
        setBalanceInfo(null);
      }
    } catch (error) {
      toast.error('Erreur de vérification');
      setBalanceInfo(null);
    } finally {
      setChecking(false);
    }
  };

  // Redeem gift card
  const redeemGiftCard = async () => {
    if (!balanceInfo || !redeemAmount) return;

    const amount = parseFloat(redeemAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Montant invalide');
      return;
    }

    if (amount > balanceInfo.balance) {
      toast.error(`Le montant dépasse le solde disponible (${formatCurrency(balanceInfo.balance)})`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/gift-cards/${code}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          orderId,
          processedBy,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.data.message);
        
        setLastRedemption({
          amount,
          code: balanceInfo.code,
          remainingBalance: data.data.remainingBalance,
        });

        // Notify parent
        if (onRedeem) {
          onRedeem(amount, balanceInfo.code);
        }

        // Reset form
        setCode('');
        setBalanceInfo(null);
        setRedeemAmount('');
        setConfirmDialogOpen(false);
      } else {
        toast.error(data.error || 'Erreur lors du paiement');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.active;
    const Icon = config.icon;
    return (
      <Badge className={`${config.bgColor} ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-orange-600" />
          Paiement par Carte Cadeau
        </CardTitle>
        <CardDescription>
          Vérifiez le solde et effectuez un paiement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Last redemption success */}
        {lastRedemption && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-700">Paiement réussi</AlertTitle>
            <AlertDescription className="text-green-600">
              {formatCurrency(lastRedemption.amount)} déduit de la carte {lastRedemption.code}.
              Solde restant: {formatCurrency(lastRedemption.remainingBalance)}
            </AlertDescription>
          </Alert>
        )}

        {/* Code input */}
        <div className="space-y-2">
          <Label>Code de la carte cadeau</Label>
          <div className="flex gap-2">
            <Input
              placeholder="KFM-XXXX-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono text-lg"
              maxLength={13}
            />
            <Button onClick={checkBalance} disabled={checking}>
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Balance info */}
        {balanceInfo && (
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Code</p>
                <p className="font-mono font-bold">{balanceInfo.code}</p>
              </div>
              {getStatusBadge(balanceInfo.status)}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Solde disponible</p>
                <p className="text-2xl font-bold text-green-600">
                  {balanceInfo.formattedBalance}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valeur initiale</p>
                <p className="text-lg">{formatCurrency(balanceInfo.initialBalance)}</p>
              </div>
            </div>

            {balanceInfo.recipientName && (
              <p className="text-sm text-muted-foreground">
                Destinataire: {balanceInfo.recipientName}
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              Expire le: {balanceInfo.formattedExpiry}
            </p>

            {/* Redeem section */}
            {balanceInfo.isUsable && (
              <>
                <Separator />
                
                {orderTotal > 0 && (
                  <div className="bg-blue-50 rounded p-3 text-sm">
                    <p className="text-blue-700">
                      <CreditCard className="h-4 w-4 inline mr-1" />
                      Total de la commande: <strong>{formatCurrency(orderTotal)}</strong>
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Montant à débiter</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Montant en GNF"
                      value={redeemAmount}
                      onChange={(e) => setRedeemAmount(e.target.value)}
                      max={balanceInfo.balance}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setRedeemAmount(balanceInfo.balance.toString())}
                    >
                      Max
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maximum: {formatCurrency(balanceInfo.balance)}
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={() => setConfirmDialogOpen(true)}
                  disabled={!redeemAmount || parseFloat(redeemAmount) <= 0}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payer avec la carte cadeau
                </Button>
              </>
            )}

            {!balanceInfo.isUsable && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-700">Carte non utilisable</AlertTitle>
                <AlertDescription className="text-red-600">
                  Cette carte ne peut pas être utilisée pour un paiement.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Confirm dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer le paiement</DialogTitle>
              <DialogDescription>
                Voulez-vous débiter {redeemAmount ? formatCurrency(parseFloat(redeemAmount)) : '0'} de la carte cadeau {balanceInfo?.code}?
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>Carte</span>
                <span className="font-mono">{balanceInfo?.code}</span>
              </div>
              <div className="flex justify-between">
                <span>Montant</span>
                <span className="font-bold text-green-600">
                  {redeemAmount ? formatCurrency(parseFloat(redeemAmount)) : '0'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span>Solde après paiement</span>
                <span className="font-bold">
                  {balanceInfo && redeemAmount
                    ? formatCurrency(balanceInfo.balance - parseFloat(redeemAmount))
                    : '0'}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={redeemGiftCard} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmer le paiement
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default PosGiftCardRedemption;
