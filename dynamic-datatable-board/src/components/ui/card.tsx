import React from 'react';

export interface CardProps {
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export function Card({ className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-white border border-slate-200/85 rounded-xl shadow-xs transition-all hover:shadow-2xs duration-200 ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className = '', ...props }: CardProps) {
  return (
    <div
      className={`flex flex-col space-y-1.5 p-5 ${className}`}
      {...props}
    />
  );
}

export function CardTitle({ className = '', ...props }: CardProps) {
  return (
    <h3
      className={`text-sm font-extrabold text-slate-800 tracking-tight leading-none ${className}`}
      {...props}
    />
  );
}

export function CardDescription({ className = '', ...props }: CardProps) {
  return (
    <p
      className={`text-xs text-slate-400 ${className}`}
      {...props}
    />
  );
}

export function CardContent({ className = '', ...props }: CardProps) {
  return (
    <div
      className={`p-5 pt-0 ${className}`}
      {...props}
    />
  );
}

export function CardFooter({ className = '', ...props }: CardProps) {
  return (
    <div
      className={`flex items-center p-5 pt-0 border-t border-slate-100 ${className}`}
      {...props}
    />
  );
}
