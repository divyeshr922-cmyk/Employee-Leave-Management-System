import {
  User,
  Department,
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  AttendanceRecord,
  Holiday,
  Notification,
  AuditLog,
  SystemSettings
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'emp-admin',
    employeeId: 'ADM001',
    name: 'System Administrator',
    email: 'admin@elms.com',
    password: 'admin123',
    role: 'ADMIN',
    departmentId: 'dept-gen',
    designation: 'System Administrator',
    phone: '+1 (555) 000-0001',
    joiningDate: '2026-01-01',
    status: 'ACTIVE',
    gender: 'OTHER'
  },
  {
    id: 'emp-mgr',
    employeeId: 'MGR101',
    name: 'Alex Rivera',
    email: 'manager@elms.com',
    password: 'manager123',
    role: 'MANAGER',
    departmentId: 'dept-eng',
    designation: 'Engineering Lead',
    phone: '+1 (555) 234-5678',
    joiningDate: '2026-01-10',
    status: 'ACTIVE',
    gender: 'MALE',
    emergencyContact: '+1 (555) 987-6543'
  },
  {
    id: 'emp-sarah',
    employeeId: 'EMP1001',
    name: 'Sarah Jenkins',
    email: 'employee@elms.com',
    password: 'employee123',
    role: 'EMPLOYEE',
    departmentId: 'dept-eng',
    designation: 'Senior Frontend Engineer',
    phone: '+1 (555) 345-6789',
    joiningDate: '2026-02-01',
    managerId: 'emp-mgr',
    status: 'ACTIVE',
    gender: 'FEMALE',
    emergencyContact: '+1 (555) 876-5432'
  }
];

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-gen',
    code: 'GEN',
    name: 'Administration & Operations',
    description: 'Executive Management and Central Administration'
  },
  {
    id: 'dept-eng',
    code: 'ENG',
    name: 'Engineering & Technology',
    description: 'Software Engineering, Infrastructure and Product Development'
  },
  {
    id: 'dept-hr',
    code: 'HR',
    name: 'Human Resources',
    description: 'People Operations, Recruiting and Employee Relations'
  },
  {
    id: 'dept-fin',
    code: 'FIN',
    name: 'Finance & Accounting',
    description: 'Financial Planning, Budgeting and Payroll'
  },
  {
    id: 'dept-sales',
    code: 'SALES',
    name: 'Sales & Marketing',
    description: 'Customer Partnerships, Marketing and Business Growth'
  }
];

export const INITIAL_LEAVE_TYPES: LeaveType[] = [
  {
    id: 'lt-cl',
    code: 'CL',
    name: 'Casual Leave',
    maxDaysPerYear: 12,
    carryForwardMax: 3,
    isPaid: true,
    requiresAttachment: false,
    color: '#0284c7', // sky-600
    description: 'Allocated for personal, urgent, or non-medical short absences.'
  },
  {
    id: 'lt-sl',
    code: 'SL',
    name: 'Sick Leave',
    maxDaysPerYear: 10,
    carryForwardMax: 5,
    isPaid: true,
    requiresAttachment: true,
    color: '#e11d48', // rose-600
    description: 'For illness or medical appointments. Requires documentation if > 2 days.'
  },
  {
    id: 'lt-el',
    code: 'EL',
    name: 'Earned Leave',
    maxDaysPerYear: 15,
    carryForwardMax: 10,
    isPaid: true,
    requiresAttachment: false,
    color: '#059669', // emerald-600
    description: 'Annual vacation leave earned progressively over the calendar year.'
  },
  {
    id: 'lt-wfh',
    code: 'WFH',
    name: 'Work From Home',
    maxDaysPerYear: 24,
    carryForwardMax: 0,
    isPaid: true,
    requiresAttachment: false,
    color: '#7c3aed', // violet-600
    description: 'Remote working allowance granted with prior manager approval.'
  },
  {
    id: 'lt-ml',
    code: 'ML',
    name: 'Maternity Leave',
    maxDaysPerYear: 180,
    carryForwardMax: 0,
    isPaid: true,
    requiresAttachment: true,
    color: '#db2777', // pink-600
    description: 'Paid parental leave for expecting or new mothers.'
  },
  {
    id: 'lt-pl',
    code: 'PL',
    name: 'Paternity Leave',
    maxDaysPerYear: 15,
    carryForwardMax: 0,
    isPaid: true,
    requiresAttachment: false,
    color: '#2563eb', // blue-600
    description: 'Paid parental leave for new fathers.'
  },
  {
    id: 'lt-hdl',
    code: 'HDL',
    name: 'Half Day Leave',
    maxDaysPerYear: 10,
    carryForwardMax: 0,
    isPaid: true,
    requiresAttachment: false,
    color: '#d97706', // amber-600
    description: 'Half-day leave for morning or afternoon sessions.'
  },
  {
    id: 'lt-comp',
    code: 'COMP',
    name: 'Compensatory Off',
    maxDaysPerYear: 6,
    carryForwardMax: 2,
    isPaid: true,
    requiresAttachment: false,
    color: '#0d9488', // teal-600
    description: 'Earned by working extra hours on official non-working days or weekends.'
  },
  {
    id: 'lt-ul',
    code: 'UL',
    name: 'Unpaid Leave',
    maxDaysPerYear: 30,
    carryForwardMax: 0,
    isPaid: false,
    requiresAttachment: false,
    color: '#475569', // slate-600
    description: 'Leave without pay when paid balance is exhausted.'
  }
];

export const INITIAL_LEAVE_BALANCES: LeaveBalance[] = [
  // Sarah Jenkins (Employee) Balances
  { id: 'bal-sarah-cl', employeeId: 'emp-sarah', year: 2026, leaveTypeId: 'lt-cl', leaveTypeName: 'Casual Leave', leaveTypeCode: 'CL', allocated: 12, used: 2, pending: 0, remaining: 10, color: '#0284c7' },
  { id: 'bal-sarah-sl', employeeId: 'emp-sarah', year: 2026, leaveTypeId: 'lt-sl', leaveTypeName: 'Sick Leave', leaveTypeCode: 'SL', allocated: 10, used: 1, pending: 0, remaining: 9, color: '#e11d48' },
  { id: 'bal-sarah-el', employeeId: 'emp-sarah', year: 2026, leaveTypeId: 'lt-el', leaveTypeName: 'Earned Leave', leaveTypeCode: 'EL', allocated: 15, used: 3, pending: 2, remaining: 10, color: '#059669' },
  { id: 'bal-sarah-wfh', employeeId: 'emp-sarah', year: 2026, leaveTypeId: 'lt-wfh', leaveTypeName: 'Work From Home', leaveTypeCode: 'WFH', allocated: 24, used: 4, pending: 0, remaining: 20, color: '#7c3aed' },
  // Alex Rivera (Manager) Balances
  { id: 'bal-mgr-cl', employeeId: 'emp-mgr', year: 2026, leaveTypeId: 'lt-cl', leaveTypeName: 'Casual Leave', leaveTypeCode: 'CL', allocated: 12, used: 1, pending: 0, remaining: 11, color: '#0284c7' },
  { id: 'bal-mgr-sl', employeeId: 'emp-mgr', year: 2026, leaveTypeId: 'lt-sl', leaveTypeName: 'Sick Leave', leaveTypeCode: 'SL', allocated: 10, used: 0, pending: 0, remaining: 10, color: '#e11d48' },
  { id: 'bal-mgr-el', employeeId: 'emp-mgr', year: 2026, leaveTypeId: 'lt-el', leaveTypeName: 'Earned Leave', leaveTypeCode: 'EL', allocated: 15, used: 2, pending: 0, remaining: 13, color: '#059669' }
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lr-demo-01',
    requestNo: 'LR-2026-001',
    employeeId: 'emp-sarah',
    employeeName: 'Sarah Jenkins',
    employeeCode: 'EMP1001',
    departmentId: 'dept-eng',
    departmentName: 'Engineering & Technology',
    leaveTypeId: 'lt-el',
    leaveTypeName: 'Earned Leave',
    leaveTypeCode: 'EL',
    startDate: '2026-09-20',
    endDate: '2026-09-22',
    numberOfDays: 2,
    isHalfDay: false,
    reason: 'Family gathering and personal travel',
    emergencyContact: '+1 (555) 876-5432',
    status: 'PENDING',
    appliedAt: '2026-09-12T10:30:00.000Z',
    updatedAt: '2026-09-12T10:30:00.000Z',
    reviewHistory: [
      {
        id: 'rev-01',
        reviewerId: 'emp-sarah',
        reviewerName: 'Sarah Jenkins',
        reviewerRole: 'EMPLOYEE',
        action: 'APPLIED',
        comment: 'Submitted leave application',
        timestamp: '2026-09-12T10:30:00.000Z'
      }
    ]
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_HOLIDAYS: Holiday[] = [
  { id: 'hol-01', title: "New Year's Day", date: '2026-01-01', dayOfWeek: 'Thursday', type: 'NATIONAL', description: 'Global holiday celebrating the new year', isMandatory: true },
  { id: 'hol-02', title: 'Republic Day', date: '2026-01-26', dayOfWeek: 'Monday', type: 'NATIONAL', description: 'National Republic Day celebration', isMandatory: true },
  { id: 'hol-03', title: 'Spring Equinox Festival', date: '2026-03-20', dayOfWeek: 'Friday', type: 'FESTIVAL', description: 'Cultural festival of colors & spring', isMandatory: false },
  { id: 'hol-04', title: 'Labor Day', date: '2026-05-01', dayOfWeek: 'Friday', type: 'NATIONAL', description: "International Workers' Day", isMandatory: true },
  { id: 'hol-05', title: 'Independence Day', date: '2026-08-15', dayOfWeek: 'Saturday', type: 'NATIONAL', description: 'National Independence Day', isMandatory: true },
  { id: 'hol-06', title: 'Autumn Harvest Holiday', date: '2026-10-02', dayOfWeek: 'Friday', type: 'FESTIVAL', description: 'National harvest and peace holiday', isMandatory: true },
  { id: 'hol-07', title: 'Festival of Lights (Diwali)', date: '2026-11-08', dayOfWeek: 'Sunday', type: 'FESTIVAL', description: 'Grand festival of light and prosperity', isMandatory: true },
  { id: 'hol-08', title: 'Christmas Day', date: '2026-12-25', dayOfWeek: 'Friday', type: 'NATIONAL', description: 'Annual Christmas holiday', isMandatory: true }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-init',
    userId: 'emp-admin',
    userName: 'System Administrator',
    role: 'ADMIN',
    action: 'System Initialized',
    module: 'System',
    details: 'Employee Leave Management System ready for organization use.',
    timestamp: '2026-01-01T00:00:00.000Z'
  }
];

export const INITIAL_SETTINGS: SystemSettings = {
  companyName: 'Apex Enterprise',
  companyLogoText: 'ELMS',
  fiscalYearStart: '2026-01-01',
  workingDaysPerWeek: 5,
  weekendDays: ['Saturday', 'Sunday'],
  emailNotificationsEnabled: true,
  requireMedicalDocDaysThreshold: 2,
  allowHalfDay: true,
  autoApproveSameDay: false
};
