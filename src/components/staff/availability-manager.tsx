'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Calendar,
  Clock,
  Check,
  X,
  Copy,
  Users,
  CalendarCheck,
  CalendarX
} from 'lucide-react';

// Types
interface Availability {
  id: string;
  staffId: string;
  staffName: string;
  dayOfWeek: number;
  dayLabel: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Days configuration
const DAYS = [
  { value: 1, label: 'Lundi', short: 'Lun' },
  { value: 2, label: 'Mardi', short: 'Mar' },
  { value: 3, label: 'Mercredi', short: 'Mer' },
  { value: 4, label: 'Jeudi', short: 'Jeu' },
  { value: 5, label: 'Vendredi', short: 'Ven' },
  { value: 6, label: 'Samedi', short: 'Sam' },
  { value: 0, label: 'Dimanche', short: 'Dim' },
];

// Demo staff for selection
const STAFF_LIST = [
  { id: '1', name: 'Amadou Diallo', role: 'Directeur' },
  { id: '2', name: 'Fatou Sylla', role: 'Chef Cuisinier' },
  { id: '3', name: 'Ibrahim Keita', role: 'Cuisinier' },
  { id: '4', name: 'Marie Koulibaly', role: 'Serveuse' },
  { id: '5', name: 'Moussa Camara', role: 'Livreur' },
  { id: '6', name: 'Aissatou Traore', role: 'Caissière' },
  { id: '8', name: 'Fanta Diarra', role: 'Serveuse' },
  { id: '9', name: 'Oumar Bah', role: 'Agent d\'entretien' },
];

// Demo availability
const DEMO_AVAILABILITY: Availability[] = [
  // Amadou - Manager
  { id: '1', staffId: '1', staffName: 'Amadou Diallo', dayOfWeek: 1, dayLabel: 'Lundi', startTime: '08:00', endTime: '18:00', isAvailable: true },
  { id: '2', staffId: '1', staffName: 'Amadou Diallo', dayOfWeek: 2, dayLabel: 'Mardi', startTime: '08:00', endTime: '18:00', isAvailable: true },
  { id: '3', staffId: '1', staffName: 'Amadou Diallo', dayOfWeek: 3, dayLabel: 'Mercredi', startTime: '08:00', endTime: '18:00', isAvailable: true },
  { id: '4', staffId: '1', staffName: 'Amadou Diallo', dayOfWeek: 4, dayLabel: 'Jeudi', startTime: '08:00', endTime: '18:00', isAvailable: true },
  { id: '5', staffId: '1', staffName: 'Amadou Diallo', dayOfWeek: 5, dayLabel: 'Vendredi', startTime: '08:00', endTime: '20:00', isAvailable: true },
  { id: '6', staffId: '1', staffName: 'Amadou Diallo', dayOfWeek: 6, dayLabel: 'Samedi', startTime: '09:00', endTime: '15:00', isAvailable: true },
  { id: '7', staffId: '1', staffName: 'Amadou Diallo', dayOfWeek: 0, dayLabel: 'Dimanche', startTime: '00:00', endTime: '00:00', isAvailable: false },

  // Fatou - Chef
  { id: '11', staffId: '2', staffName: 'Fatou Sylla', dayOfWeek: 2, dayLabel: 'Mardi', startTime: '10:00', endTime: '22:00', isAvailable: true },
  { id: '12', staffId: '2', staffName: 'Fatou Sylla', dayOfWeek: 3, dayLabel: 'Mercredi', startTime: '10:00', endTime: '22:00', isAvailable: true },
  { id: '13', staffId: '2', staffName: 'Fatou Sylla', dayOfWeek: 4, dayLabel: 'Jeudi', startTime: '10:00', endTime: '22:00', isAvailable: true },
  { id: '14', staffId: '2', staffName: 'Fatou Sylla', dayOfWeek: 5, dayLabel: 'Vendredi', startTime: '10:00', endTime: '23:00', isAvailable: true },
  { id: '15', staffId: '2', staffName: 'Fatou Sylla', dayOfWeek: 6, dayLabel: 'Samedi', startTime: '10:00', endTime: '23:00', isAvailable: true },
  { id: '16', staffId: '2', staffName: 'Fatou Sylla', dayOfWeek: 0, dayLabel: 'Dimanche', startTime: '11:00', endTime: '20:00', isAvailable: true },
  { id: '17', staffId: '2', staffName: 'Fatou Sylla', dayOfWeek: 1, dayLabel: 'Lundi', startTime: '00:00', endTime: '00:00', isAvailable: false },

  // Ibrahim - Cook
  { id: '21', staffId: '3', staffName: 'Ibrahim Keita', dayOfWeek: 1, dayLabel: 'Lundi', startTime: '08:00', endTime: '16:00', isAvailable: true },
  { id: '22', staffId: '3', staffName: 'Ibrahim Keita', dayOfWeek: 2, dayLabel: 'Mardi', startTime: '08:00', endTime: '16:00', isAvailable: true },
  { id: '23', staffId: '3', staffName: 'Ibrahim Keita', dayOfWeek: 3, dayLabel: 'Mercredi', startTime: '08:00', endTime: '16:00', isAvailable: true },
  { id: '24', staffId: '3', staffName: 'Ibrahim Keita', dayOfWeek: 4, dayLabel: 'Jeudi', startTime: '08:00', endTime: '16:00', isAvailable: true },
  { id: '25', staffId: '3', staffName: 'Ibrahim Keita', dayOfWeek: 5, dayLabel: 'Vendredi', startTime: '08:00', endTime: '16:00', isAvailable: true },
  { id: '26', staffId: '3', staffName: 'Ibrahim Keita', dayOfWeek: 6, dayLabel: 'Samedi', startTime: '00:00', endTime: '00:00', isAvailable: false },
  { id: '27', staffId: '3', staffName: 'Ibrahim Keita', dayOfWeek: 0, dayLabel: 'Dimanche', startTime: '00:00', endTime: '00:00', isAvailable: false },

  // Marie - Waiter
  { id: '31', staffId: '4', staffName: 'Marie Koulibaly', dayOfWeek: 3, dayLabel: 'Mercredi', startTime: '11:00', endTime: '22:00', isAvailable: true },
  { id: '32', staffId: '4', staffName: 'Marie Koulibaly', dayOfWeek: 4, dayLabel: 'Jeudi', startTime: '11:00', endTime: '22:00', isAvailable: true },
  { id: '33', staffId: '4', staffName: 'Marie Koulibaly', dayOfWeek: 5, dayLabel: 'Vendredi', startTime: '11:00', endTime: '23:00', isAvailable: true },
  { id: '34', staffId: '4', staffName: 'Marie Koulibaly', dayOfWeek: 6, dayLabel: 'Samedi', startTime: '11:00', endTime: '23:00', isAvailable: true },
  { id: '35', staffId: '4', staffName: 'Marie Koulibaly', dayOfWeek: 0, dayLabel: 'Dimanche', startTime: '11:00', endTime: '21:00', isAvailable: true },
  { id: '36', staffId: '4', staffName: 'Marie Koulibaly', dayOfWeek: 1, dayLabel: 'Lundi', startTime: '00:00', endTime: '00:00', isAvailable: false },
  { id: '37', staffId: '4', staffName: 'Marie Koulibaly', dayOfWeek: 2, dayLabel: 'Mardi', startTime: '00:00', endTime: '00:00', isAvailable: false },
];

// Templates
const TEMPLATES = [
  { name: 'Temps plein', days: [1, 2, 3, 4, 5], start: '08:00', end: '17:00' },
  { name: 'Temps partiel matin', days: [1, 2, 3, 4, 5], start: '06:00', end: '12:00' },
  { name: 'Temps partiel soir', days: [1, 2, 3, 4, 5], start: '14:00', end: '22:00' },
  { name: 'Week-end', days: [6, 0], start: '10:00', end: '22:00' },
];

export function AvailabilityManager() {
  const [availability, setAvailability] = useState<Availability[]>(DEMO_AVAILABILITY);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('1');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ startTime: '08:00', endTime: '17:00', isAvailable: true });

  // Get selected staff availability
  const selectedStaff = STAFF_LIST.find(s => s.id === selectedStaffId);
  const staffAvailability = DAYS.map(day => {
    const existing = availability.find(a => a.staffId === selectedStaffId && a.dayOfWeek === day.value);
    return existing || {
      id: `${selectedStaffId}-${day.value}`,
      staffId: selectedStaffId,
      staffName: selectedStaff?.name || '',
      dayOfWeek: day.value,
      dayLabel: day.label,
      startTime: '00:00',
      endTime: '00:00',
      isAvailable: false,
    };
  });

  // Stats
  const availableDays = staffAvailability.filter(a => a.isAvailable).length;
  const totalHours = staffAvailability.reduce((acc, a) => {
    if (!a.isAvailable) return acc;
    const [startH, startM] = a.startTime.split(':').map(Number);
    const [endH, endM] = a.endTime.split(':').map(Number);
    return acc + (endH + endM / 60) - (startH + startM / 60);
  }, 0);

  // Toggle availability
  const toggleAvailability = (dayOfWeek: number) => {
    const existing = availability.find(a => a.staffId === selectedStaffId && a.dayOfWeek === dayOfWeek);
    if (existing) {
      setAvailability(availability.map(a => 
        a.id === existing.id 
          ? { ...a, isAvailable: !a.isAvailable, startTime: !a.isAvailable ? '08:00' : '00:00', endTime: !a.isAvailable ? '17:00' : '00:00' }
          : a
      ));
    } else {
      const day = DAYS.find(d => d.value === dayOfWeek);
      const newAvail: Availability = {
        id: `${selectedStaffId}-${dayOfWeek}`,
        staffId: selectedStaffId,
        staffName: selectedStaff?.name || '',
        dayOfWeek,
        dayLabel: day?.label || '',
        startTime: '08:00',
        endTime: '17:00',
        isAvailable: true,
      };
      setAvailability([...availability, newAvail]);
    }
  };

  // Open edit dialog
  const openEditDialog = (dayOfWeek: number) => {
    const existing = availability.find(a => a.staffId === selectedStaffId && a.dayOfWeek === dayOfWeek);
    setEditingDay(dayOfWeek);
    if (existing && existing.isAvailable) {
      setEditForm({ startTime: existing.startTime, endTime: existing.endTime, isAvailable: existing.isAvailable });
    } else {
      setEditForm({ startTime: '08:00', endTime: '17:00', isAvailable: true });
    }
    setIsEditDialogOpen(true);
  };

  // Save edit
  const saveEdit = () => {
    if (editingDay === null) return;
    const day = DAYS.find(d => d.value === editingDay);
    const existing = availability.find(a => a.staffId === selectedStaffId && a.dayOfWeek === editingDay);
    
    if (existing) {
      setAvailability(availability.map(a => 
        a.id === existing.id 
          ? { ...a, ...editForm }
          : a
      ));
    } else {
      const newAvail: Availability = {
        id: `${selectedStaffId}-${editingDay}`,
        staffId: selectedStaffId,
        staffName: selectedStaff?.name || '',
        dayOfWeek: editingDay,
        dayLabel: day?.label || '',
        ...editForm,
      };
      setAvailability([...availability, newAvail]);
    }
    setIsEditDialogOpen(false);
  };

  // Apply template
  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    const newAvailability = DAYS.map(day => {
      const isTemplateDay = template.days.includes(day.value);
      const existing = availability.find(a => a.staffId === selectedStaffId && a.dayOfWeek === day.value);
      return {
        id: existing?.id || `${selectedStaffId}-${day.value}`,
        staffId: selectedStaffId,
        staffName: selectedStaff?.name || '',
        dayOfWeek: day.value,
        dayLabel: day.label,
        startTime: isTemplateDay ? template.start : '00:00',
        endTime: isTemplateDay ? template.end : '00:00',
        isAvailable: isTemplateDay,
      };
    });
    // Remove old entries for this staff and add new ones
    setAvailability([
      ...availability.filter(a => a.staffId !== selectedStaffId),
      ...newAvailability
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jours disponibles</p>
                <p className="text-2xl font-bold">{availableDays} / 7</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CalendarCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Heures/semaine</p>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jours off</p>
                <p className="text-2xl font-bold text-gray-600">{7 - availableDays}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <CalendarX className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Disponibilités</CardTitle>
              <CardDescription>Gérez les disponibilités hebdomadaires</CardDescription>
            </div>
            <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Sélectionner un employé" />
              </SelectTrigger>
              <SelectContent>
                {STAFF_LIST.map(staff => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.name} - {staff.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Quick Templates */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm text-muted-foreground mr-2">Modèles rapides:</span>
            {TEMPLATES.map(template => (
              <Button
                key={template.name}
                variant="outline"
                size="sm"
                onClick={() => applyTemplate(template)}
              >
                {template.name}
              </Button>
            ))}
          </div>

          {/* Weekly Grid */}
          <div className="grid grid-cols-7 gap-2">
            {staffAvailability.map(avail => (
              <div
                key={avail.dayOfWeek}
                className={`
                  p-4 rounded-xl border-2 transition-all cursor-pointer
                  ${avail.isAvailable 
                    ? 'border-green-200 bg-green-50 hover:border-green-300' 
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'}
                `}
                onClick={() => toggleAvailability(avail.dayOfWeek)}
              >
                <div className="text-center">
                  <p className="font-medium text-sm mb-2">{DAYS.find(d => d.value === avail.dayOfWeek)?.short}</p>
                  {avail.isAvailable ? (
                    <>
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <Check className="h-4 w-4" />
                      </div>
                      <p className="text-xs text-green-700 mt-1">{avail.startTime}</p>
                      <p className="text-xs text-green-700">{avail.endTime}</p>
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-1 text-gray-400">
                      <X className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Edit Times Button */}
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={() => openEditDialog(1)}>
              Modifier les horaires détaillés
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* All Staff Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Vue d'ensemble
          </CardTitle>
          <CardDescription>Disponibilités de tous les employés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Employé</th>
                  {DAYS.map(day => (
                    <th key={day.value} className="text-center py-2 px-2 font-medium text-xs">
                      {day.short}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STAFF_LIST.map(staff => {
                  const staffAvail = DAYS.map(day => 
                    availability.find(a => a.staffId === staff.id && a.dayOfWeek === day.value)
                  );
                  return (
                    <tr key={staff.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <p className="text-xs text-muted-foreground">{staff.role}</p>
                        </div>
                      </td>
                      {staffAvail.map((avail, idx) => (
                        <td key={idx} className="text-center py-2 px-2">
                          {avail?.isAvailable ? (
                            <div className="w-6 h-6 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                              <X className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier les horaires</DialogTitle>
            <DialogDescription>
              Définissez les horaires de travail pour chaque jour
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {DAYS.map(day => {
              const avail = availability.find(a => a.staffId === selectedStaffId && a.dayOfWeek === day.value);
              const isAvailable = avail?.isAvailable ?? false;
              const startTime = avail?.startTime || '08:00';
              const endTime = avail?.endTime || '17:00';
              
              return (
                <div key={day.value} className="flex items-center gap-4">
                  <div className="w-24">
                    <span className="text-sm font-medium">{day.label}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="checkbox"
                      checked={isAvailable}
                      onChange={() => toggleAvailability(day.value)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    {isAvailable && (
                      <>
                        <Input
                          type="time"
                          value={startTime}
                          onChange={(e) => {
                            const existing = availability.find(a => a.staffId === selectedStaffId && a.dayOfWeek === day.value);
                            if (existing) {
                              setAvailability(availability.map(a => 
                                a.id === existing.id 
                                  ? { ...a, startTime: e.target.value }
                                  : a
                              ));
                            }
                          }}
                          className="w-28"
                        />
                        <span className="text-muted-foreground">à</span>
                        <Input
                          type="time"
                          value={endTime}
                          onChange={(e) => {
                            const existing = availability.find(a => a.staffId === selectedStaffId && a.dayOfWeek === day.value);
                            if (existing) {
                              setAvailability(availability.map(a => 
                                a.id === existing.id 
                                  ? { ...a, endTime: e.target.value }
                                  : a
                              ));
                            }
                          }}
                          className="w-28"
                        />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={saveEdit}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AvailabilityManager;
