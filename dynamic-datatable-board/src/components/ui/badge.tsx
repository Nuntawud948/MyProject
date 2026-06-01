/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
  className?: string;
  children?: React.ReactNode;
}

export function Badge({
  className = '',
  variant = 'default',
  ...props
}: BadgeProps) {
  const baseStyle = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2';
  
  const variants = {
    default: 'bg-slate-900 text-slate-50 hover:bg-slate-800',
    secondary: 'bg-slate-100 text-slate-950 hover:bg-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100/80',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/65 hover:bg-amber-100/80',
    destructive: 'bg-red-50 text-red-700 border border-red-200/60 hover:bg-red-100/80',
    outline: 'text-slate-950 border border-slate-200 hover:bg-slate-50',
  };

  return (
    <div
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
