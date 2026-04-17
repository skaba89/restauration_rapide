'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose 
} from '@/components/ui/dialog';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MoreVertical,
  Printer,
  Calendar,
  Clock,
  User,
  Pencil,
  Trash2,
  Copy
} from 'lucide-react';
import { addDays, subDays, format, startOfWeek, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  color: string;
}

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  roleLabel: string;
}

// Day names
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const FULL_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export function ScheduleCalendar() {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staff] = useState<StaffMember[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    staffId: '',
    startTime: '08:00',
    endTime: '16:00',
    notes: '',
  });

  // Generate week days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  // Get shifts for a specific day and staff
  const getShiftsForDayAndStaff = (date: string, staffId: string) => {
    return shifts.filter(s => s.date === date && s.staffId === staffId);
  };

  // Navigate weeks
  const goToPreviousWeek = () => setCurrentWeekStart(subDays(currentWeekStart, 7));
  const goToNextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
  const goToCurrentWeek = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Handle add shift
  const handleAddShift = () => {
    const staffMember = staff.find(s => s.id === formData.staffId);
    if (!staffMember || !selectedDate) return;

    const roleColors: Record<string, string> = {
      manager: '#8B5CF6',
      chef: '#EF4444',
      cook: '#F97316',
      waiter: '#3B82F6',
      cashier: '#10B981',
      delivery_driver: '#F59E0B',
      cleaner: '#6B7280',
    };

    const newShift: Shift = {
      id: `s${Date.now()}`,
      staffId: formData.staffId,
      staffName: `${staffMember.firstName} ${staffMember.lastName}`,
      role: staffMember.role,
      date: selectedDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      status: 'scheduled',
      notes: formData.notes,
      color: roleColors[staffMember.role] || '#6B7280',
    };

    setShifts([...shifts, newShift]);
    setIsAddDialogOpen(false);
    setSelectedDate(null);
    setFormData({ staffId: '', startTime: '08:00', endTime: '16:00', notes: '' });
  };

  // Handle delete shift
  const handleDeleteShift = (shiftId: string) => {
    setShifts(shifts.filter(s => s.id !== shiftId));
    setSelectedShift(null);
  };

  // Handle copy shift
  const handleCopyShift = (shift: Shift) => {
    const newShift: Shift = {
      ...shift,
      id: `s${Date.now()}`,
    };
    setShifts([...shifts, newShift]);
  };

  // Print schedule
  const handlePrint = () => {
    window.print();
  };

  // Calculate total hours for the week
  const calculateWeeklyHours = (staffId: string) => {
    const staffShifts = shifts.filter(s => s.staffId === staffId);
    let totalMinutes = 0;
    staffShifts.forEach(shift => {
      const [startH, startM] = shift.startTime.split(':').map(Number);
      const [endH, endM] = shift.endTime.split(':').map(Number);
      totalMinutes += (endH * 60 + endM) - (startH * 60 + startM);
    });
    return `${Math.floor(totalMinutes / 60)}h${totalMinutes % 60 > 0 ? `${totalMinutes % 60}` : ''}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Planning de la semaine</h2>
          <p className="text-sm text-muted-foreground">
            {format(currentWeekStart, 'd MMMM', { locale: fr })} - {format(addDays(currentWeekStart, 6), 'd MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToCurrentWeek}>Aujourd'hui</Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              {/* Header */}
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left w-40 bg-muted/50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Employé</span>
                    </div>
                  </th>
                  {weekDays.map((day, i) => (
                    <th 
                      key={i} 
                      className={`p-3 text-center border-l ${isToday(day) ? 'bg-orange-50' : ''}`}
                    >
                      <div className="font-medium">{DAYS[i]}</div>
                      <div className={`text-sm ${isToday(day) ? 'text-orange-600 font-bold' : 'text-muted-foreground'}`}>
                        {format(day, 'd MMM')}
                      </div>
                    </th>
                  ))}
                  <th className="p-3 text-center w-20 bg-muted/50 border-l">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">Total</span>
                    </div>
                  </th>
                </tr>
              </thead>
              {/* Body */}
              <tbody>
                {staff.map(member => (
                  <tr key={member.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 bg-muted/30 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-8 rounded"
                          style={{ backgroundColor: shifts.find(s => s.staffId === member.id)?.color || '#6B7280' }}
                        />
                        <div>
                          <p className="font-medium text-sm">{member.firstName} {member.lastName}</p>
                          <p className="text-xs text-muted-foreground">{member.roleLabel}</p>
                        </div>
                      </div>
                    </td>
                    {weekDays.map((day, i) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const dayShifts = getShiftsForDayAndStaff(dateStr, member.id);
                      const isTodayCell = isToday(day);
                      
                      return (
                        <td 
                          key={i} 
                          className={`p-1 border-l align-top h-20 ${isTodayCell ? 'bg-orange-50/50' : ''}`}
                        >
                          <div className="space-y-1">
                            {dayShifts.map(shift => (
                              <div
                                key={shift.id}
                                className="group relative p-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: shift.color + '20', borderLeft: `3px solid ${shift.color}` }}
                                onClick={() => setSelectedShift(shift)}
                              >
                                <div className="font-medium" style={{ color: shift.color }}>
                                  {shift.startTime} - {shift.endTime}
                                </div>
                                {shift.notes && (
                                  <div className="text-muted-foreground truncate">{shift.notes}</div>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-5 w-5 absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                                      onClick={e => e.stopPropagation()}
                                    >
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSelectedShift(shift)}>
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Modifier
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleCopyShift(shift)}>
                                      <Copy className="h-4 w-4 mr-2" />
                                      Dupliquer
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => handleDeleteShift(shift.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Supprimer
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            ))}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full h-6 text-xs opacity-0 hover:opacity-100 transition-opacity"
                              onClick={() => {
                                setSelectedDate(dateStr);
                                setFormData({ ...formData, staffId: member.id });
                                setIsAddDialogOpen(true);
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      );
                    })}
                    <td className="p-2 text-center border-l bg-muted/30">
                      <span className="text-sm font-medium">{calculateWeeklyHours(member.id)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Shift Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un shift</DialogTitle>
            <DialogDescription>
              {selectedDate && `Pour le ${format(new Date(selectedDate), 'EEEE d MMMM', { locale: fr })}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Employé</Label>
              <Select value={formData.staffId} onValueChange={v => setFormData({...formData, staffId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName} - {s.roleLabel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heure début</Label>
                <Input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Heure fin</Label>
                <Input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Optionnel" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleAddShift} disabled={!formData.staffId}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shift Details Dialog */}
      <Dialog open={!!selectedShift} onOpenChange={() => setSelectedShift(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Détails du shift</DialogTitle>
          </DialogHeader>
          {selectedShift && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-12 rounded"
                  style={{ backgroundColor: selectedShift.color }}
                />
                <div>
                  <p className="font-medium">{selectedShift.staffName}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedShift.date), 'EEEE d MMMM', { locale: fr })}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Début</p>
                  <p className="font-medium">{selectedShift.startTime}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fin</p>
                  <p className="font-medium">{selectedShift.endTime}</p>
                </div>
              </div>
              {selectedShift.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p>{selectedShift.notes}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleCopyShift(selectedShift)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Dupliquer
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => handleDeleteShift(selectedShift.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ScheduleCalendar;