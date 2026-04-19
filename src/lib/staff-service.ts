// ============================================
// Feature 2: Staff Management Service
// ============================================

import { db } from '@/lib/db';

// Types
export interface StaffMember {
  id: string;
  organizationId: string;
  restaurantId: string | null;
  userId: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  avatar: string | null;
  role: string;
  hourlyRate: number | null;
  salary: number | null;
  hireDate: Date | null;
  isActive: boolean;
  permissions: string | null;
  ordersHandled: number;
  tablesServed: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Shift {
  id: string;
  restaurantId: string;
  staffId: string;
  date: Date;
  startTime: string;
  endTime: string;
  breakStart: string | null;
  breakEnd: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
}

export interface TimeEntry {
  id: string;
  staffId: string;
  shiftId: string | null;
  clockIn: Date;
  clockOut: Date | null;
  locationIn: string | null;
  locationOut: string | null;
  notes: string | null;
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  type: string;
  startDate: Date;
  endDate: Date;
  reason: string | null;
  status: string;
  approvedBy: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
}

// Role labels
const ROLE_LABELS: Record<string, string> = {
  manager: 'Manager',
  chef: 'Chef Cuisinier',
  cook: 'Cuisinier',
  waiter: 'Serveur',
  cashier: 'Caissier',
  delivery_driver: 'Livreur',
  kitchen_assistant: 'Assistant Cuisine',
  host: 'Hôte',
  bartender: 'Barman',
  cleaner: 'Agent d\'entretien',
};

// Service class
export class StaffService {
  // Get all staff members
  static async getStaff(organizationId: string): Promise<any[]> {

    try {
      const staff = await db.staffProfile.findMany({
        where: { organizationId },
        orderBy: [{ isActive: 'desc' }, { firstName: 'asc' }],
      });

      return staff.map(s => ({
        ...s,
        roleLabel: ROLE_LABELS[s.role] || s.role,
      }));
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur récupération staff');
    }
  }

  // Get shifts
  static async getShifts(restaurantId: string, date?: Date): Promise<any[]> {

    try {
      const shifts = await db.shift.findMany({
        where: {
          restaurantId,
          date: date || new Date(),
        },
        include: { staff: true },
      });

      return shifts.map(s => ({
        ...s,
        staffName: `${s.staff.firstName} ${s.staff.lastName}`,
      }));
    } catch (error) {
      console.error('Error fetching shifts:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur récupération shifts');
    }
  }

  // Get time entries
  static async getTimeEntries(organizationId: string): Promise<any[]> {

    try {
      const entries = await db.timeEntry.findMany({
        where: {
          staff: { organizationId },
          clockOut: null,
        },
        include: { staff: true },
        orderBy: { clockIn: 'desc' },
      });

      return entries.map(e => ({
        ...e,
        staffName: `${e.staff.firstName} ${e.staff.lastName}`,
        status: e.clockOut ? 'clocked_out' : 'clocked_in',
      }));
    } catch (error) {
      console.error('Error fetching time entries:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur récupération time entries');
    }
  }

  // Get leave requests
  static async getLeaveRequests(organizationId: string): Promise<any[]> {

    try {
      const requests = await db.leaveRequest.findMany({
        where: {
          staff: { organizationId },
        },
        include: { staff: true },
        orderBy: { createdAt: 'desc' },
      });

      return requests.map(r => ({
        ...r,
        staffName: `${r.staff.firstName} ${r.staff.lastName}`,
      }));
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur récupération congés');
    }
  }

  // Clock in
  static async clockIn(staffId: string, location?: string): Promise<any> {
    try {
      const entry = await db.timeEntry.create({
        data: {
          staffId,
          clockIn: new Date(),
          locationIn: location,
        },
      });
      return { success: true, entry };
    } catch (error) {
      console.error('Error clocking in:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur clock in');
    }
  }

  // Clock out
  static async clockOut(staffId: string, location?: string): Promise<any> {
    try {
      const activeEntry = await db.timeEntry.findFirst({
        where: { staffId, clockOut: null },
        orderBy: { clockIn: 'desc' },
      });

      if (!activeEntry) {
        throw new Error('No active time entry found');
      }

      const entry = await db.timeEntry.update({
        where: { id: activeEntry.id },
        data: {
          clockOut: new Date(),
          locationOut: location,
        },
      });

      return { success: true, entry };
    } catch (error) {
      console.error('Error clocking out:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur clock out');
    }
  }

  // Create leave request
  static async createLeaveRequest(
    staffId: string,
    type: string,
    startDate: Date,
    endDate: Date,
    reason?: string
  ): Promise<any> {
    try {
      const request = await db.leaveRequest.create({
        data: {
          staffId,
          type,
          startDate,
          endDate,
          reason,
          status: 'pending',
        },
      });
      return { success: true, request };
    } catch (error) {
      console.error('Error creating leave request:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur création congé');
    }
  }

  // Get staff statistics
  static async getStaffStats(organizationId: string): Promise<any> {
    const staff = await this.getStaff(organizationId);
    const timeEntries = await this.getTimeEntries(organizationId);

    return {
      totalStaff: staff.length,
      activeStaff: staff.filter(s => s.isActive).length,
      currentlyWorking: timeEntries.filter(e => e.status === 'clocked_in').length,
      onLeave: 0,
      byRole: staff.reduce((acc, s) => {
        acc[s.role] = (acc[s.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export default StaffService;