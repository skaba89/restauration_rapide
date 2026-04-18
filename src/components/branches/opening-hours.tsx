'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Clock,
  Save,
  Loader2,
  Sun,
  Moon,
  Coffee,
  Utensils,
} from 'lucide-react';

interface BranchHour {
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
  breakStart?: string | null;
  breakEnd?: string | null;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dimanche', short: 'Dim' },
  { value: 1, label: 'Lundi', short: 'Lun' },
  { value: 2, label: 'Mardi', short: 'Mar' },
  { value: 3, label: 'Mercredi', short: 'Mer' },
  { value: 4, label: 'Jeudi', short: 'Jeu' },
  { value: 5, label: 'Vendredi', short: 'Ven' },
  { value: 6, label: 'Samedi', short: 'Sam' },
];

interface OpeningHoursManagerProps {
  branchId: string;
  initialHours?: BranchHour[];
  onUpdate?: (hours: BranchHour[]) => void;
}

export function OpeningHoursManager({ branchId, initialHours, onUpdate }: OpeningHoursManagerProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hours, setHours] = useState<BranchHour[]>(() => {
    if (initialHours && initialHours.length > 0) {
      return initialHours;
    }
    // Default hours
    return DAYS_OF_WEEK.map((day) => ({
      dayOfWeek: day.value,
      openTime: day.value === 0 ? '10:00' : '08:00',
      closeTime: day.value === 0 ? '20:00' : '22:00',
      isClosed: false,
    }));
  });

  useEffect(() => {
    if (initialHours && initialHours.length > 0) {
      setHours(initialHours);
    }
  }, [initialHours]);

  const getDayHours = (dayOfWeek: number): BranchHour => {
    return hours.find(h => h.dayOfWeek === dayOfWeek) || {
      dayOfWeek,
      openTime: '08:00',
      closeTime: '22:00',
      isClosed: false,
    };
  };

  const updateDayHours = (dayOfWeek: number, updates: Partial<BranchHour>) => {
    setHours(prev => {
      const updated = prev.map(h => 
        h.dayOfWeek === dayOfWeek ? { ...h, ...updates } : h
      );
      
      // Add if doesn't exist
      if (!prev.find(h => h.dayOfWeek === dayOfWeek)) {
        updated.push({
          dayOfWeek,
          openTime: '08:00',
          closeTime: '22:00',
          isClosed: false,
          ...updates,
        });
      }
      
      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/branches/${branchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Horaires enregistrés',
          description: 'Les horaires d\'ouverture ont été mis à jour avec succès',
        });
        onUpdate?.(hours);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer les horaires',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const setAllWeekdays = (open: string, close: string) => {
    setHours(prev => prev.map(h => {
      if (h.dayOfWeek >= 1 && h.dayOfWeek <= 5) {
        return { ...h, openTime: open, closeTime: close, isClosed: false };
      }
      return h;
    }));
  };

  const setAllWeekend = (open: string, close: string) => {
    setHours(prev => prev.map(h => {
      if (h.dayOfWeek === 0 || h.dayOfWeek === 6) {
        return { ...h, openTime: open, closeTime: close, isClosed: false };
      }
      return h;
    }));
  };

  const copyMondayToAll = () => {
    const mondayHours = getDayHours(1);
    setHours(prev => prev.map(h => ({
      ...h,
      openTime: mondayHours.openTime,
      closeTime: mondayHours.closeTime,
      isClosed: mondayHours.isClosed,
    })));
    toast({
      title: 'Copié',
      description: 'Les horaires du lundi ont été appliqués à tous les jours',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Horaires d'ouverture
            </CardTitle>
            <CardDescription>
              Configurez les horaires d'ouverture de cette succursale
            </CardDescription>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="gap-2 bg-gradient-to-r from-orange-500 to-red-600"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Enregistrer
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setAllWeekdays('08:00', '22:00')}>
            Semaine: 8h-22h
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAllWeekend('10:00', '22:00')}>
            Weekend: 10h-22h
          </Button>
          <Button variant="outline" size="sm" onClick={copyMondayToAll}>
            Copier lundi partout
          </Button>
        </div>

        <Separator />

        {/* Hours by day */}
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => {
            const dayHours = getDayHours(day.value);
            const isWeekend = day.value === 0 || day.value === 6;

            return (
              <div 
                key={day.value}
                className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border ${
                  isWeekend ? 'bg-orange-50/50 dark:bg-orange-950/10' : ''
                } ${dayHours.isClosed ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between sm:w-32">
                  <div className="flex items-center gap-2">
                    {isWeekend ? (
                      <Sun className="h-4 w-4 text-orange-500" />
                    ) : (
                      <Moon className="h-4 w-4 text-slate-500" />
                    )}
                    <span className="font-medium">{day.label}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-1">
                  <Switch
                    checked={!dayHours.isClosed}
                    onCheckedChange={(checked) => 
                      updateDayHours(day.value, { isClosed: !checked })
                    }
                  />

                  {!dayHours.isClosed ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground">De</Label>
                        <Input
                          type="time"
                          value={dayHours.openTime || '08:00'}
                          onChange={(e) => updateDayHours(day.value, { openTime: e.target.value })}
                          className="w-28"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground">À</Label>
                        <Input
                          type="time"
                          value={dayHours.closeTime || '22:00'}
                          onChange={(e) => updateDayHours(day.value, { closeTime: e.target.value })}
                          className="w-28"
                        />
                      </div>

                      {/* Break time (optional) */}
                      <div className="hidden md:flex items-center gap-2">
                        <Coffee className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          value={dayHours.breakStart || ''}
                          onChange={(e) => updateDayHours(day.value, { breakStart: e.target.value })}
                          placeholder="Pause"
                          className="w-24"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="time"
                          value={dayHours.breakEnd || ''}
                          onChange={(e) => updateDayHours(day.value, { breakEnd: e.target.value })}
                          className="w-24"
                        />
                      </div>
                    </>
                  ) : (
                    <Badge variant="destructive">Fermé</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <Utensils className="h-5 w-5 mx-auto text-green-600 mb-1" />
            <p className="text-sm text-muted-foreground">Jours ouverts</p>
            <p className="font-bold text-green-600">
              {hours.filter(h => !h.isClosed).length} / 7
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <Clock className="h-5 w-5 mx-auto text-blue-600 mb-1" />
            <p className="text-sm text-muted-foreground">Ouverture moyenne</p>
            <p className="font-bold text-blue-600">
              {hours.filter(h => !h.isClosed && h.openTime)[0]?.openTime || '08:00'}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <Moon className="h-5 w-5 mx-auto text-purple-600 mb-1" />
            <p className="text-sm text-muted-foreground">Fermeture moyenne</p>
            <p className="font-bold text-purple-600">
              {hours.filter(h => !h.isClosed && h.closeTime)[0]?.closeTime || '22:00'}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <Sun className="h-5 w-5 mx-auto text-amber-600 mb-1" />
            <p className="text-sm text-muted-foreground">Heures/semaine</p>
            <p className="font-bold text-amber-600">
              {(() => {
                let total = 0;
                hours.forEach(h => {
                  if (!h.isClosed && h.openTime && h.closeTime) {
                    const open = parseInt(h.openTime.split(':')[0]);
                    const close = parseInt(h.closeTime.split(':')[0]);
                    total += close - open;
                  }
                });
                return `${total}h`;
              })()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default OpeningHoursManager;
