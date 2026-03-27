import { KitchenDisplay } from '@/components/kitchen-display';

export const metadata = {
  title: 'Cuisine - Kitchen Display | Restaurant OS',
  description: 'Affichage cuisine pour la gestion des commandes en temps réel',
};

export default function KitchenPage() {
  // In production, get restaurantId from session/context
  const restaurantId = 'demo-restaurant';

  return (
    <KitchenDisplay 
      restaurantId={restaurantId}
    />
  );
}
