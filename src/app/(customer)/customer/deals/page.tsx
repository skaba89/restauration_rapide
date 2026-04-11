'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Percent,
  Clock,
  Gift,
  Star,
  Flame,
  Copy,
  CheckCircle,
  Check,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/lib/cart-store';
import Link from 'next/link';

const DEALS_DATA = [
  {
    id: '1',
    title: 'Menu du Jour',
    description: 'Attieké Poisson + Jus au choix à 4000 FCFA au lieu de 5000 FCFA',
    discount: '20%',
    validUntil: 'Aujourd\'hui 15:00',
    image: '🐟',
    code: 'MENUJOUR',
    used: false,
    dealPrice: 4000,
    originalPrice: 5000,
  },
  {
    id: '2',
    title: 'Happy Hour',
    description: '2 jus achetés = 1 offert de 16h à 19h',
    discount: '33%',
    validUntil: 'Tous les jours',
    image: '🧃',
    code: 'HAPPY2',
    used: false,
    dealPrice: 2000,
    originalPrice: 3000,
  },
  {
    id: '3',
    title: 'Weekend Famille',
    description: '15% de réduction sur les commandes de plus de 15 000 FCFA',
    discount: '15%',
    validUntil: 'Samedi & Dimanche',
    image: '👨‍👩‍👧‍👦',
    code: 'FAMILLE15',
    used: false,
    dealPrice: 12750,
    originalPrice: 15000,
  },
  {
    id: '4',
    title: 'Première Commande',
    description: '500 FCFA de réduction sur votre première commande',
    discount: '500F',
    validUntil: 'Nouveaux clients',
    image: '🎉',
    code: 'BIENVENUE',
    used: true,
    dealPrice: 0,
    originalPrice: 0,
  },
];

const FLASH_SALE = {
  title: 'Vente Flash - Poulet Braisé',
  description: 'Poulet braisé à 2500 FCFA au lieu de 3500 FCFA',
  originalPrice: 3500,
  salePrice: 2500,
  endTime: '14:00',
  itemsLeft: 12,
  totalItems: 20,
  image: '🍗',
  name: 'Poulet Braisé',
  id: 'flash-poulet',
};

export default function CustomerDealsPage() {
  const [deals, setDeals] = useState(DEALS_DATA);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [flashSale, setFlashSale] = useState(FLASH_SALE);
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({ 
      title: 'Code copié !', 
      description: `Le code ${code} a été copié dans le presse-papiers` 
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const applyDeal = (deal: typeof DEALS_DATA[0]) => {
    if (deal.used) {
      toast({ 
        title: 'Déjà utilisé', 
        description: 'Ce code a déjà été utilisé',
        variant: 'destructive',
      });
      return;
    }
    
    // Add deal item to cart
    if (deal.dealPrice > 0) {
      addItem({
        id: `deal-${deal.id}`,
        name: deal.title,
        price: deal.dealPrice,
        image: deal.image,
        quantity: 1,
        notes: `Code promo: ${deal.code}`,
      });
      
      toast({ 
        title: 'Offre ajoutée !', 
        description: `${deal.title} a été ajouté à votre panier avec le code ${deal.code}` 
      });
    } else {
      // Just copy the code for percentage discounts
      copyCode(deal.code);
      toast({ 
        title: 'Code activé !', 
        description: `Utilisez le code ${deal.code} lors de votre commande` 
      });
    }
  };

  const handleFlashSaleOrder = () => {
    if (flashSale.itemsLeft <= 0) {
      toast({ 
        title: 'Épuisé', 
        description: 'Cette vente flash n\'est plus disponible',
        variant: 'destructive',
      });
      return;
    }

    addItem({
      id: flashSale.id,
      name: flashSale.name,
      price: flashSale.salePrice,
      image: flashSale.image,
      quantity: 1,
      notes: 'Vente Flash',
    });

    setFlashSale(prev => ({
      ...prev,
      itemsLeft: prev.itemsLeft - 1,
    }));

    toast({ 
      title: 'Ajouté au panier !', 
      description: `${flashSale.name} à ${flashSale.salePrice.toLocaleString()} FCFA a été ajouté` 
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bons Plans</h1>

      {/* Flash Sale */}
      <Card className="border-orange-500 border-2 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
              <CardTitle className="text-lg">Vente Flash</CardTitle>
            </div>
            <Badge className="bg-red-500 animate-pulse">
              <Clock className="h-3 w-3 mr-1" />
              Se termine à {FLASH_SALE.endTime}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center text-4xl">
              {FLASH_SALE.image}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{FLASH_SALE.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm line-through text-muted-foreground">{FLASH_SALE.originalPrice.toLocaleString()} FCFA</span>
                <span className="text-xl font-bold text-orange-600">{FLASH_SALE.salePrice.toLocaleString()} FCFA</span>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Restants: {flashSale.itemsLeft}/{FLASH_SALE.totalItems}</span>
                  <span className="text-orange-600 font-medium">{Math.round((flashSale.itemsLeft / FLASH_SALE.totalItems) * 100)}%</span>
                </div>
                <Progress value={(flashSale.itemsLeft / FLASH_SALE.totalItems) * 100} className="h-2" />
              </div>
            </div>
          </div>
          <Button 
            className="w-full mt-4 bg-orange-500 hover:bg-orange-600"
            onClick={handleFlashSaleOrder}
            disabled={flashSale.itemsLeft <= 0}
          >
            {flashSale.itemsLeft > 0 ? 'Commander maintenant' : 'Épuisé'}
          </Button>
        </CardContent>
      </Card>

      {/* Promo Codes */}
      <div className="grid gap-4">
        {deals.map(deal => (
          <Card key={deal.id} className={deal.used ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center text-3xl">
                  {deal.image}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{deal.title}</p>
                        {deal.used && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Utilisé
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{deal.description}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 text-lg">
                      -{deal.discount}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
                        {deal.code}
                      </code>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => copyCode(deal.code)}
                      >
                        {copiedCode === deal.code ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {deal.validUntil}
                      </span>
                      <Button 
                        size="sm" 
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={() => applyDeal(deal)}
                        disabled={deal.used}
                      >
                        Profiter
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loyalty CTA */}
      <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
        <CardContent className="p-6 text-center">
          <Star className="h-12 w-12 mx-auto mb-4 fill-yellow-300 text-yellow-300" />
          <h3 className="text-xl font-bold mb-2">Programme Fidélité</h3>
          <p className="opacity-90 mb-4">
            Gagnez des points à chaque commande et obtenez des repas gratuits !
          </p>
          <Link href="/customer/loyalty">
            <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <Gift className="h-4 w-4 mr-2" />
              Voir mes points
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
