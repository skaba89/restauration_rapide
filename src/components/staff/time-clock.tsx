'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Clock, 
  UserCheck, 
  UserX, 
  Users, 
  Timer,
  MapPin,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
interface TimeEntry {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  clockIn: Date;
  clockOut: Date | null;
  location: string;
  status: 'clocked_in' | 'clocked_out';
  hoursWorked: number;
}

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  roleLabel: string;
  status: 'active' | 'on_leave' | 'inactive';
  hourlyRate: number;
}

// Get initials
const getInitials = (firstName: string, lastName: string) => 
  `${firstName[0]}${lastName[0]}`.toUpperCase();

// Format duration
const formatDuration = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}min`;
};

// Role colors
const ROLE_COLORS: Record<string, string> = {
  manager: 'bg-purple-100 text-purple-700',
  chef: 'bg-red-100 text-red-700',
  cook: 'bg-orange-100 text-orange-700',
  waiter: 'bg-blue-100 text-blue-700',
  cashier: 'bg-green-100 text-green-700',
  delivery_driver: 'bg-amber-100 text-amber-700',
  cleaner: 'bg-gray-100 text-gray-700',
};

export function TimeClock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [location, setLocation] = useState('Restaurant Principal');

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get active entries (currently clocked in)
  const activeEntries = timeEntries.filter(e => e.status === 'clocked_in');
  
  // Get today's completed entries
  const todayEntries = timeEntries.filter(e => {
    const entryDate = new Date(e.clockIn);
    const today = new Date();
    return entryDate.toDateString() === today.toDateString();
  });

  // Calculate total hours for today
  const totalHoursToday = todayEntries.reduce((sum, e) => {
    if (e.clockOut) {
      return sum + differenceInMinutes(e.clockOut, e.clockIn) / 60;
    }
    return sum + differenceInMinutes(new Date(), e.clockIn) / 60;
  }, 0);

  // Get current status for selected staff
  const getCurrentStatus = (staffId: string) => {
    const entry = timeEntries.find(e => e.staffId === staffId && e.status === 'clocked_in');
    return entry;
  };

  // Handle clock in/out
  const handleClockAction = () => {
    if (!selectedStaffId) return;
    
    const staff = null;
    if (!staff) return;

    const currentEntry = getCurrentStatus(selectedStaffId);

    if (currentEntry) {
      // Clock out
      setTimeEntries(timeEntries.map(e => 
        e.id === currentEntry.id 
          ? { 
              ...e, 
              clockOut: new Date(), 
              status: 'clocked_out',
              hoursWorked: differenceInMinutes(new Date(), e.clockIn) / 60
            }
          : e
      ));
    } else {
      // Clock in
      const newEntry: TimeEntry = {
        id: `te${Date.now()}`,
        staffId: selectedStaffId,
        staffName: `${staff.firstName} ${staff.lastName}`,
        role: staff.role,
        clockIn: new Date(),
        clockOut: null,
        location,
        status: 'clocked_in',
        hoursWorked: 0,
      };
      setTimeEntries([newEntry, ...timeEntries]);
    }
  };

  // Calculate hours worked for an active entry
  const calculateCurrentHours = (entry: TimeEntry) => {
    return differenceInMinutes(new Date(), entry.clockIn) / 60;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En service</p>
                <p className="text-2xl font-bold text-green-600">{activeEntries.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pointages aujourd'hui</p>
                <p className="text-2xl font-bold">{todayEntries.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Heures aujourd'hui</p>
                <p className="text-2xl font-bold">{formatDuration(totalHoursToday)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Timer className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Non pointés</p>
                <p className="text-2xl font-bold text-red-600">
                  {0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clock In/Out Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pointage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Clock Display */}
            <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div className="text-6xl font-bold text-orange-600 tracking-tight">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-lg text-orange-700 mt-2">
                {format(currentTime, 'EEEE d MMMM yyyy', { locale: fr })}
              </div>
            </div>

            {/* Clock In/Out Form */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Employé</label>
                  <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un employé" />
                    </SelectTrigger>
                    <SelectContent>
                      {[].map(s => {
                        const isClockedIn = !!getCurrentStatus(s.id);
                        return (
                          <SelectItem key={s.id} value={s.id}>
                            <div className="flex items-center gap-2">
                              <span>{s.firstName} {s.lastName}</span>
                              {isClockedIn && (
                                <Badge className="bg-green-100 text-green-700 text-xs">En service</Badge>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Localisation</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Restaurant Principal">Restaurant Principal</SelectItem>
                      <SelectItem value="Cuisine">Cuisine</SelectItem>
                      <SelectItem value="Salle">Salle</SelectItem>
                      <SelectItem value="Caisse">Caisse</SelectItem>
                      <SelectItem value="Extérieur">Extérieur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Current Status */}
              {selectedStaffId && (
                <div className="p-4 rounded-lg bg-muted/50">
                  {(() => {
                    const currentEntry = getCurrentStatus(selectedStaffId);
                    const staff = null;
                    
                    if (currentEntry) {
                      return (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                            <div>
                              <p className="font-medium text-green-700">En service</p>
                              <p className="text-sm text-muted-foreground">
                                Depuis {format(currentEntry.clockIn, 'HH:mm')} ({formatDuration(calculateCurrentHours(currentEntry))})
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {currentEntry.location}
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                        <div>
                          <p className="font-medium">Non pointé</p>
                          <p className="text-sm text-muted-foreground">
                            {staff?.roleLabel} - {staff?.hourlyRate.toLocaleString()} GNF/h
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Action Button */}
              <Button
                size="lg"
                className={`w-full text-lg py-6 ${
                  selectedStaffId && getCurrentStatus(selectedStaffId)
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
                onClick={handleClockAction}
                disabled={!selectedStaffId}
              >
                {selectedStaffId && getCurrentStatus(selectedStaffId) ? (
                  <>
                    <UserX className="h-5 w-5 mr-2" />
                    Dépointer
                  </>
                ) : (
                  <>
                    <UserCheck className="h-5 w-5 mr-2" />
                    Pointer
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currently Working */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            En service ({activeEntries.length})
          </CardTitle>
          <CardDescription>Employés actuellement en service</CardDescription>
        </CardHeader>
        <CardContent>
          {activeEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun employé en service actuellement
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {activeEntries.map(entry => {
                  const staff = null;
                  const currentHours = calculateCurrentHours(entry);
                  
                  return (
                    <div 
                      key={entry.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-green-100 text-green-700">
                            {getInitials(entry.staffName.split(' ')[0], entry.staffName.split(' ')[1])}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{entry.staffName}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={ROLE_COLORS[entry.role]}>
                              {staff?.roleLabel}
                            </Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {entry.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Depuis {format(entry.clockIn, 'HH:mm')}
                        </p>
                        <p className="font-medium text-green-600">
                          {formatDuration(currentHours)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Today's Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Historique du jour</CardTitle>
          <CardDescription>Tous les pointages d'aujourd'hui</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Arrivée</TableHead>
                  <TableHead>Départ</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayEntries.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(entry.staffName.split(' ')[0], entry.staffName.split(' ')[1])}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{entry.staffName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {format(entry.clockIn, 'HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {entry.clockOut ? (
                        <div className="flex items-center gap-1">
                          <XCircle className="h-4 w-4 text-red-500" />
                          {format(entry.clockOut, 'HH:mm')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {formatDuration(entry.clockOut ? entry.hoursWorked : calculateCurrentHours(entry))}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {entry.location}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={entry.status === 'clocked_in' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {entry.status === 'clocked_in' ? 'En service' : 'Terminé'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default TimeClock;