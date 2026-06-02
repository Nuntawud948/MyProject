import React from 'react';

export interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function CustomButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: CustomButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 shadow-sm';

  const variants = {
    primary: 'bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 focus:ring-slate-900 border border-slate-900/10',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-300 border border-transparent',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-200',
    danger: 'bg-gradient-to-r from-red-600 to-rose-500 text-white hover:from-red-500 hover:to-rose-450 focus:ring-red-500 border border-red-600/10',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-5 py-2.5 text-sm gap-2 rounded-xl',
    lg: 'px-6 py-3.5 text-base gap-2.5 rounded-2xl',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
}
