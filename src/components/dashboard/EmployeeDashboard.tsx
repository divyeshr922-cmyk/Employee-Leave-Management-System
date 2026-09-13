import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { LeaveRequest } from '../../types';
import { formatDate } from '../../utils/helpers';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Sun,
  Eye,
  Briefcase
} from 'lucide-react';

interface EmployeeDashboardProps {
  onOpenApplyLeave: () => void;
  onSelectRequest: (request: LeaveRequest) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  onOpenApplyLeave,
  onSelectRequest
}) => {
  const { currentUser } = useAuth();
  const { leaveBalances, leaveRequests, attendance, holidays, checkIn, checkOut } = useData();

  // Live time ticker
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser) return null;

  // Filter employee data
  const myBalances = leaveBalances.filter(b => b.employeeId === currentUser.id);
  const myRequests = leaveRequests.filter(r => r.employeeId === currentUser.id);
  const pendingRequests = myRequests.filter(r => r.status === 'PENDING');

  // Specific balances
  const casualBal = myBalances.find(b => b.leaveTypeCode === 'CL') || {
    remaining: 10,
    used: 2,
    allocated: 12,
    pending: 0
  };
  const sickBal = myBalances.find(b => b.leaveTypeCode === 'SL') || {
    remaining: 8,
    used: 2,
    allocated: 10,
    pending: 0
  };
  const earnedBal = myBalances.find(b => b.leaveTypeCode === 'EL') || {
    remaining: 14,
    used: 1,
    allocated: 15,
    pending: 0
  };

  const today = new Date().toISOString().split('T')[0];
  const userAttendanceToday = attendance.find(a => a.employeeId === currentUser.id && a.date === today);
  const isCheckedIn = !!userAttendanceToday?.checkInTime && !userAttendanceToday?.checkOutTime;
  const isLate = userAttendanceToday?.status === 'LATE';

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = currentUser.name.split(' ')[0] || 'Sarah';

  // Upcoming holidays
  const upcomingHolidays = holidays
    .filter(h => new Date(h.date) >= new Date())
    .slice(0, 4);

  // Recent 5 leave applications
  const recentRequests = [...myRequests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Monthly activity data
  const monthlyActivity = [
    { month: 'Jan', days: 1 },
    { month: 'Feb', days: 0 },
    { month: 'Mar', days: 2 },
    { month: 'Apr', days: 1 },
    { month: 'May', days: 0 },
    { month: 'Jun', days: 3 },
    { month: 'Jul', days: 0 },
    { month: 'Aug', days: 1 },
    { month: 'Sep', days: 2 },
    { month: 'Oct', days: 0 },
    { month: 'Nov', days: 0 },
    { month: 'Dec', days: 0 }
  ];

  return (
    <div className="space-y-6">

      {/* Header Greeting & Primary Action */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
            {timeGreeting}, {firstName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 truncate">
            Here's your leave and attendance overview.
          </p>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={onOpenApplyLeave}
            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer tap-active"
            id="dash-apply-leave-btn"
          >
            <Plus className="w-4 h-4" />
            <span>+ Apply Leave</span>
          </button>
        </div>
      </div>

      {/* 4 Required KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 min-w-0">
        
        {/* Card 1: Casual Leave */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Casual Leave
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              CL
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">{casualBal.remaining}</span>
              <span className="text-xs text-slate-400 font-medium">/ {casualBal.allocated} days left</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{casualBal.used} days used this year</p>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((casualBal.used / casualBal.allocated) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{Math.round((casualBal.used / casualBal.allocated) * 100)}% consumed</span>
              <span>{casualBal.remaining} available</span>
            </div>
          </div>
        </div>

        {/* Card 2: Sick Leave */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sick Leave
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
              SL
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">{sickBal.remaining}</span>
              <span className="text-xs text-slate-400 font-medium">/ {sickBal.allocated} days left</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{sickBal.used} days used this year</p>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((sickBal.used / sickBal.allocated) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{Math.round((sickBal.used / sickBal.allocated) * 100)}% consumed</span>
              <span>{sickBal.remaining} available</span>
            </div>
          </div>
        </div>

        {/* Card 3: Earned Leave */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Earned Leave
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
              EL
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">{earnedBal.remaining}</span>
              <span className="text-xs text-slate-400 font-medium">/ {earnedBal.allocated} days left</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{earnedBal.used} days used this year</p>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((earnedBal.used / earnedBal.allocated) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{Math.round((earnedBal.used / earnedBal.allocated) * 100)}% consumed</span>
              <span>{earnedBal.remaining} available</span>
            </div>
          </div>
        </div>

        {/* Card 4: Pending Requests */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Requests
            </span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">{pendingRequests.length}</span>
              <span className="text-xs text-slate-400 font-medium">requests awaiting</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Manager review in progress</p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500">Status</span>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {pendingRequests.length > 0 ? 'Under Review' : 'Queue Clear'}
            </span>
          </div>
        </div>

      </div>

      {/* Attendance Section & Monthly Leave Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 min-w-0">
        
        {/* Attendance Section (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 min-w-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
              <h3 className="font-bold text-sm text-slate-900 truncate">Today's Attendance</h3>
            </div>
            {isLate && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                Late Entry
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 min-w-0">
            <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-100 min-w-0 overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Status</span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-900 mt-0.5 flex items-center gap-1.5 truncate">
                <span className={`w-2 h-2 rounded-full shrink-0 ${isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                <span className="truncate">{isCheckedIn ? 'Present (In)' : userAttendanceToday?.checkOutTime ? 'Completed (Out)' : 'Not Clocked In'}</span>
              </span>
            </div>

            <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-100 min-w-0 overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Current Time</span>
              <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-900 mt-0.5 block truncate">
                {currentTime}
              </span>
            </div>

            <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-100 min-w-0 overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Check In Time</span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-900 mt-0.5 block truncate">
                {userAttendanceToday?.checkInTime || '—'}
              </span>
            </div>

            <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-100 min-w-0 overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Working Hours</span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-900 mt-0.5 block truncate">
                {userAttendanceToday?.totalHours || (isCheckedIn ? 'In Progress' : '0.0 hrs')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (isCheckedIn) checkOut(currentUser.id);
              else checkIn(currentUser.id, currentUser.name);
            }}
            className={`w-full py-2.5 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer tap-active flex items-center justify-center gap-2 ${
              isCheckedIn
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
            }`}
            id="dash-clock-action-btn"
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span className="truncate">{isCheckedIn ? 'Clock Out for the Day' : 'Clock In for Today'}</span>
          </button>
        </div>

        {/* Monthly Leave Visualization (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4 min-w-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-slate-900 truncate">Leave Activity by Month</h3>
              <p className="text-[11px] text-slate-500 truncate">Days of approved absence taken across the calendar year</p>
            </div>
            <span className="text-xs font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 shrink-0">
              2026
            </span>
          </div>

          {/* Simple Clean Responsive Bar Chart */}
          <div className="grid grid-cols-12 gap-0.5 sm:gap-1.5 items-end h-32 pt-4 min-w-0 w-full">
            {monthlyActivity.map((item, idx) => {
              const heightPercent = item.days > 0 ? Math.min(100, item.days * 28 + 15) : 8;
              return (
                <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end group min-w-0">
                  <div className="w-full flex justify-center">
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 group-hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
                      {item.days}d
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-t-sm sm:rounded-t-md h-full flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-sm sm:rounded-t-md transition-all duration-300 ${
                        item.days > 0 ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-semibold text-slate-500 tracking-tight sm:tracking-normal text-center truncate w-full block select-none">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-[10px] sm:text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Total days availed YTD: <strong className="text-slate-700">{casualBal.used + sickBal.used + earnedBal.used} days</strong></span>
            <span>Annual quota: <strong className="text-slate-700">{casualBal.allocated + sickBal.allocated + earnedBal.allocated} days</strong></span>
          </div>
        </div>

      </div>

      {/* Main Bottom Section: Recent Leave Requests + Upcoming Holidays */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 min-w-0">
        
        {/* Left 8 Cols: Recent Leave Requests */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 min-w-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <h3 className="font-bold text-sm text-slate-900 truncate">Recent Leave Requests</h3>
            <span className="text-xs text-slate-500 shrink-0">{myRequests.length} applications</span>
          </div>

          {recentRequests.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No leave requests submitted yet. Click "+ Apply Leave" to request time off.
            </div>
          ) : (
            <div className="space-y-2.5 min-w-0">
              {recentRequests.map(req => {
                const statusBadge =
                  req.status === 'APPROVED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : req.status === 'REJECTED'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : req.status === 'CANCELLED'
                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <div
                    key={req.id}
                    className="p-3 sm:p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 min-w-0"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                        <span className="text-xs font-bold text-slate-900 truncate">{req.leaveTypeName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${statusBadge}`}>
                          {req.status}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 font-mono shrink-0">
                          ({req.numberOfDays} {req.numberOfDays === 1 ? 'day' : 'days'})
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {formatDate(req.startDate)} → {formatDate(req.endDate)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => onSelectRequest(req)}
                        className="px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 tap-active"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 4 Cols: Upcoming Holidays */}
        <div className="lg:col-span-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 min-w-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
              <h3 className="font-bold text-sm text-slate-900 truncate">Upcoming Holidays</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-bold shrink-0">2026</span>
          </div>

          <div className="space-y-2.5 min-w-0">
            {upcomingHolidays.map(hol => (
              <div
                key={hol.id}
                className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 min-w-0"
              >
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 truncate">{hol.title}</div>
                  <div className="text-[11px] text-slate-500 truncate">{hol.dayOfWeek}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] sm:text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 block font-mono">
                    {hol.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
