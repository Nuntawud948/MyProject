import React, { useState, useEffect } from 'react';
import { X, Save, User, Briefcase } from 'lucide-react';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomDateTime } from '@/components/custom/CustomDateTime';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomDropdown } from '@/components/custom/CustomDropdown';
import { Badge } from '@/components/ui/badge';
import { TITLE_OPTIONS } from '@/constants/title';
import { EMPLOYMENT_TYPE_OPTIONS } from '@/constants/employmentType';

export interface EmployeeFormData {
  id?: string;
  code: string;
  title: string;
  firstName: string;
  lastName: string;
  startDate: string;
  endDate: string;
  departmentId: string;
  roleId: string;
  firstApproverId: string;
  secondApproverId: string;
  phoneNumber: string;
  employmentType: string;
  salary: string;
  isActive: boolean;
}

interface EmployeeCreateViewUpdatePageProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'view' | 'edit';
  employeeData?: any;
  onSave: (data: EmployeeFormData) => Promise<void> | void;
}

export function EmployeeCreateViewUpdatePage({
  isOpen,
  onClose,
  mode,
  employeeData,
  onSave,
}: EmployeeCreateViewUpdatePageProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    code: '',
    title: 'Mr.',
    firstName: '',
    lastName: '',
    startDate: '',
    endDate: '',
    departmentId: '',
    roleId: '',
    firstApproverId: '',
    secondApproverId: '',
    phoneNumber: '',
    employmentType: 'Full-time',
    salary: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state with incoming employeeData when modal opens or updates
  useEffect(() => {
    if (employeeData && (mode === 'view' || mode === 'edit')) {
      const startStr = employeeData.startDate instanceof Date
        ? employeeData.startDate.toISOString().split('T')[0]
        : employeeData.startDate ? String(employeeData.startDate).split('T')[0] : '';
      const endStr = employeeData.endDate instanceof Date
        ? employeeData.endDate.toISOString().split('T')[0]
        : employeeData.endDate ? String(employeeData.endDate).split('T')[0] : '';

      setFormData({
        id: employeeData.id || '',
        code: employeeData.code || '',
        title: employeeData.title || 'Mr.',
        firstName: employeeData.firstName || employeeData.fullName?.split(' ')[0] || '',
        lastName: employeeData.lastName || employeeData.fullName?.split(' ')[1] || '',
        startDate: startStr,
        endDate: endStr,
        departmentId: employeeData.departmentId ? String(employeeData.departmentId) : '',
        roleId: employeeData.roleId ? String(employeeData.roleId) : '',
        firstApproverId: employeeData.firstApproverId ? String(employeeData.firstApproverId) : '',
        secondApproverId: employeeData.secondApproverId ? String(employeeData.secondApproverId) : '',
        phoneNumber: employeeData.phoneNumber !== '-' ? employeeData.phoneNumber || '' : '',
        employmentType: employeeData.employmentType || 'Full-time',
        salary: employeeData.salary ? String(employeeData.salary) : '',
        isActive: employeeData.isActive !== undefined ? employeeData.isActive : true,
      });
      setErrors({});
    } else if (mode === 'create') {
      setFormData({
        code: `EMP${Math.floor(1000 + Math.random() * 9000)}`, // Auto generate code prefix
        title: 'Mr.',
        firstName: '',
        lastName: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        departmentId: '',
        roleId: '',
        firstApproverId: '',
        secondApproverId: '',
        phoneNumber: '',
        employmentType: 'Full-time',
        salary: '',
        isActive: true,
      });
      setErrors({});
    }
  }, [employeeData, mode, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};
    if (!formData.code) newErrors.code = 'Employee Code is required';
    if (!formData.firstName) newErrors.firstName = 'First Name is required';
    if (!formData.lastName) newErrors.lastName = 'Last Name is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.departmentId) newErrors.departmentId = 'Department is required';
    if (!formData.roleId) newErrors.roleId = 'Role is required';

    if (formData.salary && isNaN(Number(formData.salary.replace(/,/g, '')))) {
      newErrors.salary = 'Must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isView = mode === 'view';
  const titleText = mode === 'create' ? 'Register New Employee' : mode === 'edit' ? 'Edit Employee File' : 'Employee Registry File';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden text-left animate-in zoom-in-95 duration-200 m-4 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/75 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-slate-900/5 text-slate-700 flex items-center justify-center font-bold">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest leading-none">
                {titleText}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {formData.code || 'Drafting new record'}
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

          {/* Main Info Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex items-center gap-2">
              <User className="h-3.5 w-3.5" /> Personal Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="w-full flex flex-col gap-1.5 text-left">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">Title</label>
                <select
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={isView}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-850 focus:border-slate-900 focus:ring-4 focus:ring-slate-100 outline-none disabled:opacity-75 disabled:pointer-events-none"
                >
                  {TITLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <CustomInput
                label="First Name"
                value={formData.firstName}
                onChange={(val) => setFormData({ ...formData, firstName: val })}
                error={errors.firstName}
                disabled={isView}
                placeholder="John"
              />

              <CustomInput
                label="Last Name"
                value={formData.lastName}
                onChange={(val) => setFormData({ ...formData, lastName: val })}
                error={errors.lastName}
                disabled={isView}
                placeholder="Doe"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomInput
                label="Code (Auto Generated can be edited)"
                value={formData.code}
                onChange={(val) => setFormData({ ...formData, code: val })}
                error={errors.code}
                disabled={isView || mode === 'edit'}
                placeholder="EMP1001"
              />
              <CustomInput
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(val) => setFormData({ ...formData, phoneNumber: val })}
                error={errors.phoneNumber}
                disabled={isView}
                placeholder="081-234-5678"
              />
            </div>
          </div>

          {/* Job details & Salary */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5" /> Employment Information
            </h4>

            {/* Grid Row 1: Searchable Department & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomDropdown
                label="Department"
                value={formData.departmentId}
                onChange={(val) => setFormData({ ...formData, departmentId: val })}
                apiEndpoint="api/Departments/dropdown"
                textProperty="name"
                valueProperty="id"
                placeholder="Select Department"
                error={errors.departmentId}
                disabled={isView}
              />

              <CustomDropdown
                label="Role"
                value={formData.roleId}
                onChange={(val) => setFormData({ ...formData, roleId: val })}
                apiEndpoint="api/Roles/dropdown"
                textProperty="name"
                valueProperty="id"
                placeholder="Select Role"
                error={errors.roleId}
                disabled={isView}
              />
            </div>

            {/* Grid Row 1.5: Approvers Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomDropdown
                label="First Approver"
                value={formData.firstApproverId}
                onChange={(val) => setFormData({ ...formData, firstApproverId: val })}
                apiEndpoint="api/Employees/dropdown"
                textProperty="fullName"
                valueProperty="id"
                placeholder="Select First Approver"
                error={errors.firstApproverId}
                disabled={isView}
              />

              <CustomDropdown
                label="Second Approver"
                value={formData.secondApproverId}
                onChange={(val) => setFormData({ ...formData, secondApproverId: val })}
                apiEndpoint="api/Employees/dropdown"
                textProperty="fullName"
                valueProperty="id"
                placeholder="Select Second Approver"
                error={errors.secondApproverId}
                disabled={isView}
              />
            </div>

            {/* Grid Row 2: Employment Type & Salary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="w-full flex flex-col gap-1.5 text-left">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">Employment Type</label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                  disabled={isView}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-850 focus:border-slate-900 focus:ring-4 focus:ring-slate-100 outline-none disabled:opacity-75 disabled:pointer-events-none"
                >
                  {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <CustomInput
                label="Salary (THB)"
                type="number"
                numberFormat="decimal"
                value={formData.salary}
                onChange={(val) => setFormData({ ...formData, salary: val })}
                error={errors.salary}
                disabled={isView}
                placeholder="50,000.00"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomDateTime
                label="Start Date"
                value={formData.startDate}
                onChange={(val) => setFormData({ ...formData, startDate: val })}
                error={errors.startDate}
                disabled={isView}
              />

              <CustomDateTime
                label="End Date"
                value={formData.endDate}
                onChange={(val) => setFormData({ ...formData, endDate: val })}
                error={errors.endDate}
                disabled={isView}
              />
            </div>

            {/* Status Switch */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                  Employment Status
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Toggle whether this employee is currently working or resigned
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={formData.isActive ? 'success' : 'destructive'}>
                  {formData.isActive ? 'Active' : 'Resigned'}
                </Badge>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  disabled={isView}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-10 h-6 bg-slate-300 rounded-full appearance-none relative checked:bg-emerald-500 cursor-pointer transition-colors duration-200 outline-none disabled:opacity-50 disabled:pointer-events-none
                    before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform before:duration-200"
                />
              </div>
            </div>
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
            {isView ? 'Close Registry' : 'Cancel'}
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
              {mode === 'create' ? 'Save Record' : 'Apply Changes'}
            </CustomButton>
          )}
        </div>
      </div>
    </div>
  );
}
