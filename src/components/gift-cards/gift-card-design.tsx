'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Calendar, Phone, User } from 'lucide-react';
import { useCurrencySafe } from '@/lib/currency-context';

// Status colors
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500',
  used: 'bg-gray-500',
  expired: 'bg-red-500',
  cancelled: 'bg-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  used: 'Utilisé',
  expired: 'Expiré',
  cancelled: 'Annulé',
};

interface GiftCardData {
  code: string;
  initialAmount: number;
  currentBalance: number;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  buyerName?: string;
  recipientName?: string;
  expiresAt?: Date | string;
}

interface GiftCardDesignProps {
  card: GiftCardData;
  variant?: 'full' | 'compact' | 'preview';
  showQRCode?: boolean;
}

export function GiftCardDesign({ card, variant = 'full', showQRCode = false }: GiftCardDesignProps) {
  const { formatCurrency } = useCurrencySafe();
  const expiryDate = card.expiresAt
    ? new Date(card.expiresAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';

  // Compact variant for lists
  if (variant === 'compact') {
    return (
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-0.5">
        <div className="bg-white dark:bg-slate-900 rounded-md p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-orange-500" />
              <span className="font-mono font-bold text-sm">{card.code}</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[card.status]}`} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Solde</span>
            <span className="font-bold text-green-600">{formatCurrency(card.currentBalance)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Preview variant for purchase flow
  if (variant === 'preview') {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-1 shadow-lg">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 text-white">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-lg">KFM DELICE</p>
                <p className="text-xs text-white/70">Carte Cadeau</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-0">
              {STATUS_LABELS[card.status]}
            </Badge>
          </div>

          {/* Code */}
          <div className="text-center my-6">
            <p className="text-xs text-white/50 mb-1">Code</p>
            <p className="font-mono text-2xl font-bold tracking-wider">{card.code}</p>
          </div>

          {/* Amount */}
          <div className="text-center mb-4">
            <p className="text-4xl font-bold">{formatCurrency(card.currentBalance)}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Valable jusqu'au {expiryDate}</span>
            {card.recipientName && <span>Pour: {card.recipientName}</span>}
          </div>
        </div>
      </div>
    );
  }

  // Full variant for detail view
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-1 shadow-xl">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
              <Gift className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="font-bold text-2xl">KFM DELICE</p>
              <p className="text-sm text-white/70">Carte Cadeau</p>
            </div>
          </div>
          <Badge className={`${STATUS_COLORS[card.status]} text-white border-0 px-3 py-1`}>
            {STATUS_LABELS[card.status]}
          </Badge>
        </div>

        {/* Code */}
        <div className="text-center my-8">
          <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">Code de la carte</p>
          <div className="inline-block bg-white/10 rounded-lg px-6 py-3">
            <p className="font-mono text-3xl font-bold tracking-widest">{card.code}</p>
          </div>
        </div>

        {/* Amount */}
        <div className="text-center mb-8">
          <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">Valeur</p>
          <p className="text-5xl font-bold">{formatCurrency(card.currentBalance)}</p>
          {card.initialAmount !== card.currentBalance && (
            <p className="text-sm text-white/50 mt-1">
              Valeur initiale: {formatCurrency(card.initialAmount)}
            </p>
          )}
        </div>

        {/* QR Code placeholder */}
        {showQRCode && (
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center">
              <div className="grid grid-cols-5 gap-0.5">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 ${Math.random() > 0.5 ? 'bg-slate-900' : 'bg-white'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {card.recipientName && (
            <div className="flex items-center gap-2 text-white/70">
              <User className="h-4 w-4" />
              <span>Destinataire: {card.recipientName}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-white/70">
            <Calendar className="h-4 w-4" />
            <span>Expire: {expiryDate}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-white/50">
          <p>KFM DELICE • Restaurant Africain</p>
          <p>Abidjan, Côte d'Ivoire • +225 07 00 00 00 00</p>
        </div>
      </div>
    </div>
  );
}

export default GiftCardDesign;
