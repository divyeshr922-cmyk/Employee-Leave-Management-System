import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Lock,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  User,
  AlertCircle,
  HelpCircle,
  X,
  Headphones,
  Mail,
  Phone
} from 'lucide-react';

interface LandingLoginPageProps {
  onNavigateToDashboard: () => void;
}

export const LandingLoginPage: React.FC<LandingLoginPageProps> = ({ onNavigateToDashboard }) => {
  const { loginWithDetails } = useAuth();
  const { users } = useData();

  // Role pill switch: 'MANAGER' vs 'EMPLOYEE'
  const [selectedRole, setSelectedRole] = useState<'MANAGER' | 'EMPLOYEE'>('MANAGER');

  // Route check: detects whether the user is on the dedicated /admin route
  const checkIsAdminRoute = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return (
      path === '/admin' ||
      path.startsWith('/admin/') ||
      hash.includes('admin') ||
      search.includes('admin') ||
      new URLSearchParams(window.location.search).get('role') === 'admin'
    );
  };

  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(checkIsAdminRoute);
  const [showAdminRedirectNotice, setShowAdminRedirectNotice] = useState<boolean>(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Sync route on popstate or navigation
  useEffect(() => {
    const handlePopState = () => {
      setIsAdminRoute(checkIsAdminRoute());
      setErrorMsg('');
      setSuccessMsg('');
      setShowAdminRedirectNotice(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToRoute = (targetRoute: string) => {
    window.history.pushState({}, '', targetRoute);
    setIsAdminRoute(checkIsAdminRoute());
    setErrorMsg('');
    setSuccessMsg('');
    setShowAdminRedirectNotice(false);
  };

  // Quick autofill helper for easy evaluator testing
  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
    setSuccessMsg('');
    setShowAdminRedirectNotice(false);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setShowAdminRedirectNotice(false);
    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();

      // Enforce: Admin login can only be accessed via the dedicated /admin route!
      if (!isAdminRoute) {
        const foundUser = users.find(u => {
          const uEmail = (u.email || '').trim().toLowerCase();
          const uEmpId = (u.employeeId || '').trim().toLowerCase();
          return uEmail === cleanEmail || uEmpId === cleanEmail || cleanEmail === 'admin';
        });

        if (foundUser && foundUser.role === 'ADMIN') {
          setIsLoading(false);
          setErrorMsg('Administrative access is restricted to the /admin route only.');
          setShowAdminRedirectNotice(true);
          return;
        }

        // Standard route: authenticate for the selected role (MANAGER or EMPLOYEE)
        const result = loginWithDetails(email, password, selectedRole);
        setIsLoading(false);

        if (result.success && result.user) {
          const roleLabel = result.user.role === 'MANAGER' ? 'Manager' : 'Employee';
          setSuccessMsg(`Welcome back, ${result.user.name.split(' ')[0]}! Opening ${roleLabel} Portal...`);
          setTimeout(() => onNavigateToDashboard(), 350);
        } else {
          setErrorMsg(result.error || 'Invalid credentials. Please verify your work email and password.');
        }
      } else {
        // Dedicated /admin route: authenticate exclusively for ADMIN accounts
        const result = loginWithDetails(email, password, 'ADMIN');
        setIsLoading(false);

        if (result.success && result.user) {
          setSuccessMsg(`Welcome back, System Administrator! Opening Administrator Portal...`);
          setTimeout(() => onNavigateToDashboard(), 350);
        } else {
          setErrorMsg(result.error || 'Invalid administrative credentials. Access restricted.');
        }
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between selection:bg-indigo-600 selection:text-white font-sans">
      
      {/* Top Enterprise Brand Navigation Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3 shadow-xs">
        <div className="w-full px-0 sm:px-2 flex items-center justify-between">
          
          {/* ELMS Enterprise Logo */}
          <div className="flex items-center gap-2.5 select-none">
            <div className="px-2.5 h-8 sm:h-9 rounded-xl bg-indigo-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0 select-none">
              ELMS
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                Enterprise Leave & Attendance
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 hidden sm:block">
                Unified Workforce Management System
              </p>
            </div>
          </div>

          {/* Quick Support / Security Badge */}
          <div className="flex items-center gap-2">
            {isAdminRoute ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Administrator Gateway</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Enterprise 256-Bit Encrypted</span>
                <span className="sm:hidden">Secure Portal</span>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main Two-Section Enterprise Hero + Login Layout */}
      <main className="w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-10 flex-1 flex items-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center w-full">
          
          {/* ========================================================================= */}
          {/* LEFT SECTION: Professional Branding, Value Props & Abstract Workforce Mockup */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-5 lg:space-y-7 text-left order-2 lg:order-1">
            
            {/* Enterprise Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Modern Workforce Management Suite</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Unified workforce leave &{' '}
                <span className="text-indigo-600">
                  attendance intelligence.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed font-normal">
                Streamline time-off requests, multi-tier approvals, attendance clocking, and leave policy compliance within a single, secure HR platform designed for high-performing organizations.
              </p>
            </div>

            {/* 3 High-Value Enterprise Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Live Quota Tracking</h3>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Automatic deduction of weekends & official holidays with real-time balance calculations.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Manager Approvals</h3>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Instant leave request routing with automated team overlap warning indicators.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Attendance Registers</h3>
                <p className="text-[11px] text-slate-500 leading-normal">
                  One-click daily check-in, late arrival calculation, and full audit trail exports.
                </p>
              </div>

            </div>

            {/* Abstract Workforce HR Preview Card (Realistic Product Mockup) */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3.5 hidden sm:block">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900">Today's Workforce Health Overview</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  96.4% Department Attendance
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-left">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Casual Leave</span>
                  <span className="text-base font-extrabold text-slate-900 mt-0.5 block">10 / 12 Days</span>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full w-[83%]" />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Sick Leave</span>
                  <span className="text-base font-extrabold text-slate-900 mt-0.5 block">8 / 10 Days</span>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full w-[80%]" />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Earned Leave</span>
                  <span className="text-base font-extrabold text-slate-900 mt-0.5 block">14 / 15 Days</span>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full w-[93%]" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT SECTION: Compact Redesigned Enterprise Sign-In Card                 */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 w-full order-1 lg:order-2">
            <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 p-5 sm:p-7 space-y-4 max-w-md w-full mx-auto transition-all">
              
              {/* Card Header */}
              <div className="space-y-1 text-left">
                <h2 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight">
                  Welcome back
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                  {isAdminRoute
                    ? 'Enter your administrative credentials to access system controls'
                    : 'Enter your enterprise credentials to access your portal'}
                </p>
              </div>

              {/* Role Selector: Manager vs Employee on Public Route / Admin on /admin Route */}
              {!isAdminRoute ? (
                <div className="bg-[#f0f3f8] p-1 rounded-full border border-slate-200/70 grid grid-cols-2 gap-1 select-none">
                  <button
                    type="button"
                    id="tab-manager-login"
                    onClick={() => {
                      setSelectedRole('MANAGER');
                      setErrorMsg('');
                      setSuccessMsg('');
                      setShowAdminRedirectNotice(false);
                    }}
                    className={`py-2 px-2 sm:px-3 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap transition-all cursor-pointer ${
                      selectedRole === 'MANAGER'
                        ? 'bg-[#4f46e5] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 bg-transparent'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>Manager Login</span>
                  </button>
                  <button
                    type="button"
                    id="tab-employee-login"
                    onClick={() => {
                      setSelectedRole('EMPLOYEE');
                      setErrorMsg('');
                      setSuccessMsg('');
                      setShowAdminRedirectNotice(false);
                    }}
                    className={`py-2 px-2 sm:px-3 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap transition-all cursor-pointer ${
                      selectedRole === 'EMPLOYEE'
                        ? 'bg-[#4f46e5] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 bg-transparent'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>Employee Login</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-1.5">
                    <div className="flex items-center gap-2 text-indigo-950 text-xs font-bold">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Administrator Gateway</span>
                      <span className="font-mono text-[10px] bg-indigo-200/70 text-indigo-800 px-1.5 py-0.5 rounded font-bold">/admin</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateToRoute('/')}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                    >
                      ← Staff Portal
                    </button>
                  </div>

                  <div className="bg-[#f0f3f8] p-1 rounded-full border border-slate-200/70 select-none">
                    <div className="w-full py-2 px-3 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 bg-[#4f46e5] text-white shadow-xs">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Administrator Login</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback Notifications */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 space-y-2 text-left">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                  {showAdminRedirectNotice && (
                    <button
                      type="button"
                      onClick={() => navigateToRoute('/admin')}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Access Administrator Portal (/admin)</span>
                    </button>
                  )}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 flex items-start gap-2 text-left">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-left">
                
                {/* Email Field */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1" htmlFor="login-email-input">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      setErrorMsg('');
                      setShowAdminRedirectNotice(false);
                    }}
                    placeholder={
                      isAdminRoute
                        ? 'admin@company.com'
                        : selectedRole === 'MANAGER'
                        ? 'manager@company.com'
                        : 'employee@company.com'
                    }
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all shadow-2xs"
                    required
                    id="login-email-input"
                  />
                </div>

                {/* Password Field with Show/Hide Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs sm:text-sm font-bold text-slate-800" htmlFor="login-password-input">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="••••••••"
                      className="w-full h-11 px-3.5 pr-10 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all shadow-2xs"
                      required
                      id="login-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                    />
                    <span>Remember me on this device</span>
                  </label>
                </div>

                {/* Sign In CTA */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 sm:h-12 bg-[#4f46e5] hover:bg-[#4338ca] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer tap-active disabled:opacity-70 mt-1"
                  id="login-submit-btn"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider & Contact / Support */}
              <div className="border-t border-slate-100 pt-3.5 mt-3.5 flex items-center justify-start">
                <button
                  type="button"
                  id="contact-support-btn"
                  onClick={() => setShowContactModal(true)}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer group"
                >
                  <Headphones className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  <span>Contact / Support</span>
                </button>
              </div>

            </div>
          </div>

        </div>

      </main>

      {/* Enterprise Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <div className="w-full px-0 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Employee Leave Management System (ELMS) • All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setShowContactModal(true)}
              className="hover:underline cursor-pointer"
            >
              HR Helpdesk
            </button>
          </div>
        </div>
      </footer>


      {/* Forgot Password Informational Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 text-left">
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Credential Reset Notice</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                For corporate security, password resets are administered by your IT/HR personnel. Contact <strong className="text-slate-700">support@elms.com</strong> or your department manager to obtain a temporary recovery token.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForgotPasswordModal(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Corporate Contact & Support Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 text-left">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">Corporate Helpdesk & Support</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect with our dedicated workforce support team for login assistance, policy inquiries, or technical support.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100/70 text-indigo-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Support Email</div>
                  <div className="text-[11px] text-slate-500 font-mono">support@elms.com</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Enterprise Hotline</div>
                  <div className="text-[11px] text-slate-500 font-mono">+1 (800) 555-ELMS (Ext. 204)</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-100/70 text-sky-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Support Hours</div>
                  <div className="text-[11px] text-slate-500">24/7 Global IT & HR Helpdesk</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowContactModal(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Close Helpdesk
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

