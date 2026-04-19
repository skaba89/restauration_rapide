'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GiftCardDesign } from './gift-card-design';
import { Gift, CreditCard, Mail, Phone, Printer, User, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrencySafe } from '@/lib/currency-context';

// Preset amounts
const PRESET_AMOUNTS = [
  { value: 10000, label: '10 000' },
  { value: 25000, label: '25 000' },
  { value: 50000, label: '50 000' },
  { value: 75000, label: '75 000' },
  { value: 100000, label: '100 000' },
];

interface GiftCardPurchaseProps {
  onSuccess?: (card: any) => void;
  onCancel?: () => void;
}

export function GiftCardPurchase({ onSuccess, onCancel }: GiftCardPurchaseProps) {
  const { formatCurrency, currencySymbol } = useCurrencySafe();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [amount, setAmount] = useState<number>(25000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'sms' | 'email' | 'print'>('print');
  const [message, setMessage] = useState('');

  // Preview data
  const previewCard = {
    code: 'KFM-XXXX-XXXX',
    initialAmount: useCustomAmount ? parseInt(customAmount) || 0 : amount,
    currentBalance: useCustomAmount ? parseInt(customAmount) || 0 : amount,
    status: 'active' as const,
    recipientName: recipientName || undefined,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!buyerName || !buyerPhone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialAmount: useCustomAmount ? parseInt(customAmount) : amount,
          buyerName,
          buyerPhone,
          recipientName,
          recipientPhone,
          deliveryMethod,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Carte cadeau créée avec succès!');
        setStep(4); // Success step
        if (onSuccess) {
          onSuccess(data.data);
        }
      } else {
        toast.error('Erreur lors de la création');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Render success step
  if (step === 4) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Carte Cadeau Créée!</h2>
          <p className="text-muted-foreground mb-6">
            La carte cadeau a été créée avec succès
          </p>
          <GiftCardDesign card={previewCard} variant="preview" />
          <div className="mt-6 flex justify-center gap-4">
            <Button variant="outline" onClick={onCancel}>
              Fermer
            </Button>
            <Button onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress steps */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s
                  ? 'bg-orange-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`w-12 h-1 mx-1 ${
                  step > s ? 'bg-orange-500' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Amount Selection */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Choisir le Montant
            </CardTitle>
            <CardDescription>
              Sélectionnez un montant prédéfini ou entrez un montant personnalisé
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={useCustomAmount ? 'custom' : amount.toString()}
              onValueChange={(v) => {
                if (v === 'custom') {
                  setUseCustomAmount(true);
                } else {
                  setUseCustomAmount(false);
                  setAmount(parseInt(v));
                }
              }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              {PRESET_AMOUNTS.map((amt) => (
                <div key={amt.value}>
                  <RadioGroupItem
                    value={amt.value.toString()}
                    id={`amount-${amt.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`amount-${amt.value}`}
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500 cursor-pointer"
                  >
                    <span className="font-bold">{formatCurrency(amt.value)}</span>
                    <span className="text-xs text-muted-foreground">{currencySymbol}</span>
                  </Label>
                </div>
              ))}
              <div>
                <RadioGroupItem
                  value="custom"
                  id="amount-custom"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="amount-custom"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500 cursor-pointer"
                >
                  <span className="text-sm text-muted-foreground">Autre montant</span>
                </Label>
              </div>
            </RadioGroup>

            {useCustomAmount && (
              <div className="space-y-2">
                <Label>Montant personnalisé</Label>
                <Input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Entrez le montant"
                  className="text-lg"
                />
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>
                Continuer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Buyer & Recipient Info */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations
            </CardTitle>
            <CardDescription>
              Entrez les informations de l'acheteur et du destinataire
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Buyer info */}
            <div className="space-y-4">
              <h3 className="font-medium">Informations de l'acheteur</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom complet *</Label>
                  <Input
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Votre nom"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone *</Label>
                  <Input
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="+225 07 XX XX XX XX"
                  />
                </div>
              </div>
            </div>

            {/* Recipient info */}
            <div className="space-y-4">
              <h3 className="font-medium">Informations du destinataire (optionnel)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom du destinataire</Label>
                  <Input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Nom de la personne"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone du destinataire</Label>
                  <Input
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+225 07 XX XX XX XX"
                  />
                </div>
              </div>
            </div>

            {/* Delivery method */}
            <div className="space-y-4">
              <h3 className="font-medium">Mode de livraison</h3>
              <Select
                value={deliveryMethod}
                onValueChange={(v) => setDeliveryMethod(v as 'sms' | 'email' | 'print')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      SMS
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="print">
                    <div className="flex items-center gap-2">
                      <Printer className="h-4 w-4" />
                      Impression
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label>Message personnel (optionnel)</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Joyeux anniversaire ! Profite bien de ce repas..."
                rows={2}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Retour
              </Button>
              <Button onClick={() => setStep(3)}>
                Continuer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview & Confirm */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant</span>
                  <span className="font-bold">
                    {formatCurrency(useCustomAmount ? parseInt(customAmount) || 0 : amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Acheteur</span>
                  <span>{buyerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Téléphone</span>
                  <span>{buyerPhone}</span>
                </div>
                {recipientName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Destinataire</span>
                    <span>{recipientName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="capitalize">{deliveryMethod}</span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Retour
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Création...' : 'Confirmer l\'achat'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aperçu de la carte</CardTitle>
            </CardHeader>
            <CardContent>
              <GiftCardDesign card={previewCard} variant="preview" />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default GiftCardPurchase;
