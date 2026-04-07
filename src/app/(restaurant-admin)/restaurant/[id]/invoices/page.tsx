'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Plus,
  Search,
  Download,
  Send,
  Eye,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { apiGet } from '@/lib/api-client';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  date: string;
  dueDate: string;
  items: { description: string; quantity: number; unitPrice: number }[];
}

const DEMO_INVOICES: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'Fac-2024-001',
    customerName: 'Entreprise ABC',
    customerPhone: '+224 620 00 00 01',
    amount: 850000,
    status: 'PAID',
    date: new Date(Date.now() - 10 * 86400000).toISOString(),
    dueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    items: [{ description: 'Traiteur événement', quantity: 1, unitPrice: 850000 }],
  },
  {
    id: '2',
    invoiceNumber: 'Fac-2024-002',
    customerName: 'SARL XYZ',
    customerPhone: '+224 620 00 00 02',
    amount: 350000,
    status: 'PENDING',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    items: [{ description: 'Service traiteur', quantity: 1, unitPrice: 350000 }],
  },
  {
    id: '3',
    invoiceNumber: 'Fac-2024-003',
    customerName: 'Restaurant voisin',
    amount: 120000,
    status: 'OVERDUE',
    date: new Date(Date.now() - 30 * 86400000).toISOString(),
    dueDate: new Date(Date.now() - 15 * 86400000).toISOString(),
    items: [{ description: 'Fournitures', quantity: 1, unitPrice: 120000 }],
  },
];

export default function RestaurantInvoicesPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const [invoices, setInvoices] = useState<Invoice[]>(DEMO_INVOICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, [restaurantId]);

  const loadInvoices = async () => {
    try {
      const data = await apiGet<any>(`/invoices?restaurantId=${restaurantId}`);
      if (data?.invoices?.length > 0) {
        setInvoices(data.invoices);
      }
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(i =>
    i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAmount = invoices.reduce((sum, i) => sum + i.amount, 0);
  const paidAmount = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = invoices.filter(i => i.status !== 'PAID').reduce((sum, i) => sum + i.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Payée</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
      case 'OVERDUE':
        return <Badge className="bg-red-100 text-red-700"><AlertCircle className="h-3 w-3 mr-1" />En retard</Badge>;
      default:
        return null;
    }
  };

  const handleSendWhatsApp = (invoice: Invoice) => {
    if (!invoice.customerPhone) return;
    const message = `Bonjour, voici votre facture ${invoice.invoiceNumber} de ${invoice.amount.toLocaleString()} FCFA. Merci de régler avant le ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}.`;
    const url = `https://wa.me/${invoice.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-orange-500" />
            Factures
          </h1>
          <p className="text-muted-foreground">
            Gérez vos factures clients
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle facture
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(totalAmount / 1000).toFixed(0)}K</p>
                <p className="text-sm text-muted-foreground">FCFA total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(paidAmount / 1000).toFixed(0)}K</p>
                <p className="text-sm text-muted-foreground">FCFA payées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(pendingAmount / 1000).toFixed(0)}K</p>
                <p className="text-sm text-muted-foreground">FCFA en attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Liste des factures</CardTitle>
              <CardDescription>Toutes vos factures</CardDescription>
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
                  <th className="text-left py-3 px-2">N° Facture</th>
                  <th className="text-left py-3 px-2">Client</th>
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-left py-3 px-2">Échéance</th>
                  <th className="text-left py-3 px-2">Montant</th>
                  <th className="text-left py-3 px-2">Statut</th>
                  <th className="text-left py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b">
                    <td className="py-3 px-2 font-mono font-medium">{invoice.invoiceNumber}</td>
                    <td className="py-3 px-2">
                      <p className="font-medium">{invoice.customerName}</p>
                      {invoice.customerPhone && (
                        <p className="text-sm text-muted-foreground">{invoice.customerPhone}</p>
                      )}
                    </td>
                    <td className="py-3 px-2">{new Date(invoice.date).toLocaleDateString('fr-FR')}</td>
                    <td className="py-3 px-2">{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</td>
                    <td className="py-3 px-2 font-medium">{invoice.amount.toLocaleString()} FCFA</td>
                    <td className="py-3 px-2">{getStatusBadge(invoice.status)}</td>
                    <td className="py-3 px-2">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" title="Voir">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Télécharger">
                          <Download className="h-4 w-4" />
                        </Button>
                        {invoice.customerPhone && (
                          <Button variant="ghost" size="icon" title="WhatsApp" onClick={() => handleSendWhatsApp(invoice)}>
                            <Send className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                      </div>
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
