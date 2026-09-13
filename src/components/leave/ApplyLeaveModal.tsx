import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { calculateLeaveDays } from '../../utils/helpers';
import { Calendar, Upload, AlertTriangle, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { leaveTypes, leaveBalances, holidays, applyLeaveRequest } = useData();

  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isHalfDay, setIsHalfDay] = useState<boolean>(false);
  const [halfDayType, setHalfDayType] = useState<'FIRST_HALF' | 'SECOND_HALF'>('FIRST_HALF');
  const [reason, setReason] = useState<string>('');
  const [emergencyContact, setEmergencyContact] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Default initial values
  useEffect(() => {
    if (isOpen) {
      const defaultLT = leaveTypes[0]?.id || '';
      setSelectedLeaveTypeId(defaultLT);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      setStartDate(dateStr);
      setEndDate(dateStr);
      setReason('');
      setEmergencyContact(currentUser?.phone || '+1 (555) 012-3456');
      setAttachmentName('');
      setErrorMsg('');
      setIsHalfDay(false);
    }
  }, [isOpen, leaveTypes, currentUser]);

  if (!currentUser) return null;

  // Find user's balance for selected leave type
  const activeBalance = leaveBalances.find(
    b => b.employeeId === currentUser.id && b.leaveTypeId === selectedLeaveTypeId
  );

  const selectedLT = leaveTypes.find(lt => lt.id === selectedLeaveTypeId);

  // Auto-calculated working days (excluding weekends and holidays)
  const calculatedDays = calculateLeaveDays(startDate, endDate, isHalfDay, holidays);

  const isExceedingBalance = activeBalance ? calculatedDays > activeBalance.remaining : false;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedLeaveTypeId) {
      setErrorMsg('Please select a leave type');
      return;
    }

    if (!startDate || !endDate) {
      setErrorMsg('Please select valid start and end dates');
      return;
    }

    if (calculatedDays <= 0) {
      setErrorMsg('Selected date range contains 0 working days (weekends/holidays).');
      return;
    }

    if (selectedLT?.requiresAttachment && !attachmentName) {
      setErrorMsg(`${selectedLT.name} requires a medical document or certificate.`);
      return;
    }

    if (!reason.trim()) {
      setErrorMsg('Please provide a reason for your leave request.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      applyLeaveRequest({
        employeeId: currentUser.id,
        leaveTypeId: selectedLeaveTypeId,
        startDate,
        endDate: isHalfDay ? startDate : endDate,
        numberOfDays: calculatedDays,
        isHalfDay,
        halfDayType: isHalfDay ? halfDayType : undefined,
        reason,
        emergencyContact,
        attachmentName: attachmentName || undefined,
        attachmentUrl: attachmentName ? '#' : undefined
      });

      setIsSubmitting(false);
      onClose();
    }, 350);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for Leave"
      subtitle={currentUser.role === 'MANAGER' ? "Submit manager absence request for administrator approval" : "Submit an official absence request for manager review"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Manager Leave Notice Banner */}
        {currentUser.role === 'MANAGER' && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong>Administrator Approval Routed:</strong> As a Department Manager, this leave application will be directed to the <strong>Administrator Portal</strong> for executive review.
            </span>
          </div>
        )}
        
        {/* Error Notification Banner */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Select Leave Category */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black flex items-center justify-center">
                1
              </span>
              <span>Select Leave Category</span>
            </label>
            <span className="text-[11px] text-slate-400">Choose quota</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {leaveTypes.map(lt => {
              const bal = leaveBalances.find(
                b => b.employeeId === currentUser.id && b.leaveTypeId === lt.id
              );
              const isSelected = selectedLeaveTypeId === lt.id;
              const remainingDays = bal ? bal.remaining : lt.maxDaysPerYear;

              return (
                <button
                  type="button"
                  key={lt.id}
                  onClick={() => setSelectedLeaveTypeId(lt.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  id={`lt-select-${lt.code.toLowerCase()}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: lt.color }}
                    />
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      {lt.code}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-2 truncate">{lt.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Available: <strong className="text-indigo-700">{remainingDays}</strong> days
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: Dates & Duration */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black flex items-center justify-center">
                2
              </span>
              <span>Schedule & Duration</span>
            </label>
            <span className="text-[11px] text-slate-500">Weekends & holidays excluded</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={e => {
                    setStartDate(e.target.value);
                    if (endDate < e.target.value) setEndDate(e.target.value);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  id="leave-start-date"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="date"
                  disabled={isHalfDay}
                  value={isHalfDay ? startDate : endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none disabled:bg-slate-100"
                  id="leave-end-date"
                  required
                />
              </div>
            </div>
          </div>

          {/* Half Day Option */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-200 gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isHalfDay}
                onChange={e => setIsHalfDay(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                id="is-halfday-checkbox"
              />
              <span className="text-xs font-medium text-slate-700">Apply for Half-Day Leave</span>
            </label>

            {isHalfDay && (
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setHalfDayType('FIRST_HALF')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    halfDayType === 'FIRST_HALF'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Morning (AM)
                </button>
                <button
                  type="button"
                  onClick={() => setHalfDayType('SECOND_HALF')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    halfDayType === 'SECOND_HALF'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Afternoon (PM)
                </button>
              </div>
            )}
          </div>

          {/* Calculated Working Days Display */}
          <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium">Working Days Requested:</span>
            <span className="font-extrabold text-indigo-700 text-sm">
              {calculatedDays} {calculatedDays === 1 ? 'Working Day' : 'Working Days'}
            </span>
          </div>

          {/* Balance Exceeded Warning Banner */}
          {isExceedingBalance && (
            <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Balance Notice:</strong> Requested duration ({calculatedDays} days) exceeds your available quota of{' '}
                <strong>{activeBalance?.remaining || 0} days</strong>. This application will be submitted as an excess request subject to managerial discretion.
              </span>
            </div>
          )}
        </div>

        {/* STEP 3: Reason & Documentation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black flex items-center justify-center">
                3
              </span>
              <span>Reason & Details</span>
            </label>
            <span className="text-[11px] text-slate-400">Required</span>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reason for Absence <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Taking family vacation / Medical appointment..."
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              id="leave-reason-textarea"
              required
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Number</label>
            <input
              type="text"
              value={emergencyContact}
              onChange={e => setEmergencyContact(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              id="emergency-contact-input"
            />
          </div>

          {/* Document Attachment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Supporting Document {selectedLT?.requiresAttachment && <span className="text-rose-500 font-bold">(Required for {selectedLT.code})</span>}
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
              <input
                type="file"
                id="leave-doc-upload"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="leave-doc-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-indigo-600">
                  {attachmentName ? attachmentName : 'Click to attach medical certificate or supporting document'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">PDF, PNG, JPG up to 5MB</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer tap-active"
            id="submit-leave-request-btn"
          >
            {isSubmitting ? (
              <span>Submitting Request...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Leave Request ({calculatedDays}d)</span>
              </>
            )}
          </button>
        </div>

      </form>
    </Modal>
  );
};
