import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatDate } from '../../utils/helpers';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, List, Grid, Sun, Palmtree } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';

export const TeamCalendar: React.FC = () => {
  const { leaveRequests, holidays, addHoliday, deleteHoliday } = useData();
  const { currentRole } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026
  const [mobileView, setMobileView] = useState<'GRID' | 'LIST'>('GRID');
  const [isAddHolidayOpen, setIsAddHolidayOpen] = useState(false);

  // New Holiday form state
  const [holTitle, setHolTitle] = useState('');
  const [holDate, setHolDate] = useState('');
  const [holType, setHolType] = useState<'NATIONAL' | 'FESTIVAL' | 'COMPANY'>('NATIONAL');
  const [holDesc, setHolDesc] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleCreateHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holTitle || !holDate) return;

    const dayName = new Date(holDate).toLocaleDateString('en-US', { weekday: 'long' });

    addHoliday({
      title: holTitle,
      date: holDate,
      dayOfWeek: dayName,
      type: holType,
      description: holDesc || holTitle,
      isMandatory: true
    });

    setHolTitle('');
    setHolDate('');
    setHolDesc('');
    setIsAddHolidayOpen(false);
  };

  // Helper to check leaves on a specific date
  const getLeavesForDate = (dateStr: string) => {
    return leaveRequests.filter(
      r => r.status === 'APPROVED' && r.startDate <= dateStr && r.endDate >= dateStr
    );
  };

  // Helper to check holidays on a specific date
  const getHolidayForDate = (dateStr: string) => {
    return holidays.find(h => h.date === dateStr);
  };

  const calendarGrid = [];
  // Empty padding cells before month start
  for (let i = 0; i < firstDayIndex; i++) {
    calendarGrid.push(null);
  }
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarGrid.push(day);
  }

  // Generate list of items for the active month for List View
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthHolidays = holidays.filter(h => h.date.startsWith(monthPrefix));
  const monthLeaves = leaveRequests.filter(
    r => r.status === 'APPROVED' && (r.startDate.startsWith(monthPrefix) || r.endDate.startsWith(monthPrefix))
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
            <CalendarIcon className="w-5 h-5 text-sky-600" />
            Team Calendar & Company Holidays
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visual schedule showing team absences, approved leaves, and official company holidays.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile View Toggle Switch */}
          <div className="flex md:hidden bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setMobileView('GRID')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                mobileView === 'GRID' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileView('LIST')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                mobileView === 'LIST' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          {currentRole === 'ADMIN' && (
            <button
              type="button"
              onClick={() => setIsAddHolidayOpen(true)}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer tap-active"
              id="add-holiday-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Add Holiday</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Interactive Calendar Grid or Mobile List View */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
          
          {/* Calendar Month Controls */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              {monthNames[month]} {year}
            </h3>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer tap-active"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(new Date(2026, 7, 1))}
                className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer tap-active"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer tap-active"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MOBILE LIST VIEW (Shown on small screens when LIST view is toggled) */}
          {mobileView === 'LIST' ? (
            <div className="block md:hidden space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                {monthNames[month]} Schedule & Absences
              </h4>

              {monthHolidays.length === 0 && monthLeaves.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No holidays or scheduled leaves for {monthNames[month]} {year}.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Holidays in month */}
                  {monthHolidays.map(h => (
                    <div key={h.id} className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0">
                          <Sun className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">{h.title}</div>
                          <div className="text-[11px] text-rose-700 font-medium">
                            {formatDate(h.date)} • {h.dayOfWeek}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-900">
                        {h.type}
                      </span>
                    </div>
                  ))}

                  {/* Leaves in month */}
                  {monthLeaves.map(l => (
                    <div key={l.id} className="p-3.5 bg-sky-50/70 border border-sky-200/80 rounded-2xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0">
                          <Palmtree className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">{l.employeeName}</div>
                          <div className="text-[11px] text-sky-800 font-medium">
                            {formatDate(l.startDate)} → {formatDate(l.endDate)} ({l.numberOfDays}d)
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-200/70 text-sky-900">
                        {l.leaveTypeName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* CALENDAR GRID VIEW */
            <div>
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider py-1">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarGrid.map((dayNum, idx) => {
                  if (dayNum === null) {
                    return <div key={`empty-${idx}`} className="h-16 sm:h-24 bg-slate-50/40 rounded-xl border border-transparent" />;
                  }

                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const dayLeaves = getLeavesForDate(dateStr);
                  const holiday = getHolidayForDate(dateStr);
                  const isWeekend = (idx % 7 === 0) || (idx % 7 === 6);

                  return (
                    <div
                      key={`day-${dayNum}`}
                      className={`h-16 sm:h-24 p-1 sm:p-1.5 rounded-xl border flex flex-col justify-between transition-all overflow-hidden ${
                        holiday
                          ? 'bg-rose-50/80 border-rose-200'
                          : isWeekend
                          ? 'bg-slate-50/60 border-slate-100 text-slate-400'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] sm:text-xs font-black ${holiday ? 'text-rose-700' : 'text-slate-700'}`}>
                          {dayNum}
                        </span>
                        {holiday && (
                          <span className="text-[8px] sm:text-[9px] font-bold px-1 rounded bg-rose-100 text-rose-800 hidden sm:inline">
                            Holiday
                          </span>
                        )}
                      </div>

                      {/* Badges container */}
                      <div className="space-y-0.5 sm:space-y-1 overflow-y-auto max-h-10 sm:max-h-14">
                        {holiday && (
                          <div className="text-[8px] sm:text-[10px] font-bold text-rose-800 leading-tight truncate">
                            🎉 {holiday.title}
                          </div>
                        )}

                        {dayLeaves.map(l => (
                          <div
                            key={l.id}
                            className="text-[8px] sm:text-[9px] font-semibold bg-sky-100 text-sky-900 px-1 py-0.5 rounded truncate"
                            title={`${l.employeeName} (${l.leaveTypeName})`}
                          >
                            🌴 {l.employeeName.split(' ')[0]}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Col: Company Holidays Master List */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900">Annual Holidays List</h3>
            <span className="text-xs text-slate-400 font-mono font-bold">{holidays.length} Listed</span>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {holidays.map(h => (
              <div
                key={h.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-2 hover:bg-slate-100/70 transition-colors"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">{h.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {formatDate(h.date)} • {h.dayOfWeek}
                  </div>
                  <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {h.type}
                  </span>
                </div>

                {currentRole === 'ADMIN' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove holiday "${h.title}"?`)) {
                        deleteHoliday(h.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Remove Holiday"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal to Add New Holiday */}
      <Modal isOpen={isAddHolidayOpen} onClose={() => setIsAddHolidayOpen(false)} title="Add Official Holiday">
        <form onSubmit={handleCreateHoliday} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Holiday Title</label>
            <input
              type="text"
              value={holTitle}
              onChange={e => setHolTitle(e.target.value)}
              placeholder="e.g. Independence Day"
              className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Holiday Date</label>
              <input
                type="date"
                value={holDate}
                onChange={e => setHolDate(e.target.value)}
                className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none font-bold text-slate-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Holiday Category</label>
              <select
                value={holType}
                onChange={e => setHolType(e.target.value as any)}
                className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none font-bold text-slate-700"
              >
                <option value="NATIONAL">National Holiday</option>
                <option value="FESTIVAL">Festival Holiday</option>
                <option value="COMPANY">Company Holiday</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={holDesc}
              onChange={e => setHolDesc(e.target.value)}
              placeholder="Brief summary..."
              className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddHolidayOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer tap-active transition-all"
            >
              Save Holiday
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
