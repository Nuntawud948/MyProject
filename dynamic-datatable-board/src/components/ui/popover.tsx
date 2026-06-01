/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface PopoverContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const PopoverContext = createContext<PopoverContextType | undefined>(undefined);

export interface PopoverProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Popover({ children, isOpen: customIsOpen, onOpenChange }: PopoverProps) {
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const isOpen = customIsOpen !== undefined ? customIsOpen : localIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setLocalIsOpen(open);
    }
  };

  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      <div className="relative inline-block w-full">{children}</div>
    </PopoverContext.Provider>
  );
}

export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function PopoverTrigger({ className = '', children, asChild, ...props }: PopoverTriggerProps) {
  const context = useContext(PopoverContext);
  if (!context) throw new Error('PopoverTrigger must be used within a Popover component');

  const { isOpen, setIsOpen, triggerRef } = context;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: triggerRef,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        handleClick(e);
        if (children.props.onClick) children.props.onClick(e);
      },
    });
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

export interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export function PopoverContent({ children, className = '', align = 'left' }: PopoverContentProps) {
  const context = useContext(PopoverContext);
  if (!context) throw new Error('PopoverContent must be used within a Popover component');

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

  const alignmentClasses = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right',
    center: 'left-1/2 -translate-x-1/2 origin-top',
  };

  return (
    <div
      ref={contentRef}
      className={`absolute z-50 mt-2 rounded-md border border-slate-200 bg-white p-4 text-slate-950 shadow-md outline-none animate-in fade-in-80 slide-in-from-top-1 duration-150 ${alignmentClasses[align]} ${className}`}
    >
      {children}
    </div>
  );
}
