'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingDown,
  CheckCircle,
  Edit,
} from 'lucide-react';
import { apiGet } from '@/lib/api-client';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  unitPrice: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  lastRestocked: string;
}

export default function RestaurantInventoryPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, [restaurantId]);

  const loadInventory = async () => {
    try {
      const data = await apiGet<any>(`/inventory?restaurantId=${restaurantId}`);
      if (data?.items?.length > 0) {
        setInventory(data.items);
      }
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inStock = inventory.filter(i => i.status === 'IN_STOCK').length;
  const lowStock = inventory.filter(i => i.status === 'LOW_STOCK').length;
  const outOfStock = inventory.filter(i => i.status === 'OUT_OF_STOCK').length;
  const totalValue = inventory.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-orange-500" />
            Stocks
          </h1>
          <p className="text-muted-foreground">
            Gérez votre inventaire et vos stocks
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel article
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inStock}</p>
                <p className="text-sm text-muted-foreground">En stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lowStock}</p>
                <p className="text-sm text-muted-foreground">Stock bas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{outOfStock}</p>
                <p className="text-sm text-muted-foreground">Rupture</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(totalValue / 1000).toFixed(0)}K</p>
                <p className="text-sm text-muted-foreground">FCFA valeur</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Inventaire</CardTitle>
              <CardDescription>Liste de tous les articles en stock</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Article</th>
                  <th className="text-left py-3 px-2">Catégorie</th>
                  <th className="text-left py-3 px-2">Quantité</th>
                  <th className="text-left py-3 px-2">Prix unitaire</th>
                  <th className="text-left py-3 px-2">Statut</th>
                  <th className="text-left py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3 px-2 font-medium">{item.name}</td>
                    <td className="py-3 px-2 text-muted-foreground">{item.category}</td>
                    <td className="py-3 px-2">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 px-2">{item.unitPrice.toLocaleString()} FCFA</td>
                    <td className="py-3 px-2">
                      <Badge className={
                        item.status === 'IN_STOCK' ? 'bg-green-100 text-green-700' :
                        item.status === 'LOW_STOCK' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {item.status === 'IN_STOCK' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {item.status === 'LOW_STOCK' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {item.status === 'OUT_OF_STOCK' && <TrendingDown className="h-3 w-3 mr-1" />}
                        {item.status === 'IN_STOCK' ? 'En stock' : item.status === 'LOW_STOCK' ? 'Stock bas' : 'Rupture'}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3 mr-1" />
                        Modifier
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}