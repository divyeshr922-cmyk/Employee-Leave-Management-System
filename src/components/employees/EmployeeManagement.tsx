import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { User, Role } from '../../types';
import { Modal } from '../common/Modal';
import { Users, UserPlus, Edit, Trash2, Search, Building, Phone, Mail, Shield, Eye, EyeOff, KeyRound, ChevronRight } from 'lucide-react';

export const EmployeeManagement: React.FC = () => {
  const { users, departments, addEmployee, updateEmployee, deleteEmployee } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'EMPLOYEE' | 'MANAGER' | 'EDIT'>('EMPLOYEE');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [empCode, setEmpCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('EMPLOYEE');
  const [deptId, setDeptId] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [managerId, setManagerId] = useState('');

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = deptFilter === 'ALL' || u.departmentId === deptFilter;

    return matchesSearch && matchesDept;
  });

  const handleOpenAddEmployee = () => {
    setEditingUser(null);
    setModalMode('EMPLOYEE');
    setEmpCode(`EMP${1000 + users.length + 1}`);
    setName('');
    setEmail('');
    setPassword('');
    setRole('EMPLOYEE');
    setDeptId(departments[0]?.id || '');
    setDesignation('Software Engineer');
    setPhone('+1 (555) 000-1122');
    setManagerId('');
    setIsModalOpen(true);
  };

  const handleOpenCreateManager = () => {
    setEditingUser(null);
    setModalMode('MANAGER');
    setEmpCode(`MGR${100 + users.filter(u => u.role === 'MANAGER').length + 1}`);
    setName('');
    setEmail('');
    setPassword('');
    setRole('MANAGER');
    setDeptId(departments[0]?.id || '');
    setDesignation('Engineering Manager');
    setPhone('+1 (555) 234-5678');
    setManagerId('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setModalMode('EDIT');
    setEmpCode(user.employeeId);
    setName(user.name);
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
    setDeptId(user.departmentId);
    setDesignation(user.designation);
    setPhone(user.phone);
    setManagerId(user.managerId || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    if (editingUser) {
      const updates: Partial<User> = {
        employeeId: empCode.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        departmentId: deptId,
        designation: designation.trim(),
        phone: phone.trim(),
        managerId: managerId || undefined
      };
      if (password.trim()) {
        updates.password = password.trim();
      }
      updateEmployee(editingUser.id, updates);
    } else {
      addEmployee({
        employeeId: empCode.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim() || 'password123',
        role,
        departmentId: deptId,
        designation: designation.trim(),
        phone: phone.trim(),
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        managerId: managerId || undefined
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">

      {/* Header with Add Personnel and Create Manager buttons */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
            <Users className="w-5 h-5 text-emerald-600" />
            Personnel & Account Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Directory of staff members, assign managers, provision credentials, and manage organizational hierarchy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Create Manager Account Button */}
          <button
            type="button"
            onClick={handleOpenCreateManager}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer tap-active"
            id="create-manager-btn"
          >
            <Shield className="w-4 h-4" />
            <span>+ Create Manager</span>
          </button>

          {/* Add Personnel Button */}
          <button
            type="button"
            onClick={handleOpenAddEmployee}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer tap-active"
            id="add-emp-btn"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Employee</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee name, code, email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            id="emp-search-input"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 shrink-0">Department:</span>
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
            id="emp-dept-filter-select"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Personnel Records Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2.5 opacity-30 text-slate-500" />
            <p className="text-xs font-bold text-slate-600">No personnel profiles match the specified filters.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different name, code, or department filter.</p>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW (< md): Responsive Personnel Cards */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredUsers.map(user => {
                const dept = departments.find(d => d.id === user.departmentId);
                const manager = users.find(u => u.id === user.managerId);

                return (
                  <div key={user.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                    {/* Top Row: Avatar, Name & Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0 ${
                          user.role === 'ADMIN' ? 'bg-emerald-600' : user.role === 'MANAGER' ? 'bg-indigo-600' : 'bg-sky-600'
                        }`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm">{user.name}</div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            <span className="font-mono font-bold text-slate-700">{user.employeeId}</span> • {user.designation}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(user)}
                          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer tap-active"
                          title="Edit Personnel Profile"
                          aria-label={`Edit ${user.name}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove personnel profile for ${user.name}?`)) {
                              deleteEmployee(user.id);
                            }
                          }}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer tap-active"
                          title="Delete Personnel"
                          aria-label={`Delete ${user.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Middle Row: Badges & Department */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        user.role === 'ADMIN'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : user.role === 'MANAGER'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}>
                        {user.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                        {user.role === 'MANAGER' && <Users className="w-3 h-3" />}
                        <span>{user.role}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{dept?.name || 'Unassigned'}</span>
                      </span>

                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 ml-auto">
                        {user.status}
                      </span>
                    </div>

                    {/* Bottom Row: Contact Links & Manager */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <a
                        href={`mailto:${user.email}`}
                        className="flex items-center gap-1.5 text-[11px] text-slate-600 hover:text-sky-600 truncate py-1"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </a>
                      <a
                        href={`tel:${user.phone}`}
                        className="flex items-center gap-1.5 text-[11px] text-slate-600 hover:text-sky-600 truncate py-1 justify-end"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{user.phone}</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP VIEW (>= md): Comprehensive Staff Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4">Personnel</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Reports To</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.map(user => {
                    const dept = departments.find(d => d.id === user.departmentId);
                    const manager = users.find(u => u.id === user.managerId);

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl text-white font-black flex items-center justify-center text-xs shadow-2xs ${
                              user.role === 'ADMIN' ? 'bg-emerald-600' : user.role === 'MANAGER' ? 'bg-indigo-600' : 'bg-sky-600'
                            }`}>
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{user.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">{user.employeeId} • {user.designation}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="space-y-0.5">
                            <a
                              href={`mailto:${user.email}`}
                              className="flex items-center gap-1.5 text-slate-600 hover:text-sky-600 transition-colors"
                            >
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{user.email}</span>
                            </a>
                            <a
                              href={`tel:${user.phone}`}
                              className="flex items-center gap-1.5 text-slate-500 hover:text-sky-600 transition-colors text-[11px]"
                            >
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{user.phone}</span>
                            </a>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            user.role === 'ADMIN'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : user.role === 'MANAGER'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}>
                            {user.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                            {user.role === 'MANAGER' && <Users className="w-3 h-3" />}
                            <span>{user.role}</span>
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1 text-slate-700 font-medium">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span>{dept?.name || 'Unassigned'}</span>
                          </div>
                        </td>

                        <td className="p-4 text-slate-600">
                          {manager ? (
                            <div>
                              <div className="font-semibold text-slate-800">{manager.name}</div>
                              <div className="text-[10px] text-slate-400">{manager.designation}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">None (Direct)</span>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {user.status}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(user)}
                              className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer tap-active"
                              title="Edit Personnel Profile"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remove personnel profile for ${user.name}?`)) {
                                  deleteEmployee(user.id);
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer tap-active"
                              title="Delete Personnel"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add / Edit / Create Manager Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'MANAGER'
            ? 'Create New Manager Account'
            : editingUser
            ? `Edit Personnel: ${editingUser.name}`
            : 'Add New Staff Personnel'
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {modalMode === 'MANAGER' && (
            <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900">
              <p className="font-bold flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>Manager Provisioning</span>
              </p>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                Set up a manager account with login credentials. The manager can use this email and password to log in through the Manager portal.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Personnel ID Code</label>
              <input
                type="text"
                value={empCode}
                onChange={e => setEmpCode(e.target.value)}
                className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Work Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane.smith@company.com"
                className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">System Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as Role)}
                className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {editingUser ? 'Change Password (leave blank to keep existing)' : 'Account Password *'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={editingUser ? '••••••••' : 'Assign login password for this account'}
                className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                required={!editingUser}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <select
                value={deptId}
                onChange={e => setDeptId(e.target.value)}
                className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Designation</label>
              <input
                type="text"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                placeholder={role === 'MANAGER' ? 'Engineering Lead' : 'Software Engineer'}
                className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reporting Manager</label>
              <select
                value={managerId}
                onChange={e => setManagerId(e.target.value)}
                className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
              >
                <option value="">None (Top Level / Direct)</option>
                {users
                  .filter(m => (m.role === 'MANAGER' || m.role === 'ADMIN') && (!editingUser || m.id !== editingUser.id))
                  .map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer tap-active ${
                role === 'MANAGER' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {editingUser ? 'Save Changes' : role === 'MANAGER' ? 'Create Manager Account' : 'Save Personnel'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
