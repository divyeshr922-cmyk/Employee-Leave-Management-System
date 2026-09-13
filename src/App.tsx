import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { EmployeeDashboard } from './components/dashboard/EmployeeDashboard';
import { ManagerDashboard } from './components/dashboard/ManagerDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { ApplyLeaveModal } from './components/leave/ApplyLeaveModal';
import { LeaveDetailModal } from './components/leave/LeaveDetailModal';
import { LeaveHistoryTable } from './components/leave/LeaveHistoryTable';
import { TeamCalendar } from './components/calendar/TeamCalendar';
import { AttendanceModule } from './components/attendance/AttendanceModule';
import { EmployeeManagement } from './components/employees/EmployeeManagement';
import { DepartmentManagement } from './components/departments/DepartmentManagement';
import { LeavePoliciesManagement } from './components/policies/LeavePoliciesManagement';
import { ReportsEngine } from './components/reports/ReportsEngine';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { SystemSettingsView } from './components/settings/SystemSettingsView';
import { LoginRegisterModal } from './components/auth/LoginRegisterModal';
import { LandingLoginPage } from './components/home/LandingLoginPage';
import { CreateEmployeeModal } from './components/employees/CreateEmployeeModal';
import { LeaveRequest } from './types';
import {
  Home,
  CheckSquare,
  Calendar,
  Clock,
  Users,
  Building2,
  Sliders,
  BarChart3,
  ShieldCheck,
  Settings
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const { leaveRequests, users } = useData();

  const [viewMode, setViewMode] = useState<'LANDING' | 'WORKSPACE'>('LANDING');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [isCreateEmployeeModalOpen, setIsCreateEmployeeModalOpen] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Automatically return to LANDING if user logs out
  useEffect(() => {
    if (!currentUser && viewMode === 'WORKSPACE') {
      setViewMode('LANDING');
    }
  }, [currentUser, viewMode]);

  // Enforce strict role-based access on active tab/page
  useEffect(() => {
    const adminOnlyTabs = ['departments', 'policies', 'audit', 'settings'];
    const managerOrAdminTabs = ['approvals', 'employees'];

    if (adminOnlyTabs.includes(activeTab) && currentRole !== 'ADMIN') {
      setActiveTab('dashboard');
    } else if (managerOrAdminTabs.includes(activeTab) && currentRole !== 'MANAGER' && currentRole !== 'ADMIN') {
      setActiveTab('dashboard');
    }
  }, [activeTab, currentRole]);

  // Guard URL-based portal routing: ensure URL matches authorized role
  useEffect(() => {
    const enforceUrlAuthorization = () => {
      if (viewMode !== 'WORKSPACE' || !currentUser) return;
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      const isAdminUrl = path === '/admin' || path.startsWith('/admin/') || hash.includes('admin') || search.includes('admin');
      const isManagerUrl = path === '/manager' || path.startsWith('/manager/') || hash.includes('manager') || search.includes('manager');

      if (isAdminUrl && currentRole !== 'ADMIN') {
        window.history.replaceState({}, '', '/');
        setActiveTab('dashboard');
      } else if (isManagerUrl && currentRole === 'EMPLOYEE') {
        window.history.replaceState({}, '', '/');
        setActiveTab('dashboard');
      }
    };

    enforceUrlAuthorization();
    window.addEventListener('popstate', enforceUrlAuthorization);
    return () => window.removeEventListener('popstate', enforceUrlAuthorization);
  }, [viewMode, currentUser, currentRole]);

  // Count pending approvals for badge in sidebar
  // Subordinate employees reporting to this manager (strictly excludes self and other managers)
  const teamUserIds = new Set(
    users
      .filter(u => u.id !== currentUser?.id && u.role === 'EMPLOYEE' && (u.managerId === currentUser?.id || u.departmentId === currentUser?.departmentId))
      .map(u => u.id)
  );

  // When manager applies for leave, the approval goes to Admin portal!
  // Admin sees ALL pending requests (including managers and employees).
  // Manager ONLY sees pending requests from subordinate employees.
  const pendingCount = leaveRequests.filter(r => {
    if (r.status !== 'PENDING') return false;
    if (currentRole === 'ADMIN') return true;
    if (currentRole === 'MANAGER') {
      const requester = users.find(u => u.id === r.employeeId);
      return requester?.role === 'EMPLOYEE' && teamUserIds.has(r.employeeId);
    }
    return false;
  }).length;

  const handleSelectRequestById = (requestId: string) => {
    const found = leaveRequests.find(r => r.id === requestId);
    if (found) {
      setSelectedRequest(found);
    }
  };

  const myRequests = currentUser
    ? leaveRequests.filter(r => r.employeeId === currentUser.id)
    : [];

  // Team requests queue: For Admin, show all organization requests. For Manager, only subordinate employees.
  const teamRequests = currentRole === 'ADMIN'
    ? leaveRequests
    : leaveRequests.filter(r => {
        const requester = users.find(u => u.id === r.employeeId);
        return requester?.role === 'EMPLOYEE' && teamUserIds.has(r.employeeId);
      });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-600 selection:text-white">
      
      {/* Workspace Top Navigation Header - Rendered only inside Workspace */}
      {viewMode === 'WORKSPACE' && (
        <Header
          onOpenApplyLeave={() => {
            setIsApplyModalOpen(true);
          }}
          onOpenAddEmployee={() => setIsCreateEmployeeModalOpen(true)}
          onSelectRequest={handleSelectRequestById}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onNavigateToHome={() => {
            window.history.pushState({}, '', '/');
            setViewMode('LANDING');
          }}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
      )}

      <AnimatePresence mode="wait">
        {viewMode === 'LANDING' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <LandingLoginPage
              onNavigateToDashboard={() => {
                setViewMode('WORKSPACE');
                setActiveTab('dashboard');
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="workspace"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="flex-1 w-full flex min-w-0 pb-16 md:pb-8"
          >
            {/* Navigation Sidebar */}
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenApplyLeave={() => setIsApplyModalOpen(true)}
              onOpenAddEmployee={() => setIsCreateEmployeeModalOpen(true)}
              pendingApprovalsCount={pendingCount}
              isMobileOpen={isMobileMenuOpen}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />

            {/* Main View Area with Mobile-Responsive Padding & Bottom Breathing Room */}
            <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-12 overflow-y-auto min-w-0">
              
              {activeTab === 'dashboard' && (
                <motion.div
                  key={`dash-${currentRole}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {currentRole === 'EMPLOYEE' && (
                    <EmployeeDashboard
                      onOpenApplyLeave={() => setIsApplyModalOpen(true)}
                      onSelectRequest={setSelectedRequest}
                    />
                  )}
                  {currentRole === 'MANAGER' && (
                    <ManagerDashboard
                      onSelectRequest={setSelectedRequest}
                      onNavigateToTab={setActiveTab}
                      onOpenApplyLeave={() => setIsApplyModalOpen(true)}
                    />
                  )}
                  {currentRole === 'ADMIN' && (
                    <AdminDashboard
                      onSelectRequest={setSelectedRequest}
                      onNavigateToTab={setActiveTab}
                      onOpenAddEmployee={() => setIsCreateEmployeeModalOpen(true)}
                    />
                  )}
                </motion.div>
              )}

              {activeTab === 'my_leaves' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <LeaveHistoryTable
                    requests={myRequests}
                    onSelectRequest={setSelectedRequest}
                    title="My Leave History"
                    showEmployeeColumn={false}
                  />
                </motion.div>
              )}

              {activeTab === 'approvals' && (currentRole === 'MANAGER' || currentRole === 'ADMIN') && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <LeaveHistoryTable
                    requests={teamRequests}
                    onSelectRequest={setSelectedRequest}
                    title={currentRole === 'ADMIN' ? 'Organization Leave Approvals (Executive Review)' : 'Team Leave Approvals Queue'}
                    showEmployeeColumn={true}
                  />
                </motion.div>
              )}

              {activeTab === 'calendar' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <TeamCalendar />
                </motion.div>
              )}

              {activeTab === 'attendance' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <AttendanceModule />
                </motion.div>
              )}

              {activeTab === 'employees' && (currentRole === 'MANAGER' || currentRole === 'ADMIN') && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <EmployeeManagement />
                </motion.div>
              )}

              {activeTab === 'departments' && currentRole === 'ADMIN' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <DepartmentManagement />
                </motion.div>
              )}

              {activeTab === 'policies' && currentRole === 'ADMIN' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <LeavePoliciesManagement />
                </motion.div>
              )}

              {activeTab === 'reports' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <ReportsEngine />
                </motion.div>
              )}

              {activeTab === 'audit' && currentRole === 'ADMIN' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <AuditLogsView />
                </motion.div>
              )}

              {activeTab === 'settings' && currentRole === 'ADMIN' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <SystemSettingsView />
                </motion.div>
              )}

            </main>

            {/* Mobile Bottom Navigation Bar (< md) */}
            {currentRole === 'ADMIN' ? (
              <nav
                className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 md:hidden flex items-center overflow-x-auto py-1.5 px-2 gap-1 shadow-lg select-none scrollbar-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                aria-label="Admin Mobile Navigation"
                id="admin-mobile-bottom-nav"
              >
                {/* 1. Home */}
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex flex-col items-center justify-center shrink-0 min-w-[64px] py-1 px-1 rounded-xl transition-all cursor-pointer tap-active ${
                    activeTab === 'dashboard' ? 'text-indigo-600 font-bold bg-indigo-50/80' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="admin-mobile-nav-home"
                >
                  <Home className="w-5 h-5" />
                  <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Home</span>
                </button>

                {/* 2. Leave Approvals */}
                <button
                  type="button"
                  onClick={() => setActiveTab('approvals')}
                  className={`flex flex-col items-center justify-center shrink-0 min-w-[64px] py-1 px-1 rounded-xl transition-all relative cursor-pointer tap-active ${
                    activeTab === 'approvals' ? 'text-indigo-600 font-bold bg-indigo-50/80' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="admin-mobile-nav-approvals"
                >
                  <div className="relative">
                    <CheckSquare className="w-5 h-5" />
                    {pendingCount > 0 && (
                      <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                        {pendingCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Approvals</span>
                </button>

                {/* 3. Calendar & Holidays */}
                <button
                  type="button"
                  onClick={() => setActiveTab('calendar')}
                  className={`flex flex-col items-center justify-center shrink-0 min-w-[64px] py-1 px-1 rounded-xl transition-all cursor-pointer tap-active ${
                    activeTab === 'calendar' ? 'text-indigo-600 font-bold bg-indigo-50/80' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="admin-mobile-nav-calendar"
                >
                  <Calendar className="w-5 h-5" />
                  <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Calendar</span>
                </button>

                {/* 4. Attendance Register */}
                <button
                  type="button"
                  onClick={() => setActiveTab('attendance')}
                  className={`flex flex-col items-center justify-center shrink-0 min-w-[64px] py-1 px-1 rounded-xl transition-all cursor-pointer tap-active ${
                    activeTab === 'attendance' ? 'text-indigo-600 font-bold bg-indigo-50/80' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="admin-mobile-nav-attendance"
                >
                  <Clock className="w-5 h-5" />
                  <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Attendance</span>
                </button>

                {/* 5. Employee Directory */}
                <button
                  type="button"
                  onClick={() => setActiveTab('employees')}
                  className={`flex flex-col items-center justify-center shrink-0 min-w-[64px] py-1 px-1 rounded-xl transition-all cursor-pointer tap-active ${
                    activeTab === 'employees' ? 'text-indigo-600 font-bold bg-indigo-50/80' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="admin-mobile-nav-employees"
                >
                  <Users className="w-5 h-5" />
                  <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Employees</span>
                </button>

                {/* 6. Departments */}
                <button
                  type="button"
                  onClick={() => setActiveTab('departments')}
                  className={`flex flex-col items-center justify-center shrink-0 min-w-[64px] py-1 px-1 rounded-xl transition-all cursor-pointer tap-active ${
                    activeTab === 'departments' ? 'text-indigo-600 font-bold bg-indigo-50/80' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="admin-mobile-nav-departments"
                >
                  <Building2 className="w-5 h-5" />
                  <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Departments</span>
                </button>

                {/* 7. Leave Policies */}
                <button
                  type="button"
                  onClick={() => setActiveTab('policies')}
                  className={`flex flex-col items-center justify-center shrink-0 min-w-[64px] py-1 px-1 rounded-xl transition-all cursor-pointer tap-active ${
                    activeTab === 'policies' ? 'text-indigo-600 font-bold bg-indigo-50/80' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="admin-mobile-nav-policies"
                >
                  <Sliders className="w-5 h-5" />
                  <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Policies</span>
                </button>

                {/* 8. Reports & Analytics */}
                <button
                  type="button"
                  onClick={() => setActiveTab('reports')}
                  className={`flex flex-col items-center justify-center shrink-0 min-w-[64px] py-1 px-1 rounded-xl transition-all cursor-pointer tap-active ${
                    activeTab === 'reports' ? 'text-indigo-600 font-bold bg-indigo-50/80' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="admin-mobile-nav-reports"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Reports</span>
                </button>

                {/* 9. Audit Logs */}
                <button
                  type="button"
                  onClick={() => setActiveTab('audit')}
                  className={`flex flex-col items-center justify-center shrink-0 min-w-[64px] py-1 px-1 rounded-xl transition-all cursor-pointer tap-active ${
                    activeTab === 'audit' ? 'text-indigo-600 font-bold bg-indigo-50/80' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="admin-mobile-nav-audit"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Audit Logs</span>
                </button>

                {/* 10. System Settings */}
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className={`flex flex-col items-center justify-center shrink-0 min-w-[64px] py-1 px-1 rounded-xl transition-all cursor-pointer tap-active ${
                    activeTab === 'settings' ? 'text-indigo-600 font-bold bg-indigo-50/80' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="admin-mobile-nav-settings"
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Settings</span>
                </button>
              </nav>
            ) : (
              /* Staff & Manager Navigation Bar */
              <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 md:hidden flex items-center justify-around px-1 py-1.5 shadow-lg select-none" aria-label="Mobile navigation">
                {/* Tab 1: Home */}
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all cursor-pointer tap-active min-w-0 ${
                    activeTab === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="mobile-nav-home"
                >
                  <div className={`p-1 rounded-lg ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5 truncate">Home</span>
                </button>

                {/* Tab 2: My Leave or Approvals */}
                <button
                  type="button"
                  onClick={() => {
                    if (currentRole === 'MANAGER') {
                      setActiveTab('approvals');
                    } else {
                      setActiveTab('my_leaves');
                    }
                  }}
                  className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all relative cursor-pointer tap-active min-w-0 ${
                    activeTab === 'my_leaves' || activeTab === 'approvals' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="mobile-nav-leave"
                >
                  <div className={`p-1 rounded-lg ${activeTab === 'my_leaves' || activeTab === 'approvals' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  {pendingCount > 0 && currentRole === 'MANAGER' && (
                    <span className="absolute top-0.5 right-3 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                      {pendingCount}
                    </span>
                  )}
                  <span className="text-[10px] tracking-tight mt-0.5 truncate">
                    {currentRole === 'MANAGER' ? 'Approvals' : 'My Leave'}
                  </span>
                </button>

                {/* Tab 3: Calendar */}
                <button
                  type="button"
                  onClick={() => setActiveTab('calendar')}
                  className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all cursor-pointer tap-active min-w-0 ${
                    activeTab === 'calendar' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="mobile-nav-calendar"
                >
                  <div className={`p-1 rounded-lg ${activeTab === 'calendar' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5 truncate">Calendar</span>
                </button>

                {/* Tab 4: Clock */}
                <button
                  type="button"
                  onClick={() => setActiveTab('attendance')}
                  className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all cursor-pointer tap-active min-w-0 ${
                    activeTab === 'attendance' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="mobile-nav-clock"
                >
                  <div className={`p-1 rounded-lg ${activeTab === 'attendance' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5 truncate">Clock</span>
                </button>

                {/* Tab 5: Report & Analytics */}
                <button
                  type="button"
                  onClick={() => setActiveTab('reports')}
                  className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all cursor-pointer tap-active min-w-0 ${
                    activeTab === 'reports' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="mobile-nav-reports"
                >
                  <div className={`p-1 rounded-lg ${activeTab === 'reports' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-full text-center px-0.5">
                    <span className="xs:hidden">Reports</span>
                    <span className="hidden xs:inline">Report &amp; Analytics</span>
                  </span>
                </button>
              </nav>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Modals */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />

      <CreateEmployeeModal
        isOpen={isCreateEmployeeModalOpen}
        onClose={() => setIsCreateEmployeeModalOpen(false)}
      />

      <LeaveDetailModal
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />

      <LoginRegisterModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setViewMode('WORKSPACE');
        }}
      />

    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <AuthConsumerWrapper />
    </DataProvider>
  );
}

function AuthConsumerWrapper() {
  const { users, addEmployee } = useData();
  return (
    <AuthProvider users={users} onRegister={addEmployee}>
      <MainAppContent />
    </AuthProvider>
  );
}
