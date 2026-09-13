import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Calendar,
  Clock,
  Users,
  Building2,
  Sliders,
  BarChart3,
  ShieldCheck,
  Settings,
  PlusCircle,
  UserPlus,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenApplyLeave: () => void;
  onOpenAddEmployee?: () => void;
  pendingApprovalsCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenApplyLeave,
  onOpenAddEmployee,
  pendingApprovalsCount,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { currentRole, currentUser, logout } = useAuth();

  // Strict role-specific navigation mapping
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['EMPLOYEE', 'MANAGER', 'ADMIN']
    },
    {
      id: 'my_leaves',
      label: 'My Leaves',
      icon: FileText,
      roles: ['EMPLOYEE', 'MANAGER']
    },
    {
      id: 'approvals',
      label: currentRole === 'ADMIN' ? 'Leave Approvals' : 'Team Approvals',
      icon: CheckSquare,
      badge: pendingApprovalsCount,
      roles: ['MANAGER', 'ADMIN']
    },
    {
      id: 'calendar',
      label: 'Calendar & Holidays',
      icon: Calendar,
      roles: ['EMPLOYEE', 'MANAGER', 'ADMIN']
    },
    {
      id: 'attendance',
      label: 'Attendance Register',
      icon: Clock,
      roles: ['EMPLOYEE', 'MANAGER', 'ADMIN']
    },
    {
      id: 'employees',
      label: 'Employee Directory',
      icon: Users,
      roles: ['MANAGER', 'ADMIN']
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Building2,
      roles: ['ADMIN']
    },
    {
      id: 'policies',
      label: 'Leave Policies',
      icon: Sliders,
      roles: ['ADMIN']
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      roles: ['EMPLOYEE', 'MANAGER', 'ADMIN']
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      icon: ShieldCheck,
      roles: ['ADMIN']
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      roles: ['ADMIN']
    }
  ];

  // Filter items strictly by user's current authorized role
  const filteredNav = navItems.filter(item => item.roles.includes(currentRole));

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const roleLabels = {
    EMPLOYEE: 'Employee Portal',
    MANAGER: 'Manager Portal',
    ADMIN: 'Admin Console'
  };

  const renderContent = (isDesktop = false) => (
    <div className="flex flex-col h-full bg-white select-none">
      
      {/* Primary Action Button - Hidden on desktop view as requested */}
      {!isDesktop && (
        <div className="p-4 border-b border-slate-100">
          {currentRole === 'ADMIN' ? (
            <button
              type="button"
              onClick={() => {
                if (onOpenAddEmployee) {
                  onOpenAddEmployee();
                } else {
                  setActiveTab('employees');
                }
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-3 rounded-xl shadow-xs flex items-center justify-center gap-2 text-xs transition-all cursor-pointer tap-active"
              id="sidebar-add-employee-btn"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Employee</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onOpenApplyLeave();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-3 rounded-xl shadow-xs flex items-center justify-center gap-2 text-xs transition-all cursor-pointer tap-active"
              id="sidebar-apply-leave-btn"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Apply Leave</span>
            </button>
          )}
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto overscroll-contain">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          {roleLabels[currentRole]}
        </div>

        {filteredNav.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer tap-active ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-bold border-r-2 border-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              id={`nav-${item.id}`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-2xs">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Status & Sign Out Footer - Hidden on desktop view as requested */}
      {!isDesktop && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 mt-auto space-y-2">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser?.name.charAt(0) || 'U'}
              </div>
              <div className="truncate text-left">
                <span className="text-xs font-bold text-slate-800 block truncate">{currentUser?.name}</span>
                <span className="text-[10px] text-slate-400 capitalize block">{currentRole.toLowerCase()}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                logout();
                window.history.pushState({}, '', '/');
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Light surface, clean border) */}
      <aside className="w-60 bg-white flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-200 hidden md:flex">
        {renderContent(true)}
      </aside>

      {/* Mobile Slide-Out Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[80vw] bg-white flex flex-col h-full z-10 shadow-2xl border-r border-slate-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="px-2.5 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs tracking-wide shadow-xs shrink-0 select-none">
                  ELMS
                </div>
                <span className="font-bold text-slate-900 text-sm tracking-tight">Navigation</span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer tap-active"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
