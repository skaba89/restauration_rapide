'use client';

// ============================================
// Restaurant OS - Admin Reservations Management
// Gestion des réservations
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Calendar,
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Phone,
  Mail,
  CalendarDays,
  TrendingUp,
  AlertCircle,
  UserCheck,
} from 'lucide-react';

interface Reservation {
  id: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  partySize: number;
  date: string;
  time: string;
  status: string;
  restaurant: { name: string };
  table?: { number: string };
  specialRequests?: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SEATED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-red-100 text-red-700',
};

const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    async function fetchReservations() {
      try {
        const response = await fetchWithAuth('/api/admin/reservations');
        if (response.ok) {
          const data = await response.json();
          setReservations(data.data || []);
        } else {
          throw new Error('API error');
        }
      } catch (error) {
        console.error('Error fetching reservations:', error);
        // Demo data
        const today = new Date();
        setReservations([
          {
            id: '1',
            guestName: 'Amadou Diallo',
            guestPhone: '+224 622 00 00 01',
            guestEmail: 'amadou@email.com',
            partySize: 4,
            date: today.toISOString(),
            time: '19:00',
            status: 'CONFIRMED',
            restaurant: { name: 'KFM DELICE' },
            table: { number: 'A1' },
            specialRequests: 'Table près de la fenêtre',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: '2',
            guestName: 'Fatou Ndiaye',
            guestPhone: '+224 622 00 00 02',
            partySize: 2,
            date: today.toISOString(),
            time: '20:30',
            status: 'PENDING',
            restaurant: { name: 'KFM DELICE' },
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: '3',
            guestName: 'Kofi Mensah',
            guestPhone: '+224 622 00 00 03',
            guestEmail: 'kofi@email.com',
            partySize: 6,
            date: new Date(today.getTime() + 86400000).toISOString(),
            time: '12:30',
            status: 'CONFIRMED',
            restaurant: { name: 'KFM DELICE' },
            table: { number: 'B3' },
            specialRequests: 'Anniversaire - gâteau souhaité',
            createdAt: new Date(Date.now() - 259200000).toISOString(),
          },
          {
            id: '4',
            guestName: 'Aisha Bamba',
            guestPhone: '+224 622 00 00 04',
            partySize: 3,
            date: new Date(today.getTime() - 86400000).toISOString(),
            time: '19:30',
            status: 'COMPLETED',
            restaurant: { name: 'KFM DELICE' },
            table: { number: 'A2' },
            createdAt: new Date(Date.now() - 345600000).toISOString(),
          },
          {
            id: '5',
            guestName: 'Moussa Koné',
            guestPhone: '+224 622 00 00 05',
            partySize: 2,
            date: new Date(today.getTime() - 86400000).toISOString(),
            time: '20:00',
            status: 'NO_SHOW',
            restaurant: { name: 'KFM DELICE' },
            createdAt: new Date(Date.now() - 432000000).toISOString(),
          },
          {
            id: '6',
            guestName: 'Ibrahim Touré',
            guestPhone: '+224 622 00 00 06',
            guestEmail: 'ibrahim@email.com',
            partySize: 8,
            date: new Date(today.getTime() + 172800000).toISOString(),
            time: '20:00',
            status: 'PENDING',
            restaurant: { name: 'KFM DELICE' },
            specialRequests: 'Réunion d\'affaires - espace privé souhaité',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchReservations();
  }, []);

  const filteredReservations = reservations.filter(res => {
    const matchesSearch = search === '' ||
      res.guestName.toLowerCase().includes(search.toLowerCase()) ||
      res.guestPhone.includes(search);
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'PENDING').length,
    confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
    completed: reservations.filter(r => r.status === 'COMPLETED').length,
    noShows: reservations.filter(r => r.status === 'NO_SHOW').length,
    totalGuests: reservations.filter(r => ['CONFIRMED', 'SEATED', 'COMPLETED'].includes(r.status)).reduce((sum, r) => sum + r.partySize, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Réservations</h1>
          <p className="text-muted-foreground">Réservations de tables</p>
        </div>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Nouvelle réservation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarDays className="h-4 w-4 text-blue-600" />
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
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
                <p className="text-xs text-muted-foreground">Confirmées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalGuests}</p>
                <p className="text-xs text-muted-foreground">Invités prévus</p>
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
                <p className="text-2xl font-bold">{stats.noShows}</p>
                <p className="text-xs text-muted-foreground">No-shows</p>
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
                placeholder="Rechercher par nom ou téléphone..."
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
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="CONFIRMED">Confirmée</SelectItem>
                <SelectItem value="SEATED">Installée</SelectItem>
                <SelectItem value="COMPLETED">Terminée</SelectItem>
                <SelectItem value="CANCELLED">Annulée</SelectItem>
                <SelectItem value="NO_SHOW">No-show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des réservations ({filteredReservations.length})</CardTitle>
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
                    <TableHead>Client</TableHead>
                    <TableHead>Date & Heure</TableHead>
                    <TableHead>Personnes</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((res) => (
                    <TableRow key={res.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{res.guestName}</p>
                          <p className="text-xs text-muted-foreground">{res.guestPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatDate(res.date)}</p>
                          <p className="text-sm text-muted-foreground">{res.time}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{res.partySize}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {res.table ? (
                          <Badge variant="outline">Table {res.table.number}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{res.restaurant.name}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[res.status]}>
                          {res.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedReservation(res)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reservation Detail Dialog */}
      <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Réservation</DialogTitle>
            <DialogDescription>Détails de la réservation</DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium">{selectedReservation.guestName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge className={statusColors[selectedReservation.status]}>
                    {selectedReservation.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Téléphone
                  </p>
                  <p className="font-medium">{selectedReservation.guestPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </p>
                  <p className="font-medium">{selectedReservation.guestEmail || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(selectedReservation.date)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Heure</p>
                  <p className="font-medium">{selectedReservation.time}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Personnes</p>
                  <p className="font-medium">{selectedReservation.partySize}</p>
                </div>
              </div>

              {selectedReservation.table && (
                <div>
                  <p className="text-sm text-muted-foreground">Table assignée</p>
                  <Badge variant="outline" className="mt-1">Table {selectedReservation.table.number}</Badge>
                </div>
              )}

              {selectedReservation.specialRequests && (
                <div>
                  <p className="text-sm text-muted-foreground">Demandes spéciales</p>
                  <p className="text-sm bg-gray-50 p-2 rounded mt-1">{selectedReservation.specialRequests}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {selectedReservation.status === 'PENDING' && (
                  <>
                    <Button className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmer
                    </Button>
                    <Button variant="destructive" className="flex-1">
                      <XCircle className="h-4 w-4 mr-2" />
                      Refuser
                    </Button>
                  </>
                )}
                {selectedReservation.status === 'CONFIRMED' && (
                  <Button className="flex-1">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Marquer installé
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
