'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Clock, 
  Percent, 
  Users,
  CreditCard,
  Calendar,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

interface TipsSettingsProps {
  onSave?: (settings: TipsSettingsData) => void;
  loading?: boolean;
}

interface TipsSettingsData {
  distributionMethod: 'hours' | 'role' | 'equal' | 'custom';
  rolePercentages: {
    waiter: number;
    kitchen: number;
    delivery: number;
    other: number;
  };
  payoutSchedule: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  payoutDay: number;
  includeInPayroll: boolean;
  autoDistribute: boolean;
  minimumTipAmount: number;
  cashTipsOnly: boolean;
}

const PAYOUT_SCHEDULE_OPTIONS = [
  { value: 'daily', label: 'Quotidien' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'biweekly', label: 'Bi-mensuel' },
  { value: 'monthly', label: 'Mensuel' },
];

const PAYOUT_DAY_OPTIONS = [
  { value: '1', label: 'Lundi' },
  { value: '2', label: 'Mardi' },
  { value: '3', label: 'Mercredi' },
  { value: '4', label: 'Jeudi' },
  { value: '5', label: 'Vendredi' },
  { value: '6', label: 'Samedi' },
  { value: '0', label: 'Dimanche' },
];

export function TipsSettings({ onSave, loading }: TipsSettingsProps) {
  const [settings, setSettings] = useState<TipsSettingsData>({
    distributionMethod: 'hours',
    rolePercentages: {
      waiter: 50,
      kitchen: 25,
      delivery: 20,
      other: 5
    },
    payoutSchedule: 'weekly',
    payoutDay: 5, // Friday
    includeInPayroll: true,
    autoDistribute: false,
    minimumTipAmount: 1000,
    cashTipsOnly: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSave?.(settings);
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const totalPercentage = Object.values(settings.rolePercentages).reduce((sum, v) => sum + v, 0);
  const isValidPercentage = totalPercentage === 100;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Paramètres sauvegardés</AlertTitle>
          <AlertDescription className="text-green-700">
            Les modifications ont été enregistrées avec succès.
          </AlertDescription>
        </Alert>
      )}

      {/* Distribution Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Méthode de Distribution
          </CardTitle>
          <CardDescription>
            Définissez comment les pourboires sont répartis entre les employés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            value={settings.distributionMethod} 
            onValueChange={(v) => setSettings({...settings, distributionMethod: v as TipsSettingsData['distributionMethod']})}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="hours">
                <Clock className="h-4 w-4 mr-2" />
                Heures
              </TabsTrigger>
              <TabsTrigger value="role">
                <Users className="h-4 w-4 mr-2" />
                Rôle
              </TabsTrigger>
              <TabsTrigger value="equal">
                <Percent className="h-4 w-4 mr-2" />
                Égal
              </TabsTrigger>
              <TabsTrigger value="custom">
                <Settings className="h-4 w-4 mr-2" />
                Personnalisé
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hours" className="mt-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Les pourboires seront distribués proportionnellement aux heures travaillées par chaque employé.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="role" className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Définissez le pourcentage attribué à chaque rôle:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Serveurs</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={settings.rolePercentages.waiter}
                      onChange={(e) => setSettings({
                        ...settings,
                        rolePercentages: {
                          ...settings.rolePercentages,
                          waiter: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
                <div>
                  <Label>Cuisine</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={settings.rolePercentages.kitchen}
                      onChange={(e) => setSettings({
                        ...settings,
                        rolePercentages: {
                          ...settings.rolePercentages,
                          kitchen: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
                <div>
                  <Label>Livraison</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={settings.rolePercentages.delivery}
                      onChange={(e) => setSettings({
                        ...settings,
                        rolePercentages: {
                          ...settings.rolePercentages,
                          delivery: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
                <div>
                  <Label>Autres</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={settings.rolePercentages.other}
                      onChange={(e) => setSettings({
                        ...settings,
                        rolePercentages: {
                          ...settings.rolePercentages,
                          other: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isValidPercentage ? 'default' : 'destructive'}>
                  Total: {totalPercentage}%
                </Badge>
                {!isValidPercentage && (
                  <span className="text-sm text-red-600">Le total doit être égal à 100%</span>
                )}
              </div>
            </TabsContent>

            <TabsContent value="equal" className="mt-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Les pourboires seront répartis équitablement entre tous les employés éligibles.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="custom" className="mt-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Les montants seront définis manuellement lors de chaque distribution.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payout Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendrier de Paiement
          </CardTitle>
          <CardDescription>
            Configurez la fréquence et le jour de paiement des pourboires
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Fréquence de paiement</Label>
              <Select
                value={settings.payoutSchedule}
                onValueChange={(v) => setSettings({...settings, payoutSchedule: v as TipsSettingsData['payoutSchedule']})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYOUT_SCHEDULE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Jour de paiement</Label>
              <Select
                value={settings.payoutDay.toString()}
                onValueChange={(v) => setSettings({...settings, payoutDay: parseInt(v)})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYOUT_DAY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Intégration Paie
          </CardTitle>
          <CardDescription>
            Options d&apos;intégration avec le système de paie
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Inclure dans la paie</Label>
              <p className="text-sm text-muted-foreground">
                Les pourboires seront automatiquement ajoutés aux fiches de paie
              </p>
            </div>
            <Switch
              checked={settings.includeInPayroll}
              onCheckedChange={(checked) => setSettings({...settings, includeInPayroll: checked})}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Distribution automatique</Label>
              <p className="text-sm text-muted-foreground">
                Distribuer automatiquement les pourboires selon le calendrier
              </p>
            </div>
            <Switch
              checked={settings.autoDistribute}
              onCheckedChange={(checked) => setSettings({...settings, autoDistribute: checked})}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Pourboires en espèces uniquement</Label>
              <p className="text-sm text-muted-foreground">
                Ne prendre en compte que les pourboires en espèces
              </p>
            </div>
            <Switch
              checked={settings.cashTipsOnly}
              onCheckedChange={(checked) => setSettings({...settings, cashTipsOnly: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Minimum Amount */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres Généraux
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Montant minimum de pourboire</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Montant minimum pour qu&apos;un pourboire soit enregistré
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={settings.minimumTipAmount}
                onChange={(e) => setSettings({...settings, minimumTipAmount: parseInt(e.target.value) || 0})}
                className="w-40"
              />
              <span className="text-muted-foreground">GNF</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
        <Button onClick={handleSave} disabled={isSaving || !isValidPercentage}>
          {isSaving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Sauvegarder
        </Button>
      </div>
    </div>
  );
}

export default TipsSettings;
