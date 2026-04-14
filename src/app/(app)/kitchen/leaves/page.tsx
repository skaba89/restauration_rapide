'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Ban,
  FileText,
  Calendar,
  Info,
  Palmtree,
  Thermometer,
  TimerOff,
  UserX,
} from 'lucide-react';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  days: number;
  createdAt: string;
  rejectionReason?: string;
}

type LeaveType = 'conge_annuel' | 'conge_maladie' | 'permission' | 'absence';

interface LeaveBalance {
  type: LeaveType;
  label: string;
  total: number;          // total available days; Infinity for unlimited
  used: number;
  pending: number;
}

// ---------------------------------------------------------------------------
// Demo data – current logged-in kitchen user
// ---------------------------------------------------------------------------

const CURRENT_USER = {
  id: '1',
  name: 'Kouassi Emmanuel',
  department: 'Cuisine',
  position: 'Chef Cuisinier',
};

const INITIAL_BALANCES: LeaveBalance[] = [
  { type: 'conge_annuel', label: 'Cong\u00e9 annuel', total: 30, used: 8, pending: 2 },
  { type: 'conge_maladie', label: 'Cong\u00e9 maladie', total: Infinity, used: 3, pending: 0 },
  { type: 'permission', label: 'Permission', total: 5, used: 2, pending: 1 },
  { type: 'absence', label: 'Absence', total: Infinity, used: 1, pending: 0 },
];

const INITIAL_REQUESTS: LeaveRequest[] = [
  {
    id: 'req-001',
    employeeId: '1',
    type: 'conge_annuel',
    startDate: '2025-01-06',
    endDate: '2025-01-12',
    reason: 'Voyage familial en C\u00f4te d\u2019Ivoire',
    status: 'approved',
    days: 5,
    createdAt: '2024-12-20',
  },
  {
    id: 'req-002',
    employeeId: '1',
    type: 'conge_maladie',
    startDate: '2025-02-10',
    endDate: '2025-02-11',
    reason: 'Grippe \u2013 certificat m\u00e9dical fourni',
    status: 'approved',
    days: 2,
    createdAt: '2025-02-09',
  },
  {
    id: 'req-003',
    employeeId: '1',
    type: 'permission',
    startDate: '2025-03-15',
    endDate: '2025-03-15',
    reason: 'D\u00e9marches administratives \u00e0 la mairie',
    status: 'approved',
    days: 1,
    createdAt: '2025-03-10',
  },
  {
    id: 'req-004',
    employeeId: '1',
    type: 'conge_annuel',
    startDate: '2025-04-01',
    endDate: '2025-04-06',
    reason: 'Cong\u00e9 de P\u00e2ques avec la famille',
    status: 'pending',
    days: 4,
    createdAt: '2025-03-18',
  },
  {
    id: 'req-005',
    employeeId: '1',
    type: 'permission',
    startDate: '2025-03-28',
    endDate: '2025-03-28',
    reason: 'Rendez-vous \u00e0 l\u2019ambassade',
    status: 'pending',
    days: 1,
    createdAt: '2025-03-20',
  },
  {
    id: 'req-006',
    employeeId: '1',
    type: 'conge_annuel',
    startDate: '2025-02-24',
    endDate: '2025-02-28',
    reason: 'Cong\u00e9 annuel repos',
    status: 'rejected',
    days: 3,
    createdAt: '2025-02-10',
    rejectionReason: 'P\u00e9riode de forte affluence \u2013 demand\u00e9e repouss\u00e9e en avril.',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const LEAVE_TYPE_CONFIG: Record<LeaveType, { label: string; icon: typeof CalendarDays; color: string; bg: string }> = {
  conge_annuel: { label: 'Conge annuel', icon: Palmtree, color: 'text-emerald-700', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  conge_maladie: { label: 'Cong\u00e9 maladie', icon: Thermometer, color: 'text-red-700', bg: 'bg-red-100 dark:bg-red-900/30' },
  permission: { label: 'Permission', icon: TimerOff, color: 'text-amber-700', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  absence: { label: 'Absence', icon: UserX, color: 'text-gray-700', bg: 'bg-gray-100 dark:bg-gray-800/50' },
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle; color: string; bg: string }> = {
  pending:   { label: 'En attente',  icon: AlertCircle, color: 'text-yellow-700', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  approved:  { label: 'Approuv\u00e9e', icon: CheckCircle, color: 'text-green-700',  bg: 'bg-green-100 dark:bg-green-900/30' },
  rejected:  { label: 'Rejet\u00e9e',  icon: XCircle,     color: 'text-red-700',    bg: 'bg-red-100 dark:bg-red-900/30' },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function countBusinessDays(start: string, end: string): number {
  const d1 = new Date(start);
  const d2 = new Date(end);
  let count = 0;
  const current = new Date(d1);
  while (current <= d2) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count || 1;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function KitchenLeavesPage() {
  // State
  const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_REQUESTS);
  const [balances, setBalances] = useState<LeaveBalance[]>(INITIAL_BALANCES);

  // Dialog states
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  // Form state
  const [formType, setFormType] = useState<LeaveType | ''>('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formReason, setFormReason] = useState('');

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // -----------------------------------------------------------------------
  // Computed
  // -----------------------------------------------------------------------

  const filteredRequests = useMemo(() => {
    const list = requests.filter((r) => filterStatus === 'all' || r.status === filterStatus);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [requests, filterStatus]);

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === 'pending').length;
    const approved = requests.filter((r) => r.status === 'approved').length;
    const rejected = requests.filter((r) => r.status === 'rejected').length;
    const totalUsedDays = requests
      .filter((r) => r.status === 'approved')
      .reduce((s, r) => s + r.days, 0);
    return { total, pending, approved, rejected, totalUsedDays };
  }, [requests]);

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const resetForm = () => {
    setFormType('');
    setFormStartDate('');
    setFormEndDate('');
    setFormReason('');
  };

  const handleSubmit = () => {
    if (!formType) {
      toast.error('Veuillez s\u00e9lectionner un type de cong\u00e9.');
      return;
    }
    if (!formStartDate) {
      toast.error('Veuillez indiquer une date de d\u00e9but.');
      return;
    }
    if (!formEndDate) {
      toast.error('Veuillez indiquer une date de fin.');
      return;
    }
    if (new Date(formEndDate) < new Date(formStartDate)) {
      toast.error('La date de fin doit \u00eatre post\u00e9rieure \u00e0 la date de d\u00e9but.');
      return;
    }
    if (!formReason.trim()) {
      toast.error('Veuillez indiquer une raison.');
      return;
    }

    const days = countBusinessDays(formStartDate, formEndDate);

    // Check balance for conge_annuel and permission (limited types)
    const balance = balances.find((b) => b.type === formType);
    if (balance && balance.total !== Infinity) {
      const remaining = balance.total - balance.used - balance.pending;
      if (days > remaining) {
        toast.error(`Solde insuffisant. Il vous reste ${remaining} jour(s) de ${balance.label}.`);
        return;
      }
    }

    const newRequest: LeaveRequest = {
      id: `req-${Date.now()}`,
      employeeId: CURRENT_USER.id,
      type: formType as LeaveType,
      startDate: formStartDate,
      endDate: formEndDate,
      reason: formReason.trim(),
      status: 'pending',
      days,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setRequests((prev) => [newRequest, ...prev]);

    // Update balance pending
    if (balance) {
      setBalances((prev) =>
        prev.map((b) =>
          b.type === formType ? { ...b, pending: b.pending + days } : b,
        ),
      );
    }

    toast.success('Demande envoy\u00e9e', {
      description: `Votre demande de ${LEAVE_TYPE_CONFIG[formType as LeaveType].label} a \u00e9t\u00e9 soumise avec succ\u00e8s.`,
    });
    resetForm();
    setIsNewDialogOpen(false);
  };

  const handleCancel = () => {
    if (!selectedRequest || selectedRequest.status !== 'pending') return;

    setRequests((prev) => prev.map((r) => (r.id === selectedRequest.id ? { ...r, status: 'rejected' as const, rejectionReason: 'Annul\u00e9e par l\u2019employ\u00e9.' } : r)));

    // Update balance pending
    const balance = balances.find((b) => b.type === selectedRequest.type);
    if (balance) {
      setBalances((prev) =>
        prev.map((b) =>
          b.type === selectedRequest.type ? { ...b, pending: Math.max(0, b.pending - selectedRequest.days) } : b,
        ),
      );
    }

    toast.success('Demande annul\u00e9e', {
      description: 'Votre demande de cong\u00e9 a \u00e9t\u00e9 annul\u00e9e.',
    });

    setIsCancelDialogOpen(false);
    setSelectedRequest(null);
  };

  const openCancel = (req: LeaveRequest) => {
    setSelectedRequest(req);
    setIsCancelDialogOpen(true);
  };

  const openDetail = (req: LeaveRequest) => {
    setSelectedRequest(req);
    setIsDetailDialogOpen(true);
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-orange-500" />
            Mes Cong\u00e9s & Absences
          </h1>
          <p className="text-muted-foreground">
            G\u00e9rez vos demandes de cong\u00e9s et absences \u2014 {CURRENT_USER.name}, {CURRENT_USER.department}
          </p>
        </div>
        <Button className="bg-gradient-to-r from-orange-500 to-red-600" onClick={() => setIsNewDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle demande
        </Button>
      </div>

      {/* ---- Stats ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total demandes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
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
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">Approuv\u00e9es</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground">Rejet\u00e9es / Annul\u00e9es</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---- Leave Balances ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-orange-500" />
            Mes soldes de cong\u00e9s
          </CardTitle>
          <CardDescription>Solde disponible pour l\u2019ann\u00e9e 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {balances.map((b) => {
              const config = LEAVE_TYPE_CONFIG[b.type];
              const remaining = b.total === Infinity ? Infinity : b.total - b.used - b.pending;
              const progress = b.total === Infinity ? 0 : Math.round(((b.total - b.used - b.pending) / b.total) * 100);
              const isLimited = b.total !== Infinity;

              return (
                <div
                  key={b.type}
                  className="rounded-xl border p-4 space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                      <config.icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <span className="font-medium text-sm">{b.label}</span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {remaining === Infinity ? '\u221e' : remaining}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isLimited ? `sur ${b.total} jours` : 'illimit\u00e9'}
                      </p>
                    </div>
                    <div className="text-right text-xs space-y-0.5 text-muted-foreground">
                      <p>
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />
                        Utilis\u00e9 : {b.used}
                      </p>
                      <p>
                        <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1" />
                        En attente : {b.pending}
                      </p>
                    </div>
                  </div>

                  {isLimited && (
                    <Progress
                      value={progress}
                      className={`h-2 ${progress > 50 ? '[&>div]:bg-green-500' : progress > 20 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ---- Leave Requests List ---- */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                Mes demandes
              </CardTitle>
              <CardDescription>{filteredRequests.length} demande(s)</CardDescription>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuv\u00e9es</SelectItem>
                <SelectItem value="rejected">Rejet\u00e9es</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[520px]">
            {filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mb-3 opacity-40" />
                <p className="text-sm">Aucune demande trouv\u00e9e.</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredRequests.map((req) => {
                  const typeConf = LEAVE_TYPE_CONFIG[req.type];
                  const statusConf = STATUS_CONFIG[req.status];

                  return (
                    <div
                      key={req.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                      onClick={() => openDetail(req)}
                    >
                      {/* Left – icon + info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-lg ${typeConf.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <typeConf.icon className={`h-5 w-5 ${typeConf.color}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{typeConf.label}</p>
                            <Badge variant="outline" className={`${statusConf.bg} ${statusConf.color} border-0 text-xs`}>
                              <statusConf.icon className="h-3 w-3 mr-1" />
                              {statusConf.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            Du {formatDate(req.startDate)} au {formatDate(req.endDate)}
                            <span className="mx-1">&middot;</span>
                            {req.days} jour(s)
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{req.reason}</p>
                        </div>
                      </div>

                      {/* Right – actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCancel(req);
                            }}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Annuler
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(req);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          D\u00e9tails
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* NEW REQUEST DIALOG                                                */}
      {/* ================================================================ */}
      <Dialog open={isNewDialogOpen} onOpenChange={(open) => { setIsNewDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-orange-500" />
              Nouvelle demande de cong\u00e9
            </DialogTitle>
            <DialogDescription>
              Remplissez le formulaire ci-dessous pour soumettre votre demande. Elle sera examin\u00e9e par votre responsable.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="leave-type">Type de cong\u00e9 *</Label>
              <Select value={formType} onValueChange={(v) => setFormType(v as LeaveType)}>
                <SelectTrigger id="leave-type">
                  <SelectValue placeholder="S\u00e9lectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      { value: 'conge_annuel', label: 'Cong\u00e9 annuel' },
                      { value: 'conge_maladie', label: 'Cong\u00e9 maladie' },
                      { value: 'permission', label: 'Permission' },
                      { value: 'absence', label: 'Absence' },
                    ] as const
                  ).map((t) => {
                    const bal = balances.find((b) => b.type === t.value);
                    const remaining = bal ? (bal.total === Infinity ? '\u221e' : bal.total - bal.used - bal.pending) : '?';
                    const remainingLabel = bal?.total === Infinity ? 'illimit\u00e9' : `${remaining} jour(s) restant(s)`;
                    return (
                      <SelectItem key={t.value} value={t.value}>
                        <span className="flex items-center justify-between gap-4 w-full">
                          <span>{t.label}</span>
                          <span className="text-xs text-muted-foreground ml-4">{remainingLabel}</span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Date de d\u00e9but *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Date de fin *</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  min={formStartDate || undefined}
                />
              </div>
            </div>

            {/* Computed days preview */}
            {formStartDate && formEndDate && new Date(formEndDate) >= new Date(formStartDate) && (
              <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300">
                <Clock className="h-4 w-4 shrink-0" />
                <span>
                  <strong>{countBusinessDays(formStartDate, formEndDate)} jour(s) ouvrable(s)</strong> s\u00e9lectionn\u00e9(s)
                </span>
              </div>
            )}

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Raison *</Label>
              <Textarea
                id="reason"
                placeholder="D\u00e9crivez la raison de votre demande..."
                rows={3}
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600" onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-2" />
              Envoyer la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/* CANCEL CONFIRMATION DIALOG                                        */}
      {/* ================================================================ */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-5 w-5" />
              Annuler la demande
            </DialogTitle>
            <DialogDescription>
              \u00cates-vous s\u00fbr de vouloir annuler cette demande ? Cette action est irr\u00e9versible.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="rounded-lg border p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{LEAVE_TYPE_CONFIG[selectedRequest.type].label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">P\u00e9riode</span>
                <span className="font-medium">{formatDate(selectedRequest.startDate)} &rarr; {formatDate(selectedRequest.endDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dur\u00e9e</span>
                <span className="font-medium">{selectedRequest.days} jour(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Raison</span>
                <span className="font-medium text-right max-w-[220px] truncate">{selectedRequest.reason}</span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Non, garder</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleCancel}>
              <Ban className="h-4 w-4 mr-2" />
              Oui, annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/* REQUEST DETAIL DIALOG                                             */}
      {/* ================================================================ */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              D\u00e9tails de la demande
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-2">
              {/* Status badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Statut :</span>
                <Badge variant="outline" className={`${STATUS_CONFIG[selectedRequest.status].bg} ${STATUS_CONFIG[selectedRequest.status].color} border-0`}>
                  {STATUS_CONFIG[selectedRequest.status].label}
                </Badge>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border p-3 space-y-1">
                  <p className="text-muted-foreground text-xs">Type</p>
                  <p className="font-medium flex items-center gap-1.5">
                    {(() => {
                      const Icon = LEAVE_TYPE_CONFIG[selectedRequest.type].icon;
                      return <Icon className="h-4 w-4" />;
                    })()}
                    {LEAVE_TYPE_CONFIG[selectedRequest.type].label}
                  </p>
                </div>
                <div className="rounded-lg border p-3 space-y-1">
                  <p className="text-muted-foreground text-xs">Dur\u00e9e</p>
                  <p className="font-medium">{selectedRequest.days} jour(s)</p>
                </div>
                <div className="rounded-lg border p-3 space-y-1">
                  <p className="text-muted-foreground text-xs">Date de d\u00e9but</p>
                  <p className="font-medium">{formatDate(selectedRequest.startDate)}</p>
                </div>
                <div className="rounded-lg border p-3 space-y-1">
                  <p className="text-muted-foreground text-xs">Date de fin</p>
                  <p className="font-medium">{formatDate(selectedRequest.endDate)}</p>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground text-xs">Raison</p>
                <p className="font-medium">{selectedRequest.reason}</p>
              </div>

              {/* Created */}
              <p className="text-xs text-muted-foreground">
                Demande soumise le {formatDate(selectedRequest.createdAt)}
              </p>

              {/* Rejection reason */}
              {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm">
                  <p className="font-medium text-red-700 dark:text-red-300 mb-1">Motif du rejet :</p>
                  <p className="text-red-600 dark:text-red-400">{selectedRequest.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Fermer</Button>
            </DialogClose>
            {selectedRequest?.status === 'pending' && (
              <Button
                variant="destructive"
                onClick={() => {
                  setIsDetailDialogOpen(false);
                  setTimeout(() => openCancel(selectedRequest), 150);
                }}
              >
                <Ban className="h-4 w-4 mr-2" />
                Annuler cette demande
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
