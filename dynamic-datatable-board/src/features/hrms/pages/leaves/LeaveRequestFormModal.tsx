import React, { useState, useEffect } from 'react';
import { X, CalendarCheck } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomDropdown } from '@/components/custom/CustomDropdown';
import { CustomDateTime } from '@/components/custom/CustomDateTime';
import { leave } from '@/api/hrms/leave';
import type { LeaveRequestDto, LeaveSimulateResponseDto } from '@/dto/hrms/leaveRequest';
import type { LeaveBalanceDto } from '@/dto/hrms/leaveBalance';
import { Badge } from '@/components/ui/badge';

interface LeaveRequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'view';
  requestData?: LeaveRequestDto | null;
  onSave: () => void | Promise<void>;
}

export function LeaveRequestFormModal({
  isOpen,
  onClose,
  mode,
  requestData,
  onSave,
}: LeaveRequestFormModalProps) {
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveTypeId: '',
    startDate: '', // YYYY-MM-DD
    endDate: '',   // YYYY-MM-DD
    durationMode: 'fullDay', // 'fullDay' | 'morning' | 'afternoon'
    reason: '',
    submittedByEmployeeId: '',
    onBehalfReason: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulation, setSimulation] = useState<LeaveSimulateResponseDto | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isOnBehalf, setIsOnBehalf] = useState(false);
  const [balances, setBalances] = useState<LeaveBalanceDto[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  // Fetch balances when employeeId changes
  useEffect(() => {
    if (isOpen && formData.employeeId) {
      const fetchBalances = async () => {
        setIsLoadingBalances(true);
        try {
          const res = await leave.getLeaveBalances(Number(formData.employeeId));
          setBalances(res.data?.data || res.data || []);
          console.log(balances);
        } catch (err) {
          console.error('Failed to fetch leave balances:', err);
          setBalances([]);
        } finally {
          setIsLoadingBalances(false);
        }
      };
      fetchBalances();
    } else {
      setBalances([]);
    }
  }, [formData.employeeId, isOpen]);

  // Load current employee from local storage if available for defaults
  useEffect(() => {
    if (isOpen && mode === 'create') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user?.employeeId) {
            setFormData(prev => ({
              ...prev,
              employeeId: String(user.employeeId),
              submittedByEmployeeId: String(user.employeeId),
            }));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [isOpen, mode]);

  // Helper to build precise start and end times based on date + durationMode
  const getSimulatePayload = () => {
    if (!formData.startDate) return null;

    let startIso = '';
    let endIso = '';

    if (formData.durationMode === 'fullDay') {
      if (!formData.endDate) return null;
      startIso = `${formData.startDate}T08:00:00`;
      endIso = `${formData.endDate}T17:00:00`;
    } else if (formData.durationMode === 'morning') {
      startIso = `${formData.startDate}T08:00:00`;
      endIso = `${formData.startDate}T12:00:00`;
    } else { // afternoon
      startIso = `${formData.startDate}T13:00:00`;
      endIso = `${formData.startDate}T17:00:00`;
    }

    return {
      startDate: startIso,
      endDate: endIso,
    };
  };

  // Trigger simulations when dates or duration mode changes
  useEffect(() => {
    const payload = getSimulatePayload();
    if (mode === 'create' && payload) {
      const triggerSimulation = async () => {
        setIsSimulating(true);
        try {
          const res = await leave.simulateLeave(payload);
          setSimulation(res.data?.data || res.data);
        } catch (err) {
          console.error('Simulation failed', err);
          setSimulation(null);
        } finally {
          setIsSimulating(false);
        }
      };

      const delay = setTimeout(triggerSimulation, 400);
      return () => clearTimeout(delay);
    } else {
      setSimulation(null);
    }
  }, [formData.startDate, formData.endDate, formData.durationMode, mode]);

  // Sync requestData in view mode
  useEffect(() => {
    if (requestData && mode === 'view') {
      const startD = requestData.startDate ? requestData.startDate.split('T')[0] : '';
      const endD = requestData.endDate ? requestData.endDate.split('T')[0] : '';
      const startTime = requestData.startDate ? requestData.startDate.split('T')[1]?.substring(0, 5) : '';

      let durMode = 'fullDay';
      if (startTime === '08:00' && requestData.totalHours === 4) {
        durMode = 'morning';
      } else if (startTime === '13:00' && requestData.totalHours === 4) {
        durMode = 'afternoon';
      }

      setFormData({
        employeeId: String(requestData.employeeId),
        leaveTypeId: String(requestData.leaveTypeId),
        startDate: startD,
        endDate: endD,
        durationMode: durMode,
        reason: requestData.reason || '',
        submittedByEmployeeId: String(requestData.submittedByEmployeeId),
        onBehalfReason: requestData.onBehalfReason || '',
      });
      setIsOnBehalf(requestData.employeeId !== requestData.submittedByEmployeeId);
      setErrors({});
    } else if (mode === 'create') {
      setFormData({
        employeeId: '',
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        durationMode: 'fullDay',
        reason: '',
        submittedByEmployeeId: '',
        onBehalfReason: '',
      });
      setIsOnBehalf(false);
      setErrors({});
    }
  }, [requestData, mode, isOpen]);

  if (!isOpen) return null;

  const isView = mode === 'view';

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};
    if (!formData.employeeId) newErrors.employeeId = 'Employee is required';
    if (!formData.leaveTypeId) newErrors.leaveTypeId = 'Leave type is required';
    if (!formData.startDate) newErrors.startDate = 'Start Date is required';
    if (formData.durationMode === 'fullDay' && !formData.endDate) {
      newErrors.endDate = 'End Date is required';
    }
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';

    if (formData.durationMode === 'fullDay' && formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = 'End Date must be after or equal to Start Date';
      }
    }

    if (isOnBehalf) {
      if (!formData.submittedByEmployeeId) {
        newErrors.submittedByEmployeeId = 'Submitted by employee is required';
      }
      if (!formData.onBehalfReason?.trim()) {
        newErrors.onBehalfReason = 'On behalf reason is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isView) return;
    if (!validate()) return;

    const payloadTimes = getSimulatePayload();
    if (!payloadTimes) return;

    setIsSubmitting(true);
    try {
      const payload = {
        employeeId: Number(formData.employeeId),
        leaveTypeId: Number(formData.leaveTypeId),
        startDate: new Date(payloadTimes.startDate).toISOString(),
        endDate: new Date(payloadTimes.endDate).toISOString(),
        reason: formData.reason,
        submittedByEmployeeId: isOnBehalf ? Number(formData.submittedByEmployeeId) : Number(formData.employeeId),
        onBehalfReason: isOnBehalf ? formData.onBehalfReason : undefined,
      };

      await leave.createLeaveRequest(payload);
      await onSave();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden text-left animate-in zoom-in-95 duration-200 m-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/75 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-slate-900/5 text-slate-700 flex items-center justify-center font-bold">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest leading-none">
                {isView ? 'Leave Request Ledger File' : 'Apply for Leave'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {isView ? `Request ID: ${requestData?.id}` : 'Drafting new leave application'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex items-center gap-2">
              Leave Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomDropdown
                label="Employee"
                value={formData.employeeId}
                onChange={(val) => setFormData(prev => ({ ...prev, employeeId: val }))}
                apiEndpoint="api/Employees/dropdown"
                textProperty="fullName"
                valueProperty="id"
                placeholder="Select Employee"
                error={errors.employeeId}
                disabled={isView}
              />

              <CustomDropdown
                label="Leave Type"
                value={formData.leaveTypeId}
                onChange={(val) => setFormData(prev => ({ ...prev, leaveTypeId: val }))}
                apiEndpoint="api/Leaves/types"
                textProperty="name"
                valueProperty="id"
                placeholder="Select Leave Type"
                error={errors.leaveTypeId}
                disabled={isView}
              />
            </div>

            {/* Leave Balances Status */}
            {formData.employeeId && (
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2.5 animate-in fade-in duration-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                  📊 Leave Balances Status (โควตาวันลาคงเหลือ)
                </span>
                {isLoadingBalances ? (
                  <div className="text-xs text-slate-400 animate-pulse py-1">Loading leave balances...</div>
                ) : balances.length === 0 ? (
                  <div className="text-xs text-slate-400 italic py-1">No leave balance data available.</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {balances.map((bal) => (
                      <div key={bal.id || bal.leaveTypeId} className="bg-white p-2.5 rounded-lg border border-slate-100/80 flex flex-col justify-between shadow-3xs">
                        <span className="text-[11px] font-bold text-slate-700 truncate block">{bal.leaveTypeName}</span>
                        <div className="mt-1 flex items-baseline justify-between animate-in fade-in duration-300">
                          <span className="text-[10px] font-semibold text-slate-400">Remaining</span>
                          <span className={`text-xs font-bold font-mono ${bal.remainingHours > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {bal.remainingHours} hrs <span className="text-[10px] text-slate-450 font-normal font-sans">({(bal.remainingHours / 8).toFixed(1)}d)</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Time Slot Duration Segment */}
            <div className="w-full flex flex-col gap-1.5 text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
                Duration Segment (เวลาพักร้อน)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'fullDay', label: 'เต็มวัน (เต็มวัน 8 hr)' },
                  { value: 'morning', label: 'ช่วงเช้า (ข่วงเช้า-4 hr)' },
                  { value: 'afternoon', label: 'ช่วงบ่าย (ช่วงบ่าย -4 hr)' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center justify-center gap-2 p-2.5 border rounded-xl cursor-pointer text-xs font-semibold transition-all duration-200
                      ${formData.durationMode === opt.value
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-650 hover:bg-slate-100'}
                      ${isView ? 'pointer-events-none opacity-60' : ''}`}
                  >
                    <input
                      type="radio"
                      name="durationMode"
                      value={opt.value}
                      checked={formData.durationMode === opt.value}
                      onChange={() => setFormData(prev => ({ ...prev, durationMode: opt.value }))}
                      className="hidden"
                      disabled={isView}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomDateTime
                label="Start Date"
                value={formData.startDate}
                onChange={(val) => setFormData(prev => ({ ...prev, startDate: val }))}
                error={errors.startDate}
                disabled={isView}
              />

              {formData.durationMode === 'fullDay' && (
                <CustomDateTime
                  label="End Date"
                  value={formData.endDate}
                  onChange={(val) => setFormData(prev => ({ ...prev, endDate: val }))}
                  error={errors.endDate}
                  disabled={isView}
                />
              )}
            </div>

            {/* Simulation Results Widget */}
            {simulation && (
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                  🧮 Auto Calculation Simulation
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium block">Working Days</span>
                    <span className="text-sm font-bold text-slate-800 font-mono">{simulation.workingDays}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium block">Total Hours</span>
                    <span className="text-sm font-bold text-slate-800 font-mono">{simulation.totalHours} hrs</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium block">Excluded (Weekend/Holidays)</span>
                    <span className="text-sm font-bold text-slate-800 font-mono">{simulation.excludedDays} days</span>
                  </div>
                </div>
              </div>
            )}

            {isSimulating && (
              <div className="text-center py-2 text-xs text-slate-400 animate-pulse">
                Simulating leave durations...
              </div>
            )}

            <div className="w-full flex flex-col gap-1.5 text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
                Reason
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                disabled={isView}
                rows={3}
                placeholder="Reason for requesting leave..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none transition-all duration-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100 disabled:opacity-50 resize-none"
              />
              {errors.reason && (
                <span className="text-xs text-red-500 font-medium tracking-wide animate-in fade-in duration-200">
                  {errors.reason}
                </span>
              )}
            </div>
          </div>

          {/* On Behalf Section */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex items-center justify-between">
              <span>On Behalf Submission</span>
              {!isView && (
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsOnBehalf(!isOnBehalf)}>
                  <input
                    type="checkbox"
                    checked={isOnBehalf}
                    onChange={() => {}}
                    className="rounded border-slate-350 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-normal">
                    Apply on Behalf of Employee
                  </span>
                </div>
              )}
            </h4>

            {(isOnBehalf || (isView && requestData?.employeeId !== requestData?.submittedByEmployeeId)) && (
              <div className="space-y-4 animate-in fade-in duration-250">
                <CustomDropdown
                  label="Submitted By"
                  value={formData.submittedByEmployeeId}
                  onChange={(val) => setFormData(prev => ({ ...prev, submittedByEmployeeId: val }))}
                  apiEndpoint="api/Employees/dropdown"
                  textProperty="fullName"
                  valueProperty="id"
                  placeholder="Select Submitter"
                  error={errors.submittedByEmployeeId}
                  disabled={isView}
                />

                <div className="w-full flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
                    On Behalf Reason
                  </label>
                  <textarea
                    value={formData.onBehalfReason}
                    onChange={(e) => setFormData(prev => ({ ...prev, onBehalfReason: e.target.value }))}
                    disabled={isView}
                    rows={2}
                    placeholder="Why are you applying on behalf of this employee?"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none transition-all duration-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100 disabled:opacity-50 resize-none"
                  />
                  {errors.onBehalfReason && (
                    <span className="text-xs text-red-500 font-medium tracking-wide animate-in fade-in duration-200">
                      {errors.onBehalfReason}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* View Approval Log Chain */}
          {isView && requestData && (
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex items-center gap-2">
                Approval workflow logs
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">First-Level Approver</span>
                  <span className="text-sm font-semibold text-slate-700">{requestData.firstApproverName || 'None assigned'}</span>
                  <div className="pt-1.5">
                    <Badge variant={requestData.firstApprovalStatus === 'Approved' ? 'success' : requestData.firstApprovalStatus === 'Rejected' ? 'destructive' : 'default'}>
                      {requestData.firstApprovalStatus}
                    </Badge>
                  </div>
                  {requestData.firstApprovalReason && (
                    <div className="mt-2 text-[11px] text-slate-600 bg-slate-100 p-2 rounded-lg italic">
                      "{requestData.firstApprovalReason}"
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Second-Level Approver</span>
                  <span className="text-sm font-semibold text-slate-700">{requestData.secondApproverName || 'None assigned'}</span>
                  <div className="pt-1.5">
                    <Badge variant={requestData.secondApprovalStatus === 'Approved' ? 'success' : requestData.secondApprovalStatus === 'Rejected' ? 'destructive' : 'default'}>
                      {requestData.secondApprovalStatus}
                    </Badge>
                  </div>
                  {requestData.secondApprovalReason && (
                    <div className="mt-2 text-[11px] text-slate-600 bg-slate-100 p-2 rounded-lg italic">
                      "{requestData.secondApprovalReason}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3.5">
          <CustomButton
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs font-bold px-4 py-2 border-slate-200 text-slate-650 hover:bg-slate-100"
          >
            {isView ? 'Close' : 'Cancel'}
          </CustomButton>
          {!isView && (
            <CustomButton
              type="button"
              onClick={handleSubmit}
              variant="primary"
              isLoading={isSubmitting}
              className="text-xs font-bold px-5 py-2.5"
            >
              Submit Application
            </CustomButton>
          )}
        </div>
      </div>
    </div>
  );
}
