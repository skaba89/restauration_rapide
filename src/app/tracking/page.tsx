// Order Tracking Search Page - Find your order by number
import { Metadata } from 'next';
import TrackingSearchClient from './search-client';

export const metadata: Metadata = {
  title: 'Suivi de commande - Trouvez votre commande',
  description: 'Entrez votre numéro de commande pour suivre son statut en temps réel',
};

export default function TrackingSearchPage() {
  return <TrackingSearchClient />;
}
