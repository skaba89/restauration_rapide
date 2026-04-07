'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  FileText, 
  Calendar, 
  Clock, 
  DollarSign, 
  AlertCircle, 
  HeartPulse, 
  CalendarDays,
  CalendarCheck
} from 'lucide-react';
import StaffManager from '@/components/staff/staff-manager';
import ScheduleCalendar from '@/components/staff/schedule-calendar';
import TimeClock from '@/components/staff/time-clock';
import PayrollSummary from '@/components/staff/payroll-summary';
import ContractsManager from '@/components/staff/contracts-manager';
import AbsencesManager from '@/components/staff/absences-manager';
import AvailabilityManager from '@/components/staff/availability-manager';
import WorkStoppagesManager from '@/components/staff/work-stoppages-manager';
import LeaveBalancesManager from '@/components/staff/leave-balances-manager';

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState('personnel');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-orange-600" />
            Gestion du Personnel
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez votre équipe, les contrats, les plannings, les absences et la paie
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">KFM DELICE</span>
          <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded">Restaurant</span>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex w-max min-w-full grid-cols-9 gap-1">
            <TabsTrigger value="personnel" className="gap-2 min-w-[100px]">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Personnel</span>
            </TabsTrigger>
            <TabsTrigger value="contracts" className="gap-2 min-w-[100px]">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Contrats</span>
            </TabsTrigger>
            <TabsTrigger value="plannings" className="gap-2 min-w-[100px]">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Plannings</span>
            </TabsTrigger>
            <TabsTrigger value="availability" className="gap-2 min-w-[100px]">
              <CalendarCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Disponibilités</span>
            </TabsTrigger>
            <TabsTrigger value="absences" className="gap-2 min-w-[100px]">
              <AlertCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Absences</span>
            </TabsTrigger>
            <TabsTrigger value="leaves" className="gap-2 min-w-[100px]">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Congés</span>
            </TabsTrigger>
            <TabsTrigger value="stoppages" className="gap-2 min-w-[100px]">
              <HeartPulse className="h-4 w-4" />
              <span className="hidden sm:inline">Arrêts</span>
            </TabsTrigger>
            <TabsTrigger value="pointage" className="gap-2 min-w-[100px]">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Pointage</span>
            </TabsTrigger>
            <TabsTrigger value="paie" className="gap-2 min-w-[100px]">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Paie</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="personnel" className="space-y-6">
          <StaffManager />
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <ContractsManager />
        </TabsContent>

        <TabsContent value="plannings" className="space-y-6">
          <ScheduleCalendar />
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <AvailabilityManager />
        </TabsContent>

        <TabsContent value="absences" className="space-y-6">
          <AbsencesManager />
        </TabsContent>

        <TabsContent value="leaves" className="space-y-6">
          <LeaveBalancesManager />
        </TabsContent>

        <TabsContent value="stoppages" className="space-y-6">
          <WorkStoppagesManager />
        </TabsContent>

        <TabsContent value="pointage" className="space-y-6">
          <TimeClock />
        </TabsContent>

        <TabsContent value="paie" className="space-y-6">
          <PayrollSummary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
