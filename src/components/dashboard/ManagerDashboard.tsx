import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { LeaveRequest } from '../../types';
import { formatDate } from '../../utils/helpers';
import {
  Users,
  CheckSquare,
  UserCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  Clock,
  X,
  Trash2
} from 'lucide-react';

interface ManagerDashboardProps {
  onSelectRequest: (request: LeaveRequest) => void;
  onNavigateToTab: (tab: string) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  onSelectRequest,
  onNavigateToTab
}) => {
  const { currentUser, currentRole } = useAuth();
  const { users, leaveRequests, attendance, reviewLeaveRequest, deleteLeaveRequest } = useData();

  // Rejection comment modal state
  const [rejectingRequest, setRejectingRequest] = useState<LeaveRequest | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [rejectError, setRejectError] = useState('');

  if (!currentUser) return null;

  // Filter team members managed by this user (strictly subordinate EMPLOYEES, excluding self and other managers)
  const teamUsers = users.filter(
    u => u.id !== currentUser.id && u.role === 'EMPLOYEE' && (u.managerId === currentUser.id || u.departmentId === currentUser.departmentId)
  );
  const teamUserIds = new Set(teamUsers.map(u => u.id));

  // Team leave requests: strictly for subordinate employees
  // When a manager applies for leave, the approval is routed to the Admin portal, NOT the manager portal!
  const teamRequests = leaveRequests.filter(r => {
    const requester = users.find(u => u.id === r.employeeId);
    return teamUserIds.has(r.employeeId) && requester?.role === 'EMPLOYEE';
  });
  const pendingRequests = teamRequests.filter(r => r.status === 'PENDING');

  const today = new Date().toISOString().split('T')[0];
  const onLeaveToday = teamRequests.filter(
    r => r.status === 'APPROVED' && r.startDate <= today && r.endDate >= today
  );

  const teamAttendanceToday = attendance.filter(a => teamUserIds.has(a.employeeId) && a.date === today);
  const presentCount = teamAttendanceToday.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const absentCount = Math.max(0, teamUsers.length - presentCount - onLeaveToday.length);

  // Dynamic greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = currentUser.name.split(' ')[0] || 'Alex';

  // Overlap calculation helper
  const checkOverlap = (req: LeaveRequest) => {
    return teamRequests.some(
      other =>
        other.id !== req.id &&
        other.status === 'APPROVED' &&
        other.startDate <= req.endDate &&
        other.endDate >= req.startDate
    );
  };

  const handleApprove = (req: LeaveRequest) => {
    reviewLeaveRequest(
      req.id,
      'APPROVED',
      currentUser.id,
      currentUser.name,
      'MANAGER',
      'Approved by department manager'
    );
  };

  const handleOpenReject = (req: LeaveRequest) => {
    setRejectingRequest(req);
    setRejectRemarks('');
    setRejectError('');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectRemarks.trim()) {
      setRejectError('Please provide an explanation/comment for rejecting this application.');
      return;
    }

    if (rejectingRequest) {
      reviewLeaveRequest(
        rejectingRequest.id,
        'REJECTED',
        currentUser.id,
        currentUser.name,
        'MANAGER',
        rejectRemarks.trim()
      );
      setRejectingRequest(null);
      setRejectRemarks('');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Greeting & Overview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {timeGreeting}, {firstName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here's what's happening with your team.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToTab('approvals')}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer tap-active"
          id="mgr-view-approvals-tab-btn"
        >
          <CheckSquare className="w-4 h-4" />
          <span>Full Approvals Queue ({pendingRequests.length})</span>
        </button>
      </div>

      {/* 4 Required KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Pending Approvals */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{pendingRequests.length}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Requires your decision</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Action status</span>
            <span className={`font-bold ${pendingRequests.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {pendingRequests.length > 0 ? 'Action Required' : 'All Clear'}
            </span>
          </div>
        </div>

        {/* Card 2: Team Members */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Team Members
            </span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{teamUsers.length}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Assigned department staff</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Department</span>
            <span className="font-bold text-slate-700 font-mono">
              {currentUser.departmentId || 'ENG'}
            </span>
          </div>
        </div>

        {/* Card 3: On Leave Today */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              On Leave Today
            </span>
            <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{onLeaveToday.length}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Approved absent personnel</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Absence Rate</span>
            <span className="font-bold text-slate-700">
              {teamUsers.length > 0 ? `${Math.round((onLeaveToday.length / teamUsers.length) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        {/* Card 4: Present Today */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Present Today
            </span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {presentCount} <span className="text-xs text-slate-400 font-normal">/ {teamUsers.length}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Clocked in today</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Attendance Rate</span>
            <span className="font-bold text-emerald-600">
              {teamUsers.length > 0 ? `${Math.round((presentCount / teamUsers.length) * 100)}%` : '100%'}
            </span>
          </div>
        </div>

      </div>

      {/* Main Section: Approval Queue */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Pending Approval Queue</h3>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            {pendingRequests.length} Pending
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No pending leave requests awaiting approval. Your queue is clean!
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map(req => {
              const hasOverlap = checkOverlap(req);

              return (
                <div
                  key={req.id}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3.5"
                >
                  {/* Row 1: Avatar, Name, Leave Type & Dates */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                        {req.employeeName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{req.employeeName}</h4>
                          <span className="text-[10px] font-mono text-slate-400 font-semibold">{req.requestNo}</span>
                        </div>
                        <p className="text-xs text-slate-500">{req.departmentName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {req.leaveTypeName}
                      </span>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {req.numberOfDays} {req.numberOfDays === 1 ? 'Working Day' : 'Working Days'}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Dates & Reason */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Requested Duration</span>
                      <span className="font-semibold text-slate-800">
                        {formatDate(req.startDate)} → {formatDate(req.endDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Reason</span>
                      <span className="text-slate-700 italic">"{req.reason}"</span>
                    </div>
                  </div>

                  {/* Overlap Warning Indicator */}
                  {hasOverlap && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800 font-medium">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Scheduling Conflict Notice:</strong> One or more department team members are already approved for time off during these dates.
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onSelectRequest(req)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 tap-active"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to permanently delete leave request ${req.requestNo} for ${req.employeeName}? This will restore allocated leave balances.`)) {
                          deleteLeaveRequest(req.id, currentUser?.id, currentUser?.name, currentRole);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 tap-active"
                      id={`mgr-delete-btn-${req.id}`}
                      title="Delete request"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenReject(req)}
                      className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 tap-active"
                      id={`reject-btn-${req.id}`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(req)}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1 tap-active"
                      id={`approve-btn-${req.id}`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Request</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Team Availability & Calendar Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Team Availability Status (6 Cols) */}
        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Team Availability Today</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">{today}</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
              <span className="text-2xl font-black text-emerald-700">{presentCount}</span>
              <span className="text-[11px] font-bold text-emerald-800 block mt-0.5">Present</span>
            </div>

            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
              <span className="text-2xl font-black text-indigo-700">{onLeaveToday.length}</span>
              <span className="text-[11px] font-bold text-indigo-800 block mt-0.5">On Leave</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-2xl font-black text-slate-700">{absentCount}</span>
              <span className="text-[11px] font-bold text-slate-600 block mt-0.5">Absent / Out</span>
            </div>
          </div>

          {/* Members list preview */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Staff Members
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {teamUsers.slice(0, 5).map(member => {
                const isMemberPresent = teamAttendanceToday.some(
                  a => a.employeeId === member.id && (a.status === 'PRESENT' || a.status === 'LATE')
                );
                const isMemberOnLeave = onLeaveToday.some(r => r.employeeId === member.id);

                return (
                  <div
                    key={member.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">{member.name}</span>
                        <span className="text-[10px] text-slate-400">{member.designation}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isMemberOnLeave
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : isMemberPresent
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isMemberOnLeave ? 'On Leave' : isMemberPresent ? 'Present' : 'Not Clocked In'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Team Calendar & Quick Jump (6 Cols) */}
        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">Upcoming Team Leave Schedule</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('calendar')}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Approved scheduled absences across the team for future workload planning:
            </p>

            <div className="space-y-2">
              {teamRequests
                .filter(r => r.status === 'APPROVED' && r.startDate > today)
                .slice(0, 4)
                .map(r => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{r.employeeName}</div>
                      <div className="text-[11px] text-slate-500">{r.leaveTypeName} • {r.numberOfDays} days</div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                      {formatDate(r.startDate)}
                    </span>
                  </div>
                ))}
              {teamRequests.filter(r => r.status === 'APPROVED' && r.startDate > today).length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                  No upcoming scheduled leaves recorded for the department.
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('calendar')}
            className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 mt-2"
          >
            <span>Open Interactive Team Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Reject Remarks Modal */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Provide Rejection Reason</h3>
                <p className="text-xs text-slate-500">
                  Request #{rejectingRequest.requestNo} by {rejectingRequest.employeeName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {rejectError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {rejectError}
              </div>
            )}

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Explanation / Remarks for Employee *
                </label>
                <textarea
                  rows={3}
                  value={rejectRemarks}
                  onChange={e => setRejectRemarks(e.target.value)}
                  placeholder="e.g. Critical project milestone scheduled on these dates; please reschedule or coordinate with alternate teammate..."
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingRequest(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
