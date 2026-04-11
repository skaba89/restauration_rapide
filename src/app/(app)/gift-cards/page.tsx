import { Metadata } from 'next';
import GiftCardManager from '@/components/gift-cards/gift-card-manager';

export const metadata: Metadata = {
  title: 'Cartes Cadeaux - KFM DELICE',
  description: 'Gérez les cartes cadeaux',
};

export default function GiftCardsPage() {
  return (
    <div className="container mx-auto p-6">
      <GiftCardManager />
    </div>
  );
}
