/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

export interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Select({ children, value, onValueChange }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, triggerRef }}>
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
}

export function SelectTrigger({ className = '', children, ...props }: SelectTriggerProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectTrigger must be used within a Select component');

  const { isOpen, setIsOpen, triggerRef } = context;

  // Handle outside clicks
  const dropdownRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Find if this click was on the content itself
        const content = document.getElementById('select-content-portal');
        if (content?.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, setIsOpen]);

  return (
    <button
      ref={(node) => {
        dropdownRef.current = node;
        // @ts-ignore
        triggerRef.current = node;
      }}
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 text-left ${className}`}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
    </button>
  );
}

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export function SelectValue({ placeholder, className = '' }: SelectValueProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectValue must be used within a Select component');

  const { value } = context;

  return (
    <span className={`block truncate ${className}`}>
      {value || placeholder}
    </span>
  );
}

export interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectContent({ children, className = '' }: SelectContentProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectContent must be used within a Select component');

  const { isOpen, setIsOpen, triggerRef } = context;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, triggerRef, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="select-content-portal"
      ref={contentRef}
      className={`absolute z-50 min-w-[8rem] w-full overflow-hidden rounded-md border border-slate-200 bg-white text-slate-950 shadow-md animate-in fade-in-80 slide-in-from-top-1 duration-150 mt-1 max-h-60 overflow-y-auto ${className}`}
    >
      <div className="p-1">{children}</div>
    </div>
  );
}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  key?: string | number | React.Key;
}

export function SelectItem({ value, children, className = '' }: SelectItemProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within a Select component');

  const { value: selectedValue, onValueChange, setIsOpen } = context;
  const isSelected = selectedValue === value;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onValueChange) {
      onValueChange(value);
    }
    setIsOpen(false);
  };

  return (
    <div
      onClick={handleSelect}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-3 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${
        isSelected ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-700'
      } ${className}`}
    >
      <span className="block truncate">{children}</span>
    </div>
  );
}
