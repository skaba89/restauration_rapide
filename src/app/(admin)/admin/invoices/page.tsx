'use client';

// ============================================
// Restaurant OS - Admin Invoices Management
// Gestion des factures
// ============================================

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  FileText,
  Search,
  MoreHorizontal,
  Eye,
  Download,
  Send,
  Printer,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  organization: { name: string; id: string };
  amount: number;
  tax: number;
  total: number;
  status: string;
  dueDate: string;
  createdAt: string;
  paidAt: string | null;
  items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

const formatCurrency = (amount: number) => `${amount?.toLocaleString('fr-FR') || 0} FCFA`;
const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR');

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const response = await fetchWithAuth('/api/admin/invoices');
        if (response.ok) {
          const data = await response.json();
          setInvoices(data.data || []);
        } else {
          throw new Error('API error');
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
        // Demo data
        setInvoices([
          {
            id: '1',
            invoiceNumber: 'FAC-2025-001',
            organization: { name: 'Le Groupe Savana', id: 'org-1' },
            amount: 99000,
            tax: 0,
            total: 99000,
            status: 'PAID',
            dueDate: '2025-01-15',
            createdAt: '2025-01-01',
            paidAt: '2025-01-10',
            items: [{ description: 'Abonnement Business - Janvier 2025', quantity: 1, unitPrice: 99000, total: 99000 }],
          },
          {
            id: '2',
            invoiceNumber: 'FAC-2025-002',
            organization: { name: 'Saveurs d\'Afrique', id: 'org-2' },
            amount: 49000,
            tax: 0,
            total: 49000,
            status: 'PENDING',
            dueDate: '2025-01-20',
            createdAt: '2025-01-05',
            paidAt: null,
            items: [{ description: 'Abonnement Pro - Janvier 2025', quantity: 1, unitPrice: 49000, total: 49000 }],
          },
          {
            id: '3',
            invoiceNumber: 'FAC-2025-003',
            organization: { name: 'La Terrasse Grill', id: 'org-3' },
            amount: 249000,
            tax: 0,
            total: 249000,
            status: 'PAID',
            dueDate: '2025-01-25',
            createdAt: '2025-01-10',
            paidAt: '2025-01-12',
            items: [{ description: 'Abonnement Enterprise - Janvier 2025', quantity: 1, unitPrice: 249000, total: 249000 }],
          },
          {
            id: '4',
            invoiceNumber: 'FAC-2025-004',
            organization: { name: 'Café du Plateau', id: 'org-4' },
            amount: 49000,
            tax: 0,
            total: 49000,
            status: 'OVERDUE',
            dueDate: '2025-01-05',
            createdAt: '2024-12-20',
            paidAt: null,
            items: [{ description: 'Abonnement Pro - Décembre 2024', quantity: 1, unitPrice: 49000, total: 49000 }],
          },
          {
            id: '5',
            invoiceNumber: 'FAC-2025-005',
            organization: { name: 'Maquis Chez Maman', id: 'org-5' },
            amount: 0,
            tax: 0,
            total: 0,
            status: 'DRAFT',
            dueDate: '2025-02-01',
            createdAt: '2025-01-15',
            paidAt: null,
            items: [{ description: 'Plan Starter - Gratuit', quantity: 1, unitPrice: 0, total: 0 }],
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = search === '' ||
      invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      invoice.organization.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'PAID').length,
    pending: invoices.filter(i => i.status === 'PENDING').length,
    overdue: invoices.filter(i => i.status === 'OVERDUE').length,
    totalRevenue: invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.total, 0),
    pendingAmount: invoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE').reduce((sum, i) => sum + i.total, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Factures</h1>
          <p className="text-muted-foreground">Facturation et paiements des organisations</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Nouvelle facture
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.paid}</p>
                <p className="text-xs text-muted-foreground">Payées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.overdue}</p>
                <p className="text-xs text-muted-foreground">En retard</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">Encaissé</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro ou organisation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="DRAFT">Brouillon</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="PAID">Payée</SelectItem>
                <SelectItem value="OVERDUE">En retard</SelectItem>
                <SelectItem value="CANCELLED">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des factures ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Facture</TableHead>
                    <TableHead>Organisation</TableHead>
                    <TableHead>Montant HT</TableHead>
                    <TableHead>Total TTC</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Créée le</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.organization.name}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(invoice.total)}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[invoice.status]}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(invoice.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSelectedInvoice(invoice)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Télécharger PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="h-4 w-4 mr-2" />
                              Envoyer
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="h-4 w-4 mr-2" />
                              Imprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Facture {selectedInvoice?.invoiceNumber}</DialogTitle>
            <DialogDescription>{selectedInvoice?.organization.name}</DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge className={statusColors[selectedInvoice.status]}>{selectedInvoice.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Échéance</p>
                  <p className="font-medium">{formatDate(selectedInvoice.dueDate)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Articles</p>
                <div className="space-y-2">
                  {selectedInvoice.items.map((item, i) => (
                    <div key={i} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>{item.description}</span>
                      <span className="font-medium">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Montant HT</span>
                  <span>{formatCurrency(selectedInvoice.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA</span>
                  <span>{formatCurrency(selectedInvoice.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total TTC</span>
                  <span>{formatCurrency(selectedInvoice.total)}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
