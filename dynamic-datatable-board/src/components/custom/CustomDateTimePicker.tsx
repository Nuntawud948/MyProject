import React from 'react';
import { Calendar } from 'lucide-react';

export interface CustomDateTimePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string; // YYYY-MM-DDTHH:mm format (or empty string)
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

export function CustomDateTimePicker({
  value,
  onChange,
  label,
  error,
  className = '',
  ...props
}: CustomDateTimePickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          type="datetime-local"
          value={value || ''}
          onChange={handleChange}
          className={`w-full pl-11 pr-4 py-2.5 bg-slate-50 border rounded-xl font-medium text-slate-800 transition-all duration-200 outline-none
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100'}
            ${className}`}
          {...props}
        />
        <div className="absolute left-4 pointer-events-none text-slate-400">
          <Calendar className="h-4 w-4" />
        </div>
      </div>
      {error && (
        <span className="text-xs text-red-500 font-medium tracking-wide animate-in fade-in duration-200">
          {error}
        </span>
      )}
    </div>
  );
}
