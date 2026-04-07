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

// Demo data
const DEMO_STAFF = [
  { id: '1', firstName: 'Amadou', lastName: 'Touré', phone: '+224 62 123 45 67', email: 'amadou@kfmdelice.com', role: 'manager', hourlyRate: 15000, salary: 5000000, hireDate: new Date('2022-01-15'), isActive: true, ordersHandled: 1250, tablesServed: 0, rating: 4.8 },
  { id: '2', firstName: 'Fatou', lastName: 'Diallo', phone: '+224 62 234 56 78', email: 'fatou@kfmdelice.com', role: 'chef', hourlyRate: 12000, salary: 4000000, hireDate: new Date('2022-03-01'), isActive: true, ordersHandled: 0, tablesServed: 0, rating: 4.9 },
  { id: '3', firstName: 'Ibrahim', lastName: 'Koné', phone: '+224 62 345 67 89', email: 'ibrahim@kfmdelice.com', role: 'cook', hourlyRate: 8000, salary: 2500000, hireDate: new Date('2023-01-10'), isActive: true, ordersHandled: 0, tablesServed: 0, rating: 4.5 },
  { id: '4', firstName: 'Aïssata', lastName: 'Traoré', phone: '+224 62 456 78 90', email: 'aissata@kfmdelice.com', role: 'waiter', hourlyRate: 5000, salary: 1500000, hireDate: new Date('2023-06-15'), isActive: true, ordersHandled: 485, tablesServed: 320, rating: 4.7 },
  { id: '5', firstName: 'Moussa', lastName: 'Bamba', phone: '+224 62 567 89 01', email: 'moussa@kfmdelice.com', role: 'waiter', hourlyRate: 5000, salary: 1500000, hireDate: new Date('2023-09-01'), isActive: true, ordersHandled: 320, tablesServed: 280, rating: 4.6 },
  { id: '6', firstName: 'Mariama', lastName: 'Sy', phone: '+224 62 678 90 12', email: 'mariama@kfmdelice.com', role: 'cashier', hourlyRate: 6000, salary: 1800000, hireDate: new Date('2023-04-20'), isActive: true, ordersHandled: 890, tablesServed: 0, rating: 4.8 },
  { id: '7', firstName: 'Seydou', lastName: 'Kouyaté', phone: '+224 62 789 01 23', email: 'seydou@kfmdelice.com', role: 'delivery_driver', hourlyRate: 5000, salary: 1200000, hireDate: new Date('2024-01-05'), isActive: true, ordersHandled: 156, tablesServed: 0, rating: 4.4 },
  { id: '8', firstName: 'Fatoumata', lastName: 'Sylla', phone: '+224 62 890 12 34', email: 'fatoumata@kfmdelice.com', role: 'kitchen_assistant', hourlyRate: 4000, salary: 1000000, hireDate: new Date('2024-02-01'), isActive: false, ordersHandled: 0, tablesServed: 0, rating: 0 },
];

const DEMO_SHIFTS = [
  { id: '1', staffId: '4', staffName: 'Aïssata Traoré', date: new Date(), startTime: '08:00', endTime: '16:00', status: 'in_progress' },
  { id: '2', staffId: '5', staffName: 'Moussa Bamba', date: new Date(), startTime: '12:00', endTime: '20:00', status: 'scheduled' },
  { id: '3', staffId: '6', staffName: 'Mariama Sy', date: new Date(), startTime: '08:00', endTime: '16:00', status: 'completed' },
  { id: '4', staffId: '7', staffName: 'Seydou Kouyaté', date: new Date(), startTime: '10:00', endTime: '18:00', status: 'scheduled' },
];

const DEMO_TIME_ENTRIES = [
  { id: '1', staffId: '4', staffName: 'Aïssata Traoré', clockIn: new Date(Date.now() - 4 * 60 * 60 * 1000), clockOut: null, status: 'clocked_in' },
  { id: '2', staffId: '5', staffName: 'Moussa Bamba', clockIn: new Date(Date.now() - 2 * 60 * 60 * 1000), clockOut: null, status: 'clocked_in' },
  { id: '3', staffId: '6', staffName: 'Mariama Sy', clockIn: new Date(Date.now() - 8 * 60 * 60 * 1000), clockOut: new Date(Date.now() - 1 * 60 * 60 * 1000), status: 'clocked_out' },
];

const DEMO_LEAVE_REQUESTS = [
  { id: '1', staffId: '4', staffName: 'Aïssata Traoré', type: 'annual', startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), status: 'pending', reason: 'Vacances familiales' },
  { id: '2', staffId: '5', staffName: 'Moussa Bamba', type: 'sick', startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: 'approved', reason: 'Maladie' },
];

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
  static async getStaff(organizationId: string, demo: boolean = false): Promise<any[]> {
    if (demo || !organizationId) {
      return DEMO_STAFF.map(s => ({
        ...s,
        organizationId: 'demo',
        restaurantId: null,
        userId: null,
        avatar: null,
        permissions: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        roleLabel: ROLE_LABELS[s.role] || s.role,
      }));
    }

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
      return DEMO_STAFF;
    }
  }

  // Get shifts
  static async getShifts(restaurantId: string, date?: Date, demo: boolean = false): Promise<any[]> {
    if (demo || !restaurantId) {
      return DEMO_SHIFTS;
    }

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
      return DEMO_SHIFTS;
    }
  }

  // Get time entries
  static async getTimeEntries(organizationId: string, demo: boolean = false): Promise<any[]> {
    if (demo || !organizationId) {
      return DEMO_TIME_ENTRIES;
    }

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
      return DEMO_TIME_ENTRIES;
    }
  }

  // Get leave requests
  static async getLeaveRequests(organizationId: string, demo: boolean = false): Promise<any[]> {
    if (demo || !organizationId) {
      return DEMO_LEAVE_REQUESTS;
    }

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
      return DEMO_LEAVE_REQUESTS;
    }
  }

  // Clock in
  static async clockIn(staffId: string, location?: string, demo: boolean = false): Promise<any> {
    if (demo) {
      return { success: true, message: 'Clock in recorded (demo mode)' };
    }

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
      throw error;
    }
  }

  // Clock out
  static async clockOut(staffId: string, location?: string, demo: boolean = false): Promise<any> {
    if (demo) {
      return { success: true, message: 'Clock out recorded (demo mode)' };
    }

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
      throw error;
    }
  }

  // Create leave request
  static async createLeaveRequest(
    staffId: string,
    type: string,
    startDate: Date,
    endDate: Date,
    reason?: string,
    demo: boolean = false
  ): Promise<any> {
    if (demo) {
      return { success: true, message: 'Leave request created (demo mode)' };
    }

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
      throw error;
    }
  }

  // Get staff statistics
  static async getStaffStats(organizationId: string, demo: boolean = false): Promise<any> {
    const staff = await this.getStaff(organizationId, demo);
    const timeEntries = await this.getTimeEntries(organizationId, demo);

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
