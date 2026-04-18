'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowRightLeft,
  Plus,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Loader2,
  Building,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  Trash2,
} from 'lucide-react';

interface TransferItem {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

interface StockTransfer {
  id: string;
  fromBranchId: string;
  fromBranchName: string;
  toBranchId: string;
  toBranchName: string;
  items: TransferItem[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  direction?: 'incoming' | 'outgoing';
  requestedBy: string;
  requestedByName: string;
  approvedBy?: string;
  approvedByName?: string;
  requestedAt: string;
  approvedAt?: string;
  shippedAt?: string;
  receivedAt?: string;
  notes?: string;
  rejectionReason?: string;
}

interface Branch {
  id: string;
  name: string;
  city: string;
  status: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'En attente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: Clock },
  APPROVED: { label: 'Approuvé', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: CheckCircle2 },
  REJECTED: { label: 'Rejeté', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: XCircle },
  IN_TRANSIT: { label: 'En transit', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', icon: Truck },
  DELIVERED: { label: 'Livré', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2 },
  CANCELLED: { label: 'Annulé', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300', icon: XCircle },
};

interface StockTransferManagerProps {
  branchId: string;
  branches: Branch[];
}

export function StockTransferManager({ branchId, branches }: StockTransferManagerProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);
  const [newTransfer, setNewTransfer] = useState({
    toBranchId: '',
    items: [{ name: '', quantity: 1, unit: 'kg' }] as TransferItem[],
    notes: '',
  });

  const activeBranches = branches.filter(b => b.id !== branchId && b.status === 'ACTIVE');

  useEffect(() => {
    fetchTransfers();
  }, [branchId]);

  const fetchTransfers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/branches/${branchId}/transfer`);
      const data = await response.json();
      if (data.success) {
        setTransfers(data.transfers);
      }
    } catch (error) {
      console.error('Failed to fetch transfers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTransfer = async () => {
    if (!newTransfer.toBranchId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une succursale de destination',
        variant: 'destructive',
      });
      return;
    }

    const validItems = newTransfer.items.filter(item => item.name && item.quantity > 0);
    if (validItems.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez ajouter au moins un article valide',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/branches/${branchId}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toBranchId: newTransfer.toBranchId,
          items: validItems,
          notes: newTransfer.notes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTransfers([data.data, ...transfers]);
        setIsNewTransferOpen(false);
        setNewTransfer({
          toBranchId: '',
          items: [{ name: '', quantity: 1, unit: 'kg' }],
          notes: '',
        });
        toast({
          title: 'Demande créée',
          description: 'La demande de transfert a été créée avec succès',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la demande de transfert',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (transferId: string, action: string) => {
    try {
      const response = await fetch(`/api/branches/${branchId}/transfer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferId, action }),
      });

      const data = await response.json();
      if (data.success) {
        setTransfers(transfers.map(t => t.id === transferId ? data.data : t));
        toast({
          title: 'Succès',
          description: data.message,
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le transfert',
        variant: 'destructive',
      });
    }
  };

  const addItem = () => {
    setNewTransfer({
      ...newTransfer,
      items: [...newTransfer.items, { name: '', quantity: 1, unit: 'kg' }],
    });
  };

  const removeItem = (index: number) => {
    setNewTransfer({
      ...newTransfer,
      items: newTransfer.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: keyof TransferItem, value: any) => {
    const updatedItems = [...newTransfer.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setNewTransfer({ ...newTransfer, items: updatedItems });
  };

  const incomingTransfers = transfers.filter(t => t.direction === 'incoming');
  const outgoingTransfers = transfers.filter(t => t.direction === 'outgoing');

  const TransferCard = ({ transfer }: { transfer: StockTransfer }) => {
    const statusConfig = STATUS_CONFIG[transfer.status];
    const StatusIcon = statusConfig.icon;
    const isIncoming = transfer.direction === 'incoming';

    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isIncoming ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                {isIncoming ? (
                  <ArrowDownLeft className="h-5 w-5 text-green-600" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {isIncoming ? transfer.fromBranchName : transfer.toBranchName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isIncoming ? 'Réception de' : 'Envoi vers'}
                </p>
              </div>
            </div>
            <Badge className={statusConfig.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>{transfer.items.length} article{transfer.items.length > 1 ? 's' : ''}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {transfer.items.slice(0, 3).map((item, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {item.name} ({item.quantity} {item.unit})
                </Badge>
              ))}
              {transfer.items.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{transfer.items.length - 3} autres
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <span>Demandé le {new Date(transfer.requestedAt).toLocaleDateString('fr-FR')}</span>
            <span>par {transfer.requestedByName}</span>
          </div>

          {transfer.notes && (
            <p className="text-sm text-muted-foreground mb-3 italic">
              "{transfer.notes}"
            </p>
          )}

          {/* Action buttons based on status */}
          {transfer.status === 'PENDING' && !isIncoming && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => handleUpdateStatus(transfer.id, 'approve')}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approuver
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleUpdateStatus(transfer.id, 'reject')}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Rejeter
              </Button>
            </div>
          )}

          {transfer.status === 'APPROVED' && !isIncoming && (
            <Button 
              size="sm" 
              onClick={() => handleUpdateStatus(transfer.id, 'ship')}
              className="gap-2"
            >
              <Truck className="h-4 w-4" />
              Marquer comme expédié
            </Button>
          )}

          {transfer.status === 'IN_TRANSIT' && isIncoming && (
            <Button 
              size="sm" 
              onClick={() => handleUpdateStatus(transfer.id, 'receive')}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirmer la réception
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
          <p className="mt-2 text-muted-foreground">Chargement des transferts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-orange-500" />
            Transferts de stock
          </h3>
          <p className="text-sm text-muted-foreground">
            Gérez les transferts entre succursales
          </p>
        </div>
        <Dialog open={isNewTransferOpen} onOpenChange={setIsNewTransferOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-orange-500 to-red-600">
              <Plus className="h-4 w-4" />
              Nouveau transfert
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouvelle demande de transfert</DialogTitle>
              <DialogDescription>Envoyer du stock vers une autre succursale</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Succursale de destination *</Label>
                <Select 
                  value={newTransfer.toBranchId} 
                  onValueChange={(v) => setNewTransfer({ ...newTransfer, toBranchId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une succursale" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeBranches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {branch.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Articles</Label>
                  <Button variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
                <div className="space-y-2">
                  {newTransfer.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Nom de l'article"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Qté"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                      <Select 
                        value={item.unit} 
                        onValueChange={(v) => updateItem(index, 'unit', v)}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="unité">unité</SelectItem>
                          <SelectItem value="pièce">pièce</SelectItem>
                        </SelectContent>
                      </Select>
                      {newTransfer.items.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  placeholder="Notes optionnelles..."
                  value={newTransfer.notes}
                  onChange={(e) => setNewTransfer({ ...newTransfer, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewTransferOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateTransfer} className="bg-gradient-to-r from-orange-500 to-red-600">
                Créer la demande
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-xl font-bold">
                  {transfers.filter(t => t.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En transit</p>
                <p className="text-xl font-bold">
                  {transfers.filter(t => t.status === 'IN_TRANSIT').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Complétés</p>
                <p className="text-xl font-bold">
                  {transfers.filter(t => t.status === 'DELIVERED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transfers Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tous ({transfers.length})</TabsTrigger>
          <TabsTrigger value="incoming">Entrants ({incomingTransfers.length})</TabsTrigger>
          <TabsTrigger value="outgoing">Sortants ({outgoingTransfers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ScrollArea className="h-[500px]">
            {transfers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ArrowRightLeft className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun transfert en cours</p>
                </CardContent>
              </Card>
            ) : (
              transfers.map((transfer) => (
                <TransferCard key={transfer.id} transfer={transfer} />
              ))
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="incoming">
          <ScrollArea className="h-[500px]">
            {incomingTransfers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ArrowDownLeft className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun transfert entrant</p>
                </CardContent>
              </Card>
            ) : (
              incomingTransfers.map((transfer) => (
                <TransferCard key={transfer.id} transfer={transfer} />
              ))
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="outgoing">
          <ScrollArea className="h-[500px]">
            {outgoingTransfers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ArrowUpRight className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun transfert sortant</p>
                </CardContent>
              </Card>
            ) : (
              outgoingTransfers.map((transfer) => (
                <TransferCard key={transfer.id} transfer={transfer} />
              ))
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default StockTransferManager;
