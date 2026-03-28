'use client';

import { useEffect, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle,
  ArrowRight,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/currency';

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  orderType: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryLandmark?: string;
  createdAt: string;
  restaurant: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

async function fetchOrder(orderId: string): Promise<OrderData> {
  const response = await fetch(`/api/orders?id=${orderId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    },
  });
  if (!response.ok) throw new Error('Commande non trouvée');
  const data = await response.json();
  return data.data || data;
}

export default function OrderSuccessPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId!),
    enabled: !!orderId,
  });

  const formatPrice = (price: number) => {
    return formatCurrency(price, 'GNF');
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; description: string }> = {
      PENDING: { label: 'En attente', color: 'bg-yellow-500', description: 'En attente de confirmation' },
      CONFIRMED: { label: 'Confirmée', color: 'bg-blue-500', description: 'Votre commande est confirmée' },
      PREPARING: { label: 'En préparation', color: 'bg-orange-500', description: 'En cours de préparation' },
      READY: { label: 'Prête', color: 'bg-green-500', description: 'Prête pour récupération/livraison' },
      OUT_FOR_DELIVERY: { label: 'En livraison', color: 'bg-purple-500', description: 'En cours de livraison' },
      DELIVERED: { label: 'Livrée', color: 'bg-green-600', description: 'Commande livrée' },
      COMPLETED: { label: 'Terminée', color: 'bg-green-600', description: 'Commande terminée' },
    };
    return statusMap[status] || statusMap.PENDING;
  };

  const getStatusEmoji = (status: string) => {
    if (status === 'PENDING' || status === 'CONFIRMED') return '⏳';
    if (status === 'PREPARING') return '👨‍🍳';
    if (status === 'READY') return '✅';
    if (status === 'OUT_FOR_DELIVERY') return '🚴';
    if (status === 'DELIVERED' || status === 'COMPLETED') return '🎉';
    return '📋';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Commande confirmée !
          </h1>
          <p className="text-gray-500">
            Votre commande a été passée avec succès
          </p>
        </div>

        {order ? (
          <div className="space-y-4">
            {/* Order Status Card */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{getStatusEmoji(order.status)}</span>
                  <div>
                    <p className="font-semibold text-lg">Commande #{order.orderNumber}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusInfo(order.status).color}>
                        {getStatusInfo(order.status).label}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {getStatusInfo(order.status).description}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estimated Time */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium">Temps estimé</p>
                    <p className="text-2xl font-bold text-orange-600">30-45 min</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            {order.orderType === 'DELIVERY' && order.deliveryAddress && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adresse de livraison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{order.deliveryAddress}</p>
                  {order.deliveryCity && (
                    <p className="text-sm text-gray-500">{order.deliveryCity}</p>
                  )}
                  {order.deliveryLandmark && (
                    <p className="text-sm text-gray-400 mt-1">
                      Repère: {order.deliveryLandmark}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Pickup Info */}
            {order.orderType === 'TAKEAWAY' && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Retrait au restaurant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{order.restaurant.name}</p>
                  <p className="text-sm text-gray-500">{order.restaurant.address}</p>
                  <p className="text-sm text-gray-500">{order.restaurant.city}</p>
                  <p className="text-sm text-orange-600 mt-2">
                    Présentez votre numéro de commande: {order.orderNumber}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Articles commandés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.quantity}x {item.name}
                    </span>
                    <span>{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Livraison</span>
                  <span>{order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : 'Gratuit'}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-orange-600">{formatPrice(order.total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Restaurant */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.restaurant.name}</p>
                    <p className="text-sm text-gray-500">Besoin d'aide ?</p>
                  </div>
                  <a href={`tel:${order.restaurant.phone}`}>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Appeler
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Paiement Mobile Money</p>
                    <p className="text-sm text-blue-700">
                      Vous allez recevoir une demande de paiement sur votre téléphone. 
                      Veuillez confirmer le paiement pour finaliser votre commande.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              Impossible de charger les détails de la commande
            </p>
          </Card>
        )}

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <Link href={`/r/${slug}`} className="block">
            <Button className="w-full bg-orange-500 hover:bg-orange-600">
              Retour au menu
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
