'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Download,
  Eye,
  Loader2,
  Calendar,
  User,
  Building2,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Printer,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface Invoice {
  id: string;
  invoiceNumber: string;
  type: 'client' | 'supplier';
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  supplierId?: string;
  supplierName?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  notes?: string;
  paidAt?: string;
  createdAt: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface InvoiceStats {
  totalInvoices: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalAmount: number;
  paidAmount: number;
}

// Demo invoices
const DEMO_INVOICES: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'FAC-2024-001',
    type: 'client',
    status: 'paid',
    clientName: 'Entreprise ABC',
    clientEmail: 'contact@abc.com',
    clientPhone: '+224 620 00 00 10',
    issueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: '1', description: 'Service traiteur - Réunion annuelle', quantity: 1, unitPrice: 2500000, totalPrice: 2500000 },
      { id: '2', description: 'Location salle + décoration', quantity: 1, unitPrice: 500000, totalPrice: 500000 },
    ],
    subtotal: 3000000,
    tax: 0,
    discount: 0,
    total: 3000000,
    currency: 'GNF',
    paidAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    invoiceNumber: 'FAC-2024-002',
    type: 'client',
    status: 'sent',
    clientName: 'Société XYZ',
    clientEmail: 'xyz@company.com',
    clientPhone: '+224 620 00 00 11',
    issueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: '1', description: 'Commande spéciale - 50 repas', quantity: 50, unitPrice: 25000, totalPrice: 1250000 },
    ],
    subtotal: 1250000,
    tax: 0,
    discount: 50000,
    total: 1200000,
    currency: 'GNF',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    invoiceNumber: 'FAC-2024-003',
    type: 'supplier',
    status: 'overdue',
    clientName: 'Marché Central',
    supplierName: 'Marché Central',
    issueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: '1', description: 'Légumes frais - Commande mensuelle', quantity: 1, unitPrice: 800000, totalPrice: 800000 },
      { id: '2', description: 'Viandes - Approvisionnement', quantity: 1, unitPrice: 1200000, totalPrice: 1200000 },
    ],
    subtotal: 2000000,
    tax: 0,
    discount: 0,
    total: 2000000,
    currency: 'GNF',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    invoiceNumber: 'FAC-2024-004',
    type: 'client',
    status: 'draft',
    clientName: 'Particulier - M. Diallo',
    clientPhone: '+224 620 00 00 12',
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: '1', description: 'Anniversaire - Menu prestige', quantity: 30, unitPrice: 35000, totalPrice: 1050000 },
    ],
    subtotal: 1050000,
    tax: 0,
    discount: 0,
    total: 1050000,
    currency: 'GNF',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    invoiceNumber: 'FAC-2024-005',
    type: 'supplier',
    status: 'paid',
    clientName: 'Boucherie Diallo',
    supplierName: 'Boucherie Diallo',
    issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: '1', description: 'Viande de bœuf - 50kg', quantity: 50, unitPrice: 25000, totalPrice: 1250000 },
    ],
    subtotal: 1250000,
    tax: 0,
    discount: 0,
    total: 1250000,
    currency: 'GNF',
    paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Format currency
const formatCurrency = (amount: number, currency: string = 'GNF') => {
  return `${amount.toLocaleString('fr-FR')} ${currency}`;
};

// Status badge colors and labels
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'draft':
      return { label: 'Brouillon', color: 'bg-gray-100 text-gray-700', icon: FileText };
    case 'sent':
      return { label: 'Envoyée', color: 'bg-blue-100 text-blue-700', icon: Send };
    case 'paid':
      return { label: 'Payée', color: 'bg-green-100 text-green-700', icon: CheckCircle };
    case 'overdue':
      return { label: 'En retard', color: 'bg-red-100 text-red-700', icon: AlertCircle };
    case 'cancelled':
      return { label: 'Annulée', color: 'bg-gray-100 text-gray-500', icon: XCircle };
    default:
      return { label: status, color: 'bg-gray-100 text-gray-700', icon: Clock };
  }
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'client' | 'supplier'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: 'client' as 'client' | 'supplier',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    dueDate: '',
    notes: '',
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }] as InvoiceItem[],
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    // Simulate API call with demo data
    setTimeout(() => {
      setInvoices(DEMO_INVOICES);
      
      // Calculate stats
      const totalInvoices = DEMO_INVOICES.length;
      const totalPaid = DEMO_INVOICES.filter(i => i.status === 'paid').length;
      const totalPending = DEMO_INVOICES.filter(i => i.status === 'sent' || i.status === 'draft').length;
      const totalOverdue = DEMO_INVOICES.filter(i => i.status === 'overdue').length;
      const totalAmount = DEMO_INVOICES.reduce((acc, i) => acc + i.total, 0);
      const paidAmount = DEMO_INVOICES.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.total, 0);
      
      setStats({
        totalInvoices,
        totalPaid,
        totalPending,
        totalOverdue,
        totalAmount,
        paidAmount,
      });
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || invoice.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Add invoice item
  const addInvoiceItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { id: `${Date.now()}`, description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
    });
  };

  // Remove invoice item
  const removeInvoiceItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  // Update invoice item
  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
    }
    setFormData({ ...formData, items: newItems });
  };

  // Calculate total
  const calculateTotal = () => {
    const subtotal = formData.items.reduce((acc, item) => acc + item.totalPrice, 0);
    return subtotal;
  };

  // Handle create invoice
  const handleCreateInvoice = async () => {
    if (!formData.clientName || formData.items.length === 0) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    const newInvoice: Invoice = {
      id: `${Date.now()}`,
      invoiceNumber: `FAC-2024-${String(invoices.length + 1).padStart(3, '0')}`,
      type: formData.type,
      status: 'draft',
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      clientAddress: formData.clientAddress,
      issueDate: new Date().toISOString(),
      dueDate: formData.dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      items: formData.items.map((item, idx) => ({
        ...item,
        id: `${idx}`,
        totalPrice: item.quantity * item.unitPrice,
      })),
      subtotal: calculateTotal(),
      tax: 0,
      discount: 0,
      total: calculateTotal(),
      currency: 'GNF',
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };

    setInvoices([newInvoice, ...invoices]);
    setIsAddModalOpen(false);
    resetForm();
    toast.success('Facture créée avec succès');
  };

  // Handle status change
  const handleStatusChange = async (invoice: Invoice, newStatus: string) => {
    const updatedInvoices = invoices.map((i) =>
      i.id === invoice.id
        ? { ...i, status: newStatus, paidAt: newStatus === 'paid' ? new Date().toISOString() : undefined }
        : i
    );
    setInvoices(updatedInvoices);
    toast.success(`Statut mis à jour: ${getStatusConfig(newStatus).label}`);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      type: 'client',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      dueDate: '',
      notes: '',
      items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
    });
  };

  // Print invoice
  const handlePrint = (invoice: Invoice) => {
    toast.info(`Préparation de l'impression de ${invoice.invoiceNumber}...`);
    window.print();
  };

  // Download invoice
  const handleDownload = (invoice: Invoice) => {
    toast.info(`Téléchargement de ${invoice.invoiceNumber}...`);
    // Open the PDF in a new tab
    window.open(`/api/invoices/${invoice.id}?demo=true`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Gestion des Factures</h1>
              <p className="text-muted-foreground">
                Créez et gérez vos factures clients et fournisseurs
              </p>
            </div>
          </div>
        </div>
        <Button
          className="bg-gradient-to-r from-orange-500 to-red-600"
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Facture
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Factures</p>
                <p className="text-2xl font-bold">{stats?.totalInvoices || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payées</p>
                <p className="text-2xl font-bold text-green-600">{stats?.totalPaid || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.totalPending || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En retard</p>
                <p className="text-2xl font-bold text-red-600">{stats?.totalOverdue || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une facture..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="supplier">Fournisseurs</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="sent">Envoyée</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Facture</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Client/Fournisseur</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[60px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Aucune facture trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const statusConfig = getStatusConfig(invoice.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={invoice.type === 'client' ? 'text-blue-600' : 'text-purple-600'}>
                            {invoice.type === 'client' ? (
                              <><User className="h-3 w-3 mr-1" /> Client</>
                            ) : (
                              <><Building2 className="h-3 w-3 mr-1" /> Fournisseur</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoice.clientName}</p>
                            {invoice.clientEmail && (
                              <p className="text-xs text-muted-foreground">{invoice.clientEmail}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                        <TableCell>
                          <span className={invoice.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
                            {formatDate(invoice.dueDate)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(invoice.total)}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
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
                              <DropdownMenuItem onClick={() => {
                                setSelectedInvoice(invoice);
                                setIsViewModalOpen(true);
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePrint(invoice)}>
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownload(invoice)}>
                                <Download className="h-4 w-4 mr-2" />
                                Télécharger PDF
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {invoice.status === 'draft' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(invoice, 'sent')}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Envoyer
                                </DropdownMenuItem>
                              )}
                              {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                                <DropdownMenuItem onClick={() => handleStatusChange(invoice, 'paid')}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Marquer comme payée
                                </DropdownMenuItem>
                              )}
                              {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(invoice, 'cancelled')}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Annuler
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Invoice Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle Facture</DialogTitle>
            <DialogDescription>
              Créez une nouvelle facture client ou fournisseur
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type de facture</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="supplier">Fournisseur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date d&apos;échéance</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h4 className="font-medium">Informations {formData.type === 'client' ? 'du client' : 'du fournisseur'}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom *</Label>
                  <Input
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Nom de l'entreprise ou personne"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="+224 620 00 00 00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    placeholder="email@exemple.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Input
                    value={formData.clientAddress}
                    onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                    placeholder="Adresse"
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Articles</h4>
                <Button type="button" variant="outline" size="sm" onClick={addInvoiceItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-5">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qté"
                      value={item.quantity}
                      onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      placeholder="Prix unitaire"
                      value={item.unitPrice}
                      onChange={(e) => updateInvoiceItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-1">
                    <span className="text-sm font-medium">{formatCurrency(item.quantity * item.unitPrice)}</span>
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeInvoiceItem(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end">
                <div className="w-48 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-bold">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes ou conditions particulières..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Annuler
            </Button>
            <Button
              className="bg-gradient-to-r from-orange-500 to-red-600"
              onClick={handleCreateInvoice}
            >
              <FileText className="h-4 w-4 mr-2" />
              Créer la facture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails de la Facture</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedInvoice.invoiceNumber}</h3>
                  <Badge className={getStatusConfig(selectedInvoice.status).color}>
                    {getStatusConfig(selectedInvoice.status).label}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Date d&apos;émission</p>
                  <p className="font-medium">{formatDate(selectedInvoice.issueDate)}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {selectedInvoice.type === 'client' ? 'Client' : 'Fournisseur'}
                  </p>
                  <p className="font-medium">{selectedInvoice.clientName}</p>
                  {selectedInvoice.clientEmail && (
                    <p className="text-sm text-muted-foreground">{selectedInvoice.clientEmail}</p>
                  )}
                  {selectedInvoice.clientPhone && (
                    <p className="text-sm text-muted-foreground">{selectedInvoice.clientPhone}</p>
                  )}
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm text-muted-foreground">Date d&apos;échéance</p>
                  <p className={`font-medium ${selectedInvoice.status === 'overdue' ? 'text-red-600' : ''}`}>
                    {formatDate(selectedInvoice.dueDate)}
                  </p>
                  {selectedInvoice.paidAt && (
                    <>
                      <p className="text-sm text-muted-foreground">Payée le</p>
                      <p className="font-medium text-green-600">{formatDate(selectedInvoice.paidAt)}</p>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Articles</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Qté</TableHead>
                      <TableHead className="text-right">P.U.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <div className="w-48 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total:</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Remise:</span>
                      <span>-{formatCurrency(selectedInvoice.discount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  <strong>Notes:</strong> {selectedInvoice.notes}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Fermer
            </Button>
            <Button variant="outline" onClick={() => handlePrint(selectedInvoice!)}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
            <Button onClick={() => handleDownload(selectedInvoice!)}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
