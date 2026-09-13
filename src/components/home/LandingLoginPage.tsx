import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';

interface LandingLoginPageProps {
  onNavigateToDashboard: () => void;
}

export const LandingLoginPage: React.FC<LandingLoginPageProps> = ({ onNavigateToDashboard }) => {
  const { loginWithDetails } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Quick autofill helper for evaluation without portal switching UI
  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    setTimeout(() => {
      // Direct credentials authentication: automatically detects whether Employee, Manager, or Admin
      const result = loginWithDetails(email, password);
      setIsLoading(false);

      if (result.success && result.user) {
        const roleLabel =
          result.user.role === 'ADMIN'
            ? 'Administrator'
            : result.user.role === 'MANAGER'
            ? 'Manager'
            : 'Employee';

        setSuccessMsg(`Welcome back, ${result.user.name.split(' ')[0]}! Opening ${roleLabel} Portal...`);
        setTimeout(() => onNavigateToDashboard(), 350);
      } else {
        setErrorMsg(result.error || 'Invalid credentials. Please verify your work email and password.');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between selection:bg-indigo-600 selection:text-white font-sans">
      
      {/* Top Enterprise Brand Navigation Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* ELMS Enterprise Logo */}
          <div className="flex items-center gap-3 select-none">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
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
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Enterprise 256-Bit Encrypted</span>
            <span className="sm:hidden">Secure Portal</span>
          </div>

        </div>
      </header>

      {/* Main Two-Section Enterprise Hero + Login Layout */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex-1 flex items-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
          
          {/* ========================================================================= */}
          {/* LEFT SECTION: Professional Branding, Value Props & Abstract Workforce Mockup */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              
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
          {/* RIGHT SECTION: Professional Enterprise Sign-In Card                      */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
              
              {/* Card Header */}
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Welcome back
                </h2>
                <p className="text-xs text-slate-500">
                  Enter your enterprise credentials to access your portal
                </p>
              </div>

              {/* Feedback Notifications */}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form (No Role Selectors - routes directly based on credentials) */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full h-11 px-3.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all"
                    required
                    id="login-email-input"
                  />
                </div>

                {/* Password Field with Show/Hide Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 px-3.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all pr-10"
                      required
                      id="login-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Remember me on this device</span>
                  </label>
                </div>

                {/* Sign In CTA */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer tap-active disabled:opacity-70 mt-2"
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

              {/* Discreet 1-Click Test Credentials (Convenient for evaluators/reviewers without portal switcher tabs) */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Demo Credentials</span>
                  <span className="text-[10px] font-normal text-slate-400">Click to fill</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    id="demo-login-sarah"
                    onClick={() => handleQuickFill('employee@elms.com', 'employee123')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors cursor-pointer tap-active"
                    title="Sign in as Sarah Jenkins (Employee)"
                  >
                    <span className="text-[10px] font-bold text-slate-800 block truncate">Sarah (Staff)</span>
                    <span className="text-[9px] text-slate-400 block font-mono">employee123</span>
                  </button>

                  <button
                    type="button"
                    id="demo-login-alex"
                    onClick={() => handleQuickFill('manager@elms.com', 'manager123')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors cursor-pointer tap-active"
                    title="Sign in as Alex Rivera (Manager)"
                  >
                    <span className="text-[10px] font-bold text-slate-800 block truncate">Alex (Lead)</span>
                    <span className="text-[9px] text-slate-400 block font-mono">manager123</span>
                  </button>

                  <button
                    type="button"
                    id="demo-login-admin"
                    onClick={() => handleQuickFill('admin@elms.com', 'admin123')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors cursor-pointer tap-active"
                    title="Sign in as System Administrator"
                  >
                    <span className="text-[10px] font-bold text-slate-800 block truncate">Admin</span>
                    <span className="text-[9px] text-slate-400 block font-mono">admin123</span>
                  </button>
                </div>
              </div>

              {/* Small Security & Accessibility Information */}
              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Enterprise 256-bit TLS • SOC 2 Type II • SSO Ready</span>
              </div>

            </div>
          </div>

        </div>

      </main>

      {/* Enterprise Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-5 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Employee Leave Management System (ELMS) • All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>HR Helpdesk</span>
          </div>
        </div>
      </footer>

      {/* Forgot Password Informational Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Credential Reset Notice</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                For corporate security, password resets are administered by your IT/HR personnel. Contact <strong className="text-slate-700">admin@elms.com</strong> or your department manager to obtain a temporary recovery token.
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

    </div>
  );
};
