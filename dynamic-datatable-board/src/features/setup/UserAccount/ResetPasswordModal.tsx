import React, { useState, useEffect } from 'react';
import { X, Save, KeyRound } from 'lucide-react';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomButton } from '@/components/custom/CustomButton';
import { userAccountApi } from '@/api/ums/userAccount.api';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export function ResetPasswordModal({
  isOpen,
  onClose,
  username,
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword.trim()) {
      setError('Password is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await userAccountApi.resetPassword(username, newPassword);
      if (res.isSuccess) {
        alert(`Password for '${username}' has been successfully updated.`);
        onClose();
      } else {
        setError(res.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden text-left animate-in zoom-in-95 duration-200 m-4 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/75 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-slate-900/5 text-slate-700 flex items-center justify-center font-bold">
              <KeyRound className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest leading-none">
                Reset Password
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                User: {username}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <CustomInput
            label="New Password"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            error={error}
            placeholder="Enter new password..."
          />
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3.5">
          <CustomButton
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs font-bold px-4 py-2 border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </CustomButton>
          <CustomButton
            type="button"
            onClick={handleSubmit}
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Save className="h-4 w-4" />}
            className="text-xs font-bold px-5 py-2.5"
          >
            Update Password
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
