'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Thermometer, 
  SprayCan, 
  CalendarDays, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { ComplianceChecklist } from '@/components/compliance/compliance-checklist';
import { TemperatureLogs } from '@/components/compliance/temperature-logs';
import { CleaningSchedule } from '@/components/compliance/cleaning-schedule';
import { InspectionCalendar } from '@/components/compliance/inspection-calendar';

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState('checklists');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-orange-500" />
            Conformité Alimentaire
          </h1>
          <p className="text-muted-foreground">
            Gérez la sécurité alimentaire et la conformité réglementaire
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950/20 text-green-700 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Système actif
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Checklists</p>
                <p className="text-xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Thermometer className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Températures</p>
                <p className="text-xl font-bold">5 équipements</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <SprayCan className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nettoyages</p>
                <p className="text-xl font-bold">6 tâches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <CalendarDays className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inspections</p>
                <p className="text-xl font-bold">2 prévues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="checklists" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Checklists</span>
          </TabsTrigger>
          <TabsTrigger value="temperatures" className="flex items-center gap-2">
            <Thermometer className="h-4 w-4" />
            <span className="hidden sm:inline">Températures</span>
          </TabsTrigger>
          <TabsTrigger value="cleaning" className="flex items-center gap-2">
            <SprayCan className="h-4 w-4" />
            <span className="hidden sm:inline">Nettoyage</span>
          </TabsTrigger>
          <TabsTrigger value="inspections" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Inspections</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checklists">
          <ComplianceChecklist />
        </TabsContent>

        <TabsContent value="temperatures">
          <TemperatureLogs />
        </TabsContent>

        <TabsContent value="cleaning">
          <CleaningSchedule />
        </TabsContent>

        <TabsContent value="inspections">
          <InspectionCalendar />
        </TabsContent>
      </Tabs>

      {/* Alert Banner */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Rappel Important
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Les relevés de température doivent être effectués au minimum deux fois par jour (ouverture et fermeture). 
                Les checklists d'hygiène sont obligatoires conformément aux normes HACCP.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
