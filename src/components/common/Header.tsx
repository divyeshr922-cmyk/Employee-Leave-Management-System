import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Bell,
  Clock,
  Shield,
  Users,
  User as UserIcon,
  LogOut,
  Plus,
  UserPlus,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';

interface HeaderProps {
  onOpenApplyLeave: () => void;
  onOpenAddEmployee?: () => void;
  onSelectRequest?: (requestId: string) => void;
  onOpenLoginModal?: () => void;
  onNavigateToHome?: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenApplyLeave,
  onOpenAddEmployee,
  onSelectRequest,
  onOpenLoginModal,
  onNavigateToHome,
  isMobileMenuOpen,
  onToggleMobileMenu
}) => {
  const { currentUser, currentRole, logout } = useAuth();
  const { attendance, checkIn, checkOut, notifications } = useData();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split('T')[0];
  const userAttendanceToday = currentUser
    ? attendance.find(a => a.employeeId === currentUser.id && a.date === today)
    : null;

  const isCheckedIn = !!userAttendanceToday?.checkInTime && !userAttendanceToday?.checkOutTime;

  const unreadCount = currentUser
    ? notifications.filter(n => n.userId === currentUser.id && !n.isRead).length
    : 0;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleBadges = {
    EMPLOYEE: { label: 'Employee', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    MANAGER: { label: 'Manager', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    ADMIN: { label: 'Administrator', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="w-full px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1 sm:gap-4 min-w-0">
        
        {/* Left Side: Brand & Role */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">

          {/* Logo and App Title */}
          <div
            onClick={() => {
              window.history.pushState({}, '', '/');
              if (onNavigateToHome) onNavigateToHome();
            }}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none min-w-0"
            title="Workforce Management Home"
          >
            <div className="px-2.5 h-8 sm:h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs sm:text-sm tracking-wide shadow-xs transition-transform shrink-0 select-none">
              ELMS
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <div className="text-xs sm:text-base font-bold text-slate-900 tracking-tight leading-tight shrink-0 flex items-center gap-1">
                  <span>Workforce</span>
                  <span>Portal</span>
                </div>
                <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border shrink-0 ${roleBadges[currentRole]?.badge}`}>
                  {roleBadges[currentRole]?.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block whitespace-nowrap">
                Leave & Attendance Management System
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          
          {/* Daily Attendance Clock Widget (Compact for Staff on desktop) */}
          {currentUser && currentRole !== 'ADMIN' && (
            <div className="hidden lg:flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div className="text-left leading-none">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                  {isCheckedIn ? 'Checked In' : 'Attendance'}
                </span>
                <span className="text-[11px] font-semibold text-slate-800">
                  {userAttendanceToday?.checkInTime || 'Not In'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isCheckedIn) {
                    checkOut(currentUser.id);
                  } else {
                    checkIn(currentUser.id, currentUser.name);
                  }
                }}
                className={`ml-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer tap-active ${
                  isCheckedIn
                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                }`}
                id="header-checkin-btn"
              >
                {isCheckedIn ? 'Clock Out' : 'Clock In'}
              </button>
            </div>
          )}

          {/* Quick Action Button: + Add Employee for Admin, Apply Leave for Staff */}
          {currentRole === 'ADMIN' ? (
            <button
              type="button"
              onClick={onOpenAddEmployee || onOpenApplyLeave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold w-8 h-8 sm:w-auto p-0 sm:px-3.5 sm:py-2 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer tap-active shrink-0"
              id="header-add-employee-btn"
              title="Add Employee"
            >
              <UserPlus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">+ Add Employee</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenApplyLeave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold w-8 h-8 sm:w-auto p-0 sm:px-3.5 sm:py-2 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer tap-active shrink-0"
              id="header-apply-leave-btn"
              title="Apply Leave"
            >
              <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Apply Leave</span>
            </button>
          )}

          {/* Notifications Trigger */}
          <button
            type="button"
            onClick={() => setIsNotifOpen(true)}
            className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer tap-active shrink-0 border border-slate-200"
            id="header-notif-btn"
            aria-label="View notifications"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {/* User Profile & Role Dropdown */}
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1 sm:gap-2 p-1 sm:px-2 sm:py-1.5 hover:bg-slate-50 rounded-xl transition-all cursor-pointer border border-slate-200 tap-active shrink-0"
                id="header-user-menu-btn"
                aria-expanded={isProfileMenuOpen}
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-none">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">{roleBadges[currentRole]?.label}</div>
                </div>
                <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 transition-transform hidden xs:block ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-lg py-2 z-50 text-slate-700">
                  
                  {/* User Profile Summary */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      <span>{currentUser.designation}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                        window.history.pushState({}, '', '/');
                        if (onNavigateToHome) onNavigateToHome();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer tap-active"
                      id="header-signout-btn"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer px-3 py-1.5"
            >
              Sign In
            </button>
          )}

        </div>
      </div>

      {/* Notification Drawer Component */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onSelectRequest={onSelectRequest}
      />
    </header>
  );
};
