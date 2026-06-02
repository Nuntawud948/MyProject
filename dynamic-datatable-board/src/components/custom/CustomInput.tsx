import React, { useState, useEffect, useRef } from 'react';

export interface CustomInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  numberFormat?: 'integer' | 'decimal'; // 'integer' (00,000) or 'decimal' (0,000.00)
  label?: string;
  error?: string;
}

export function CustomInput({
  value,
  onChange,
  type = 'text',
  numberFormat = 'decimal',
  label,
  error,
  className = '',
  placeholder,
  ...props
}: CustomInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState('');
  const lastPropsValueRef = useRef(value);

  // Helper to format the value on blur / initialization
  const formatValue = (val: string | number): string => {
    if (val === undefined || val === null || val === '') return '';
    if (type !== 'number') return String(val);

    const num = parseFloat(String(val).replace(/,/g, ''));
    if (isNaN(num)) return '';

    if (numberFormat === 'integer') {
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    } else {
      // decimal
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  };

  // Sync state if value prop changes externally
  useEffect(() => {
    if (String(value) !== String(lastPropsValueRef.current) || displayValue === '') {
      setDisplayValue(isFocused ? String(value) : formatValue(value));
      lastPropsValueRef.current = value;
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (type === 'number') {
      // Only allow valid numeric characters (digits, minus, dot, or comma)
      const sanitized = rawVal.replace(/[^0-9.-]/g, '');
      setDisplayValue(sanitized);
      onChange(sanitized);
    } else {
      setDisplayValue(rawVal);
      onChange(rawVal);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // When focusing a number input, show raw unformatted number
    if (type === 'number' && value !== '') {
      const parsed = String(value).replace(/,/g, '');
      setDisplayValue(parsed);
    }
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setDisplayValue(formatValue(value));
    props.onBlur?.(e);
  };

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type === 'number' && isFocused ? 'number' : 'text'}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl font-medium text-slate-800 transition-all duration-200 outline-none
            placeholder:text-slate-400 placeholder:font-normal
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100'}
            ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500 font-medium tracking-wide animate-in fade-in duration-200">
          {error}
        </span>
      )}
    </div>
  );
}
