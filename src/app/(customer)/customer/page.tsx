'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Utensils,
  ShoppingCart,
  Package,
  Truck,
  Gift,
  Percent,
  Star,
  MapPin,
  Clock,
  Phone,
  ArrowRight,
} from 'lucide-react';

export default function CustomerHomePage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Bienvenue !</h1>
        <p className="opacity-90 mb-4">Découvrez nos délicieux plats africains</p>
        <Link href="/customer/menu">
          <Button className="bg-white text-orange-600 hover:bg-gray-100">
            <Utensils className="mr-2 h-4 w-4" />
            Voir le Menu
          </Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/customer/menu">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-2">
                <Utensils className="h-6 w-6 text-orange-600" />
              </div>
              <p className="font-medium">Menu</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/customer/order">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-medium">Commander</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/customer/orders">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-medium">Commandes</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/customer/deals">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                <Percent className="h-6 w-6 text-purple-600" />
              </div>
              <p className="font-medium">Bons Plans</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Active Order Tracking */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5 text-orange-600" />
              Commande en cours
            </CardTitle>
            <Badge className="bg-orange-100 text-orange-700">En préparation</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">ORD-2024-0145</p>
              <p className="text-sm text-muted-foreground">Attieké Poisson Grillé x2, Jus de Bissap x1</p>
              <p className="text-sm text-muted-foreground mt-1">
                <Clock className="h-3 w-3 inline mr-1" />
                Arrivée estimée: 25 min
              </p>
            </div>
            <Link href="/customer/tracking">
              <Button variant="outline" size="sm">
                Suivre <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Popular Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Plats Populaires</h2>
          <Link href="/customer/menu" className="text-orange-600 hover:underline text-sm">
            Voir tout
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Attieké Poisson Grillé', price: '3 500', image: '🐟', rating: 4.8 },
            { name: 'Kedjenou de Poulet', price: '4 500', image: '🍗', rating: 4.9 },
            { name: 'Thiéboudienne', price: '4 000', image: '🍚', rating: 4.7 },
          ].map((item, idx) => (
            <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-32 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-5xl">
                {item.image}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-orange-600 font-bold">{item.price} FCFA</p>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {item.rating}
                  </Badge>
                </div>
                <Link href="/customer/order">
                  <Button className="w-full mt-3 bg-orange-500 hover:bg-orange-600">
                    Commander
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Loyalty Card Preview */}
      <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Vos points fidélité</p>
              <p className="text-3xl font-bold">350 pts</p>
              <p className="text-sm opacity-80 mt-1">
                <Gift className="h-3 w-3 inline mr-1" />
                150 pts = 1 repas gratuit
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Niveau actuel</p>
              <p className="text-xl font-bold flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-300 text-yellow-300" />
                Gold
              </p>
            </div>
          </div>
          <Link href="/customer/loyalty">
            <Button variant="outline" className="w-full mt-4 bg-white/20 border-white/30 text-white hover:bg-white/30">
              Voir mes avantages
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Restaurant Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Le Petit Maquis</CardTitle>
          <CardDescription>Cuisine ivoirienne authentique</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>Cocody, Riviera 2, Abidjan</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Ouvert: 11:00 - 23:00</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>+225 07 00 00 00 00</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
