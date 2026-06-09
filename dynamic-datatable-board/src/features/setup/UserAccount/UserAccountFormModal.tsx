import React, { useState, useEffect } from 'react';
import { X, Save, Shield } from 'lucide-react';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomDropdown } from '@/components/custom/CustomDropdown';
import { CustomButton } from '@/components/custom/CustomButton';
import { userAccountApi } from '@/api/ums/userAccount.api';

interface UserAccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'view' | 'edit';
  userData?: any;
  onSave: () => void | Promise<void>;
}

export function UserAccountFormModal({
  isOpen,
  onClose,
  mode,
  userData,
  onSave,
}: UserAccountFormModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    employeeId: '' as string | number,
    roleId: '' as string | number,
    isActive: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userData && (mode === 'view' || mode === 'edit')) {
      setFormData({
        username: userData.username || '',
        password: '',
        email: userData.email || '',
        employeeId: userData.employeeId || '',
        roleId: userData.roleId || '',
        isActive: userData.isActive !== false,
      });
      setErrors({});
    } else if (mode === 'create') {
      setFormData({
        username: '',
        password: '',
        email: '',
        employeeId: '',
        roleId: '',
        isActive: true,
      });
      setErrors({});
    }
  }, [userData, mode, isOpen]);

  if (!isOpen) return null;

  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const isCreate = mode === 'create';
  
  const titleText = isCreate ? 'Register User Account' : isEdit ? 'Edit User Account' : 'User Account Details';

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (isCreate && !formData.password.trim()) newErrors.password = 'Password is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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
        username: formData.username,
        email: formData.email,
        employeeId: formData.employeeId ? Number(formData.employeeId) : null,
        roleId: formData.roleId ? Number(formData.roleId) : null,
        isActive: formData.isActive,
      };

      if (isCreate) {
        await userAccountApi.registerUser({
          ...payload,
          password: formData.password,
        });
      } else if (isEdit && userData?.id) {
        await userAccountApi.updateUser(userData.id, payload);
      }

      await onSave();
      onClose();
    } catch (err: any) {
      console.error(err);
      const serverMsg = err.response?.data?.message || 'Action failed. Please try again.';
      setErrors({ username: serverMsg });
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
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest leading-none">
                {titleText}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {isCreate ? 'New System User' : `Account ID: ${userData?.id}`}
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
              label="Username"
              value={formData.username}
              onChange={(val) => setFormData({ ...formData, username: val })}
              error={errors.username}
              disabled={isView}
              placeholder="e.g. jame948"
            />

            {isCreate && (
              <CustomInput
                label="Password"
                type="password"
                value={formData.password}
                onChange={(val) => setFormData({ ...formData, password: val })}
                error={errors.password}
                placeholder="Enter password..."
              />
            )}

            <CustomInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(val) => setFormData({ ...formData, email: val })}
              error={errors.email}
              disabled={isView}
              placeholder="e.g. user@company.com"
            />

            <CustomDropdown
              label="Assigned Employee"
              value={formData.employeeId}
              onChange={(val) => setFormData({ ...formData, employeeId: val })}
              apiEndpoint="api/Employees/dropdown"
              textProperty="firstName"
              valueProperty="id"
              placeholder="Select Employee..."
              disabled={isView}
            />

            <CustomDropdown
              label="Security Role"
              value={formData.roleId}
              onChange={(val) => setFormData({ ...formData, roleId: val })}
              apiEndpoint="api/Roles/dropdown"
              textProperty="name"
              valueProperty="id"
              placeholder="Select Role..."
              disabled={isView}
            />

            {(isEdit || isView) && (
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  disabled={isView}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4.5 w-4.5 rounded border-slate-350 text-slate-900 focus:ring-slate-900 cursor-pointer disabled:cursor-not-allowed"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-slate-655 uppercase tracking-wider select-none cursor-pointer">
                  Is Account Active
                </label>
              </div>
            )}
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
              {isCreate ? 'Create' : 'Save Changes'}
            </CustomButton>
          )}
        </div>
      </div>
    </div>
  );
}
