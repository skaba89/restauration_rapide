// ============================================
// Restaurant OS - Employee Management Service
// Staff management, shifts, and payroll
// ============================================

import { logger } from '@/lib/logger';

// ============================================
// Employee Types
// ============================================

export type EmployeeRole = 
  | 'manager' 
  | 'chef' 
  | 'cook' 
  | 'waiter' 
  | 'bartender' 
  | 'cashier' 
  | 'host' 
  | 'delivery_driver' 
  | 'kitchen_assistant'
  | 'cleaner';

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern';

export type ShiftStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export type LeaveType = 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid' | 'other';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  employmentType: EmploymentType;
  hourlyRate: number;
  department: string;
  hireDate: Date;
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  avatar?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  skills: string[];
  maxHoursPerWeek: number;
  preferredShifts?: ('morning' | 'afternoon' | 'night')[];
  unavailableDays?: number[]; // 0-6 (Sunday-Saturday)
}

export interface Shift {
  id: string;
  restaurantId: string;
  employeeId: string;
  employeeName: string;
  role: EmployeeRole;
  date: Date;
  startTime: string; // HH:mm
  endTime: string;
  breakDuration: number; // minutes
  status: ShiftStatus;
  notes?: string;
  actualStartTime?: Date;
  actualEndTime?: Date;
  overtimeMinutes: number;
  createdAt: Date;
  createdBy: string;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  role: EmployeeRole;
  startTime: string;
  endTime: string;
  breakDuration: number;
  color: string;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  shiftId: string;
  clockIn: Date;
  clockOut?: Date;
  breakMinutes: number;
  totalMinutes: number;
  overtimeMinutes: number;
  notes?: string;
  approved: boolean;
  approvedBy?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  periodStart: Date;
  periodEnd: Date;
  regularHours: number;
  overtimeHours: number;
  hourlyRate: number;
  overtimeRate: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: 'draft' | 'pending' | 'approved' | 'paid';
  paidAt?: Date;
}

export interface ScheduleStats {
  totalShifts: number;
  filledShifts: number;
  openShifts: number;
  totalHours: number;
  employeesWorking: number;
  roles: Record<EmployeeRole, number>;
}

// ============================================
// Employee Service Class
// ============================================

class EmployeeService {
  private employees: Map<string, Employee> = new Map();
  private shifts: Shift[] = [];
  private timeEntries: TimeEntry[] = [];
  private leaveRequests: LeaveRequest[] = [];

  constructor() {
    this.initializeDemoData();
  }

  /**
   * Initialize demo data
   */
  private initializeDemoData(): void {
    const demoEmployees: Employee[] = [
      { id: '1', firstName: 'Amadou', lastName: 'Touré', email: 'amadou@restaurant.os', phone: '+225 07 00 00 01', role: 'manager', employmentType: 'full_time', hourlyRate: 5000, department: 'Management', hireDate: new Date('2022-01-15'), status: 'active', skills: ['leadership', 'inventory', 'reporting'], maxHoursPerWeek: 45 },
      { id: '2', firstName: 'Fatou', lastName: 'Diallo', email: 'fatou@restaurant.os', phone: '+225 07 00 00 02', role: 'chef', employmentType: 'full_time', hourlyRate: 4000, department: 'Cuisine', hireDate: new Date('2022-03-01'), status: 'active', skills: ['african_cuisine', 'french_cuisine', 'management'], maxHoursPerWeek: 50 },
      { id: '3', firstName: 'Ibrahim', lastName: 'Koné', email: 'ibrahim@restaurant.os', phone: '+225 07 00 00 03', role: 'cook', employmentType: 'full_time', hourlyRate: 2500, department: 'Cuisine', hireDate: new Date('2023-01-10'), status: 'active', skills: ['african_cuisine', 'grilling'], maxHoursPerWeek: 45 },
      { id: '4', firstName: 'Aya', lastName: 'Marie', email: 'aya@restaurant.os', phone: '+225 07 00 00 04', role: 'waiter', employmentType: 'part_time', hourlyRate: 1800, department: 'Service', hireDate: new Date('2023-06-15'), status: 'active', skills: ['customer_service', 'pos'], maxHoursPerWeek: 30 },
      { id: '5', firstName: 'Seydou', lastName: 'Bamba', email: 'seydou@restaurant.os', phone: '+225 07 00 00 05', role: 'delivery_driver', employmentType: 'full_time', hourlyRate: 2000, department: 'Livraison', hireDate: new Date('2023-08-01'), status: 'active', skills: ['driving', 'navigation', 'customer_service'], maxHoursPerWeek: 45 },
      { id: '6', firstName: 'Mariam', lastName: 'Coulibaly', email: 'mariam@restaurant.os', phone: '+225 07 00 00 06', role: 'cashier', employmentType: 'full_time', hourlyRate: 2000, department: 'Service', hireDate: new Date('2023-02-20'), status: 'active', skills: ['pos', 'cash_handling', 'customer_service'], maxHoursPerWeek: 40 },
      { id: '7', firstName: 'Jean-Baptiste', lastName: 'Kouakou', email: 'jb@restaurant.os', phone: '+225 07 00 00 07', role: 'bartender', employmentType: 'part_time', hourlyRate: 2200, department: 'Bar', hireDate: new Date('2023-09-01'), status: 'active', skills: ['cocktails', 'wine', 'coffee'], maxHoursPerWeek: 25 },
      { id: '8', firstName: 'Aïssata', lastName: 'Traoré', email: 'aissata@restaurant.os', phone: '+225 07 00 00 08', role: 'host', employmentType: 'part_time', hourlyRate: 1500, department: 'Service', hireDate: new Date('2024-01-05'), status: 'active', skills: ['customer_service', 'reservations'], maxHoursPerWeek: 20 },
      { id: '9', firstName: 'Moussa', lastName: 'Sylla', email: 'moussa@restaurant.os', phone: '+225 07 00 00 09', role: 'kitchen_assistant', employmentType: 'full_time', hourlyRate: 1800, department: 'Cuisine', hireDate: new Date('2024-02-01'), status: 'active', skills: ['prep', 'cleaning'], maxHoursPerWeek: 40 },
      { id: '10', firstName: 'Aminata', lastName: 'Sanogo', email: 'aminata@restaurant.os', phone: '+225 07 00 00 10', role: 'cleaner', employmentType: 'part_time', hourlyRate: 1200, department: 'Maintenance', hireDate: new Date('2023-05-15'), status: 'active', skills: ['cleaning', 'sanitation'], maxHoursPerWeek: 20 },
    ];

    demoEmployees.forEach(emp => this.employees.set(emp.id, emp));

    // Create shifts for today
    const today = new Date();
    this.createShiftsForDate(today);
  }

  /**
   * Create shifts for a date
   */
  private createShiftsForDate(date: Date): void {
    const shiftTemplates: Array<{ role: EmployeeRole; start: string; end: string; break: number }> = [
      { role: 'manager', start: '09:00', end: '18:00', break: 60 },
      { role: 'chef', start: '06:00', end: '15:00', break: 30 },
      { role: 'cook', start: '07:00', end: '15:00', break: 30 },
      { role: 'cook', start: '15:00', end: '23:00', break: 30 },
      { role: 'waiter', start: '11:00', end: '15:00', break: 15 },
      { role: 'waiter', start: '18:00', end: '23:00', break: 30 },
      { role: 'delivery_driver', start: '11:00', end: '15:00', break: 15 },
      { role: 'delivery_driver', start: '18:00', end: '23:00', break: 30 },
      { role: 'cashier', start: '10:00', end: '18:00', break: 45 },
      { role: 'bartender', start: '17:00', end: '00:00', break: 30 },
      { role: 'host', start: '11:00', end: '15:00', break: 15 },
      { role: 'host', start: '18:00', end: '22:00', break: 15 },
      { role: 'kitchen_assistant', start: '07:00', end: '15:00', break: 30 },
      { role: 'cleaner', start: '06:00', end: '10:00', break: 0 },
      { role: 'cleaner', start: '22:00', end: '02:00', break: 0 },
    ];

    const employees = Array.from(this.employees.values());

    shiftTemplates.forEach((template, index) => {
      const employee = employees.find(e => e.role === template.role);
      if (employee) {
        this.shifts.push({
          id: `shift-${date.toISOString().split('T')[0]}-${index}`,
          restaurantId: 'demo-restaurant',
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          role: template.role,
          date: new Date(date),
          startTime: template.start,
          endTime: template.end,
          breakDuration: template.break,
          status: 'scheduled',
          overtimeMinutes: 0,
          createdAt: new Date(),
          createdBy: 'system',
        });
      }
    });
  }

  /**
   * Get all employees
   */
  async getEmployees(filters?: {
    role?: EmployeeRole;
    status?: string;
    department?: string;
    search?: string;
  }): Promise<Employee[]> {
    let employees = Array.from(this.employees.values());

    if (filters) {
      if (filters.role) {
        employees = employees.filter(e => e.role === filters.role);
      }
      if (filters.status) {
        employees = employees.filter(e => e.status === filters.status);
      }
      if (filters.department) {
        employees = employees.filter(e => e.department === filters.department);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        employees = employees.filter(e =>
          e.firstName.toLowerCase().includes(search) ||
          e.lastName.toLowerCase().includes(search) ||
          e.email.toLowerCase().includes(search)
        );
      }
    }

    return employees;
  }

  /**
   * Get single employee
   */
  async getEmployee(employeeId: string): Promise<Employee | null> {
    return this.employees.get(employeeId) || null;
  }

  /**
   * Get shifts for a date range
   */
  async getShifts(restaurantId: string, startDate: Date, endDate: Date): Promise<Shift[]> {
    return this.shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= startDate && shiftDate <= endDate;
    });
  }

  /**
   * Get shifts for an employee
   */
  async getEmployeeShifts(employeeId: string, startDate?: Date, endDate?: Date): Promise<Shift[]> {
    return this.shifts.filter(shift => {
      if (shift.employeeId !== employeeId) return false;
      if (startDate && new Date(shift.date) < startDate) return false;
      if (endDate && new Date(shift.date) > endDate) return false;
      return true;
    });
  }

  /**
   * Create a shift
   */
  async createShift(shift: Omit<Shift, 'id' | 'createdAt' | 'status' | 'overtimeMinutes'>): Promise<Shift> {
    const newShift: Shift = {
      ...shift,
      id: `shift-${Date.now()}`,
      status: 'scheduled',
      overtimeMinutes: 0,
      createdAt: new Date(),
    };
    this.shifts.push(newShift);
    return newShift;
  }

  /**
   * Update shift status
   */
  async updateShiftStatus(shiftId: string, status: ShiftStatus): Promise<Shift> {
    const shift = this.shifts.find(s => s.id === shiftId);
    if (!shift) throw new Error('Shift not found');

    shift.status = status;
    if (status === 'in_progress') {
      shift.actualStartTime = new Date();
    } else if (status === 'completed') {
      shift.actualEndTime = new Date();
    }

    return shift;
  }

  /**
   * Clock in
   */
  async clockIn(employeeId: string, shiftId: string): Promise<TimeEntry> {
    const entry: TimeEntry = {
      id: `entry-${Date.now()}`,
      employeeId,
      shiftId,
      clockIn: new Date(),
      breakMinutes: 0,
      totalMinutes: 0,
      overtimeMinutes: 0,
      approved: false,
    };
    this.timeEntries.push(entry);

    // Update shift status
    await this.updateShiftStatus(shiftId, 'in_progress');

    return entry;
  }

  /**
   * Clock out
   */
  async clockOut(employeeId: string, shiftId: string, breakMinutes: number = 0): Promise<TimeEntry> {
    const entry = this.timeEntries.find(
      e => e.employeeId === employeeId && e.shiftId === shiftId && !e.clockOut
    );
    if (!entry) throw new Error('No active time entry found');

    entry.clockOut = new Date();
    entry.breakMinutes = breakMinutes;

    const totalMs = entry.clockOut.getTime() - entry.clockIn.getTime();
    entry.totalMinutes = Math.round((totalMs / 1000 / 60) - breakMinutes);
    entry.overtimeMinutes = Math.max(0, entry.totalMinutes - 8 * 60); // 8 hours is standard

    // Update shift status
    await this.updateShiftStatus(shiftId, 'completed');

    return entry;
  }

  /**
   * Get time entries
   */
  async getTimeEntries(employeeId?: string, startDate?: Date, endDate?: Date): Promise<TimeEntry[]> {
    let entries = [...this.timeEntries];

    if (employeeId) {
      entries = entries.filter(e => e.employeeId === employeeId);
    }
    if (startDate) {
      entries = entries.filter(e => e.clockIn >= startDate);
    }
    if (endDate) {
      entries = entries.filter(e => e.clockIn <= endDate);
    }

    return entries.sort((a, b) => b.clockIn.getTime() - a.clockIn.getTime());
  }

  /**
   * Get leave requests
   */
  async getLeaveRequests(filters?: {
    employeeId?: string;
    status?: string;
    type?: LeaveType;
  }): Promise<LeaveRequest[]> {
    let requests = [...this.leaveRequests];

    if (filters) {
      if (filters.employeeId) {
        requests = requests.filter(r => r.employeeId === filters.employeeId);
      }
      if (filters.status) {
        requests = requests.filter(r => r.status === filters.status);
      }
      if (filters.type) {
        requests = requests.filter(r => r.type === filters.type);
      }
    }

    return requests.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }

  /**
   * Create leave request
   */
  async createLeaveRequest(request: Omit<LeaveRequest, 'id' | 'requestedAt' | 'status'>): Promise<LeaveRequest> {
    const newRequest: LeaveRequest = {
      ...request,
      id: `leave-${Date.now()}`,
      status: 'pending',
      requestedAt: new Date(),
    };
    this.leaveRequests.push(newRequest);
    return newRequest;
  }

  /**
   * Review leave request
   */
  async reviewLeaveRequest(
    requestId: string,
    status: 'approved' | 'rejected',
    reviewerId: string,
    notes?: string
  ): Promise<LeaveRequest> {
    const request = this.leaveRequests.find(r => r.id === requestId);
    if (!request) throw new Error('Leave request not found');

    request.status = status;
    request.reviewedAt = new Date();
    request.reviewedBy = reviewerId;
    request.reviewNotes = notes;

    return request;
  }

  /**
   * Get schedule statistics
   */
  async getScheduleStats(restaurantId: string, date: Date): Promise<ScheduleStats> {
    const dateStr = date.toISOString().split('T')[0];
    const dayShifts = this.shifts.filter(s => s.date.toISOString().split('T')[0] === dateStr);

    const roleCount: Record<EmployeeRole, number> = {
      manager: 0, chef: 0, cook: 0, waiter: 0, bartender: 0,
      cashier: 0, host: 0, delivery_driver: 0, kitchen_assistant: 0, cleaner: 0,
    };

    let totalHours = 0;
    dayShifts.forEach(shift => {
      roleCount[shift.role]++;
      const [startH, startM] = shift.startTime.split(':').map(Number);
      const [endH, endM] = shift.endTime.split(':').map(Number);
      const hours = (endH * 60 + endM - startH * 60 - startM - shift.breakDuration) / 60;
      totalHours += hours;
    });

    return {
      totalShifts: dayShifts.length,
      filledShifts: dayShifts.filter(s => s.employeeId).length,
      openShifts: dayShifts.filter(s => !s.employeeId).length,
      totalHours: Math.round(totalHours),
      employeesWorking: new Set(dayShifts.map(s => s.employeeId)).size,
      roles: roleCount,
    };
  }

  /**
   * Calculate payroll
   */
  async calculatePayroll(
    restaurantId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<PayrollEntry[]> {
    const employees = await this.getEmployees({ status: 'active' });
    const entries = await this.getTimeEntries(undefined, periodStart, periodEnd);

    return employees.map(employee => {
      const employeeEntries = entries.filter(e => e.employeeId === employee.id);
      const regularMinutes = employeeEntries.reduce((sum, e) => sum + Math.min(e.totalMinutes, 8 * 60), 0);
      const overtimeMinutes = employeeEntries.reduce((sum, e) => sum + e.overtimeMinutes, 0);

      const regularHours = regularMinutes / 60;
      const overtimeHours = overtimeMinutes / 60;
      const overtimeRate = employee.hourlyRate * 1.5;

      const grossPay = (regularHours * employee.hourlyRate) + (overtimeHours * overtimeRate);
      const deductions = grossPay * 0.08; // 8% for demo
      const netPay = grossPay - deductions;

      return {
        id: `payroll-${employee.id}-${periodStart.toISOString().split('T')[0]}`,
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        periodStart,
        periodEnd,
        regularHours: Math.round(regularHours * 100) / 100,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
        hourlyRate: employee.hourlyRate,
        overtimeRate,
        grossPay: Math.round(grossPay),
        deductions: Math.round(deductions),
        netPay: Math.round(netPay),
        status: 'draft',
      };
    });
  }

  /**
   * Get shift templates
   */
  getShiftTemplates(): ShiftTemplate[] {
    return [
      { id: '1', name: 'Matin Cuisine', role: 'cook', startTime: '06:00', endTime: '14:00', breakDuration: 30, color: '#FFA500' },
      { id: '2', name: 'Soir Cuisine', role: 'cook', startTime: '14:00', endTime: '22:00', breakDuration: 30, color: '#FF8C00' },
      { id: '3', name: 'Service Déjeuner', role: 'waiter', startTime: '11:00', endTime: '15:00', breakDuration: 15, color: '#4CAF50' },
      { id: '4', name: 'Service Dîner', role: 'waiter', startTime: '18:00', endTime: '23:00', breakDuration: 30, color: '#45a049' },
      { id: '5', name: 'Livraison Jour', role: 'delivery_driver', startTime: '10:00', endTime: '16:00', breakDuration: 30, color: '#2196F3' },
      { id: '6', name: 'Livraison Soir', role: 'delivery_driver', startTime: '17:00', endTime: '23:00', breakDuration: 30, color: '#1976D2' },
      { id: '7', name: 'Bar Evening', role: 'bartender', startTime: '17:00', endTime: '01:00', breakDuration: 45, color: '#9C27B0' },
      { id: '8', name: 'Host Déjeuner', role: 'host', startTime: '11:00', endTime: '15:00', breakDuration: 15, color: '#E91E63' },
    ];
  }
}

// Export singleton instance
export const employeeService = new EmployeeService();
