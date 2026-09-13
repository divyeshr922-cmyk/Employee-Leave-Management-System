import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { Role } from '../../types';
import {
  UserPlus,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Check,
  Building,
  KeyRound,
  Mail,
  User as UserIcon,
  Phone,
  Briefcase
} from 'lucide-react';

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: Role;
  onSuccess?: () => void;
}

export const CreateEmployeeModal: React.FC<CreateEmployeeModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'EMPLOYEE',
  onSuccess
}) => {
  const { users, departments, addEmployee } = useData();

  const [role, setRole] = useState<Role>(defaultRole);
  const [empCode, setEmpCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [deptId, setDeptId] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('+1 (555) 000-1122');
  const [managerId, setManagerId] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [createdSuccess, setCreatedSuccess] = useState<{ email: string; pass: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Initialize defaults on open or role change
  useEffect(() => {
    if (isOpen) {
      const initialRole: Role = (defaultRole ?? 'EMPLOYEE') as Role;
      setRole(initialRole);
      resetForm(initialRole);
    }
  }, [isOpen, defaultRole]);

  const resetForm = (targetRole: Role) => {
    const isMgr = targetRole === 'MANAGER';
    const count = isMgr
      ? users.filter(u => u.role === 'MANAGER').length + 1
      : users.filter(u => u.role === 'EMPLOYEE').length + 1;
    setEmpCode(isMgr ? `MGR${100 + count}` : `EMP${1000 + count}`);
    setName('');
    setEmail('');
    setPassword('password123');
    setShowPassword(false);
    setDeptId(departments[0]?.id || '');
    setDesignation(isMgr ? 'Engineering Manager' : 'Software Engineer');
    setPhone('+1 (555) 000-1122');
    setManagerId('');
    setErrorMsg('');
    setCreatedSuccess(null);
    setCopied(false);
  };

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    const isMgr = newRole === 'MANAGER';
    const count = isMgr
      ? users.filter(u => u.role === 'MANAGER').length + 1
      : users.filter(u => u.role === 'EMPLOYEE').length + 1;
    setEmpCode(isMgr ? `MGR${100 + count}` : `EMP${1000 + count}`);
    setDesignation(isMgr ? 'Team Manager' : 'Software Engineer');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || !cleanEmail || !password.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters in length.');
      return;
    }

    // Check duplicate email
    const exists = users.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      setErrorMsg(`An account with email "${cleanEmail}" already exists.`);
      return;
    }

    try {
      addEmployee({
        employeeId: empCode.trim(),
        name: cleanName,
        email: cleanEmail,
        password: password.trim(),
        role,
        departmentId: deptId || departments[0]?.id || 'dept-eng',
        designation: designation.trim() || (role === 'MANAGER' ? 'Team Lead' : 'Staff Member'),
        phone: phone.trim() || '+1 (555) 000-1122',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        managerId: managerId || undefined
      });

      setCreatedSuccess({
        email: cleanEmail,
        pass: password.trim(),
        name: cleanName
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to create employee account. Please try again.');
    }
  };

  const copyCredentials = () => {
    if (!createdSuccess) return;
    const text = `ELMS Login Credentials:\nName: ${createdSuccess.name}\nEmail: ${createdSuccess.email}\nPassword: ${createdSuccess.pass}\nURL: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setCreatedSuccess(null);
      }}
      title={role === 'MANAGER' ? 'Provision Manager Account' : 'Provision Employee Account'}
    >
      <div className="space-y-4">
        
        {/* Success Banner */}
        {createdSuccess ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Account Provisioned Successfully!</span>
              </div>
              <p className="text-slate-600">
                The account for <strong className="text-slate-900">{createdSuccess.name}</strong> has been created with active leave allocations. You can share these credentials with the user:
              </p>
              <div className="p-3 bg-white rounded-xl border border-emerald-200 font-mono text-[11px] space-y-1 text-slate-800">
                <div><span className="text-slate-400">Email:</span> {createdSuccess.email}</div>
                <div><span className="text-slate-400">Password:</span> {createdSuccess.pass}</div>
                <div><span className="text-slate-400">Role:</span> {role}</div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={copyCredentials}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>

              <button
                type="button"
                onClick={() => resetForm(role)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                + Create Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Account Role</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleRoleChange('EMPLOYEE')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === 'EMPLOYEE'
                      ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Employee</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('MANAGER')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === 'MANAGER'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Manager</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID Code *</label>
                <input
                  type="text"
                  value={empCode}
                  onChange={e => setEmpCode(e.target.value)}
                  placeholder="e.g. EMP1001"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane.doe@company.com"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password * (min 6 chars)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="password123"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none pr-9"
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={deptId}
                  onChange={e => setDeptId(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  placeholder={role === 'MANAGER' ? 'Engineering Manager' : 'Software Engineer'}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reporting Manager</label>
                <select
                  value={managerId}
                  onChange={e => setManagerId(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">None (Direct Reporting to Admin)</option>
                  {users
                    .filter(u => u.role === 'MANAGER' || u.role === 'ADMIN')
                    .map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.designation})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-1122"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                id="submit-provision-employee-btn"
              >
                <UserPlus className="w-4 h-4" />
                <span>Provision {role === 'MANAGER' ? 'Manager' : 'Employee'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </Modal>
  );
};
