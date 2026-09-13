import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { LeaveRequest, Role } from '../../types';
import { formatDate } from '../../utils/helpers';
import { CreateEmployeeModal } from '../employees/CreateEmployeeModal';
import {
  Users,
  Building2,
  Sliders,
  BarChart3,
  Shield,
  FileCheck,
  AlertCircle,
  UserPlus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Activity
} from 'lucide-react';

interface AdminDashboardProps {
  onSelectRequest: (request: LeaveRequest) => void;
  onNavigateToTab: (tab: string) => void;
  onOpenAddEmployee?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSelectRequest,
  onNavigateToTab,
  onOpenAddEmployee
}) => {
  const { users, departments, leaveTypes, leaveRequests, attendance, auditLogs } = useData();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDefaultRole, setCreateDefaultRole] = useState<Role>('EMPLOYEE');

  const today = new Date().toISOString().split('T')[0];

  // 5 Required KPI Metrics
  const totalEmployees = users.length;
  const managersCount = users.filter(u => u.role === 'MANAGER').length;
  const totalDepartments = departments.length;
  const pendingRequests = leaveRequests.filter(r => r.status === 'PENDING');
  const employeesOnLeave = leaveRequests.filter(
    r => r.status === 'APPROVED' && r.startDate <= today && r.endDate >= today
  );

  // Attendance metrics
  const todayAttendance = attendance.filter(a => a.date === today);
  const presentCount = todayAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const lateCount = todayAttendance.filter(a => a.status === 'LATE').length;

  const handleOpenProvision = (role: Role = 'EMPLOYEE') => {
    setCreateDefaultRole(role);
    setIsCreateModalOpen(true);
  };

  // Recent system activity
  const recentLogs = [...auditLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">

      {/* Enterprise Admin Console Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs mb-1">
            <Shield className="w-4 h-4" />
            <span>Administrator Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Organization Governance & Oversight
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage personnel directory, organizational departments, leave policy quotas, and system audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleOpenProvision('EMPLOYEE')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer tap-active"
            id="admin-add-emp-cta"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Employee</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenProvision('MANAGER')}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer tap-active border border-slate-200"
            id="admin-add-mgr-cta"
          >
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>+ Add Manager</span>
          </button>
        </div>
      </div>

      {/* 5 Required Dashboard KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Employees */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Employees
            </span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalEmployees}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Active workforce</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Directory</span>
            <button
              type="button"
              onClick={() => onNavigateToTab('employees')}
              className="font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>
        </div>

        {/* Card 2: Managers */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Managers
            </span>
            <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{managersCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Team leadership</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Ratio</span>
            <span className="font-bold text-slate-700">
              1 : {Math.round(totalEmployees / Math.max(1, managersCount))}
            </span>
          </div>
        </div>

        {/* Card 3: Departments */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Departments
            </span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalDepartments}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Org divisions</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Configured</span>
            <button
              type="button"
              onClick={() => onNavigateToTab('departments')}
              className="font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Manage
            </button>
          </div>
        </div>

        {/* Card 4: Pending Requests */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Requests
            </span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{pendingRequests.length}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">System approvals</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Status</span>
            <button
              type="button"
              onClick={() => onNavigateToTab('approvals')}
              className={`font-bold hover:underline cursor-pointer flex items-center gap-1 ${pendingRequests.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}
              id="admin-kpi-approvals-btn"
            >
              <span>{pendingRequests.length > 0 ? `${pendingRequests.length} Pending` : 'All Clear'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 5: Employees On Leave */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              On Leave Today
            </span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{employeesOnLeave.length}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Approved absent</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Absence Rate</span>
            <span className="font-bold text-slate-700">
              {totalEmployees > 0 ? `${Math.round((employeesOnLeave.length / totalEmployees) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

      </div>

      {/* Analytics Grid: 4 Required Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Leave Utilization (6 Cols) */}
        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Leave Utilization by Category</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('policies')}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Policies
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {leaveTypes.map(lt => {
              const matchingReqs = leaveRequests.filter(r => r.leaveTypeId === lt.id && r.status === 'APPROVED');
              const daysUsed = matchingReqs.reduce((sum, r) => sum + r.numberOfDays, 0);
              const totalQuota = lt.maxDaysPerYear * totalEmployees;
              const percent = totalQuota > 0 ? Math.min(100, Math.round((daysUsed / totalQuota) * 100)) : 0;

              return (
                <div key={lt.id} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lt.color }} />
                      <span className="font-bold text-slate-900">{lt.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {daysUsed} days availed ({percent}% used)
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(6, percent)}%`,
                        backgroundColor: lt.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Department Distribution (6 Cols) */}
        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Department Staffing Distribution</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('departments')}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {departments.map(d => {
              const deptEmployees = users.filter(u => u.departmentId === d.id);
              const percent = totalEmployees > 0 ? Math.round((deptEmployees.length / totalEmployees) * 100) : 0;

              return (
                <div key={d.id} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{d.name}</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                        {d.code}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {deptEmployees.length} personnel ({percent}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                      style={{ width: `${Math.max(8, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Attendance Overview (6 Cols) */}
        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Today's Attendance Overview</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">{today}</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
              <span className="text-2xl font-black text-emerald-700">{presentCount}</span>
              <span className="text-[11px] font-bold text-emerald-800 block mt-0.5">Clocked In</span>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-center">
              <span className="text-2xl font-black text-amber-700">{lateCount}</span>
              <span className="text-[11px] font-bold text-amber-800 block mt-0.5">Late Entries</span>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-center">
              <span className="text-2xl font-black text-rose-700">{employeesOnLeave.length}</span>
              <span className="text-[11px] font-bold text-rose-800 block mt-0.5">Approved Away</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">Company Attendance Rate:</span>
            <span className="font-bold text-emerald-700 font-mono">
              {totalEmployees > 0 ? `${Math.round((presentCount / totalEmployees) * 100)}%` : '100%'}
            </span>
          </div>
        </div>

        {/* 4. Recent System Activity (6 Cols) */}
        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Recent System Activity</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('audit')}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Audit Trail
            </button>
          </div>

          <div className="space-y-2.5">
            {recentLogs.map(log => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5 truncate mr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.userName}</span>
                    <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Provision Employee / Manager Modal */}
      <CreateEmployeeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultRole={createDefaultRole}
      />

    </div>
  );
};
