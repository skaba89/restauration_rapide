'use client';

import { LoyaltyProgram } from '@/components/loyalty/loyalty-program';
import { Gift, Crown } from 'lucide-react';

export default function LoyaltyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="w-7 h-7" />
          Programme Fidélité
        </h1>
        <p className="text-gray-500">Gérez vos points et récompenses</p>
      </div>

      <LoyaltyProgram />
    </div>
  );
}
