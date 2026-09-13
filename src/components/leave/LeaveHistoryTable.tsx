import React, { useState } from 'react';
import { LeaveRequest } from '../../types';
import { getStatusBadgeClass, formatDate, downloadCSV } from '../../utils/helpers';
import { Search, Filter, Download, Eye, Calendar, User, FileSpreadsheet, ChevronRight, Clock, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface LeaveHistoryTableProps {
  requests: LeaveRequest[];
  onSelectRequest: (request: LeaveRequest) => void;
  title?: string;
  showEmployeeColumn?: boolean;
}

export const LeaveHistoryTable: React.FC<LeaveHistoryTableProps> = ({
  requests,
  onSelectRequest,
  title = 'Leave Applications',
  showEmployeeColumn = true
}) => {
  const { currentRole, currentUser } = useAuth();
  const { deleteLeaveRequest } = useData();
  const [requestToDelete, setRequestToDelete] = useState<LeaveRequest | null>(null);

  const canDelete = currentRole === 'MANAGER' || currentRole === 'ADMIN';

  const confirmDelete = () => {
    if (requestToDelete) {
      deleteLeaveRequest(requestToDelete.id, currentUser?.id, currentUser?.name, currentRole);
      setRequestToDelete(null);
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredRequests = requests.filter(r => {
    const matchesSearch =
      r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.leaveTypeName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || r.leaveTypeCode === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleExportCSV = () => {
    const exportData = filteredRequests.map(r => ({
      'Request No': r.requestNo,
      'Employee Name': r.employeeName,
      'Employee ID': r.employeeCode,
      'Department': r.departmentName,
      'Leave Type': r.leaveTypeName,
      'Start Date': r.startDate,
      'End Date': r.endDate,
      'Days': r.numberOfDays,
      'Status': r.status,
      'Reason': r.reason,
      'Applied At': r.appliedAt
    }));

    downloadCSV(`elms_leave_requests_${new Date().toISOString().split('T')[0]}`, exportData);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      
      {/* Table Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 bg-slate-50/50">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing <span className="font-bold text-slate-700">{filteredRequests.length}</span> of {requests.length} records
          </p>
        </div>

        {/* Search, Filters & Export */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          
          {/* Search Field */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee, request #..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all shadow-2xs"
              id="leave-search-input"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-2xs cursor-pointer"
              id="status-filter-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="NEEDS_INFO">Needs Info</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* CSV Export Button */}
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-bold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer tap-active shrink-0"
              id="export-csv-btn"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 px-4 text-slate-400">
          <FileSpreadsheet className="w-10 h-10 mx-auto mb-2.5 opacity-30 text-slate-500" />
          <p className="text-xs font-bold text-slate-600">No matching leave applications found.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Try refining your search keyword or status filter.</p>
        </div>
      ) : (
        <>
          {/* MOBILE VIEW (< md): Interactive Touch-Friendly Cards */}
          <div className="block md:hidden divide-y divide-slate-100">
            {filteredRequests.map(r => {
              const badgeStyle = getStatusBadgeClass(r.status);
              return (
                <div
                  key={r.id}
                  onClick={() => onSelectRequest(r)}
                  className="p-4 hover:bg-sky-50/40 active:bg-sky-50/70 transition-colors cursor-pointer tap-active space-y-2.5"
                >
                  {/* Top Row: Request No & Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-100">
                        {r.requestNo}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600">
                        {r.leaveTypeName}
                      </span>
                    </div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${badgeStyle.bg} ${badgeStyle.border}`}
                    >
                      {r.status}
                    </span>
                  </div>

                  {/* Middle Row: Employee & Department (if applicable) */}
                  {showEmployeeColumn && (
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-slate-900">{r.employeeName}</div>
                      <span className="text-[11px] text-slate-500 font-medium">{r.departmentName}</span>
                    </div>
                  )}

                  {/* Bottom Row: Dates, Duration & Action Link */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100/80 text-slate-600">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatDate(r.startDate)} → {formatDate(r.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        {r.numberOfDays}d
                      </span>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setRequestToDelete(r);
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer tap-active transition-colors"
                          id={`mobile-delete-btn-${r.id}`}
                          title="Delete leave request"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP VIEW (>= md): Full Structured Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Request #</th>
                  {showEmployeeColumn && <th className="py-3 px-4">Employee</th>}
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4 text-center">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map(r => {
                  const badgeStyle = getStatusBadgeClass(r.status);
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-sky-50/30 transition-colors group cursor-pointer"
                      onClick={() => onSelectRequest(r)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                        {r.requestNo}
                      </td>

                      {showEmployeeColumn && (
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{r.employeeName}</div>
                          <div className="text-[10px] text-slate-400">{r.departmentName}</div>
                        </td>
                      )}

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{r.leaveTypeName}</span>
                        <span className="ml-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                          {r.leaveTypeCode}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {formatDate(r.startDate)} → {formatDate(r.endDate)}
                      </td>

                      <td className="py-3.5 px-4 text-center font-extrabold text-slate-800">
                        {r.numberOfDays}d
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeStyle.bg} ${badgeStyle.border}`}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              onSelectRequest(r);
                            }}
                            className="px-2.5 py-1.5 text-xs font-bold text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer tap-active"
                            id={`view-btn-${r.id}`}
                            title="View request details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          {canDelete && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setRequestToDelete(r);
                              }}
                              className="px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer tap-active"
                              id={`delete-btn-${r.id}`}
                              title="Delete leave request"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
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

      {/* Delete Confirmation Modal */}
      {requestToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Delete Leave Request</h4>
                <p className="text-xs text-slate-500 font-mono">{requestToDelete.requestNo}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the leave application for <strong className="text-slate-900">{requestToDelete.employeeName}</strong> ({requestToDelete.leaveTypeName}, {requestToDelete.numberOfDays}d)? This will restore allocated quota balance.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRequestToDelete(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                id="cancel-delete-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer tap-active flex items-center gap-1.5"
                id="confirm-delete-btn"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
