import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { downloadCSV, printReport, formatDate } from '../../utils/helpers';
import { BarChart3, Download, Printer, Filter, Calendar } from 'lucide-react';

export const ReportsEngine: React.FC = () => {
  const { leaveRequests, leaveBalances, users, departments, attendance } = useData();

  const [reportType, setReportType] = useState('LEAVE_REQUESTS');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Filter requests for report
  const filteredRequests = leaveRequests.filter(r => {
    const matchesDept = selectedDept === 'ALL' || r.departmentId === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;
    const matchesStart = !startDateFilter || r.startDate >= startDateFilter;
    const matchesEnd = !endDateFilter || r.endDate <= endDateFilter;
    return matchesDept && matchesStatus && matchesStart && matchesEnd;
  });

  // Calculate analytics
  const totalApprovedDays = filteredRequests
    .filter(r => r.status === 'APPROVED')
    .reduce((acc, r) => acc + r.numberOfDays, 0);

  const statusCounts = {
    APPROVED: filteredRequests.filter(r => r.status === 'APPROVED').length,
    PENDING: filteredRequests.filter(r => r.status === 'PENDING').length,
    REJECTED: filteredRequests.filter(r => r.status === 'REJECTED').length,
    CANCELLED: filteredRequests.filter(r => r.status === 'CANCELLED').length
  };

  const totalFiltered = filteredRequests.length;
  const approvalRate = totalFiltered > 0 ? Math.round((statusCounts.APPROVED / totalFiltered) * 100) : 0;
  const pendingRate = totalFiltered > 0 ? Math.round((statusCounts.PENDING / totalFiltered) * 100) : 0;
  const rejectionRate = totalFiltered > 0 ? Math.round((statusCounts.REJECTED / totalFiltered) * 100) : 0;

  const handleExportCSV = () => {
    if (reportType === 'LEAVE_REQUESTS') {
      const data = filteredRequests.map(r => ({
        'Request No': r.requestNo,
        'Employee': r.employeeName,
        'Department': r.departmentName,
        'Leave Type': r.leaveTypeName,
        'Start Date': r.startDate,
        'End Date': r.endDate,
        'Days': r.numberOfDays,
        'Status': r.status,
        'Reason': r.reason
      }));
      downloadCSV('elms_leave_report', data);
    } else if (reportType === 'LEAVE_BALANCES') {
      const data = leaveBalances.map(b => {
        const emp = users.find(u => u.id === b.employeeId);
        return {
          'Employee ID': emp?.employeeId || '-',
          'Employee Name': emp?.name || '-',
          'Leave Type': b.leaveTypeName,
          'Allocated': b.allocated,
          'Used': b.used,
          'Pending': b.pending,
          'Remaining': b.remaining
        };
      });
      downloadCSV('elms_leave_balances_report', data);
    } else if (reportType === 'ATTENDANCE') {
      const data = attendance.map(a => ({
        'Date': a.date,
        'Employee': a.employeeName,
        'Check In': a.checkInTime || '-',
        'Check Out': a.checkOutTime || '-',
        'Total Hours': a.totalHours || '-',
        'Status': a.status
      }));
      downloadCSV('elms_attendance_report', data);
    }
  };

  const handlePrintPDF = () => {
    if (reportType === 'LEAVE_REQUESTS') {
      const headers = ['Req #', 'Employee', 'Dept', 'Leave Type', 'Start', 'End', 'Days', 'Status'];
      const rows = filteredRequests.map(r => [
        r.requestNo,
        r.employeeName,
        r.departmentName,
        r.leaveTypeName,
        r.startDate,
        r.endDate,
        r.numberOfDays,
        r.status
      ]);
      printReport('Employee Leave Request Master Audit', headers, rows);
    } else if (reportType === 'LEAVE_BALANCES') {
      const headers = ['Emp Code', 'Employee Name', 'Leave Type', 'Allocated', 'Used', 'Pending', 'Remaining'];
      const rows = leaveBalances.map(b => {
        const emp = users.find(u => u.id === b.employeeId);
        return [
          emp?.employeeId || '-',
          emp?.name || '-',
          b.leaveTypeName,
          b.allocated,
          b.used,
          b.pending,
          b.remaining
        ];
      });
      printReport('Leave Balance Allocation & Usage Ledger', headers, rows);
    } else if (reportType === 'ATTENDANCE') {
      const headers = ['Date', 'Employee', 'Check In', 'Check Out', 'Hours', 'Status'];
      const rows = attendance.map(a => [
        a.date,
        a.employeeName,
        a.checkInTime || '-',
        a.checkOutTime || '-',
        a.totalHours ? `${a.totalHours}h` : '-',
        a.status
      ]);
      printReport('Monthly Attendance & Clocking Register', headers, rows);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>Executive Reporting & Analytics Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Export corporate CSV ledgers, print official audit PDFs, and analyze workforce absence trends.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer tap-active"
            id="report-export-csv-btn"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPDF}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer tap-active"
            id="report-print-pdf-btn"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Approved Days
          </span>
          <div className="text-2xl font-black text-slate-900">
            {totalApprovedDays} <span className="text-xs text-slate-400 font-normal">Working Days</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-4/5 rounded-full" />
          </div>
          <p className="text-[10px] text-slate-400">Total approved absence time</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Approval Rate
          </span>
          <div className="text-2xl font-black text-emerald-600">{approvalRate}%</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${approvalRate}%` }} />
          </div>
          <p className="text-[10px] text-slate-400">{statusCounts.APPROVED} granted applications</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Pending Review
          </span>
          <div className="text-2xl font-black text-amber-600">{statusCounts.PENDING}</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, pendingRate * 2)}%` }} />
          </div>
          <p className="text-[10px] text-slate-400">{pendingRate}% of filtered volume</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Rejection Rate
          </span>
          <div className="text-2xl font-black text-rose-600">{rejectionRate}%</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${rejectionRate}%` }} />
          </div>
          <p className="text-[10px] text-slate-400">{statusCounts.REJECTED} rejected requests</p>
        </div>
      </div>

      {/* Clean Status Distribution Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Decision Distribution Chart
          </h3>
          <span className="text-xs text-slate-500">{totalFiltered} matching requests</span>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="w-full h-4 rounded-lg bg-slate-100 overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${approvalRate}%` }}
            title={`Approved: ${approvalRate}%`}
          />
          <div
            className="bg-amber-500 h-full transition-all duration-500"
            style={{ width: `${pendingRate}%` }}
            title={`Pending: ${pendingRate}%`}
          />
          <div
            className="bg-rose-500 h-full transition-all duration-500"
            style={{ width: `${rejectionRate}%` }}
            title={`Rejected: ${rejectionRate}%`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Approved ({statusCounts.APPROVED} • {approvalRate}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Pending ({statusCounts.PENDING} • {pendingRate}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Rejected ({statusCounts.REJECTED} • {rejectionRate}%)</span>
          </div>
        </div>
      </div>

      {/* Filter Parameters Section with Date Range, Dept, and Status */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Report Parameters & Date Range Filter</span>
          </h3>
          {(startDateFilter || endDateFilter || selectedDept !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSelectedDept('ALL');
                setSelectedStatus('ALL');
                setStartDateFilter('');
                setEndDateFilter('');
              }}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Report Module</label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none cursor-pointer"
              id="report-type-select"
            >
              <option value="LEAVE_REQUESTS">Leave Applications</option>
              <option value="LEAVE_BALANCES">Balances & Allocations</option>
              <option value="ATTENDANCE">Attendance Register</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none cursor-pointer"
              id="report-dept-select"
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none cursor-pointer"
              id="report-status-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">From Date</label>
            <input
              type="date"
              value={startDateFilter}
              onChange={e => setStartDateFilter(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">To Date</label>
            <input
              type="date"
              value={endDateFilter}
              onChange={e => setEndDateFilter(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Generated Preview Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900">Generated Ledger Preview</h3>
          <span className="text-xs text-slate-500 font-mono">
            {reportType === 'LEAVE_REQUESTS'
              ? `${filteredRequests.length} Records`
              : reportType === 'LEAVE_BALANCES'
              ? `${leaveBalances.length} Records`
              : `${attendance.length} Records`}
          </span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                {reportType === 'LEAVE_REQUESTS' && (
                  <>
                    <th className="py-2.5 px-3">Req #</th>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Leave Type</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Days</th>
                    <th className="py-2.5 px-3">Status</th>
                  </>
                )}

                {reportType === 'LEAVE_BALANCES' && (
                  <>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Allocated</th>
                    <th className="py-2.5 px-3">Used</th>
                    <th className="py-2.5 px-3">Pending</th>
                    <th className="py-2.5 px-3">Remaining</th>
                  </>
                )}

                {reportType === 'ATTENDANCE' && (
                  <>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Check In</th>
                    <th className="py-2.5 px-3">Check Out</th>
                    <th className="py-2.5 px-3">Hours</th>
                    <th className="py-2.5 px-3">Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportType === 'LEAVE_REQUESTS' &&
                filteredRequests.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{r.requestNo}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{r.employeeName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{r.departmentName}</td>
                    <td className="py-2.5 px-3">{r.leaveTypeName}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      {formatDate(r.startDate)} → {formatDate(r.endDate)}
                    </td>
                    <td className="py-2.5 px-3 font-bold">{r.numberOfDays}d</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                        r.status === 'REJECTED' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}

              {reportType === 'LEAVE_BALANCES' &&
                leaveBalances.map(b => {
                  const emp = users.find(u => u.id === b.employeeId);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{emp?.name || '-'}</td>
                      <td className="py-2.5 px-3">{b.leaveTypeName}</td>
                      <td className="py-2.5 px-3 font-mono">{b.allocated}d</td>
                      <td className="py-2.5 px-3 font-mono text-rose-600 font-bold">{b.used}d</td>
                      <td className="py-2.5 px-3 font-mono text-amber-600">{b.pending}d</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">{b.remaining}d</td>
                    </tr>
                  );
                })}

              {reportType === 'ATTENDANCE' &&
                attendance.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono">{a.date}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{a.employeeName}</td>
                    <td className="py-2.5 px-3 font-mono">{a.checkInTime || '-'}</td>
                    <td className="py-2.5 px-3 font-mono">{a.checkOutTime || '-'}</td>
                    <td className="py-2.5 px-3 font-bold">{a.totalHours ? `${a.totalHours}h` : '-'}</td>
                    <td className="py-2.5 px-3 font-bold">{a.status}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (hidden on desktop) */}
        <div className="md:hidden space-y-2.5">
          {reportType === 'LEAVE_REQUESTS' &&
            filteredRequests.map(r => (
              <div key={r.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{r.employeeName}</span>
                  <span className="font-mono text-indigo-700 font-bold text-[10px]">{r.requestNo}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 text-[11px]">
                  <span>{r.leaveTypeName} ({r.numberOfDays}d)</span>
                  <span className="font-bold text-emerald-700">{r.status}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {formatDate(r.startDate)} → {formatDate(r.endDate)}
                </div>
              </div>
            ))}
        </div>
      </div>

    </div>
  );
};
