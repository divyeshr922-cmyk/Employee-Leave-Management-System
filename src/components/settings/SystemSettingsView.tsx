import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  Save,
  CheckCircle2,
  Calendar,
  Clock,
  Bell,
  Shield,
  Building2,
  RotateCcw,
  User
} from 'lucide-react';

export const SystemSettingsView: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useData();
  const { currentUser } = useAuth();

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [fiscalYearStart, setFiscalYearStart] = useState(settings.fiscalYearStart);
  const [workingDays, setWorkingDays] = useState(settings.workingDaysPerWeek);
  const [weekendRule, setWeekendRule] = useState(settings.workingDaysPerWeek === 5 ? 'SAT_SUN' : 'SUN_ONLY');
  const [threshold, setThreshold] = useState(settings.requireMedicalDocDaysThreshold);
  const [emailNotifs, setEmailNotifs] = useState(settings.emailNotificationsEnabled);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName,
      fiscalYearStart,
      workingDaysPerWeek: Number(workingDays),
      requireMedicalDocDaysThreshold: Number(threshold),
      emailNotificationsEnabled: emailNotifs
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <span>System Rules & Governance Settings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Global enterprise configurations for working days, weekend policies, fiscal years, and compliance alerts.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>System configuration changes saved and applied across portals!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        
        {/* Section 1: System Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. System Settings & Company Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Platform Timezone</label>
              <select
                defaultValue="UTC_EST"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white cursor-pointer"
              >
                <option value="UTC_EST">Eastern Standard Time (EST / UTC-5)</option>
                <option value="UTC_CST">Central Standard Time (CST / UTC-6)</option>
                <option value="UTC_PST">Pacific Standard Time (PST / UTC-8)</option>
                <option value="UTC_GMT">Greenwich Mean Time (GMT / UTC+0)</option>
                <option value="UTC_IST">India Standard Time (IST / UTC+5:30)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Working Days & Weekend Rules */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Working Days & Weekend Rules
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Standard Workweek Schedule</label>
              <select
                value={workingDays}
                onChange={e => {
                  const val = Number(e.target.value);
                  setWorkingDays(val);
                  setWeekendRule(val === 5 ? 'SAT_SUN' : 'SUN_ONLY');
                }}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white cursor-pointer"
              >
                <option value={5}>5 Working Days / Week (Monday – Friday)</option>
                <option value={6}>6 Working Days / Week (Monday – Saturday)</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Leave calculations automatically skip non-working days.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Weekend Rule Configuration</label>
              <select
                value={weekendRule}
                onChange={e => setWeekendRule(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white cursor-pointer"
              >
                <option value="SAT_SUN">Standard Weekend (Saturday & Sunday Off)</option>
                <option value="SUN_ONLY">Single Day Weekend (Sunday Off Only)</option>
                <option value="FRI_SAT">Middle-Eastern Weekend (Friday & Saturday Off)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Fiscal Year & Compliance Thresholds */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              3. Fiscal Year & Leave Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fiscal Year Cycle Start Date *</label>
              <input
                type="date"
                value={fiscalYearStart}
                onChange={e => setFiscalYearStart(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Annual leave quotas reset on this date.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Medical Document Threshold (Consecutive Days)
              </label>
              <input
                type="number"
                min={1}
                max={14}
                value={threshold}
                onChange={e => setThreshold(Number(e.target.value))}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Absences exceeding this require doctor's certificate.</span>
            </div>
          </div>
        </div>

        {/* Section 4: Notifications */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              4. Notification Governance
            </h3>
          </div>

          <label className="flex items-center gap-3 cursor-pointer bg-slate-50 p-3.5 rounded-xl border border-slate-200 select-none">
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={e => setEmailNotifs(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Automated Email & System Notifications</span>
              <span className="text-[11px] text-slate-500">
                Notify managers on submission and employees upon request approval/rejection.
              </span>
            </div>
          </label>
        </div>

        {/* Section 5: Current Profile & System Maintenance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              5. Administrator Profile & Maintenance
            </h3>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                {currentUser?.name.charAt(0) || 'A'}
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block">{currentUser?.name}</span>
                <span className="text-[11px] text-slate-500">{currentUser?.email} • System Administrator</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified Super Admin
            </span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Reset system data back to initial seed dataset (demo users, requests, holidays):
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset system data back to initial seed state? This resets all changes.')) {
                  resetDemoData();
                  alert('System data restored to initial state.');
                  window.location.reload();
                }
              }}
              className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer shrink-0"
              id="system-reset-btn"
            >
              <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer tap-active"
            id="save-settings-btn"
          >
            <Save className="w-4 h-4" />
            <span>Save All Configurations</span>
          </button>
        </div>

      </form>

    </div>
  );
};
