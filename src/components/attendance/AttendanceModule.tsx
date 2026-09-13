import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import { Clock, CheckCircle2, AlertTriangle, UserCheck, Search, Calendar, ArrowRight } from 'lucide-react';

export const AttendanceModule: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const { attendance, checkIn, checkOut } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  if (!currentUser) return null;

  const today = new Date().toISOString().split('T')[0];
  const myAttendanceToday = attendance.find(a => a.employeeId === currentUser.id && a.date === today);
  const isCheckedIn = !!myAttendanceToday?.checkInTime && !myAttendanceToday?.checkOutTime;

  // Filter attendance logs
  const filteredAttendance = attendance.filter(rec => {
    // If regular employee, show only their records
    if (currentRole === 'EMPLOYEE' && rec.employeeId !== currentUser.id) {
      return false;
    }

    const matchesSearch = rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !selectedDate || rec.date === selectedDate;

    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6">

      {/* Clock-In Interactive Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white shadow-xl border border-indigo-800/80 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -translate-y-12 translate-x-12" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs mb-1">
            <Clock className="w-4 h-4" /> Daily Attendance Ledger
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Attendance & Time Clock</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Clock in/out daily to log working hours, track late mark minutes, and view monthly time sheets.
          </p>
        </div>

        {/* Live Clock Card */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shrink-0">
          <div>
            <div className="text-[10px] uppercase font-extrabold tracking-wider text-slate-300">Today's Status</div>
            <div className="text-sm sm:text-base font-black text-white mt-0.5">
              {myAttendanceToday?.checkInTime
                ? `Clocked In: ${myAttendanceToday.checkInTime}`
                : 'Not Checked In'}
            </div>
            {myAttendanceToday?.lateMinutes && myAttendanceToday.lateMinutes > 0 ? (
              <div className="text-[11px] text-amber-300 font-bold mt-0.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-300" />
                <span>Late Entry (+{myAttendanceToday.lateMinutes} mins)</span>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => {
              if (isCheckedIn) checkOut(currentUser.id);
              else checkIn(currentUser.id, currentUser.name);
            }}
            className={`w-full sm:w-auto px-6 py-3 font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer tap-active flex items-center justify-center gap-2 ${
              isCheckedIn
                ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
            id="attendance-clock-btn"
          >
            <Clock className="w-4 h-4" />
            <span>{isCheckedIn ? 'Clock Out Now' : 'Clock In Now'}</span>
          </button>
        </div>
      </div>

      {/* Attendance Register Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        
        {/* Filter controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-slate-50/50">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Attendance Log Ledger</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentRole === 'EMPLOYEE' ? 'Your attendance history' : 'Company-wide attendance records'} • Showing {filteredAttendance.length} records
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            {currentRole !== 'EMPLOYEE' && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter employee..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full sm:w-48 pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  id="att-search-input"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-bold text-slate-700"
                id="att-date-filter"
              />
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate('')}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Empty state */}
        {filteredAttendance.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-2.5 opacity-30 text-slate-500" />
            <p className="text-xs font-bold text-slate-600">No attendance records found.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Records will appear once attendance is logged.</p>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW (< md): Responsive Attendance Ledger Cards */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredAttendance.map(a => (
                <div key={a.id} className="p-4 space-y-2.5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="font-extrabold text-slate-900 text-sm">{formatDate(a.date)}</div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                        a.status === 'PRESENT'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : a.status === 'LATE'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {a.status} {a.lateMinutes ? `(+${a.lateMinutes}m)` : ''}
                    </span>
                  </div>

                  {currentRole !== 'EMPLOYEE' && (
                    <div className="text-xs font-bold text-slate-700">{a.employeeName}</div>
                  )}

                  <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-100/80">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">In</span>
                      <span className="font-mono font-bold text-slate-800">{a.checkInTime || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Out</span>
                      <span className="font-mono font-bold text-slate-800">{a.checkOutTime || '-'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Hours</span>
                      <span className="font-extrabold text-sky-700">{a.totalHours ? `${a.totalHours} hrs` : '-'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW (>= md): Full Ledger Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Check In</th>
                    <th className="py-3 px-4">Check Out</th>
                    <th className="py-3 px-4 text-center">Logged Hours</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttendance.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{formatDate(a.date)}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{a.employeeName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{a.checkInTime || '-'}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{a.checkOutTime || '-'}</td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-sky-700">
                        {a.totalHours ? `${a.totalHours} hrs` : '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            a.status === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : a.status === 'LATE'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {a.status} {a.lateMinutes ? `(+${a.lateMinutes}m)` : ''}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>

    </div>
  );
};
