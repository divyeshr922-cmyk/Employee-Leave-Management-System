import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { LeaveRequest, Role } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { getStatusBadgeClass, formatDate, formatDateTime } from '../../utils/helpers';
import {
  Calendar,
  Clock,
  User,
  Building,
  FileText,
  Paperclip,
  CheckCircle2,
  XCircle,
  HelpCircle,
  History,
  MessageSquare,
  AlertCircle,
  Shield
} from 'lucide-react';

interface LeaveDetailModalProps {
  request: LeaveRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LeaveDetailModal: React.FC<LeaveDetailModalProps> = ({
  request,
  isOpen,
  onClose
}) => {
  const { currentUser, currentRole } = useAuth();
  const { users, reviewLeaveRequest, cancelLeaveRequest } = useData();
  const [reviewComment, setReviewComment] = useState('');
  const [actionError, setActionError] = useState('');

  if (!request) return null;

  const badgeStyle = getStatusBadgeClass(request.status);

  // Check if the applicant is a manager
  const requester = users.find(u => u.id === request.employeeId);
  const isManagerRequest = requester?.role === 'MANAGER';

  // Strict approval routing:
  // - Managers cannot approve their own requests
  // - Requests by Managers can ONLY be reviewed/approved by an Administrator
  // - Managers can only review requests from subordinate Employees
  const canReview =
    request.status === 'PENDING' &&
    currentUser?.id !== request.employeeId &&
    (currentRole === 'ADMIN' || (currentRole === 'MANAGER' && !isManagerRequest));

  const canCancel =
    (request.status === 'PENDING' || request.status === 'APPROVED') &&
    currentUser?.id === request.employeeId;

  const handleReview = (action: 'APPROVED' | 'REJECTED' | 'NEEDS_INFO') => {
    setActionError('');
    if (action === 'REJECTED' && !reviewComment.trim()) {
      setActionError('Please enter a comment explaining the rejection.');
      return;
    }

    if (currentUser) {
      reviewLeaveRequest(
        request.id,
        action,
        currentUser.id,
        currentUser.name,
        currentRole,
        reviewComment
      );
      setReviewComment('');
      onClose();
    }
  };

  const handleCancel = () => {
    if (currentUser && confirm('Are you sure you want to cancel this leave application?')) {
      cancelLeaveRequest(request.id, currentUser.id);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Leave Request Details - ${request.requestNo}`}>
      <div className="space-y-6">

        {/* Top Header Card */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <div className="text-xs text-slate-500 font-mono">{request.requestNo}</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">{request.leaveTypeName}</div>
            <div className="text-xs text-slate-500 mt-1">
              Applied on: {formatDateTime(request.appliedAt)}
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeStyle.bg} ${badgeStyle.border}`}
          >
            {request.status}
          </span>
        </div>

        {/* Manager Leave Executive Routing Indicator */}
        {isManagerRequest && (
          <div id="executive-routing-notice" className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              <strong>Executive Routing Notice:</strong> This leave application was submitted by Department Manager <strong>{request.employeeName}</strong>. By policy, it is routed exclusively to the <strong>Administrator</strong> for approval.
            </span>
          </div>
        )}

        {/* Employee & Leave Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          <div className="p-3.5 border border-slate-200 rounded-xl space-y-2">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] text-slate-400">
              Applicant Details
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-900">{request.employeeName}</span>
              <span className="text-slate-400 font-mono">({request.employeeCode})</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{request.departmentName}</span>
            </div>
          </div>

          <div className="p-3.5 border border-slate-200 rounded-xl space-y-2">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] text-slate-400">
              Duration & Days
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span className="font-semibold text-slate-800">
                {formatDate(request.startDate)} → {formatDate(request.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                Total Duration: <strong className="text-sky-700">{request.numberOfDays} Day(s)</strong>
                {request.isHalfDay && ` (${request.halfDayType === 'FIRST_HALF' ? 'First Half' : 'Second Half'})`}
              </span>
            </div>
          </div>

        </div>

        {/* Reason & Contact */}
        <div className="space-y-3">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              Reason for Absence
            </div>
            <p className="text-xs text-slate-700 leading-relaxed italic">
              "{request.reason}"
            </p>
          </div>

          {request.emergencyContact && (
            <div className="text-xs text-slate-600 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200">
              Emergency Contact: <strong className="text-slate-900">{request.emergencyContact}</strong>
            </div>
          )}

          {request.attachmentName && (
            <div className="flex items-center justify-between p-3 bg-sky-50/60 border border-sky-100 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-sky-900 font-medium">
                <Paperclip className="w-4 h-4 text-sky-600" />
                <span>{request.attachmentName}</span>
              </div>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  alert(`Viewing attached document: ${request.attachmentName}`);
                }}
                className="text-sky-700 hover:underline font-bold"
              >
                View Attachment
              </a>
            </div>
          )}
        </div>

        {/* Audit Review History Timeline */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <History className="w-4 h-4 text-slate-400" /> Approval Workflow Timeline
          </h4>

          <div className="border-l-2 border-slate-200 pl-4 space-y-4">
            {request.reviewHistory.map(step => (
              <div key={step.id} className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-sky-500 ring-4 ring-white" />
                <div className="text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{step.reviewerName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatDateTime(step.timestamp)}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-0.5 font-medium">
                    Action: <span className="font-bold text-slate-800">{step.action}</span> ({step.reviewerRole})
                  </div>
                  {step.comment && (
                    <div className="mt-1 p-2 bg-slate-50 rounded-lg text-slate-700 text-[11px] border border-slate-200">
                      "{step.comment}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manager/Admin Review Controls */}
        {canReview && (
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-600" /> Review Decision Controls
            </h4>

            {actionError && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <textarea
              rows={2}
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Add review remarks or approval notes..."
              className="w-full p-2.5 text-xs border border-indigo-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              id="review-comment-input"
            />

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleReview('NEEDS_INFO')}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1 transition-all"
                id="review-needs-info-btn"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Request Info
              </button>

              <button
                type="button"
                onClick={() => handleReview('REJECTED')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1 transition-all"
                id="review-reject-btn"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject Request
              </button>

              <button
                type="button"
                onClick={() => handleReview('APPROVED')}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1 transition-all"
                id="review-approve-btn"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve Leave
              </button>
            </div>
          </div>
        )}

        {/* Cancel Button for Employee */}
        {canCancel && (
          <div className="pt-2 flex justify-start">
            <button
              onClick={handleCancel}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors"
              id="cancel-request-btn"
            >
              Cancel Leave Request
            </button>
          </div>
        )}

      </div>
    </Modal>
  );
};
