import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface LoginRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginRegisterModal: React.FC<LoginRegisterModalProps> = ({ isOpen, onClose }) => {
  const { loginWithDetails } = useAuth();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'FORGOT'>('LOGIN');
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const res = loginWithDetails(email, password);
    setIsLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Invalid credentials. Please check your email and password.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Password reset instructions have been sent to your email.');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account Authentication">
      <div className="space-y-5">

        {/* Tab Switcher / Notice */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => { setActiveTab('LOGIN'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`pb-2.5 text-xs font-bold px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === 'LOGIN'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Sign In
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-700">
            {successMsg}
          </div>
        )}

        {/* LOGIN TAB */}
        {activeTab === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Work Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setActiveTab('FORGOT')}
                  className="text-[11px] font-semibold text-sky-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        )}


        {/* FORGOT PASSWORD TAB */}
        {activeTab === 'FORGOT' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Registered Work Email</label>
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Send Password Reset Instructions
            </button>
          </form>
        )}

      </div>
    </Modal>
  );
};
