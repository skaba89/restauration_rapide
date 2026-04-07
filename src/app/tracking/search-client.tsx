'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Search,
  Package,
  Truck,
  Clock,
  ArrowRight,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function TrackingSearchClient() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanOrderNumber = orderNumber.trim().toUpperCase();
    
    if (!cleanOrderNumber) {
      toast.error('Veuillez entrer un numéro de commande');
      return;
    }

    // Validate order number format
    if (cleanOrderNumber.length < 6) {
      toast.error('Numéro de commande invalide');
      return;
    }

    setSearching(true);

    // Try to find the order
    try {
      const res = await fetch(`/api/tracking/${cleanOrderNumber}`);
      
      if (res.ok) {
        // Order found, redirect to tracking page
        router.push(`/tracking/${cleanOrderNumber}`);
        return;
      }
      
      // Try with ORD- prefix if not already there
      if (!cleanOrderNumber.startsWith('ORD-') && !cleanOrderNumber.startsWith('FAC-')) {
        const prefixedNumber = `ORD-${cleanOrderNumber}`;
        const retryRes = await fetch(`/api/tracking/${prefixedNumber}`);
        
        if (retryRes.ok) {
          router.push(`/tracking/${prefixedNumber}`);
          return;
        }
        
        // Try with FAC- prefix (new invoice format)
        const facNumber = `FAC-${cleanOrderNumber}`;
        const facRes = await fetch(`/api/tracking/${facNumber}`);
        
        if (facRes.ok) {
          router.push(`/tracking/${facNumber}`);
          return;
        }
      }
      
      // Try demo mode for testing
      if (cleanOrderNumber.includes('DEMO') || cleanOrderNumber.includes('TEST')) {
        const demoId = `demo-ord-${cleanOrderNumber.replace(/[^0-9]/g, '') || '1'}`;
        router.push(`/tracking/${demoId}`);
        return;
      }
      
      toast.error('Commande non trouvée. Vérifiez votre numéro de commande.');
    } catch (error) {
      toast.error('Erreur lors de la recherche. Veuillez réessayer.');
    } finally {
      setSearching(false);
    }
  };

  const handlePhoneSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanPhone = phone.trim();
    
    if (!cleanPhone || cleanPhone.length < 8) {
      toast.error('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    setSearching(true);

    try {
      // Search orders by phone number
      const res = await fetch(`/api/public/orders/search?phone=${encodeURIComponent(cleanPhone)}`);
      
      if (res.ok) {
        const data = await res.json();
        if (data.data?.orders?.length > 0) {
          // Redirect to the most recent order
          const mostRecent = data.data.orders[0];
          router.push(`/tracking/${mostRecent.orderNumber || mostRecent.id}`);
        } else {
          toast.error('Aucune commande trouvée pour ce numéro');
        }
      } else {
        toast.error('Erreur lors de la recherche');
      }
    } catch (error) {
      toast.error('Erreur lors de la recherche');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-12 px-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Suivi de commande</h1>
          <p className="text-gray-600 mt-2">
            Entrez votre numéro de commande pour suivre son statut en temps réel
          </p>
        </div>

        {/* Search by Order Number */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5 text-orange-500" />
              Rechercher par numéro
            </CardTitle>
            <CardDescription>
              Le numéro de commande figure sur votre confirmation de commande
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <Label htmlFor="orderNumber">Numéro de commande</Label>
                <div className="relative mt-1">
                  <Input
                    id="orderNumber"
                    type="text"
                    placeholder="Ex: ORD-2024-0145 ou FAC-2024-0145"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                    className="text-center text-lg font-mono tracking-wider pr-12"
                  />
                  <Package className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={searching}
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Recherche...
                  </>
                ) : (
                  <>
                    Suivre ma commande
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search by Phone */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-500" />
              Rechercher par téléphone
            </CardTitle>
            <CardDescription>
              Trouvez toutes vos commandes associées à votre numéro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePhoneSearch} className="space-y-4">
              <div>
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Ex: +224 622 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 text-center"
                />
              </div>
              <Button 
                type="submit" 
                variant="outline"
                className="w-full"
                disabled={searching}
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Recherche...
                  </>
                ) : (
                  'Trouver mes commandes'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Où trouver mon numéro ?</p>
                <p className="text-sm text-blue-700 mt-1">
                  Le numéro de commande apparaît sur:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Votre écran de confirmation</li>
                  <li>• Le SMS de confirmation</li>
                  <li>• L'email de confirmation</li>
                  <li>• Votre facture (format FAC-...)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Section */}
        <Card className="bg-amber-50 border-amber-100">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Package className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Tester le suivi</p>
                <p className="text-sm text-amber-700 mt-1">
                  Essayez avec ces numéros de démonstration:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs bg-white"
                    onClick={() => router.push('/tracking/demo-ord-1')}
                  >
                    ORD-2024-0145
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs bg-white"
                    onClick={() => router.push('/tracking/demo-ord-2')}
                  >
                    ORD-2024-0144
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs bg-white"
                    onClick={() => router.push('/tracking/demo-ord-3')}
                  >
                    ORD-2024-0143
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
