'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Phone,
  CreditCard,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';
import { toast } from 'sonner';

interface MobileMoneyPaymentProps {
  amount: number;
  orderId: string;
  restaurantId: string;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

type PaymentProvider = 'orange_money' | 'mtn_momo' | 'cash';

interface PaymentState {
  step: 'select' | 'processing' | 'success' | 'error';
  provider: PaymentProvider | null;
  phoneNumber: string;
  transactionId: string | null;
  errorMessage: string | null;
}

export function MobileMoneyPayment({
  amount,
  orderId,
  restaurantId,
  onSuccess,
  onCancel,
}: MobileMoneyPaymentProps) {
  const [state, setState] = useState<PaymentState>({
    step: 'select',
    provider: null,
    phoneNumber: '',
    transactionId: null,
    errorMessage: null,
  });

  const providers = [
    {
      id: 'orange_money' as const,
      name: 'Orange Money',
      icon: '🟠',
      logoImg: '/images/partners/orange-money.png',
      color: 'bg-orange-500',
      description: 'Paiement via Orange Money Guinée',
    },
    {
      id: 'mtn_momo' as const,
      name: 'MTN MoMo',
      icon: '🟡',
      logoImg: '/images/partners/mtn-momo.png',
      color: 'bg-yellow-500',
      description: 'Paiement via MTN Mobile Money',
    },
    {
      id: 'cash' as const,
      name: 'Espèces',
      icon: '💵',
      color: 'bg-green-500',
      description: 'Paiement à la livraison ou sur place',
    },
  ];

  const formatAmount = (value: number) => `${value.toLocaleString('fr-FR')} GNF`;

  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 8 && cleaned.length <= 12;
  };

  const handlePayment = async () => {
    if (!state.provider) {
      toast.error('Veuillez sélectionner un mode de paiement');
      return;
    }

    if (state.provider !== 'cash' && !validatePhoneNumber(state.phoneNumber)) {
      toast.error('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    setState(prev => ({ ...prev, step: 'processing' }));

    try {
      const response = await fetchWithAuth('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          restaurantId,
          amount,
          method: state.provider.toUpperCase(),
          phoneNumber: state.provider !== 'cash' ? state.phoneNumber : null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (state.provider === 'cash') {
          const txId = `CASH-${Date.now()}`;
          setState(prev => ({ ...prev, step: 'success', transactionId: txId }));
          onSuccess(txId);
        } else {
          // Simulate mobile money flow
          setTimeout(() => {
            const txId = `${state.provider!.toUpperCase()}-${Date.now()}`;
            setState(prev => ({ ...prev, step: 'success', transactionId: txId }));
            onSuccess(txId);
            toast.success('Paiement confirmé!');
          }, 3000);
        }
      } else {
        throw new Error(data.error || 'Erreur de paiement');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        step: 'error',
        errorMessage: error instanceof Error ? error.message : 'Erreur de paiement',
      }));
    }
  };

  if (state.step === 'processing') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Paiement en cours</h3>
          <p className="text-gray-500 mb-4">
            Vérifiez votre téléphone pour valider le paiement
          </p>
          <p className="text-2xl font-bold text-orange-600">{formatAmount(amount)}</p>
        </CardContent>
      </Card>
    );
  }

  if (state.step === 'success') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Paiement confirmé!</h3>
          {state.transactionId && (
            <Badge className="bg-green-100 text-green-700 mb-4">#{state.transactionId}</Badge>
          )}
          <p className="text-2xl font-bold text-green-600">{formatAmount(amount)}</p>
        </CardContent>
      </Card>
    );
  }

  if (state.step === 'error') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Erreur</h3>
          <p className="text-gray-500 mb-4">{state.errorMessage}</p>
          <Button onClick={() => setState(prev => ({ ...prev, step: 'select' }))}>
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Mode de paiement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-4 text-center">
            <p className="text-sm opacity-80">Montant à payer</p>
            <p className="text-3xl font-bold">{formatAmount(amount)}</p>
          </div>

          <RadioGroup value={state.provider || ''} className="space-y-3">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  state.provider === provider.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200'
                }`}
                onClick={() => setState(prev => ({ ...prev, provider: provider.id }))}
              >
                <RadioGroupItem value={provider.id} id={provider.id} />
                <Label htmlFor={provider.id} className="flex-1 cursor-pointer ml-3">
                  <div className="flex items-center gap-3">
                    {provider.logoImg ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={provider.logoImg} alt={provider.name} className="w-8 h-8 object-contain rounded" />
                    ) : (
                      <span className="text-2xl">{provider.icon}</span>
                    )}
                    <div>
                      <p className="font-semibold">{provider.name}</p>
                      <p className="text-sm text-gray-500">{provider.description}</p>
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>

          {state.provider && state.provider !== 'cash' && (
            <div className="space-y-2">
              <Label>Numéro de téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="tel"
                  placeholder="+224 6XX XXX XXX"
                  value={state.phoneNumber}
                  onChange={(e) => setState(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button
          onClick={handlePayment}
          disabled={!state.provider}
          className="flex-1 bg-orange-500 hover:bg-orange-600"
        >
          Payer <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <Shield className="w-4 h-4" /> Paiement sécurisé
      </div>
    </div>
  );
}
