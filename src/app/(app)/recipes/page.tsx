import { Metadata } from 'next';
import RecipeManager from '@/components/recipes/recipe-manager';

export const metadata: Metadata = {
  title: 'Gestion des Recettes - KFM DELICE',
  description: 'Gérez vos recettes de cuisine',
};

export default function RecipesPage() {
  return (
    <div className="container mx-auto p-6">
      <RecipeManager />
    </div>
  );
}
