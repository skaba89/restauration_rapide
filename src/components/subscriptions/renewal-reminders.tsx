'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Bell, CheckCircle, Clock, RefreshCcw, X } from 'lucide-react';
import { toast } from 'sonner';

interface RenewalReminder {
  id: string;
  subscriptionId: string;
  customerName: string;
  planName: string;
  renewalDate: string;
  daysUntilRenewal: number;
  amount: number;
  autoRenew: boolean;
  status: 'expiring_soon' | 'payment_due' | 'auto_renew';
}

interface RenewalRemindersProps {
  onSendReminder?: (subscriptionId: string) => void;
  onViewSubscription?: (subscriptionId: string) => void;
}

export function RenewalReminders({ onSendReminder, onViewSubscription }: RenewalRemindersProps) {
  const [reminders, setReminders] = useState<RenewalReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    // Simulate fetching renewal reminders
    const fetchReminders = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from the API
        // For demo, we'll generate some sample reminders
        const today = new Date();
        const demoReminders: RenewalReminder[] = [
          {
            id: 'rem-1',
            subscriptionId: 'SUB-002',
            customerName: 'Diallo Fatou',
            planName: 'Déjeuner Express',
            renewalDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            daysUntilRenewal: 3,
            amount: 150000,
            autoRenew: true,
            status: 'auto_renew'
          },
          {
            id: 'rem-2',
            subscriptionId: 'SUB-004',
            customerName: 'Sy Savane',
            planName: 'Formule Complète',
            renewalDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            daysUntilRenewal: 7,
            amount: 280000,
            autoRenew: false,
            status: 'expiring_soon'
          },
          {
            id: 'rem-3',
            subscriptionId: 'SUB-001',
            customerName: 'Koné Ibrahim',
            planName: 'Formule Complète',
            renewalDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            daysUntilRenewal: 15,
            amount: 280000,
            autoRenew: true,
            status: 'auto_renew'
          }
        ];
        
        setReminders(demoReminders);
      } catch (error) {
        console.error('Failed to fetch reminders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReminders();
  }, []);

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-FR')} GNF`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusConfig = (reminder: RenewalReminder) => {
    if (reminder.daysUntilRenewal <= 3) {
      return {
        label: 'Urgent',
        color: 'bg-red-100 text-red-700 border-red-300',
        bgColor: 'bg-red-50',
        icon: AlertTriangle
      };
    }
    if (reminder.daysUntilRenewal <= 7) {
      return {
        label: 'Bientôt',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        bgColor: 'bg-yellow-50',
        icon: Clock
      };
    }
    return {
      label: reminder.autoRenew ? 'Auto' : 'Planifié',
      color: 'bg-green-100 text-green-700 border-green-300',
      bgColor: 'bg-green-50',
      icon: reminder.autoRenew ? RefreshCcw : CheckCircle
    };
  };

  const handleSendReminder = (reminder: RenewalReminder) => {
    if (onSendReminder) {
      onSendReminder(reminder.subscriptionId);
    }
    toast.success(`Rappel envoyé à ${reminder.customerName}`);
  };

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
    toast.success('Rappel ignoré');
  };

  const visibleReminders = reminders.filter(r => !dismissedIds.includes(r.id));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Rappels de renouvellement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCcw className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Rappels de renouvellement
            </CardTitle>
            <CardDescription>
              {visibleReminders.length} abonnement(s) à renouveler prochainement
            </CardDescription>
          </div>
          {visibleReminders.length > 0 && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              {visibleReminders.length} en attente
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {visibleReminders.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
            <p className="text-muted-foreground">Aucun rappel en attente</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {visibleReminders
                .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal)
                .map((reminder) => {
                  const config = getStatusConfig(reminder);
                  const Icon = config.icon;
                  
                  return (
                    <div
                      key={reminder.id}
                      className={`p-4 rounded-lg border ${config.bgColor} border-opacity-50`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${config.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{reminder.customerName}</p>
                            <p className="text-sm text-muted-foreground">
                              {reminder.planName} • {formatCurrency(reminder.amount)}/mois
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={config.color}>
                                {config.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Dans {reminder.daysUntilRenewal} jour{reminder.daysUntilRenewal > 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (onViewSubscription) {
                                onViewSubscription(reminder.subscriptionId);
                              }
                            }}
                          >
                            Voir
                          </Button>
                          {!reminder.autoRenew && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendReminder(reminder)}
                            >
                              <Bell className="h-3 w-3 mr-1" />
                              Rappeler
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => handleDismiss(reminder.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-opacity-50">
                        <p className="text-xs text-muted-foreground">
                          Date de renouvellement: {formatDate(reminder.renewalDate)}
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
  );
}

export default RenewalReminders;
