import React, { useState, useEffect } from 'react';
import { X, Save, CalendarDays } from 'lucide-react';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomDateTime } from '@/components/custom/CustomDateTime';
import { CustomButton } from '@/components/custom/CustomButton';
import { companyHoliday } from '@/api/hrms/companyHoliday';
import { CompanyHolidayFormDto } from '@/dto/hrms/companyHoliday';

interface CompanyHolidayFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'view' | 'edit';
  holidayData?: any;
  onSave: () => void | Promise<void>;
}

export function CompanyHolidayFormModal({
  isOpen,
  onClose,
  mode,
  holidayData,
  onSave,
}: CompanyHolidayFormModalProps) {
  const [formData, setFormData] = useState<CompanyHolidayFormDto>({
    name: '',
    holidayDate: '',
    description: '',
    year: new Date().getFullYear(),
    isActive: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CompanyHolidayFormDto, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (holidayData && (mode === 'view' || mode === 'edit')) {
      setFormData({
        name: holidayData.name || '',
        holidayDate: holidayData.holidayDate ? holidayData.holidayDate.split('T')[0] : '',
        description: holidayData.description || '',
        year: holidayData.year || new Date().getFullYear(),
        isActive: holidayData.isActive !== false,
      });
      setErrors({});
    } else if (mode === 'create') {
      setFormData({
        name: '',
        holidayDate: '',
        description: '',
        year: new Date().getFullYear(),
        isActive: true,
      });
      setErrors({});
    }
  }, [holidayData, mode, isOpen]);

  // Handle auto-populating the year from holiday date selection
  const handleDateChange = (dateVal: string) => {
    let yearVal = formData.year;
    if (dateVal) {
      const parsedYear = new Date(dateVal).getFullYear();
      if (!isNaN(parsedYear)) {
        yearVal = parsedYear;
      }
    }
    setFormData({
      ...formData,
      holidayDate: dateVal,
      year: yearVal,
    });
  };

  if (!isOpen) return null;

  const isView = mode === 'view';
  const titleText = mode === 'create' ? 'Create Company Holiday' : mode === 'edit' ? 'Edit Company Holiday' : 'Company Holiday Details';

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CompanyHolidayFormDto, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.holidayDate) newErrors.holidayDate = 'Holiday Date is required';
    if (!formData.year) {
      newErrors.year = 'Year is required';
    } else if (formData.year < 1900 || formData.year > 2100) {
      newErrors.year = 'Please enter a valid year';
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
      if (mode === 'create') {
        await companyHoliday.create(formData);
      } else if (mode === 'edit' && holidayData?.id) {
        await companyHoliday.update(holidayData.id, formData);
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
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest leading-none">
                {titleText}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {mode === 'create' ? 'New Holiday Record' : `Record ID: ${holidayData?.id}`}
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
              label="Holiday Name"
              value={formData.name}
              onChange={(val) => setFormData({ ...formData, name: val })}
              error={errors.name}
              disabled={isView}
              placeholder="e.g. Christmas Day, New Year's Day"
            />

            <CustomDateTime
              label="Holiday Date"
              value={formData.holidayDate}
              onChange={handleDateChange}
              error={errors.holidayDate}
              disabled={isView}
              type="date"
            />

            <CustomInput
              label="Year"
              value={String(formData.year)}
              onChange={(val) => setFormData({ ...formData, year: Number(val) })}
              error={errors.year}
              disabled={isView}
              type="number"
              placeholder="e.g. 2026"
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
                placeholder="Details or reason for this holiday..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none transition-all duration-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100 disabled:opacity-50 resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3.5">
          <CustomButton
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs font-bold px-4 py-2 border-slate-200 text-slate-600 hover:bg-slate-100"
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
