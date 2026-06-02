import React, { useState, useEffect } from 'react';
import { X, Save, Settings } from 'lucide-react';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomButton } from '@/components/custom/CustomButton';
import { leave } from '@/api/hrms/leave';

export interface LeaveTypeFormData {
  id?: number;
  name: string;
  description: string;
  maxDaysPerYear: string;
}

interface LeaveTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'view' | 'edit';
  leaveTypeData?: any;
  onSave: () => void | Promise<void>;
}

export function LeaveTypeFormModal({
  isOpen,
  onClose,
  mode,
  leaveTypeData,
  onSave,
}: LeaveTypeFormModalProps) {
  const [formData, setFormData] = useState<LeaveTypeFormData>({
    name: '',
    description: '',
    maxDaysPerYear: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LeaveTypeFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (leaveTypeData && (mode === 'view' || mode === 'edit')) {
      setFormData({
        id: leaveTypeData.id,
        name: leaveTypeData.name || '',
        description: leaveTypeData.description || '',
        maxDaysPerYear: leaveTypeData.maxDaysPerYear ? String(leaveTypeData.maxDaysPerYear) : '',
      });
      setErrors({});
    } else if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        maxDaysPerYear: '',
      });
      setErrors({});
    }
  }, [leaveTypeData, mode, isOpen]);

  if (!isOpen) return null;

  const isView = mode === 'view';
  const titleText = mode === 'create' ? 'Create Leave Type' : mode === 'edit' ? 'Edit Leave Type' : 'Leave Type Policy';

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof LeaveTypeFormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.maxDaysPerYear) {
      newErrors.maxDaysPerYear = 'Max days per year is required';
    } else if (isNaN(Number(formData.maxDaysPerYear)) || Number(formData.maxDaysPerYear) <= 0) {
      newErrors.maxDaysPerYear = 'Must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isView) return;
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        maxDaysPerYear: Number(formData.maxDaysPerYear),
      };

      if (mode === 'create') {
        await leave.createLeaveType(payload);
      } else if (mode === 'edit' && formData.id) {
        await leave.updateLeaveType(formData.id, payload);
      }

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
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-left animate-in zoom-in-95 duration-200 m-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/75 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-slate-900/5 text-slate-700 flex items-center justify-center font-bold">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest leading-none">
                {titleText}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {mode === 'create' ? 'New Policy Draft' : `Policy ID: ${formData.id}`}
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <CustomInput
              label="Leave Type Name"
              value={formData.name}
              onChange={(val) => setFormData({ ...formData, name: val })}
              error={errors.name}
              disabled={isView}
              placeholder="e.g. Annual Leave, Sick Leave"
            />

            <div className="w-full flex flex-col gap-1.5 text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isView}
                rows={3}
                placeholder="Brief details about policy rules..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none transition-all duration-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100 disabled:opacity-50 resize-none"
              />
            </div>

            <CustomInput
              label="Max Days Per Year"
              value={formData.maxDaysPerYear}
              onChange={(val) => setFormData({ ...formData, maxDaysPerYear: val })}
              error={errors.maxDaysPerYear}
              disabled={isView}
              type="number"
              placeholder="e.g. 15"
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
            {isView ? 'Close' : 'Cancel'}
          </CustomButton>
          {!isView && (
            <CustomButton
              type="button"
              onClick={handleSubmit}
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<Save className="h-4 w-4" />}
              className="text-xs font-bold px-5 py-2.5"
            >
              {mode === 'create' ? 'Create' : 'Save Changes'}
            </CustomButton>
          )}
        </div>
      </div>
    </div>
  );
}
