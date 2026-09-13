import React, { createContext, useContext, useState, useEffect } from 'react';
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
  SystemSettings,
  LeaveStatus,
  Role
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_LEAVE_TYPES,
  INITIAL_LEAVE_BALANCES,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_ATTENDANCE,
  INITIAL_HOLIDAYS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS
} from '../data/initialData';

interface DataContextType {
  users: User[];
  departments: Department[];
  leaveTypes: LeaveType[];
  leaveBalances: LeaveBalance[];
  leaveRequests: LeaveRequest[];
  attendance: AttendanceRecord[];
  holidays: Holiday[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  settings: SystemSettings;

  // Actions
  applyLeaveRequest: (data: {
    employeeId: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    numberOfDays: number;
    isHalfDay: boolean;
    halfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
    reason: string;
    emergencyContact: string;
    attachmentName?: string;
    attachmentUrl?: string;
  }) => void;

  reviewLeaveRequest: (
    requestId: string,
    status: LeaveStatus,
    reviewerId: string,
    reviewerName: string,
    reviewerRole: Role,
    comment?: string
  ) => void;

  cancelLeaveRequest: (requestId: string, userId: string) => void;

  checkIn: (employeeId: string, employeeName: string) => void;
  checkOut: (employeeId: string) => void;

  addEmployee: (user: Omit<User, 'id'>) => User;
  updateEmployee: (id: string, updates: Partial<User>) => void;
  deleteEmployee: (id: string) => void;

  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  addLeaveType: (lt: Omit<LeaveType, 'id'>) => void;
  updateLeaveType: (id: string, updates: Partial<LeaveType>) => void;
  deleteLeaveType: (id: string) => void;

  addHoliday: (holiday: Omit<Holiday, 'id'>) => void;
  deleteHoliday: (id: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;

  updateSettings: (newSettings: Partial<SystemSettings>) => void;

  logAudit: (userId: string, userName: string, role: Role, action: string, module: string, details: string) => void;

  resetDemoData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_CLEAN_VERSION = 'elms_clean_v2';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Purge old proxy cache if on previous version
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('elms_storage_version') !== STORAGE_CLEAN_VERSION) {
      localStorage.removeItem('elms_users');
      localStorage.removeItem('elms_departments');
      localStorage.removeItem('elms_leave_types');
      localStorage.removeItem('elms_leave_balances');
      localStorage.removeItem('elms_leave_requests');
      localStorage.removeItem('elms_attendance');
      localStorage.removeItem('elms_holidays');
      localStorage.removeItem('elms_notifications');
      localStorage.removeItem('elms_audit_logs');
      localStorage.removeItem('elms_settings');
      localStorage.removeItem('elms_current_user_id');
      localStorage.setItem('elms_storage_version', STORAGE_CLEAN_VERSION);
    }
  }

  const [users, setUsers] = useState<User[]>(() => {
    const local = localStorage.getItem('elms_users');
    return local ? JSON.parse(local) : INITIAL_USERS;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const local = localStorage.getItem('elms_departments');
    return local ? JSON.parse(local) : INITIAL_DEPARTMENTS;
  });

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(() => {
    const local = localStorage.getItem('elms_leave_types');
    return local ? JSON.parse(local) : INITIAL_LEAVE_TYPES;
  });

  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>(() => {
    const local = localStorage.getItem('elms_leave_balances');
    return local ? JSON.parse(local) : INITIAL_LEAVE_BALANCES;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const local = localStorage.getItem('elms_leave_requests');
    return local ? JSON.parse(local) : INITIAL_LEAVE_REQUESTS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const local = localStorage.getItem('elms_attendance');
    return local ? JSON.parse(local) : INITIAL_ATTENDANCE;
  });

  const [holidays, setHolidays] = useState<Holiday[]>(() => {
    const local = localStorage.getItem('elms_holidays');
    return local ? JSON.parse(local) : INITIAL_HOLIDAYS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const local = localStorage.getItem('elms_notifications');
    return local ? JSON.parse(local) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const local = localStorage.getItem('elms_audit_logs');
    return local ? JSON.parse(local) : INITIAL_AUDIT_LOGS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const local = localStorage.getItem('elms_settings');
    return local ? JSON.parse(local) : INITIAL_SETTINGS;
  });

  // Sync state to local storage
  useEffect(() => { localStorage.setItem('elms_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('elms_departments', JSON.stringify(departments)); }, [departments]);
  useEffect(() => { localStorage.setItem('elms_leave_types', JSON.stringify(leaveTypes)); }, [leaveTypes]);
  useEffect(() => { localStorage.setItem('elms_leave_balances', JSON.stringify(leaveBalances)); }, [leaveBalances]);
  useEffect(() => { localStorage.setItem('elms_leave_requests', JSON.stringify(leaveRequests)); }, [leaveRequests]);
  useEffect(() => { localStorage.setItem('elms_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('elms_holidays', JSON.stringify(holidays)); }, [holidays]);
  useEffect(() => { localStorage.setItem('elms_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('elms_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('elms_settings', JSON.stringify(settings)); }, [settings]);

  const logAudit = (userId: string, userName: string, role: Role, action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId,
      userName,
      role,
      action,
      module,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const applyLeaveRequest = (data: {
    employeeId: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    numberOfDays: number;
    isHalfDay: boolean;
    halfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
    reason: string;
    emergencyContact: string;
    attachmentName?: string;
    attachmentUrl?: string;
  }) => {
    const emp = users.find(u => u.id === data.employeeId);
    const lt = leaveTypes.find(l => l.id === data.leaveTypeId);
    const dept = departments.find(d => d.id === emp?.departmentId);

    if (!emp || !lt) return;

    const requestNo = `LR-2026-${String(leaveRequests.length + 1).padStart(3, '0')}`;
    const newRequestId = `lr-${Date.now()}`;

    const newRequest: LeaveRequest = {
      id: newRequestId,
      requestNo,
      employeeId: emp.id,
      employeeName: emp.name,
      employeeCode: emp.employeeId,
      departmentId: emp.departmentId,
      departmentName: dept?.name || 'Department',
      leaveTypeId: lt.id,
      leaveTypeName: lt.name,
      leaveTypeCode: lt.code,
      startDate: data.startDate,
      endDate: data.endDate,
      numberOfDays: data.numberOfDays,
      isHalfDay: data.isHalfDay,
      halfDayType: data.halfDayType,
      reason: data.reason,
      emergencyContact: data.emergencyContact,
      attachmentName: data.attachmentName,
      attachmentUrl: data.attachmentUrl,
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reviewHistory: [
        {
          id: `rev-${Date.now()}`,
          reviewerId: emp.id,
          reviewerName: emp.name,
          reviewerRole: emp.role,
          action: 'APPLIED',
          comment: 'Submitted leave application',
          timestamp: new Date().toISOString()
        }
      ]
    };

    setLeaveRequests(prev => {
      const updated = [newRequest, ...prev];
      try {
        localStorage.setItem('elms_leave_requests', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to sync leave requests', e);
      }
      return updated;
    });

    // Update Leave Balance (increase pending)
    setLeaveBalances(prev =>
      prev.map(b => {
        if (b.employeeId === emp.id && b.leaveTypeId === lt.id) {
          return {
            ...b,
            pending: b.pending + data.numberOfDays
          };
        }
        return b;
      })
    );

    // Notify Manager or Admin: If a Manager applies for leave, route notification directly to Administrators
    if (emp.role === 'MANAGER') {
      const adminUsers = users.filter(u => u.role === 'ADMIN');
      const adminNotifications: Notification[] = adminUsers.map((adminUser, idx) => ({
        id: `notif-${Date.now()}-${idx}`,
        userId: adminUser.id,
        title: 'Manager Leave Application',
        message: `Department Manager ${emp.name} applied for ${data.numberOfDays} day(s) ${lt.name} (${data.startDate}). Requires Administrator review.`,
        type: 'LEAVE_APPLIED',
        isRead: false,
        createdAt: new Date().toISOString(),
        linkId: newRequestId
      }));
      setNotifications(prev => [...adminNotifications, ...prev]);
    } else {
      const managerId = emp.managerId || users.find(u => u.role === 'MANAGER' && u.departmentId === emp.departmentId)?.id || 'emp-mgr';
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        userId: managerId,
        title: 'New Leave Application',
        message: `${emp.name} applied for ${data.numberOfDays} day(s) ${lt.name} (${data.startDate}).`,
        type: 'LEAVE_APPLIED',
        isRead: false,
        createdAt: new Date().toISOString(),
        linkId: newRequestId
      };
      setNotifications(prev => [newNotification, ...prev]);
    }

    // Audit log
    logAudit(emp.id, emp.name, emp.role, 'Apply Leave', 'Leave Management', `Applied ${data.numberOfDays} days ${lt.code} [${requestNo}]`);
  };

  const reviewLeaveRequest = (
    requestId: string,
    status: LeaveStatus,
    reviewerId: string,
    reviewerName: string,
    reviewerRole: Role,
    comment?: string
  ) => {
    const target = leaveRequests.find(r => r.id === requestId);
    if (!target) return;

    const previousStatus = target.status;

    setLeaveRequests(prev => {
      const updated = prev.map(r => {
        if (r.id === requestId) {
          const updatedHistory = [
            ...r.reviewHistory,
            {
              id: `rev-${Date.now()}`,
              reviewerId,
              reviewerName,
              reviewerRole,
              action: status as any,
              comment: comment || `Status changed to ${status}`,
              timestamp: new Date().toISOString()
            }
          ];
          return {
            ...r,
            status,
            managerComments: reviewerRole === 'MANAGER' ? comment : r.managerComments,
            adminComments: reviewerRole === 'ADMIN' ? comment : r.adminComments,
            updatedAt: new Date().toISOString(),
            reviewHistory: updatedHistory
          };
        }
        return r;
      });
      try {
        localStorage.setItem('elms_leave_requests', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to sync leave requests', e);
      }
      return updated;
    });

    // Adjust leave balances
    if (previousStatus === 'PENDING') {
      setLeaveBalances(prev =>
        prev.map(b => {
          if (b.employeeId === target.employeeId && b.leaveTypeId === target.leaveTypeId) {
            if (status === 'APPROVED') {
              return {
                ...b,
                pending: Math.max(0, b.pending - target.numberOfDays),
                used: b.used + target.numberOfDays,
                remaining: Math.max(0, b.remaining - target.numberOfDays)
              };
            } else if (status === 'REJECTED') {
              return {
                ...b,
                pending: Math.max(0, b.pending - target.numberOfDays)
              };
            }
          }
          return b;
        })
      );
    }

    // Notify Employee
    const notifyType = status === 'APPROVED' ? 'LEAVE_APPROVED' : status === 'REJECTED' ? 'LEAVE_REJECTED' : 'INFO_REQUESTED';
    const notifyMsg = status === 'APPROVED'
      ? `Your leave request ${target.requestNo} has been APPROVED.`
      : status === 'REJECTED'
      ? `Your leave request ${target.requestNo} was REJECTED. Reason: ${comment || 'N/A'}`
      : `More information requested for your leave ${target.requestNo}: ${comment || ''}`;

    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: target.employeeId,
      title: `Leave Request ${status}`,
      message: notifyMsg,
      type: notifyType,
      isRead: false,
      createdAt: new Date().toISOString(),
      linkId: target.id
    };
    setNotifications(prev => [newNotif, ...prev]);

    logAudit(reviewerId, reviewerName, reviewerRole, `Review Leave (${status})`, 'Leave Management', `${status} request ${target.requestNo} for ${target.employeeName}`);
  };

  const cancelLeaveRequest = (requestId: string, userId: string) => {
    const target = leaveRequests.find(r => r.id === requestId);
    if (!target) return;

    setLeaveRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'CANCELLED', updatedAt: new Date().toISOString() } : r))
    );

    // Release pending balance
    setLeaveBalances(prev =>
      prev.map(b => {
        if (b.employeeId === target.employeeId && b.leaveTypeId === target.leaveTypeId) {
          if (target.status === 'PENDING') {
            return { ...b, pending: Math.max(0, b.pending - target.numberOfDays) };
          } else if (target.status === 'APPROVED') {
            return {
              ...b,
              used: Math.max(0, b.used - target.numberOfDays),
              remaining: b.remaining + target.numberOfDays
            };
          }
        }
        return b;
      })
    );

    logAudit(userId, target.employeeName, 'EMPLOYEE', 'Cancel Leave', 'Leave Management', `Cancelled request ${target.requestNo}`);
  };

  // Attendance Clock In / Clock Out
  const checkIn = (employeeId: string, employeeName: string) => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Determine if late (after 09:15 AM)
    const now = new Date();
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);
    const lateMins = isLate ? Math.max(0, (now.getHours() - 9) * 60 + now.getMinutes() - 15) : 0;

    const existingIndex = attendance.findIndex(a => a.employeeId === employeeId && a.date === today);

    if (existingIndex >= 0) {
      setAttendance(prev =>
        prev.map((a, i) => (i === existingIndex ? { ...a, checkInTime: nowTime, status: isLate ? 'LATE' : 'PRESENT', lateMinutes: lateMins } : a))
      );
    } else {
      const newRec: AttendanceRecord = {
        id: `att-${Date.now()}`,
        employeeId,
        employeeName,
        date: today,
        checkInTime: nowTime,
        status: isLate ? 'LATE' : 'PRESENT',
        lateMinutes: lateMins
      };
      setAttendance(prev => [newRec, ...prev]);
    }

    logAudit(employeeId, employeeName, 'EMPLOYEE', 'Check In', 'Attendance', `Clocked in at ${nowTime}`);
  };

  const checkOut = (employeeId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    setAttendance(prev =>
      prev.map(a => {
        if (a.employeeId === employeeId && a.date === today) {
          return {
            ...a,
            checkOutTime: nowTime,
            totalHours: 9.0 // Calculated duration
          };
        }
        return a;
      })
    );

    const emp = users.find(u => u.id === employeeId);
    if (emp) {
      logAudit(employeeId, emp.name, emp.role, 'Check Out', 'Attendance', `Clocked out at ${nowTime}`);
    }
  };

  // Employee CRUD
  const addEmployee = (newUser: Omit<User, 'id'>): User => {
    const newId = `emp-${Date.now()}`;
    const created: User = {
      ...newUser,
      id: newId,
      name: newUser.name.trim(),
      email: newUser.email.trim().toLowerCase(),
      password: (newUser.password || 'password123').trim()
    };
    setUsers(prev => {
      const updated = [...prev, created];
      try {
        localStorage.setItem('elms_users', JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving users to localStorage:', err);
      }
      return updated;
    });

    // Create default leave balances for the new employee
    const newBalances: LeaveBalance[] = leaveTypes.map(lt => ({
      id: `bal-${Date.now()}-${lt.code}`,
      employeeId: newId,
      year: 2026,
      leaveTypeId: lt.id,
      leaveTypeName: lt.name,
      leaveTypeCode: lt.code,
      allocated: lt.maxDaysPerYear,
      used: 0,
      pending: 0,
      remaining: lt.maxDaysPerYear,
      color: lt.color
    }));

    setLeaveBalances(prev => [...prev, ...newBalances]);
    logAudit('emp-001', 'Admin', 'ADMIN', 'Add Employee', 'Employee Management', `Added new employee ${newUser.name} (${newUser.employeeId})`);
    return created;
  };

  const updateEmployee = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
    logAudit('emp-001', 'Admin', 'ADMIN', 'Update Employee', 'Employee Management', `Updated profile for employee ID ${id}`);
  };

  const deleteEmployee = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    logAudit('emp-001', 'Admin', 'ADMIN', 'Delete Employee', 'Employee Management', `Removed employee ID ${id}`);
  };

  // Department CRUD
  const addDepartment = (newDept: Omit<Department, 'id'>) => {
    const created: Department = { ...newDept, id: `dept-${Date.now()}` };
    setDepartments(prev => [...prev, created]);
    logAudit('emp-001', 'Admin', 'ADMIN', 'Add Department', 'Department Management', `Created department ${newDept.name}`);
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    setDepartments(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
  };

  const deleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  // Leave Type CRUD
  const addLeaveType = (lt: Omit<LeaveType, 'id'>) => {
    const created: LeaveType = { ...lt, id: `lt-${Date.now()}` };
    setLeaveTypes(prev => [...prev, created]);

    // Add balance allocations for existing employees
    const newBalances: LeaveBalance[] = users.map(u => ({
      id: `bal-${Date.now()}-${u.id}`,
      employeeId: u.id,
      year: 2026,
      leaveTypeId: created.id,
      leaveTypeName: created.name,
      leaveTypeCode: created.code,
      allocated: created.maxDaysPerYear,
      used: 0,
      pending: 0,
      remaining: created.maxDaysPerYear,
      color: created.color
    }));
    setLeaveBalances(prev => [...prev, ...newBalances]);
  };

  const updateLeaveType = (id: string, updates: Partial<LeaveType>) => {
    setLeaveTypes(prev => prev.map(lt => (lt.id === id ? { ...lt, ...updates } : lt)));
  };

  const deleteLeaveType = (id: string) => {
    setLeaveTypes(prev => prev.filter(lt => lt.id !== id));
  };

  // Holidays
  const addHoliday = (holiday: Omit<Holiday, 'id'>) => {
    const created: Holiday = { ...holiday, id: `hol-${Date.now()}` };
    setHolidays(prev => [...prev, created]);
  };

  const deleteHoliday = (id: string) => {
    setHolidays(prev => prev.filter(h => h.id !== id));
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = (userId: string) => {
    setNotifications(prev => prev.map(n => (n.userId === userId ? { ...n, isRead: true } : n)));
  };

  // Settings
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Reset to initial clean state
  const resetDemoData = () => {
    setUsers(INITIAL_USERS);
    setDepartments(INITIAL_DEPARTMENTS);
    setLeaveTypes(INITIAL_LEAVE_TYPES);
    setLeaveBalances(INITIAL_LEAVE_BALANCES);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    setAttendance(INITIAL_ATTENDANCE);
    setHolidays(INITIAL_HOLIDAYS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSettings(INITIAL_SETTINGS);
    localStorage.clear();
  };

  return (
    <DataContext.Provider
      value={{
        users,
        departments,
        leaveTypes,
        leaveBalances,
        leaveRequests,
        attendance,
        holidays,
        notifications,
        auditLogs,
        settings,
        applyLeaveRequest,
        reviewLeaveRequest,
        cancelLeaveRequest,
        checkIn,
        checkOut,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addLeaveType,
        updateLeaveType,
        deleteLeaveType,
        addHoliday,
        deleteHoliday,
        markNotificationRead,
        markAllNotificationsRead,
        updateSettings,
        logAudit,
        resetDemoData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
