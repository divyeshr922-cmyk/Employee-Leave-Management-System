import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { LeaveType } from '../../types';
import { Modal } from '../common/Modal';
import { Sliders, Plus, Edit, Trash2, Check, X, Shield, Clock, FileCheck } from 'lucide-react';

export const LeavePoliciesManagement: React.FC = () => {
  const { leaveTypes, addLeaveType, updateLeaveType, deleteLeaveType } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLT, setEditingLT] = useState<LeaveType | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [maxDays, setMaxDays] = useState(12);
  const [carryForward, setCarryForward] = useState(3);
  const [isPaid, setIsPaid] = useState(true);
  const [requiresAttachment, setRequiresAttachment] = useState(false);
  const [color, setColor] = useState('#4f46e5');
  const [description, setDescription] = useState('');

  const handleOpenAdd = () => {
    setEditingLT(null);
    setCode('');
    setName('');
    setMaxDays(12);
    setCarryForward(0);
    setIsPaid(true);
    setRequiresAttachment(false);
    setColor('#4f46e5');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lt: LeaveType) => {
    setEditingLT(lt);
    setCode(lt.code);
    setName(lt.name);
    setMaxDays(lt.maxDaysPerYear);
    setCarryForward(lt.carryForwardMax);
    setIsPaid(lt.isPaid);
    setRequiresAttachment(lt.requiresAttachment);
    setColor(lt.color);
    setDescription(lt.description);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    if (editingLT) {
      updateLeaveType(editingLT.id, {
        code,
        name,
        maxDaysPerYear: Number(maxDays),
        carryForwardMax: Number(carryForward),
        isPaid,
        requiresAttachment,
        color,
        description
      });
    } else {
      addLeaveType({
        code,
        name,
        maxDaysPerYear: Number(maxDays),
        carryForwardMax: Number(carryForward),
        isPaid,
        requiresAttachment,
        color,
        description
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <span>Leave Policies & Quota Configuration</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure enterprise annual quotas, carry-forward caps, compensation rules, and supporting certificate mandates.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer tap-active"
          id="add-lt-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Add Leave Policy</span>
        </button>
      </div>

      {/* Policy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leaveTypes.map(lt => (
          <div
            key={lt.id}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-3.5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: lt.color }} />
                  <h3 className="font-bold text-sm text-slate-900">{lt.name}</h3>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {lt.code}
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed min-h-[32px]">{lt.description}</p>

              {/* Organized Metric Rows */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Annual Quota</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{lt.maxDaysPerYear} Days/Yr</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Carry Forward</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{lt.carryForwardMax} Days Cap</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <span className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-md ${
                  lt.isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {lt.isPaid ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                  {lt.isPaid ? 'Paid Leave' : 'Unpaid Leave'}
                </span>

                <span className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-md ${
                  lt.requiresAttachment ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-50 text-slate-500'
                }`}>
                  {lt.requiresAttachment ? <Check className="w-3 h-3 text-amber-600" /> : <X className="w-3 h-3 text-slate-400" />}
                  {lt.requiresAttachment ? 'Certificate Required' : 'No Doc Required'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleOpenEdit(lt)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Edit Policy"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete policy ${lt.name}?`)) deleteLeaveType(lt.id);
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Delete Policy"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Policy Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLT ? 'Configure Leave Policy' : 'Create New Leave Policy'}
        subtitle="Set up quota allowances, carry-forward thresholds, and requirements"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Policy Code *</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. CL, SL, WFH"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Policy Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Casual Leave"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Annual Quota (Days) *</label>
              <input
                type="number"
                min={1}
                max={90}
                value={maxDays}
                onChange={e => setMaxDays(Number(e.target.value))}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Carry Forward Cap (Days)</label>
              <input
                type="number"
                min={0}
                max={30}
                value={carryForward}
                onChange={e => setCarryForward(Number(e.target.value))}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200 select-none">
              <input
                type="checkbox"
                checked={isPaid}
                onChange={e => setIsPaid(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Paid Leave Policy</span>
                <span className="text-[10px] text-slate-500">Employee receives standard salary</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200 select-none">
              <input
                type="checkbox"
                checked={requiresAttachment}
                onChange={e => setRequiresAttachment(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Document Required</span>
                <span className="text-[10px] text-slate-500">Requires certificate attachment</span>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Guidelines</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Unplanned personal matters and short-term emergencies..."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer tap-active"
            >
              Save Policy
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
