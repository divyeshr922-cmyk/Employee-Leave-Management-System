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
  const teamUserIds = new Set(
    users
      .filter(u => u.managerId === currentUser?.id || u.departmentId === currentUser?.departmentId)
      .map(u => u.id)
  );
  const pendingCount = leaveRequests.filter(
    r => r.status === 'PENDING' && (currentRole === 'ADMIN' || teamUserIds.has(r.employeeId))
  ).length;

  const handleSelectRequestById = (requestId: string) => {
    const found = leaveRequests.find(r => r.id === requestId);
    if (found) {
      setSelectedRequest(found);
    }
  };

  const myRequests = currentUser
    ? leaveRequests.filter(r => r.employeeId === currentUser.id)
    : [];

  const teamRequests = currentRole === 'ADMIN'
    ? leaveRequests
    : leaveRequests.filter(r => teamUserIds.has(r.employeeId));

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
            className="flex-1 max-w-7xl w-full mx-auto flex min-w-0 pb-6"
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

            {/* Main View Area with Mobile-Responsive Padding */}
            <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
              
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
                    title="Team Leave Approvals Queue"
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
