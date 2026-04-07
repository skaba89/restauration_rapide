'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  UtensilsCrossed,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface MealSchedule {
  id: string;
  subscriptionId: string;
  date: string;
  time: string;
  menuItemId?: string;
  menuItemName?: string;
  status: 'scheduled' | 'delivered' | 'skipped' | 'cancelled';
  notes?: string;
}

interface Subscription {
  id: string;
  customerName: string;
  planName: string;
  mealsPerDay: number;
  daysPerWeek: number;
  preferredTime: string;
}

interface MealSchedulingCalendarProps {
  subscriptionId?: string;
  subscription?: Subscription;
  onScheduleMeal?: (date: string, time: string, menuItemId?: string, notes?: string) => void;
  onMarkDelivered?: (scheduleId: string) => void;
  onSkipMeal?: (scheduleId: string, reason?: string) => void;
}

const DAYS_OF_WEEK = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export function MealSchedulingCalendar({
  subscriptionId,
  subscription,
  onScheduleMeal,
  onMarkDelivered,
  onSkipMeal
}: MealSchedulingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<MealSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<MealSchedule | null>(null);
  const [scheduleTime, setScheduleTime] = useState('12:00');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [skipReason, setSkipReason] = useState('');

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    
    // Previous month days
    for (let i = 0; i < startingDay; i++) {
      const prevDate = new Date(year, month, -startingDay + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);

  // Get status for a specific date
  const getStatusForDate = (date: Date): MealSchedule | null => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.find(s => s.date === dateStr) || null;
  };

  // Check if date is a delivery day based on subscription
  const isDeliveryDay = (date: Date): boolean => {
    if (!subscription) return true;
    const dayOfWeek = date.getDay();
    // Convert daysOfWeek JSON to array if needed
    // For demo, assume weekdays (1-5) for 5-day plan, all days for 7-day plan
    if (subscription.daysPerWeek === 5) {
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    }
    return true;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return; // Can't schedule past dates
    
    const dateStr = date.toISOString().split('T')[0];
    const existingSchedule = getStatusForDate(date);
    
    if (existingSchedule) {
      setSelectedSchedule(existingSchedule);
      setSelectedDate(dateStr);
    } else if (isDeliveryDay(date)) {
      setSelectedDate(dateStr);
      setScheduleTime(subscription?.preferredTime || '12:00');
      setShowScheduleDialog(true);
    }
  };

  const handleScheduleMeal = () => {
    if (!selectedDate) return;
    
    if (onScheduleMeal) {
      onScheduleMeal(selectedDate, scheduleTime, undefined, scheduleNotes);
    }
    
    // Add to local state
    const newSchedule: MealSchedule = {
      id: `sch-${Date.now()}`,
      subscriptionId: subscriptionId || 'demo',
      date: selectedDate,
      time: scheduleTime,
      status: 'scheduled',
      notes: scheduleNotes
    };
    setSchedules(prev => [...prev, newSchedule]);
    
    toast.success('Repas planifié');
    setShowScheduleDialog(false);
    setSelectedDate(null);
    setScheduleNotes('');
  };

  const handleSkipMeal = () => {
    if (!selectedSchedule) return;
    
    if (onSkipMeal) {
      onSkipMeal(selectedSchedule.id, skipReason);
    }
    
    setSchedules(prev =>
      prev.map(s =>
        s.id === selectedSchedule.id
          ? { ...s, status: 'skipped', notes: skipReason }
          : s
      )
    );
    
    toast.success('Repas annulé');
    setShowSkipDialog(false);
    setSelectedSchedule(null);
    setSkipReason('');
  };

  const handleMarkDelivered = (schedule: MealSchedule) => {
    if (onMarkDelivered) {
      onMarkDelivered(schedule.id);
    }
    
    setSchedules(prev =>
      prev.map(s =>
        s.id === schedule.id
          ? { ...s, status: 'delivered' }
          : s
      )
    );
    
    toast.success('Repas marqué comme livré');
  };

  // Render status indicator
  const renderStatusIndicator = (schedule: MealSchedule) => {
    switch (schedule.status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'skipped':
        return <XCircle className="h-4 w-4 text-orange-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendrier des repas
        </CardTitle>
        <CardDescription>
          Planifiez et suivez les livraisons de repas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {days.map(({ date, isCurrentMonth }, index) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isToday = date.toDateString() === today.toDateString();
            const isPast = date < today;
            const schedule = getStatusForDate(date);
            const isDelivery = isDeliveryDay(date);
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`
                  relative min-h-[60px] p-1 rounded-lg border text-sm
                  ${isCurrentMonth ? 'bg-background' : 'bg-muted/50'}
                  ${isToday ? 'border-orange-500 border-2' : 'border-border'}
                  ${isPast ? 'opacity-50' : ''}
                  ${!isPast && isCurrentMonth && isDelivery ? 'cursor-pointer hover:bg-muted' : ''}
                  transition-colors
                `}
              >
                <span className={`
                  ${isToday ? 'font-bold text-orange-500' : ''}
                  ${!isCurrentMonth ? 'text-muted-foreground' : ''}
                `}>
                  {date.getDate()}
                </span>
                
                {schedule && (
                  <div className="mt-1 flex items-center gap-1">
                    {renderStatusIndicator(schedule)}
                    <span className="text-[10px] truncate">
                      {schedule.time}
                    </span>
                  </div>
                )}
                
                {isDelivery && !isPast && isCurrentMonth && !schedule && (
                  <div className="absolute bottom-1 right-1">
                    <Plus className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-blue-500" />
            <span>Planifié</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Livré</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="h-3 w-3 text-orange-500" />
            <span>Annulé</span>
          </div>
        </div>

        {/* Schedule Dialog */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Planifier un repas</DialogTitle>
              <DialogDescription>
                {subscription?.customerName} - {selectedDate}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Heure de livraison</Label>
                <Input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes (optionnel)</Label>
                <Textarea
                  placeholder="Instructions spéciales..."
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleScheduleMeal}>
                Planifier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Skip Dialog */}
        <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Annuler le repas</DialogTitle>
              <DialogDescription>
                Annuler la livraison du {selectedSchedule?.date}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Raison (optionnel)</Label>
                <Textarea
                  placeholder="Raison de l'annulation..."
                  value={skipReason}
                  onChange={(e) => setSkipReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSkipDialog(false)}>
                Retour
              </Button>
              <Button variant="destructive" onClick={handleSkipMeal}>
                Annuler le repas
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default MealSchedulingCalendar;
