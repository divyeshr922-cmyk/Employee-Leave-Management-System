export type Role = 'EMPLOYEE' | 'MANAGER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  departmentId: string;
  designation: string;
  avatar?: string;
  phone: string;
  joiningDate: string;
  managerId?: string;
  status: UserStatus;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  emergencyContact?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  managerId?: string;
  managerName?: string;
}

export interface LeaveType {
  id: string;
  code: string;
  name: string;
  maxDaysPerYear: number;
  carryForwardMax: number;
  isPaid: boolean;
  requiresAttachment: boolean;
  color: string;
  description: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  year: number;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  allocated: number;
  used: number;
  pending: number;
  remaining: number;
  color: string;
}

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'NEEDS_INFO';

export interface ReviewStep {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: Role;
  action: 'APPROVED' | 'REJECTED' | 'NEEDS_INFO' | 'APPLIED';
  comment?: string;
  timestamp: string;
}

export interface LeaveRequest {
  id: string;
  requestNo: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentId: string;
  departmentName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  isHalfDay: boolean;
  halfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
  reason: string;
  emergencyContact: string;
  attachmentUrl?: string;
  attachmentName?: string;
  status: LeaveStatus;
  managerComments?: string;
  adminComments?: string;
  appliedAt: string;
  updatedAt: string;
  reviewHistory: ReviewStep[];
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  status: AttendanceStatus;
  lateMinutes?: number;
  notes?: string;
}

export interface Holiday {
  id: string;
  title: string;
  date: string;
  dayOfWeek: string;
  type: 'NATIONAL' | 'FESTIVAL' | 'COMPANY';
  description: string;
  isMandatory: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'LEAVE_APPLIED' | 'LEAVE_APPROVED' | 'LEAVE_REJECTED' | 'INFO_REQUESTED' | 'SYSTEM' | 'ATTENDANCE';
  isRead: boolean;
  createdAt: string;
  linkId?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: Role;
  action: string;
  module: string;
  details: string;
  timestamp: string;
}

export interface SystemSettings {
  companyName: string;
  companyLogoText: string;
  fiscalYearStart: string;
  workingDaysPerWeek: number;
  weekendDays: string[]; // e.g. ['Saturday', 'Sunday']
  emailNotificationsEnabled: boolean;
  requireMedicalDocDaysThreshold: number;
  allowHalfDay: boolean;
  autoApproveSameDay: boolean;
}
