import React, { useState } from 'react';
import { X, CheckSquare, MessageSquare } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { useApproveLeaveMutation } from '../../hooks/useLeaveMutations';
import type { LeaveRequestDto } from '@/dto/hrms/leaveRequest';

interface LeaveApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: LeaveRequestDto | null;
  approvalLevel: 'first' | 'second';
  onApprove: () => void | Promise<void>;
}

export function LeaveApprovalModal({
  isOpen,
  onClose,
  request,
  approvalLevel,
  onApprove,
}: LeaveApprovalModalProps) {
  const [decision, setDecision] = useState<'Approved' | 'Rejected'>('Approved');
  const [remarks, setRemarks] = useState('');
  const approveMutation = useApproveLeaveMutation();

  if (!isOpen || !request) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Fire the mutation
    approveMutation.mutate({
      requestId: request.id,
      approvalLevel,
      decision,
      remarks,
    });

    // 2. Call parent callback for any extra side-effects (e.g. datatable refresh)
    onApprove();
    
    // 3. Close immediately! Optimistic UI handles the rest
    onClose();
  };

  const formattedStartDate = new Date(request.startDate).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const formattedEndDate = new Date(request.endDate).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-left animate-in zoom-in-95 duration-200 m-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/75 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-slate-900/5 text-slate-700 flex items-center justify-center font-bold">
              <CheckSquare className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest leading-none">
                Approve / Reject Leave
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {approvalLevel === 'first' ? 'First-Level Review' : 'Second-Level Review'}
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Request Overview */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Applicant</span>
                <span className="text-sm font-bold text-slate-800">{request.employeeName}</span>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-150">
                {request.leaveTypeName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
                <span className="font-mono text-slate-700">{request.totalHours} hrs</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Timing</span>
                <span className="text-slate-700 font-medium block">{formattedStartDate}</span>
                <span className="text-slate-700 font-medium block">to {formattedEndDate}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reason</span>
              <p className="text-xs text-slate-600 font-medium italic mt-0.5">
                "{request.reason || 'No reason provided.'}"
              </p>
            </div>

            {request.employeeId !== request.submittedByEmployeeId && (
              <div className="border-t border-slate-200/60 pt-2 mt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Submitted On Behalf By
                </span>
                <span className="text-xs font-medium text-slate-700">{request.submittedByEmployeeName}</span>
                <p className="text-[11px] text-slate-500 italic mt-0.5">"{request.onBehalfReason}"</p>
              </div>
            )}
          </div>

          {/* Decision */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Decision
            </label>
            <div className="flex gap-4">
              <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-50 rounded-xl cursor-pointer transition-all duration-200">
                <input
                  type="radio"
                  name="decision"
                  value="Approved"
                  checked={decision === 'Approved'}
                  onChange={() => setDecision('Approved')}
                  className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-emerald-800">Approve</span>
              </label>

              <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-rose-50/50 border border-rose-100 hover:bg-rose-50 rounded-xl cursor-pointer transition-all duration-200">
                <input
                  type="radio"
                  name="decision"
                  value="Rejected"
                  checked={decision === 'Rejected'}
                  onChange={() => setDecision('Rejected')}
                  className="w-4 h-4 text-rose-600 border-slate-300 focus:ring-rose-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-rose-800">Reject</span>
              </label>
            </div>
          </div>

          {/* Remarks */}
          <div className="w-full flex flex-col gap-1.5 text-left">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> Review Remarks
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              placeholder="Provide comments, reasons, or guidance..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none transition-all duration-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100 resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3.5">
          <CustomButton
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs font-bold px-4 py-2 border-slate-200 text-slate-650 hover:bg-slate-100"
          >
            Cancel
          </CustomButton>
          <CustomButton
            type="button"
            onClick={handleSubmit}
            variant={decision === 'Approved' ? 'primary' : 'danger'}
            isLoading={approveMutation.isPending}
            className="text-xs font-bold px-5 py-2.5"
          >
            Confirm Decision
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
